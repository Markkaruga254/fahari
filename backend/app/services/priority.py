"""Transparent, equity-aware priority scoring (Gate 4a). Pure: no DB, no I/O.

A priority item is one (ward, category) pair. Every component is in [0, 1] and is
returned alongside the score so planners can see exactly why an item ranks where it does.
Residents are counted once per need (distinct reporter), so repeating a report adds nothing.
"""

from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import date

WEIGHTS: dict[str, float] = {
    "voice": 0.35,
    "ward_share": 0.30,
    "persistence": 0.20,
    "spread": 0.15,
}
VOICE_HALF_CREDIT = 3.0
PERSISTENCE_HALF_CREDIT = 2.0
SHARE_SMOOTHING = 2.0

PARAMS = {
    "voice_half_credit": VOICE_HALF_CREDIT,
    "persistence_half_credit": PERSISTENCE_HALF_CREDIT,
    "share_smoothing": SHARE_SMOOTHING,
}


@dataclass(frozen=True)
class ReportRow:
    ward: str
    category: str
    reporter: str
    day: date


@dataclass(frozen=True)
class PriorityItem:
    rank: int
    ward: str
    category: str
    score: float
    reporters: int
    reports: int
    active_days: int
    ward_reporters: int
    wards_with_category: int
    total_wards: int
    components: dict[str, float]


def ward_key(ward: str) -> str:
    return " ".join(ward.split()).casefold()


def _saturate(n: float, half: float) -> float:
    return n / (n + half)


def compute_priorities(rows: list[ReportRow]) -> list[PriorityItem]:
    ward_names: dict[str, Counter] = defaultdict(Counter)
    ward_reporters: dict[str, set] = defaultdict(set)
    cells: dict[tuple[str, str], dict] = {}
    category_wards: dict[str, set] = defaultdict(set)

    for row in rows:
        wkey = ward_key(row.ward)
        if not wkey:
            continue
        ward_names[wkey][" ".join(row.ward.split())] += 1
        ward_reporters[wkey].add(row.reporter)
        category_wards[row.category].add(wkey)
        cell = cells.setdefault(
            (wkey, row.category), {"reporters": set(), "reports": 0, "days": set()}
        )
        cell["reporters"].add(row.reporter)
        cell["reports"] += 1
        cell["days"].add(row.day)

    total_wards = len(ward_reporters)
    scored = []
    for (wkey, category), cell in cells.items():
        n = len(cell["reporters"])
        days = len(cell["days"])
        n_ward = len(ward_reporters[wkey])
        components = {
            "voice": _saturate(n, VOICE_HALF_CREDIT),
            "ward_share": n / (n_ward + SHARE_SMOOTHING),
            "persistence": _saturate(days, PERSISTENCE_HALF_CREDIT),
            "spread": len(category_wards[category]) / total_wards,
        }
        raw = 100 * sum(WEIGHTS[name] * value for name, value in components.items())
        display = sorted(ward_names[wkey].items(), key=lambda kv: (-kv[1], kv[0]))[0][0]
        scored.append((raw, wkey, category, display, n, cell["reports"], days, n_ward, components))

    scored.sort(key=lambda t: (-t[0], t[1], t[2]))
    return [
        PriorityItem(
            rank=i,
            ward=display,
            category=category,
            score=round(raw, 1),
            reporters=n,
            reports=reports,
            active_days=days,
            ward_reporters=n_ward,
            wards_with_category=len(category_wards[category]),
            total_wards=total_wards,
            components={k: round(v, 3) for k, v in components.items()},
        )
        for i, (raw, _w, category, display, n, reports, days, n_ward, components) in enumerate(
            scored, start=1
        )
    ]
