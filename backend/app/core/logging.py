"""
Structured logging configuration for FinSight.
Uses python-json-logger for JSON formatted logs.
"""
import logging
import json
from pythonjsonlogger import jsonlogger
from app.core.config import get_settings

settings = get_settings()


def setup_logging():
    """Configure structured logging with JSON format."""
    
    # Create logger
    logger = logging.getLogger("finsight")
    logger.setLevel(getattr(logging, settings.log_level))
    
    # Remove existing handlers
    logger.handlers = []
    
    # Console handler with JSON formatter
    console_handler = logging.StreamHandler()
    
    if settings.log_format == "json":
        formatter = jsonlogger.JsonFormatter(
            fmt="%(timestamp)s %(level)s %(name)s %(message)s",
            timestamp=True
        )
    else:
        # Text format for development
        formatter = logging.Formatter(
            fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
    
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    return logger


# Global logger instance
logger = setup_logging()


def log_request(method: str, path: str, user_id: str = None):
    """Log incoming request (non-sensitive data only)."""
    logger.info(
        f"Request",
        extra={
            "method": method,
            "path": path,
            "user_id": user_id,
            "event": "request_received"
        }
    )


def log_error(error: Exception, context: str = None):
    """Log error with context."""
    logger.error(
        f"Error: {str(error)}",
        extra={
            "error_type": type(error).__name__,
            "context": context,
            "event": "error_occurred"
        },
        exc_info=True
    )


def log_api_call(service: str, method: str, status: int, duration_ms: float):
    """Log external API calls."""
    logger.info(
        f"API Call",
        extra={
            "service": service,
            "method": method,
            "status": status,
            "duration_ms": duration_ms,
            "event": "external_api_call"
        }
    )
