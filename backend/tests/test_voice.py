import logging

import pytest

from app.channels.voice import MENU, THANKS, WELCOME
from app.config import Settings, get_settings
from app.main import app


def voice_payload(**overrides):
    payload = {
        "sessionId": "ATUid_voice1",
        "callerNumber": "+254700000001",
    }
    payload.update(overrides)
    return payload


@pytest.fixture
def public_base():
    app.dependency_overrides[get_settings] = lambda: Settings(
        webhook_secret="test-secret",
        phone_hash_pepper="test-pepper",
        public_base_url="https://voice.example.test",
    )
    try:
        yield
    finally:
        app.dependency_overrides.clear()


def test_incoming_call_gets_welcome_and_menu(client, public_base):
    r = client.post("/voice/test-secret", data=voice_payload())
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("text/xml")
    assert "<Response>" in r.text
    assert WELCOME in r.text
    assert MENU in r.text
    assert "<GetDigits" in r.text
    assert "callbackUrl=" in r.text
    assert "https://voice.example.test/voice/" in r.text


def test_no_public_base_answers_without_dead_menu(client):
    r = client.post("/voice/test-secret", data=voice_payload())
    assert r.status_code == 200
    assert WELCOME in r.text
    assert "<GetDigits" not in r.text


def test_caller_digits_get_thanks(client):
    r = client.post("/voice/test-secret", data=voice_payload(dtmfDigits="2"))
    assert r.status_code == 200
    assert THANKS in r.text
    assert "<GetDigits" not in r.text


def test_malformed_callback_still_answers_safely(client):
    assert client.post("/voice/test-secret", data={}).status_code == 200
    r = client.post("/voice/test-secret", data={"sessionId": "x" * 500})
    assert r.status_code in (200, 422)


def test_wrong_secret_is_404(client):
    assert client.post("/voice/nope", data=voice_payload()).status_code == 404


def test_no_caller_pii_in_logs(client, caplog):
    with caplog.at_level(logging.INFO, logger="app.channels.voice"):
        client.post("/voice/test-secret", data=voice_payload())
        client.post("/voice/test-secret", data=voice_payload(dtmfDigits="3"))
    logged = "\n".join(record.getMessage() for record in caplog.records)
    assert "+254700000001" not in logged
    assert "test-secret" not in logged
