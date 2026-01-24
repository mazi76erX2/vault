"""
Application Settings
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    # Database
    DATABASE_URL: str
    DATABASE_URL_SYNC: str | None = None

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"
    FRONTEND_URL: str = "http://localhost:3000"

    # Logging
    LOG_LEVEL: str = "INFO"

    # Ollama Configuration
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"
    OLLAMA_CHAT_MODEL: str = "llama3.2:1b"
    OLLAMA_MODEL: str = "llama3.2:1b"  # Legacy/fallback

    # RAG/Vector Settings
    CHUNK_SIZE: int = 3000
    VECTOR_DIMENSIONS: int = 768
    RETRIEVAL_SIMILARITY_THRESHOLD: float = 0.5
    MAX_RETRIEVAL_DOCS: int = 10
    KB_CHUNK_SIZE: int = 1000
    KB_CHUNK_OVERLAP: int = 150
    KB_TOP_K: int = 5

    # Hybrid Search Configuration
    USE_HYBRID_SEARCH: bool = True
    VECTOR_WEIGHT: float = 0.7  # Weight for vector similarity
    KEYWORD_WEIGHT: float = 0.3  # Weight for keyword matching
    RRF_K: int = 60  # Reciprocal Rank Fusion constant

    # Reranker Configuration
    USE_RERANKER: bool = True
    RERANKER_PROVIDER: str = "noop"  # Options: "flashrank", "cross-encoder", "noop"
    RERANKER_MODEL: str = "BAAI/bge-reranker-base"
    FLASHRANK_MODEL: str = "ms-marco-MiniLM-L-12-v2"
    CROSS_ENCODER_MODEL: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"

    # Query Enhancement
    USE_QUERY_EXPANSION: bool = True  # Rewrite query + generate sub-questions
    USE_HYDE: bool = False  # Hypothetical Document Embeddings (can be expensive)

    # Retrieval Parameters
    RETRIEVAL_TOP_K: int = 20  # Initial retrieval count (before reranking)
    RETRIEVAL_FINAL_K: int = 5  # Final count after reranking

    # Generation Settings
    GENERATION_TEMPERATURE: float = 0.1  # Lower = more deterministic
    GENERATION_MAX_TOKENS: int = 2048  # Max response length

    # Cloudinary (Image Upload)
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Email Configuration (if needed)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""

    # Application
    APP_NAME: str = "Vault API"
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = True
        # Allow extra fields from .env that aren't defined
        extra = "ignore"


settings = Settings()
