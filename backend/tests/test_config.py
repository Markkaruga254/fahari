from app.config import ConfigError, Settings, validate_settings


def test_missing_database_url_is_rejected_outside_dev():
    settings = Settings(_env_file=None, app_env="production", database_url="", webhook_secret="x" * 32, phone_hash_pepper="x" * 32, dashboard_api_key="x" * 32)
    try:
        validate_settings(settings)
    except ConfigError as exc:
        assert "DATABASE_URL" in str(exc)
    else:
        assert False


def test_local_database_url_is_rejected_outside_dev():
    settings = Settings(_env_file=None, app_env="production", database_url="postgresql+psycopg://u:p@localhost:5432/db", webhook_secret="x" * 32, phone_hash_pepper="x" * 32, dashboard_api_key="x" * 32)
    try:
        validate_settings(settings)
    except ConfigError as exc:
        assert "localhost" in str(exc)
    else:
        assert False
