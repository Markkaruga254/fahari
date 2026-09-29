from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.config import get_settings

_engine = None
_SessionLocal = None


def get_engine():
    global _engine, _SessionLocal
    if _engine is None:
        _engine = create_engine(get_settings().database_url, pool_pre_ping=True)
        _SessionLocal = sessionmaker(
            bind=_engine,
            autoflush=False,
            expire_on_commit=False,
        )
    return _engine


def get_session():
    get_engine()
    session = _SessionLocal()
    try:
        yield session
    finally:
        session.close()


def db_is_up() -> bool:
    try:
        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
