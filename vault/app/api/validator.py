from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from gotrue import UserResponse

from app.database import supabase
from app.dto.validator import (
    AcceptDocumentRequest,
    DelegateRequest,
    DocumentFetchRequest,
    RejectDocumentRequest,
)
from app.middleware.auth import verify_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/validator", tags=["validator"])


def _uid(user: UserResponse) -> str:
    uid = getattr(getattr(user, "user", None), "id", None)
    if not uid:
        raise HTTPException(status_code=400, detail="Missing user id")
    return str(uid)


def _companyid_for_user(userid: str) -> int:
    resp = supabase.table("profiles").select("companyid").eq("id", userid).maybe_single().execute()
    data = resp.data or {}
    companyid = data.get("companyid")
    if not companyid:
        raise HTTPException(
            status_code=400,
            detail="User does not have a company associated with their profile",
        )
    return int(companyid)


def _profiles_map(companyid: int) -> dict[str, str]:
    # Map userId -> fullname for display
    resp = supabase.table("profiles").select("id, fullname").eq("companyid", companyid).execute()
    m: dict[str, str] = {}
    for row in resp.data or []:
        pid = row.get("id")
        if pid:
            m[str(pid)] = row.get("fullname") or "NA"
    return m


def _parse_dt(s: str | None) -> datetime | None:
    if not s:
        return None
    try:
        # Handle "Z"
        s2 = s.replace("Z", "+00:00")
        dt = datetime.fromisoformat(s2)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=UTC)
        return dt
    except Exception:
        return None


@router.get("/get-documents")
async def get_documents(
    userid: str = Query(...),
    user: UserResponse = Depends(verify_token),
) -> dict[str, Any]:
    """
    UI expects: { documents: [{ id, title, author, status }] }
    """
    token_uid = _uid(user)
    if userid != token_uid:
        raise HTTPException(status_code=403, detail="userid does not match token user")

    companyid = _companyid_for_user(token_uid)
    usermap = _profiles_map(companyid)

    # Documents awaiting validator action
    docs = (
        supabase.table("documents")
        .select("docid, title, authorid, status")
        .eq("companyid", companyid)
        .eq("responsible", token_uid)
        .in_("status", ["Pending", "Validated - Awaiting Approval"])
        .execute()
    ).data or []

    rows = [
        {
            "id": d.get("docid"),
            "title": d.get("title") or "Untitled",
            "author": usermap.get(str(d.get("authorid")), "NA"),
            "status": d.get("status") or "NA",
        }
        for d in docs
    ]
    return {"documents": rows}


@router.get("/completed-documents")
async def completed_documents(
    user: UserResponse = Depends(verify_token),
) -> list[dict[str, Any]]:
    """
    UI expects: an array: [{ id, title, author, status }]
    """
    token_uid = _uid(user)
    companyid = _companyid_for_user(token_uid)
    usermap = _profiles_map(companyid)

    docs = (
        supabase.table("documents")
        .select("docid, title, authorid, status")
        .eq("companyid", companyid)
        .eq("responsible", token_uid)
        .in_("status", ["Rejected", "Validated - Stored"])
        .execute()
    ).data or []

    return [
        {
            "id": d.get("docid"),
            "title": d.get("title") or "Untitled",
            "author": usermap.get(str(d.get("authorid")), "NA"),
            "status": d.get("status") or "NA",
        }
        for d in docs
    ]


@router.post("/fetchdocumentbyid")
async def fetch_document_by_id(
    payload: DocumentFetchRequest,
    user: UserResponse = Depends(verify_token),
) -> dict[str, Any]:
    """
    UI expects: { document: { ... } }
    """
    token_uid = _uid(user)
    companyid = _companyid_for_user(token_uid)

    doc = (
        supabase.table("documents")
        .select("*")
        .eq("companyid", companyid)
        .eq("docid", str(payload.documentid))
        .maybe_single()
        .execute()
    ).data

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Optional: enforce validator owns it OR it is part of their workflow
    # (responsible == validator OR status is review/completed and responsible == validator)
    if str(doc.get("responsible")) != token_uid:
        raise HTTPException(status_code=403, detail="Not allowed to access this document")

    return {"document": doc}


@router.post("/accept-document")
async def accept_document(
    payload: AcceptDocumentRequest,
    user: UserResponse = Depends(verify_token),
) -> dict[str, Any]:
    token_uid = _uid(user)
    companyid = _companyid_for_user(token_uid)

    updatedata: dict[str, Any] = {
        "status": payload.status or "Validated - Stored",
    }
    if payload.comment is not None:
        updatedata["comment"] = payload.comment
    if payload.summary is not None:
        updatedata["summary"] = payload.summary
    if payload.severitylevels:
        updatedata["severitylevels"] = payload.severitylevels

    resp = (
        supabase.table("documents")
        .update(updatedata)
        .eq("companyid", companyid)
        .eq("docid", payload.docid)
        .eq("responsible", token_uid)
        .execute()
    )

    if resp.data is None:
        raise HTTPException(status_code=500, detail="Failed to update document")

    return {"message": "Document updated successfully", "data": resp.data}


@router.post("/reject-document")
async def reject_document(
    payload: RejectDocumentRequest,
    user: UserResponse = Depends(verify_token),
) -> dict[str, Any]:
    token_uid = _uid(user)
    companyid = _companyid_for_user(token_uid)

    updatefields: dict[str, Any] = {
        "comment": payload.comment,
        "summary": payload.summary,
        "status": "Rejected",
    }
    if payload.reviewer:
        updatefields["reviewer"] = payload.reviewer
    if payload.severitylevels:
        updatefields["severitylevels"] = payload.severitylevels

    resp = (
        supabase.table("documents")
        .update(updatefields)
        .eq("companyid", companyid)
        .eq("docid", payload.docid)
        .eq("responsible", token_uid)
        .execute()
    )

    if resp.data is None:
        raise HTTPException(status_code=500, detail="Failed to reject document")

    return {"message": "Document successfully rejected", "data": resp.data}


@router.post("/delegate-document")
async def delegate_document(
    payload: DelegateRequest,
    user: UserResponse = Depends(verify_token),
) -> dict[str, Any]:
    """
    Delegate to an expert:
      - keep 'responsible' as the validator (so it returns to them)
      - set 'reviewer' to the expert (expert router filters reviewer + On Review)
      - set status to On Review
    """
    token_uid = _uid(user)
    companyid = _companyid_for_user(token_uid)

    if payload.delegatorid != token_uid:
        raise HTTPException(status_code=403, detail="delegatorid does not match token user")

    updatefields: dict[str, Any] = {
        "comment": payload.comment,
        "summary": payload.summary,
        "status": payload.status or "On Review",
        "reviewer": payload.assigneeid,
        # responsible remains token_uid
    }
    if payload.severitylevels:
        updatefields["severitylevels"] = payload.severitylevels

    resp = (
        supabase.table("documents")
        .update(updatefields)
        .eq("companyid", companyid)
        .eq("docid", payload.docid)
        .eq("responsible", token_uid)
        .execute()
    )

    if resp.data is None:
        raise HTTPException(status_code=500, detail="Failed to delegate document")

    return {"message": "Document successfully delegated!", "data": resp.data}


@router.post("/fetchdelegators")
async def fetch_delegators(
    data: dict[str, Any],
    user: UserResponse = Depends(verify_token),
) -> dict[str, Any]:
    """
    UI expects: { delegators: [{ id, fullName }] }
    """
    token_uid = _uid(user)
    userid = data.get("userid")
    if not userid or userid != token_uid:
        raise HTTPException(status_code=403, detail="userid does not match token user")

    companyid = _companyid_for_user(token_uid)

    # Prefer "isExpert" (if column exists), else fallback to all profiles in company except self.
    delegators: list[dict[str, Any]] = []
    try:
        resp = (
            supabase.table("profiles")
            .select("id, fullname")
            .eq("companyid", companyid)
            .eq("isExpert", True)
            .execute()
        )
        rows = resp.data or []
        delegators = [
            {"id": r["id"], "fullName": r.get("fullname") or "NA"}
            for r in rows
            if r.get("id") and str(r["id"]) != token_uid
        ]
    except Exception:
        resp = (
            supabase.table("profiles").select("id, fullname").eq("companyid", companyid).execute()
        )
        rows = resp.data or []
        delegators = [
            {"id": r["id"], "fullName": r.get("fullname") or "NA"}
            for r in rows
            if r.get("id") and str(r["id"]) != token_uid
        ]

    return {"delegators": delegators}


@router.post("/fetchassigneddocuments")
async def fetch_assigned_documents(
    data: dict[str, Any],
    user: UserResponse = Depends(verify_token),
) -> dict[str, Any]:
    """
    Validator summary page expects: { documents: [{ id, title, status }] }
    """
    token_uid = _uid(user)
    validatorid = data.get("validatorid")
    if not validatorid or validatorid != token_uid:
        raise HTTPException(status_code=403, detail="validatorid does not match token user")

    companyid = _companyid_for_user(token_uid)

    docs = (
        supabase.table("documents")
        .select("docid, title, status")
        .eq("companyid", companyid)
        .eq("responsible", token_uid)
        .in_("status", ["Pending", "On Review", "Validated - Awaiting Approval"])
        .execute()
    ).data or []

    return {
        "documents": [
            {
                "id": d.get("docid"),
                "title": d.get("title") or "Untitled",
                "status": d.get("status") or "NA",
            }
            for d in docs
        ]
    }


@router.get("/getstats")
async def get_stats(user: UserResponse = Depends(verify_token)) -> dict[str, Any]:
    """
    UI expects snakecase keys:
      { totalassigned, totalcompleted, averagereviewtime }
    """
    token_uid = _uid(user)
    companyid = _companyid_for_user(token_uid)

    docs = (
        supabase.table("documents")
        .select("status, createdat, updatedat")
        .eq("companyid", companyid)
        .eq("responsible", token_uid)
        .execute()
    ).data or []

    total_assigned = 0
    total_completed = 0
    durations_hours: list[float] = []

    for d in docs:
        st = d.get("status") or ""
        if st in ("Pending", "On Review", "Validated - Awaiting Approval"):
            total_assigned += 1
        if st in ("Rejected", "Validated - Stored"):
            total_completed += 1
            c = _parse_dt(d.get("createdat"))
            u = _parse_dt(d.get("updatedat"))
            if c and u and u >= c:
                durations_hours.append((u - c).total_seconds() / 3600.0)

    avg = (sum(durations_hours) / len(durations_hours)) if durations_hours else 0.0

    return {
        "totalassigned": total_assigned,
        "totalcompleted": total_completed,
        "averagereviewtime": round(avg, 2),
    }
