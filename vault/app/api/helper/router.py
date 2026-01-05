import logging

from fastapi import APIRouter, Depends

from app.services.auth_service import require_roles

router = APIRouter(prefix="/api/v1/helper", tags=["helper"])

logger = logging.getLogger(__name__)


@router.post("/health_check", dependencies=[Depends(require_roles(["Helper"]))])
async def helper_health_check():
    """
    Check if the helper API is up and running.
    """
    return {"status": "ok", "message": "Helper API is running"}


@router.post("/questions", dependencies=[Depends(require_roles(["Helper"]))])
async def get_helper_questions(data: dict):
    """
    Endpoint to get helper questions from the database.
    """
