"""
Helper endpoints - AI-powered knowledge base assistant
"""
import logging
import shutil
import uuid
from pathlib import Path
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_async_db
from app.middleware.auth import verify_token_with_tenant
from app.models import ChatMessage, Profile
from app.connectors.store_data_in_kb import search_kb
from app.integrations.ollama_client import chat

router = APIRouter(prefix="/api/v1/helper", tags=["helper"])
logger = logging.getLogger(__name__)


def get_user_id(current_user: dict) -> str:
    """Extract user_id from current_user dict."""
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


@router.post("/addnewchatsession")
async def add_new_chat_session(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Create a new helper chat session."""
    try:
        user_id = get_user_id(current_user)
        topic = data.get("topic", "General Inquiry")

        # Create new chat session
        new_chat = ChatMessage(
            user_id=user_id,
            message="[]",  # Empty message array initially
        )
        
        db.add(new_chat)
        await db.commit()
        await db.refresh(new_chat)

        logger.info(f"Created chat session {new_chat.id} for user {user_id}")

        return {
            "chatId": str(new_chat.id),
            "topic": topic,
            "created_at": new_chat.created_at.isoformat() if new_chat.created_at else None,
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating chat session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating chat session: {str(e)}",
        )


@router.post("/sendmessage")
async def send_message(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Send a message and get AI-powered response from knowledge base."""
    try:
        chat_id = data.get("chatId")
        message_text = data.get("message")

        if not chat_id or not message_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing chatId or message",
            )

        user_id = get_user_id(current_user)

        # Get user's access level and company info
        stmt = select(Profile.user_access, Profile.company_id, Profile.company_reg_no).where(
            Profile.id == user_id
        )
        result = await db.execute(stmt)
        profile_data = result.first()

        user_access_level = profile_data.user_access if profile_data else 1
        company_id = profile_data.company_id if profile_data else None
        company_reg_no = profile_data.company_reg_no if profile_data else None

        # Get existing chat
        stmt = select(ChatMessage).where(ChatMessage.id == chat_id)
        result = await db.execute(stmt)
        chat = result.scalar_one_or_none()

        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found",
            )

        # Search knowledge base for relevant documents
        logger.info(f"Searching KB for: {message_text}")
        retrieved_docs = search_kb(
            query=message_text,
            limit=3,
            access_level=user_access_level,
            company_id=company_id,
            company_reg_no=company_reg_no,
            similarity_threshold=0.3,
        )

        # Generate AI response using RAG
        if not retrieved_docs:
            response_text = (
                "I don't have access to any documents that can answer your question. "
                "This might be because:\n"
                "- No documents have been added to the knowledge base yet\n"
                "- You don't have permission to access relevant documents\n"
                "- Your question is outside the scope of our knowledge base\n\n"
                "Please contact your administrator if you need access to additional resources."
            )
            confidence = "No Results"
            sources = []
        else:
            # Build context from retrieved documents
            context = "\n\n---\n\n".join(
                [
                    f"**Document**: {doc['title']}\n**Content**: {doc['content'][:500]}..."
                    for doc in retrieved_docs
                ]
            )

            # Construct system prompt
            system_prompt = f"""You are a helpful assistant that answers questions based on the company's knowledge base.

**Context from knowledge base:**
{context}

**Instructions:**
- Answer the question using ONLY the information provided in the context above
- If the context doesn't contain relevant information, say so clearly
- Be concise and helpful (2-3 paragraphs maximum)
- If you mention specific information, cite the document title
- Maintain a professional tone
- Do not make up information that's not in the context"""

            # Generate response using Ollama
            try:
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message_text},
                ]

                response_text = chat(
                    messages=messages,
                    temperature=0.1,
                    max_tokens=800,
                    task="chat",
                )

                confidence = "High Confidence" if len(retrieved_docs) >= 2 else "Moderate Confidence"
                
            except Exception as llm_error:
                logger.error(f"LLM error: {llm_error}")
                response_text = (
                    f"I found {len(retrieved_docs)} relevant document(s), but encountered an error "
                    "generating a response. Here are the document titles:\n\n" +
                    "\n".join([f"- {doc['title']}" for doc in retrieved_docs])
                )
                confidence = "Error"

            # Prepare sources
            sources = [
                {
                    "title": doc["title"],
                    "score": doc["score"],
                    "id": doc["id"],
                }
                for doc in retrieved_docs
            ]

        # Update message history (parse existing or start new)
        import json
        current_messages = []
        if chat.message:
            try:
                current_messages = json.loads(chat.message) if isinstance(chat.message, str) else []
            except:
                current_messages = []

        current_messages.extend(
            [
                {"role": "user", "content": message_text},
                {
                    "role": "assistant",
                    "content": response_text,
                    "confidence": confidence,
                    "sources": sources,
                },
            ]
        )

        chat.message = json.dumps(current_messages)
        await db.commit()

        logger.info(f"Generated response for chat {chat_id} with {len(sources)} sources")

        return {
            "response": response_text,
            "confidence": confidence,
            "sources": sources,
            "retrievedDocs": len(retrieved_docs),
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error sending message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending message: {str(e)}",
        )


@router.get("/getchatsessions")
async def get_chat_sessions(
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Get all chat sessions for current user."""
    try:
        user_id = get_user_id(current_user)

        stmt = (
            select(ChatMessage)
            .where(ChatMessage.user_id == user_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(20)
        )
        result = await db.execute(stmt)
        chats = result.scalars().all()

        return {
            "sessions": [
                {
                    "chatId": str(chat.id),
                    "created_at": chat.created_at.isoformat() if chat.created_at else None,
                    "message_count": len(chat.message) if chat.message else 0,
                }
                for chat in chats
            ]
        }

    except Exception as e:
        logger.error(f"Error getting chat sessions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting chat sessions: {str(e)}",
        )


@router.get("/getchat/{chat_id}")
async def get_chat(
    chat_id: str,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Get a specific chat session."""
    try:
        user_id = get_user_id(current_user)

        stmt = select(ChatMessage).where(
            ChatMessage.id == chat_id,
            ChatMessage.user_id == user_id,
        )
        result = await db.execute(stmt)
        chat = result.scalar_one_or_none()

        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found",
            )

        import json
        messages = []
        if chat.message:
            try:
                messages = json.loads(chat.message) if isinstance(chat.message, str) else []
            except:
                messages = []

        return {
            "chatId": str(chat.id),
            "messages": messages,
            "created_at": chat.created_at.isoformat() if chat.created_at else None,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting chat: {str(e)}",
        )


@router.get("/user_maps")
async def get_user_maps(
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Get user ID to name mapping for the company."""
    try:
        company_reg_no = get_company_regno(current_user)
        
        if not company_reg_no:
            # If no company, return current user only
            user_id = get_user_id(current_user)
            stmt = select(Profile.id, Profile.fullname).where(Profile.id == user_id)
            result = await db.execute(stmt)
            profiles = result.all()
        else:
            # Get all users in the company
            stmt = select(Profile.id, Profile.fullname).where(
                Profile.company_reg_no == company_reg_no
            )
            result = await db.execute(stmt)
            profiles = result.all()
        
        user_maps = [
            {
                "id": str(p.id),
                "fullname": p.fullname or "Unknown User",
            }
            for p in profiles
        ]
        
        return {"usermaps": user_maps}
        
    except Exception as e:
        logger.error(f"Error fetching user maps: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user maps: {str(e)}",
        )


def get_company_regno(current_user: dict) -> str | None:
    """Extract company_reg_no from current_user dict."""
    return (
        current_user.get("company_reg_no")
        or current_user.get("companyregno")
        or current_user.get("profile", {}).get("company_reg_no")
    )


@router.post("/upload_voice")
async def upload_voice(
    audio: UploadFile = File(...),
    chat_id: str = Form(...),
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Upload voice message and transcribe it."""
    try:
        from app.services.file_processor import extract_from_audio
        
        user_id = get_user_id(current_user)
        
        # Save audio temporarily
        audio_path = Path(f"./uploads/audio/{uuid.uuid4()}{Path(audio.filename).suffix}")
        audio_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        try:
            # Transcribe audio
            transcription = extract_from_audio(audio_path)
            
            if not transcription.strip():
                raise ValueError("No speech detected in audio")
            
            return {
                "status": "success",
                "transcription": transcription,
                "chat_id": chat_id,
            }
            
        finally:
            if audio_path.exists():
                audio_path.unlink()
                
    except Exception as e:
        logger.error(f"Error processing voice: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing voice: {str(e)}",
        )


@router.post("/upload_voice")
async def upload_voice(
    audio: UploadFile = File(...),
    chat_id: str = Form(...),
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Upload voice message and transcribe it."""
    try:
        from app.services.file_processor import extract_from_audio
        
        # Save audio temporarily
        audio_dir = Path("./uploads/audio")
        audio_dir.mkdir(parents=True, exist_ok=True)
        
        audio_path = audio_dir / f"{uuid.uuid4()}{Path(audio.filename).suffix}"
        
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        try:
            # Transcribe audio
            transcription = extract_from_audio(audio_path)
            
            if not transcription.strip():
                raise ValueError("No speech detected in audio")
            
            return {
                "status": "success",
                "transcription": transcription,
                "chat_id": chat_id,
            }
            
        finally:
            if audio_path.exists():
                audio_path.unlink()
                
    except Exception as e:
        logger.error(f"Error processing voice: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing voice: {str(e)}",
        )
