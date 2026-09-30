import pytest
from sqlalchemy import create_engine, event, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.ai.extractor import EnrichmentResult, KeywordExtractor, get_extractor
from app.db.models import Base, Submission, SubmissionEnrichment
from app.db.session import get_session
from app.main import app
from app.services.enrichment import enrich_submission
from tests.conftest import at_payload

SUCCESS = "END Thank you. Your development need has been recorded."
FULL_FLOW = "1*Jomvu*3*Clinic has no water*1"


@pytest.fixture
def SessionLocal():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )

    @event.listens_for(engine, "connect")
    def _fk_on(dbapi_conn, _):
        dbapi_conn.execute("PRAGMA foreign_keys=ON")

    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


@pytest.fixture
def db_override(SessionLocal):
    def override():
        s = SessionLocal()
        try:
            yield s
        finally:
            s.close()

    app.dependency_overrides[get_session] = override
    yield SessionLocal
    app.dependency_overrides.clear()


# 1. Deterministic extraction -------------------------------------------------
def test_extracts_single_clear_category():
    r = KeywordExtractor().extract("The bridge and the road have big potholes")
    assert r.extractor == "keyword-v1"
    assert r.suggested_category == "roads"
    assert r.matched_keywords == ("bridge", "pothole", "road")


def test_extraction_is_deterministic_and_handles_plural_and_swahili():
    ex = KeywordExtractor()
    assert ex.extract("Schools need teachers") == ex.extract("Schools need teachers")
    assert ex.extract("Schools need teachers").suggested_category == "education"
    assert ex.extract("Hatuna maji").suggested_category == "water"


# 2. Ambiguous / empty --------------------------------------------------------
@pytest.mark.parametrize("text", ["", "   ", None, "abc xyz 123", "the damaged waterlogged area"])
def test_no_match_gives_no_suggestion(text):
    r = KeywordExtractor().extract(text)
    assert r.suggested_category is None
    assert r.matched_keywords == ()


def test_tie_between_categories_is_not_guessed():
    r = KeywordExtractor().extract("Clinic has no water")
    assert r.suggested_category is None
    assert r.matched_keywords == ("clinic", "water")


# 3. Persistence --------------------------------------------------------------
def test_enrichment_is_persisted_and_linked(SessionLocal):
    with SessionLocal() as db:
        sub = Submission(phone_hash="h" * 64, ward="Jomvu", category="roads",
                         description="Pothole on the main road")
        db.add(sub)
        db.commit()
        assert enrich_submission(db, sub, get_extractor()) is True
        row = db.scalars(select(SubmissionEnrichment)).one()
        assert row.submission_id == sub.id
        assert row.suggested_category == "roads"
        assert row.matched_keywords == ["pothole", "road"]
        assert row.extractor == "keyword-v1"


def test_enrichment_constraints(SessionLocal):
    with SessionLocal() as db:
        db.add(SubmissionEnrichment(submission_id=__import__("uuid").uuid4(),
                                    extractor="keyword-v1", matched_keywords=[]))
        with pytest.raises(IntegrityError):  # FK to submissions
            db.commit()
        db.rollback()

        sub = Submission(phone_hash="h" * 64, ward="W", category="water", description="no water")
        db.add(sub)
        db.commit()
        assert enrich_submission(db, sub, get_extractor()) is True
        assert enrich_submission(db, sub, get_extractor()) is False  # unique per extractor
        assert len(db.scalars(select(SubmissionEnrichment)).all()) == 1


def test_deleting_submission_cascades_to_enrichment(SessionLocal):
    with SessionLocal() as db:
        sub = Submission(phone_hash="h" * 64, ward="W", category="water", description="no water")
        db.add(sub)
        db.commit()
        db.add(SubmissionEnrichment(submission_id=sub.id, extractor="keyword-v1",
                                    matched_keywords=["water"]))
        db.commit()
        assert len(db.scalars(select(SubmissionEnrichment)).all()) == 1

        db.delete(sub)
        db.commit()

        assert db.scalars(select(Submission)).all() == []
        assert db.scalars(select(SubmissionEnrichment)).all() == []


def test_ussd_flow_persists_submission_and_enrichment(client, db_override):
    response = client.post("/ussd/test-secret", data=at_payload(FULL_FLOW))
    assert response.text == SUCCESS
    with db_override() as db:
        sub = db.scalars(select(Submission)).one()
        enr = db.scalars(select(SubmissionEnrichment)).one()
        assert enr.submission_id == sub.id


# 4. Failure never breaks the submission -------------------------------------
class BoomExtractor:
    name = "boom"

    def extract(self, text: str) -> EnrichmentResult:
        raise RuntimeError("secret internals: " + text)


def test_extractor_failure_keeps_submission_and_success_response(client, db_override, caplog):
    app.dependency_overrides[get_extractor] = lambda: BoomExtractor()
    try:
        response = client.post("/ussd/test-secret", data=at_payload(FULL_FLOW))
    finally:
        app.dependency_overrides.pop(get_extractor, None)

    assert response.status_code == 200
    assert response.text == SUCCESS
    with db_override() as db:
        assert len(db.scalars(select(Submission)).all()) == 1
        assert db.scalars(select(SubmissionEnrichment)).all() == []
    assert "RuntimeError" in caplog.text
    assert "secret internals" not in caplog.text
    assert "Clinic" not in caplog.text


def test_failure_log_has_submission_id_but_no_message_or_text(SessionLocal, caplog):
    with SessionLocal() as db:
        sub = Submission(phone_hash="h" * 64, ward="W", category="water",
                         description="resident private text")
        db.add(sub)
        db.commit()
        assert enrich_submission(db, sub, BoomExtractor()) is False

    assert f"submission_id={sub.id}" in caplog.text
    assert "error=RuntimeError" in caplog.text
    assert "secret internals" not in caplog.text
    assert "resident private text" not in caplog.text


def test_enrichment_commit_failure_keeps_submission_and_success_response(client, caplog):
    class FlakySession:
        def __init__(self):
            self.added, self.commits, self.rolled_back = [], 0, False

        def add(self, item):
            self.added.append(item)

        def scalar(self, *_a, **_k):
            return None

        def commit(self):
            self.commits += 1
            if self.commits == 2:  # 1st = submission, 2nd = enrichment
                raise RuntimeError("db exploded")

        def rollback(self):
            self.rolled_back = True

    db = FlakySession()
    app.dependency_overrides[get_session] = lambda: db
    try:
        response = client.post("/ussd/test-secret", data=at_payload(FULL_FLOW))
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.text == SUCCESS
    assert any(isinstance(i, Submission) for i in db.added)
    assert db.rolled_back is True
