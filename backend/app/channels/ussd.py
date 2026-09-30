import hmac
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, Form, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.extractor import Extractor, get_extractor
from app.channels.ussd_state import parse_submission
from app.config import Settings, get_settings
from app.db.models import Submission
from app.db.session import get_session
from app.notify.base import Notifier
from app.notify.factory import get_notifier
from app.security import hash_phone
from app.services.confirmation import send_confirmation
from app.services.enrichment import enrich_submission

router = APIRouter()

REPLAY_WINDOW = timedelta(minutes=10)


@router.post("/ussd/{secret}", response_class=PlainTextResponse)
def ussd_callback(
    secret: str,
    background_tasks: BackgroundTasks,
    sessionId: str = Form("", max_length=128),
    serviceCode: str = Form("", max_length=32),
    phoneNumber: str = Form("", max_length=32),
    text: str = Form("", max_length=200),
    networkCode: str = Form("", max_length=32),
    settings: Settings = Depends(get_settings),
    db: Session = Depends(get_session),
    extractor: Extractor = Depends(get_extractor),
    notifier: Notifier | None = Depends(get_notifier),
):
    if not settings.webhook_secret or not hmac.compare_digest(secret, settings.webhook_secret):
        raise HTTPException(status_code=404)

    result = parse_submission(text)

    if result.completed:
        try:
            phone_hash = hash_phone(phoneNumber, settings.phone_hash_pepper)
        except ValueError as exc:
            raise HTTPException(status_code=503, detail="Service is not configured") from exc

        ward, description = result.ward[:120], result.description[:200]
        # AT may retry a callback and the chain re-sends the final answer, so an identical
        # report from the same phone shortly after the first is treated as a replay.
        replay = db.scalar(
            select(Submission.id)
            .where(
                Submission.phone_hash == phone_hash,
                Submission.ward == ward,
                Submission.category == result.category,
                Submission.description == description,
                Submission.created_at >= datetime.now(timezone.utc) - REPLAY_WINDOW,
            )
            .limit(1)
        )
        if replay is None:
            submission = Submission(
                phone_hash=phone_hash,
                ward=ward,
                category=result.category,
                description=description,
            )
            db.add(submission)
            db.commit()
            enrich_submission(db, submission, extractor)
            if notifier is not None and phoneNumber:
                # Runs after the response is sent; the raw number is never persisted.
                background_tasks.add_task(send_confirmation, notifier, phoneNumber, submission.id)

    return PlainTextResponse(result.response, media_type="text/plain")
