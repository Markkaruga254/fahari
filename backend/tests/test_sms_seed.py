from datetime import datetime, timezone

import pytest
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.models import Base, SmsReceipt, Submission
from app.services.demo_seed import (
    SMS_DEMO_PREFIX,
    SeedNotAllowed,
    reset_synthetic,
    seed_sms,
    sms_demo_count,
)

PEPPER = "test-pepper-seed"


@pytest.fixture
def db():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)()
    try:
        yield session
    finally:
        session.close()


def test_sms_seed_stores_unique_and_skips_duplicates(db):
    summary = seed_sms(db, datetime.now(timezone.utc), PEPPER)
    assert summary["sms_seeded"] == 36
    assert summary["duplicates_skipped"] == 4
    assert sms_demo_count(db) == 36


def test_sms_seed_rows_are_synthetic_and_hashed(db):
    seed_sms(db, datetime.now(timezone.utc), PEPPER)
    rows = db.scalars(select(SmsReceipt)).all()
    assert rows
    for row in rows:
        assert row.at_id is not None and row.at_id.startswith(SMS_DEMO_PREFIX)
        assert len(row.phone_hash) == 64 and all(
            c in "0123456789abcdef" for c in row.phone_hash
        )
        assert len(row.text_sha) == 64
        assert row.received_at is not None
    # Receipt-only: seeding SMS never manufactures planning submissions.
    assert db.scalar(select(func.count()).select_from(Submission)) == 0


def test_sms_seed_is_idempotent(db):
    first = seed_sms(db, datetime.now(timezone.utc), PEPPER)
    second = seed_sms(db, datetime.now(timezone.utc), PEPPER)
    assert second["skipped"] is True
    assert sms_demo_count(db) == first["sms_seeded"] == 36


def test_sms_seed_reset_clears_demo_rows(db):
    seed_sms(db, datetime.now(timezone.utc), PEPPER)
    seed_sms(db, datetime.now(timezone.utc), PEPPER, reset=True)
    assert sms_demo_count(db) == 36


def test_reset_synthetic_clears_demo_sms(db):
    seed_sms(db, datetime.now(timezone.utc), PEPPER)
    reset_synthetic(db)
    assert sms_demo_count(db) == 0


def test_sms_seed_requires_pepper(db):
    with pytest.raises(SeedNotAllowed):
        seed_sms(db, datetime.now(timezone.utc), "")
