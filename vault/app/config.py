from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    # Database - Use asyncpg for async operations
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/vault_db"
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/vault_db"
    
    # Ollama
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama2"
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"
    OLLAMA_CHAT_MODEL: str = "llama2"
    
    # Qdrant (optional - we're using pgvector primarily)
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION: str = "vault"
    
    # Supabase (for backward compatibility, not used in local setup)
    SUPABASE_URL: str = "http://localhost:8000"
    SUPABASE_ANON_KEY: str = "your-anon-key-here"
    SUPABASE_SERVICE_KEY: str = "your-service-key-here"
    SUPABASE_JWT_SECRET: str = "your-jwt-secret-here"
    
    # Vector dimensions (depends on your Ollama embedding model)
    VECTOR_DIMENSIONS: int = 768
    
    # Logging
    LOG_LEVEL: str = "INFO"
    DEBUG: bool = True
    TESTING: bool = False
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    JWT_SECRET: str = "your-jwt-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File uploads
    UPLOAD_DIR: str = "./uploads"
    
    # Email/SMTP
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "your-email@gmail.com"
    SMTP_PASSWORD: str = "your-app-password"
    FROM_EMAIL: str = "noreply@vault.com"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:8081,http://localhost:3000,http://localhost:8082"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS string to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    # RAG/Retrieval
    RETRIEVAL_SIMILARITY_THRESHOLD: float = 0.5
    MAX_RETRIEVAL_DOCS: int = 5
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

settings = Settings()
