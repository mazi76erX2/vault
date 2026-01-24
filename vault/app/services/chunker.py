"""
Smart document chunker with semantic boundary detection and overlap.
Optimized for Python 3.14.
"""

import logging
import re
from dataclasses import dataclass
from enum import StrEnum, auto

from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import settings

logger = logging.getLogger(__name__)


class ChunkingStrategy(StrEnum):
    """Chunking strategies."""

    FIXED = auto()
    RECURSIVE = auto()
    SEMANTIC = auto()


@dataclass(slots=True, frozen=True)
class ChunkConfig:
    """Chunking configuration."""

    size: int = 1000
    overlap: int = 150  # ~15% overlap
    min_size: int = 100
    max_size: int = 2000
    strategy: ChunkingStrategy = ChunkingStrategy.RECURSIVE


class SmartChunker:
    """
    Smart document chunker with:
    - Semantic boundary detection
    - Configurable overlap (15% default)
    - Metadata preservation
    """

    __slots__ = ("config", "_splitter")

    # Semantic boundaries in order of preference
    SEPARATORS = [
        "\n\n\n",  # Triple newline (major section)
        "\n\n",  # Double newline (paragraph)
        "\n",  # Single newline
        ". ",  # Sentence end
        "? ",  # Question end
        "! ",  # Exclamation end
        "; ",  # Semicolon
        ", ",  # Comma
        " ",  # Word boundary
        "",  # Character (last resort)
    ]

    def __init__(self, config: ChunkConfig | None = None) -> None:
        self.config = config or ChunkConfig(
            size=settings.CHUNK_SIZE,
            overlap=settings.KB_CHUNK_OVERLAP,
        )
        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.config.size,
            chunk_overlap=self.config.overlap,
            separators=self.SEPARATORS,
            length_function=len,
            is_separator_regex=False,
        )

    def chunk(
        self,
        text: str,
        metadata: dict | None = None,
    ) -> list[dict]:
        """
        Chunk text with metadata.

        Returns list of:
            {
                "content": str,
                "metadata": {
                    "chunk_index": int,
                    "start_char": int,
                    "end_char": int,
                    ...original_metadata
                }
            }
        """
        if not text or not text.strip():
            return []

        # Clean text
        text = self._clean_text(text)

        # Split
        chunks = self._splitter.split_text(text)

        # Add metadata
        result = []
        current_pos = 0
        base_metadata = metadata or {}

        for i, chunk_text in enumerate(chunks):
            # Find position in original text
            start = text.find(chunk_text, current_pos)
            if start == -1:
                start = current_pos
            end = start + len(chunk_text)
            current_pos = start + 1  # Allow overlap detection

            result.append({
                "content": chunk_text,
                "metadata": {
                    **base_metadata,
                    "chunk_index": i,
                    "start_char": start,
                    "end_char": end,
                    "char_count": len(chunk_text),
                    "word_count": len(chunk_text.split()),
                },
            })

        logger.debug(f"Chunked {len(text)} chars into {len(result)} chunks")
        return result

    def chunk_with_context(
        self,
        text: str,
        metadata: dict | None = None,
        context_window: int = 1,
    ) -> list[dict]:
        """
        Chunk with surrounding context included.

        Each chunk includes content from adjacent chunks
        for better context during retrieval.
        """
        base_chunks = self.chunk(text, metadata)

        if context_window == 0 or len(base_chunks) <= 1:
            return base_chunks

        result = []
        for i, chunk in enumerate(base_chunks):
            # Gather context
            context_before = []
            context_after = []

            for j in range(1, context_window + 1):
                if i - j >= 0:
                    context_before.insert(0, base_chunks[i - j]["content"])
                if i + j < len(base_chunks):
                    context_after.append(base_chunks[i + j]["content"])

            # Build enhanced content
            enhanced_content = "\n\n".join([
                *context_before,
                chunk["content"],  # Main content
                *context_after,
            ])

            result.append({
                "content": chunk["content"],  # Original for display
                "content_with_context": enhanced_content,  # For embedding
                "metadata": {
                    **chunk["metadata"],
                    "has_context": True,
                    "context_window": context_window,
                },
            })

        logger.debug(f"Added context to {len(result)} chunks")
        return result

    def _clean_text(self, text: str) -> str:
        """Clean text while preserving structure."""
        # Normalize whitespace
        text = re.sub(r"\r\n", "\n", text)
        text = re.sub(r"\r", "\n", text)

        # Remove excessive newlines (more than 3)
        text = re.sub(r"\n{4,}", "\n\n\n", text)

        # Remove excessive spaces
        text = re.sub(r" {3,}", "  ", text)

        return text.strip()


# Factory
def get_chunker(config: ChunkConfig | None = None) -> SmartChunker:
    """Get a chunker instance."""
    return SmartChunker(config)
