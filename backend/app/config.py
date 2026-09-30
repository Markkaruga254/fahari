from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "dev"
    demo_mode: bool = False
    public_base_url: str = ""
    auto_create_db: bool = False

    webhook_secret: str = ""
    phone_hash_pepper: str = ""
    dashboard_api_key: str = ""

    database_url: str = "postgresql+psycopg://pp:pp@localhost:5432/pp"

    at_username: str = "sandbox"
    at_api_key: str = ""
    at_sender_id: str = ""
    at_voice_number: str = ""
    sms_enabled: bool = False

    ai_enabled: bool = True
    anthropic_api_key: str = ""
    ai_model: str = "claude-haiku-4-5-20251001"

    stt_provider: str = "fake"
    stt_api_key: str = ""

    @field_validator("database_url", mode="before")
    @classmethod
    def _normalize_database_url(cls, v: object) -> object:
        # Render's fromDatabase connectionString uses the postgres:// scheme,
        # which SQLAlchemy rejects; pin it to the installed psycopg driver.
        if isinstance(v, str):
            if v.startswith("postgres://"):
                return "postgresql+psycopg://" + v[len("postgres://") :]
            if v.startswith("postgresql://"):
                return "postgresql+psycopg://" + v[len("postgresql://") :]
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()
