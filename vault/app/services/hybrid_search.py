"""
Hybrid search: vector similarity + keyword matching using SQLAlchemy.
Optimized for Python 3.14.
"""

import logging
from dataclasses import dataclass
from typing import Any

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.kb import KBChunk

logger = logging.getLogger(__name__)

# =============================================================================
# Types
# =============================================================================

type Embedding = list[float]
type Filters = dict[str, Any]


@dataclass(slots=True)
class SearchResult:
    """Search result with scores."""
    id: str
    content: str
    metadata: dict
    vector_score: float
    keyword_score: float
    rrf_score: float

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "content": self.content,
            "metadata": self.metadata,
            "vector_score": self.vector_score,
            "keyword_score": self.keyword_score,
            "score": self.rrf_score,
        }


# =============================================================================
# Service
# =============================================================================


class HybridSearchService:
    """
    Combines pgvector similarity with PostgreSQL full-text search.
    Uses Reciprocal Rank Fusion (RRF) for score combination.
    """

    __slots__ = ("vector_weight", "keyword_weight", "rrf_k")

    def __init__(
        self,
        vector_weight: float | None = None,
        keyword_weight: float | None = None,
        rrf_k: int | None = None,
    ) -> None:
        self.vector_weight = vector_weight or settings.VECTOR_WEIGHT
        self.keyword_weight = keyword_weight or settings.KEYWORD_WEIGHT
        self.rrf_k = rrf_k or settings.RRF_K

    async def search(
        self,
        db: AsyncSession,
        query: str,
        query_embedding: Embedding,
        *,
        limit: int = 20,
        filters: Filters | None = None,
    ) -> list[SearchResult]:
        """
        Hybrid search with RRF score fusion using SQLAlchemy.

        Args:
            db: Database session
            query: Text query for keyword search
            query_embedding: Query embedding for vector search
            limit: Max results
            filters: Optional filters (e.g., {"accesslevel": 1})

        Returns:
            Ranked search results
        """
        # Build filter conditions
        filter_conditions = []
        if filters:
            for key, value in filters.items():
                if hasattr(KBChunk, key):
                    filter_conditions.append(getattr(KBChunk, key) == value)

        # 1. Vector search subquery
        vector_search = (
            select(
                KBChunk.id,
                KBChunk.content,
                KBChunk.meta,
                (1 - KBChunk.embedding.cosine_distance(query_embedding)).label("vector_score"),
                func.row_number().over(
                    order_by=KBChunk.embedding.cosine_distance(query_embedding)
                ).label("vector_rank"),
            )
            .where(*filter_conditions) if filter_conditions else select(
                KBChunk.id,
                KBChunk.content,
                KBChunk.meta,
                (1 - KBChunk.embedding.cosine_distance(query_embedding)).label("vector_score"),
                func.row_number().over(
                    order_by=KBChunk.embedding.cosine_distance(query_embedding)
                ).label("vector_rank"),
            )
        ).order_by(KBChunk.embedding.cosine_distance(query_embedding)).limit(limit * 2).subquery()

        # 2. Keyword search subquery
        tsquery = func.plainto_tsquery("english", query)

        keyword_search = (
            select(
                KBChunk.id,
                KBChunk.content,
                KBChunk.meta,
                func.ts_rank_cd(KBChunk.tsv, tsquery).label("keyword_score"),
                func.row_number().over(
                    order_by=func.ts_rank_cd(KBChunk.tsv, tsquery).desc()
                ).label("keyword_rank"),
            )
            .where(KBChunk.tsv.op("@@")(tsquery))
        )

        if filter_conditions:
            keyword_search = keyword_search.where(*filter_conditions)

        keyword_search = keyword_search.order_by(
            func.ts_rank_cd(KBChunk.tsv, tsquery).desc()
        ).limit(limit * 2).subquery()

        # 3. Combine with RRF using FULL OUTER JOIN
        combined = (
            select(
                func.coalesce(vector_search.c.id, keyword_search.c.id).label("id"),
                func.coalesce(vector_search.c.content, keyword_search.c.content).label("content"),
                func.coalesce(vector_search.c.meta, keyword_search.c.meta).label("metadata"),
                func.coalesce(vector_search.c.vector_score, 0).label("vector_score"),
                func.coalesce(keyword_search.c.keyword_score, 0).label("keyword_score"),
                (
                    func.coalesce(
                        self.vector_weight / (self.rrf_k + vector_search.c.vector_rank), 0
                    ) +
                    func.coalesce(
                        self.keyword_weight / (self.rrf_k + keyword_search.c.keyword_rank), 0
                    )
                ).label("rrf_score"),
            )
            .select_from(
                vector_search.outerjoin(
                    keyword_search,
                    vector_search.c.id == keyword_search.c.id,
                    full=True,
                )
            )
            .order_by(text("rrf_score DESC"))
            .limit(limit)
        )

        result = await db.execute(combined)
        rows = result.fetchall()

        return [
            SearchResult(
                id=str(row.id),
                content=row.content,
                metadata=row.metadata or {},
                vector_score=float(row.vector_score),
                keyword_score=float(row.keyword_score),
                rrf_score=float(row.rrf_score),
            )
            for row in rows
        ]

    async def vector_only_search(
        self,
        db: AsyncSession,
        query_embedding: Embedding,
        *,
        limit: int = 20,
        filters: Filters | None = None,
    ) -> list[SearchResult]:
        """Vector-only search fallback."""
        # Build filter conditions
        filter_conditions = []
        if filters:
            for key, value in filters.items():
                if hasattr(KBChunk, key):
                    filter_conditions.append(getattr(KBChunk, key) == value)

        stmt = (
            select(
                KBChunk.id,
                KBChunk.content,
                KBChunk.meta,
                (1 - KBChunk.embedding.cosine_distance(query_embedding)).label("score"),
            )
            .order_by(KBChunk.embedding.cosine_distance(query_embedding))
            .limit(limit)
        )

        if filter_conditions:
            stmt = stmt.where(*filter_conditions)

        result = await db.execute(stmt)
        rows = result.fetchall()

        return [
            SearchResult(
                id=str(row.id),
                content=row.content,
                metadata=row.metadata or {},
                vector_score=float(row.score),
                keyword_score=0.0,
                rrf_score=float(row.score),
            )
            for row in rows
        ]


# Singleton
_service: HybridSearchService | None = None


def get_hybrid_search() -> HybridSearchService:
    global _service
    if _service is None:
        _service = HybridSearchService()
    return _service
