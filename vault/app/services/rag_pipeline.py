"""
Complete RAG pipeline with cloud-first LLM.
Optimized for Python 3.14.
"""

import logging
from dataclasses import dataclass, field
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.services.hybrid_search import (
    HybridSearchService,
    get_hybrid_search,
)
from app.services.ollama_client import OllamaClient, get_client
from app.services.reranker import BaseReranker, RankedDocument, get_reranker

logger = logging.getLogger(__name__)

# =============================================================================
# Types
# =============================================================================

type Filters = dict[str, Any]


@dataclass(slots=True)
class PerformanceMetrics:
    """Request performance metrics."""
    embedding_ms: float
    search_ms: float
    rerank_ms: float | None
    generation_ms: float | None
    total_ms: float

    def to_dict(self) -> dict[str, Any]:
        return {
            "embedding_ms": self.embedding_ms,
            "search_ms": self.search_ms,
            "rerank_ms": self.rerank_ms,
            "generation_ms": self.generation_ms,
            "total_ms": self.total_ms,
        }


@dataclass(slots=True)
class Source:
    """Document source for citation."""
    index: int
    name: str
    preview: str
    score: float
    metadata: dict


@dataclass(slots=True)
class RAGResponse:
    """Complete RAG response."""
    answer: str
    sources: list[Source]
    query: str
    model: str | None
    documents_used: int
    performance: PerformanceMetrics | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "answer": self.answer,
            "sources": [
                {
                    "index": s.index,
                    "source": s.name,
                    "content_preview": s.preview,
                    "score": s.score,
                    "metadata": s.metadata,
                }
                for s in self.sources
            ],
            "query": self.query,
            "model": self.model,
            "documents_used": self.documents_used,
            "performance": self.performance.to_dict() if self.performance else None,
        }


@dataclass
class RAGConfig:
    """RAG pipeline configuration."""
    use_hybrid_search: bool = field(default_factory=lambda: settings.USE_HYBRID_SEARCH)
    use_reranker: bool = field(default_factory=lambda: settings.USE_RERANKER)
    use_query_expansion: bool = field(default_factory=lambda: settings.USE_QUERY_EXPANSION)
    use_hyde: bool = field(default_factory=lambda: settings.USE_HYDE)
    initial_k: int = field(default_factory=lambda: settings.RETRIEVAL_TOP_K)
    final_k: int = field(default_factory=lambda: settings.RETRIEVAL_FINAL_K)
    temperature: float = field(default_factory=lambda: settings.GENERATION_TEMPERATURE)
    max_tokens: int = field(default_factory=lambda: settings.GENERATION_MAX_TOKENS)


# =============================================================================
# Pipeline
# =============================================================================


class RAGPipeline:
    """
    World-class RAG pipeline:
    - Hybrid search (vector + keyword)
    - Re-ranking
    - Query enhancement
    - Cloud-first generation with local fallback
    """

    __slots__ = ("client", "search", "reranker", "config")

    def __init__(
        self,
        client: OllamaClient | None = None,
        search: HybridSearchService | None = None,
        reranker: BaseReranker | None = None,
        config: RAGConfig | None = None,
    ) -> None:
        self.client = client or get_client()
        self.search = search or get_hybrid_search()
        self.reranker = reranker or get_reranker()
        self.config = config or RAGConfig()

    async def _get_queries(
        self,
        query: str,
        use_enhancement: bool,
        use_hyde: bool,
    ) -> list[str]:
        """Get all query variations for multi-query retrieval."""
        queries = [query]

        if use_enhancement:
            try:
                enhanced = await self.client.enhance_query(query)

                if enhanced.rewritten_query and enhanced.rewritten_query != query:
                    queries.append(enhanced.rewritten_query)

                for sub_q in enhanced.sub_questions[:2]:
                    if sub_q and sub_q != query:
                        queries.append(sub_q)

                logger.debug(f"Query expanded to {len(queries)} variations")
            except Exception as e:
                logger.warning(f"Query enhancement failed: {e}")

        if use_hyde:
            try:
                hypothetical = await self.client.generate_hypothetical_answer(query)
                queries.append(hypothetical)
                logger.debug("Added HyDE hypothetical answer")
            except Exception as e:
                logger.warning(f"HyDE failed: {e}")

        return queries

    async def retrieve(
        self,
        db: AsyncSession,
        query: str,
        *,
        filters: Filters | None = None,
        top_k: int | None = None,
        use_query_enhancement: bool | None = None,
        use_hyde: bool | None = None,
    ) -> list[RankedDocument]:
        """
        Retrieve relevant documents with hybrid search and reranking.
        """
        top_k = top_k or self.config.final_k
        use_enhancement = use_query_enhancement if use_query_enhancement is not None else self.config.use_query_expansion
        use_hyde_flag = use_hyde if use_hyde is not None else self.config.use_hyde

        # Get query variations
        queries = await self._get_queries(query, use_enhancement, use_hyde_flag)

        # Search with all queries, deduplicate
        seen_ids: set[str] = set()
        candidates: list[dict[str, Any]] = []

        for search_query in queries:
            embedding = await self.client.embed_async(search_query)

            if self.config.use_hybrid_search:
                results = await self.search.search(
                    db,
                    search_query,
                    embedding,
                    limit=self.config.initial_k,
                    filters=filters,
                )
            else:
                results = await self.search.vector_only_search(
                    db,
                    embedding,
                    limit=self.config.initial_k,
                    filters=filters,
                )

            for r in results:
                if r.id not in seen_ids:
                    seen_ids.add(r.id)
                    candidates.append(r.to_dict())

        if not candidates:
            logger.warning(f"No candidates for: {query[:50]}...")
            return []

        logger.debug(f"Found {len(candidates)} unique candidates")

        # Rerank against original query
        if self.config.use_reranker and len(candidates) > top_k:
            reranked = self.reranker.rerank(query, candidates, top_k)
            logger.debug(f"Reranked: {len(candidates)} -> {len(reranked)}")
            return reranked

        # Sort by score
        candidates.sort(key=lambda x: x.get("score", 0), reverse=True)
        return [
            RankedDocument.from_dict(doc, doc.get("score", 0))
            for doc in candidates[:top_k]
        ]

    async def generate(
        self,
        query: str,
        documents: list[RankedDocument],
        *,
        system_prompt: str | None = None,
    ) -> RAGResponse:
        """Generate response with retrieved context."""
        # Build context with sources
        context_parts: list[str] = []
        sources: list[Source] = []

        for i, doc in enumerate(documents, 1):
            name = (
                doc.metadata.get("source")
                or doc.metadata.get("filename")
                or doc.metadata.get("title")
                or f"Document {i}"
            )

            context_parts.append(f"[Source {i}: {name}]\n{doc.content}")

            preview = doc.content[:200] + "..." if len(doc.content) > 200 else doc.content
            sources.append(Source(
                index=i,
                name=name,
                preview=preview,
                score=doc.score,
                metadata=doc.metadata,
            ))

        context = "\n\n---\n\n".join(context_parts)

        # Generate response
        response = await self.client.generate_rag_response(
            query,
            context,
            system_prompt=system_prompt,
            temperature=self.config.temperature,
            max_tokens=self.config.max_tokens,
        )

        return RAGResponse(
            answer=response.content,
            sources=sources,
            query=query,
            model=response.model,
            documents_used=len(documents),
        )

    async def query(
        self,
        db: AsyncSession,
        query: str,
        *,
        filters: Filters | None = None,
        top_k: int | None = None,
        system_prompt: str | None = None,
        use_query_enhancement: bool | None = None,
        use_hyde: bool | None = None,
    ) -> RAGResponse:
        """Complete RAG query: retrieve + generate."""
        import time
        start_time = time.perf_counter()
        metrics = {
            "embedding_ms": 0.0,
            "search_ms": 0.0,
            "rerank_ms": None,
            "generation_ms": None,
        }

        # Measure Retrieval Phase
        retrieve_start = time.perf_counter()
        documents = await self.retrieve(
            db,
            query,
            filters=filters,
            top_k=top_k,
            use_query_enhancement=use_query_enhancement,
            use_hyde=use_hyde,
        )
        metrics["search_ms"] = (time.perf_counter() - retrieve_start) * 1000

        if not documents:
            metrics["total_ms"] = (time.perf_counter() - start_time) * 1000
            return RAGResponse(
                answer="I couldn't find relevant information to answer your question.",
                sources=[],
                query=query,
                model=None,
                documents_used=0,
                performance=PerformanceMetrics(**metrics),
            )

        # Measure Generation Phase
        gen_start = time.perf_counter()
        response = await self.generate(query, documents, system_prompt=system_prompt)
        metrics["generation_ms"] = (time.perf_counter() - gen_start) * 1000

        metrics["total_ms"] = (time.perf_counter() - start_time) * 1000

        # Attach metrics
        response.performance = PerformanceMetrics(**metrics)
        return response


# Singleton
_pipeline: RAGPipeline | None = None


def get_rag_pipeline() -> RAGPipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = RAGPipeline()
    return _pipeline
