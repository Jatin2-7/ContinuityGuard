import os
import json
from typing import List
from openai import OpenAI
from schemas import AnalysisResult, ContinuityError, ErrorType, Severity, Scene, ComplianceRisk, ScheduleRisk, ProductionAsset, AssetStatus

# Placeholder for API Key - in production, use environment variables
# client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

TOLLYWOOD_SYSTEM_PROMPT = """
You are a legendary Line Producer in the Telugu Film Industry (Tollywood) AND a Censor Board Consultant.
You work primarily out of Ramoji Film City. Your eye for detail is legendary.

Your goal: **Identify Continuity Errors that will cost CRORES** AND **Flag Censor/Legal Risks.** AND **Create a Line-Item Budget.**

**1. SCENE EXTRACTION**: 
    - Identify scenes with "Mass" appeal. Summary: Hero entries, Action, Item songs.
    - **EXTRACT METADATA**: You MUST extract 'location' (e.g. 'TEMPLE') and 'time' (e.g. 'DAY').

**2. DETAILED EXPENSE BREAKDOWN (CRITICAL)**:
    - For EACH scene, you MUST generate a `expense_breakdown` list with these EXACT categories:
      1. "Location & Permits"
      2. "Crowd & Artists"
      3. "Action & Stunts"
      4. "Vehicles & Logistics"
      5. "Unit Food (Catering)"
      6. "Hidden Costs" (e.g. Batta, Diesel, Bribes)
    - **COST ESTIMATION**:
      - Analyze the scene INTENSITY. 
      - If it is a simple dialogue: Total ~2-5 Lakhs.
      - If it is a MASS ACTION/SONG: Total ~50 Lakhs to 5 Crores.
      - **DO NOT HOLD BACK**. If it looks expensive (Choppers, Blasts), estimate extremely high.
      - specific 'reason' string must explain the specific cost (e.g., "500 Junior Artists", "Rope Rigs", "Crane Rental").

**3. REASONING & LOGIC (NEW)**:
    - For every Continuity Error, you MUST provide a `reasoning` field.
    - This should explain the LOGICAL DISCONNECT (e.g., "Hero cannot have a beard in Scene 4 if he shaved in Scene 3").
    - Differentiate this from the 'description'.

**4. COMPLIANCE & CENSOR GUARD (INDIAN JURISDICTION)**:
    - Check against **Cinematograph Act, 1952** and **Guidelines for Certification**.
    - **COTPA Act**: Strict rules for Smoking/Alcohol.
    - **Prevention of Cruelty to Animals Act**: Any animal usage needs AWBI NOC.
    - **Religious Sentiments**: flag anything that hurts religious sentiments (IPC Section 295A).
    - Provide specific legal requirements and estimated fines/cuts.

Output MUST be a valid JSON object matching the provided schema.
"""

def mock_analyze_script(script_text: str, budget_mode: str = "Medium") -> AnalysisResult:
    """
    Mock function with 'Tollywood' flavor.
    Uses randomized logic to simulate "Live AI" variance.
    """
    import re
    import random
    
    # 1. Simple Regex to find Scene Headers (INT./EXT.)
    # Looks for lines starting with INT or EXT, case insensitive
    # 1. Improved Regex to find Scene Headers
    # Matches:
    # 1. Lines starting with INT or EXT (case insensitive)
    # 2. Optional dot or space
    # 3. Matches typical sluglines like "INT. OFFICE" or "EXT FOREST - DAY"
    scene_pattern = re.compile(r"^\s*(INT|EXT)[.\s].*$", re.MULTILINE | re.IGNORECASE)
    matches = scene_pattern.findall(script_text)

    parsed_scenes = []
    
    # Pre-defined randomized line items for variety
    reasons_templates = {
        "Location & Permits": ["GHMC Road Permission", "Private Farmhouse Rent", "Ramoji Film City Floor Charge", "Forest Dept Clearance"],
        "Crowd & Artists": ["300+ Junior Artists + Batta", "Background Dancers Union Rates", "Village Crowd + Transport", "Corporate Office Extras"],
        "Action & Stunts": ["Rope Rigs & Harnesses", "Fighters Union (Master + 10)", "Car Crash Setup", "Fire Safety Team"],
        "Vehicles & Logistics": ["Vanity Vans x4", "Generator Van (Silenced)", "Crane & Jimmy Jib", "Action Vehicles + Towing"],
        "Unit Food": ["Breakfast/Lunch/Dinner for 400 Pax", "Hi-Tea & Snacks", "VVIP Catering for Stars", "Late Night Dinner Packets"],
        "Hidden Costs": ["Diesel for Gensets", "Union Overtime Charges", "Local Union Association Fund", "Rain Machine Water Tankers"]
    }

    if matches or len(script_text) > 50: 
        lines = script_text.split('\n')
        target_lines = [l for l in lines if scene_pattern.match(l)]
        
        if not target_lines:
             target_lines = ["INT. UNKNOWN SCENE - DAY"] 

        scene_count = 0
        for header in target_lines:
            scene_count += 1
            header_upper = header.upper().strip()
            time = "DAY" if "DAY" in header_upper else "NIGHT" if "NIGHT" in header_upper else "UNKNOWN"
            location = header_upper.replace("INT", "").replace("EXT", "").replace(".", "").split("-")[0].strip()
            
            # --- DYNAMIC BUDGET LOGIC ---
            # Keywords indicating HIGH budget
            high_triggers = ["CHASE", "BLAST", "EXPLOSION", "CROWD", "VFX", "SONG", "FIGHT", "STUNT", "HELICOPTER", "TRAIN", "FIRE", "HIGHWAY"]
            # Keywords indicating MEDIUM budget
            med_triggers = ["EXT", "STREET", "CLUB", "PARTY", "WEDDING", "FOREST", "RAIN", "NIGHT"]

            # Safe Content Extraction
            if header == "INT. UNKNOWN SCENE - DAY":
                # Fallback Case: Whole script is the scene
                content_snippet = script_text.upper()
            else:
                # Normal Case: Extract 1500 chars after header
                start_idx = script_text.find(header)
                if start_idx != -1:
                    content_snippet = script_text[start_idx:start_idx+1500].upper()
                else:
                    content_snippet = "" # Should not happen if regex matched, but safe fallback
            
            is_high = any(x in header_upper or x in content_snippet for x in high_triggers)
            is_med = any(x in header_upper or x in content_snippet for x in med_triggers)

            scene_expenses = []
            
            # Base Costs (Randomized)
            if is_high:
                # Range: 50L to 3Cr
                base_mult = random.uniform(5.0, 30.0) # 5L to 30L multiplier per item
                
                scene_expenses = [
                    {"category": "Location & Permits", "cost": f"₹ {random.randint(2, 10)} Lakhs", "reason": "Highway Closure / Airport Permits"},
                    {"category": "Crowd & Artists", "cost": f"₹ {random.randint(10, 50)} Lakhs", "reason": "1000+ Junior Artists & Dancers"},
                    {"category": "Action & Stunts", "cost": f"₹ {random.randint(15, 80)} Lakhs", "reason": "Harness Team, Crash Mats, Pyro Tech"},
                    {"category": "Vehicles & Logistics", "cost": f"₹ {random.randint(5, 20)} Lakhs", "reason": "Multiple Camera Cranes, Russian Arm"},
                    {"category": "Unit Food (Catering)", "cost": f"₹ {random.randint(3, 8)} Lakhs", "reason": "Full Unit Catering (Heavy Scale)"},
                    {"category": "Hidden Costs", "cost": f"₹ {random.randint(2, 5)} Lakhs", "reason": "Hazard Pay, Breakages, Misc"}
                ]
            elif is_med:
                # Range: 10L to 40L
                scene_expenses = [
                    {"category": "Location & Permits", "cost": f"₹ {random.randint(1, 4)} Lakhs", "reason": random.choice(reasons_templates["Location & Permits"])},
                    {"category": "Crowd & Artists", "cost": f"₹ {random.randint(2, 6)} Lakhs", "reason": random.choice(reasons_templates["Crowd & Artists"])},
                    {"category": "Action & Stunts", "cost": "₹ 0", "reason": "N/A"},
                    {"category": "Vehicles & Logistics", "cost": f"₹ {random.randint(1, 3)} Lakhs", "reason": random.choice(reasons_templates["Vehicles & Logistics"])},
                    {"category": "Unit Food (Catering)", "cost": f"₹ {random.randint(1, 2)} Lakhs", "reason": "Standard Unit Food"},
                    {"category": "Hidden Costs", "cost": f"₹ {random.randint(50, 90)}k", "reason": "Overtime & Batta"}
                ]
            else:
                # Low Budget Talkie
                scene_expenses = [
                    {"category": "Location & Permits", "cost": f"₹ {random.randint(10, 50)}k", "reason": "House/Office Rent"},
                    {"category": "Crowd & Artists", "cost": f"₹ {random.randint(10, 30)}k", "reason": "few extras"},
                    {"category": "Action & Stunts", "cost": "₹ 0", "reason": "N/A"},
                    {"category": "Vehicles & Logistics", "cost": f"₹ {random.randint(10, 30)}k", "reason": "Transport"},
                    {"category": "Unit Food (Catering)", "cost": f"₹ {random.randint(20, 40)}k", "reason": "Tea/Coffee/Lunch"},
                    {"category": "Hidden Costs", "cost": f"₹ {random.randint(5, 15)}k", "reason": "Misc"}
                ]

            # Calculate total cost string for the Scene object
            total_raw = 0
            for item in scene_expenses:
                c_str = item["cost"].replace("₹", "").replace(",", "").strip()
                val = 0
                if "Crores" in c_str: val = float(c_str.replace("Crores", "")) * 10000000
                elif "Lakhs" in c_str: val = float(c_str.replace("Lakhs", "")) * 100000
                elif "k" in c_str: val = float(c_str.replace("k", "")) * 1000
                total_raw += val
            
            parsed_scenes.append(
                Scene(
                    id=str(scene_count),
                    header=header,
                    summary=f"Scene at {location}. Intensity: {'HIGH' if is_high else 'MEDIUM' if is_med else 'LOW'}",
                    location=location,
                    time=time,
                    estimated_cost=f"₹ {total_raw/100000:.2f} Lakhs",
                    budget_code=total_raw,
                    expense_breakdown=scene_expenses
                )
            )

    # DYNAMIC AUTO-FIX LOGIC based on Budget Mode
    sc1_fix = "Shoot a quick insert shot."
    sc1_cost = "₹ 10 Lakhs"
    
    if budget_mode == "Low":
        sc1_fix = "Rewrite dialogue to mention it off-screen."
        sc1_cost = "₹ 2,000"
    elif budget_mode == "High":
        sc1_fix = "CGI Correction in Post."
        sc1_cost = "₹ 25 Lakhs"

    # Aggregating Global Budget for Executive Intelligence
    # We sum up all scenes to get a total script-wide breakdown
    global_breakdown_map = {}
    for scene in parsed_scenes:
        for expense in scene.expense_breakdown:
            cat = expense.category
            # Extract raw value from string
            cost_str = expense.cost
            val = 0
            if "Crores" in cost_str: val = float(cost_str.replace("Crores", "").replace("₹", "").strip()) * 10000000
            elif "Lakhs" in cost_str: val = float(cost_str.replace("Lakhs", "").replace("₹", "").strip()) * 100000
            elif "k" in cost_str: val = float(cost_str.replace("k", "").replace("₹", "").strip()) * 1000
            
            if cat not in global_breakdown_map:
                global_breakdown_map[cat] = 0
            global_breakdown_map[cat] += val

    overall_budget_breakdown = []
    for cat, val in global_breakdown_map.items():
        overall_budget_breakdown.append({
            "category": cat,
            "cost": f"₹ {val/100000:.2f} Lakhs" if val < 10000000 else f"₹ {val/10000000:.2f} Cr",
            "reason": "Aggregated Script Cost"
        })

    # Fallback for empty scripts to avoid crash
    if not parsed_scenes:
         parsed_scenes.append(Scene(id="0", header="NO SCENES DETECTED", summary="Please check script format.", location="UNKNOWN"))
         first_scene_id = "0"
         first_scene_header = "UNKNOWN"
         next_scene_id = "0"
    else:
        first_scene_id = parsed_scenes[0].id
        first_scene_header = parsed_scenes[0].header
        next_scene_id = parsed_scenes[1].id if len(parsed_scenes) > 1 else first_scene_id

    # --- ENHANCED REASONING GENERATION ---

    # 1. Detailed Continuity Error
    continuity_description = (
        f"**LOGIC FAILURE:** In {first_scene_header}, the Hero enters wearing **Ray-Ban Aviators**. "
        f"However, in the subsequent shots (Scene {next_scene_id}), the script descriptions imply eye contact which would require him to NOT represent them, yet no action line specifies him removing them.\n\n"
        f"**REAL LIFE IMPACT:** If shot out of order, you will have a 'Magic Sunglasses' blooper. Reshoots for this specific continuity usually cost ~₹10L per day for main talent."
    )
    
    continuity_fix = (
         f"**DIRECTOR'S FIX:** {sc1_fix} Specifically, add a 2-second action beat: 'HERO dramatically removes glasses' before the dialogue starts. This creates a clean cut point."
    )

    # 2. Detailed Censor Risk (Dynamic)
    compliance_risks = []
    text_upper = script_text.upper()

    # Rule 1: POCSO / Women Safety
    if any(x in text_upper for x in ["MINOR", "CHILD", "MOLEST", "RAPE", "ABUSE", "GIRL"]):
        compliance_risks.append(ComplianceRisk(
            category="Serious Crime / POCSO",
            trigger_text="Depiction of crimes against women/children detected.",
            legal_requirement="**STRICT PROHIBITION:** Under the POCSO Act and SC guidelines, graphic depiction is BANNED. \n1. Requires 'A' Certificate.\n2. Sensitive handling mandatory; no voyeuristic angles.",
            estimated_fine="Refusal of Certificate / Legal Action"
        ))

    # Rule 2: Smoking / Alcohol
    if any(x in text_upper for x in ["SMOKE", "CIGARETTE", "ALCOHOL", "DRINK", "SCOTCH", "WHISKY"]):
        compliance_risks.append(ComplianceRisk(
            category="Censor Board (COTPA)",
            trigger_text="Smoking/Alcohol Consumption detected.",
            legal_requirement="**MANDATORY:** \n1. Static 'Smoking Kills' warning.\n2. Anti-tobacco audiovisual spot.",
            estimated_fine="Cuts or 'A' Certificate"
        ))

    # Rule 3: Religion
    if any(x in text_upper for x in ["TEMPLE", "GOD", "PRAY", "RELIGION", "HINDU", "MUSLIM", "CHRISTIAN"]):
        compliance_risks.append(ComplianceRisk(
            category="Religious Sentiments",
            trigger_text="Religious references detected.",
            legal_requirement="**CAUTION:** Ensure no scenes hurt religious sentiments (IPC Section 295A).",
            estimated_fine="Potential Lawsuits / Cuts"
        ))
    
    # Rule 4: Animals
    if any(x in text_upper for x in ["HORSE", "DOG", "TIGER", "ANIMAL", "BIRD"]):
         compliance_risks.append(ComplianceRisk(
            category="Animal Welfare Board (AWBI)",
            trigger_text="Animal presence detected.",
            legal_requirement="**NOC REQUIRED:** You usually cannot shoot with animals without pre-approval from AWBI.",
            estimated_fine="Shoot Stoppage"
        ))

    # Default if nothing specific found but input exists
    if not compliance_risks and len(script_text) > 10:
         compliance_risks.append(ComplianceRisk(
            category="General Review",
            trigger_text="No specific triggers found.",
            legal_requirement="Proceed with standard CBFC guidelines.",
            estimated_fine="None"
        ))

    # 3. Detailed Schedule Risk
    loc_ref = parsed_scenes[0].location if parsed_scenes else "UNKNOWN"
    schedule_message = (
        f"**LOGISTICAL NIGHTMARE:** You are attempting to shoot an EXT. DAY sequence at {loc_ref} which involves a 'Chase/Action' element.\n\n"
        f"**REASONING:** Action sequences consume 3x more time than dialogue. You only have ~10 hours of usable daylight. With 300+ Junior Artists, reset time between takes will be 20 minutes. You will likely lose the light before completing coverage, forcing an expensive 'Day 2'."
    )

    return AnalysisResult(
        total_risk_score=85,
        potential_savings="₹ 50 Lakhs",
        scenes=parsed_scenes,
        errors=[
            ContinuityError(
                error_type=ErrorType.COSTUME_ERROR,
                description=continuity_description,
                severity=Severity.HIGH,
                estimated_cost=sc1_cost,
                estimated_delay="2 hours",
                suggested_fix=continuity_fix,
                reasoning="Objects (Sunglasses) cannot disappear between continuous shots without an establishing action.",
                from_scene_id=first_scene_id,
                to_scene_id=next_scene_id
            )
        ],
        compliance_risks=compliance_risks,
        schedule_risks=[
            ScheduleRisk(
                scene_id=first_scene_id,
                risk_type="Daylight",
                message=schedule_message,
                severity=Severity.MEDIUM
            )
        ],
        overall_budget_breakdown=overall_budget_breakdown,
        assets=[
            # 1. Location Assets
            ProductionAsset(
                asset_type="Location",
                name=f"Location Permit ({loc_ref})",
                status=AssetStatus.CLEARED
            ),
             # 2. Dynamic Vehicle/Prop detection
            ProductionAsset(
                asset_type="Vehicle",
                name="Vintage Car / Jeep (Action Sequence)",
                status=AssetStatus.PENDING_SIGNOFF
            ) if "CHASE" in script_text.upper() or "CAR" in script_text.upper() or "JEEP" in script_text.upper() else 
            ProductionAsset(
                asset_type="Prop",
                name="Specific Prop Requirement",
                status=AssetStatus.NOT_STARTED
            ),
            # 3. Music/Song detection
            ProductionAsset(
                asset_type="Music",
                name="Background Score / Song Rights",
                status=AssetStatus.PENDING_SIGNOFF if "SONG" in script_text.upper() or "DANCE" in script_text.upper() else AssetStatus.NOT_STARTED
            )
        ]
    )

def analyze_script(script_text: str, api_key: str, budget_mode: str = "Medium") -> AnalysisResult:
    client = OpenAI(api_key=api_key)
    
    # Inject Budget Mode into System Prompt
    budget_instruction = ""
    if budget_mode == "Low":
        budget_instruction = "SUGGEST LOW BUDGET FIXES (Rewrites, Dialogues). Avoid Reshoots."
    elif budget_mode == "High":
        budget_instruction = "SUGGEST HIGH BUDGET FIXES (VFX, Reshoots, CGI). Quality is priority."
    
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        messages=[
            {"role": "system", "content": TOLLYWOOD_SYSTEM_PROMPT + "\n\n" + budget_instruction},
            {"role": "user", "content": f"Analyze this script segment:\n\n{script_text}"},
        ],
        response_format=AnalysisResult,
    )

    return completion.choices[0].message.parsed

def generate_storyboard(prompt: str, api_key: str) -> str:
    """
    Generates a storyboard image using DALL-E 3.
    """
    client = OpenAI(api_key=api_key)
    
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=f"A rough black and white storyboard sketch of: {prompt}. Film noir style, cinematic lighting, pencil sketch texture.",
            size="1024x1024",
            quality="standard",
            n=1,
        )
        return response.data[0].url
    except Exception as e:
        print(f"Error generating image: {e}")
        return "https://placehold.co/600x400/1c1c1c/FFF?text=Image+Generation+Failed"

def mock_generate_storyboard(prompt: str) -> str:
    """
    Returns a mock image URL for demo purposes.
    """
    # Return a placeholder that looks like a storyboard sketch
    # Use Pollinations.ai for free, prompt-based AI generation (No Key Required for Demo)
    import urllib.parse
    # SIMPLIFIED CINEMATIC PROMPT - Removing complex jargon to avoid model confusion
    base_prompt = f"cinematic shot of {prompt}, indian film style, detailed, realistic, 8k"
    encoded_prompt = urllib.parse.quote(base_prompt)
    return f"https://image.pollinations.ai/prompt/{encoded_prompt}"
