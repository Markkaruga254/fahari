"""Deterministic, dependency-free enrichment of submission text (Gate 3a)."""

import re
from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class EnrichmentResult:
    extractor: str
    suggested_category: str | None
    matched_keywords: tuple[str, ...]


class Extractor(Protocol):
    name: str

    def extract(self, text: str) -> EnrichmentResult: ...


# Whole-word matches only (plus a trailing-"s" plural). Deliberately small: a
# missing keyword yields "no suggestion", which is safer than a wrong one.
KEYWORDS: dict[str, frozenset[str]] = {
    "water": frozenset({"water", "borehole", "pipe", "maji", "kisima", "bomba"}),
    "roads": frozenset(
        {"road", "bridge", "footbridge", "pothole", "culvert", "highway", "murram",
         "barabara", "daraja"}
    ),
    "health": frozenset(
        {"clinic", "hospital", "dispensary", "health", "nurse", "doctor", "medicine",
         "ambulance", "hospitali", "zahanati", "daktari", "dawa"}
    ),
    "education": frozenset(
        {"school", "teacher", "classroom", "student", "pupil", "textbook",
         "shule", "mwalimu", "walimu", "darasa"}
    ),
}

_TOKEN = re.compile(r"[a-z]+")


class KeywordExtractor:
    name = "keyword-v1"

    def extract(self, text: str) -> EnrichmentResult:
        tokens: set[str] = set()
        for token in _TOKEN.findall((text or "").lower()):
            tokens.add(token)
            if len(token) > 3 and token.endswith("s"):
                tokens.add(token[:-1])

        hits = {cat: tokens & words for cat, words in KEYWORDS.items()}
        hits = {cat: found for cat, found in hits.items() if found}
        if not hits:
            return EnrichmentResult(self.name, None, ())

        top = max(len(found) for found in hits.values())
        winners = [cat for cat, found in hits.items() if len(found) == top]
        suggested = winners[0] if len(winners) == 1 else None
        matched = tuple(sorted(set().union(*hits.values())))
        return EnrichmentResult(self.name, suggested, matched)


_default_extractor = KeywordExtractor()


def get_extractor() -> Extractor:
    return _default_extractor
