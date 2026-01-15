import json
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_db
from app.middleware.auth import verify_token_with_tenant
from app.models import ChatMessage, Profile
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/helper", tags=["helper"])


@router.post("/createchat")
async def create_chat(
    currentuser: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Create a new helper chat session."""
    try:
        # Extract user_id from token
        user_id = currentuser.get("userid") or currentuser.get("profile", {}).get("id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not extract user ID from token"
            )
        
        # Create new chat message with empty initial message
        new_chat = ChatMessage(
            user_id=user_id,
            message=""
        )
        db.add(new_chat)
        await db.commit()
        await db.refresh(new_chat)
        
        logger.info(f"Created new chat session {new_chat.id} for user {user_id}")
        
        return {
            "chatId": str(new_chat.id),
            "userId": str(user_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating chat session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating chat session: {str(e)}"
        )


@router.get("/messages/{chat_id}")
async def get_messages(
    chat_id: str,
    currentuser: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Get messages for a specific chat."""
    try:
        stmt = select(ChatMessage).where(ChatMessage.id == chat_id)
        result = await db.execute(stmt)
        chat = result.scalar_one_or_none()
        
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        # Parse messages
        messages = []
        if chat.message:
            try:
                messages = json.loads(chat.message) if isinstance(chat.message, str) else chat.message
            except:
                messages = [{"role": "assistant", "content": chat.message}]
        
        return {"messages": messages}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching messages: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching messages: {str(e)}"
        )


@router.post("/sendmessage")
async def send_message(
    data: dict[str, Any],
    currentuser: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Send a message in a chat."""
    try:
        chat_id = data.get("chatId")
        message_text = data.get("message")
        
        if not chat_id or not message_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing chatId or message"
            )
        
        # Get existing chat
        stmt = select(ChatMessage).where(ChatMessage.id == chat_id)
        result = await db.execute(stmt)
        chat = result.scalar_one_or_none()
        
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        # TODO: Add your helper AI logic here
        response_text = f"Echo: {message_text}"
        
        # Update message history
        current_messages = []
        if chat.message:
            try:
                current_messages = json.loads(chat.message) if isinstance(chat.message, str) else []
            except:
                current_messages = []
        
        current_messages.extend([
            {"role": "user", "content": message_text},
            {"role": "assistant", "content": response_text}
        ])
        
        chat.message = json.dumps(current_messages)
        await db.commit()
        
        return {"response": response_text}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error sending message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending message: {str(e)}"
        )


@router.post("/getpreviouschats")
async def get_previous_chats(
    currentuser: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Get all previous chat sessions for the helper user."""
    try:
        user_id = currentuser.get("userid") or currentuser.get("profile", {}).get("id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not extract user ID from token"
            )
        
        # Fetch all chat messages for this user
        stmt = select(ChatMessage).where(ChatMessage.user_id == user_id)
        result = await db.execute(stmt)
        chats = result.scalars().all()
        
        # Format response
        chat_list = [
            {
                "id": str(chat.id),
                "userid": str(chat.user_id),
                "messages": chat.message,
                "createdat": chat.created_at.isoformat() if chat.created_at else None,
            }
            for chat in chats
        ]
        
        logger.info(f"Retrieved {len(chat_list)} previous chats for user {user_id}")
        return {"getpreviouschats": {"data": chat_list}}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching previous chats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching previous chats: {str(e)}"
        )


@router.get("/user_maps")
async def get_user_maps(
    currentuser: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Get user maps (id and fullname) for helper."""
    try:
        company_reg_no = currentuser.get("companyregno")  # From token
        
        # Fetch all profiles for the company
        stmt = select(Profile.id, Profile.full_name).where(
            Profile.company_reg_no == company_reg_no  # ← snake_case
        )
        result = await db.execute(stmt)
        profiles = result.all()
        
        # Format as list of dicts
        user_maps = [
            {
                "id": str(p.id), 
                "fullName": p.full_name or "NA"  # ← snake_case in DB, camelCase in response
            }
            for p in profiles
        ]
        
        logger.info(f"Fetched {len(user_maps)} user maps")
        return {"usermaps": {"data": user_maps}}
        
    except Exception as e:
        logger.error(f"Error fetching user maps: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user maps: {str(e)}"
        )
