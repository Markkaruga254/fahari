from app.channels.ussd import router
from app.db.models import Submission
from app.db.session import get_session
from app.main import app
from tests.conftest import at_payload


class FakeSession:
    def __init__(self):
        self.items = []

    def add(self, item):
        self.items.append(item)

    def commit(self):
        pass

    def scalar(self, *_args, **_kwargs):  # replay lookup: no prior identical report
        return None



def test_completed_report_is_persisted(client):
    db = FakeSession()

    def override_session():
        yield db

    app.dependency_overrides[get_session] = override_session
    try:
        response = client.post(
            "/ussd/test-secret",
            data=at_payload("1*Jomvu*3*Clinic has no water*1"),
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.text.startswith("END ")
    submissions = [i for i in db.items if isinstance(i, Submission)]
    assert len(submissions) == 1
    submission = submissions[0]
    assert isinstance(submission, Submission)
    assert submission.ward == "Jomvu"
    assert submission.category == "health"
    assert submission.description == "Clinic has no water"
    assert len(submission.phone_hash) == 64
    assert submission.phone_hash != "+254700000001"



def test_replayed_final_step_does_not_duplicate(client):
    from sqlalchemy import create_engine, func, select
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.pool import StaticPool
    from app.db.models import Base

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
        payload = at_payload("1*Replayville*1*Hakuna maji kwa wiki*1", session="ATUid_replay")
        for _ in range(3):
            assert client.post("/ussd/test-secret", data=payload).status_code == 200
        other = dict(payload, phoneNumber="+254799000888")
        assert client.post("/ussd/test-secret", data=other).status_code == 200
        n = db.scalar(select(func.count()).select_from(Submission))
        assert n == 2
    finally:
        app.dependency_overrides.clear()
        db.close()
