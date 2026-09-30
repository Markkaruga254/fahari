"""Marker for synthetic demo rows.

Real phone hashes are 64 hex characters, so the explicit synthetic prefix
cannot collide with a real hashed phone number.
"""

SYNTHETIC_PREFIX = "synthetic:"


def is_synthetic(phone_hash: str) -> bool:
    return phone_hash.startswith(SYNTHETIC_PREFIX)
