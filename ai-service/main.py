import os
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import re

load_dotenv()

app = FastAPI()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
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

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a Expert code reviewer."},
            {"role": "user", "content": promt}
        ]
    )

    result = response.choices[0].message.content

    return {
        "summary": result,
        "issues": [],
        "suggestion": result
    }