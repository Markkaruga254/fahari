from typing import Protocol


class Notifier(Protocol):
    """SMS out. Real impl talks to Africa's Talking; tests use FakeNotifier."""

    def send_sms(self, phone: str, message: str) -> dict: ...
