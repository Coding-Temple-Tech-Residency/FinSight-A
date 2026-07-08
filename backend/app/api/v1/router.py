"""
API v1 router configuration.

Includes all v1 endpoints.
"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.portfolios import router as portfolios_router
from app.api.v1.watchlist import router as watchlist_router

router = APIRouter(prefix="/api/v1")

router.include_router(auth_router, tags=["auth"])
router.include_router(portfolios_router, tags=["portfolios"])
router.include_router(dashboard_router, tags=["dashboard"])
router.include_router(watchlist_router, tags=["watchlist"])