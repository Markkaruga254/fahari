class FakeNotifier:
    def __init__(self) -> None:
        self.sent: list[tuple[str, str]] = []

    def send_sms(self, phone: str, message: str) -> dict:
        self.sent.append((phone, message))
        return {"status": "fake", "to": phone}
