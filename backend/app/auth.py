"""Authentication utilities for extracting user from Supabase JWT tokens."""

import os
from typing import Optional
import jwt
from fastapi import Header, HTTPException

# Get Supabase JWT secret from environment
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

def get_user_id_from_token(authorization: Optional[str] = Header(None)) -> str:
    """
    Extract user_id from Supabase JWT token in Authorization header.
    
    Args:
        authorization: Authorization header value (Bearer <token>)
        
    Returns:
        user_id: UUID string of the authenticated user
        
    Raises:
        HTTPException: If token is missing, invalid, or expired
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # Decode JWT token
        # Supabase uses HS256 algorithm
        if not SUPABASE_JWT_SECRET:
            print("ERROR: SUPABASE_JWT_SECRET is not set!")
            raise HTTPException(status_code=500, detail="Server configuration error")
        
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}  # Supabase doesn't use aud claim
        )
        
        # Extract user ID from 'sub' claim
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing user ID")
        
        print(f"✅ Authenticated user: {user_id}")
        return user_id
        
    except jwt.ExpiredSignatureError:
        print("❌ Token expired")
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        print(f"❌ Invalid token: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    FastAPI dependency to get current user ID from request.
    
    Usage:
        @app.get("/endpoint")
        async def endpoint(user_id: str = Depends(get_current_user_id)):
            # user_id is automatically extracted from JWT
            pass
    """
    return get_user_id_from_token(authorization)
