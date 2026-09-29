def test_health_is_liveness_only(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_ready_reports_database_state(client):
    r = client.get("/ready")
    assert r.status_code in (200, 503)
    if r.status_code == 200:
        assert r.json() == {"status": "ready", "db": "up"}
    else:
        assert r.json()["detail"] == "database unavailable"
