from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import Base, engine
from app.models import user  # noqa: F401 — register model with Base
from app.models import portfolio  # noqa: F401 — register portfolio models
from app.models import user_settings  # noqa: F401 — register user settings model
from app.models import watchlist  # noqa: F401 — register watchlist model
from app.api.v1.router import router as api_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Code that runs on app startup and shutdown."""
    # Startup
    print(f"{settings.app_name} starting in {settings.environment} mode")
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    print(f"{settings.app_name} shutting down")


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="AI-Powered Investment Intelligence Platform",
    lifespan=lifespan,
)

# CORS — allow frontend (Vercel / localhost) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(api_router)

@app.get("/")
def root():
    return {"app": settings.app_name, "status": "ok"}


@app.get("/health")
def health_check():
    """Health check endpoint for Render uptime monitoring."""
    return {"status": "healthy"}