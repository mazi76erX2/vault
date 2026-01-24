"""
Reranking service for RAG quality improvement.
Optimized for Python 3.14.
"""

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import StrEnum, auto
from typing import Self, override

from app.core.config import settings

logger = logging.getLogger(__name__)

# =============================================================================
# Types
# =============================================================================

type DocumentDict = dict[str, any]


class RerankerProvider(StrEnum):
    FLASHRANK = auto()
    CROSS_ENCODER = auto()
    NOOP = auto()


@dataclass(slots=True)
class RankedDocument:
    """Document with ranking score."""
    id: str | None
    content: str
    metadata: dict
    score: float
    original_score: float = 0.0

    @classmethod
    def from_dict(cls, doc: DocumentDict, score: float) -> Self:
        return cls(
            id=doc.get("id"),
            content=doc.get("content", doc.get("text", "")),
            metadata=doc.get("metadata", {}),
            score=score,
            original_score=doc.get("score", 0.0),
        )

    def to_dict(self) -> DocumentDict:
        return {
            "id": self.id,
            "content": self.content,
            "metadata": self.metadata,
            "score": self.score,
            "original_score": self.original_score,
        }


# =============================================================================
# Base Class
# =============================================================================


class BaseReranker[T: DocumentDict](ABC):
    """Abstract base reranker with generic document type."""

    @abstractmethod
    def rerank(self, query: str, documents: list[T], top_k: int = 5) -> list[RankedDocument]:
        """Rerank documents by relevance to query."""
        ...


# =============================================================================
# Implementations
# =============================================================================


class FlashRankReranker(BaseReranker[DocumentDict]):
    """Fast CPU-friendly reranker using FlashRank."""

    __slots__ = ("model_name", "_ranker")

    _instance: Self | None = None

    def __new__(cls, model_name: str | None = None) -> Self:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._ranker = None
        return cls._instance

    def __init__(self, model_name: str | None = None) -> None:
        if self._ranker is not None:
            return

        try:
            from flashrank import Ranker

            self.model_name = model_name or settings.FLASHRANK_MODEL
            self._ranker = Ranker(model_name=self.model_name)
            logger.info(f"Initialized FlashRank: {self.model_name}")
        except ImportError:
            logger.error("flashrank not installed. Install with: pip install flashrank")
            raise

    @override
    def rerank(
        self,
        query: str,
        documents: list[DocumentDict],
        top_k: int = 5,
    ) -> list[RankedDocument]:
        if not documents:
            return []

        from flashrank import RerankRequest

        passages = [
            {
                "id": i,
                "text": doc.get("content", doc.get("text", "")),
                "meta": doc.get("metadata", {}),
            }
            for i, doc in enumerate(documents)
        ]

        request = RerankRequest(query=query, passages=passages)
        results = self._ranker.rerank(request)

        return [
            RankedDocument.from_dict(documents[r["id"]], r["score"])
            for r in results[:top_k]
        ]


class CrossEncoderReranker(BaseReranker[DocumentDict]):
    """High-quality reranker using sentence-transformers CrossEncoder."""

    __slots__ = ("model_name", "_model")

    _instance: Self | None = None

    def __new__(cls, model_name: str | None = None) -> Self:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._model = None
        return cls._instance

    def __init__(self, model_name: str | None = None) -> None:
        if self._model is not None:
            return

        try:
            from sentence_transformers import CrossEncoder

            self.model_name = model_name or settings.CROSS_ENCODER_MODEL
            self._model = CrossEncoder(self.model_name, max_length=512)
            logger.info(f"Initialized CrossEncoder: {self.model_name}")
        except ImportError:
            logger.error("sentence-transformers not installed. Install with: pip install sentence-transformers")
            raise

    @override
    def rerank(
        self,
        query: str,
        documents: list[DocumentDict],
        top_k: int = 5,
    ) -> list[RankedDocument]:
        if not documents:
            return []

        texts = [doc.get("content", doc.get("text", "")) for doc in documents]
        pairs = [(query, text) for text in texts]
        scores = self._model.predict(pairs)

        # Sort by score descending
        indexed = sorted(
            enumerate(zip(documents, scores)),
            key=lambda x: x[1][1],
            reverse=True,
        )

        return [
            RankedDocument.from_dict(doc, float(score))
            for _, (doc, score) in indexed[:top_k]
        ]


class NoOpReranker(BaseReranker[DocumentDict]):
    """Passthrough reranker (no-op)."""

    @override
    def rerank(
        self,
        query: str,
        documents: list[DocumentDict],
        top_k: int = 5,
    ) -> list[RankedDocument]:
        return [
            RankedDocument.from_dict(doc, doc.get("score", 0.0))
            for doc in documents[:top_k]
        ]


# =============================================================================
# Factory
# =============================================================================

_reranker: BaseReranker | None = None


def get_reranker() -> BaseReranker:
    """Get configured reranker singleton."""
    global _reranker

    if _reranker is not None:
        return _reranker

    provider = settings.RERANKER_PROVIDER if settings.USE_RERANKER else "noop"

    match provider.lower():
        case "flashrank":
            _reranker = FlashRankReranker()
        case "cross-encoder" | "crossencoder":
            _reranker = CrossEncoderReranker()
        case _:
            logger.info("Using NoOp reranker")
            _reranker = NoOpReranker()

    return _reranker
