import hmac
import logging
from xml.sax.saxutils import escape

from fastapi import APIRouter, Depends, Form, HTTPException, Response

from app.config import Settings, get_settings

logger = logging.getLogger(__name__)

router = APIRouter()

WELCOME = "Welcome to Fahari, where residents can share what matters in their communities."
MENU = "Press 1 for water, 2 for roads, 3 for health, 4 for education, or 5 for other. Then press hash."
THANKS = "Thank you. Your answer has been received. Goodbye."

VALID_DIGITS = frozenset({"1", "2", "3", "4", "5"})


def _xml(body: str) -> str:
    return f'<?xml version="1.0" encoding="UTF-8"?><Response>{body}</Response>'


@router.post("/voice/{secret}")
def voice_callback(
    secret: str,
    session_id: str = Form("", max_length=128, alias="sessionId"),
    dtmf_digits: str = Form("", max_length=32, alias="dtmfDigits"),
    settings: Settings = Depends(get_settings),
):
    # Same webhook convention as USSD/SMS: secret path segment, 404 otherwise.
    # Caller numbers are accepted by AT but never read here and never logged.
    if not settings.webhook_secret or not hmac.compare_digest(secret, settings.webhook_secret):
        raise HTTPException(status_code=404)

    label = session_id or "missing-session"
    digits = "".join(ch for ch in dtmf_digits if ch.isdigit())

    if digits:
        logger.info("Voice digits received: session_id=%s digits=%s", label, digits[:8])
        return Response(_xml(f"<Say>{THANKS}</Say>"), media_type="text/xml")

    base = (settings.public_base_url or "").rstrip("/")
    if base:
        callback = escape(f"{base}/voice/{settings.webhook_secret}", {'"': "&quot;"})
        body = (
            f"<Say>{WELCOME}</Say>"
            f'<GetDigits timeout="20" finishOnKey="#" callbackUrl="{callback}">'
            f"<Say>{MENU}</Say></GetDigits>"
        )
    else:
        # No public base configured: still answer, but skip the keypad step
        # instead of emitting a dead callback URL.
        logger.warning("Voice answered without menu: no PUBLIC_BASE_URL configured")
        body = f"<Say>{WELCOME} {THANKS}</Say>"
    logger.info("Voice call answered: session_id=%s", label)
    return Response(_xml(body), media_type="text/xml")
