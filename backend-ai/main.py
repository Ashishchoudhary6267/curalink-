from fastapi import FastAPI, HTTPException, Depends, Header
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
from services.database import get_users_collection
from services.auth import hash_password, verify_password, create_access_token, verify_token

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

class SignupRequest(BaseModel):
    email: str
    password: str
    confirmPassword: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    success: bool
    error: str = None
    token: str = None
    user: dict = None

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

# ============ AUTHENTICATION ENDPOINTS ============

@app.post("/api/signup", response_model=AuthResponse)
def signup(request: SignupRequest):
    """User signup endpoint"""
    try:
        # Validate input
        if not request.email or not request.password:
            return AuthResponse(success=False, error="Email and password are required")
        
        if len(request.password) < 6:
            return AuthResponse(success=False, error="Password must be at least 6 characters")
        
        if request.password != request.confirmPassword:
            return AuthResponse(success=False, error="Passwords do not match")
        
        # Check if user already exists
        users_collection = get_users_collection()
        existing_user = users_collection.find_one({"email": request.email})
        
        if existing_user:
            return AuthResponse(success=False, error="User already exists with this email")
        
        # Hash password and create user
        hashed_password = hash_password(request.password)
        
        user_doc = {
            "email": request.email,
            "password": hashed_password,
            "created_at": datetime.utcnow()
        }
        
        result = users_collection.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # Create token
        token = create_access_token(user_id, request.email)
        
        return AuthResponse(
            success=True,
            token=token,
            user={
                "id": user_id,
                "email": request.email,
                "name": request.email.split('@')[0]
            }
        )
    except Exception as e:
        print(f"Signup error: {e}")
        return AuthResponse(success=False, error="Signup failed")

@app.post("/api/login", response_model=AuthResponse)
def login(request: LoginRequest):
    """User login endpoint"""
    try:
        # Find user by email
        users_collection = get_users_collection()
        user = users_collection.find_one({"email": request.email})
        
        if not user:
            return AuthResponse(success=False, error="Invalid email or password")
        
        # Verify password
        if not verify_password(request.password, user.get("password", "")):
            return AuthResponse(success=False, error="Invalid email or password")
        
        # Create token
        user_id = str(user["_id"])
        token = create_access_token(user_id, user["email"])
        
        return AuthResponse(
            success=True,
            token=token,
            user={
                "id": user_id,
                "email": user["email"],
                "name": user["email"].split('@')[0]
            }
        )
    except Exception as e:
        print(f"Login error: {e}")
        return AuthResponse(success=False, error="Login failed")



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