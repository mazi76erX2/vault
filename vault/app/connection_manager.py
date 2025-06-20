# connection_manager.py
from fastapi import WebSocket
from collections import defaultdict
import asyncio
import logging
from starlette.websockets import WebSocketDisconnect

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections = defaultdict(set)
        self.lock = asyncio.Lock()

    async def connect(self, client_id: str, websocket: WebSocket):
        async with self.lock:
            await websocket.accept()
            self.active_connections[client_id].add(websocket)
            logger.info(f"Client {client_id} connected")

    async def disconnect(self, client_id: str, websocket: WebSocket):
        async with self.lock:
            if websocket in self.active_connections[client_id]:
                self.active_connections[client_id].remove(websocket)
                if not self.active_connections[client_id]:
                    del self.active_connections[client_id]
            logger.info(f"Client {client_id} disconnected")

    async def send_personal_message(self, client_id: str, message: str):
        async with self.lock:
            if client_id in self.active_connections:
                for ws in self.active_connections[client_id]:
                    try:
                        await ws.send_text(message)
                    except WebSocketDisconnect:
                        await self.disconnect(client_id, ws)

    async def broadcast(self, message: str):
        async with self.lock:
            for client_id in list(self.active_connections.keys()):
                await self.send_personal_message(client_id, message)

def connection_manager():
    return ConnectionManager()
