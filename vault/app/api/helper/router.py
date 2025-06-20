from typing import Dict, List, Optional, Any, Union
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from app.database import supabase
from app.services.auth_service import get_current_user, require_roles
import json
import logging

router = APIRouter(prefix="/api/v1/helper", tags=["helper"])

logger = logging.getLogger(__name__)


@router.post("/health_check", dependencies=[Depends(require_roles(["Helper"]))])
async def helper_health_check():
    """
    Check if the helper API is up and running.
    """
    return {"status": "ok", "message": "Helper API is running"}


@router.post("/questions", dependencies=[Depends(require_roles(["Helper"]))])
async def get_helper_questions(data: Dict):
    """
    Endpoint to get helper questions from the database.
    """
