"""
Expert endpoints - migrated from Supabase to SQLAlchemy.
Handles document review workflow for expert reviewers.
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_db
from app.dto.expert import AcceptDocumentRequest
from app.dto.expert import Document as DocumentDTO
from app.dto.expert import DocumentRow, RejectRequest
from app.middleware.auth import verify_token_with_tenant
from app.models import Document, Profile

router = APIRouter(prefix="/api/v1/expert", tags=["expert"])
logger = logging.getLogger(__name__)


@router.get("/get-documents", response_model=list[DocumentDTO])
async def expert_get_documents(
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> list[DocumentDTO]:
    """
    Get documents assigned to expert for review (status = 'On Review').
    """
    user_id = current_user["user_id"]
    company_reg_no = current_user.get("company_reg_no")

    try:
        # Get user map for authors
        stmt = select(Profile.id, Profile.full_name).where(Profile.company_reg_no == company_reg_no)
        result = await db.execute(stmt)
        profiles = result.all()
        user_map = {str(p.id): p.full_name or "N/A" for p in profiles}

        # Get documents assigned to this expert
        stmt = select(Document).where(
            Document.status == "On Review",
            Document.reviewer == user_id,
        )
        result = await db.execute(stmt)
        docs = result.scalars().all()

        return [
            DocumentDTO(
                id=str(d.doc_id),
                title=d.title or "Untitled",
                author=user_map.get(str(d.author_id), "N/A"),
                status=d.status or "On Review",
            )
            for d in docs
        ]

    except Exception as e:
        logger.error(f"Error fetching expert documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e


@router.get("/get-document/{document_id}")
async def expert_get_document(
    document_id: str,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """
    Fetch full document details for expert review.
    """
    user_id = current_user["user_id"]
    current_user.get("company_reg_no")

    try:
        # Get document
        stmt = select(Document).where(Document.doc_id == document_id)
        result = await db.execute(stmt)
        doc = result.scalar_one_or_none()

        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found",
            )

        # Ensure expert is the reviewer
        if str(doc.reviewer) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to access this document",
            )

        return {
            "tags": getattr(doc, "tags", []),
            "comment": getattr(doc, "comment", None),
            "summary": doc.summary,
            "link": doc.link,
            "title": doc.title,
            "severitylevels": doc.severity_levels,
            "docid": str(doc.doc_id),
            "status": doc.status,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching document {document_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e


@router.post("/accept-document")
async def expert_accept_document(
    payload: AcceptDocumentRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """
    Expert accepts document - move to 'Validated - Awaiting Approval'.
    """
    user_id = current_user["user_id"]

    try:
        # Get document
        stmt = select(Document).where(
            Document.doc_id == payload.docid,
            Document.reviewer == user_id,
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
        doc.status = "Validated - Awaiting Approval"
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


@router.put("/reject-document")
async def expert_reject_document(
    reject_request: RejectRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """
    Expert rejects document - status = 'Rejected'.
    """
    user_id = current_user["user_id"]

    try:
        # Get document
        stmt = select(Document).where(
            Document.doc_id == reject_request.docid,
            Document.reviewer == user_id,
        )
        result = await db.execute(stmt)
        doc = result.scalar_one_or_none()

        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or not assigned to you",
            )

        # Update document
        doc.comment = reject_request.comment
        doc.status = "Rejected"
        doc.summary = reject_request.summary

        if reject_request.reviewer:
            doc.reviewer = reject_request.reviewer
        if reject_request.severitylevels:
            doc.severity_levels = reject_request.severitylevels

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


@router.get("/completed-documents/{reviewer_id}")
async def expert_completed_documents(
    reviewer_id: str,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> list[dict[str, Any]]:
    """
    Get completed documents for an expert reviewer.
    Returns documents with status: Rejected, Validated - Stored, Validated - Awaiting Approval.
    """
    company_reg_no = current_user.get("company_reg_no")

    try:
        # Get user map
        stmt = select(Profile.id, Profile.full_name).where(Profile.company_reg_no == company_reg_no)
        result = await db.execute(stmt)
        profiles = result.all()
        profile_map = {str(p.id): p.full_name or "N/A" for p in profiles}

        # Get completed documents
        stmt = select(Document).where(
            Document.status.in_(
                ["Rejected", "Validated - Stored", "Validated - Awaiting Approval"]
            ),
            Document.reviewer == reviewer_id,
        )
        result = await db.execute(stmt)
        docs = result.scalars().all()

        return [
            {
                "id": str(d.doc_id),
                "title": d.title or "Untitled",
                "author": profile_map.get(str(d.author_id), "N/A"),
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


@router.get("/review-documents", response_model=list[DocumentRow])
async def validator_expert_review_documents(
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> list[DocumentRow]:
    """
    For validators: show documents currently 'On Review' where validator is responsible.
    """
    user_id = current_user["user_id"]
    company_reg_no = current_user.get("company_reg_no")

    try:
        # Get profile map
        stmt = select(Profile.id, Profile.full_name).where(Profile.company_reg_no == company_reg_no)
        result = await db.execute(stmt)
        profiles = result.all()
        profile_map = {str(p.id): p.full_name or "N/A" for p in profiles}

        # Get documents
        stmt = select(Document).where(
            Document.status == "On Review",
            Document.responsible == user_id,
        )
        result = await db.execute(stmt)
        docs = result.scalars().all()

        return [
            DocumentRow(
                id=str(d.doc_id),
                title=d.title or "Untitled",
                reviewer=profile_map.get(str(d.reviewer), "N/A"),
                status=d.status or "On Review",
            )
            for d in docs
        ]

    except Exception as e:
        logger.error(f"Error fetching review documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e
