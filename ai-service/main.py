from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class CodeRequest(BaseModel):
    code: str

@app.post("/explain")
def explain_code(request: CodeRequest) :
    code = request.code
    
    explanation = f"This Java file contains {code.count('class')} class(es) and {code.count('if')} conditional statements."
    
    return {
        "explanation": explanation
    }