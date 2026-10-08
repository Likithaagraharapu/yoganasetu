from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class EligibilityCriteria(BaseModel):
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    occupations: List[str] = Field(default_factory=list)
    states: List[str] = Field(default_factory=lambda: ["All States"])
    gender: str = "All"
    income_limit: Optional[float] = None
    details: str

class Scheme(BaseModel):
    id: str
    name: str
    description: str
    category: str
    target_group: str
    eligibility: EligibilityCriteria
    benefits: str
    documents: List[str]
    application_process: str
    official_source: str

class SearchRequest(BaseModel):
    query: str = ""
    category: Optional[str] = None
    target_group: Optional[str] = None
    state: Optional[str] = None
    limit: int = 20

class SearchResponse(BaseModel):
    total: int
    schemes: List[Scheme]
    categories: List[str]

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    scheme_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    grounded_schemes: List[Scheme]
    sources: List[str]
    is_gemini_powered: bool
    suggested_followups: List[str] = Field(default_factory=list)

class EligibilityProfile(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None
    social_category: Optional[str] = None  # General, OBC, SC, ST, EWS, Minority
    education: Optional[str] = None
    is_differently_abled: Optional[bool] = False
    is_bpl_ration_card: Optional[bool] = False
    owns_pucca_house: Optional[bool] = False
    owns_agricultural_land: Optional[bool] = False

class EligibilityResultItem(BaseModel):
    scheme: Scheme
    score: int  # 0 to 100 percentage
    status: str  # "Eligible", "Likely Eligible", "Review Required"
    reasons: List[str]

class EligibilityResponse(BaseModel):
    profile_summary: Dict[str, Any]
    results: List[EligibilityResultItem]

class StatsResponse(BaseModel):
    total_schemes: int
    total_categories: int
    category_counts: Dict[str, int]
    target_group_counts: Dict[str, int]
    estimated_citizens_covered_crores: float

# SQLite Database Specific Models
class BookmarkRequest(BaseModel):
    scheme_id: str
    user_identifier: str = "guest_user"
    notes: Optional[str] = None

class BookmarkItem(BaseModel):
    bookmark_id: int
    notes: Optional[str] = None
    bookmarked_at: str
    scheme: Scheme

class DatabaseStatsResponse(BaseModel):
    database_engine: str
    sqlite_version: str
    database_path: str
    file_size_bytes: int
    file_size_kb: float
    tables: Dict[str, int]

class SchemeCreate(BaseModel):
    id: str
    name: str
    description: str
    category: str
    target_group: str
    eligibility: EligibilityCriteria
    benefits: str
    documents: List[str] = Field(default_factory=list)
    application_process: str
    official_source: str

class SchemeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    target_group: Optional[str] = None
    eligibility: Optional[EligibilityCriteria] = None
    benefits: Optional[str] = None
    documents: Optional[List[str]] = None
    application_process: Optional[str] = None
    official_source: Optional[str] = None

class EligibilityHistoryItem(BaseModel):
    id: int
    user_identifier: str
    profile: Dict[str, Any]
    matched_schemes_count: int
    top_matches: List[Dict[str, Any]]
    created_at: str

class ChatHistoryItem(BaseModel):
    id: int
    session_id: Optional[str] = None
    user_message: str
    assistant_response: str
    grounded_schemes: List[Dict[str, Any]]
    is_gemini_powered: bool
    created_at: str

# ============================================================================
# User Authentication & Profile Models
# ============================================================================

class UserSignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=120)
    password: str = Field(..., min_length=8, max_length=128)
    state: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=120)
    password: str = Field(..., min_length=1, max_length=128)
    remember_me: bool = False

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    state: Optional[str] = None
    created_at: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
