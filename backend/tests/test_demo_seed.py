from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.priorities import get_priorities
from app.config import Settings
from app.db.models import Base, Submission, SubmissionEnrichment
from app.services.demo_seed import (
    WARDS,
    SeedNotAllowed,
    assert_seed_allowed,
    build_submissions,
    reset_synthetic,
    seed,
    synthetic_count,
)
from app.synthetic import SYNTHETIC_PREFIX, is_synthetic

NOW = datetime(2026, 9, 30, 12, 0, tzinfo=timezone.utc)
KEY = {"X-API-Key": "dash-key"}


@pytest.fixture
def SessionLocal():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def add_real(db):
    db.add(
        Submission(
            phone_hash="f" * 64,
            ward="Jomvu Kuu",
            category="water",
            description="real report",
            status="received",
            created_at=NOW,
        )
    )
    db.commit()


def test_seed_guard_defaults_and_production():
    with pytest.raises(SeedNotAllowed):
        assert_seed_allowed(Settings())
    with pytest.raises(SeedNotAllowed):
        assert_seed_allowed(Settings(demo_mode=True, app_env="Production"))
    assert_seed_allowed(Settings(demo_mode=True, app_env="dev"))


def test_generated_data_is_valid():
    rows = build_submissions(NOW)
    assert len(rows) > 100
    for row in rows:
        assert row.phone_hash.startswith(SYNTHETIC_PREFIX)
        assert len(row.phone_hash) <= 64
        assert not row.phone_hash == "f" * 64
        assert row.category in {"water", "roads", "health", "education", "other"}
        assert row.ward in WARDS
        assert 3 <= len(row.description) <= 200
        assert row.created_at <= NOW


def test_generation_is_deterministic():
    a = build_submissions(NOW)
    b = build_submissions(NOW)
    assert [
        (x.phone_hash, x.ward, x.category, x.description, x.created_at) for x in a
    ] == [
        (x.phone_hash, x.ward, x.category, x.description, x.created_at) for x in b
    ]


def test_synthetic_marker():
    assert is_synthetic(SYNTHETIC_PREFIX + "abc")
    assert not is_synthetic("f" * 64)


def test_seed_creates_enrichment(SessionLocal):
    with SessionLocal() as db:
        summary = seed(db, NOW)
        assert summary["seeded"] > 100
        rows = db.scalars(
            select(Submission).where(Submission.phone_hash.like(f"{SYNTHETIC_PREFIX}%"))
        ).all()
        enrichments = db.scalars(select(SubmissionEnrichment)).all()
        assert len(rows) == len(enrichments) == summary["seeded"]


def test_seed_is_idempotent(SessionLocal):
    with SessionLocal() as db:
        first = seed(db, NOW)
        second = seed(db, NOW)
        assert first["seeded"] > 100
        assert second["skipped"] is True
        assert second["seeded"] == 0
        assert synthetic_count(db) == first["seeded"]


def test_reset_removes_only_synthetic(SessionLocal):
    with SessionLocal() as db:
        add_real(db)
        first = seed(db, NOW)
        removed = reset_synthetic(db)
        assert removed == first["seeded"]
        assert synthetic_count(db) == 0
        assert db.scalar(select(Submission).where(Submission.phone_hash == "f" * 64)) is not None
        assert db.scalar(select(SubmissionEnrichment)) is None


def test_reset_then_reseed(SessionLocal):
    with SessionLocal() as db:
        first = seed(db, NOW)
        reset_synthetic(db)
        second = seed(db, NOW)
        assert second["seeded"] == first["seeded"]


def test_reset_alone_leaves_real(SessionLocal):
    with SessionLocal() as db:
        add_real(db)
        assert reset_synthetic(db) == 0
        assert db.scalar(select(Submission).where(Submission.phone_hash == "f" * 64)) is not None


def _api(SessionLocal):
    from app.main import app
    from app.db.session import get_session
    from app.config import get_settings

    db = SessionLocal()

    def override_session():
        yield db

    app.dependency_overrides[get_session] = override_session
    app.dependency_overrides[get_settings] = lambda: Settings(
        dashboard_api_key="dash-key",
        app_env="test",
    )
    return TestClient(app), db, app


def test_priorities_api_discloses_synthetic_data(SessionLocal):
    client, db, app = _api(SessionLocal)
    try:
        seed(db, NOW)
        response = client.get("/priorities", headers=KEY)
        assert response.status_code == 200
        data = response.json()
        assert data["contains_synthetic_data"] is True
        assert data["synthetic_reports"] == data["reports_considered"] > 100
        small = {"Miritini", "Mtongwe", "Jomvu Kuu", "Port Reitz"}
        assert sum(item["ward"] in small for item in data["items"][:5]) >= 3
    finally:
        app.dependency_overrides.clear()
        db.close()


def test_priorities_api_real_only_has_no_synthetic_data(SessionLocal):
    client, db, app = _api(SessionLocal)
    try:
        add_real(db)
        response = client.get("/priorities", headers=KEY)
        assert response.status_code == 200
        data = response.json()
        assert data["contains_synthetic_data"] is False
        assert data["synthetic_reports"] == 0
        assert data["reports_considered"] == 1
    finally:
        app.dependency_overrides.clear()
        db.close()



@pytest.mark.parametrize("env", ["production", "Production", "Production ", "prod", "staging", ""])
def test_seed_guard_is_allowlist(env):
    with pytest.raises(SeedNotAllowed):
        assert_seed_allowed(Settings(demo_mode=True, app_env=env))
