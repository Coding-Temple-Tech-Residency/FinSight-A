from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from typing import Literal


class ProfileResponse(BaseModel):
    """Full profile: user identity + current settings."""
    id: str
    email: str
    created_at: datetime
    theme: str
    is_day_trader: bool
    ai_refresh_interval_seconds: int

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    """All fields optional — PATCH semantics."""
    theme: Optional[Literal["light", "dark", "system"]] = None
    is_day_trader: Optional[bool] = None
    ai_refresh_interval_seconds: Optional[int] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "theme": "dark",
                "is_day_trader": True,
                "ai_refresh_interval_seconds": 900,
            }
        }
    }
