import random
from datetime import date, timedelta

import pytest

from app.services.priority import WEIGHTS, ReportRow, compute_priorities

D0 = date(2026, 9, 1)


def rows(ward, category, reporters, days=1):
    return [
        ReportRow(ward, category, f"{ward}-{i}", D0 + timedelta(days=i % days))
        for i in range(reporters)
    ]


def find(items, ward, category):
    return next(i for i in items if i.ward == ward and i.category == category)


def test_weights_sum_to_one():
    assert sum(WEIGHTS.values()) == pytest.approx(1.0)


def test_empty_input():
    assert compute_priorities([]) == []


def test_bounds_ranks_and_components():
    items = compute_priorities(rows("A", "water", 5, 3) + rows("B", "roads", 2) + rows("B", "health", 1))
    assert [i.rank for i in items] == [1, 2, 3]
    assert [i.score for i in items] == sorted((i.score for i in items), reverse=True)
    for i in items:
        assert 0 <= i.score <= 100
        assert all(0 <= v <= 1 for v in i.components.values())


def test_one_resident_repeating_counts_once():
    spam = [ReportRow("A", "water", "same", D0) for _ in range(20)]
    item = compute_priorities(spam)[0]
    assert (item.reports, item.reporters) == (20, 1)
    honest = compute_priorities(rows("A", "water", 3))[0]
    assert honest.score > item.score


def test_ward_names_are_normalised():
    data = [
        ReportRow("Jomvu", "water", "r1", D0),
        ReportRow("  jomvu ", "water", "r2", D0),
        ReportRow("JOMVU", "water", "r3", D0),
    ]
    items = compute_priorities(data)
    assert len(items) == 1
    assert items[0].reporters == 3 and items[0].total_wards == 1


def test_small_ward_with_concentrated_need_outranks_large_ward_minority():
    small = rows("Small", "water", 8) + [ReportRow("Small", "roads", f"x{i}", D0) for i in range(2)]
    large = rows("Large", "water", 15) + [ReportRow("Large", "roads", f"y{i}", D0) for i in range(285)]
    items = compute_priorities(small + large)
    assert find(items, "Small", "water").rank < find(items, "Large", "water").rank


def test_volume_has_diminishing_returns():
    a = compute_priorities(rows("A", "water", 60))[0]
    b = compute_priorities(rows("A", "water", 1000))[0]
    assert a.components["voice"] > 0.9
    assert b.components["voice"] < 1.0
    assert b.components["voice"] - a.components["voice"] < 0.05


def test_lone_report_does_not_read_as_full_share():
    assert compute_priorities(rows("A", "water", 1))[0].components["ward_share"] < 0.5


def test_persistence_rewards_more_active_days():
    one_day = compute_priorities(rows("A", "water", 4, days=1))[0]
    four_days = compute_priorities(rows("A", "water", 4, days=4))[0]
    assert four_days.components["persistence"] > one_day.components["persistence"]
    assert four_days.score > one_day.score


def test_spread_rewards_needs_seen_in_more_wards():
    data = (
        rows("A", "water", 2) + rows("A", "roads", 2)
        + rows("B", "water", 2) + rows("C", "water", 2)
    )
    items = compute_priorities(data)
    water, roads = find(items, "A", "water"), find(items, "A", "roads")
    assert water.wards_with_category == 3 and roads.wards_with_category == 1
    assert water.rank < roads.rank


def test_deterministic_regardless_of_input_order():
    data = rows("A", "water", 5, 3) + rows("B", "water", 5, 3) + rows("B", "roads", 2)
    baseline = compute_priorities(data)
    for seed in range(5):
        shuffled = data[:]
        random.Random(seed).shuffle(shuffled)
        assert compute_priorities(shuffled) == baseline
