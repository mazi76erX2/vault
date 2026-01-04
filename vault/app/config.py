"""
Application Configuration
Environment variables and settings
"""

from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    model_config = ConfigDict(
        env_file=".env", case_sensitive=True, extra="ignore"  # This will ignore extra env vars
    )

    # App
    APP_NAME: str = "Vault API"
    VERSION: str = "2.0.0"
    DEBUG: bool = False
    TESTING: bool = False
    LOG_LEVEL: str = "INFO"

    # Frontend URL (for password reset links)
    FRONTEND_URL: str = "http://localhost:3000"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/vault"
    DATABASE_URL_SYNC: str | None = None  # For synchronous operations if needed

    # JWT Settings (for our custom auth)
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_SECRET: str | None = None  # Legacy, use SECRET_KEY

    # Supabase (Legacy - can be removed after full migration)
    SUPABASE_URL: str | None = None
    SUPABASE_ANON_KEY: str | None = None
    SUPABASE_SERVICE_KEY: str | None = None
    SUPABASE_JWT_SECRET: str | None = None

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8081,http://localhost:8082"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    # Email Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@vault.com"
    FROM_EMAIL: str | None = None  # Alias for SMTP_FROM

    # Ollama Settings
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama2"
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"
    OLLAMA_CHAT_MODEL: str = "llama2"

    # Vector Database Settings
    VECTOR_DIMENSIONS: int = 768

    # Retrieval Settings
    RETRIEVAL_SIMILARITY_THRESHOLD: float = 0.5
    MAX_RETRIEVAL_DOCS: int = 5

    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        # Use JWT_SECRET as fallback for SECRET_KEY if needed
        if self.JWT_SECRET and not self.SECRET_KEY:
            self.SECRET_KEY = self.JWT_SECRET

        # Use FROM_EMAIL as fallback for SMTP_FROM if needed
        if self.FROM_EMAIL and not self.SMTP_FROM:
            self.SMTP_FROM = self.FROM_EMAIL


settings = Settings()
