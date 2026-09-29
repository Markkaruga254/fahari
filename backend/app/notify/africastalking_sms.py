class ATNotifier:
    """Africa's Talking SMS adapter. The SDK is synchronous: call it from a
    background task, never from inside the USSD response path."""

    def __init__(self, username: str, api_key: str, sender_id: str = "") -> None:
        import africastalking  # lazy import keeps tests light

        africastalking.initialize(username, api_key)
        self._sms = africastalking.SMS
        self._sender_id = sender_id or None

    def send_sms(self, phone: str, message: str) -> dict:
        if self._sender_id:
            return self._sms.send(message, [phone], sender_id=self._sender_id)
        return self._sms.send(message, [phone])
