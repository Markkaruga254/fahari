from tests.conftest import at_payload


def test_ussd_welcome_menu(client):
    r = client.post("/ussd/test-secret", data=at_payload())
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("text/plain")
    assert r.text.startswith("CON ")
    assert "Welcome to People's Priorities" in r.text
    assert "1. Report a need" in r.text
    assert "2. Community priorities" in r.text


def test_ussd_wrong_secret_is_404(client):
    r = client.post("/ussd/nope", data=at_payload())
    assert r.status_code == 404


def test_ussd_rejects_oversized_text(client):
    r = client.post("/ussd/test-secret", data=at_payload(text="1*" * 500))
    assert r.status_code == 422
