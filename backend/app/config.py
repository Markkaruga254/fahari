from functools import lru_cache

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

    ai_enabled: bool = True
    anthropic_api_key: str = ""
    ai_model: str = "claude-haiku-4-5-20251001"

    stt_provider: str = "fake"
    stt_api_key: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
