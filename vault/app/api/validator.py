import logging

from fastapi import HTTPException, APIRouter
from fastapi.params import Depends
from gotrue import UserResponse
from starlette.responses import JSONResponse

from app.connectors.store_data_in_kb import store_in_azure_kb
from app.constants.constants import SEVERITY_LEVEL_MAP
from app.database import supabase
from app.dto.validator import (
    RejectDocumentRequest,
    AcceptDocumentRequest,
    DelegateRequest,
    DocumentFetchRequest,
)
from app.middleware.auth import verify_token

router = APIRouter(prefix="/api/v1/validator", tags=["collector"])
logger = logging.getLogger(__name__)


# ValidatorStartPage - get documents ready for validation
@router.get("/get-documents")
async def validator_start_get_document(
    user_id: str, user: UserResponse = Depends(verify_token)
):
    try:
        # 0️⃣ Get company_id from the current logged-in user's profile (validator's company context)
        profile_response_validator = (
            supabase.table("profiles")
            .select("company_id")
            .eq("id", user.user.id)  # Use current user's id
            .execute()
        )
        if not profile_response_validator.data or not profile_response_validator.data[
            0
        ].get("company_id"):
            raise HTTPException(
                status_code=400,
                detail="Validator does not have a company associated with their profile",
            )
        company_id = profile_response_validator.data[0]["company_id"]

        # Fetch all profiles
        profiles_response = supabase.table("profiles").select("id, full_name").execute()
        profiles = profiles_response.data

        # Create a dictionary to map profile IDs to names
        user_map = {profile["id"]: profile["full_name"] for profile in profiles}

        # Fetch documents assigned to the user (responsible for validation)
        documents_response = (
            supabase.table("documents")
            .select("doc_id, title, author_id, status")
            .in_("status", ["Pending", "Rejected", "Validated - Awaiting Approval"])
            .eq("responsible", user_id)  # user_id is the responsible validator
            .eq("company_id", company_id)  # Filter by validator's company_id
            .execute()
        )

        documents = documents_response.data

        # Map author_id to full_name in the documents
        documents_with_authors = [
            {
                "id": doc["doc_id"],
                "title": doc["title"] or "Untitled",
                "author": user_map.get(doc["author_id"], "N/A"),
                "status": doc["status"] or "N/A",
            }
            for doc in documents
        ]

        return {"documents": documents_with_authors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ValidatorDocPage - reject
@router.post("/reject-document")
async def validator_doc_reject_document(
    payload: RejectDocumentRequest, user: UserResponse = Depends(verify_token)
):
    try:
        # 0️⃣ Get company_id from user profile (validator's company context)
        profile_response = (
            supabase.table("profiles")
            .select("company_id")
            .eq("id", user.user.id)
            .execute()
        )
        if not profile_response.data or not profile_response.data[0].get("company_id"):
            raise HTTPException(
                status_code=400,
                detail="Validator does not have a company associated with their profile",
            )
        company_id = profile_response.data[0]["company_id"]

        # Construct update fields from the payload
        update_fields = {
            "comment": payload.comment,
            "status": "Rejected",
            "summary": payload.summary,
            "reviewer": payload.reviewer,
        }
        if payload.severity_levels:  # Add severity level if provided
            update_fields["severity_levels"] = payload.severity_levels

        # Perform the update in the "documents" table
        result = (
            supabase.table("documents")
            .update(update_fields)
            .eq("doc_id", payload.doc_id)
            .eq("company_id", company_id)  # Filter by validator's company_id
            .execute()
        )

        return {"message": "Document rejected successfully", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ValidatorDocPage - update document
@router.post("/accept-document")
async def validator_doc_accept_document(
    request: AcceptDocumentRequest, user: UserResponse = Depends(verify_token)
):
    try:
        # 0️⃣ Get company_id from user profile (validator's company context)
        profile_response = (
            supabase.table("profiles")
            .select("company_id")
            .eq("id", user.user.id)
            .execute()
        )
        if not profile_response.data or not profile_response.data[0].get("company_id"):
            raise HTTPException(
                status_code=400,
                detail="Validator does not have a company associated with their profile",
            )
        company_id = profile_response.data[0]["company_id"]

        # Construct the update payload
        update_payload = {
            "comment": request.comment,
            "status": "Validated - Stored",
            "summary": request.summary,
        }

        # Include severity_levels only if present
        if request.severity_levels:
            update_payload["severity_levels"] = request.severity_levels

        # Update the document in Supabase
        response = (
            supabase.table("documents")
            .update(update_payload)
            .eq("doc_id", request.doc_id)
            .eq("company_id", company_id)  # Filter by validator's company_id
            .execute()
        )

        documents = response.data
        logger.info(f"Received document : {response.data}")

        response_message = ""

        if documents:  # Ensure data was returned
            # Retrieve the 'summary' column value (assuming only one document is returned)
            document = documents[0]
            summary_values = document.get("summary", "N/A")
            severity_levels = document.get("severity_levels", "N/A")
            title = document.get("title", "N/A")
            link = document.get("link", "N/A")
            severity_level_int = SEVERITY_LEVEL_MAP.get(severity_levels, 1)
            doc_to_store = {
                "file_name": link,
                "content": summary_values,
                "file_title": title,
                "level": severity_level_int,
            }
            store_in_azure_kb(doc_to_store)
            # store_in_qdrant_kb(doc_to_store, collection_name="standalone_testing")
            response_message = "Document validated and stored in the Knowledge Base"

            logger.info(response_message)

        else:
            response_message = "No documents found."

            logger.info(response_message)

        return {"message": response_message, "data": response.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# ValidatorDocPage - delegate document
@router.post("/delegate-document")
async def validator_doc_delegate_document(
    request: DelegateRequest, user: UserResponse = Depends(verify_token)
):
    try:
        # 0️⃣ Get company_id from user profile (validator's company context)
        profile_response = (
            supabase.table("profiles")
            .select("company_id")
            .eq("id", user.user.id)
            .execute()
        )
        if not profile_response.data or not profile_response.data[0].get("company_id"):
            raise HTTPException(
                status_code=400,
                detail="Validator does not have a company associated with their profile",
            )
        company_id = profile_response.data[0]["company_id"]

        # Build update object
        update_fields = {
            "comment": request.comment,
            "status": "On Review",
            "summary": request.summary,
            "reviewer": request.delegator_id,
        }
        if request.severity_level:
            update_fields["severity_levels"] = request.severity_level

        # Execute the update query in Supabase
        response = (
            supabase.table("documents")
            .update(update_fields)
            .eq("doc_id", request.doc_id)
            .execute()
        )

        return {"message": "Document updated successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ValidatorDocPage - get document
@router.post("/get-document")
async def validator_doc_get_document(
    request: DocumentFetchRequest, user: UserResponse = Depends(verify_token)
):
    try:
        # 0️⃣ Get company_id from user profile (validator's company context)
        profile_response = (
            supabase.table("profiles")
            .select("company_id")
            .eq("id", user.user.id)
            .execute()
        )
        if not profile_response.data or not profile_response.data[0].get("company_id"):
            raise HTTPException(
                status_code=400,
                detail="Validator does not have a company associated with their profile",
            )
        company_id = profile_response.data[0]["company_id"]

        # Extract `document_id` from request and convert to string
        document_id = str(request.document_id)

        if not document_id:
            raise HTTPException(status_code=400, detail="document_id is required")

        # Query the `documents` table in Supabase
        response = (
            supabase.table("documents")
            .select("*")
            .eq("doc_id", document_id)
            .eq("company_id", company_id)  # Filter by validator's company_id
            .execute()
        )

        data = response.data

        if not data:
            raise HTTPException(status_code=404, detail="Document not found")

        # Return the first document (assuming doc_id is unique)
        return {"document": data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ValidatorDocPage - get delegators
@router.get("/get-delegators")
async def validator_doc_get_delegators(user: UserResponse = Depends(verify_token)):
    try:
        # Query the `profiles` table
        response = supabase.from_("profiles").select("id, full_name").execute()

        # Format the result
        data = response.data
        formatted_data = [
            {"id": profile.get("id"), "value": profile.get("full_name")}
            for profile in data
        ]

        # Return the delegators as JSON
        return JSONResponse(content={"delegators": formatted_data})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ValidatorDocPage - fetch document by id (alias for get-document)
@router.post("/fetch_document_by_id")
async def validator_doc_fetch_document_by_id(
    request: DocumentFetchRequest, user: UserResponse = Depends(verify_token)
):
    try:
        # 0️⃣ Get company_id from user profile (validator's company context)
        profile_response = (
            supabase.table("profiles")
            .select("company_id")
            .eq("id", user.user.id)
            .execute()
        )
        if not profile_response.data or not profile_response.data[0].get("company_id"):
            raise HTTPException(
                status_code=400,
                detail="Validator does not have a company associated with their profile",
            )
        company_id = profile_response.data[0]["company_id"]

        # Extract `document_id` from request and convert to string
        document_id = str(request.document_id)

        if not document_id:
            raise HTTPException(status_code=400, detail="document_id is required")

        # Query the `documents` table in Supabase
        response = (
            supabase.table("documents")
            .select("*")
            .eq("doc_id", document_id)
            .eq("company_id", company_id)  # Filter by validator's company_id
            .execute()
        )

        data = response.data

        if not data:
            raise HTTPException(status_code=404, detail="Document not found")

        # Return the first document (assuming doc_id is unique)
        return {"document": data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ValidatorDocPage - fetch delegators (alias for get-delegators)
@router.post("/fetch_delegators")
async def validator_doc_fetch_delegators(
    request: dict, user: UserResponse = Depends(verify_token)
):
    try:
        # Query the `profiles` table
        response = supabase.from_("profiles").select("id, full_name").execute()

        # Format the result
        data = response.data
        formatted_data = [
            {"id": profile.get("id"), "fullName": profile.get("full_name")}
            for profile in data
        ]

        # Return the delegators as JSON
        return {"delegators": formatted_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ValidatorStartCompletedPage - get documents
@router.get("/completed-documents")
async def validator_start_completed_documents(
    user: UserResponse = Depends(verify_token),
):
    try:
        # 0️⃣ Get company_id from user profile (validator's company context)
        profile_response_validator = (
            supabase.table("profiles")
            .select("company_id")
            .eq("id", user.user.id)  # Use current user's id
            .execute()
        )
        if not profile_response_validator.data or not profile_response_validator.data[
            0
        ].get("company_id"):
            raise HTTPException(
                status_code=400,
                detail="Validator does not have a company associated with their profile",
            )
        company_id = profile_response_validator.data[0]["company_id"]

        # Fetch profiles
        profiles_result = supabase.table("profiles").select("id, full_name").execute()
        user_map = {
            profile["id"]: profile["full_name"] for profile in profiles_result.data
        }

        # Fetch documents filtered by status and responsible
        documents_result = (
            supabase.table("documents")
            .select("doc_id, title, author_id, status")
            .in_("status", ["Rejected", "Validated - Stored"])
            .eq("responsible", user.user.id)
            .eq("company_id", company_id)  # Filter by validator's company_id
            .execute()
        )

        documents = documents_result.data
        document_rows = [
            {
                "id": doc["doc_id"],
                "title": doc.get("title", "Untitled"),
                "author": user_map.get(doc["author_id"], "N/A"),
                "status": doc.get("status", "N/A"),
            }
            for doc in documents_result.data
        ]

        return document_rows

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
