import requests
import xml.etree.ElementTree as ET

def fetch_pubmed_articles(query: str, size: int = 10):
    """Fetches articles from PubMed using the required 2-step process."""
    
    # --- Step 1: Search (Get IDs) ---
    search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    search_params = {
        "db": "pubmed",
        "term": query,
        "retmax": size,
        "sort": "pub date",
        "retmode": "json"
    }
    
    try:
        search_response = requests.get(search_url, params=search_params)
        search_response.raise_for_status()
        id_list = search_response.json().get("esearchresult", {}).get("idlist", [])
        
        if not id_list:
            return []

        # --- Step 2: Fetch Details (XML) ---
        ids_string = ",".join(id_list)
        fetch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
        fetch_params = {
            "db": "pubmed",
            "id": ids_string,
            "retmode": "xml"
        }
        
        fetch_response = requests.get(fetch_url, params=fetch_params)
        fetch_response.raise_for_status()
        
        # Parse XML to extract structured data
        articles = []
        root = ET.fromstring(fetch_response.content)
        
        for article in root.findall(".//PubmedArticle"):
            title = article.findtext(".//ArticleTitle", default="No Title")
            abstract = article.findtext(".//AbstractText", default="No Abstract Available")
            year = article.findtext(".//PubDate/Year", default="Unknown Year")
            
            articles.append({
                "source": "PubMed",
                "title": title,
                "abstract": abstract,
                "year": year,
                "url": f"https://pubmed.ncbi.nlm.nih.gov/{article.findtext('.//PMID')}"
            })
            
        return articles
        
    except Exception as e:
        print(f"PubMed API Error: {e}")
        return []