"""
RAG Query API endpoints - High-level skills for AI agents and users.
Implements the MCP pattern with composable endpoints.
"""

import logging
from typing import Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_db
from app.middleware.auth import verify_token_with_tenant
from app.schemas.rag import (
    RAGQueryRequest,
    RAGQueryResponse,
    RetrieveResponse,
    StatsResponse,
)
from app.services.rag_pipeline import RAGPipeline, get_rag_pipeline
from app.models.kb import KnowledgeBase

router = APIRouter(prefix="/api/v1/rag", tags=["RAG"])
logger = logging.getLogger(__name__)


def get_pipeline() -> RAGPipeline:
    """Dependency injection for RAG pipeline."""
    return get_rag_pipeline()


def get_user_kb_filter(
    current_user: dict,
    db: AsyncSession,
) -> dict[str, Any]:
    """Get knowledge base filter for current user."""
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
    return {"user_id": user_id}


# =============================================================================
# High-Level Skills
# =============================================================================


@router.post(
    "/ask",
    response_model=RAGQueryResponse,
    summary="Ask a question (skill-based)",
    description="""
    High-level skill: Ask any question and get an answer.
    
    This is the primary interface for AI agents and users.
    Internally handles: query enhancement, hybrid search, 
    reranking, and generation.
    
    Returns performance metrics for monitoring.
    """,
)
async def ask(
    request: RAGQueryRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
    pipeline: RAGPipeline = Depends(get_pipeline),
) -> RAGQueryResponse:
    """
    Ask a question and get an answer with sources.
    
    This is the main endpoint for the chat interface.
    """
    try:
        # Get user's knowledge base filter
        user_filter = get_user_kb_filter(current_user, db)

        # Execute RAG pipeline
        response = await pipeline.query(
            db,
            request.query,
            filters=user_filter,
            top_k=request.top_k or 5,
            system_prompt=request.system_prompt,
            use_query_enhancement=request.use_query_enhancement,
            use_hyde=request.use_hyde,
        )

        return RAGQueryResponse(
            answer=response.answer,
            query=response.query,
            sources=[
                {
                    "index": s.index,
                    "source": s.name,
                    "content_preview": s.preview,
                    "score": s.score,
                    "metadata": s.metadata,
                }
                for s in response.sources
            ],
            model=response.model,
            documents_used=response.documents_used,
            performance=response.performance.to_dict() if response.performance else None,
        )

    except Exception as e:
        logger.error(f"RAG query failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process query: {str(e)}",
        )


@router.post(
    "/find",
    response_model=RetrieveResponse,
    summary="Find relevant documents (skill-based)",
    description="""
    High-level skill: Find documents matching a query.
    
    For when you need documents, not answers.
    Returns documents ranked by relevance.
    """,
)
async def find(
    request: RAGQueryRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
    pipeline: RAGPipeline = Depends(get_pipeline),
) -> RetrieveResponse:
    """Find relevant documents for a query."""
    try:
        # Get user's knowledge base filter
        user_filter = get_user_kb_filter(current_user, db)

        # Retrieve documents
        documents = await pipeline.retrieve(
            db,
            request.query,
            filters=user_filter,
            top_k=request.top_k or 10,
            use_query_enhancement=request.use_query_enhancement,
        )

        return RetrieveResponse(
            query=request.query,
            documents=[
                {
                    "content": doc.content,
                    "score": doc.score,
                    "metadata": doc.metadata,
                }
                for doc in documents
            ],
            total_found=len(documents),
        )

    except Exception as e:
        logger.error(f"Document retrieval failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve documents: {str(e)}",
        )


# =============================================================================
# Metrics & Monitoring
# =============================================================================


@router.get(
    "/stats",
    response_model=StatsResponse,
    summary="Get RAG system statistics",
    description="Returns current system statistics for dashboard.",
)
async def get_stats(
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> StatsResponse:
    """Get RAG system statistics."""
    try:
        from sqlalchemy import select, func
        from app.models.kb import KBChunk, KnowledgeBase

        # Get user's documents count
        user_id = (
            current_user.get("user_id")
            or current_user.get("user", {}).get("id")
            or current_user.get("profile", {}).get("id")
        )

        # Count chunks
        chunks_stmt = select(func.count(KBChunk.id)).where(
            KBChunk.user_id == user_id
        )
        chunks_result = await db.execute(chunks_stmt)
        total_chunks = chunks_result.scalar() or 0

        # Count knowledge bases
        kb_stmt = select(func.count(KnowledgeBase.id)).where(
            KnowledgeBase.user_id == user_id
        )
        kb_result = await db.execute(kb_stmt)
        total_kbs = kb_result.scalar() or 0

        return StatsResponse(
            total_chunks=total_chunks,
            total_documents=total_kbs,
            system_status="operational",
        )

    except Exception as e:
        logger.error(f"Failed to fetch stats: {e}", exc_info=True)
        return StatsResponse(
            total_chunks=0,
            total_documents=0,
            system_status="error",
        )


@router.get(
    "/health",
    summary="Health check",
    description="Check RAG system health.",
)
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "service": "rag-pipeline"}
