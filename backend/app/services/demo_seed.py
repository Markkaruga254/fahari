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
from app.db.models import Base, SmsReceipt, Submission, SubmissionEnrichment
from app.db.session import get_engine
from app.security import hash_phone
from app.synthetic import SYNTHETIC_PREFIX, is_synthetic

SEED = 2026
WINDOW_DAYS = 30

# (residents in the ward, reporters per category). Big wards have needs spread across many
# categories; small wards have one concentrated need. That contrast is what the demo shows:
# equity-aware scoring lets a concentrated need in a small ward outrank a diffuse one in a big ward.
WARDS: dict[str, tuple[int, dict[str, int]]] = {
    "Changamwe": (120, {"roads": 26, "health": 12, "water": 8, "education": 4, "other": 6}),
    "Likoni": (90, {"water": 22, "roads": 10, "health": 8, "education": 4, "other": 5}),
    "Jomvu Kuu": (40, {"health": 22, "water": 10, "roads": 8, "other": 4}),
    "Miritini": (25, {"water": 15, "roads": 6, "health": 4, "other": 3}),
    "Port Reitz": (15, {"education": 9, "health": 5, "other": 3}),
    "Mtongwe": (10, {"water": 8, "roads": 2, "other": 2}),
}

DESCRIPTIONS: dict[str, tuple[str, ...]] = {
    "water": (
        "Hakuna maji kwa wiki mbili",
        "No water in the taps for three days",
        "Bomba limepasuka na maji yanapotea",
        "The borehole pump has broken down",
        "Kisima cha jamii kimekauka, tunatembea umbali mrefu kutafuta maji",
        "Water kiosk closed for a week, vendors selling at double price",
        "Maji ni machafu na yanatoa harufu mbaya",
        "Only one working tap at the Changamwe water point for hundreds of us",
    ),
    "roads": (
        "Barabara imejaa mashimo",
        "Big potholes on the main road near the market",
        "Daraja limeharibika, watoto hawawezi kuvuka",
        "The bridge is unsafe after the rains",
        "Mvua ikinyesha barabara inafurika, magari hayawezi kupita",
        "Drainage blocked by plastic waste, floods into stalls every afternoon",
        "No street lights on the market road, matatu drivers speed at night",
        "The bus stop shelter collapsed, passengers wait in the rain",
    ),
    "health": (
        "Zahanati haina dawa",
        "Clinic has no medicine and only one nurse",
        "Hospitali iko mbali sana",
        "No ambulance available at night",
        "Mama wajawazito wanalazimika kutembea mbali kufika kliniki",
        "The dispensary fridge for vaccines has no power",
    ),
    "education": (
        "Darasa limejaa, watoto wanakaa chini",
        "School has no teachers for science",
        "Shule haina madawati ya kutosha",
        "Classroom roof leaks when it rains",
        "No toilets at the primary school, pupils use the bush",
        "Shule ya msingi haina uzio, wanyama wanaingia uwanjani",
    ),
    "other": (
        "Takataka hazijachukuliwa kwa wiki tatu sokoni",
        "Garbage piles behind the market stalls, the smell is unbearable",
        "No security lights at the stage, theft every night",
        "Vijana hawana ajira, tunahitaji mafunzo ya ufundi",
        "Market latrines are full and locked, traders suffer",
        "The footpath has no ramp, wheelchair users cannot pass",
        "Boda stage needs lighting and a shade",
        "Soko halina maji wala vyoo safi kwa wauzaji",
    ),
}


class SeedNotAllowed(RuntimeError):
    """Raised when demo seeding is attempted outside the safe environment."""


# Allowlist, not blocklist: "prod", "Production " or any typo must not unlock seeding.
SEED_ALLOWED_ENVS = frozenset({"dev", "development", "local", "test"})


def assert_seed_allowed(settings: Settings) -> None:
    env = settings.app_env.strip().lower()
    if not settings.demo_mode or env not in SEED_ALLOWED_ENVS:
        raise SeedNotAllowed(
            "Synthetic demo seeding requires DEMO_MODE=true and APP_ENV in "
            + ", ".join(sorted(SEED_ALLOWED_ENVS))
        )


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
    db.execute(delete(SmsReceipt).where(SmsReceipt.at_id.like(f"{SMS_DEMO_PREFIX}%")))
    db.commit()
    return result.rowcount or 0


# --- Simulated inbound SMS receipts -------------------------------------
# Clearly synthetic Kenyan numbers in the 07000001xx range (same family as
# scripts/demo_ussd.sh). Every row carries a DEMO- message id so the whole
# set is identifiable and resettable; a few ids appear twice to exercise the
# endpoint's dedupe logic (second delivery is skipped, never stored twice).

SMS_DEMO_PREFIX = "DEMO-"

SMS_SENDERS: tuple[str, ...] = (
    "+254700000101",
    "+254700000102",
    "+254700000103",
    "0700000104",
    "+254700000105",
    "+254700000106",
    "0700000107",
    "+254700000108",
    "+254700000109",
    "+254700000110",
)

SMS_DEMO_TEXTS: tuple[str, ...] = (
    "MAJI Miritini hakuna maji kwa siku tatu",
    "Water taps dry in Changamwe since Monday, kiosk closed",
    "Bomba la maji limepasuka karibu na soko",
    "Big potholes on the Likoni market road, matatu stuck this morning",
    "Barabara ya Jomvu Kuu imefurika, watoto hawawezi kwenda shule",
    "Drainage blocked behind Mtongwe stalls, floods every afternoon",
    "No street lights at the Changamwe stage, theft last night",
    "Takataka sokoni Miritini haijachukuliwa wiki hii",
    "Garbage pile near Port Reitz clinic entrance smells badly",
    "Zahanati ya Jomvu Kuu haina dawa za malaria",
    "Clinic in Likoni has one nurse for the whole queue, waiting since 6am",
    "Shule ya Miritini haina madawati, watoto wanasomea chini",
    "Classroom roof at Changamwe Primary leaks onto desks when it rains",
    "Vijana wa Likoni tunaomba mafunzo ya ufundi na ajira",
    "Youth group in Mtongwe requests vocational training and tools",
    "Soko la Kongowea halina vyoo safi wala maji",
    "Market latrines full and locked, traders directed nowhere",
    "The footpath to the Likoni clinic has no ramp for wheelchairs",
    "Boda stage at Jomvu Kuu needs a shade and lighting",
    "Bus stop shelter in Changamwe collapsed in the wind, elders wait in the sun",
    "Maji ya kunywa ni machafu Likoni, watoto wanaumwa tumbo",
    "Borehole queue at Miritini takes four hours every morning",
    "Bridge rails broken near the school crossing in Jomvu Kuu",
    "Daraja la watoto kuvuka mto limeharibika kabisa",
    "Ambulance did not come to Mtongwe last night",
    "Gari la wagonjwa halikufika Mtongwe usiku",
    "School fence down at Port Reitz, goats in the compound",
    "Uzio wa shule umeanguka Port Reitz, mbuzi wanaingia darasani",
    "Sokoni hakuna mahali pa kutupa taka, watu wanatupa barabarani",
    "Vendors at Likoni market have nowhere to dump waste",
    "Street light outside the Likoni dispensary dead for a month",
    "Taa ya barabarani nje ya zahanati imezima mwezi mzima",
    "Public toilet at the bus stage locked for weeks",
    "Choo cha umma kimefungwa wiki kadhaa bila taarifa",
    "Flood water entered three shops near the Changamwe roundabout last night, traders lost stock and are asking for drainage clearing before the next rains",
    "Tulipata ahadi ya bomba jipya la maji mwaka jana lakini hadi leo hakuna kilichofanyika, sasa watoto wanalazimika kuchota maji mtoni ambao ni machafu na hatari kwa afya zao",
)

# Duplicate deliveries carry the identical body, like a real provider retry.
SMS_DEMO_DUPLICATES: tuple[tuple[str, str], ...] = (
    (f"{SMS_DEMO_PREFIX}0003", SMS_DEMO_TEXTS[2]),
    (f"{SMS_DEMO_PREFIX}0011", SMS_DEMO_TEXTS[10]),
    (f"{SMS_DEMO_PREFIX}0020", SMS_DEMO_TEXTS[19]),
    (f"{SMS_DEMO_PREFIX}0031", SMS_DEMO_TEXTS[30]),
)

SMS_DEMO_IDS: tuple[str, ...] = tuple(
    f"{SMS_DEMO_PREFIX}{i:04d}" for i in range(1, len(SMS_DEMO_TEXTS) + 1)
) + tuple(at_id for at_id, _ in SMS_DEMO_DUPLICATES)

SMS_DEMO_BODIES: tuple[str, ...] = SMS_DEMO_TEXTS + tuple(
    text for _, text in SMS_DEMO_DUPLICATES
)


def sms_demo_count(db: Session) -> int:
    return db.scalar(
        select(func.count())
        .select_from(SmsReceipt)
        .where(SmsReceipt.at_id.like(f"{SMS_DEMO_PREFIX}%"))
    ) or 0


def build_sms_receipts(now: datetime, pepper: str) -> list[SmsReceipt]:
    import hashlib as _hashlib

    receipts: list[SmsReceipt] = []
    for n, (at_id, text) in enumerate(zip(SMS_DEMO_IDS, SMS_DEMO_BODIES)):
        sender = SMS_SENDERS[n % len(SMS_SENDERS)]
        receipts.append(
            SmsReceipt(
                at_id=at_id,
                phone_hash=hash_phone(sender, pepper),
                text_sha=_hashlib.sha256(text.encode("utf-8")).hexdigest(),
                received_at=now - timedelta(
                    days=(n * 7) % WINDOW_DAYS,
                    hours=(n * 5) % 24,
                    minutes=(n * 11) % 60,
                ),
            )
        )
    return receipts


def seed_sms(
    db: Session,
    now: datetime,
    pepper: str,
    reset: bool = False,
) -> dict[str, int | bool]:
    if reset:
        db.execute(delete(SmsReceipt).where(SmsReceipt.at_id.like(f"{SMS_DEMO_PREFIX}%")))
        db.commit()
    if sms_demo_count(db):
        return {"sms_seeded": 0, "sms_rows": sms_demo_count(db), "skipped": True}
    if not pepper:
        raise SeedNotAllowed("SMS seeding needs PHONE_HASH_PEPPER (real hashing only)")

    seen: set[str] = set()
    stored = 0
    skipped = 0
    for receipt in build_sms_receipts(now, pepper):
        assert receipt.at_id is not None
        if receipt.at_id in seen or db.scalar(
            select(SmsReceipt.id).where(SmsReceipt.at_id == receipt.at_id).limit(1)
        ):
            skipped += 1  # duplicate delivery: same outcome, no second row
            continue
        seen.add(receipt.at_id)
        db.add(receipt)
        stored += 1
    db.commit()
    return {"sms_seeded": stored, "sms_rows": stored, "duplicates_skipped": skipped}


def build_submissions(now: datetime) -> list[Submission]:
    rng = random.Random(SEED)
    submissions: list[Submission] = []

    for ward, (resident_count, category_weights) in WARDS.items():
        residents = list(range(resident_count))
        rng.shuffle(residents)
        for category, count in category_weights.items():
            selected = residents[: min(count, resident_count)]
            for index in selected:
                # Give the smaller wards repeated reports on distinct days so the
                # demo visibly exercises the persistence component of the scorer.
                # This affects synthetic data only; production scoring is unchanged.
                if resident_count <= 40:
                    report_days = rng.sample(range(WINDOW_DAYS), k=3)
                else:
                    reports = 1 + int(rng.random() < 0.3) + int(rng.random() < 0.1)
                    report_days = [
                        int(WINDOW_DAYS * rng.random() ** 1.5)
                        for _ in range(reports)
                    ]
                for age_days in report_days:
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
        sms_summary = seed_sms(
            db,
            datetime.now(timezone.utc),
            settings.phone_hash_pepper,
            reset="--reset" in argv,
        )
    print({**summary, **sms_summary})
    return 0


if __name__ == "__main__":
    sys.exit(main())
