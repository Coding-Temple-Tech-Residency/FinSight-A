from contextlib import asynccontextmanager
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.limiter import limiter

from app.core.config import get_settings
from app.core.database import Base, engine
from app.core.logging import logger, log_error
from app.models import user
from app.models import portfolio
from app.api.v1.router import router as api_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"{settings.app_name} starting in {settings.environment} mode")
    Base.metadata.create_all(bind=engine)
    yield
    logger.info(f"{settings.app_name} shutting down")


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="AI-Powered Investment Intelligence Platform",
    lifespan=lifespan,
)

# Attach the rate limiter to the app and register the 429 handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# "testserver" is required for FastAPI TestClient (pytest) to work
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "testserver", "*.render.com", "*.vercel.app"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
    max_age=settings.cors_max_age,
)


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000
        logger.info(
            f"{request.method} {request.url.path} - {response.status_code}",
            extra={"method": request.method, "path": request.url.path, "status": response.status_code, "duration_ms": round(duration_ms, 2)}
        )
        return response

app.add_middleware(LoggingMiddleware)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"

    if settings.environment == "development":
        response.headers["Content-Security-Policy"] = "default-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fastapi.tiangolo.com"
    else:
        response.headers["Content-Security-Policy"] = "default-src 'self'; style-src 'self' https://cdn.jsdelivr.net; script-src 'self' https://cdn.jsdelivr.net"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response


class InputValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get('content-length')
        if content_length and int(content_length) / (1024 * 1024) > settings.max_request_size_mb:
            return JSONResponse(status_code=413, content={"detail": "Request entity too large"})
        return await call_next(request)

app.add_middleware(InputValidationMiddleware)

app.include_router(api_router)

@app.get("/")
def root():
    return {"app": settings.app_name, "status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/security-headers")
def check_security_headers():
    if settings.environment == "production":
        return JSONResponse(status_code=403, content={"detail": "Not available in production"})
    return {"cors_enabled": True, "logging_enabled": True, "csp_mode": settings.environment}

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    log_error(exc, "request_validation")
    return JSONResponse(status_code=422, content={"detail": "Invalid request data"})
