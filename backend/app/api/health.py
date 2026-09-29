from fastapi import APIRouter, HTTPException

from app.db.session import db_is_up

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/ready")
def ready():
    if not db_is_up():
        raise HTTPException(status_code=503, detail="database unavailable")
    return {"status": "ready", "db": "up"}
