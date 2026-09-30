"""End-to-end lifecycle against a real PostgreSQL (skipped locally if none is reachable).

Runs inside a throwaway schema, so it never touches existing data. In CI set
REQUIRE_POSTGRES=1 so an unreachable database fails the build instead of skipping.
"""

import os
import uuid
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select, text
from sqlalchemy.orm import sessionmaker

from app.config import Settings, get_settings
from app.db.models import Base, Submission, SubmissionEnrichment
from app.db.session import get_session
from app.main import app
from app.security import hash_phone
from app.services.demo_seed import reset_synthetic, seed
from app.synthetic import is_synthetic
from tests.conftest import at_payload

KEY = {"X-API-Key": "dash-key"}


@pytest.fixture
def pg():
    url = get_settings().database_url
    admin = create_engine(url)
    try:
        with admin.connect() as c:
            c.execute(text("SELECT 1"))
    except Exception as exc:
        if os.getenv("REQUIRE_POSTGRES"):
            pytest.fail(f"PostgreSQL required but unreachable: {type(exc).__name__}")
        pytest.skip("PostgreSQL not reachable")
    schema = f"it_{uuid.uuid4().hex[:12]}"
    with admin.begin() as c:
        c.execute(text(f'CREATE SCHEMA "{schema}"'))
    engine = create_engine(url, connect_args={"options": f"-csearch_path={schema}"})
    Base.metadata.create_all(engine)
    yield sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    engine.dispose()
    with admin.begin() as c:
        c.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
    admin.dispose()


@pytest.fixture
def client(pg):
    db = pg()

    def override():
        yield db

    app.dependency_overrides[get_session] = override
    app.dependency_overrides[get_settings] = lambda: Settings(
        webhook_secret="test-secret",
        phone_hash_pepper="test-pepper",
        dashboard_api_key="dash-key",
        app_env="test",
    )
    yield TestClient(app), db
    app.dependency_overrides.clear()
    db.close()


def dial(c, phone, text_, session="S1"):
    p = at_payload(text_, session)
    p["phoneNumber"] = phone
    r = c.post("/ussd/test-secret", data=p)
    assert r.status_code == 200
    return r.text


def test_full_lifecycle_on_postgres(client):
    c, db = client

    # Mombasa residents report through the real USSD webhook (Swahili + English, retries, formats)
    assert dial(c, "+254711000001", "").startswith("CON Welcome")
    assert dial(c, "+254711000001", "1*Likoni*9").startswith("CON Invalid category")
    assert dial(c, "+254711000001", "1*Likoni*9*1*Hakuna maji kwa wiki mbili*1").startswith("END Thank you")
    # same resident, different number format, same report -> replay, not a second row
    dial(c, "0711000001", "1*Likoni*1*Hakuna maji kwa wiki mbili*1")
    dial(c, "+254711000002", "1*Likoni*1*Bomba limepasuka*1")
    dial(c, "+254711000003", "1*Changamwe*2*Barabara imejaa mashimo*1")
    dial(c, "+254711000004", "1*Changamwe*2*Big potholes near the market*1")

    rows = db.scalars(select(Submission)).all()
    assert len(rows) == 4  # replay collapsed
    assert {r.ward for r in rows} == {"Likoni", "Changamwe"}
    assert all(len(r.phone_hash) == 64 and not is_synthetic(r.phone_hash) for r in rows)
    assert not any("+2547" in r.phone_hash for r in rows)
    enr = {e.submission_id: e for e in db.scalars(select(SubmissionEnrichment)).all()}
    assert len(enr) == 4 and {e.suggested_category for e in enr.values()} == {"water", "roads"}

    # priorities: key required, real-only data is not labelled synthetic, no PII
    assert c.get("/priorities").status_code == 401
    body = c.get("/priorities", headers=KEY).json()
    assert body["reports_considered"] == 4 and body["contains_synthetic_data"] is False
    top = {(i["ward"], i["category"]): i for i in body["items"]}
    assert top[("Likoni", "water")]["reporters"] == 2
    assert "phone" not in str(body).lower() and "hash" not in str(body).lower()

    # synthetic demo data mixes in, is disclosed, and reset removes only synthetic rows
    real_hash = hash_phone("+254711000001", "test-pepper")
    summary = seed(db, datetime.now(timezone.utc))
    assert summary["seeded"] > 100
    assert seed(db, datetime.now(timezone.utc))["skipped"] is True  # idempotent
    body = c.get("/priorities", headers=KEY).json()
    assert body["contains_synthetic_data"] is True
    assert body["synthetic_reports"] == summary["seeded"]
    assert body["reports_considered"] == summary["seeded"] + 4

    assert reset_synthetic(db) == summary["seeded"]
    assert db.scalar(select(func.count()).select_from(Submission)) == 4
    assert db.scalar(select(Submission.id).where(Submission.phone_hash == real_hash)) is not None
    assert db.scalar(select(func.count()).select_from(SubmissionEnrichment)) == 4  # no orphans
    assert c.get("/priorities", headers=KEY).json()["contains_synthetic_data"] is False
