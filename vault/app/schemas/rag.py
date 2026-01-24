"""
RAG API schemas with performance metrics.
"""

from dataclasses import dataclass, field
from typing import Any

from pydantic import BaseModel, Field


class PerformanceMetrics(BaseModel):
    """Request performance metrics."""

    embedding_ms: float = Field(..., description="Time to compute embedding")
    search_ms: float = Field(..., description="Time for hybrid search")
    rerank_ms: float | None = Field(
        None, description="Time for reranking (if enabled)"
    )
    generation_ms: float | None = Field(
        None, description="Time for LLM generation (if applicable)"
    )
    total_ms: float = Field(..., description="Total request time")


class SourceSchema(BaseModel):
    """Source document."""

    index: int = Field(..., description="Source index in results")
    source: str = Field(..., description="Source name/filename")
    content_preview: str = Field(..., description="First 200 chars of content")
    score: float = Field(..., description="Relevance score")
    metadata: dict = Field(default_factory=dict, description="Document metadata")


class RAGQueryRequest(BaseModel):
    """RAG query request."""

    query: str = Field(..., min_length=1, max_length=5000, description="The question to ask")
    top_k: int | None = Field(
        None, ge=1, le=50, description="Number of results to return (default: 5)"
    )
    system_prompt: str | None = Field(
        None, description="Custom system prompt for generation"
    )
    use_query_enhancement: bool = Field(
        True, description="Rewrite query and generate sub-questions"
    )
    use_hyde: bool = Field(
        False, description="Use Hypothetical Document Embeddings (slower)"
    )
    kb_id: str | None = Field(
        None, description="Specific knowledge base ID (optional filter)"
    )


class RAGQueryResponse(BaseModel):
    """RAG query response with metrics."""

    answer: str = Field(..., description="Generated answer")
    query: str = Field(..., description="Original query")
    sources: list[SourceSchema] = Field(
        default_factory=list, description="Source documents"
    )
    model: str | None = Field(None, description="Model used for generation")
    documents_used: int = Field(..., description="Number of documents used")
    performance: dict[str, Any] | None = Field(
        None, description="Performance metrics"
    )


class DocumentSchema(BaseModel):
    """Retrieved document."""

    content: str = Field(..., description="Document content")
    score: float = Field(..., description="Relevance score")
    metadata: dict = Field(default_factory=dict, description="Document metadata")


class RetrieveResponse(BaseModel):
    """Document retrieval response."""

    query: str = Field(..., description="Original query")
    documents: list[DocumentSchema] = Field(..., description="Retrieved documents")
    total_found: int = Field(..., description="Total documents found")


class StatsResponse(BaseModel):
    """RAG system statistics."""

    total_chunks: int = Field(..., description="Total chunks in knowledge base")
    total_documents: int = Field(..., description="Total documents")
    system_status: str = Field(..., description="System status (operational, error, etc)")
