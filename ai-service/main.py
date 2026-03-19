import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import requests
import re

load_dotenv()

app = FastAPI()

# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
OPEN_ROUTER_API_KEY = os.getenv("OPEN_ROUTER_API_KEY")
class CodeRequest(BaseModel):
    code: str

@app.post("/analyze")
def analyze_code(request: CodeRequest) :
    '''
    This endpoint takes a Java code snippet and returns an analysis of its structure.
    '''
    code = request.code[:4000]

    promt = f"""
    You are a senior Software Engineer.

    Analyze the following Java code and provide:
    1. A summary of the code structure (number of classes, methods, etc.)
    2. Potential issues or code smells (e.g., high complexity, too many methods, etc.)
    3. Refactoring suggestions to improve code quality.

    Code:
    {code}
    """

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPEN_ROUTER_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model" : "mistral-7b-instruct",
            "messages": [
                {"role": "user", "content": promt}
            ]
        }
    )

    result = response.json()

    return {
        "summary": result["choices"][0]["message"]["content"],
        "issues": [],
        "suggestion": result["choices"][0]["message"]["content"]
    }
