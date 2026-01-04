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
    OLLAMA_CHAT_MODEL: str = "llama3.2"
    OLLAMA_MODEL: str = "llama2"  # Legacy/fallback

    # Qdrant Configuration
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION: str = "vault"

    # RAG/Vector Settings
    CHUNK_SIZE: int = 3000
    VECTOR_DIMENSIONS: int = 768
    RETRIEVAL_SIMILARITY_THRESHOLD: float = 0.5
    MAX_RETRIEVAL_DOCS: int = 5

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
