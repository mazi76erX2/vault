"""
Ollama client with cloud-first strategy and local fallback.
Uses cloud models for speed, falls back to local when offline.
"""

from __future__ import annotations

import logging
import os
import time
from typing import Optional

import httpx
import ollama

logger = logging.getLogger(__name__)

# =============================================================================
# Configuration
# =============================================================================

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")

# Cloud models (FAST - run on remote servers)
CLOUD_MODELS = [
    "gemini-3-flash-preview:latest",  # Google's Gemini
    "minimax-m2.1:cloud",
    "minimax-m2:cloud",
    "qwen3-coder:480b-cloud",
]

# Local models (SLOWER - run on your CPU)
LOCAL_MODELS = [
    "llama3.2:1b",      # Fastest local
    "gemma3:4b",        # Good balance
    "llama2:latest",    # Fallback
    "codellama:latest",
    "qwen2.5-coder:7b",
]

# Primary model preference from env (can override)
PRIMARY_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "gemini-3-flash-preview:latest")

# Timeout settings
OLLAMA_CONNECT_TIMEOUT = float(os.getenv("OLLAMA_CONNECT_TIMEOUT", "10"))
CLOUD_READ_TIMEOUT = float(os.getenv("OLLAMA_CLOUD_TIMEOUT", "30"))  # Cloud is fast
LOCAL_READ_TIMEOUT = float(os.getenv("OLLAMA_LOCAL_TIMEOUT", "120"))  # Local is slow

# Task-specific timeouts
TASK_TIMEOUTS_CLOUD = {
    "topic": 10.0,
    "tags": 15.0,
    "chat": 20.0,
    "summary": 30.0,
    "questions": 45.0,
}

TASK_TIMEOUTS_LOCAL = {
    "topic": 20.0,
    "tags": 30.0,
    "chat": 60.0,
    "summary": 90.0,
    "questions": 120.0,
}

# =============================================================================
# Custom Exceptions
# =============================================================================

class OllamaError(Exception):
    """Base exception for Ollama errors."""
    pass


class OllamaTimeoutError(OllamaError):
    """Raised when Ollama request times out."""
    pass


class OllamaConnectionError(OllamaError):
    """Raised when cannot connect to Ollama."""
    pass


class OllamaModelNotFoundError(OllamaError):
    """Raised when requested model is not available."""
    pass


# =============================================================================
# Client Management
# =============================================================================

_models_cache: Optional[list[str]] = None
_cache_time: float = 0
CACHE_TTL = 300  # 5 minutes


def _create_timeout(read_timeout: float) -> httpx.Timeout:
    """Create httpx Timeout."""
    return httpx.Timeout(
        connect=OLLAMA_CONNECT_TIMEOUT,
        read=read_timeout,
        write=30.0,
        pool=10.0
    )


def get_client(timeout: float = LOCAL_READ_TIMEOUT) -> ollama.Client:
    """Get Ollama client with specified timeout."""
    return ollama.Client(host=OLLAMA_HOST, timeout=_create_timeout(timeout))


def check_connection() -> bool:
    """Check if Ollama server is accessible."""
    try:
        client = get_client(timeout=5.0)
        client.list()
        return True
    except Exception as e:
        logger.warning(f"Ollama connection failed: {e}")
        return False


# =============================================================================
# Model Management
# =============================================================================

def get_available_models(force_refresh: bool = False) -> list[str]:
    """Get available models with caching."""
    global _models_cache, _cache_time
    
    now = time.time()
    if not force_refresh and _models_cache and (now - _cache_time < CACHE_TTL):
        return _models_cache
    
    try:
        client = get_client(timeout=10.0)
        response = client.list()
        
        models = []
        if hasattr(response, 'models'):
            models = response.models or []
        elif isinstance(response, dict):
            models = response.get("models", [])
        
        names = []
        for m in models:
            name = None
            if hasattr(m, 'model'):
                name = m.model
            elif hasattr(m, 'name'):
                name = m.name
            elif isinstance(m, dict):
                name = m.get("model") or m.get("name")
            if name:
                names.append(name)
        
        _models_cache = names
        _cache_time = now
        logger.debug(f"Available models: {names}")
        return names
        
    except Exception as e:
        logger.error(f"Failed to list models: {e}")
        return _models_cache or []


def is_cloud_model(model: str) -> bool:
    """Check if model is a cloud/remote model."""
    return (
        ":cloud" in model.lower() or
        model in CLOUD_MODELS or
        "gemini" in model.lower() or
        "gpt" in model.lower() or
        "claude" in model.lower()
    )


def get_available_cloud_models() -> list[str]:
    """Get available cloud models."""
    available = get_available_models()
    return [m for m in CLOUD_MODELS if m in available]


def get_available_local_models() -> list[str]:
    """Get available local models."""
    available = get_available_models()
    return [m for m in LOCAL_MODELS if m in available]


def get_best_model(prefer_cloud: bool = True) -> tuple[str, bool]:
    """
    Get best available model.
    
    Returns:
        Tuple of (model_name, is_cloud)
    """
    available = get_available_models()
    
    if not available:
        return PRIMARY_MODEL, is_cloud_model(PRIMARY_MODEL)
    
    if prefer_cloud:
        # Try cloud models first (FAST)
        for model in CLOUD_MODELS:
            if model in available:
                logger.info(f"Using cloud model: {model}")
                return model, True
    
    # Fall back to local models
    for model in LOCAL_MODELS:
        if model in available:
            logger.info(f"Using local model: {model}")
            return model, False
    
    # Use whatever is available
    for model in available:
        if "embed" not in model.lower():
            cloud = is_cloud_model(model)
            return model, cloud
    
    return PRIMARY_MODEL, is_cloud_model(PRIMARY_MODEL)


def get_timeout_for_task(task: str, is_cloud: bool) -> float:
    """Get timeout based on task and model type."""
    if is_cloud:
        return TASK_TIMEOUTS_CLOUD.get(task, CLOUD_READ_TIMEOUT)
    return TASK_TIMEOUTS_LOCAL.get(task, LOCAL_READ_TIMEOUT)


# =============================================================================
# Embedding Functions
# =============================================================================

def embed(text: str, model: str = EMBED_MODEL) -> list[float]:
    """Generate embeddings."""
    try:
        client = get_client()
        resp = client.embeddings(model=model, prompt=text)
        
        if hasattr(resp, 'embedding'):
            return resp.embedding
        elif isinstance(resp, dict):
            return resp["embedding"]
        raise ValueError(f"Unexpected response: {type(resp)}")
            
    except Exception as e:
        logger.error(f"Embedding failed: {e}")
        raise OllamaError(f"Embedding failed: {e}") from e


# =============================================================================
# Chat Functions
# =============================================================================

def chat(
    messages: list[dict[str, str]],
    model: str | None = None,
    temperature: float = 0.1,
    max_tokens: int = 1024,
    timeout: float | None = None,
    task: str = "chat",
) -> str:
    """
    Send chat to Ollama.
    
    Args:
        messages: Chat messages
        model: Model (auto-selected if None)
        temperature: 0.0-1.0
        max_tokens: Max output tokens
        timeout: Custom timeout
        task: Task type for timeout
        
    Returns:
        Response text
    """
    # Auto-select model if not specified
    if model is None:
        model, is_cloud = get_best_model(prefer_cloud=True)
    else:
        is_cloud = is_cloud_model(model)
    
    # Auto-select timeout if not specified
    if timeout is None:
        timeout = get_timeout_for_task(task, is_cloud)
    
    logger.debug(f"Chat: model={model}, cloud={is_cloud}, timeout={timeout}s")
    
    try:
        client = get_client(timeout=timeout)
        
        resp = client.chat(
            model=model,
            messages=messages,
            options={
                "temperature": temperature,
                "num_predict": max_tokens,
            },
        )
        
        # Extract response
        if hasattr(resp, 'message'):
            msg = resp.message
            if hasattr(msg, 'content'):
                return msg.content
            elif isinstance(msg, dict):
                return msg["content"]
        elif isinstance(resp, dict):
            return resp["message"]["content"]
        
        raise ValueError(f"Unexpected response: {type(resp)}")
        
    except httpx.TimeoutException as e:
        raise OllamaTimeoutError(f"Timeout after {timeout}s") from e
    except httpx.ConnectError as e:
        raise OllamaConnectionError(f"Cannot connect to {OLLAMA_HOST}") from e
    except ollama.ResponseError as e:
        if "not found" in str(e).lower():
            raise OllamaModelNotFoundError(f"Model {model} not found") from e
        raise OllamaError(f"Ollama error: {e}") from e
    except Exception as e:
        raise OllamaError(f"Error: {e}") from e


def chat_with_fallback(
    messages: list[dict[str, str]],
    temperature: float = 0.1,
    max_tokens: int = 1024,
    task: str = "chat",
) -> tuple[str, str]:
    """
    Chat with automatic fallback from cloud to local.
    
    Returns:
        Tuple of (response, model_used)
    """
    available = get_available_models()
    
    # Build ordered list: cloud first, then local
    models_to_try = []
    
    # Add available cloud models first (FAST)
    for m in CLOUD_MODELS:
        if m in available:
            models_to_try.append((m, True))
    
    # Add available local models (SLOWER but works offline)
    for m in LOCAL_MODELS:
        if m in available:
            models_to_try.append((m, False))
    
    if not models_to_try:
        # Use whatever is available
        for m in available:
            if "embed" not in m.lower():
                models_to_try.append((m, is_cloud_model(m)))
        if not models_to_try:
            raise OllamaConnectionError("No models available")
    
    last_error = None
    
    for model, is_cloud in models_to_try:
        try:
            timeout = get_timeout_for_task(task, is_cloud)
            model_type = "cloud" if is_cloud else "local"
            logger.info(f"Trying {model_type} model: {model} (timeout={timeout}s)")
            
            response = chat(
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=timeout,
                task=task,
            )
            
            logger.info(f"Success with {model_type} model: {model}")
            return response, model
            
        except OllamaModelNotFoundError:
            logger.warning(f"Model {model} not found")
            continue
        except OllamaTimeoutError as e:
            logger.warning(f"Model {model} timed out: {e}")
            last_error = e
            continue
        except OllamaError as e:
            logger.warning(f"Model {model} failed: {e}")
            last_error = e
            continue
    
    raise OllamaError(f"All models failed. Last: {last_error}")