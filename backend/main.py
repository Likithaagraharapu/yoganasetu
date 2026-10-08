import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, Header, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import database
import auth
from models import (
    Scheme,
    SearchRequest,
    SearchResponse,
    ChatRequest,
    ChatResponse,
    EligibilityProfile,
    EligibilityResponse,
    EligibilityResultItem,
    StatsResponse,
    BookmarkRequest,
    BookmarkItem,
    DatabaseStatsResponse,
    SchemeCreate,
    SchemeUpdate,
    EligibilityHistoryItem,
    ChatHistoryItem,
    UserSignupRequest,
    UserLoginRequest,
    UserResponse,
    AuthResponse
)
from rag_engine import RAGEngine

load_dotenv()

app = FastAPI(
    title="YojanaSetu API",
    description="AI-first Indian Government Schemes Discovery, RAG & SQLite 3 Backend",
    version="1.1.0"
)

# Initialize SQLite database on startup
@app.on_event("startup")
def startup_event():
    database.init_db()
    print("[SQLite 3] Database initialized and verified.")

# Configure CORS for Next.js frontend
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
if "*" not in origins:
    origins.append("http://localhost:3000")
    origins.append("http://127.0.0.1:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development & local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG Engine
rag_engine = RAGEngine()

@app.get("/", tags=["Root"])
def root():
    db_stats = database.get_db_stats()
    return {
        "app": "YojanaSetu API",
        "status": "online",
        "version": "1.1.0",
        "database": {
            "engine": "SQLite 3",
            "version": db_stats["sqlite_version"],
            "schemes_persisted": db_stats["tables"]["schemes"]
        },
        "schemes_loaded": len(rag_engine.schemes),
        "gemini_active": rag_engine.gemini_configured
    }

@app.get("/health", tags=["Root"])
def health_check():
    return {"status": "healthy", "database": "sqlite3_connected"}

@app.get("/api/db/stats", response_model=DatabaseStatsResponse, tags=["Database"])
def get_database_stats():
    """Retrieve SQLite 3 storage diagnostics, table metrics, and version information."""
    return database.get_db_stats()

# ============================================================================
# Schemes (SQLite-backed with RAG semantic indexing)
# ============================================================================

@app.get("/api/schemes", response_model=List[Scheme], tags=["Schemes"])
def get_schemes(
    category: Optional[str] = Query(None, description="Filter by category"),
    target_group: Optional[str] = Query(None, description="Filter by target group"),
    query: Optional[str] = Query(None, description="Search keyword"),
    limit: int = Query(50, ge=1, le=100)
):
    """Retrieve all government schemes with optional filtering and search."""
    if query:
        database.log_search(query=query, category=category, results_count=0)
        results = rag_engine.search(
            query=query,
            category=category,
            target_group=target_group,
            limit=limit
        )
    else:
        results = database.get_all_schemes(
            category=category,
            target_group=target_group,
            limit=limit
        )
    return results

@app.get("/api/schemes/{scheme_id}", response_model=Scheme, tags=["Schemes"])
def get_scheme_by_id(scheme_id: str):
    """Retrieve full details of a specific scheme from SQLite by ID."""
    scheme = database.get_scheme_by_id(scheme_id)
    if scheme:
        return scheme
    raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found.")

@app.post("/api/schemes", response_model=Scheme, status_code=status.HTTP_201_CREATED, tags=["Schemes"])
def create_new_scheme(payload: SchemeCreate):
    """Inserts a new scheme into the SQLite database and hot-reloads the RAG index."""
    existing = database.get_scheme_by_id(payload.id)
    if existing:
        raise HTTPException(status_code=400, detail=f"Scheme with ID '{payload.id}' already exists.")
    
    created = database.create_scheme(payload.model_dump())
    rag_engine.reload_data()
    return created

@app.put("/api/schemes/{scheme_id}", response_model=Scheme, tags=["Schemes"])
def update_existing_scheme(scheme_id: str, payload: SchemeUpdate):
    """Updates an existing scheme in SQLite and refreshes the RAG index."""
    data = payload.model_dump(exclude_unset=True)
    updated = database.update_scheme(scheme_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found.")
    rag_engine.reload_data()
    return updated

@app.delete("/api/schemes/{scheme_id}", tags=["Schemes"])
def delete_scheme_endpoint(scheme_id: str):
    """Deletes a scheme from SQLite and refreshes the RAG index."""
    deleted = database.delete_scheme(scheme_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found.")
    rag_engine.reload_data()
    return {"status": "deleted", "scheme_id": scheme_id}

@app.get("/api/categories", response_model=List[str], tags=["Schemes"])
def get_categories():
    """Retrieve list of all distinct scheme categories."""
    cats = sorted(list(set(s.get("category", "") for s in rag_engine.schemes if s.get("category"))))
    return cats

@app.get("/api/stats", response_model=StatsResponse, tags=["Analytics"])
def get_stats():
    """Retrieve platform statistics and scheme distribution."""
    return rag_engine.get_stats()

# ============================================================================
# Search & AI Chat (with SQLite Audit Logging)
# ============================================================================

@app.post("/api/search", response_model=SearchResponse, tags=["Search"])
def search_schemes(payload: SearchRequest):
    """Semantic and hybrid search for government schemes with SQLite query audit."""
    results = rag_engine.search(
        query=payload.query,
        category=payload.category,
        target_group=payload.target_group,
        state=payload.state,
        limit=payload.limit
    )
    
    # Audit log to SQLite
    database.log_search(
        query=payload.query,
        category=payload.category,
        results_count=len(results)
    )

    cats = sorted(list(set(s.get("category", "") for s in rag_engine.schemes if s.get("category"))))
    return {
        "total": len(results),
        "schemes": results,
        "categories": cats
    }

@app.post("/api/chat", response_model=ChatResponse, tags=["AI Assistant"])
def chat_with_assistant(payload: ChatRequest):
    """RAG-grounded conversational endpoint for citizens with SQLite interaction logging."""
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    result = rag_engine.chat(
        message=payload.message,
        scheme_id=payload.scheme_id
    )

    # Persist interaction to SQLite
    database.log_chat_interaction(
        session_id=payload.conversation_id,
        user_message=payload.message,
        assistant_response=result.get("response", ""),
        grounded_schemes=result.get("grounded_schemes", []),
        is_gemini_powered=result.get("is_gemini_powered", False)
    )

    return result

@app.get("/api/chat/history", response_model=List[ChatHistoryItem], tags=["AI Assistant"])
def get_chat_history(session_id: Optional[str] = Query(None), limit: int = Query(20, ge=1, le=100)):
    """Retrieve conversational history stored in SQLite."""
    return database.get_chat_history(session_id=session_id, limit=limit)

# ============================================================================
# Eligibility Evaluation & History (SQLite-persisted)
# ============================================================================

@app.post("/api/eligibility", response_model=EligibilityResponse, tags=["Eligibility"])
def check_eligibility(payload: EligibilityProfile, user_id: str = Query("guest_user")):
    """Multi-dimensional citizen eligibility evaluation and ranked scheme recommendations."""
    profile_dict = payload.model_dump()
    evaluated = rag_engine.evaluate_eligibility(profile_dict)
    
    # Persist calculation in SQLite
    eligible_count = sum(1 for item in evaluated if item.get("status") in ("Eligible", "Likely Eligible"))
    database.log_eligibility_check(
        profile_dict=profile_dict,
        matched_count=eligible_count,
        top_matches=evaluated,
        user_identifier=user_id
    )

    return {
        "profile_summary": {k: v for k, v in profile_dict.items() if v is not None and v != ""},
        "results": evaluated
    }

@app.get("/api/eligibility/history", response_model=List[EligibilityHistoryItem], tags=["Eligibility"])
def get_eligibility_history(user_id: Optional[str] = Query(None), limit: int = Query(20, ge=1, le=100)):
    """Retrieve history of eligibility evaluations saved in SQLite."""
    return database.get_eligibility_history(user_identifier=user_id, limit=limit)

# ============================================================================
# Citizen Authentication & Account Management (SQLite + JWT)
# ============================================================================

@app.post("/api/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
def signup_citizen(payload: UserSignupRequest):
    """Registers a new citizen with bcrypt encrypted password and returns JWT access token."""
    try:
        user = database.create_user(
            full_name=payload.full_name,
            email=payload.email,
            password=payload.password,
            state=payload.state
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create citizen account: {str(e)}"
        )

    token = auth.create_access_token({"sub": user["id"], "email": user["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@app.post("/api/auth/login", response_model=AuthResponse, tags=["Authentication"])
def login_citizen(payload: UserLoginRequest):
    """Authenticates a citizen against SQLite database, returning a signed JWT access token."""
    user = database.authenticate_user(email=payload.email, password=payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password. Please verify your credentials."
        )

    token = auth.create_access_token(
        {"sub": user["id"], "email": user["email"]},
        remember_me=payload.remember_me
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@app.get("/api/auth/me", response_model=UserResponse, tags=["Authentication"])
def get_current_citizen(user: dict = Depends(auth.get_current_user_required)):
    """Fetches profile of the currently authenticated citizen via JWT token."""
    return user


# ============================================================================
# Citizen Bookmarks / Saved Schemes (SQLite Persistence)
# ============================================================================

@app.get("/api/bookmarks", response_model=List[BookmarkItem], tags=["Bookmarks"])
def get_user_bookmarks(
    user_id: str = Query("guest_user", description="Citizen identifier"),
    authorization: Optional[str] = Header(None)
):
    """Retrieve all bookmarked schemes stored in SQLite for the citizen."""
    current_user = auth.get_current_user_optional(authorization)
    target_user = current_user["id"] if current_user else user_id
    return database.get_bookmarks(user_identifier=target_user)


@app.post("/api/bookmarks", tags=["Bookmarks"])
def save_scheme_bookmark(
    payload: BookmarkRequest,
    authorization: Optional[str] = Header(None)
):
    """Bookmark a scheme in SQLite for offline/future citizen reference."""
    scheme = database.get_scheme_by_id(payload.scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail=f"Scheme '{payload.scheme_id}' not found.")
    
    current_user = auth.get_current_user_optional(authorization)
    target_user = current_user["id"] if current_user else payload.user_identifier

    return database.add_bookmark(
        scheme_id=payload.scheme_id,
        user_identifier=target_user,
        notes=payload.notes
    )


@app.delete("/api/bookmarks/{scheme_id}", tags=["Bookmarks"])
def remove_scheme_bookmark(
    scheme_id: str,
    user_id: str = Query("guest_user"),
    authorization: Optional[str] = Header(None)
):
    """Remove a scheme from citizen's SQLite bookmarks."""
    current_user = auth.get_current_user_optional(authorization)
    target_user = current_user["id"] if current_user else user_id

    removed = database.remove_bookmark(scheme_id=scheme_id, user_identifier=target_user)
    if not removed:
        raise HTTPException(status_code=404, detail="Bookmark not found.")
    return {"status": "removed", "scheme_id": scheme_id}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
