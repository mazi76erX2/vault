import os

import ollama

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "llama3.2")

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
