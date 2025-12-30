from __future__ import annotations

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException
from gotrue import UserResponse

from app.database import supabase
from app.middleware.auth import verifytoken
from app.services.authservice import requireroles 
from app.chat import generateresponsehelper

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/helper", tags=["helper"])


def _require_key(d: Dict[str, Any], k: str) -> Any:
    v = d.get(k)
    if v is None or v == "":
        raise HTTPException(status_code=400, detail=f"Missing {k}")
    return v


@router.post("/healthcheck", dependencies=[Depends(requireroles("Helper"))])
async def helper_healthcheck() -> Dict[str, str]:
    return {"status": "ok", "message": "Helper API is running"}


@router.post("/addnewchatsession")
async def addnewchatsession(data: Dict[str, Any], user: UserResponse = Depends(verifytoken)) -> Dict[str, Any]:
    userid = _require_key(data, "userid")
    if str(userid) != str(user.user.id):
        raise HTTPException(status_code=403, detail="userid does not match token user")

    try:
        resp = supabase.table("chatmessageshelper").insert({"userid": userid}).execute()
        if not resp.data:
            raise HTTPException(status_code=500, detail
