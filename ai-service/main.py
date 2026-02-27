from fastapi import FastAPI
from pydantic import BaseModel
import re

app = FastAPI()

class CodeRequest(BaseModel):
    code: str

@app.post("/analyze")
def analyze_code(request: CodeRequest) :
    '''
    This endpoint takes a Java code snippet and returns an analysis of its structure.
    '''
    code = request.code

    class_count = len(re.findall(r'\bclass\b', code))
    method_count = len(re.findall(r"\b(public|private|protected)\b.*\()", code))
    if_count = len(re.findall(r'\bif\b', code))
    loop_count = len(re.findall(r'\b(for|while|do)\b', code))

    issues = []

    if if_count + loop_count > 10:
        issues.append("High decision complexity detected")

    if method_count > 20:
        issues.append("Too many methods in the file")

    if len(code.splitlines()) > 300:
        issues.append("File is too long, consider splitting")

    suggestion = "Consider breaking large methods into smaller reusable components"

    return {
        "summary": f"This file contains {class_count} class(es) and {method_count} method(s).",
        "issues": issues,
        "suggestion": suggestion
    }