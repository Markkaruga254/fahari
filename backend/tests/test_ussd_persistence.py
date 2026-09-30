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
