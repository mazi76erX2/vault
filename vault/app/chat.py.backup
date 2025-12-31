import asyncio
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.services.rag_service import answer

logger = logging.getLogger(__name__)

wsrouter = APIRouter()


@wsrouter.websocket("/ws/chat")
async def chat_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({"type": "ready", "message": "Local chat ready"})

    try:
        while True:
            user_msg = await websocket.receive_text()

            def _run() -> str:
                db: Session = SessionLocal()
                try:
                    return answer(db, user_msg)
                finally:
                    db.close()

            response = await asyncio.to_thread(_run)
            await websocket.send_json({"type": "assistant", "message": response})

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.exception("Chat error: %s", e)
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
