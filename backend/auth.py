"""
YojanaSetu - Authentication & JWT Security Module
Provides cryptographic JWT token generation, verification, and FastAPI security dependencies.
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt
from fastapi import HTTPException, Header, status
from dotenv import load_dotenv

import database

load_dotenv()

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "yojanasetu_production_secure_signing_key_2026_dbt_gov")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
DEFAULT_EXPIRY_DAYS = 7
REMEMBER_ME_EXPIRY_DAYS = 30


def create_access_token(data: Dict[str, Any], remember_me: bool = False) -> str:
    """Encodes a signed JWT access token for authenticated citizen session."""
    to_encode = data.copy()
    expire_days = REMEMBER_ME_EXPIRY_DAYS if remember_me else DEFAULT_EXPIRY_DAYS
    expire = datetime.now(timezone.utc) + timedelta(days=expire_days)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a signed JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def extract_token_from_header(authorization: Optional[str] = None) -> Optional[str]:
    """Extracts raw JWT string from Authorization Bearer header."""
    if not authorization:
        return None
    parts = authorization.strip().split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    elif len(parts) == 1:
        return parts[0]
    return None


def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """FastAPI dependency to optionally retrieve citizen if Bearer token is provided."""
    token = extract_token_from_header(authorization)
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    user_id = payload["sub"]
    return database.get_user_by_id(user_id)


def get_current_user_required(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """FastAPI dependency requiring valid Bearer token authentication."""
    user = get_current_user_optional(authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in to continue.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
