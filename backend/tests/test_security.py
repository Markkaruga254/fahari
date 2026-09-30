import hashlib

import pytest

from app.security import hash_phone, normalize_phone


@pytest.mark.parametrize(
    "raw",
    ["+254712345678", "254712345678", "0712345678", "00254712345678",
     "+254 712 345 678", "0712-345-678", " +254712345678 ", "(0712) 345 678"],
)
def test_kenyan_forms_normalise_to_e164(raw):
    assert normalize_phone(raw) == "+254712345678"


@pytest.mark.parametrize("raw", ["+254112345678", "0112345678"])
def test_new_1xx_ranges_supported(raw):
    assert normalize_phone(raw) == "+254112345678"


def test_other_countries_and_junk_left_alone():
    assert normalize_phone("+256 700 123 456") == "+256700123456"
    assert normalize_phone("") == ""
    assert normalize_phone("abc") == "abc"
    assert normalize_phone("07123") == "07123"  # too short: not silently "fixed"


def test_same_resident_same_hash_different_residents_differ():
    assert hash_phone("0712345678", "pep") == hash_phone("+254712345678", "pep")
    assert hash_phone("+254712345678", "pep") != hash_phone("+254712345679", "pep")
    assert hash_phone("+254712345678", "pep") != hash_phone("+254712345678", "other")


def test_backward_compatible_with_existing_e164_hashes():
    legacy = hashlib.sha256(b"pep:+254712345678").hexdigest()
    assert hash_phone("+254712345678", "pep") == legacy


def test_pepper_required():
    with pytest.raises(ValueError):
        hash_phone("+254712345678", "")


def test_real_hash_can_never_look_synthetic():
    from app.synthetic import is_synthetic

    assert not is_synthetic(hash_phone("+254712345678", "pep"))
