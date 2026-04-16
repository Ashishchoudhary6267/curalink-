import requests

def fetch_clinical_trials(disease: str, size: int = 20):
    """Fetches recruiting clinical trials for a specific disease."""
    
    # Using the exact endpoint from the hackathon instructions
    base_url = "https://clinicaltrials.gov/api/v2/studies"
    params = {
        "query.cond": disease,
        "filter.overallStatus": "RECRUITING",
        "pageSize": size,
        "format": "json"
    }
    
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()
        
        # We will parse this down later to just grab Title, Status, Criteria, etc.
        return data.get("studies", [])
    except Exception as e:
        print(f"Error fetching Clinical Trials: {e}")
        return []

# Quick test if you run this file directly
if __name__ == "__main__":
    trials = fetch_clinical_trials("diabetes", 2)
    print(trials)