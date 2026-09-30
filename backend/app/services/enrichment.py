import logging

from app.ai.extractor import Extractor
from app.db.models import Submission, SubmissionEnrichment

logger = logging.getLogger(__name__)


def enrich_submission(db, submission: Submission, extractor: Extractor) -> bool:
    """Best-effort enrichment of an already-committed submission. Never raises."""
    submission_id = None
    try:
        submission_id = submission.id
        result = extractor.extract(submission.description)
        db.add(
            SubmissionEnrichment(
                submission_id=submission.id,
                extractor=result.extractor,
                suggested_category=result.suggested_category,
                matched_keywords=list(result.matched_keywords),
            )
        )
        db.commit()
        return True
    except Exception as exc:
        # Log the submission id (random UUID) and exception type only: exception
        # messages can echo SQL parameters / resident text.
        logger.warning(
            "Submission enrichment failed: submission_id=%s error=%s",
            submission_id,
            type(exc).__name__,
        )
        try:
            db.rollback()
        except Exception:
            pass
        return False
