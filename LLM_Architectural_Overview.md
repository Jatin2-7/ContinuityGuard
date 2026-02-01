# LLM Architecture & Strategy: ContinuityGuard

## 1. Executive Summary
**ContinuityGuard** leverages state-of-the-art Large Language Models (LLMs) to function as an autonomous **"Virtual 1st Assistant Director (AD)"**. Unlike traditional script software that only handles formatting, this project uses GenAI to perform cognitive tasks: reasoning about logistics, estimating financial risk, and flagging legal compliance issues specific to the Indian context.

The LLM is not just a chatbot; it is the **core logic engine** that drives the Risk Engine, Continuity Validator, and Storyboarder.

---

## 2. Model Stack & Selection

### **A. Primary Reasoning Engine: OpenAI GPT-4o**
- **Model Version:** `gpt-4o-2024-08-06`
- **Role:** Script Analysis, Logical Reasoning, Financial Estimation, Legal Compliance.
- **Why it was chosen:**
  1.  **Structured Outputs (Pydantic Support):** The project relies heavily on strictly formatted JSON data for the frontend. GPT-4o's ability to adhere to a JSON Schema (defined in `schemas.py`) ensures that the UI never breaks due to malformed AI responses.
  2.  **Multilingual & Cultural Context:** Excellent understanding of Indian nuances, culturally specific terms ("Batta", "Mass Action", "Item Song"), and complex logic.

### **B. Visualization Engine: DALL-E 3**
- **Role:** Storyboard Generation.
- **Workflow:** The system takes text descriptions of scenes and converts them into "Film Noir" or "Pencil Sketch" style visual storyboards.
- **Why it was chosen:** High fidelity and precise adherence to complex scene descriptions.

---

## 3. Core Implementation: The "Tollywood System Prompt"

The secret sauce of ContinuityGuard is its highly specific **System Prompt** (found in `api/analyzer.py`). Instead of a generic specific instruction, the LLM is given a role-play persona.

### **The Persona**
> *"You are a legendary Line Producer in the Telugu Film Industry (Tollywood) AND a Censor Board Consultant."*

### **Key Instructions given to the LLM:**
1.  **Scene Extraction:** Identify "Mass" elements (Hero entries, Action sequences) vs. simple dialogue.
2.  **Financial Logic:**
    -   *Rule:* "If it is a MASS ACTION/SONG: Total ~50 Lakhs to 5 Crores."
    -   The LLM autonomously breaks down costs into: Location, Crowd, Stunts, Logistics, Catering, and Hidden Costs.
3.  **Continuity Validation:**
    -   The LLM checks for **logical disconnects** (e.g., "Hero has a beard in Scene 4 but shaved in Scene 3").
4.  **Censor & Legal Guard (Indian Jurisdiction):**
    -   The model is instructed to check against specific Indian laws:
        -   **POCSO Act:** Child safety.
        -   **COTPA:** Smoking/Alcohol warnings.
        -   **IPC Section 295A:** Religious sentiments.
        -   **AWBI:** Animal Welfare Board NOCs.

---

## 4. Workflows & Data Flow

### **A. The Analysis Pipeline**
1.  **Input:** User uploads a raw text script (PDF/Text).
2.  **Preprocessing:** Python backend cleans the text.
3.  **LLM Inference:**
    -   The script is sent to GPT-4o with the `AnalysisResult` JSON schema.
    -   The "Tollywood" prompt guides the analysis.
    -   **Budget Mode Injection:** The user's budget preference ("Low" vs "High") is dynamically injected into the prompt to change the LLM's suggested fixes (e.g., "Rewrite dialogue" vs "CGI Correction").
4.  **Output:** A structured JSON object containing:
    -   `scenes`: List of parsed scenes with metadata.
    -   `risks`: Scheduling and legal risks.
    -   `continuity_errors`: Detected plot holes.
    -   `budget_breakdown`: Line-item cost estimates.

### **B. The Visualization Pipeline**
1.  **Trigger:** User expands a scene card.
2.  **Generation:** A prompt is constructed: *"A rough black and white storyboard sketch of: [Scene Summary]..."*
3.  **Fallback:** If DALL-E 3 is unavailable or too slow, the system falls back to `Pollinations.ai` for rapid prototyping.

---

## 5. Why Not Regular Code?
This project is **impossible without LLMs** because:
-   **Context Understanding:** Regular code cannot "understand" that a scene with a "Hero jumping off a cliff" requires a "Rope Rig Team" and "Ambulance on standby." An LLM infers these logistical requirements from implied context.
-   **Compliance Interpretation:** Determining if a scene "hurts religious sentiments" requires semantic understanding, not just keyword matching.
-   **Creativity:** Suggesting fixes (e.g., "Add a 2-second action beat where he removes glasses") requires creative writing capability.
