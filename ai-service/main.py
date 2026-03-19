import os
import requests
from fastapi import FastAPI, HTTPException
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

# Ollama runs locally on port 11434 by default
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# Model to use — change this to any model you have pulled in Ollama
# Recommended for code: codellama, llama3.2, mistral, deepseek-coder
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "codellama")


class CodeRequest(BaseModel):
    code: str


def build_prompt(code: str) -> str:
    return f"""You are a senior software engineer reviewing code.

Analyze the following code and respond in exactly these three numbered sections:

1. Code Structure Summary
Describe the overall structure: classes, methods, fields and what the code does in 2-3 sentences.

2. Issues and Code Smells
List problems found: high complexity, long methods, bad naming, missing error handling, etc.
- Use bullet points starting with -
- If no issues found, write "No major issues found."

3. Refactoring Suggestions
List concrete, actionable improvements.
- Use bullet points starting with -
- If code is already clean, write "Code looks clean."

Code to analyze:
```
{code[:4000]}
```

Respond only with the three sections above. Be concise and specific."""


@app.post("/analyze")
def analyze_code(request: CodeRequest):
    """
    Sends code to a local Ollama model and returns structured analysis.
    Make sure Ollama is running: `ollama serve`
    Make sure the model is pulled: `ollama pull codellama`
    """
    prompt = build_prompt(request.code)

    try:
        # Use Ollama's OpenAI-compatible endpoint
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model":    OLLAMA_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "stream":   False,  # get the full response at once
            },
            timeout=120,  # local models can take time on first run
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"Ollama returned {response.status_code}: {response.text}"
            )

        result = response.json()
        content = result.get("message", {}).get("content", "")

        if not content:
            raise HTTPException(
                status_code=500,
                detail=f"Empty response from Ollama. Raw: {result}"
            )

        print(f"✓ Ollama [{OLLAMA_MODEL}] responded ({len(content)} chars)")

        return {
            "summary":    content,
            "issues":     [],
            "suggestion": content,
            "model_used": OLLAMA_MODEL,
        }

    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail=(
                "Cannot connect to Ollama. Make sure it is running:\n"
                "  1. Install Ollama: https://ollama.com/download\n"
                f"  2. Start it: ollama serve\n"
                f"  3. Pull the model: ollama pull {OLLAMA_MODEL}"
            ),
        )
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail=f"Ollama timed out after 120s. Try a smaller model like 'mistral' or 'llama3.2'."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    """Check if Ollama is reachable and the model is available."""
    try:
        r = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        models = [m["name"] for m in r.json().get("models", [])]
        model_ready = any(OLLAMA_MODEL in m for m in models)
        return {
            "status":       "ok" if model_ready else "model_not_pulled",
            "ollama_url":   OLLAMA_BASE_URL,
            "model":        OLLAMA_MODEL,
            "model_ready":  model_ready,
            "pulled_models": models,
            "tip": f"Run 'ollama pull {OLLAMA_MODEL}' if model_ready is false",
        }
    except Exception as e:
        return {
            "status":     "ollama_offline",
            "error":      str(e),
            "tip":        "Run 'ollama serve' to start Ollama",
        }


@app.get("/models")
def list_models():
    """List all models currently pulled in Ollama."""
    try:
        r = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        return {"models": [m["name"] for m in r.json().get("models", [])]}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Ollama offline: {e}")