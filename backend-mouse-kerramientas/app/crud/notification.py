"""
CRUD operations for user notifications
"""
from typing import List, Optional

from sqlalchemy.orm import Session

from ..models.notification import Notification
from ..schemas.notification import NotificationCreate


def create_notification(db: Session, user_id: int, notification_type: str, content: str) -> Notification:
    """
    Create a new notification for a user
    """
    db_notification = Notification(
        user_id=user_id,
        type=notification_type,
        content=content,
        read=False
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


def get_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Notification]:
    """
    Get all notifications for a user
    """
    return db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.timestamp.desc()).offset(skip).limit(limit).all()


def mark_as_read(db: Session, notification_id: int) -> Optional[Notification]:
    """
    Mark a notification as read
    """
    db_notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if db_notification:
        db_notification.read = True
        db.commit()
        db.refresh(db_notification)
    return db_notification