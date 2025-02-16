
# for using envs
import os
from dotenv import load_dotenv

# for getting menu from transact api
import requests
import json
from datetime import datetime

# fast api imports
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer

# chat api
import openai

# firebase auth
import firebase_admin
from firebase_admin import auth, credentials, firestore

# Load environment variables from .env (for local development)
load_dotenv()

app = FastAPI() # This is what will be refrenced in config

MEALS_JSON_FILE = "current_meals.json"
# need the actual transact api url; public-facing one doesn't exist :(
DINING_API_URL = "https://example.com/dining-hall/meals"

# Retrieve Firebase credentials from environment variables
firebase_config = {
    "type": os.getenv("type"),
    "project_id": os.getenv("project_id"),
    "private_key_id": os.getenv("private_key_id"),
    "private_key": os.getenv("private_key").replace("\\n", "\n"),  # Fix formatting
    "client_email": os.getenv("client_email"),
    "client_id": os.getenv("client_id"),
    "auth_uri": os.getenv("auth_uri"),
    "token_uri": os.getenv("token_uri"),
    "auth_provider_x509_cert_url": os.getenv("auth_provider_x509_cert_url"),
    "client_x509_cert_url": os.getenv("client_x509_cert_url"),
    "universe_domain": os.getenv("universe_domain"),
}

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_config)
    firebase_admin.initialize_app(cred)

db = firestore.client()

security = HTTPBearer()

# OpenAI API Key
openai.api_key = os.getenv("openai_key")

def verify_firebase_user(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token["uid"]
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Firebase Token")

@app.get("/generate-recommendation/")
async def generate_recommendation(token: str = Depends(security)):
    user_id = verify_firebase_user(token.credentials)

    # Fetch user attributes from Firestore
    user_doc = db.collection("users").document(user_id).get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User attributes not found")

    user_attributes = user_doc.to_dict()

    # Fetch user history
    history_ref = db.collection("users").document(user_id).collection("history")
    history_docs = history_ref.stream()
    user_history = [doc.to_dict() for doc in history_docs]

    # Load available meals from JSON
    with open(MEALS_JSON_FILE, "r") as f:
        meals_data = json.load(f)

    # Structured JSON output definition
    functions = [
        {
            "name": "generate_meal_recommendations",
            "description": "Generate structured meal recommendations based on user attributes and history.",
            "parameters": {
                "type": "object",
                "properties": {
                    "recommendations": {
                        "type": "array",
                        "description": "List of recommended meals with details.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "meal_name": {"type": "string", "description": "Name of the recommended meal"},
                                "description": {"type": "string", "description": "Short description of the meal"},
                                "nutritional_attributes": {
                                    "type": "array",
                                    "description": "List of relevant nutritional attributes based on user goals.",
                                    "items": {"type": "string"}
                                }
                            }
                        }
                    }
                },
                "required": ["recommendations"]
            }
        }
    ]

    # Constructing the detailed prompt
    prompt = f"""
    Based on the user's dietary history: {user_history} and attributes: {user_attributes},
    recommend meals from the available options. Format the response strictly according to the function schema.
    Here are the available meals: {meals_data}
    """

    # Call GPT-4o-mini with structured JSON mode
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        functions=functions,
        function_call={"name": "generate_meal_recommendations"}  # Force structured JSON output
    )

    # Extract the structured response
    recommendation_data = response["choices"][0]["message"]["function_call"]["arguments"]

    return json.loads(recommendation_data)

@app.get("/update-meals/")
def update_meals():
    """Fetch new meals and update JSON file."""
    try:
        response = requests.get(DINING_API_URL)
        if response.status_code == 200:
            meals_data = response.json()
            with open(MEALS_JSON_FILE, "w") as f:
                json.dump(meals_data, f, indent=4)
            return {"status": "success", "message": "Meals updated successfully"}
        else:
            return {"status": "error", "message": f"Failed to fetch meals: {response.status_code}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
