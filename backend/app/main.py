from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import health
from app.channels import ussd
from app.config import get_settings
from app.db.models import Base
from app.db.session import get_engine


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if get_settings().auto_create_db:
        Base.metadata.create_all(bind=get_engine())
    yield


app = FastAPI(title="People's Priorities", version="0.2.0", lifespan=lifespan)
app.include_router(health.router)
app.include_router(ussd.router)
