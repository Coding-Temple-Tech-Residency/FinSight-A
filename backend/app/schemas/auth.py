from datetime import datetime
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


class UserLogin(BaseModel):
    """Payload for POST /login."""
    email: EmailStr
    password: str


# -------- Response schemas (outgoing to frontend) --------

class UserResponse(BaseModel):
    """User data returned to client. NEVER includes password_hash."""
    id: str
    email: EmailStr
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """JWT token returned after successful login or signup."""
    access_token: str
    token_type: str = "bearer"