"""
Collector endpoints - migrated from Supabase to SQLAlchemy.
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
from app.dto.collector import (CollectorSummaryContinueRequest,
                               CollectorSummaryContinueResponse,
                               CollectorSummaryUpdateSummaryRequest,
                               ProfileUpdateRequest, StartChatRequest)
from app.middleware.auth import verify_token_with_tenant
from app.models import (ChatMessageCollector, Document, Profile, Question,
                        Session)
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services.auth_service import (get_current_user,
                                       get_current_user_dependency)
from app.services.collector_llm import (generate_follow_up_question,
                                        generate_initial_questions,
                                        generate_summary, generate_tags,
                                        generate_topic_from_question)
from app.services.file_extract import extract_text

router = APIRouter(prefix="/api/v1/collector", tags=["collector"])
logger = logging.getLogger(__name__)

UPLOAD_DIR = ".uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/update_cv_text")
async def update_cv_text(
    file: UploadFile = File(...),
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Upload and extract CV text."""
    user_id = current_user["user_id"]
    filepath = os.path.join(UPLOAD_DIR, file.filename)

    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        cv_text = extract_text(Path(filepath)).strip()
        if not cv_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract CV text from file",
            )

        # Update profile
        stmt = update(Profile).where(Profile.id == user_id).values(CVtext=cv_text)
        result = await db.execute(stmt)
        await db.commit()

        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        return {"cvtext": cv_text}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating CV text: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e
    finally:
        try:
            os.remove(filepath)
        except Exception:
            pass


@router.post("/fetch_resume_sessions")
async def fetch_resume_sessions(
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Fetch sessions with 'Started' status."""
    user_id = current_user["user_id"]

    try:
        stmt = select(Session).where(Session.user_id == user_id, Session.status == "Started")
        result = await db.execute(stmt)
        sessions = result.scalars().all()

        return {
            "sessions": [
                {
                    "id": str(s.id),
                    "user_id": str(s.user_id),
                    "status": s.status,
                    "created_at": s.created_at.isoformat() if s.created_at else None,
                    "topic": getattr(s, "topic", None),
                }
                for s in sessions
            ]
        }

    except Exception as e:
        logger.error(f"Error fetching sessions: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.post("/fetch_user_profile")
async def fetch_user_profile(
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Fetch user profile details."""
    user_id = current_user["user_id"]

    try:
        stmt = select(Profile).where(Profile.id == user_id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No profile found",
            )

        return {
            "full_name": profile.full_name or "",
            "yearsofexperience": getattr(profile, "years_of_experience", None),
            "fieldofexpertise": getattr(profile, "field_of_expertise", "") or "",
            "department": profile.department or "",
            "CVtext": getattr(profile, "CVtext", None),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching profile: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.post("/update_profile")
async def update_profile(
    request: ProfileUpdateRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Update user profile."""
    try:
        # Get existing profile
        stmt = select(Profile).where(Profile.id == request.user_id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if not profile:
            # Create new profile
            profile = Profile(
                id=request.user_id,
                full_name=request.full_name,
                department=request.department,
            )
            if hasattr(request, "yearsofexperience"):
                profile.years_of_experience = request.yearsofexperience
            if hasattr(request, "fieldofexpertise"):
                profile.field_of_expertise = request.fieldofexpertise
            db.add(profile)
        else:
            # Update existing
            profile.full_name = request.full_name
            profile.department = request.department
            if hasattr(request, "yearsofexperience"):
                profile.years_of_experience = request.yearsofexperience
            if hasattr(request, "fieldofexpertise"):
                profile.field_of_expertise = request.fieldofexpertise
            profile.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(profile)

        return {"message": "Profile updated successfully", "data": {"id": str(profile.id)}}

    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.post("/fetch_chat_conversation")
async def fetch_chat_conversation(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Fetch chat conversation messages."""
    session_id = data.get("sessionid")
    chat_messages_id = data.get("chatmessagesid")

    if not session_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing sessionid")

    try:
        # Get chatmessagesid from session if not provided
        if not chat_messages_id:
            stmt = select(Session.chat_messages_id).where(Session.id == session_id)
            result = await db.execute(stmt)
            chat_messages_id = result.scalar_one_or_none()

            if not chat_messages_id:
                return {"chatmessagesid": None, "messages": None}

        # Get messages
        stmt = select(ChatMessageCollector.messages).where(
            ChatMessageCollector.id == chat_messages_id
        )
        result = await db.execute(stmt)
        messages = result.scalar_one_or_none()

        return {"chatmessagesid": str(chat_messages_id), "messages": messages}

    except Exception as e:
        logger.error(f"Error fetching chat conversation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch chat conversation: {str(e)}",
        ) from e


@router.get("/fetch_documents_status")
async def fetch_documents_status(
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Fetch documents for collector."""
    user_id = current_user["user_id"]
    company_reg_no = current_user.get("company_reg_no")

    try:
        # Get all profiles for user mapping
        stmt = select(Profile.id, Profile.full_name).where(Profile.company_reg_no == company_reg_no)
        result = await db.execute(stmt)
        profiles = result.all()
        user_map = {str(p.id): p.full_name or "N/A" for p in profiles}

        # Get documents
        stmt = select(Document).where(
            Document.author_id == user_id,
            Document.status != "Draft",
        )
        result = await db.execute(stmt)
        documents = result.scalars().all()

        if not documents:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No completed documents found",
            )

        rows = [
            {
                "id": str(d.doc_id),
                "title": d.title or "Untitled",
                "responsible": user_map.get(str(d.responsible), "N/A"),
                "status": d.status or "Pending",
            }
            for d in documents
        ]

        return {"documents": rows}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching documents: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.get("/get_validators")
async def get_validators(
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Get all validators (profiles with IDs)."""
    company_reg_no = current_user.get("company_reg_no")

    try:
        stmt = select(Profile.id, Profile.full_name).where(Profile.company_reg_no == company_reg_no)
        result = await db.execute(stmt)
        profiles = result.all()

        validators = [{"id": str(p.id), "fullName": p.full_name or "N/A"} for p in profiles]

        return {"validators": validators}

    except Exception as e:
        logger.error(f"Error fetching validators: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.post("/get-questions")
async def get_questions(
    request: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Get questions for user."""
    user_id = request.get("user_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing user_id")

    try:
        stmt = select(Question).where(Question.user_id == user_id)
        result = await db.execute(stmt)
        question_row = result.scalar_one_or_none()

        if not question_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No questions found. Click 'Generate' to create new questions or 'Upload Question' to import from a file.",
            )

        return {
            "questions": question_row.questions or [],
            "status": question_row.status or [],
            "topics": getattr(question_row, "topics", []),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching questions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching questions: {str(e)}",
        ) from e


@router.post("/generate_questions")
async def generate_questions(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Generate initial questions using LLM."""
    user_id = data.get("user_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing user_id")

    try:
        # Get profile
        stmt = select(Profile).where(Profile.id == user_id)
        result = await db.execute(stmt)
        prof = result.scalar_one_or_none()

        if not prof:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

        profile_dict = {
            "full_name": prof.full_name,
            "yearsofexperience": getattr(prof, "years_of_experience", None),
            "fieldofexpertise": getattr(prof, "field_of_expertise", None),
            "department": prof.department,
            "CVtext": getattr(prof, "CVtext", None),
        }

        # Generate questions
        questions, seed = generate_initial_questions(profile_dict, n=8)
        topics = [generate_topic_from_question(q) for q in questions]
        status_list = ["Not Started" for _ in questions]

        # Upsert questions
        stmt = select(Question).where(Question.user_id == user_id)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            existing.questions = questions
            existing.status = status_list
            if hasattr(existing, "topics"):
                existing.topics = topics
            existing.created_at = datetime.now()
        else:
            new_questions = Question(
                user_id=user_id,
                questions=questions,
                status=status_list,
                created_at=datetime.now(),
            )
            if hasattr(Question, "topics"):
                new_questions.topics = topics
            db.add(new_questions)

        await db.commit()

        return {"questions": questions, "status": status_list, "topics": topics}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error generating questions: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.post("/init_questions")
async def init_questions_from_upload(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Initialize questions from uploaded file."""
    user_id = data.get("user_id")
    questions_list = data.get("questions")

    if not user_id or not questions_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing user_id or questions list",
        )

    try:
        topics = [generate_topic_from_question(q) for q in questions_list]
        status_list = ["Not Started" for _ in questions_list]

        stmt = select(Question).where(Question.user_id == user_id)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            existing.questions = questions_list
            existing.status = status_list
            if hasattr(existing, "topics"):
                existing.topics = topics
            existing.created_at = datetime.now()
        else:
            new_questions = Question(
                user_id=user_id,
                questions=questions_list,
                status=status_list,
                created_at=datetime.now(),
            )
            if hasattr(Question, "topics"):
                new_questions.topics = topics
            db.add(new_questions)

        await db.commit()

        return {
            "message": "Question initialized successfully",
            "questions": questions_list,
            "status": status_list,
            "topics": topics,
        }

    except Exception as e:
        await db.rollback()
        logger.error(f"Error initializing questions: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.post("/start-chat")
async def start_chat(
    request: StartChatRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Start a new chat session."""
    user_id = current_user["user_id"]

    try:
        # Get company_id
        stmt = select(Profile.company_id).where(Profile.id == user_id)
        result = await db.execute(stmt)
        company_id = result.scalar_one_or_none()

        if not company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User does not have a company associated with their profile",
            )

        # Create draft document
        doc = Document(
            author_id=user_id,
            title=f"Draft Document - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            severity_levels="Low",
            status="Draft",
            company_id=company_id,
        )
        db.add(doc)
        await db.flush()
        doc_id = doc.doc_id

        # Create session
        topic = generate_topic_from_question(request.question)
        session = Session(
            user_id=user_id,
            doc_id=doc_id,
            created_at=datetime.now(),
            topic=topic,
            status="Started",
        )
        db.add(session)
        await db.flush()
        session_id = session.id

        # Create chat messages
        system_message = {
            "role": "system",
            "content": "You are a dynamic and engaging chatbot designed to ask open-ended questions to collect knowledge and experiences from employees. Only ask follow-up questions. Do not summarize or answer.",
        }
        initial_question = {"role": "assistant", "content": request.question}
        messages = [system_message, initial_question]

        chat_msg = ChatMessageCollector(
            session_id=session_id,
            messages=messages,
            created_at=datetime.now(),
        )
        db.add(chat_msg)
        await db.flush()
        chat_msg_id = chat_msg.id

        # Update session with chat_messages_id
        session.chat_messages_id = chat_msg_id

        await db.commit()

        # Update question status (best-effort)
        try:
            stmt = select(Question).where(Question.user_id == user_id)
            result = await db.execute(stmt)
            q_row = result.scalar_one_or_none()

            if q_row and q_row.status:
                idx = int(request.id) - 1
                if 0 <= idx < len(q_row.status):
                    q_row.status[idx] = "Started"
                    await db.commit()
        except Exception:
            logger.exception("Question status update failed (non-fatal)")

        return {
            "message": "Session created successfully",
            "sessionId": str(session_id),
            "chatMessageId": str(chat_msg_id),
            "resume": False,
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error starting chat: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.post("/generate_question_response")
async def generate_question_response(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Generate follow-up question based on user response."""
    chat_prompt_id = data.get("chatpromptid")
    user_text = data.get("usertext")

    if not chat_prompt_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing chatpromptid")
    if not user_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing usertext")

    try:
        stmt = select(ChatMessageCollector).where(ChatMessageCollector.id == chat_prompt_id)
        result = await db.execute(stmt)
        chat_row = result.scalar_one_or_none()

        if not chat_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found"
            )

        messages = chat_row.messages or []
        followup, updated_messages = generate_follow_up_question(messages, user_text)

        chat_row.messages = updated_messages
        await db.commit()

        return {"followupQuestion": followup}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error generating follow-up: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.post("/generate_summary")
async def generate_summary_endpoint(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Generate summary from chat messages."""
    chat_prompt_id = data.get("chatpromptid")

    if not chat_prompt_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing chatpromptid")

    try:
        stmt = select(ChatMessageCollector.messages).where(
            ChatMessageCollector.id == chat_prompt_id
        )
        result = await db.execute(stmt)
        messages = result.scalar_one_or_none() or []

        summ = generate_summary(messages)
        return {"chatsummary": summ}

    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.post("/generate_tags")
async def generate_tags_endpoint(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Generate tags from text."""
    text = data.get("text") or ""

    if not text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing text")

    try:
        tags = generate_tags(text)
        return {"tags": tags}
    except Exception as e:
        logger.error(f"Error generating tags: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.post("/update_summary")
async def update_summary(
    request: CollectorSummaryUpdateSummaryRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Update document summary."""
    try:
        # Get doc_id from session
        stmt = select(Session.doc_id).where(Session.id == request.session_id)
        result = await db.execute(stmt)
        doc_id = result.scalar_one_or_none()

        if not doc_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or missing doc_id",
            )

        # Update document
        stmt = (
            update(Document).where(Document.doc_id == doc_id).values(summary=request.summary_text)
        )
        await db.execute(stmt)
        await db.commit()

        return {"message": "Summary updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating summary: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.post("/continue_session", response_model=CollectorSummaryContinueResponse)
async def continue_session(
    request: CollectorSummaryContinueRequest,
    current_user: dict = Depends(verify_token_with_tenant),
) -> CollectorSummaryContinueResponse:
    """Continue session (navigation helper)."""
    return CollectorSummaryContinueResponse(
        message="Summary updated successfully",
        next_page="/application/s/collector/CollectorMetaDataPage",
        state={
            "summary_text": request.summary_text,
            "session_id": request.session_id,
            "is_resume": request.is_resume,
        },
    )


@router.post("/fetch_existing_doc")
async def fetch_existing_doc(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Fetch existing document by session."""
    session_id = data.get("sessionid")

    if not session_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing sessionId")

    try:
        # Get doc_id from session
        stmt = select(Session.doc_id).where(Session.id == session_id)
        result = await db.execute(stmt)
        doc_id = result.scalar_one_or_none()

        if not doc_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or missing doc_id",
            )

        # Get document
        stmt = select(Document).where(Document.doc_id == doc_id)
        result = await db.execute(stmt)
        doc = result.scalar_one_or_none()

        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

        return {
            "document": {
                "doc_id": str(doc.doc_id),
                "title": doc.title,
                "summary": doc.summary,
                "status": doc.status,
                "tags": getattr(doc, "tags", []),
                "employee_contact": getattr(doc, "employee_contact", None),
                "link": doc.link,
                "responsible": str(doc.responsible) if doc.responsible else None,
                "severity_levels": doc.severity_levels,
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching document: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.post("/update_session_and_document")
async def update_session_and_document(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Update session and document metadata."""
    session_id = data.get("sessionid")

    if not session_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing sessionid")

    tags = data.get("tags") or []
    contact = data.get("contact")
    source_link = data.get("sourcelink")
    document_title = data.get("documenttitle")
    validator_id = data.get("validatorid")
    severity = data.get("severity")

    try:
        # Get doc_id
        stmt = select(Session.doc_id).where(Session.id == session_id)
        result = await db.execute(stmt)
        doc_id = result.scalar_one_or_none()

        if not doc_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or missing doc_id",
            )

        # Update document
        upd: dict[str, Any] = {
            "status": "Pending",
        }
        if tags:
            upd["tags"] = tags
        if contact:
            upd["employee_contact"] = contact
        if source_link:
            upd["link"] = source_link
        if validator_id:
            upd["responsible"] = validator_id
        if severity:
            upd["severity_levels"] = severity
        if document_title:
            upd["title"] = document_title

        stmt = update(Document).where(Document.doc_id == doc_id).values(**upd)
        await db.execute(stmt)

        # Update session
        stmt = update(Session).where(Session.id == session_id).values(status="Completed")
        await db.execute(stmt)

        await db.commit()

        return {"message": "Document stored successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating document: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.get("/fetchprojects", response_model=dict)
async def fetch_projects(
    db: AsyncSession = Depends(get_async_db),
    current_user: dict = Depends(verify_token_with_tenant),
):
    """
    Fetch all projects accessible to the current user.
    Returns projects from the user's company.
    """
    try:
        user_company_reg_no = current_user.get("profile", {}).get("company_reg_no")
        user_company_id = current_user.get("profile", {}).get("company_id")

        if not user_company_reg_no and not user_company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="User company information not found"
            )

        query = (
            select(Project)
            .where(
                and_(
                    Project.status == "active",
                    (
                        Project.company_reg_no == user_company_reg_no
                        if user_company_reg_no
                        else Project.company_id == user_company_id
                    ),
                )
            )
            .order_by(Project.created_at.desc())
        )

        result = await db.execute(query)
        projects = result.scalars().all()

        projects_data = [
            {
                "id": str(project.id),
                "name": project.name,
                "description": project.description or "",
                "status": project.status,
                "managerId": str(project.manager_id),
                "companyId": project.company_id,
                "createdAt": project.created_at.isoformat() if project.created_at else None,
            }
            for project in projects
        ]

        return {"projects": projects_data}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching projects: {str(e)}",
        )


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: dict = Depends(verify_token_with_tenant),
):
    """Create a new project."""
    try:
        profile = current_user.get("profile", {})
        user_id = profile.get("id")
        company_id = profile.get("company_id")
        company_regno = profile.get("company_reg_no")

        if not user_id or not company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="User profile incomplete"
            )

        new_project = Project(
            name=project_data.name,
            description=project_data.description,
            manager_id=project_data.manager_id or user_id,
            company_id=project_data.company_id or company_id,
            company_regno=company_regno,
            status=project_data.status or "active",
        )

        db.add(new_project)
        await db.commit()
        await db.refresh(new_project)

        return ProjectResponse.from_orm(new_project)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating project: {str(e)}",
        )


@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_async_db),
    current_user: dict = Depends(verify_token_with_tenant),
):
    """Get a specific project by ID."""
    try:
        result = await db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=f"Project {project_id} not found"
            )

        return ProjectResponse.from_orm(project)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching project: {str(e)}",
        )


@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    db: AsyncSession = Depends(get_async_db),
    current_user: dict = Depends(verify_token_with_tenant),
):
    """Update a project."""
    try:
        result = await db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=f"Project {project_id} not found"
            )

        update_data = project_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(project, field, value)

        project.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(project)

        return ProjectResponse.from_orm(project)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating project: {str(e)}",
        )


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_async_db),
    current_user: dict = Depends(verify_token_with_tenant),
):
    """Delete (archive) a project."""
    try:
        result = await db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=f"Project {project_id} not found"
            )

        project.status = "archived"
        project.updated_at = datetime.utcnow()
        await db.commit()

        return None

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting project: {str(e)}",
        )
