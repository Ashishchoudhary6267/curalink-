import requests

def fetch_openalex_works(query: str, size: int = 25):
    """Fetches publications from OpenAlex based on relevance."""
    
    # Using the exact endpoint template from the assignment
    url = "https://api.openalex.org/works"
    params = {
        "search": query,
        "per-page": size,
        "page": 1,
        "sort": "relevance_score:desc"
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        results = []
        for work in data.get("results", []):
            results.append({
                "source": "OpenAlex",
                "title": work.get("title", "No Title"),
                # OpenAlex sometimes returns inverted abstracts, so we grab the display_name or abstract if available
                "abstract": work.get("abstract", "Abstract not directly provided"), 
                "year": work.get("publication_year", "Unknown"),
                "url": work.get("id", ""),
                "authors": [author.get("author", {}).get("display_name") for author in work.get("authorships", [])]
            })
            
        return results
        
    except Exception as e:
        print(f"OpenAlex API Error: {e}")
        return []