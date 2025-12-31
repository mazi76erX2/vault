import os

import ollama

from app.core.config import settings

OLLAMA_HOST = os.getenv("OLLAMA_HOST", settings.ollama_host)
EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", settings.ollama_embed_model)
CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", settings.ollama_chat_model)

_client = ollama.Client(host=OLLAMA_HOST)


def embed(text: str, model: str = EMBED_MODEL) -> list[float]:
    resp = _client.embeddings(model=model, prompt=text)
    return resp["embedding"]


def chat(messages: list[dict[str, str]], model: str = CHAT_MODEL, temperature: float = 0.1) -> str:
    resp = _client.chat(
        model=model,
        messages=messages,
        options={"temperature": temperature},
    )
    return resp["message"]["content"]
