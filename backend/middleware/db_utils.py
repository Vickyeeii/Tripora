from functools import wraps
from sqlalchemy.orm import Session
from middleware.logger import get_logger

logger = get_logger(__name__)


def transactional(func):
    """
    Decorator for automatic transaction management with rollback on error.
    Use on service layer functions that modify database.
    """
    @wraps(func)
    def wrapper(db: Session, *args, **kwargs):
        try:
            result = func(db, *args, **kwargs)
            db.commit()
            return result
        except Exception as e:
            db.rollback()
            logger.error(f"Transaction failed in {func.__name__}: {str(e)}")
            raise
    return wrapper


def safe_commit(db: Session):
    """
    Safely commit with automatic rollback on failure.
    """
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Commit failed: {str(e)}")
        raise
