import logging

from app.notify.base import Notifier

logger = logging.getLogger(__name__)

# Africa's Talking per-recipient codes: 100 Processed, 101 Sent, 102 Queued.
_OK_CODES = {100, 101, 102}


def build_confirmation_message(submission_id) -> str:
    """Fixed text + short ref. Never includes resident-submitted text (<= 160 chars)."""
    ref = str(submission_id).replace("-", "")[:8].upper()
    return f"People's Priorities: Thank you / Asante. Your report was received. Ref: {ref}"


def _rejected_code(response) -> str | None:
    try:
        recipients = response["SMSMessageData"]["Recipients"]
        for recipient in recipients:
            if recipient.get("statusCode") not in _OK_CODES:
                return str(recipient.get("statusCode"))
    except (KeyError, TypeError, AttributeError):
        return None  # unknown shape (e.g. FakeNotifier): nothing to flag
    return None


def send_confirmation(notifier: Notifier, phone: str, submission_id) -> bool:
    """Best-effort SMS confirmation. Never raises; never logs the phone number or message."""
    try:
        response = notifier.send_sms(phone, build_confirmation_message(submission_id))
        code = _rejected_code(response)
        if code is not None:
            logger.warning(
                "SMS confirmation rejected: submission_id=%s status_code=%s", submission_id, code
            )
            return False
        return True
    except Exception as exc:
        logger.warning(
            "SMS confirmation failed: submission_id=%s error=%s", submission_id, type(exc).__name__
        )
        return False
