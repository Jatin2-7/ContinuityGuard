from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from schemas import AnalysisResult
from analyzer import analyze_script, mock_analyze_script
import os

app = FastAPI(title="ContinuityGuard Production Risk Engine")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api")
@app.get("/api/")
@app.get("/")
def read_root():
    return {"message": "ContinuityGuard Risk Engine Online"}

@app.get("/api/health")
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "backend"}

@app.post("/api/analyze", response_model=AnalysisResult)
@app.post("/analyze", response_model=AnalysisResult)

def analyze_script_endpoint(
    script_text: str = Body(..., embed=True),
    use_mock: bool = Body(False, embed=True),
    budget_mode: str = Body("Medium", embed=True)
):
    """
    Analyzes a script segment for continuity errors and financial risk.
    """
    try:
        api_key = os.environ.get("OPENAI_API_KEY")
        
        # Priority 1: Requested Mock
        if use_mock:
             return mock_analyze_script(script_text, budget_mode)
        
        # Priority 2: OpenAI Analysis
        if api_key:
            try:
                return analyze_script(script_text, api_key, budget_mode)
            except Exception as e:
                print(f"OpenAI Analysis Failed: {e}. Falling back to internal engine.")
                # Fallback to internal engine (mock) so user gets result
                return mock_analyze_script(script_text, budget_mode)
        
        # Priority 3: No Key -> Internal Engine
        return mock_analyze_script(script_text, budget_mode)

    except Exception as e:
        print(f"Critical Error: {e}")
        # Last resort fallback
        return mock_analyze_script(script_text, budget_mode)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
