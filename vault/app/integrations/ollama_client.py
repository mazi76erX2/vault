"""Ollama client configuration with timeout handling and fallback support."""

from __future__ import annotations

import logging
import os
from typing import Optional

import httpx
import ollama

logger = logging.getLogger(__name__)

# Configuration from environment
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "llama3.2:1b")

# Timeout settings (in seconds)
OLLAMA_CONNECT_TIMEOUT = float(os.getenv("OLLAMA_CONNECT_TIMEOUT", "10"))
OLLAMA_READ_TIMEOUT = float(os.getenv("OLLAMA_READ_TIMEOUT", "120"))

# Create client with custom timeout
_timeout = httpx.Timeout(
    connect=OLLAMA_CONNECT_TIMEOUT,
    read=OLLAMA_READ_TIMEOUT,
    write=30.0,
    pool=10.0
)

_client: Optional[ollama.Client] = None


def get_client() -> ollama.Client:
    """Get or create Ollama client with timeout configuration."""
    global _client
    if _client is None:
        _client = ollama.Client(
            host=OLLAMA_HOST,
            timeout=_timeout
        )
    return _client


def check_connection() -> bool:
    """Check if Ollama is accessible."""
    try:
        client = get_client()
        client.list()
        return True
    except Exception as e:
        logger.warning(f"Ollama connection check failed: {e}")
        return False


def get_available_models() -> list[str]:
    """Get list of available model names."""
    try:
        client = get_client()
        response = client.list()
        
        # Handle different response formats
        # ollama.list() returns ListResponse with 'models' attribute
        models_list = []
        
        if hasattr(response, 'models'):
            # New ollama library format - ListResponse object
            models_list = response.models or []
        elif isinstance(response, dict):
            # Dict format (older versions or raw API)
            models_list = response.get("models", [])
        
        # Extract model names
        model_names = []
        for m in models_list:
            # Model can be an object with 'model' or 'name' attribute, or a dict
            if hasattr(m, 'model'):
                model_names.append(m.model)
            elif hasattr(m, 'name'):
                model_names.append(m.name)
            elif isinstance(m, dict):
                model_names.append(m.get("model") or m.get("name", ""))
        
        return [n for n in model_names if n]
        
    except Exception as e:
        logger.error(f"Failed to list models: {e}")
        return []


def get_best_chat_model() -> str:
    """Get the best available chat model, preferring faster ones."""
    available = get_available_models()
    
    if not available:
        logger.warning("No models found, using default")
        return CHAT_MODEL
    
    # Preference order: faster/smaller models first
    preferred_models = [
        "llama3.2:1b",
        "llama3.2:3b",
        "gemma3:4b",
        "mistral:7b",
        "llama2:latest",
        "codellama:latest",
        "qwen2.5-coder:7b",
    ]
    
    for model in preferred_models:
        if model in available:
            return model
    
    # Return first available local model (not cloud)
    local_models = [m for m in available if ":cloud" not in m]
    if local_models:
        return local_models[0]
    
    return CHAT_MODEL


def embed(text: str, model: str = EMBED_MODEL) -> list[float]:
    """Generate embeddings for text."""
    try:
        client = get_client()
        resp = client.embeddings(model=model, prompt=text)
        
        # Handle response format
        if hasattr(resp, 'embedding'):
            return resp.embedding
        elif isinstance(resp, dict):
            return resp["embedding"]
        else:
            raise ValueError(f"Unexpected embedding response format: {type(resp)}")
            
    except Exception as e:
        logger.error(f"Embedding generation failed: {e}")
        raise


def chat(
    messages: list[dict[str, str]],
    model: str | None = None,
    temperature: float = 0.1,
    max_tokens: int = 1024,
    timeout: float | None = None,
) -> str:
    """
    Send chat messages to Ollama and get response.
    
    Args:
        messages: List of message dicts with 'role' and 'content'
        model: Model to use (defaults to CHAT_MODEL or best available)
        temperature: Sampling temperature (0.0-1.0)
        max_tokens: Maximum tokens to generate
        timeout: Optional custom timeout for this request
        
    Returns:
        Response content string
        
    Raises:
        OllamaTimeoutError: If request times out
        OllamaConnectionError: If cannot connect to Ollama
        OllamaError: For other Ollama errors
    """
    if model is None:
        model = CHAT_MODEL
    
    try:
        # Create client with custom timeout if specified
        if timeout:
            custom_timeout = httpx.Timeout(
                connect=OLLAMA_CONNECT_TIMEOUT,
                read=timeout,
                write=30.0,
                pool=10.0
            )
            client = ollama.Client(host=OLLAMA_HOST, timeout=custom_timeout)
        else:
            client = get_client()
        
        resp = client.chat(
            model=model,
            messages=messages,
            options={
                "temperature": temperature,
                "num_predict": max_tokens,
            },
        )
        
        # Handle response format
        if hasattr(resp, 'message'):
            message = resp.message
            if hasattr(message, 'content'):
                return message.content
            elif isinstance(message, dict):
                return message["content"]
        elif isinstance(resp, dict):
            return resp["message"]["content"]
        
        raise ValueError(f"Unexpected chat response format: {type(resp)}")
        
    except httpx.TimeoutException as e:
        logger.error(f"Ollama request timed out: {e}")
        raise OllamaTimeoutError(f"Request timed out after {timeout or OLLAMA_READ_TIMEOUT}s") from e
    except httpx.ConnectError as e:
        logger.error(f"Cannot connect to Ollama at {OLLAMA_HOST}: {e}")
        raise OllamaConnectionError(f"Cannot connect to Ollama at {OLLAMA_HOST}") from e
    except Exception as e:
        logger.error(f"Ollama chat error: {e}")
        raise OllamaError(f"Ollama error: {e}") from e


# Custom exceptions for better error handling
class OllamaError(Exception):
    """Base exception for Ollama errors."""
    pass


class OllamaTimeoutError(OllamaError):
    """Raised when Ollama request times out."""
    pass


class OllamaConnectionError(OllamaError):
    """Raised when cannot connect to Ollama."""
    pass