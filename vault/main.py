"""
main.py - FastAPI Application Entry Point
Slim orchestrator that imports modular routers
"""

from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from app.api import (admin_router, auth_router, companies_router, kb_router,
                     passwords_router, users_router, websocket_router)
from app.config.middleware import setup_middleware
from app.logger_config import setup_logging

# Initialize logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Application startup: Logging system initialized.")
    yield
    logger.info("Application shutdown: Logging system finalized.")


# Create FastAPI app
app = FastAPI(
    title="Vault API", description="Knowledge Management System", version="2.0.0", lifespan=lifespan
)

# Setup middleware (CORS, etc.)
setup_middleware(app)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
app.include_router(companies_router, prefix="/api/companies", tags=["Companies"])
app.include_router(kb_router, prefix="/api/kb", tags=["Knowledge Base"])
app.include_router(passwords_router, prefix="/api/auth", tags=["Passwords"])
app.include_router(websocket_router, tags=["WebSocket"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Vault API - Knowledge Management System",
        "version": "2.0.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "vault-api"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
