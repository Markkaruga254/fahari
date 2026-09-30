import hashlib
import hmac
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Form, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.models import SmsReceipt
from app.db.session import get_session
from app.security import hash_phone

logger = logging.getLogger(__name__)

router = APIRouter()

# Fallback dedupe window when AT omits the message id (mirrors the USSD
# replay window): same phone + same body hash seen recently is a retry.
MISSING_ID_WINDOW = timedelta(minutes=10)


def _body_sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


@router.post("/sms/{secret}", response_class=PlainTextResponse)
def sms_callback(
    secret: str,
    sender: str = Form("", max_length=32, alias="from"),
    text: str = Form("", max_length=1000),
    message_id: str = Form("", max_length=128, alias="id"),
    sent_at: str = Form("", max_length=64, alias="date"),
    settings: Settings = Depends(get_settings),
    db: Session = Depends(get_session),
):
    _ = sent_at  # accepted for AT parity; the server clock is authoritative.
    if not settings.webhook_secret or not hmac.compare_digest(secret, settings.webhook_secret):
        raise HTTPException(status_code=404)

    label = message_id or "missing-id"
    if not sender:
        logger.warning("SMS callback without sender ignored: message_id=%s", label)
        return PlainTextResponse("")
    if not text.strip():
        logger.warning("SMS callback with empty text ignored: message_id=%s", label)
        return PlainTextResponse("")

    try:
        phone_hash = hash_phone(sender, settings.phone_hash_pepper)
    except ValueError:
        logger.warning("SMS callback not processable: message_id=%s", label)
        return PlainTextResponse("")
    digest = _body_sha(text)

    if message_id:
        if db.scalar(select(SmsReceipt.id).where(SmsReceipt.at_id == message_id).limit(1)):
            logger.info("SMS callback duplicate ignored: message_id=%s", message_id)
            return PlainTextResponse("")
    else:
        cutoff = datetime.now(timezone.utc) - MISSING_ID_WINDOW
        recent = db.scalar(
            select(SmsReceipt.id)
            .where(
                SmsReceipt.phone_hash == phone_hash,
                SmsReceipt.text_sha == digest,
                SmsReceipt.received_at >= cutoff,
            )
            .limit(1)
        )
        if recent is not None:
            logger.info("SMS callback probable retry ignored without id")
            return PlainTextResponse("")

    try:
        db.add(
            SmsReceipt(
                at_id=message_id or None,
                phone_hash=phone_hash,
                text_sha=digest,
            )
        )
        db.commit()
    except IntegrityError:
        # Lost a race with an identical concurrent delivery: same outcome.
        db.rollback()
        logger.info("SMS callback duplicate ignored: message_id=%s", label)
    return PlainTextResponse("")
