from fastapi import FastAPI

from app.api import health
from app.channels import ussd

app = FastAPI(title="People's Priorities", version="0.1.0")
app.include_router(health.router)
app.include_router(ussd.router)
