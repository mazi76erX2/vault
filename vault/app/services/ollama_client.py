"""
Ollama client with cloud-first strategy and local fallback.
Optimized for Python 3.14.
"""

import asyncio
import json
import logging
import os
import time
from dataclasses import dataclass, field
from enum import StrEnum, auto
from typing import Self

import httpx
import ollama

logger = logging.getLogger(__name__)

# =============================================================================
# Type Aliases (Python 3.14 type statement)
# =============================================================================

type ChatMessage = dict[str, str]
type Embedding = list[float]
type ModelName = str

# =============================================================================
# Enums
# =============================================================================


class ModelType(StrEnum):
    CLOUD = auto()
    LOCAL = auto()


class TaskType(StrEnum):
    TOPIC = "topic"
    TAGS = "tags"
    CHAT = "chat"
    SUMMARY = "summary"
    QUESTIONS = "questions"
    RAG = "rag"
    QUERY_ENHANCE = "query_enhance"
    EMBED = "embed"


# =============================================================================
# Configuration
# =============================================================================


@dataclass(frozen=True, slots=True)
class OllamaConfig:
    """Immutable Ollama configuration."""

    host: str = field(default_factory=lambda: os.getenv("OLLAMA_HOST", "http://localhost:11434"))
    embed_model: str = field(default_factory=lambda: os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text"))
    primary_model: str = field(default_factory=lambda: os.getenv("OLLAMA_CHAT_MODEL", "gemini-3-flash-preview:latest"))
    connect_timeout: float = field(default_factory=lambda: float(os.getenv("OLLAMA_CONNECT_TIMEOUT", "10")))
    cloud_timeout: float = field(default_factory=lambda: float(os.getenv("OLLAMA_CLOUD_TIMEOUT", "30")))
    local_timeout: float = field(default_factory=lambda: float(os.getenv("OLLAMA_LOCAL_TIMEOUT", "120")))

    cloud_models: tuple[str, ...] = (
        "gemini-3-flash-preview:latest",
        "minimax-m2.1:cloud",
        "minimax-m2:cloud",
        "qwen3-coder:480b-cloud",
    )

    local_models: tuple[str, ...] = (
        "llama3.2:1b",
        "gemma3:4b",
        "llama2:latest",
        "codellama:latest",
        "qwen2.5-coder:7b",
    )

    cloud_timeouts: dict[TaskType, float] = field(default_factory=lambda: {
        TaskType.TOPIC: 10.0,
        TaskType.TAGS: 15.0,
        TaskType.CHAT: 20.0,
        TaskType.SUMMARY: 30.0,
        TaskType.QUESTIONS: 45.0,
        TaskType.RAG: 30.0,
        TaskType.QUERY_ENHANCE: 15.0,
    })

    local_timeouts: dict[TaskType, float] = field(default_factory=lambda: {
        TaskType.TOPIC: 20.0,
        TaskType.TAGS: 30.0,
        TaskType.CHAT: 60.0,
        TaskType.SUMMARY: 90.0,
        TaskType.QUESTIONS: 120.0,
        TaskType.RAG: 90.0,
        TaskType.QUERY_ENHANCE: 30.0,
    })


# Global config instance
CONFIG = OllamaConfig()

# =============================================================================
# Exceptions
# =============================================================================


class OllamaError(Exception):
    """Base exception for Ollama errors."""


class OllamaTimeoutError(OllamaError):
    """Raised when Ollama request times out."""


class OllamaConnectionError(OllamaError):
    """Raised when cannot connect to Ollama."""


class OllamaModelNotFoundError(OllamaError):
    """Raised when requested model is not available."""


# =============================================================================
# Response Types
# =============================================================================


@dataclass(slots=True)
class ChatResponse:
    """Chat response with metadata."""
    content: str
    model: ModelName
    model_type: ModelType
    tokens_used: int | None = None


@dataclass(slots=True)
class QueryEnhancement:
    """Enhanced query with variations."""
    rewritten_query: str
    keywords: list[str]
    sub_questions: list[str]

    @classmethod
    def from_dict(cls, data: dict) -> Self:
        return cls(
            rewritten_query=data.get("rewritten_query", ""),
            keywords=data.get("keywords", []),
            sub_questions=data.get("sub_questions", []),
        )

    @classmethod
    def fallback(cls, query: str) -> Self:
        """Create fallback when enhancement fails."""
        return cls(
            rewritten_query=query,
            keywords=query.split()[:5],
            sub_questions=[],
        )


# =============================================================================
# Model Cache
# =============================================================================


@dataclass
class ModelCache:
    """Thread-safe model cache with TTL."""

    models: list[str] = field(default_factory=list)
    timestamp: float = 0.0
    ttl: float = 300.0  # 5 minutes

    @property
    def is_valid(self) -> bool:
        return bool(self.models) and (time.time() - self.timestamp < self.ttl)

    def update(self, models: list[str]) -> None:
        self.models = models
        self.timestamp = time.time()


_cache = ModelCache()

# =============================================================================
# Client Class
# =============================================================================


class OllamaClient:
    """
    Ollama client with cloud-first strategy.
    
    Features:
    - Cloud model preference for speed
    - Automatic fallback to local models
    - Task-specific timeouts
    - Connection pooling
    """

    __slots__ = ("config", "_client")

    def __init__(self, config: OllamaConfig = CONFIG) -> None:
        self.config = config
        self._client: ollama.Client | None = None

    def _get_client(self, timeout: float) -> ollama.Client:
        """Get client with specified timeout."""
        return ollama.Client(
            host=self.config.host,
            timeout=httpx.Timeout(
                connect=self.config.connect_timeout,
                read=timeout,
                write=30.0,
                pool=10.0,
            ),
        )

    def _is_cloud_model(self, model: str) -> bool:
        """Check if model is cloud-based."""
        model_lower = model.lower()
        return (
            ":cloud" in model_lower
            or model in self.config.cloud_models
            or any(x in model_lower for x in ("gemini", "gpt", "claude"))
        )

    def _get_timeout(self, task: TaskType, is_cloud: bool) -> float:
        """Get timeout for task and model type."""
        timeouts = self.config.cloud_timeouts if is_cloud else self.config.local_timeouts
        default = self.config.cloud_timeout if is_cloud else self.config.local_timeout
        return timeouts.get(task, default)

    # =========================================================================
    # Model Management
    # =========================================================================

    def get_available_models(self, force_refresh: bool = False) -> list[str]:
        """Get available models with caching."""
        if not force_refresh and _cache.is_valid:
            return _cache.models

        try:
            client = self._get_client(timeout=10.0)
            response = client.list()

            # Extract model names using pattern matching
            models: list[str] = []
            raw_models = getattr(response, "models", None) or (response.get("models", []) if isinstance(response, dict) else [])

            for m in raw_models:
                match m:
                    case {"model": name} | {"name": name}:
                        models.append(name)
                    case _ if hasattr(m, "model"):
                        models.append(m.model)
                    case _ if hasattr(m, "name"):
                        models.append(m.name)

            _cache.update(models)
            logger.debug(f"Available models: {models}")
            return models

        except Exception as e:
            logger.error(f"Failed to list models: {e}")
            return _cache.models

    def get_best_model(self, prefer_cloud: bool = True) -> tuple[ModelName, ModelType]:
        """Get best available model."""
        available = set(self.get_available_models())

        if not available:
            model = self.config.primary_model
            model_type = ModelType.CLOUD if self._is_cloud_model(model) else ModelType.LOCAL
            return model, model_type

        if prefer_cloud:
            for model in self.config.cloud_models:
                if model in available:
                    logger.info(f"Using cloud model: {model}")
                    return model, ModelType.CLOUD

        for model in self.config.local_models:
            if model in available:
                logger.info(f"Using local model: {model}")
                return model, ModelType.LOCAL

        # Use any non-embedding model
        for model in available:
            if "embed" not in model.lower():
                model_type = ModelType.CLOUD if self._is_cloud_model(model) else ModelType.LOCAL
                return model, model_type

        return self.config.primary_model, ModelType.CLOUD

    # =========================================================================
    # Embedding
    # =========================================================================

    def embed(self, text: str, model: str | None = None) -> Embedding:
        """Generate embedding for text."""
        model = model or self.config.embed_model

        try:
            client = self._get_client(timeout=30.0)
            response = client.embeddings(model=model, prompt=text)

            match response:
                case {"embedding": embedding}:
                    return embedding
                case _ if hasattr(response, "embedding"):
                    return response.embedding
                case _:
                    raise ValueError(f"Unexpected response type: {type(response)}")

        except Exception as e:
            logger.error(f"Embedding failed: {e}")
            raise OllamaError(f"Embedding failed: {e}") from e

    def embed_batch(self, texts: list[str], model: str | None = None) -> list[Embedding]:
        """Embed multiple texts."""
        return [self.embed(text, model) for text in texts]

    async def embed_async(self, text: str, model: str | None = None) -> Embedding:
        """Async embedding."""
        return await asyncio.to_thread(self.embed, text, model)

    async def embed_batch_async(self, texts: list[str], model: str | None = None) -> list[Embedding]:
        """Async batch embedding with concurrency."""
        tasks = [self.embed_async(text, model) for text in texts]
        return await asyncio.gather(*tasks)

    # =========================================================================
    # Chat
    # =========================================================================

    def chat(
        self,
        messages: list[ChatMessage],
        *,
        model: str | None = None,
        temperature: float = 0.1,
        max_tokens: int = 1024,
        timeout: float | None = None,
        task: TaskType = TaskType.CHAT,
    ) -> ChatResponse:
        """Send chat request."""
        # Auto-select model
        if model is None:
            model, model_type = self.get_best_model(prefer_cloud=True)
        else:
            model_type = ModelType.CLOUD if self._is_cloud_model(model) else ModelType.LOCAL

        # Auto-select timeout
        if timeout is None:
            timeout = self._get_timeout(task, model_type == ModelType.CLOUD)

        logger.debug(f"Chat: {model=}, type={model_type}, {timeout=}s")

        try:
            client = self._get_client(timeout=timeout)
            response = client.chat(
                model=model,
                messages=messages,
                options={"temperature": temperature, "num_predict": max_tokens},
            )

            # Extract content using pattern matching
            match response:
                case {"message": {"content": content}}:
                    pass
                case _ if hasattr(response, "message"):
                    msg = response.message
                    content = msg.content if hasattr(msg, "content") else msg["content"]
                case _:
                    raise ValueError(f"Unexpected response: {type(response)}")

            return ChatResponse(content=content, model=model, model_type=model_type)

        except httpx.TimeoutException as e:
            raise OllamaTimeoutError(f"Timeout after {timeout}s") from e
        except httpx.ConnectError as e:
            raise OllamaConnectionError(f"Cannot connect to {self.config.host}") from e
        except ollama.ResponseError as e:
            if "not found" in str(e).lower():
                raise OllamaModelNotFoundError(f"Model {model} not found") from e
            raise OllamaError(f"Ollama error: {e}") from e

    def chat_with_fallback(
        self,
        messages: list[ChatMessage],
        *,
        temperature: float = 0.1,
        max_tokens: int = 1024,
        task: TaskType = TaskType.CHAT,
    ) -> ChatResponse:
        """Chat with automatic cloud -> local fallback."""
        available = set(self.get_available_models())

        # Build ordered model list
        models_to_try: list[tuple[str, ModelType]] = []

        for m in self.config.cloud_models:
            if m in available:
                models_to_try.append((m, ModelType.CLOUD))

        for m in self.config.local_models:
            if m in available:
                models_to_try.append((m, ModelType.LOCAL))

        if not models_to_try:
            for m in available:
                if "embed" not in m.lower():
                    model_type = ModelType.CLOUD if self._is_cloud_model(m) else ModelType.LOCAL
                    models_to_try.append((m, model_type))

        if not models_to_try:
            raise OllamaConnectionError("No models available")

        errors: list[Exception] = []

        for model, model_type in models_to_try:
            try:
                timeout = self._get_timeout(task, model_type == ModelType.CLOUD)
                logger.info(f"Trying {model_type} model: {model} ({timeout=}s)")

                return self.chat(
                    messages,
                    model=model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    timeout=timeout,
                    task=task,
                )

            except OllamaModelNotFoundError:
                logger.warning(f"Model {model} not found, skipping")
                continue
            except (OllamaTimeoutError, OllamaError) as e:
                logger.warning(f"Model {model} failed: {e}")
                errors.append(e)
                continue

        # Raise exception group with all errors
        raise ExceptionGroup("All models failed", errors)

    async def chat_async(
        self,
        messages: list[ChatMessage],
        *,
        model: str | None = None,
        temperature: float = 0.1,
        max_tokens: int = 1024,
        task: TaskType = TaskType.CHAT,
    ) -> ChatResponse:
        """Async chat."""
        return await asyncio.to_thread(
            self.chat,
            messages,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            task=task,
        )

    async def chat_with_fallback_async(
        self,
        messages: list[ChatMessage],
        *,
        temperature: float = 0.1,
        max_tokens: int = 1024,
        task: TaskType = TaskType.CHAT,
    ) -> ChatResponse:
        """Async chat with fallback."""
        return await asyncio.to_thread(
            self.chat_with_fallback,
            messages,
            temperature=temperature,
            max_tokens=max_tokens,
            task=task,
        )

    # =========================================================================
    # RAG-Specific Methods
    # =========================================================================

    async def generate_rag_response(
        self,
        query: str,
        context: str,
        *,
        system_prompt: str | None = None,
        temperature: float = 0.1,
        max_tokens: int = 2048,
    ) -> ChatResponse:
        """Generate RAG response with context."""
        default_system = """You are a helpful assistant. Answer based on the provided context.
If the context lacks information, say so clearly.
Cite sources using [Source N] format."""

        messages: list[ChatMessage] = [
            {"role": "system", "content": system_prompt or default_system},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}\n\nAnswer:"},
        ]

        return await self.chat_with_fallback_async(
            messages,
            temperature=temperature,
            max_tokens=max_tokens,
            task=TaskType.RAG,
        )

    async def enhance_query(self, query: str) -> QueryEnhancement:
        """Enhance query for better retrieval."""
        prompt = f"""Analyze this search query and improve retrieval.

Query: {query}

Respond with valid JSON only (no markdown):
{{"rewritten_query": "clearer version", "keywords": ["key", "terms"], "sub_questions": ["q1", "q2"]}}

Max 2 sub_questions. Empty array if query is simple."""

        messages: list[ChatMessage] = [
            {"role": "system", "content": "You are a search optimizer. Respond only with valid JSON."},
            {"role": "user", "content": prompt},
        ]

        try:
            response = await self.chat_with_fallback_async(
                messages,
                temperature=0.0,
                max_tokens=500,
                task=TaskType.QUERY_ENHANCE,
            )

            # Clean and parse JSON
            content = response.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1].removeprefix("json").strip()

            return QueryEnhancement.from_dict(json.loads(content))

        except Exception as e:
            logger.warning(f"Query enhancement failed: {e}")
            return QueryEnhancement.fallback(query)

    async def generate_hypothetical_answer(self, query: str) -> str:
        """Generate hypothetical answer for HyDE."""
        prompt = f"""Write a brief factual paragraph answering this question.
Write as if quoting from an authoritative document.

Question: {query}

Hypothetical answer:"""

        messages: list[ChatMessage] = [
            {"role": "system", "content": "Write hypothetical document content for search."},
            {"role": "user", "content": prompt},
        ]

        try:
            response = await self.chat_with_fallback_async(
                messages,
                temperature=0.3,
                max_tokens=300,
                task=TaskType.QUERY_ENHANCE,
            )
            return response.content.strip()
        except Exception as e:
            logger.warning(f"HyDE generation failed: {e}")
            return query

    # =========================================================================
    # Health Check
    # =========================================================================

    def check_connection(self) -> bool:
        """Check if Ollama is accessible."""
        try:
            client = self._get_client(timeout=5.0)
            client.list()
            return True
        except Exception as e:
            logger.warning(f"Connection check failed: {e}")
            return False


# =============================================================================
# Module-level singleton and convenience functions
# =============================================================================

_client: OllamaClient | None = None


def get_client() -> OllamaClient:
    """Get singleton client instance."""
    global _client
    if _client is None:
        _client = OllamaClient()
    return _client


# Convenience functions for backwards compatibility
def embed(text: str, model: str | None = None) -> Embedding:
    return get_client().embed(text, model)


async def embed_async(text: str, model: str | None = None) -> Embedding:
    return await get_client().embed_async(text, model)


def chat(
    messages: list[ChatMessage],
    model: str | None = None,
    temperature: float = 0.1,
    max_tokens: int = 1024,
    timeout: float | None = None,
    task: str = "chat",
) -> str:
    response = get_client().chat(
        messages,
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        timeout=timeout,
        task=TaskType(task),
    )
    return response.content


def chat_with_fallback(
    messages: list[ChatMessage],
    temperature: float = 0.1,
    max_tokens: int = 1024,
    task: str = "chat",
) -> tuple[str, str]:
    response = get_client().chat_with_fallback(
        messages,
        temperature=temperature,
        max_tokens=max_tokens,
        task=TaskType(task),
    )
    return response.content, response.model
