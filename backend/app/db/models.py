from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    phone_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    ward: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str] = mapped_column(String(40), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="received")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class SubmissionEnrichment(Base):
    __tablename__ = "submission_enrichment"
    __table_args__ = (UniqueConstraint("submission_id", "extractor"),)

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    submission_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    extractor: Mapped[str] = mapped_column(String(40), nullable=False)
    suggested_category: Mapped[str | None] = mapped_column(String(40), nullable=True)
    matched_keywords: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class SmsReceipt(Base):
    """Proof that an Africa's Talking SMS callback was received, and the
    idempotency record for it. Receipt-only on purpose: a free-text SMS
    carries no ward, so it must never be manufactured into a Submission
    (which would inject a fake ward into planning data).

    No raw phone number and no message body are stored: identity is the
    peppered hash and the body is represented only by its SHA-256 digest
    (equality checks for the missing-id fallback path).
    """

    __tablename__ = "sms_receipts"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    # AT message id. Unique when present (AT ids never repeat legitimately);
    # NULL when AT omitted it (unique allows many NULLs) with a time-window
    # fallback on (phone_hash, text_sha).
    at_id: Mapped[str | None] = mapped_column(String(128), nullable=True, unique=True, index=True)
    phone_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    text_sha: Mapped[str] = mapped_column(String(64), nullable=False)
    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
