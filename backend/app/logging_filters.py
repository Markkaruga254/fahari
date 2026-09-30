import logging
import re

_CALLBACK_PATH = re.compile(r"(/(?:ussd|sms)/)[^/\s\"?#]+")


def redact_webhook_secret(value: str) -> str:
    return _CALLBACK_PATH.sub(r"\1[redacted]", value)


class RedactWebhookSecret(logging.Filter):
    """The USSD webhook secret is a URL path segment, so access logs would print it."""

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.args, tuple):
            record.args = tuple(
                redact_webhook_secret(a) if isinstance(a, str) else a for a in record.args
            )
        if isinstance(record.msg, str):
            record.msg = redact_webhook_secret(record.msg)
        return True


def install() -> None:
    for name in ("uvicorn.access", "uvicorn.error"):
        logger = logging.getLogger(name)
        if not any(isinstance(f, RedactWebhookSecret) for f in logger.filters):
            logger.addFilter(RedactWebhookSecret())
