from dataclasses import dataclass

CATEGORIES = {
    "1": "water",
    "2": "roads",
    "3": "health",
    "4": "education",
    "5": "other",
}


@dataclass(frozen=True)
class UssdResult:
    response: str
    completed: bool = False
    ward: str = ""
    category: str = ""
    description: str = ""


def parse_submission(text: str) -> UssdResult:
    parts = [p.strip() for p in text.split("*") if p.strip()]

    if not parts:
        return UssdResult("CON Welcome to People's Priorities\n1. Report a need\n2. Community priorities")

    if parts[0] == "2":
        return UssdResult("END Community priorities will be available soon.")

    if parts[0] != "1":
        return UssdResult("END Invalid choice. Please dial again.")

    if len(parts) == 1:
        return UssdResult("CON Enter your ward name:")
    if len(parts) == 2:
        return UssdResult(
            "CON Select the need category:\n1. Water\n2. Roads\n3. Health\n4. Education\n5. Other"
        )
    if len(parts) == 3:
        category = CATEGORIES.get(parts[2])
        if not category:
            return UssdResult("CON Invalid category. Choose 1-5:")
        return UssdResult("CON Briefly describe the problem:")
    if len(parts) == 4:
        description = parts[3]
        if not description or len(description) < 3:
            return UssdResult("CON Please give a little more detail:")
        category = CATEGORIES.get(parts[2])
        if not category:
            return UssdResult("CON Invalid category. Choose 1-5:")
        return UssdResult(
            f"CON Submit this report?\nWard: {parts[1]}\nCategory: {category}\n1. Yes\n2. No"
        )

    category = CATEGORIES.get(parts[2])
    if not category:
        return UssdResult("CON Invalid category. Choose 1-5:")

    if parts[4] == "1":
        return UssdResult(
            "END Thank you. Your development need has been recorded.",
            completed=True,
            ward=parts[1],
            category=category,
            description=parts[3],
        )
    return UssdResult("END Report cancelled. Thank you.")
