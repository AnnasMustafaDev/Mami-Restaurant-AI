from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    # App
    APP_NAME: str = "MaMi's Food & Wine API"
    DEBUG: bool = True
    API_PREFIX: str = "/api"

    # Database (PostgreSQL via asyncpg)
    DATABASE_URL: str = "postgresql+asyncpg://localhost/mami"

    # Auth
    SECRET_KEY: str = "change-me-in-production-use-a-random-string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"

    # LiveKit
    LIVEKIT_API_KEY: str = ""
    LIVEKIT_API_SECRET: str = ""
    LIVEKIT_URL: str = ""

    # Admin seed credentials
    ADMIN_EMAIL: str = "admin@mamis.com"
    ADMIN_PASSWORD: str = "admin123"

    # Email (empty = console logging in dev)
    RESEND_API_KEY: str = ""

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }


settings = Settings()

# 2026-01-10 14:45 | # settings loaded
