from fastapi import FastAPI
from pydantic import BaseModel
import concurrent.futures
from dotenv import load_dotenv
import os
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Import our custom services
from services.query_engine import expand_query
from services.clinical_trials import fetch_clinical_trials
from services.pubmed import fetch_pubmed_articles
from services.openalex import fetch_openalex_works
from services.llm_engine import generate_medical_response

app = FastAPI()

# CORS Middleware to allow React to talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    disease: str
    location: str = None

def score_and_rank_results(results, query, disease):
    """
    Ranks the raw data pool based on recency and relevance.
    """
    scored_results = []
    current_year = datetime.now().year
    
    # Convert query strings to lowercase for simple keyword matching
    keywords = set(query.lower().split() + disease.lower().split())
    # Remove common filler words
    keywords = {k for k in keywords if k not in ['for', 'and', 'the', 'in', 'of', 'treatment', 'latest']}

    for item in results:
        score = 0
        text_to_search = f"{item.get('title', '')} {item.get('abstract', '')} {item.get('criteria', '')}".lower()
        
        # 1. Relevance Scoring (Keyword matching)
        for word in keywords:
            if word in text_to_search:
                score += 2  # 2 points per keyword match
                
        # 2. Recency Scoring
        year = str(item.get('year', 'Unknown'))
        if year.isdigit():
            year_int = int(year)
            if year_int == current_year:
                score += 5
            elif year_int >= current_year - 2:
                score += 3
            elif year_int >= current_year - 5:
                score += 1
                
        # 3. Source Credibility/Status
        if item.get('source') == 'ClinicalTrials' and item.get('status') == 'RECRUITING':
            score += 3  # High priority for active trials
            
        item['rank_score'] = score
        scored_results.append(item)

    # Sort descending by score
    scored_results.sort(key=lambda x: x['rank_score'], reverse=True)
    
    # Return ONLY the top 8 as strictly requested by the assignment
    return scored_results[:8]

@app.post("/api/research")
def process_medical_query(request: QueryRequest):
    print(f"Starting retrieval pipeline for: {request.disease} - {request.query}")
    
    # Expectation 1: Query Expansion
    expanded_queries = expand_query(request.query, request.disease, request.location)
    
    # Expectations 2 & 3: Deep Retrieval
    raw_results = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_trials = executor.submit(fetch_clinical_trials, expanded_queries["trials_query"], 20)
        future_pubmed = executor.submit(fetch_pubmed_articles, expanded_queries["research_query"], 20)
        future_openalex = executor.submit(fetch_openalex_works, expanded_queries["research_query"], 20)
        
        try:
            trials_data = future_trials.result()
            for trial in trials_data:
                raw_results.append({
                    "source": "ClinicalTrials",
                    "title": trial.get("protocolSection", {}).get("identificationModule", {}).get("briefTitle", "No Title"),
                    "status": trial.get("protocolSection", {}).get("statusModule", {}).get("overallStatus", ""),
                    "year": trial.get("protocolSection", {}).get("statusModule", {}).get("startDateStruct", {}).get("date", "")[:4],
                    "url": f"https://clinicaltrials.gov/study/{trial.get('protocolSection', {}).get('identificationModule', {}).get('nctId')}"
                })
        except Exception as e:
            print(f"Trials error: {e}")

        try:
            raw_results.extend(future_pubmed.result())
        except Exception as e:
            print(f"PubMed error: {e}")
            
        try:
            raw_results.extend(future_openalex.result())
        except Exception as e:
            print(f"OpenAlex error: {e}")

    print(f"Total candidate pool retrieved: {len(raw_results)} items.")

    # Expectation 4: Intelligent Re-Ranking
    top_results = score_and_rank_results(raw_results, request.query, request.disease)
    
    print(f"Successfully refined to top {len(top_results)} results.")
    
    # Expectations 5 & 8: Custom LLM Reasoning & Structured Output
    final_llm_response = generate_medical_response(request.query, request.disease, top_results)
    
    return {
        "status": "success",
        "structured_response": final_llm_response,
        "sources_used": top_results 
    }