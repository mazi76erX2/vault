from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from gotrue import UserResponse

from app.database import supabase
from app.dto.expert import AcceptDocumentRequest, Document, DocumentRow, RejectRequest
from app.middleware.auth import verify_token

router = APIRouter(prefix="/api/v1/expert", tags=["expert"])
logger = logging.getLogger(__name__)


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
    resp = supabase.table("profiles").select("id, fullname").eq("companyid", companyid).execute()
    m: dict[str, str] = {}
    for p in resp.data or []:
        pid = p.get("id")
        if pid:
            m[str(pid)] = p.get("fullname") or "NA"
    return m


@router.get("/get-documents", response_model=list[Document])
async def expertstartgetdocuments(
    user: UserResponse = Depends(verify_token),
) -> list[Document]:
    """
    ExpertStartPage: documents assigned to expert for review (status On Review, reviewer == current user).
    """
    userid = _uid(user)
    companyid = _companyid_for_user(userid)
    usermap = _profiles_map(companyid)

    docs = (
        supabase.table("documents")
        .select("docid, title, authorid, status")
        .eq("status", "On Review")
        .eq("companyid", companyid)
        .eq("reviewer", userid)
        .execute()
    ).data or []

    return [
        Document(
            id=d.get("docid"),
            title=d.get("title") or "Untitled",
            author=usermap.get(str(d.get("authorid")), "NA"),
            status=d.get("status") or "On Review",
        )
        for d in docs
    ]


@router.get("/get-document/{documentid}")
async def expertdocgetdocument(
    documentid: str, user: UserResponse = Depends(verify_token)
) -> dict[str, Any]:
    """
    ExpertDocPage: fetch full doc fields needed by UI.
    """
    userid = _uid(user)
    companyid = _companyid_for_user(userid)

    resp = (
        supabase.table("documents")
        .select("*")
        .eq("docid", documentid)
        .eq("companyid", companyid)
        .maybe_single()
        .execute()
    )
    doc = resp.data
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Ensure expert is the reviewer for this doc
    if str(doc.get("reviewer")) != userid:
        raise HTTPException(status_code=403, detail="Not allowed to access this document")

    return {
        "tags": doc.get("tags"),
        "comment": doc.get("comment"),
        "summary": doc.get("summary"),
        "link": doc.get("link"),
        "title": doc.get("title"),
        "severitylevels": doc.get("severitylevels"),
        "docid": doc.get("docid"),
        "status": doc.get("status"),
    }


@router.post("/accept-document")
async def expertdocacceptdocument(
    payload: AcceptDocumentRequest, user: UserResponse = Depends(verify_token)
) -> dict[str, Any]:
    """
    Expert accepts: move to 'Validated - Awaiting Approval' (per your existing dump).
    """
    userid = _uid(user)
    companyid = _companyid_for_user(userid)

    updatedata: dict[str, Any] = {
        "comment": payload.comment,
        "status": "Validated - Awaiting Approval",
        "summary": payload.summary,
    }
    if payload.severitylevels:
        updatedata["severitylevels"] = payload.severitylevels

    resp = (
        supabase.table("documents")
        .update(updatedata)
        .eq("docid", payload.docid)
        .eq("companyid", companyid)
        .eq("reviewer", userid)
        .execute()
    )

    if resp.data is None:
        raise HTTPException(status_code=500, detail="Failed to update document")

    return {"message": "Document updated successfully", "data": resp.data}


@router.put("/reject-document")
async def expertdocrejectdocument(
    rejectrequest: RejectRequest, user: UserResponse = Depends(verify_token)
) -> dict[str, Any]:
    """
    Expert rejects: status = Rejected, keep summary/comment.
    """
    userid = _uid(user)
    companyid = _companyid_for_user(userid)

    updatefields: dict[str, Any] = {
        "comment": rejectrequest.comment,
        "status": "Rejected",
        "summary": rejectrequest.summary,
    }
    if rejectrequest.reviewer:
        updatefields["reviewer"] = rejectrequest.reviewer
    if rejectrequest.severitylevels:
        updatefields["severitylevels"] = rejectrequest.severitylevels

    resp = (
        supabase.table("documents")
        .update(updatefields)
        .eq("docid", rejectrequest.docid)
        .eq("companyid", companyid)
        .eq("reviewer", userid)
        .execute()
    )

    if resp.data is None:
        raise HTTPException(status_code=500, detail="Failed to reject document")

    return {"message": "Document successfully rejected", "data": resp.data}


@router.get("/completed-documents/{reviewerid}")
async def expertdocpreviousreviewsdocuments(
    reviewerid: str, user: UserResponse = Depends(verify_token)
) -> list[dict[str, Any]]:
    """
    ExpertPreviousReviewsPage: completed docs for an expert reviewer (from your dump).
    Returns array: [{ id, title, author, status }]
    """
    userid = _uid(user)
    companyid = _companyid_for_user(userid)
    profiles = _profiles_map(companyid)

    docs = (
        supabase.table("documents")
        .select("docid, title, authorid, status")
        .in_(
            "status",
            ["Rejected", "Validated - Stored", "Validated - Awaiting Approval"],
        )
        .eq("companyid", companyid)
        .eq("reviewer", reviewerid)
        .execute()
    ).data or []

    return [
        {
            "id": d.get("docid"),
            "title": d.get("title") or "Untitled",
            "author": profiles.get(str(d.get("authorid")), "NA"),
            "status": d.get("status") or "NA",
        }
        for d in docs
    ]


@router.get("/review-documents", response_model=list[DocumentRow])
async def validatorstartexpertreviewdocuments(
    user: UserResponse = Depends(verify_token),
) -> list[DocumentRow]:
    """
    ValidatorStartExpertReviewPage: show documents currently On Review where this validator is responsible.
    (This endpoint exists in your dump under the expert router.)
    """
    userid = _uid(user)
    companyid = _companyid_for_user(userid)
    profilemap = _profiles_map(companyid)

    docs = (
        supabase.table("documents")
        .select("docid, title, reviewer, status")
        .in_("status", ["On Review"])
        .eq("responsible", userid)
        .eq("companyid", companyid)
        .execute()
    ).data or []

    return [
        DocumentRow(
            id=d.get("docid"),
            title=d.get("title") or "Untitled",
            reviewer=profilemap.get(str(d.get("reviewer")), "NA"),
            status=d.get("status") or "On Review",
        )
        for d in docs
    ]
