from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv('MONGODB_URL')

# Create client but don't connect immediately
try:
    client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000, connectTimeoutMS=10000)
    print(f"MongoDB client created. URL: {MONGODB_URL[:50]}...")
except Exception as e:
    print(f"Error creating MongoDB client: {e}")
    client = None

def get_database():
    """
    Connect to MongoDB and return the database instance
    """
    try:
        if client is None:
            raise ConnectionFailure("MongoDB client not initialized")
        
        # Test connection
        client.admin.command('ping')
        db = client['curalink']
        return db
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise
    except Exception as e:
        print(f"MongoDB error: {e}")
        raise

def get_users_collection():
    """Get the users collection"""
    db = get_database()
    return db['users']

def get_searches_collection():
    """Get the searches collection for storing research history"""
    db = get_database()
    return db['searches']
