import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Groq API details
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY") 

def generate_medical_response(query: str, disease: str, ranked_context: list) -> str:
    """
    Fulfills Core Expectation: Reliable, Fast Cloud AI Response.
    """
    
    context_text = ""
    for idx, item in enumerate(ranked_context):
        context_text += f"\n[{idx + 1}] Source: {item.get('source')}\n"
        context_text += f"Title: {item.get('title')}\n"
        context_text += f"Summary: {item.get('abstract', item.get('criteria', 'No summary available'))[:400]}...\n"
        context_text += f"URL: {item.get('url')}\n"

    # Build the prompt
    prompt = f"""You are Curalink, an expert Medical Research Assistant. 
Answer based strictly on the provided research context. 

Patient Condition: {disease}
User Query: {query}

Research Context:
{context_text}

STRUCTURE:
### Condition Overview
### Research Insights (with [1], [2] citations)
### Clinical Trials
### Source Attribution (Titles and URLs)
"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "You are a professional medical researcher."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1
    }

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=20)
        response.raise_for_status()
        result = response.json()
        return result['choices'][0]['message']['content'].strip()
        
    except Exception as e:
        print(f"Groq API Error: {e}")
        return "Error: The medical engine is temporarily overloaded. Please try again in a moment."