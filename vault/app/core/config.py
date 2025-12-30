from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # DB
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:54322/vault"

    # Ollama
    ollama_host: str = "http://localhost:11434"
    ollama_embed_model: str = "nomic-embed-text"
    ollama_chat_model: str = "llama3.2"
    embedding_dim: int = 768

    # KB behavior
    kb_top_k: int = 5
    kb_chunk_size: int = 1200
    kb_chunk_overlap: int = 150

    # Supabase (local)
    supabase_url: str = ""
    supabase_key: str = ""  # anon
    supabase_service_key: str = ""  # service role

    # JWT verification (must match local GoTrue GOTRUE_JWT_SECRET)
    supabase_jwt_secret: str = ""
    supabase_jwt_audience: str = "authenticated"


settings = Settings()
