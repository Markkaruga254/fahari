import hashlib

import pytest
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.models import Base, SmsReceipt, Submission
from app.db.session import get_session
from app.main import app


def sms_payload(**overrides):
    payload = {
        "from": "+254700000001",
        "text": "MAJI Miritini Central pampu imevunjika",
        "id": "ATUid_sms1",
        "date": "2026-09-30 10:00",
    }
    payload.update(overrides)
    return payload


@pytest.fixture
def sms_db():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    db = Session()

    def override_session():
        yield db

    app.dependency_overrides[get_session] = override_session
    try:
        yield db
    finally:
        app.dependency_overrides.clear()
        db.close()


def receipt_count(db):
    return db.scalar(select(func.count()).select_from(SmsReceipt)) or 0


def test_valid_sms_returns_200_and_one_receipt(client, sms_db):
    r = client.post("/sms/test-secret", data=sms_payload())
    assert r.status_code == 200
    assert receipt_count(sms_db) == 1
    receipt = sms_db.scalar(select(SmsReceipt))
    assert receipt.at_id == "ATUid_sms1"
    assert len(receipt.phone_hash) == 64
    assert receipt.phone_hash != "+254700000001"
    assert receipt.text_sha == hashlib.sha256(sms_payload()["text"].encode()).hexdigest()
    # Receipt-only: no Submission manufactured from a ward-less SMS.
    assert sms_db.scalar(select(func.count()).select_from(Submission)) == 0


def test_duplicate_message_id_is_one_effect(client, sms_db):
    for _ in range(2):
        assert client.post("/sms/test-secret", data=sms_payload()).status_code == 200
    assert receipt_count(sms_db) == 1


def test_missing_id_falls_back_to_window_dedupe(client, sms_db):
    first = sms_payload()
    del first["id"]
    assert client.post("/sms/test-secret", data=first).status_code == 200
    assert client.post("/sms/test-secret", data=dict(first)).status_code == 200
    assert receipt_count(sms_db) == 1
    other = dict(first, text="BARABARA Jomvu Kuu imeharibika")
    assert client.post("/sms/test-secret", data=other).status_code == 200
    assert receipt_count(sms_db) == 2


def test_missing_phone_is_ignored_safely(client, sms_db):
    assert client.post("/sms/test-secret", data=sms_payload(**{"from": ""})).status_code == 200
    assert receipt_count(sms_db) == 0


def test_missing_or_empty_text_is_ignored_safely(client, sms_db):
    assert client.post("/sms/test-secret", data=sms_payload(text="")).status_code == 200
    assert client.post("/sms/test-secret", data=sms_payload(text="   ")).status_code == 200
    assert receipt_count(sms_db) == 0


def test_wrong_secret_is_404_and_stores_nothing(client, sms_db):
    assert client.post("/sms/nope", data=sms_payload()).status_code == 404
    assert receipt_count(sms_db) == 0


def test_phone_formats_share_one_hash(client, sms_db):
    assert client.post("/sms/test-secret", data=sms_payload(**{"from": "0700000001", "id": "A1"})).status_code == 200
    assert client.post("/sms/test-secret", data=sms_payload(**{"from": "+254700000001", "id": "A2"})).status_code == 200
    hashes = {r.phone_hash for r in sms_db.scalars(select(SmsReceipt)).all()}
    assert len(hashes) == 1


def test_oversized_text_rejected_without_row_or_crash(client, sms_db):
    r = client.post("/sms/test-secret", data=sms_payload(text="x" * 2000))
    assert r.status_code == 422
    assert receipt_count(sms_db) == 0


def test_ussd_still_works_alongside_sms(client, sms_db):
    from tests.conftest import at_payload

    assert client.post("/sms/test-secret", data=sms_payload()).status_code == 200
    r = client.post("/ussd/test-secret", data=at_payload())
    assert r.status_code == 200
    assert r.text.startswith("CON ")
