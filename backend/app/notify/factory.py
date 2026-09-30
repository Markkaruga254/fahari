import logging
from functools import lru_cache

from fastapi import Depends

from app.config import Settings, get_settings
from app.notify.base import Notifier

logger = logging.getLogger(__name__)


@lru_cache
def _build_at_notifier(username: str, api_key: str, sender_id: str) -> Notifier | None:
    try:
        from app.notify.africastalking_sms import ATNotifier

        return ATNotifier(username, api_key, sender_id)
    except Exception as exc:
        logger.warning("SMS notifier unavailable: %s", type(exc).__name__)
        return None


def get_notifier(settings: Settings = Depends(get_settings)) -> Notifier | None:
    """Real notifier only when explicitly enabled and configured; otherwise None (no SMS)."""
    if not (settings.sms_enabled and settings.at_api_key):
        return None
    return _build_at_notifier(settings.at_username, settings.at_api_key, settings.at_sender_id)
