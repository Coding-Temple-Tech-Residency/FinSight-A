from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings. Loaded automatically from .env file."""

    # App
    app_name: str = "FinSight"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"

    # Database
    database_url: str

    # JWT
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60

    # External APIs (Sprint 2)
    alpha_vantage_api_key: str = ""
    groq_api_key: str = ""

    # CORS
    frontend_origin: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    """Cached singleton — .env is read once at app startup."""
    return Settings()