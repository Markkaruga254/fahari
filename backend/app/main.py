from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import health, priorities
from app.channels import ussd
from app.channels import sms as sms_channel
from app.config import get_settings, validate_settings
from app.db.models import Base
from app.db.session import get_engine
from app.logging_filters import install as install_log_filters


@asynccontextmanager
async def lifespan(_app: FastAPI):
    settings = get_settings()
    validate_settings(settings)  # fail fast instead of 503-ing on the first resident
    if settings.auto_create_db:
        Base.metadata.create_all(bind=get_engine())
    yield


install_log_filters()

app = FastAPI(title="People's Priorities", version="0.2.0", lifespan=lifespan)
app.include_router(health.router)
app.include_router(ussd.router)
app.include_router(sms_channel.router)
app.include_router(priorities.router)
