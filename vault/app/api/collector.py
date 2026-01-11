"""
Collector endpoints - migrated from Supabase to SQLAlchemy.
Full implementation with cloud-first LLM strategy.
"""

from __future__ import annotations

import logging
import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import and_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_async_db
from app.dto.collector import (
    CollectorSummaryContinueRequest,
    CollectorSummaryContinueResponse,
    CollectorSummaryUpdateSummaryRequest,
    ProfileUpdateRequest,
    StartChatRequest,
)
from app.middleware.auth import verify_token_with_tenant
from app.models import ChatMessageCollector, Document, Profile, Question, Session
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services.collector_llm import (
    _extract_simple_topic,
    generate_follow_up_question,
    generate_initial_questions,
    generate_summary,
    generate_tags,
)
from app.services.file_extract import extract_text

router = APIRouter(prefix="/api/v1/collector", tags=["collector"])
logger = logging.getLogger(__name__)

UPLOAD_DIR = ".uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_user_id(current_user: dict) -> str:
    """Extract user_id from current_user dict consistently."""
    user_id = (
        current_user.get("user_id")
        or current_user.get("user", {}).get("id")
        or current_user.get("profile", {}).get("id")
    )
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not extract user ID from token",
        )
    return str(user_id)


def get_company_reg_no(current_user: dict) -> str | None:
    """Extract company_reg_no from current_user dict consistently."""
    return (
        current_user.get("company_reg_no")
        or current_user.get("profile", {}).get("company_reg_no")
    )


def get_company_id(current_user: dict) -> str | None:
    """Extract company_id from current_user dict consistently."""
    return (
        current_user.get("company_id")
        or current_user.get("profile", {}).get("company_id")
    )


# =============================================================================
# CV/Profile Endpoints
# =============================================================================


@router.post("/update_cv_text")
async def update_cv_text(
    file: UploadFile = File(...),
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Upload and extract CV text from file."""
    user_id = get_user_id(current_user)
    
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided",
        )
    
    safe_filename = f"{user_id}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        cv_text = extract_text(Path(filepath)).strip()
        if not cv_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract CV text from file. Please ensure the file contains readable text.",
            )

        stmt = update(Profile).where(Profile.id == user_id).values(CV_text=cv_text)
        result = await db.execute(stmt)
        await db.commit()

        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        logger.info(f"CV text updated for user {user_id}, length: {len(cv_text)}")
        return {"cvtext": cv_text}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating CV text for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to process CV: {str(e)}"
        ) from e
    finally:
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception as cleanup_error:
            logger.warning(f"Failed to cleanup file {filepath}: {cleanup_error}")


@router.post("/fetch_user_profile")
async def fetch_user_profile(
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Fetch user profile details."""
    user_id = get_user_id(current_user)

    try:
        stmt = select(Profile).where(Profile.id == user_id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No profile found for this user",
            )

        return {
            "full_name": profile.full_name or "",
            "yearsofexperience": profile.years_of_experience,
            "fieldofexpertise": profile.field_of_expertise or "",
            "department": profile.department or "",
            "CVtext": profile.CV_text,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching profile for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        ) from e


@router.post("/update_profile")
async def update_profile(
    request: ProfileUpdateRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Update user profile information."""
    try:
        stmt = select(Profile).where(Profile.id == request.user_id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if not profile:
            profile = Profile(
                id=request.user_id,
                full_name=request.full_name,
                department=request.department,
            )
            if hasattr(request, "yearsofexperience") and request.yearsofexperience is not None:
                profile.years_of_experience = request.yearsofexperience
            if hasattr(request, "fieldofexpertise") and request.fieldofexpertise:
                profile.field_of_expertise = request.fieldofexpertise
            db.add(profile)
            logger.info(f"Created new profile for user {request.user_id}")
        else:
            profile.full_name = request.full_name
            profile.department = request.department
            if hasattr(request, "yearsofexperience") and request.yearsofexperience is not None:
                profile.years_of_experience = request.yearsofexperience
            if hasattr(request, "fieldofexpertise") and request.fieldofexpertise:
                profile.field_of_expertise = request.fieldofexpertise
            profile.updated_at = datetime.utcnow()
            logger.info(f"Updated profile for user {request.user_id}")

        await db.commit()
        await db.refresh(profile)

        return {
            "message": "Profile updated successfully", 
            "data": {"id": str(profile.id)}
        }

    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        ) from e


# =============================================================================
# Questions Endpoints
# =============================================================================


@router.post("/get-questions")
async def get_questions(
    request: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Get questions for a user."""
    user_id = request.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Missing user_id in request body"
        )

    try:
        stmt = select(Question).where(Question.user_id == user_id)
        result = await db.execute(stmt)
        question_row = result.scalar_one_or_none()

        if not question_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No questions found. Click 'Generate' to create new questions or 'Upload Questions' to import from a file.",
            )

        return {
            "questions": question_row.questions or [],
            "status": question_row.status or [],
            "topics": question_row.topics or [],
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching questions for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching questions: {str(e)}",
        ) from e


@router.post("/generate_questions")
async def generate_questions_endpoint(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Generate initial interview questions using LLM (cloud-first strategy)."""
    user_id = data.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Missing user_id in request body"
        )

    try:
        stmt = select(Profile).where(Profile.id == user_id)
        result = await db.execute(stmt)
        prof = result.scalar_one_or_none()

        if not prof:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Profile not found. Please complete your profile first."
            )

        profile_dict = {
            "full_name": prof.full_name,
            "yearsofexperience": prof.years_of_experience,
            "fieldofexpertise": prof.field_of_expertise,
            "department": prof.department,
            "CVtext": prof.CV_text,
        }

        logger.info(f"Generating questions for user {user_id}")
        questions, _ = generate_initial_questions(profile_dict, n=8)
        
        topics = [_extract_simple_topic(q) for q in questions]
        status_list = ["Not Started"] * len(questions)

        stmt = select(Question).where(Question.user_id == user_id)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            existing.questions = questions
            existing.status = status_list
            existing.topics = topics
            existing.updated_at = datetime.utcnow()
            logger.info(f"Updated existing questions for user {user_id}")
        else:
            new_question = Question(
                user_id=user_id,
                questions=questions,
                status=status_list,
                topics=topics,
            )
            db.add(new_question)
            logger.info(f"Created new questions for user {user_id}")

        await db.commit()

        return {
            "questions": questions, 
            "status": status_list, 
            "topics": topics
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error generating questions for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        ) from e


@router.post("/init_questions")
async def init_questions_from_upload(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Initialize questions from uploaded JSON file."""
    user_id = data.get("user_id")
    questions_list = data.get("questions")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing user_id in request body",
        )
    
    if not questions_list or not isinstance(questions_list, list):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing or invalid questions list. Expected an array of question strings.",
        )

    try:
        topics = [_extract_simple_topic(q) for q in questions_list]
        status_list = ["Not Started"] * len(questions_list)

        stmt = select(Question).where(Question.user_id == user_id)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            existing.questions = questions_list
            existing.status = status_list
            existing.topics = topics
            existing.updated_at = datetime.utcnow()
        else:
            new_question = Question(
                user_id=user_id,
                questions=questions_list,
                status=status_list,
                topics=topics,
            )
            db.add(new_question)

        await db.commit()

        logger.info(f"Initialized {len(questions_list)} questions for user {user_id}")
        
        return {
            "message": "Questions initialized successfully",
            "questions": questions_list,
            "status": status_list,
            "topics": topics,
        }

    except Exception as e:
        await db.rollback()
        logger.error(f"Error initializing questions for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        ) from e


# =============================================================================
# Session Endpoints
# =============================================================================


@router.post("/fetch_resume_sessions")
async def fetch_resume_sessions(
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Fetch sessions with 'Started' status that can be resumed."""
    user_id = get_user_id(current_user)

    try:
        stmt = select(Session).where(
            Session.user_id == user_id, 
            Session.status == "Started"
        ).order_by(Session.created_at.desc())
        
        result = await db.execute(stmt)
        sessions = result.scalars().all()

        return {
            "sessions": [
                {
                    "id": str(s.id),
                    "user_id": str(s.user_id),
                    "status": s.status.value if hasattr(s.status, "value") else str(s.status),
                    "created_at": s.created_at.isoformat() if s.created_at else None,
                    "topic": s.topic,
                }
                for s in sessions
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching sessions for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        ) from e


@router.post("/start-chat")
async def start_chat(
    request: StartChatRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Start a new chat session for knowledge collection."""
    user_id = get_user_id(current_user)

    try:
        stmt = select(Profile.company_id).where(Profile.id == user_id)
        result = await db.execute(stmt)
        company_id = result.scalar_one_or_none()

        if not company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User does not have a company associated with their profile. Please update your profile.",
            )

        doc = Document(
            author_id=user_id,
            title=f"Draft Document - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            severity_levels="Low",
            status="Draft",
            company_id=company_id,
        )
        db.add(doc)
        await db.flush()

        topic = request.topic if request.topic else _extract_simple_topic(request.question)

        session = Session(
            user_id=user_id,
            doc_id=doc.doc_id,
            topic=topic,
            status="Started",
        )
        db.add(session)
        await db.flush()

        initial_messages = [
            {
                "role": "system",
                "content": "You are a dynamic and engaging chatbot designed to ask open-ended questions to collect knowledge and experiences from employees. Only ask follow-up questions. Do not summarize or answer.",
            },
            {
                "role": "assistant",
                "content": request.question,
            },
        ]

        chat_msg = ChatMessageCollector(
            session_id=session.id,
            messages=initial_messages,
        )
        db.add(chat_msg)
        await db.flush()

        session.chat_messages_id = chat_msg.id

        await db.commit()

        try:
            stmt = select(Question).where(Question.user_id == user_id)
            result = await db.execute(stmt)
            q_row = result.scalar_one_or_none()
            
            if q_row and q_row.status:
                question_idx = int(request.id) - 1
                if q_row.update_question_status(question_idx, "Started"):
                    await db.commit()
                    logger.info(f"Updated question {question_idx} status to 'Started'")
        except Exception as status_error:
            logger.warning(f"Question status update failed (non-fatal): {status_error}")

        logger.info(f"Started chat session {session.id} for user {user_id}")

        return {
            "message": "Session created successfully",
            "sessionId": str(session.id),
            "chatMessageId": str(chat_msg.id),
            "resume": False,
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error starting chat for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        ) from e


@router.post("/fetch_chat_conversation")
async def fetch_chat_conversation(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Fetch chat conversation messages for a session."""
    session_id = data.get("sessionid") or data.get("sessionId")
    chat_messages_id = data.get("chatmessagesid") or data.get("chatMessagesId")

    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Missing sessionid in request body"
        )

    try:
        if not chat_messages_id:
            stmt = select(Session.chat_messages_id).where(Session.id == session_id)
            result = await db.execute(stmt)
            chat_messages_id = result.scalar_one_or_none()

            if not chat_messages_id:
                return {"chatmessagesid": None, "messages": None}

        stmt = select(ChatMessageCollector.messages).where(
            ChatMessageCollector.id == chat_messages_id
        )
        result = await db.execute(stmt)
        messages = result.scalar_one_or_none()

        return {
            "chatmessagesid": str(chat_messages_id), 
            "messages": messages
        }

    except Exception as e:
        logger.error(f"Error fetching chat conversation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch chat conversation: {str(e)}",
        ) from e


@router.post("/generate_question_response")
async def generate_question_response(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Generate a follow-up question based on user's response."""
    chat_prompt_id = data.get("chat_prompt_id")
    user_text = data.get("user_text")

    if not chat_prompt_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Missing chat_prompt_id in request body"
        )
    if not user_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Missing user_text in request body"
        )

    try:
        stmt = select(ChatMessageCollector).where(ChatMessageCollector.id == chat_prompt_id)
        result = await db.execute(stmt)
        chat_row = result.scalar_one_or_none()

        if not chat_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Chat session not found"
            )

        messages = chat_row.messages or []
        followup, updated_messages = generate_follow_up_question(messages, user_text)

        chat_row.messages = updated_messages
        await db.commit()

        logger.info(f"Generated follow-up for chat {chat_prompt_id}")
        return {"follow_up_question": followup}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error generating follow-up: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        ) from e


# =============================================================================
# Summary/Tags Endpoints
# =============================================================================


@router.post("/generate_summary")
async def generate_summary_endpoint(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Generate a summary from chat messages."""
    chat_prompt_id = data.get("chat_prompt_id")

    if not chat_prompt_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Missing chat_prompt_id in request body"
        )

    try:
        stmt = select(ChatMessageCollector.messages).where(
            ChatMessageCollector.id == chat_prompt_id
        )
        result = await db.execute(stmt)
        messages = result.scalar_one_or_none() or []

        summary = generate_summary(messages)
        
        logger.info(f"Generated summary for chat {chat_prompt_id}")
        return {"chat_summary": summary}

    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        ) from e


@router.post("/generate_tags")
async def generate_tags_endpoint(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Generate tags from text content."""
    text = data.get("text") or ""

    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Missing or empty text in request body"
        )

    try:
        tags = generate_tags(text)
        
        logger.info(f"Generated {len(tags)} tags")
        return {"tags": tags}
        
    except Exception as e:
        logger.error(f"Error generating tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        ) from e


@router.post("/update_summary")
async def update_summary(
    request: CollectorSummaryUpdateSummaryRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Update document summary."""
    try:
        stmt = select(Session.doc_id).where(Session.id == request.session_id)
        result = await db.execute(stmt)
        doc_id = result.scalar_one_or_none()

        if not doc_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or missing doc_id",
            )

        stmt = (
            update(Document)
            .where(Document.doc_id == doc_id)
            .values(summary=request.summary_text)
        )
        await db.execute(stmt)
        await db.commit()

        logger.info(f"Updated summary for document {doc_id}")
        return {"message": "Summary updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        ) from e


@router.post("/continue_session", response_model=CollectorSummaryContinueResponse)
async def continue_session(
    request: CollectorSummaryContinueRequest,
    current_user: dict = Depends(verify_token_with_tenant),
) -> CollectorSummaryContinueResponse:
    """Continue session - navigation helper for frontend."""
    return CollectorSummaryContinueResponse(
        message="Summary updated successfully",
        next_page="/application/s/collector/CollectorMetaDataPage",
        state={
            "summary_text": request.summary_text,
            "session_id": request.session_id,
            "is_resume": request.is_resume,
        },
    )


# =============================================================================
# Document Endpoints
# =============================================================================


@router.get("/fetch_documents_status")
async def fetch_documents_status(
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Fetch documents for the collector (non-draft documents)."""
    user_id = get_user_id(current_user)
    company_reg_no = get_company_reg_no(current_user)

    try:
        stmt = select(Profile.id, Profile.full_name).where(
            Profile.company_reg_no == company_reg_no
        )
        result = await db.execute(stmt)
        profiles = result.all()
        user_map = {str(p.id): p.full_name or "N/A" for p in profiles}

        stmt = select(Document).where(
            Document.author_id == user_id,
            Document.status != "Draft",
        ).order_by(Document.created_at.desc())
        
        result = await db.execute(stmt)
        documents = result.scalars().all()

        if not documents:
            return {"documents": []}

        rows = [
            {
                "id": str(d.doc_id),
                "title": d.title or "Untitled",
                "responsible": user_map.get(str(d.responsible), "N/A") if d.responsible else "N/A",
                "status": d.status or "Pending",
            }
            for d in documents
        ]

        return {"documents": rows}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        ) from e


@router.post("/fetch_existing_doc")
async def fetch_existing_doc(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Fetch existing document by session ID."""
    session_id = data.get("sessionId") or data.get("sessionid")

    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Missing sessionId in request body"
        )

    try:
        stmt = select(Session.doc_id).where(Session.id == session_id)
        result = await db.execute(stmt)
        doc_id = result.scalar_one_or_none()

        if not doc_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or missing doc_id",
            )

        stmt = select(Document).where(Document.doc_id == doc_id)
        result = await db.execute(stmt)
        doc = result.scalar_one_or_none()

        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Document not found"
            )

        return {
            "document": {
                "doc_id": str(doc.doc_id),
                "title": doc.title,
                "summary": doc.summary,
                "status": doc.status.value if hasattr(doc.status, "value") else str(doc.status) if doc.status else None,
                "tags": getattr(doc, "tags", []) or [],
                "employee_contact": getattr(doc, "employee_contact", None),
                "link": doc.link,
                "responsible": str(doc.responsible) if doc.responsible else None,
                "severity_levels": doc.severity_levels.value if hasattr(doc.severity_levels, "value") else str(doc.severity_levels) if doc.severity_levels else None,
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        ) from e


@router.post("/update_session_and_document")
async def update_session_and_document(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Update session status and document metadata."""
    session_id = data.get("sessionid") or data.get("sessionId")

    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Missing sessionid in request body"
        )

    tags = data.get("tags") or []
    contact = data.get("contact")
    source_link = data.get("sourcelink")
    document_title = data.get("documenttitle")
    validator_id = data.get("validatorid")
    severity = data.get("severity")

    try:
        stmt = select(Session.doc_id).where(Session.id == session_id)
        result = await db.execute(stmt)
        doc_id = result.scalar_one_or_none()

        if not doc_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or missing doc_id",
            )

        update_values: dict[str, Any] = {"status": "Pending"}
        
        if tags:
            update_values["tags"] = tags
        if contact:
            update_values["employee_contact"] = contact
        if source_link:
            update_values["link"] = source_link
        if validator_id:
            update_values["responsible"] = validator_id
        if severity:
            update_values["severity_levels"] = severity
        if document_title:
            update_values["title"] = document_title

        stmt = update(Document).where(Document.doc_id == doc_id).values(**update_values)
        await db.execute(stmt)

        stmt = update(Session).where(Session.id == session_id).values(status="Completed")
        await db.execute(stmt)

        await db.commit()

        logger.info(f"Updated session {session_id} and document {doc_id}")
        return {"message": "Document stored successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        ) from e


@router.get("/get_validators")
async def get_validators(
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Get all validators (profiles) for the company."""
    company_reg_no = get_company_reg_no(current_user)

    try:
        stmt = select(Profile.id, Profile.full_name).where(
            Profile.company_reg_no == company_reg_no
        )
        result = await db.execute(stmt)
        profiles = result.all()

        validators = [
            {"id": str(p.id), "fullName": p.full_name or "N/A"} 
            for p in profiles
        ]

        return {"validators": validators}

    except Exception as e:
        logger.error(f"Error fetching validators: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        ) from e


# =============================================================================
# Project Endpoints
# =============================================================================


@router.get("/fetchprojects", response_model=dict)
async def fetch_projects(
    db: AsyncSession = Depends(get_async_db),
    current_user: dict = Depends(verify_token_with_tenant),
) -> dict[str, Any]:
    """Fetch all active projects accessible to the current user."""
    try:
        logger.debug(f"current_user keys: {current_user.keys()}")
        
        user_company_reg_no = get_company_reg_no(current_user)
        user_company_id = get_company_id(current_user)

        if not user_company_reg_no and not user_company_id:
            user_id = get_user_id(current_user)
            stmt = select(Profile.company_reg_no, Profile.company_id).where(Profile.id == user_id)
            result = await db.execute(stmt)
            row = result.first()
            if row:
                user_company_reg_no = row.company_reg_no
                user_company_id = row.company_id

        if not user_company_reg_no and not user_company_id:
            logger.warning(f"No company info found for user. current_user: {current_user}")
            return {"projects": []}

        if user_company_reg_no:
            query = select(Project).where(
                and_(
                    Project.status == "active",
                    Project.company_reg_no == user_company_reg_no,
                )
            )
        else:
            query = select(Project).where(
                and_(
                    Project.status == "active",
                    Project.company_id == user_company_id,
                )
            )

        query = query.order_by(Project.created_at.desc())

        result = await db.execute(query)
        projects = result.scalars().all()

        projects_data = [
            {
                "id": str(project.id),
                "name": project.name,
                "description": project.description or "",
                "status": project.status,
                "managerId": str(project.manager_id) if project.manager_id else None,
                "companyId": project.company_id,
                "createdAt": project.created_at.isoformat() if project.created_at else None,
            }
            for project in projects
        ]

        return {"projects": projects_data}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching projects: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching projects: {str(e)}",
        ) from e


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: dict = Depends(verify_token_with_tenant),
) -> ProjectResponse:
    """Create a new project."""
    try:
        user_id = get_user_id(current_user)
        company_id = get_company_id(current_user)
        company_reg_no = get_company_reg_no(current_user)

        if not company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="User profile incomplete. Missing company ID."
            )

        new_project = Project(
            name=project_data.name,
            description=project_data.description,
            manager_id=project_data.manager_id or user_id,
            company_id=project_data.company_id or company_id,
            company_reg_no=company_reg_no,
            status=project_data.status or "active",
        )

        db.add(new_project)
        await db.commit()
        await db.refresh(new_project)

        logger.info(f"Created project {new_project.id}")
        return ProjectResponse.from_orm(new_project)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating project: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating project: {str(e)}",
        ) from e


@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_async_db),
    current_user: dict = Depends(verify_token_with_tenant),
) -> ProjectResponse:
    """Get a specific project by ID."""
    try:
        result = await db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Project {project_id} not found"
            )

        return ProjectResponse.from_orm(project)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching project {project_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching project: {str(e)}",
        ) from e


@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    db: AsyncSession = Depends(get_async_db),
    current_user: dict = Depends(verify_token_with_tenant),
) -> ProjectResponse:
    """Update a project."""
    try:
        result = await db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Project {project_id} not found"
            )

        update_data = project_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(project, field, value)

        project.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(project)

        logger.info(f"Updated project {project_id}")
        return ProjectResponse.from_orm(project)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating project {project_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating project: {str(e)}",
        ) from e


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_async_db),
    current_user: dict = Depends(verify_token_with_tenant),
) -> None:
    """Delete (archive) a project. Sets status to 'archived' instead of hard delete."""
    try:
        result = await db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Project {project_id} not found"
            )

        project.status = "archived"
        project.updated_at = datetime.utcnow()
        await db.commit()

        logger.info(f"Archived project {project_id}")
        return None

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting project {project_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting project: {str(e)}",
        ) from e