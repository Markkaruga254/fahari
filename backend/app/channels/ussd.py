import hmac

from fastapi import APIRouter, Depends, Form, HTTPException
from fastapi.responses import PlainTextResponse

from app.config import Settings, get_settings

router = APIRouter()

WELCOME = "CON Welcome to People's Priorities\n1. Report a need\n2. Community priorities"


@router.post("/ussd/{secret}", response_class=PlainTextResponse)
def ussd_callback(
    secret: str,
    sessionId: str = Form("", max_length=128),
    serviceCode: str = Form("", max_length=32),
    phoneNumber: str = Form("", max_length=32),
    text: str = Form("", max_length=200),
    networkCode: str = Form("", max_length=32),
    settings: Settings = Depends(get_settings),
):
    if not settings.webhook_secret or not hmac.compare_digest(secret, settings.webhook_secret):
        raise HTTPException(status_code=404)
    # Gate 1 stub: real state machine arrives in Gate 2.
    return PlainTextResponse(WELCOME, media_type="text/plain")
