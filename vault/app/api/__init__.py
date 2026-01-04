"""
API routers aggregation.
"""

from app.api.admin import router as admin_router
from app.api.auth import router as auth_router
from app.api.collector import router as collector_router
from app.api.companies import router as companies_router
from app.api.expert import router as expert_router
from app.api.helper import router as helper_router
from app.api.knowledge_base import router as kb_router
from app.api.passwords import router as passwords_router
from app.api.user import router as users_router
from app.api.utils import router as utils_router
from app.api.validator import router as validator_router
from app.api.websocket import router as websocket_router

__all__ = [
    "auth_router",
    "users_router",
    "admin_router",
    "companies_router",
    "kb_router",
    "passwords_router",
    "websocket_router",
    "utils_router",
    "collector_router",
    "helper_router",
    "expert_router",
    "validator_router",
]
