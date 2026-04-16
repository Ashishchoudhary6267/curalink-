def expand_query(user_query: str, disease_context: str, location: str = None) -> dict:
    """
    Fulfills Requirement #1: Structured Input Understanding & Query Expansion.
    Takes the raw user input and context, and generates optimized search strings
    for the different databases.
    """
    
    # 1. Base Expansion (Combining Intent + Disease)
    expanded_base = f"{user_query} AND {disease_context}"
    
    # 2. Clinical Trials Specific Expansion
    clinical_trial_query = disease_context
    
    # 3. PubMed / OpenAlex Specific Expansion
    research_query = f"{disease_context} {user_query}"

    print(f"--- Query Expansion ---")
    print(f"User Asked: '{user_query}'")
    print(f"System Expanded To: '{research_query}'")
    
    return {
        "trials_query": clinical_trial_query,
        "research_query": research_query,
        "location_filter": location
    }