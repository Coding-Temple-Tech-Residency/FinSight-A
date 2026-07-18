from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# -------- Request schemas (incoming from frontend) --------

class UserSignup(BaseModel):
    """Payload for POST /signup."""
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=72,  # bcrypt limit
        description="Password (min 8 chars, max 72 bytes)",
    )
    first_name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="First name (optional)"
    )
    last_name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Last name (optional)"
    )
    username: Optional[str] = Field(
        None,
        min_length=3,
        max_length=50,
        pattern="^[A-Za-z0-9_]+$",
        description="Username (letters, digits, underscores only; optional)",
    )


class UserLogin(BaseModel):
    """Payload for POST /login."""
    email: EmailStr
    password: str


class UserProfileUpdate(BaseModel):
    """Payload for updating profile fields (PATCH /me or similar)."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    username: Optional[str] = Field(
        None, min_length=3, max_length=50, pattern="^[A-Za-z0-9_]+$"
    )


# -------- Response schemas (outgoing to frontend) --------

class UserResponse(BaseModel):
    """User data returned to client. NEVER includes password_hash."""
    id: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """JWT token returned after successful login or signup."""
    access_token: str
    token_type: str = "bearer"
