import uuid

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import Settings, get_settings
from app.db.models import Base, Submission
from app.db.session import get_session
from app.main import app
from app.notify import factory
from app.notify.factory import get_notifier
from app.notify.fake import FakeNotifier
from app.services.confirmation import build_confirmation_message, send_confirmation
from tests.conftest import at_payload

FULL_FLOW = "1*Jomvu*3*Clinic has no water*1"
SUCCESS = "END Thank you. Your development need has been recorded."
PHONE = "+254700000001"


@pytest.fixture
def db_override():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def override():
        s = SessionLocal()
        try:
            yield s
        finally:
            s.close()

    app.dependency_overrides[get_session] = override
    yield SessionLocal
    app.dependency_overrides.clear()


def use_notifier(notifier):
    app.dependency_overrides[get_notifier] = lambda: notifier


# Message ---------------------------------------------------------------------
def test_message_is_short_fixed_and_carries_ref_only():
    sid = uuid.UUID("3f9a1c2b-0000-4000-8000-000000000000")
    msg = build_confirmation_message(sid)
    assert msg.endswith("Ref: 3F9A1C2B")
    assert len(msg) <= 160
    assert msg.isascii()


# USSD wiring -----------------------------------------------------------------
def test_completed_report_sends_one_sms_with_matching_ref(client, db_override):
    fake = FakeNotifier()
    use_notifier(fake)
    response = client.post("/ussd/test-secret", data=at_payload(FULL_FLOW))

    assert response.text == SUCCESS
    assert len(fake.sent) == 1
    phone, message = fake.sent[0]
    assert phone == PHONE
    with db_override() as db:
        sub = db.scalars(select(Submission)).one()
    assert message.endswith(str(sub.id).replace("-", "")[:8].upper())
    assert "Clinic" not in message and "Jomvu" not in message


@pytest.mark.parametrize(
    "text", ["", "1", "1*Jomvu", "1*Jomvu*3", "1*Jomvu*3*Clinic has no water", "1*Jomvu*3*Clinic has no water*2", "2"]
)
def test_incomplete_or_cancelled_flows_send_no_sms(client, db_override, text):
    fake = FakeNotifier()
    use_notifier(fake)
    client.post("/ussd/test-secret", data=at_payload(text))
    assert fake.sent == []


def test_no_notifier_configured_is_a_clean_noop(client, db_override):
    use_notifier(None)
    response = client.post("/ussd/test-secret", data=at_payload(FULL_FLOW))
    assert response.text == SUCCESS
    with db_override() as db:
        assert len(db.scalars(select(Submission)).all()) == 1


class BoomNotifier:
    def send_sms(self, phone, message):
        raise RuntimeError(f"gateway down for {phone}")


def test_notifier_exception_never_breaks_ussd_or_leaks_phone(client, db_override, caplog):
    use_notifier(BoomNotifier())
    response = client.post("/ussd/test-secret", data=at_payload(FULL_FLOW))

    assert response.status_code == 200
    assert response.text == SUCCESS
    with db_override() as db:
        assert len(db.scalars(select(Submission)).all()) == 1
    assert "error=RuntimeError" in caplog.text
    assert "submission_id=" in caplog.text
    assert PHONE not in caplog.text and "gateway down" not in caplog.text


# Direct service behaviour ------------------------------------------------------
def test_gateway_rejection_returned_as_data_is_flagged_without_phone(caplog):
    class RejectingNotifier:
        def send_sms(self, phone, message):
            return {"SMSMessageData": {"Recipients": [{"statusCode": 403, "status": "InvalidPhoneNumber", "number": phone}]}}

    assert send_confirmation(RejectingNotifier(), PHONE, uuid.uuid4()) is False
    assert "status_code=403" in caplog.text
    assert PHONE not in caplog.text


def test_accepted_gateway_response_and_unknown_shape_are_ok():
    class OkNotifier:
        def send_sms(self, phone, message):
            return {"SMSMessageData": {"Recipients": [{"statusCode": 101, "status": "Success"}]}}

    assert send_confirmation(OkNotifier(), PHONE, uuid.uuid4()) is True
    assert send_confirmation(FakeNotifier(), PHONE, uuid.uuid4()) is True


# Factory: off unless explicitly enabled and configured -----------------------------
@pytest.mark.parametrize(
    "kwargs",
    [{}, {"sms_enabled": True}, {"at_api_key": "k"}],  # disabled / no key / not enabled
)
def test_factory_returns_none_unless_enabled_and_keyed(kwargs):
    assert get_notifier(Settings(**kwargs)) is None


def test_factory_builds_real_notifier_when_enabled_and_keyed(monkeypatch):
    built = []
    monkeypatch.setattr(factory, "_build_at_notifier", lambda *a: built.append(a) or "AT")
    s = Settings(sms_enabled=True, at_api_key="k", at_username="sandbox", at_sender_id="")
    assert get_notifier(s) == "AT"
    assert built == [("sandbox", "k", "")]


def test_factory_swallows_adapter_init_failure(monkeypatch):
    import app.notify.africastalking_sms as at

    class Bad:
        def __init__(self, *a):
            raise RuntimeError("init boom")

    monkeypatch.setattr(at, "ATNotifier", Bad)
    factory._build_at_notifier.cache_clear()
    assert factory._build_at_notifier("sandbox", "k", "") is None
    factory._build_at_notifier.cache_clear()
