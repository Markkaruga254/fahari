import logging

from app.logging_filters import RedactWebhookSecret, redact_webhook_secret


def test_redacts_secret_in_path():
    assert redact_webhook_secret("/ussd/s3cr3t-token") == "/ussd/[redacted]"
    assert redact_webhook_secret("/sms/s3cr3t-token") == "/sms/[redacted]"
    assert redact_webhook_secret("/voice/s3cr3t-token") == "/voice/[redacted]"
    assert redact_webhook_secret("/health") == "/health"


def test_access_log_record_is_redacted():
    record = logging.LogRecord(
        "uvicorn.access", logging.INFO, "", 0,
        '%s - "%s %s HTTP/%s" %d', ("127.0.0.1:1", "POST", "/ussd/s3cr3t-token", "1.1", 200), None,
    )
    assert RedactWebhookSecret().filter(record)
    assert "s3cr3t-token" not in record.getMessage()


def test_sms_access_log_record_is_redacted():
    record = logging.LogRecord(
        "uvicorn.access", logging.INFO, "", 0,
        '%s - "%s %s HTTP/%s" %d', ("127.0.0.1:1", "POST", "/sms/s3cr3t-token", "1.1", 200), None,
    )
    assert RedactWebhookSecret().filter(record)
    assert "s3cr3t-token" not in record.getMessage()
    assert "/sms/[redacted]" in record.getMessage()
