import hmac
from dataclasses import asdict
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.models import Submission
from app.db.session import get_session
from app.services.priority import PARAMS, WEIGHTS, ReportRow, compute_priorities, ward_key
from app.synthetic import is_synthetic

router = APIRouter()

_EAT = timezone(timedelta(hours=3))  # Kenya has no DST; "days" means local calendar days


def require_dashboard_key(
    settings: Settings = Depends(get_settings),
    x_api_key: str | None = Header(default=None),
) -> None:
    if not settings.dashboard_api_key:
        raise HTTPException(status_code=503, detail="Service is not configured")
    if not x_api_key or not hmac.compare_digest(
        x_api_key.encode(), settings.dashboard_api_key.encode()
    ):
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


def _local_day(created_at: datetime):
    if created_at.tzinfo is None:  # SQLite returns naive UTC
        created_at = created_at.replace(tzinfo=timezone.utc)
    return created_at.astimezone(_EAT).date()


@router.get("/priorities", dependencies=[Depends(require_dashboard_key)])
def get_priorities(
    days: int = Query(90, ge=1, le=365),
    ward: str | None = Query(None, max_length=120),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_session),
):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    records = db.execute(
        select(
            Submission.ward, Submission.category, Submission.phone_hash, Submission.created_at
        ).where(Submission.created_at >= cutoff)
    ).all()
    rows = [ReportRow(r.ward, r.category, r.phone_hash, _local_day(r.created_at)) for r in records]

    items = compute_priorities(rows)  # ranks are constituency-wide, even when filtered below
    if ward:
        wanted = ward_key(ward)
        items = [i for i in items if ward_key(i.ward) == wanted]

    synthetic = sum(1 for r in records if is_synthetic(r.phone_hash))

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "window_days": days,
        "reports_considered": len(rows),
        "synthetic_reports": synthetic,
        "contains_synthetic_data": synthetic > 0,
        "method": {"weights": WEIGHTS, **PARAMS},
        "items": [asdict(i) for i in items[:limit]],
    }
