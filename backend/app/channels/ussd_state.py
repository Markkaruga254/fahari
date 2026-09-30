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


_WELCOME = "CON Welcome to People's Priorities\n1. Report a need\n2. Community priorities"
_CATEGORY_PROMPT = "CON Select the need category:\n1. Water\n2. Roads\n3. Health\n4. Education\n5. Other"


def parse_submission(text: str) -> UssdResult:
    """Replay the AT input chain one answer at a time.

    AT resends the whole chain on every request, so a rejected answer stays in the chain.
    Rejected answers therefore do not advance the flow: the user is re-prompted and their
    next entry is consumed as the answer to that same step.
    """
    parts = [p.strip() for p in text.split("*") if p.strip()]

    if not parts:
        return UssdResult(_WELCOME)
    if parts[0] == "2":
        return UssdResult("END Community priorities will be available soon.")
    if parts[0] != "1":
        return UssdResult("END Invalid choice. Please dial again.")

    step = "ward"
    ward = category = description = ""
    rejected = False
    for answer in parts[1:]:
        rejected = False
        if step == "ward":
            ward, step = answer, "category"
        elif step == "category":
            if answer in CATEGORIES:
                category, step = CATEGORIES[answer], "description"
            else:
                rejected = True
        elif step == "description":
            if len(answer) >= 3:
                description, step = answer, "confirm"
            else:
                rejected = True
        else:
            if answer == "1":
                return UssdResult(
                    "END Thank you. Your development need has been recorded.",
                    completed=True,
                    ward=ward,
                    category=category,
                    description=description,
                )
            return UssdResult("END Report cancelled. Thank you.")

    if step == "ward":
        return UssdResult("CON Enter your ward name:")
    if step == "category":
        return UssdResult("CON Invalid category. Choose 1-5:" if rejected else _CATEGORY_PROMPT)
    if step == "description":
        return UssdResult(
            "CON Please give a little more detail:" if rejected else "CON Briefly describe the problem:"
        )
    return UssdResult(
        f"CON Submit this report?\nWard: {ward}\nCategory: {category}\n1. Yes\n2. No"
    )
