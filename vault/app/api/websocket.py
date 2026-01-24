"""
WebSocket endpoints for real-time communication.
"""

import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.connection_manager import connection_manager

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize connection manager
manager = connection_manager()


@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time communication."""
    await manager.connect(client_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(client_id, f"You wrote: {data}")
            await manager.broadcast(f"Client {client_id} says: {data}")
    except WebSocketDisconnect:
        await manager.disconnect(client_id, websocket)
        await manager.broadcast(f"Client {client_id} left the chat")
