import os
import requests
from dotenv import load_dotenv

# Force Python to read the .env file
load_dotenv()

HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY") 

def generate_medical_response(query: str, disease: str, ranked_context: list) -> str:
    """
    Fulfills Core Expectation 5 & 8: Custom LLM Reasoning & Structured Output via Cloud API.
    """
    
    context_text = ""
    for idx, item in enumerate(ranked_context):
        context_text += f"\n[{idx + 1}] Source: {item.get('source')}\n"
        context_text += f"Title: {item.get('title')}\n"
        if 'year' in item:
            context_text += f"Year: {item.get('year')}\n"
        if 'status' in item:
            context_text += f"Status: {item.get('status')}\n"
        context_text += f"Summary/Abstract: {item.get('abstract', item.get('criteria', 'No summary available'))[:500]}...\n"
        context_text += f"URL: {item.get('url')}\n"

    prompt = f"""<s>[INST] You are Curalink, an expert Medical Research Assistant. 
You must answer the user's query based strictly on the provided research context. Do not hallucinate external facts.

Patient Condition: {disease}
User Query: {query}

Research Context:
{context_text}

You MUST structure your response exactly like this:
### Condition Overview
(Brief summary of the disease/condition based on context)

### Research Insights
(Key findings from the publications. You must use inline citations like [1], [2].)

### Clinical Trials
(Mention any relevant recruiting trials from the context, or state if none are available.)

### Source Attribution
(List the exact titles and URLs of the sources you used to build this answer.)
[/INST]
"""

    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 800,
            "temperature": 0.1, 
            "return_full_text": False
        }
    }

    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        generated_text = result[0]['generated_text'].strip()
        return generated_text
        
    except Exception as e:
        print(f"LLM Generation Error: {e}")
        return "Error: Hugging Face API is currently loading the model or busy. Please wait 30 seconds and try again."