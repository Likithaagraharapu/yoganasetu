"""
YojanaSetu - SQLite 3 Database Layer
Handles relational data persistence, full-text search (FTS5), citizen bookmarks,
eligibility check history, search logs, and conversation audits.
"""

import os
import json
import sqlite3
import uuid
import bcrypt
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
from contextlib import contextmanager

# Default database location
DEFAULT_DB_PATH = os.getenv(
    "SQLITE_DB_PATH",
    str(Path(__file__).resolve().parent / "yojanasetu.db")
)
DATA_JSON_PATH = os.getenv(
    "SCHEMES_JSON_PATH",
    str(Path(__file__).resolve().parent.parent / "data" / "schemes.json")
)


@contextmanager
def get_db(db_path: str = DEFAULT_DB_PATH):
    """Context manager for SQLite database connection with row factory and WAL mode."""
    conn = sqlite3.connect(db_path, timeout=15.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db(db_path: str = DEFAULT_DB_PATH):
    """Initializes the database schema and seeds initial data if empty."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()

        # 1. Primary Schemes Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS schemes (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                target_group TEXT NOT NULL,
                min_age INTEGER,
                max_age INTEGER,
                occupations TEXT NOT NULL DEFAULT '[]',
                states TEXT NOT NULL DEFAULT '["All States"]',
                gender TEXT NOT NULL DEFAULT 'All',
                income_limit REAL,
                details TEXT NOT NULL DEFAULT '',
                benefits TEXT NOT NULL DEFAULT '',
                documents TEXT NOT NULL DEFAULT '[]',
                application_process TEXT NOT NULL DEFAULT '',
                official_source TEXT NOT NULL DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Indexes for fast lookup & filtering
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_schemes_target_group ON schemes(target_group);")

        # 2. SQLite FTS5 Full-Text Search Virtual Table
        cursor.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS schemes_fts USING fts5(
                id UNINDEXED,
                name,
                description,
                category,
                target_group,
                benefits,
                details,
                tokenize = 'porter unicode61'
            );
        """)

        # Triggers to keep FTS index synchronized
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS schemes_ai AFTER INSERT ON schemes BEGIN
                INSERT INTO schemes_fts(id, name, description, category, target_group, benefits, details)
                VALUES (new.id, new.name, new.description, new.category, new.target_group, new.benefits, new.details);
            END;
        """)

        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS schemes_ad AFTER DELETE ON schemes BEGIN
                DELETE FROM schemes_fts WHERE id = old.id;
            END;
        """)

        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS schemes_au AFTER UPDATE ON schemes BEGIN
                DELETE FROM schemes_fts WHERE id = old.id;
                INSERT INTO schemes_fts(id, name, description, category, target_group, benefits, details)
                VALUES (new.id, new.name, new.description, new.category, new.target_group, new.benefits, new.details);
            END;
        """)

        # 3. Citizen Bookmarks / Saved Schemes
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS bookmarks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scheme_id TEXT NOT NULL,
                user_identifier TEXT NOT NULL DEFAULT 'guest_user',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (scheme_id) REFERENCES schemes(id) ON DELETE CASCADE,
                UNIQUE (scheme_id, user_identifier)
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_identifier);")

        # 4. Eligibility Check History
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS eligibility_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_identifier TEXT DEFAULT 'guest_user',
                profile_json TEXT NOT NULL,
                matched_schemes_count INTEGER DEFAULT 0,
                top_matches_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 5. Search Analytics & Query Audit Log
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS search_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query TEXT NOT NULL,
                category TEXT,
                results_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 6. Citizen AI Chat History
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                user_message TEXT NOT NULL,
                assistant_response TEXT NOT NULL,
                grounded_schemes_json TEXT,
                is_gemini_powered INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 7. Citizen Users Table for Authentication
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                full_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'citizen',
                state TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")

    # Seed data if schemes table is empty
    seed_schemes_if_empty(db_path)


def row_to_scheme_dict(row: sqlite3.Row) -> Dict[str, Any]:
    """Converts a SQLite database row into standard Scheme dictionary."""
    occupations = []
    states = ["All States"]
    documents = []

    try:
        occupations = json.loads(row["occupations"]) if row["occupations"] else []
    except Exception:
        occupations = [row["occupations"]] if row["occupations"] else []

    try:
        states = json.loads(row["states"]) if row["states"] else ["All States"]
    except Exception:
        states = [row["states"]] if row["states"] else ["All States"]

    try:
        documents = json.loads(row["documents"]) if row["documents"] else []
    except Exception:
        documents = [row["documents"]] if row["documents"] else []

    return {
        "id": row["id"],
        "name": row["name"],
        "description": row["description"],
        "category": row["category"],
        "target_group": row["target_group"],
        "eligibility": {
            "min_age": row["min_age"],
            "max_age": row["max_age"],
            "occupations": occupations,
            "states": states,
            "gender": row["gender"] or "All",
            "income_limit": row["income_limit"],
            "details": row["details"] or ""
        },
        "benefits": row["benefits"] or "",
        "documents": documents,
        "application_process": row["application_process"] or "",
        "official_source": row["official_source"] or ""
    }


def seed_schemes_if_empty(db_path: str = DEFAULT_DB_PATH, json_path: str = DATA_JSON_PATH):
    """Populates schemes from data/schemes.json if table is empty."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) AS cnt FROM schemes;")
        row = cursor.fetchone()
        if row and row["cnt"] > 0:
            return  # Already seeded

        if not os.path.exists(json_path):
            print(f"[SQLite3] Notice: Seed JSON file not found at {json_path}")
            return

        with open(json_path, "r", encoding="utf-8") as f:
            schemes_data = json.load(f)

        print(f"[SQLite3] Seeding {len(schemes_data)} schemes into SQLite database at {db_path}...")
        for s in schemes_data:
            elig = s.get("eligibility", {})
            cursor.execute("""
                INSERT OR REPLACE INTO schemes (
                    id, name, description, category, target_group,
                    min_age, max_age, occupations, states, gender, income_limit, details,
                    benefits, documents, application_process, official_source
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                s.get("id"),
                s.get("name"),
                s.get("description"),
                s.get("category"),
                s.get("target_group"),
                elig.get("min_age"),
                elig.get("max_age"),
                json.dumps(elig.get("occupations", [])),
                json.dumps(elig.get("states", ["All States"])),
                elig.get("gender", "All"),
                elig.get("income_limit"),
                elig.get("details", ""),
                s.get("benefits", ""),
                json.dumps(s.get("documents", [])),
                s.get("application_process", ""),
                s.get("official_source", "")
            ))

        print(f"[SQLite3] Successfully populated {len(schemes_data)} schemes into SQLite database!")


# ============================================================================
# Scheme CRUD & Query Functions
# ============================================================================

def get_all_schemes(
    category: Optional[str] = None,
    target_group: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db_path: str = DEFAULT_DB_PATH
) -> List[Dict[str, Any]]:
    """Retrieves schemes with optional category and target_group filtering."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM schemes WHERE 1=1"
        params: List[Any] = []

        if category and category.lower() != "all":
            query += " AND LOWER(category) = LOWER(?)"
            params.append(category)

        if target_group and target_group.lower() != "all":
            query += " AND LOWER(target_group) LIKE ?"
            params.append(f"%{target_group.lower()}%")

        query += " ORDER BY name ASC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [row_to_scheme_dict(r) for r in rows]


def get_scheme_by_id(scheme_id: str, db_path: str = DEFAULT_DB_PATH) -> Optional[Dict[str, Any]]:
    """Retrieves a single scheme by its unique identifier."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM schemes WHERE id = ?", (scheme_id,))
        row = cursor.fetchone()
        return row_to_scheme_dict(row) if row else None


def create_scheme(scheme_dict: Dict[str, Any], db_path: str = DEFAULT_DB_PATH) -> Dict[str, Any]:
    """Inserts a new scheme into SQLite."""
    elig = scheme_dict.get("eligibility", {})
    scheme_id = scheme_dict["id"]

    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO schemes (
                id, name, description, category, target_group,
                min_age, max_age, occupations, states, gender, income_limit, details,
                benefits, documents, application_process, official_source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            scheme_id,
            scheme_dict["name"],
            scheme_dict["description"],
            scheme_dict["category"],
            scheme_dict["target_group"],
            elig.get("min_age"),
            elig.get("max_age"),
            json.dumps(elig.get("occupations", [])),
            json.dumps(elig.get("states", ["All States"])),
            elig.get("gender", "All"),
            elig.get("income_limit"),
            elig.get("details", ""),
            scheme_dict.get("benefits", ""),
            json.dumps(scheme_dict.get("documents", [])),
            scheme_dict.get("application_process", ""),
            scheme_dict.get("official_source", "")
        ))

    return get_scheme_by_id(scheme_id, db_path) or scheme_dict


def update_scheme(scheme_id: str, scheme_dict: Dict[str, Any], db_path: str = DEFAULT_DB_PATH) -> Optional[Dict[str, Any]]:
    """Updates an existing scheme in SQLite."""
    existing = get_scheme_by_id(scheme_id, db_path)
    if not existing:
        return None

    elig = scheme_dict.get("eligibility", existing.get("eligibility", {}))

    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE schemes SET
                name = ?,
                description = ?,
                category = ?,
                target_group = ?,
                min_age = ?,
                max_age = ?,
                occupations = ?,
                states = ?,
                gender = ?,
                income_limit = ?,
                details = ?,
                benefits = ?,
                documents = ?,
                application_process = ?,
                official_source = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?;
        """, (
            scheme_dict.get("name", existing["name"]),
            scheme_dict.get("description", existing["description"]),
            scheme_dict.get("category", existing["category"]),
            scheme_dict.get("target_group", existing["target_group"]),
            elig.get("min_age"),
            elig.get("max_age"),
            json.dumps(elig.get("occupations", [])),
            json.dumps(elig.get("states", ["All States"])),
            elig.get("gender", "All"),
            elig.get("income_limit"),
            elig.get("details", ""),
            scheme_dict.get("benefits", existing.get("benefits", "")),
            json.dumps(scheme_dict.get("documents", existing.get("documents", []))),
            scheme_dict.get("application_process", existing.get("application_process", "")),
            scheme_dict.get("official_source", existing.get("official_source", "")),
            scheme_id
        ))

    return get_scheme_by_id(scheme_id, db_path)


def delete_scheme(scheme_id: str, db_path: str = DEFAULT_DB_PATH) -> bool:
    """Deletes a scheme from SQLite."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM schemes WHERE id = ?;", (scheme_id,))
        return cursor.rowcount > 0


def search_schemes_fts(query: str, limit: int = 20, db_path: str = DEFAULT_DB_PATH) -> List[Dict[str, Any]]:
    """Performs lightning-fast native SQLite FTS5 search across scheme records."""
    if not query.strip():
        return get_all_schemes(limit=limit, db_path=db_path)

    # Sanitize FTS query for alphanumeric words
    clean_words = [w for w in query.replace('"', '').replace("'", '').split() if w.isalnum()]
    if not clean_words:
        return get_all_schemes(limit=limit, db_path=db_path)

    fts_query = " OR ".join(f"{word}*" for word in clean_words)

    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.* FROM schemes s
            JOIN schemes_fts fts ON s.id = fts.id
            WHERE schemes_fts MATCH ?
            ORDER BY bm25(schemes_fts)
            LIMIT ?;
        """, (fts_query, limit))
        rows = cursor.fetchall()
        return [row_to_scheme_dict(r) for r in rows]


# ============================================================================
# Bookmarks / Saved Schemes
# ============================================================================

def add_bookmark(scheme_id: str, user_identifier: str = "guest_user", notes: Optional[str] = None, db_path: str = DEFAULT_DB_PATH) -> Dict[str, Any]:
    """Saves a scheme to citizen's bookmarked list in SQLite."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO bookmarks (scheme_id, user_identifier, notes)
            VALUES (?, ?, ?);
        """, (scheme_id, user_identifier, notes))

    scheme = get_scheme_by_id(scheme_id, db_path)
    return {
        "scheme_id": scheme_id,
        "user_identifier": user_identifier,
        "notes": notes,
        "saved": True,
        "scheme": scheme
    }


def get_bookmarks(user_identifier: str = "guest_user", db_path: str = DEFAULT_DB_PATH) -> List[Dict[str, Any]]:
    """Retrieves all bookmarked schemes for a citizen."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT b.id as bookmark_id, b.notes, b.created_at as bookmarked_at, s.*
            FROM bookmarks b
            JOIN schemes s ON b.scheme_id = s.id
            WHERE b.user_identifier = ?
            ORDER BY b.created_at DESC;
        """, (user_identifier,))
        rows = cursor.fetchall()

        results = []
        for r in rows:
            scheme = row_to_scheme_dict(r)
            results.append({
                "bookmark_id": r["bookmark_id"],
                "notes": r["notes"],
                "bookmarked_at": r["bookmarked_at"],
                "scheme": scheme
            })
        return results


def remove_bookmark(scheme_id: str, user_identifier: str = "guest_user", db_path: str = DEFAULT_DB_PATH) -> bool:
    """Removes a scheme from citizen's bookmarked list."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            DELETE FROM bookmarks
            WHERE scheme_id = ? AND user_identifier = ?;
        """, (scheme_id, user_identifier))
        return cursor.rowcount > 0


# ============================================================================
# Analytics, Logs & History
# ============================================================================

def log_eligibility_check(profile_dict: Dict[str, Any], matched_count: int, top_matches: List[Dict[str, Any]], user_identifier: str = "guest_user", db_path: str = DEFAULT_DB_PATH):
    """Persists an eligibility calculation to SQLite for analytical auditing."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        top_summary = [
            {"id": item["scheme"]["id"], "name": item["scheme"]["name"], "score": item["score"], "status": item["status"]}
            for item in top_matches[:5]
        ]
        cursor.execute("""
            INSERT INTO eligibility_history (user_identifier, profile_json, matched_schemes_count, top_matches_json)
            VALUES (?, ?, ?, ?);
        """, (
            user_identifier,
            json.dumps(profile_dict),
            matched_count,
            json.dumps(top_summary)
        ))


def get_eligibility_history(user_identifier: Optional[str] = None, limit: int = 20, db_path: str = DEFAULT_DB_PATH) -> List[Dict[str, Any]]:
    """Retrieves past eligibility calculations."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        if user_identifier:
            cursor.execute("""
                SELECT * FROM eligibility_history
                WHERE user_identifier = ?
                ORDER BY created_at DESC LIMIT ?;
            """, (user_identifier, limit))
        else:
            cursor.execute("""
                SELECT * FROM eligibility_history
                ORDER BY created_at DESC LIMIT ?;
            """, (limit,))
        rows = cursor.fetchall()
        results = []
        for r in rows:
            results.append({
                "id": r["id"],
                "user_identifier": r["user_identifier"],
                "profile": json.loads(r["profile_json"]) if r["profile_json"] else {},
                "matched_schemes_count": r["matched_schemes_count"],
                "top_matches": json.loads(r["top_matches_json"]) if r["top_matches_json"] else [],
                "created_at": r["created_at"]
            })
        return results


def log_search(query: str, category: Optional[str] = None, results_count: int = 0, db_path: str = DEFAULT_DB_PATH):
    """Logs citizen search keywords into SQLite."""
    if not query.strip():
        return
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO search_logs (query, category, results_count)
            VALUES (?, ?, ?);
        """, (query.strip(), category, results_count))


def log_chat_interaction(
    session_id: Optional[str],
    user_message: str,
    assistant_response: str,
    grounded_schemes: List[Dict[str, Any]],
    is_gemini_powered: bool = False,
    db_path: str = DEFAULT_DB_PATH
):
    """Logs conversational interactions and grounded citations in SQLite."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        schemes_meta = [{"id": s.get("id"), "name": s.get("name")} for s in grounded_schemes]
        cursor.execute("""
            INSERT INTO chat_history (session_id, user_message, assistant_response, grounded_schemes_json, is_gemini_powered)
            VALUES (?, ?, ?, ?, ?);
        """, (
            session_id,
            user_message,
            assistant_response,
            json.dumps(schemes_meta),
            1 if is_gemini_powered else 0
        ))


def get_chat_history(session_id: Optional[str] = None, limit: int = 20, db_path: str = DEFAULT_DB_PATH) -> List[Dict[str, Any]]:
    """Retrieves chat message history for auditing or session resumption."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        if session_id:
            cursor.execute("""
                SELECT * FROM chat_history
                WHERE session_id = ?
                ORDER BY created_at ASC LIMIT ?;
            """, (session_id, limit))
        else:
            cursor.execute("""
                SELECT * FROM chat_history
                ORDER BY created_at DESC LIMIT ?;
            """, (limit,))
        rows = cursor.fetchall()
        return [{
            "id": r["id"],
            "session_id": r["session_id"],
            "user_message": r["user_message"],
            "assistant_response": r["assistant_response"],
            "grounded_schemes": json.loads(r["grounded_schemes_json"]) if r["grounded_schemes_json"] else [],
            "is_gemini_powered": bool(r["is_gemini_powered"]),
            "created_at": r["created_at"]
        } for r in rows]


def get_db_stats(db_path: str = DEFAULT_DB_PATH) -> Dict[str, Any]:
    """Retrieves relational database diagnostics and row counts."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) as cnt FROM schemes;")
        schemes_count = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(DISTINCT category) as cnt FROM schemes;")
        categories_count = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) as cnt FROM bookmarks;")
        bookmarks_count = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) as cnt FROM eligibility_history;")
        eligibility_count = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) as cnt FROM search_logs;")
        searches_count = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) as cnt FROM chat_history;")
        chats_count = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) as cnt FROM users;")
        users_count = cursor.fetchone()["cnt"]

        file_size_bytes = os.path.getsize(db_path) if os.path.exists(db_path) else 0

        return {
            "database_engine": "SQLite 3",
            "sqlite_version": sqlite3.sqlite_version,
            "database_path": str(db_path),
            "file_size_bytes": file_size_bytes,
            "file_size_kb": round(file_size_bytes / 1024, 2),
            "tables": {
                "schemes": schemes_count,
                "categories": categories_count,
                "bookmarks": bookmarks_count,
                "eligibility_history": eligibility_count,
                "search_logs": searches_count,
                "chat_history": chats_count,
                "users": users_count,
            }
        }


# ============================================================================
# Citizen User Authentication & Management
# ============================================================================

def hash_password(plain_password: str) -> str:
    """Hashes a plaintext password using bcrypt with random salt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password against stored bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def get_user_by_email(email: str, include_password: bool = False, db_path: str = DEFAULT_DB_PATH) -> Optional[Dict[str, Any]]:
    """Retrieves a user by email address (case-insensitive)."""
    clean_email = email.strip().lower()
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, full_name, email, hashed_password, role, state, created_at, updated_at
            FROM users
            WHERE LOWER(email) = ?;
        """, (clean_email,))
        row = cursor.fetchone()
        if not row:
            return None
        
        user_dict = {
            "id": row["id"],
            "full_name": row["full_name"],
            "email": row["email"],
            "role": row["role"],
            "state": row["state"],
            "created_at": str(row["created_at"])
        }
        if include_password:
            user_dict["hashed_password"] = row["hashed_password"]
        return user_dict


def get_user_by_id(user_id: str, db_path: str = DEFAULT_DB_PATH) -> Optional[Dict[str, Any]]:
    """Retrieves a sanitized citizen profile by ID."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, full_name, email, role, state, created_at, updated_at
            FROM users
            WHERE id = ?;
        """, (user_id,))
        row = cursor.fetchone()
        if not row:
            return None
        return {
            "id": row["id"],
            "full_name": row["full_name"],
            "email": row["email"],
            "role": row["role"],
            "state": row["state"],
            "created_at": str(row["created_at"])
        }


def create_user(
    full_name: str,
    email: str,
    password: str,
    state: Optional[str] = None,
    role: str = "citizen",
    db_path: str = DEFAULT_DB_PATH
) -> Dict[str, Any]:
    """Creates a new citizen account with bcrypt password hashing in SQLite."""
    clean_name = full_name.strip()
    clean_email = email.strip().lower()

    if not clean_name:
        raise ValueError("Full name cannot be blank.")
    if not clean_email or "@" not in clean_email:
        raise ValueError("A valid email address is required.")
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters in length.")

    # Check for existing user
    existing = get_user_by_email(clean_email, db_path=db_path)
    if existing:
        raise ValueError("An account with this email address already exists. Please sign in instead.")

    hashed = hash_password(password)
    user_id = f"usr_{uuid.uuid4().hex[:12]}"

    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (id, full_name, email, hashed_password, role, state)
            VALUES (?, ?, ?, ?, ?, ?);
        """, (user_id, clean_name, clean_email, hashed, role, state))

    user = get_user_by_id(user_id, db_path=db_path)
    if not user:
        raise RuntimeError("Failed to verify user account creation.")
    return user


def authenticate_user(email: str, password: str, db_path: str = DEFAULT_DB_PATH) -> Optional[Dict[str, Any]]:
    """Authenticates a citizen by email and plaintext password."""
    user = get_user_by_email(email, include_password=True, db_path=db_path)
    if not user:
        return None
    
    hashed = user.get("hashed_password", "")
    if not verify_password(password, hashed):
        return None
    
    # Return sanitized user without hashed_password
    return {
        "id": user["id"],
        "full_name": user["full_name"],
        "email": user["email"],
        "role": user["role"],
        "state": user.get("state"),
        "created_at": user.get("created_at")
    }
