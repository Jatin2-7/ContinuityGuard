from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class Severity(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class ErrorType(str, Enum):
    TIME_JUMP = "Time Jump"
    LOCATION_MISMATCH = "Location Mismatch"
    PROP_INCONSISTENCY = "Prop Inconsistency"
    COSTUME_ERROR = "Costume Error"
    CHARACTER_PLACEMENT = "Character Placement"
    OTHER = "Other"

class ContinuityError(BaseModel):
    error_type: ErrorType = Field(..., description="The category of the continuity error.")
    description: str = Field(..., description="A detailed explanation of the error.")
    severity: Severity = Field(..., description="The impact of this error on the production.")
    estimated_cost: str = Field(..., description="Estimated cost to fix in dollars (e.g., '$5,000').")
    estimated_delay: str = Field(..., description="Estimated time delay caused by this error (e.g., '2 hours').")
    suggested_fix: str = Field(..., description="A creative solution or dialogue change to fix the error.")
    reasoning: str = Field(..., description="The logic/reasoning behind why this is flagged as an error.")
    from_scene_id: Optional[str] = Field(None, description="ID of the scene where the error originates.")
    to_scene_id: Optional[str] = Field(None, description="ID of the connected scene where the error manifests.")

class ScheduleRisk(BaseModel):
    scene_id: str = Field(..., description="ID of the scene with the schedule risk.")
    risk_type: str = Field(..., description="Type: 'Daylight', 'Turnaround', 'Overtime'")
    message: str = Field(..., description="Warning message e.g., 'Sunset Risk: Scene too long for remaining daylight'.")
    severity: Severity = Field(..., description="Severity of the schedule risk.")

class ComplianceRisk(BaseModel):
    category: str = Field(..., description="Category: 'Censor Board', 'Animal Welfare', 'Safety', 'Brand'")
    trigger_text: str = Field(..., description="The specific text in script that triggered this.")
    legal_requirement: str = Field(..., description="Legal requirement e.g., 'Static Warning', 'NOC Required'.")
    estimated_fine: str = Field(..., description="Potential fine or delay cost.")

class AssetStatus(str, Enum):
    CLEARED = "Cleared"
    PENDING_SIGNOFF = "Pending Sign-off"
    NOT_STARTED = "Not Started"

class ProductionAsset(BaseModel):
    asset_type: str = Field(..., description="Type: 'Location', 'Music', 'Vehicle', 'Prop'")
    name: str = Field(..., description="Name of the asset e.g., 'Hero Bike', 'Temple Location'")
    status: AssetStatus = Field(AssetStatus.NOT_STARTED, description="Clearance status.")

class ExpenseCategory(BaseModel):
    category: str = Field(..., description="Category Name e.g. 'Location & Permits'")
    cost: str = Field(..., description="Estimated cost string e.g. '₹ 50,000'")
    reason: str = Field(..., description="Reasoning or specific line items.")

class Scene(BaseModel):
    id: str = Field(..., description="Unique identifier for the scene (e.g., '1', '2A').")
    header: str = Field(..., description="Scene header (e.g., 'INT. CAFE - DAY').")
    summary: str = Field(..., description="Brief summary of the scene action.")
    location: Optional[str] = Field(None, description="Extracted Location (e.g., 'TEMPLE', 'BAR').")
    time: Optional[str] = Field(None, description="Time of day (e.g., 'DAY', 'NIGHT').")
    estimated_cost: Optional[str] = Field("₹ 0", description="Total estimated cost for this scene.")
    budget_code: Optional[int] = Field(0, description="Raw integer cost for calculation.")
    expense_breakdown: List[ExpenseCategory] = Field(default_factory=list, description="Detailed line-item breakdown.")

class AnalysisResult(BaseModel):
    total_risk_score: int = Field(..., description="A calculated risk score (0-100) based on error severity.")
    potential_savings: str = Field(..., description="Total estimated savings if these errors are caught early (e.g., '$25,000').")
    scenes: List[Scene] = Field(..., description="List of recognized scenes in the script.")
    errors: List[ContinuityError] = Field(..., description="List of identified continuity errors.")
    compliance_risks: List[ComplianceRisk] = Field(default_factory=list, description="List of censor and compliance risks.")
    schedule_risks: List[ScheduleRisk] = Field(default_factory=list, description="List of scheduling/sunlight risks.")
    assets: List[ProductionAsset] = Field(default_factory=list, description="List of extracted assets checking for clearance.")
    overall_budget_breakdown: List[ExpenseCategory] = Field(default_factory=list, description="Server-side aggregated budget report.")

class StoryboardRequest(BaseModel):
    scene_desc: str = Field(..., description="Description of the scene or fix to visualize.")
    style: str = Field("Film Noir", description="Style of the storyboard (e.g., 'Film Noir', 'Sketch').")

class StoryboardResponse(BaseModel):
    image_url: str = Field(..., description="URL of the generated storyboard image.")
