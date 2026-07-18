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
    
    # Security (Sprint 3)
    cors_allow_credentials: bool = True
    cors_allow_methods: list = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    cors_allow_headers: list = ["Content-Type", "Authorization"]
    cors_max_age: int = 3600
    
    # HTTPS/Security
    force_https: bool = False  # Set to True in production
    secure_cookies: bool = False  # Set to True in production
    same_site_cookies: str = "lax"  # lax, strict, or none
    
    # Rate Limiting
    rate_limit_enabled: bool = False
    rate_limit_requests_per_minute: int = 100
    rate_limit_requests_per_hour: int = 1000
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"  # json or text
    
    # Input Validation
    max_request_size_mb: int = 10
    password_min_length: int = 8

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    """Cached singleton — .env is read once at app startup."""
    return Settings()
