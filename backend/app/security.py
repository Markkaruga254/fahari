import hashlib
import re

_SEPARATORS = re.compile(r"[\s\-().]")


def normalize_phone(phone: str) -> str:
    """Canonical form for hashing so one resident is one reporter.

    Kenyan forms (0712345678, 254712345678, 00254712345678, +254 712 345 678) all become
    +254712345678. Numbers already in +E.164 form are unchanged, so existing hashes of
    Africa's Talking numbers stay valid. Anything else is returned with separators stripped.
    """
    cleaned = _SEPARATORS.sub("", phone or "")
    if cleaned.startswith("00254"):
        cleaned = "+" + cleaned[2:]
    elif cleaned.startswith("254") and cleaned[3:].isdigit() and len(cleaned) == 12:
        cleaned = "+" + cleaned
    elif cleaned.startswith("0") and cleaned[1:].isdigit() and len(cleaned) == 10:
        cleaned = "+254" + cleaned[1:]
    return cleaned


def hash_phone(phone: str, pepper: str) -> str:
    if not pepper:
        raise ValueError("PHONE_HASH_PEPPER is required")
    return hashlib.sha256(f"{pepper}:{normalize_phone(phone)}".encode("utf-8")).hexdigest()
