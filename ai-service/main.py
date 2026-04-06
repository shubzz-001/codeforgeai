import os
import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")  


class CodeRequest(BaseModel):
    code: str


# Quick scan: called by Spring Boot during ZIP upload 
# Returns immediately with basic stats so the upload never times out.
# No Ollama call — just fast static analysis.
def quick_scan(code: str) -> dict:
    lines   = code.split("\n")
    methods = sum(1 for l in lines if any(
        kw in l for kw in ["public ", "private ", "protected ", "def ", "func "]
    ) and "(" in l and ")" in l and not l.strip().startswith("//"))
    classes = sum(1 for l in lines if
        ("class " in l or "interface " in l) and "{" in l
    )
    return {
        "summary":    f"Quick scan: {len(lines)} lines, ~{classes} class(es), ~{methods} method(s). Click 'Analyze with AI' for a full AI review.",
        "issues":     [],
        "suggestion": "Click the ⚡ Analyze with AI button in the file viewer to get a full Ollama-powered analysis.",
        "model_used": "quick-scan",
        "quick":      True,
    }


# Full Ollama analysis: called by the frontend "Analyze" button 
def full_analysis(code: str) -> dict:
    prompt = f"""Analyze this code as a senior engineer. Reply in exactly 3 sections:

1. Code Structure Summary
One paragraph: what it does, classes, methods.

2. Issues and Code Smells
Bullet points starting with - (or "- None found.")

3. Refactoring Suggestions
Bullet points starting with - (or "- Looks clean.")

Code:
```
{code[:2000]}
```"""

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model":   OLLAMA_MODEL,
                "messages":[{"role": "user", "content": prompt}],
                "stream":  False,
                "options": {
                    "num_predict": 400,   # shorter = faster
                    "temperature": 0.2,
                    "num_ctx":     2048,  # smaller context = faster
                },
            },
            timeout=120,
        )

        if response.status_code != 200:
            raise HTTPException(status_code=500,
                detail=f"Ollama returned {response.status_code}: {response.text}")

        result  = response.json()
        content = result.get("message", {}).get("content", "")
        if not content:
            raise HTTPException(status_code=500,
                detail=f"Empty Ollama response: {result}")

        print(f"✓ Ollama [{OLLAMA_MODEL}] responded ({len(content)} chars)")
        return {
            "summary":    content,
            "issues":     [],
            "suggestion": content,
            "model_used": OLLAMA_MODEL,
            "quick":      False,
        }

    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail=(
            f"Cannot connect to Ollama at {OLLAMA_BASE_URL}. "
            "Run: ollama serve"
        ))
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail=(
            f"Ollama timed out. Your current model is '{OLLAMA_MODEL}'. "
            "Run: ollama pull mistral  then set OLLAMA_MODEL=mistral in .env"
        ))


# Main endpoint 
@app.post("/analyze")
def analyze_code(
    request: CodeRequest,
    quick: bool = Query(default=False,
        description="true = fast static scan (used during upload), "
                    "false = full Ollama AI analysis (used by frontend button)")
):
    """
    Two modes:
    - quick=true  → instant static scan, no Ollama. Used by Spring Boot during ZIP upload.
    - quick=false → full Ollama analysis. Used by the frontend Analyze button.

    Spring Boot should call: POST /analyze?quick=true
    Frontend calls:          POST /analyze          (quick defaults to false)
    """
    if quick:
        return quick_scan(request.code)
    return full_analysis(request.code)


@app.get("/health")
def health():
    try:
        r      = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        models = [m["name"] for m in r.json().get("models", [])]
        ready  = any(OLLAMA_MODEL in m for m in models)
        return {
            "status":       "ok" if ready else "model_not_pulled",
            "ollama_url":   OLLAMA_BASE_URL,
            "model":        OLLAMA_MODEL,
            "model_ready":  ready,
            "pulled_models": models,
            "tip": f"Run 'ollama pull {OLLAMA_MODEL}' if model_ready is false",
        }
    except Exception as e:
        return {"status": "ollama_offline", "error": str(e),
                "tip": "Run 'ollama serve'"}