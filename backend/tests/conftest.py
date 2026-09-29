import os

os.environ["WEBHOOK_SECRET"] = "test-secret"
os.environ["PHONE_HASH_PEPPER"] = "test-pepper"
os.environ["AI_ENABLED"] = "false"
os.environ["STT_PROVIDER"] = "fake"

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def at_payload(text: str = "", session: str = "ATUid_test1") -> dict:
    return {
        "sessionId": session,
        "serviceCode": "*384*1234#",
        "phoneNumber": "+254700000001",
        "networkCode": "99999",
        "text": text,
    }
