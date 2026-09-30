import pytest
from fastapi.testclient import TestClient

from app.config import ConfigError, Settings, config_problems, validate_settings

GOOD = dict(
    app_env="production",
    webhook_secret="w" * 32,
    phone_hash_pepper="p" * 32,
    dashboard_api_key="d" * 32,
    database_url="postgresql+psycopg://u:p@db.example:5432/app",
    demo_mode=False,
)


def test_good_production_config_passes():
    validate_settings(Settings(**GOOD))


@pytest.mark.parametrize("env", ["dev", "development", "local", "test", " Dev "])
def test_dev_envs_tolerate_weak_config(env):
    assert config_problems(Settings(app_env=env, demo_mode=True)) == []


@pytest.mark.parametrize("field", ["webhook_secret", "phone_hash_pepper", "dashboard_api_key"])
def test_missing_secret_is_rejected(field):
    with pytest.raises(ConfigError, match=field.upper()):
        validate_settings(Settings(**{**GOOD, field: ""}))


def test_placeholder_and_short_secrets_rejected():
    assert config_problems(Settings(**{**GOOD, "webhook_secret": "change-me-long-random"}))
    assert config_problems(Settings(**{**GOOD, "phone_hash_pepper": "short"}))


def test_demo_mode_rejected_in_production():
    with pytest.raises(ConfigError, match="DEMO_MODE"):
        validate_settings(Settings(**{**GOOD, "demo_mode": True}))


@pytest.mark.parametrize("env", ["prod", "Production ", "staging", ""])
def test_unknown_env_is_treated_as_production(env):
    assert config_problems(Settings(**{**GOOD, "app_env": env, "webhook_secret": ""}))


def test_error_message_never_contains_secret_values():
    with pytest.raises(ConfigError) as exc:
        validate_settings(Settings(**{**GOOD, "webhook_secret": "change-me-SUPERSECRET"}))
    assert "SUPERSECRET" not in str(exc.value)


def test_app_refuses_to_start_when_unsafe(monkeypatch):
    from app import config, main

    bad = Settings(app_env="production", webhook_secret="", phone_hash_pepper="", dashboard_api_key="")
    monkeypatch.setattr(main, "get_settings", lambda: bad)
    with pytest.raises(ConfigError):
        with TestClient(main.app):
            pass
