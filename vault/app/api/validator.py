"""
Validator endpoints - migrated from Supabase to SQLAlchemy.
Handles document validation workflow.
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_db
from app.dto.validator import (
    AcceptDocumentRequest,
    DelegateRequest,
    DocumentFetchRequest,
    RejectDocumentRequest,
)
from app.middleware.auth import verify_token_with_tenant
from app.models import Document, Profile

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/validator", tags=["validator"])


def parse_dt(s: str | None) -> datetime | None:
    """Parse ISO datetime string."""
    if not s:
        return None
    try:
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
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """
    Get documents awaiting validator action (status: Pending, Validated - Awaiting Approval).
    """
    token_uid = current_user["user_id"]
    company_reg_no = current_user.get("company_reg_no")

    if userid != token_uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="userid does not match token user",
        )

    try:
        # Get user map
        stmt = select(Profile.id, Profile.full_name).where(Profile.company_reg_no == company_reg_no)
        result = await db.execute(stmt)
        profiles = result.all()
        user_map = {str(p.id): p.full_name or "N/A" for p in profiles}

        # Get documents
        stmt = select(Document).where(
            Document.responsible == token_uid,
            Document.status.in_(["Pending", "Validated - Awaiting Approval"]),
        )
        result = await db.execute(stmt)
        docs = result.scalars().all()

        rows = [
            {
                "id": str(d.doc_id),
                "title": d.title or "Untitled",
                "author": user_map.get(str(d.author_id), "N/A"),
                "status": d.status or "N/A",
            }
            for d in docs
        ]

        return {"documents": rows}

    except Exception as e:
        logger.error(f"Error fetching validator documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e


@router.get("/completed-documents")
async def completed_documents(
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> list[dict[str, Any]]:
    """
    Get completed documents for validator (status: Rejected, Validated - Stored).
    """
    token_uid = current_user["user_id"]
    company_reg_no = current_user.get("company_reg_no")

    try:
        # Get user map
        stmt = select(Profile.id, Profile.full_name).where(Profile.company_reg_no == company_reg_no)
        result = await db.execute(stmt)
        profiles = result.all()
        user_map = {str(p.id): p.full_name or "N/A" for p in profiles}

        # Get documents
        stmt = select(Document).where(
            Document.responsible == token_uid,
            Document.status.in_(["Rejected", "Validated - Stored"]),
        )
        result = await db.execute(stmt)
        docs = result.scalars().all()

        return [
            {
                "id": str(d.doc_id),
                "title": d.title or "Untitled",
                "author": user_map.get(str(d.author_id), "N/A"),
                "status": d.status or "N/A",
            }
            for d in docs
        ]

    except Exception as e:
        logger.error(f"Error fetching completed documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e


@router.post("/fetch_document_by_id")
async def fetch_document_by_id(
    payload: DocumentFetchRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """
    Fetch document by ID with access control.
    """
    token_uid = current_user["user_id"]

    try:
        # Get document
        stmt = select(Document).where(Document.doc_id == str(payload.document_id))
        result = await db.execute(stmt)
        doc = result.scalar_one_or_none()

        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found",
            )

        # Ensure validator has access
        if str(doc.responsible) != token_uid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to access this document",
            )

        return {
            "document": {
                "doc_id": str(doc.doc_id),
                "title": doc.title,
                "summary": doc.summary,
                "comment": getattr(doc, "comment", None),
                "status": doc.status,
                "severity_levels": doc.severity_levels,
                "tags": getattr(doc, "tags", []),
                "link": doc.link,
                "responsible": str(doc.responsible) if doc.responsible else None,
                "reviewer": str(doc.reviewer) if doc.reviewer else None,
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e


@router.post("/accept-document")
async def accept_document(
    payload: AcceptDocumentRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """
    Validator accepts document - status = 'Validated - Stored'.
    """
    token_uid = current_user["user_id"]

    try:
        # Get document
        stmt = select(Document).where(
            Document.doc_id == payload.docid,
            Document.responsible == token_uid,
        )
        result = await db.execute(stmt)
        doc = result.scalar_one_or_none()

        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or not assigned to you",
            )

        # Update document
        doc.status = payload.status or "Validated - Stored"
        if payload.comment is not None:
            doc.comment = payload.comment
        if payload.summary is not None:
            doc.summary = payload.summary
        if payload.severitylevels:
            doc.severity_levels = payload.severitylevels

        await db.commit()
        await db.refresh(doc)

        return {
            "message": "Document updated successfully",
            "data": {
                "doc_id": str(doc.doc_id),
                "status": doc.status,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error accepting document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update document",
        ) from e


@router.post("/reject-document")
async def reject_document(
    payload: RejectDocumentRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """
    Validator rejects document - status = 'Rejected'.
    """
    token_uid = current_user["user_id"]

    try:
        # Get document
        stmt = select(Document).where(
            Document.doc_id == payload.docid,
            Document.responsible == token_uid,
        )
        result = await db.execute(stmt)
        doc = result.scalar_one_or_none()

        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or not assigned to you",
            )

        # Update document
        doc.comment = payload.comment
        doc.summary = payload.summary
        doc.status = "Rejected"

        if payload.reviewer:
            doc.reviewer = payload.reviewer
        if payload.severitylevels:
            doc.severity_levels = payload.severitylevels

        await db.commit()
        await db.refresh(doc)

        return {
            "message": "Document successfully rejected",
            "data": {
                "doc_id": str(doc.doc_id),
                "status": doc.status,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error rejecting document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reject document",
        ) from e


@router.post("/delegate-document")
async def delegate_document(
    payload: DelegateRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """
    Delegate document to an expert - status = 'On Review'.
    Validator remains responsible, expert becomes reviewer.
    """
    token_uid = current_user["user_id"]

    if payload.delegator_id != token_uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="delegator_id does not match token user",
        )

    try:
        # Get document
        stmt = select(Document).where(
            Document.doc_id == payload.docid,
            Document.responsible == token_uid,
        )
        result = await db.execute(stmt)
        doc = result.scalar_one_or_none()

        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or not assigned to you",
            )

        # Update document
        doc.comment = payload.comment
        doc.summary = payload.summary
        doc.status = payload.status or "On Review"
        doc.reviewer = payload.assignee_id  # Expert
        # doc.responsible remains token_uid (validator)

        if payload.severitylevels:
            doc.severity_levels = payload.severitylevels

        await db.commit()
        await db.refresh(doc)

        return {
            "message": "Document successfully delegated!",
            "data": {
                "doc_id": str(doc.doc_id),
                "status": doc.status,
                "reviewer": str(doc.reviewer),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error delegating document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delegate document",
        ) from e


@router.get("/get_stats")
async def get_stats(
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """
    Get validator statistics: total assigned, completed, average review time.
    """
    token_uid = current_user["user_id"]

    try:
        # Get all documents for this validator
        stmt = select(Document).where(Document.responsible == token_uid)
        result = await db.execute(stmt)
        docs = result.scalars().all()

        total_assigned = 0
        total_completed = 0
        durations_hours = []

        for d in docs:
            st = d.status or ""
            if st in ["Pending", "On Review", "Validated - Awaiting Approval"]:
                total_assigned += 1
            if st in ["Rejected", "Validated - Stored"]:
                total_completed += 1

            c = parse_dt(d.created_at.isoformat() if d.created_at else None)
            u = parse_dt(d.updated_at.isoformat() if d.updated_at else None)

            if c and u and u > c:
                durations_hours.append((u - c).total_seconds() / 3600.0)

        avg = sum(durations_hours) / len(durations_hours) if durations_hours else 0.0

        return {
            "total_assigned": total_assigned,
            "total_completed": total_completed,
            "average_review_time": round(avg, 2),
        }

    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e


@router.post("/fetch_delegators")
async def fetch_delegators(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """
    Fetch list of experts (delegators) for delegation.
    """
    token_uid = current_user["user_id"]
    company_reg_no = current_user.get("company_reg_no")

    userid = data.get("user_id")
    if not userid or userid != token_uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="userid does not match token user",
        )

    delegators = []

    try:
        # Try to get experts (isExpert = True)
        try:
            stmt = select(Profile.id, Profile.full_name).where(
                Profile.company_reg_no == company_reg_no,
                Profile.is_expert == True,  # noqa: E712
            )
            result = await db.execute(stmt)
            rows = result.all()

            delegators = [
                {"id": str(r.id), "fullName": r.full_name or "N/A"}
                for r in rows
                if r.id and str(r.id) != token_uid
            ]
        except Exception:
            # Fallback: all profiles except self
            stmt = select(Profile.id, Profile.full_name).where(
                Profile.company_reg_no == company_reg_no
            )
            result = await db.execute(stmt)
            rows = result.all()

            delegators = [
                {"id": str(r.id), "fullName": r.full_name or "N/A"}
                for r in rows
                if r.id and str(r.id) != token_uid
            ]

        return {"delegators": delegators}

    except Exception as e:
        logger.error(f"Error fetching delegators: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e


@router.post("/fetch_assigned_documents")
async def fetch_assigned_documents(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """
    Fetch documents assigned to validator (summary view).
    """
    token_uid = current_user["user_id"]
    validator_id = data.get("validator_id")

    if not validator_id or validator_id != token_uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="validator_id does not match token user",
        )

    try:
        # Get assigned documents
        stmt = select(Document).where(
            Document.responsible == token_uid,
            Document.status.in_(["Pending", "On Review", "Validated - Awaiting Approval"]),
        )
        result = await db.execute(stmt)
        docs = result.scalars().all()

        return {
            "documents": [
                {
                    "id": str(d.doc_id),
                    "title": d.title or "Untitled",
                    "status": d.status or "N/A",
                }
                for d in docs
            ]
        }

    except Exception as e:
        logger.error(f"Error fetching assigned documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e
