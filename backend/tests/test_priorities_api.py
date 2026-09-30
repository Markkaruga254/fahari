from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import Settings, get_settings
from app.db.models import Base, Submission
from app.db.session import get_session
from app.main import app

KEY = {"X-API-Key": "dash-key"}
NOW = datetime.now(timezone.utc)


@pytest.fixture
def seeded(client):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def add(ward, category, phone, age_days=1):
        with SessionLocal() as s:
            s.add(Submission(phone_hash=phone * 64, ward=ward, category=category, description="d",
                             created_at=NOW - timedelta(days=age_days)))
            s.commit()

    for p in "abcd":
        add("Jomvu", "water", p)
    add("Jomvu", "roads", "e")
    add("Miritini", "health", "f")
    add("Miritini", "health", "g", age_days=200)

    def override():
        s = SessionLocal()
        try:
            yield s
        finally:
            s.close()

    app.dependency_overrides[get_session] = override
    app.dependency_overrides[get_settings] = lambda: Settings(dashboard_api_key="dash-key")
    yield client
    app.dependency_overrides.clear()


def test_requires_api_key(seeded):
    assert seeded.get("/priorities").status_code == 401
    assert seeded.get("/priorities", headers={"X-API-Key": "wrong"}).status_code == 401


def test_fails_closed_when_key_not_configured(seeded):
    app.dependency_overrides[get_settings] = lambda: Settings(dashboard_api_key="")
    assert seeded.get("/priorities", headers=KEY).status_code == 503


def test_returns_ranked_items_with_receipts_and_no_pii(seeded):
    r = seeded.get("/priorities", headers=KEY)
    assert r.status_code == 200
    body = r.json()
    assert body["window_days"] == 90 and body["reports_considered"] == 6
    assert body["method"]["weights"]["ward_share"] == 0.3
    top = body["items"][0]
    assert (top["rank"], top["ward"], top["category"], top["reporters"]) == (1, "Jomvu", "water", 4)
    assert set(top["components"]) == {"voice", "ward_share", "persistence", "spread"}
    assert "phone" not in r.text and "a" * 64 not in r.text


def test_days_window_filters_old_reports(seeded):
    default = seeded.get("/priorities", headers=KEY).json()
    wide = seeded.get("/priorities?days=365", headers=KEY).json()
    health = lambda b: next(i for i in b["items"] if i["category"] == "health")["reporters"]
    assert health(default) == 1 and health(wide) == 2


def test_ward_filter_is_case_insensitive_and_keeps_global_rank(seeded):
    full = seeded.get("/priorities", headers=KEY).json()["items"]
    filtered = seeded.get("/priorities?ward=%20MIRITINI", headers=KEY).json()["items"]
    assert [i["ward"] for i in filtered] == ["Miritini"]
    assert filtered[0]["rank"] == next(i for i in full if i["ward"] == "Miritini")["rank"]


def test_limit_and_validation(seeded):
    assert len(seeded.get("/priorities?limit=1", headers=KEY).json()["items"]) == 1
    for bad in ("days=0", "days=366", "limit=0", "limit=101"):
        assert seeded.get(f"/priorities?{bad}", headers=KEY).status_code == 422


def test_empty_database_returns_empty_list(client):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    app.dependency_overrides[get_session] = lambda: SessionLocal()
    app.dependency_overrides[get_settings] = lambda: Settings(dashboard_api_key="dash-key")
    try:
        r = client.get("/priorities", headers=KEY)
    finally:
        app.dependency_overrides.clear()
    assert r.status_code == 200 and r.json()["items"] == []
