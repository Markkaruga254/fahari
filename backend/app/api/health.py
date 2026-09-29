from fastapi import APIRouter

from app.db.session import db_is_up

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok", "db": "up" if db_is_up() else "down"}
