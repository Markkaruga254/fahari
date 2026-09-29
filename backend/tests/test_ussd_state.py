from app.channels.ussd_state import parse_submission


def test_welcome_menu():
    result = parse_submission("")
    assert result.response.startswith("CON ")
    assert "1. Report a need" in result.response


def test_report_flow_reaches_confirmation():
    result = parse_submission("1*Jomvu*3*Clinic has no water")
    assert result.completed is False
    assert result.response.startswith("CON ")
    assert "Ward: Jomvu" in result.response
    assert "Category: health" in result.response


def test_report_flow_completes():
    result = parse_submission("1*Jomvu*3*Clinic has no water*1")
    assert result.completed is True
    assert result.ward == "Jomvu"
    assert result.category == "health"
    assert result.description == "Clinic has no water"
    assert result.response.startswith("END ")


def test_invalid_category_does_not_complete():
    result = parse_submission("1*Jomvu*9*Broken road*1")
    assert result.completed is False
    assert result.response.startswith("CON ")
