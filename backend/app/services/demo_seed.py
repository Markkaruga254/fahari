"""Synthetic demo data generator for Gate 4b.

Usage:
    python -m app.services.demo_seed
    python -m app.services.demo_seed --reset

The generator is deliberately restricted to demo mode outside production.
Synthetic rows are marked with a non-colliding phone-hash prefix and can be
reset without touching real submissions.
"""

from __future__ import annotations

import random
import sys
from datetime import datetime, timedelta, timezone
from hashlib import sha256

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.ai.extractor import KeywordExtractor
from app.config import Settings, get_settings
from app.db.models import Base, Submission, SubmissionEnrichment
from app.db.session import get_engine
from app.synthetic import SYNTHETIC_PREFIX, is_synthetic

SEED = 2026
WINDOW_DAYS = 30

WARDS: dict[str, tuple[int, dict[str, int]]] = {
    "Changamwe": (120, {"roads": 45, "health": 30, "water": 20, "education": 10}),
    "Likoni": (90, {"water": 35, "roads": 25, "health": 25, "education": 10}),
    "Jomvu Kuu": (40, {"health": 22, "water": 10, "roads": 8}),
    "Miritini": (25, {"water": 15, "roads": 6, "health": 4}),
    "Port Reitz": (15, {"education": 9, "health": 5}),
    "Mtongwe": (10, {"water": 8, "roads": 2}),
}

DESCRIPTIONS: dict[str, tuple[str, ...]] = {
    "water": (
        "Hakuna maji kwa wiki mbili",
        "No water in the taps for three days",
        "Bomba limepasuka na maji yanapotea",
        "The borehole pump has broken down",
    ),
    "roads": (
        "Barabara imejaa mashimo",
        "Big potholes on the main road near the market",
        "Daraja limeharibika, watoto hawawezi kuvuka",
        "The bridge is unsafe after the rains",
    ),
    "health": (
        "Zahanati haina dawa",
        "Clinic has no medicine and only one nurse",
        "Hospitali iko mbali sana",
        "No ambulance available at night",
    ),
    "education": (
        "Darasa limejaa, watoto wanakaa chini",
        "School has no teachers for science",
        "Shule haina madawati ya kutosha",
        "Classroom roof leaks when it rains",
    ),
}


class SeedNotAllowed(RuntimeError):
    """Raised when demo seeding is attempted outside the safe environment."""


def assert_seed_allowed(settings: Settings) -> None:
    if not settings.demo_mode or settings.app_env.lower() == "production":
        raise SeedNotAllowed("Synthetic demo seeding requires DEMO_MODE=true and non-production APP_ENV")


def _resident_hash(ward: str, index: int) -> str:
    digest = sha256(f"{SEED}:{ward}:{index}".encode()).hexdigest()[:16]
    return SYNTHETIC_PREFIX + digest


def synthetic_count(db: Session) -> int:
    return db.scalar(
        select(func.count())
        .select_from(Submission)
        .where(Submission.phone_hash.like(f"{SYNTHETIC_PREFIX}%"))
    ) or 0


def reset_synthetic(db: Session) -> int:
    ids = db.scalars(
        select(Submission.id).where(
            Submission.phone_hash.like(f"{SYNTHETIC_PREFIX}%")
        )
    ).all()
    if ids:
        db.execute(
            delete(SubmissionEnrichment).where(SubmissionEnrichment.submission_id.in_(ids))
        )
    result = db.execute(
        delete(Submission).where(Submission.phone_hash.like(f"{SYNTHETIC_PREFIX}%"))
    )
    db.commit()
    return result.rowcount or 0


def build_submissions(now: datetime) -> list[Submission]:
    rng = random.Random(SEED)
    submissions: list[Submission] = []

    for ward, (resident_count, category_weights) in WARDS.items():
        residents = list(range(resident_count))
        rng.shuffle(residents)
        for category, count in category_weights.items():
            selected = residents[: min(count, resident_count)]
            for index in selected:
                reports = 1 + int(rng.random() < 0.3) + int(rng.random() < 0.1)
                for _ in range(reports):
                    age_days = int(WINDOW_DAYS * rng.random() ** 1.5)
                    created_at = now - timedelta(
                        days=age_days,
                        hours=rng.randrange(24),
                        minutes=rng.randrange(60),
                    )
                    submissions.append(
                        Submission(
                            phone_hash=_resident_hash(ward, index),
                            ward=ward,
                            category=category,
                            description=rng.choice(DESCRIPTIONS[category]),
                            status="received",
                            created_at=created_at,
                        )
                    )
    return submissions


def seed(
    db: Session,
    now: datetime,
    extractor: KeywordExtractor | None = None,
    reset: bool = False,
) -> dict[str, int | bool]:
    if reset:
        reset_synthetic(db)
    if synthetic_count(db):
        return {"seeded": 0, "synthetic_rows": synthetic_count(db), "skipped": True}

    extractor = extractor or KeywordExtractor()
    submissions = build_submissions(now)
    db.add_all(submissions)
    db.flush()

    for submission in submissions:
        result = extractor.extract(submission.description)
        db.add(
            SubmissionEnrichment(
                submission_id=submission.id,
                extractor=result.extractor,
                suggested_category=result.suggested_category,
                matched_keywords=list(result.matched_keywords),
            )
        )

    db.commit()
    return {"seeded": len(submissions), "synthetic_rows": len(submissions), "skipped": False}


def main(argv: list[str] | None = None) -> int:
    argv = argv if argv is not None else sys.argv[1:]
    settings = get_settings()
    try:
        assert_seed_allowed(settings)
    except SeedNotAllowed as exc:
        print(f"Seed refused: {exc}", file=sys.stderr)
        return 2

    engine = get_engine()
    Base.metadata.create_all(bind=engine)

    from app.db.session import _SessionLocal

    with _SessionLocal() as db:
        summary = seed(
            db,
            datetime.now(timezone.utc),
            reset="--reset" in argv,
        )
    print(summary)
    return 0


if __name__ == "__main__":
    sys.exit(main())
