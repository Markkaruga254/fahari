import hashlib


def hash_phone(phone: str, pepper: str) -> str:
    if not pepper:
        raise ValueError("PHONE_HASH_PEPPER is required")
    normalized = phone.strip()
    return hashlib.sha256(f"{pepper}:{normalized}".encode("utf-8")).hexdigest()
