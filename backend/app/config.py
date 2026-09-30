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

    # No implicit database target: production must receive DATABASE_URL from Render.
    database_url: str = ""

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


# Environments where weak/missing secrets and demo mode are tolerated. Anything else
# (including typos such as "prod" or "Production ") is treated as production-like.
DEV_ENVS = frozenset({"dev", "development", "local", "test"})
MIN_SECRET_LENGTH = 16


class ConfigError(RuntimeError):
    pass


def config_problems(settings: Settings) -> list[str]:
    """Problems that make a production-like deployment unsafe. Never includes secret values."""
    if settings.app_env.strip().lower() in DEV_ENVS:
        return []
    problems = []
    for name in ("webhook_secret", "phone_hash_pepper", "dashboard_api_key"):
        value = getattr(settings, name)
        label = name.upper()
        if not value:
            problems.append(f"{label} is not set")
        elif value.startswith("change-me") or len(value) < MIN_SECRET_LENGTH:
            problems.append(f"{label} is a placeholder or shorter than {MIN_SECRET_LENGTH} chars")
    if settings.demo_mode:
        problems.append("DEMO_MODE must be false outside dev/test")
    if not settings.database_url.strip():
        problems.append("DATABASE_URL is not set")
    else:
        database_url = settings.database_url.strip().lower()
        if any(host in database_url for host in ("@localhost:", "@127.0.0.1:", "@[::1]:")):
            problems.append("DATABASE_URL must not point to localhost in production-like environments")
    return problems


def validate_settings(settings: Settings) -> None:
    problems = config_problems(settings)
    if problems:
        raise ConfigError("Unsafe configuration: " + "; ".join(problems))
