import logging
from typing import List

from fastapi import HTTPException, APIRouter
from fastapi.params import Depends
from gotrue import UserResponse

from app.database import supabase
from app.dto.expert import (
    Document,
    AcceptDocumentRequest,
    RejectRequest,
    DocumentRow,
)
from app.middleware.auth import verify_token

router = APIRouter(prefix="/api/v1/expert", tags=["collector"])
logger = logging.getLogger(__name__)


# ExpertStartPage - get documents
@router.get("/get-documents", response_model=List[Document])
async def expert_start_get_documents(user: UserResponse = Depends(verify_token)):
    try:
        # 0️⃣ Get company_id from user profile
        profile_response = (
            supabase.table("profiles")
            .select("company_id")
            .eq("id", user.user.id)
            .execute()
        )
        if not profile_response.data or not profile_response.data[0].get("company_id"):
            raise HTTPException(
                status_code=400,
                detail="User does not have a company associated with their profile",
            )
        company_id = profile_response.data[0]["company_id"]

        # 1️⃣ Fetch all profiles and map profiles
        profiles_data = supabase.table("profiles").select("id, full_name").execute()
        user_map = {
            profile["id"]: profile["full_name"] for profile in profiles_data.data
        }

        # 2️⃣ Fetch documents on review assigned to the user
        documents_data = (
            (
                supabase.table("documents")
                .select("doc_id, title, author_id, status")
                .eq("status", "On Review")
                .eq("company_id", company_id)  # Filter by company_id
            ).eq("reviewer", user.user.id)
        ).execute()

        result = [
            Document(
                id=doc["doc_id"],
                title=doc.get("title", "Untitled"),
                author=user_map.get(doc["author_id"], "N/A"),
                status=doc.get("status", "On Review"),
            )
            for doc in documents_data.data
        ]

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ExportDocPage - get document
@router.get("/get-document/{document_id}")
async def expert_doc_get_document(
    document_id: str, user: UserResponse = Depends(verify_token)
):
    try:
        # 0️⃣ Get company_id from user profile
        profile_response = (
            supabase.table("profiles")
            .select("company_id")
            .eq("id", user.user.id)
            .execute()
        )
        if not profile_response.data or not profile_response.data[0].get("company_id"):
            raise HTTPException(
                status_code=400,
                detail="User does not have a company associated with their profile",
            )
        company_id = profile_response.data[0]["company_id"]

        resp = (
            supabase.table("documents")
            .select("*")
            .eq("doc_id", document_id)
            .eq("company_id", company_id)  # Filter by company_id
            .execute()
        )

        doc_records = resp.data
        if not doc_records:
            raise HTTPException(status_code=404, detail="Document not found")

        doc_record = doc_records[0]
        return {
            "tags": doc_record.get("tags"),
            "comment": doc_record.get("comment"),
            "summary": doc_record.get("summary"),
            "link": doc_record.get("link"),
            "title": doc_record.get("title"),
            "severity_levels": doc_record.get("severity_levels"),
            # add more fields if necessary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ExpertDocPage - accept document
@router.post("/accept-document")
async def expert_doc_accept_document(
    payload: AcceptDocumentRequest, user: UserResponse = Depends(verify_token)
):
    try:
        # 0️⃣ Get company_id from user profile
        profile_response = (
            supabase.table("profiles")
            .select("company_id")
            .eq("id", user.user.id)
            .execute()
        )
        if not profile_response.data or not profile_response.data[0].get("company_id"):
            raise HTTPException(
                status_code=400,
                detail="User does not have a company associated with their profile",
            )
        company_id = profile_response.data[0]["company_id"]

        update_data = {
            "comment": payload.comment,
            "status": "Validated - Awaiting Approval",
            "summary": payload.summary,
            # "company_id": company_id, # Assuming company_id is already set and doesn't change
        }

        # Add severity_levels only if provided
        if payload.severity_levels:
            update_data["severity_levels"] = payload.severity_levels

        data = (
            (supabase.table("documents").update(update_data))
            .eq("doc_id", payload.doc_id)
            .eq("company_id", company_id)  # Filter by company_id
        ).execute()

        return {"message": "Document updated successfully", "data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ExpertDocPage - reject document
@router.put("/reject-document")
async def expert_doc_reject_document(
    reject_request: RejectRequest, user: UserResponse = Depends(verify_token)
):
    try:
        # 0️⃣ Get company_id from user profile
        profile_response = (
            supabase.table("profiles")
            .select("company_id")
            .eq("id", user.user.id)
            .execute()
        )
        if not profile_response.data or not profile_response.data[0].get("company_id"):
            raise HTTPException(
                status_code=400,
                detail="User does not have a company associated with their profile",
            )
        company_id = profile_response.data[0]["company_id"]

        update_fields = {
            "comment": reject_request.comment,
            "status": "Rejected",
            "summary": reject_request.summary,
            "reviewer": reject_request.reviewer,
            # "company_id": company_id, # Assuming company_id is already set and doesn't change
        }
        if reject_request.severity_levels:
            update_fields["severity_levels"] = reject_request.severity_levels

        data = (
            supabase.table("documents")
            .update(update_fields)
            .eq("doc_id", reject_request.doc_id)
            .eq("company_id", company_id)  # Filter by company_id
            .execute()
        )

        return {"message": "Document successfully rejected", "data": data.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ExpertPreviousReviewsPage - get documents
@router.get("/completed-documents/{reviewer_id}")
async def expert_doc_previous_reviews_documents(
    reviewer_id: str, user: UserResponse = Depends(verify_token)
):
    try:
        # 0️⃣ Get company_id from user profile
        profile_response = (
            supabase.table("profiles")
            .select("company_id")
            .eq("id", user.user.id)  # Assuming current user's company context
            .execute()
        )
        if not profile_response.data or not profile_response.data[0].get("company_id"):
            raise HTTPException(
                status_code=400,
                detail="User does not have a company associated with their profile",
            )
        company_id = profile_response.data[0]["company_id"]

        # Fetch profiles
        profiles_response = supabase.table("profiles").select("id, full_name").execute()
        profiles = {
            profile["id"]: profile["full_name"] for profile in profiles_response.data
        }

        # Fetch completed documents
        documents_response = (
            (
                supabase.table("documents")
                .select("doc_id, title, author_id, status")
                .in_(
                    "status",
                    ["Rejected", "Validated - Stored", "Validated - Awaiting Approval"],
                )
                .eq("company_id", company_id)  # Filter by company_id
            )
            .eq("reviewer", reviewer_id)
            .execute()
        )

        documents = documents_response.data

        # Map documents to expected UI structure
        document_rows = [
            {
                "id": doc["doc_id"],
                "title": doc.get("title", "Untitled"),
                "author": profiles.get(doc["author_id"], "N/A"),
                "status": doc.get("status", "N/A"),
            }
            for doc in documents
        ]

        return document_rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ValidatorStartExpertReviewPage - get documents
@router.get("/review-documents", response_model=List[DocumentRow])
async def validator_start_expert_review_documents(
    user: UserResponse = Depends(verify_token),
):
    try:
        # 0️⃣ Get company_id from user profile
        profile_response = (
            supabase.table("profiles")
            .select("company_id")
            .eq("id", user.user.id)
            .execute()
        )
        if not profile_response.data or not profile_response.data[0].get("company_id"):
            raise HTTPException(
                status_code=400,
                detail="User does not have a company associated with their profile",
            )
        company_id = profile_response.data[0]["company_id"]

        # Fetch profiles
        profiles_response = supabase.table("profiles").select("id, full_name").execute()
        profile_map = {
            profile["id"]: profile["full_name"] for profile in profiles_response.data
        }

        # Fetch documents
        docs_response = (
            supabase.table("documents")
            .select("doc_id, title, reviewer, status")
            .in_("status", ["On Review"])
            .eq("responsible", user.user.id)
            .eq("company_id", company_id)  # Filter by company_id
            .execute()
        )

        return [
            DocumentRow(
                id=doc["doc_id"],
                title=doc.get("title", "Untitled"),
                reviewer=profile_map.get(doc["reviewer"], "N/A"),
                status=doc.get("status", "On Review"),
            )
            for doc in docs_response.data
        ]

    except Exception as e:
        logger.error(f"Error fetching company theme settings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
