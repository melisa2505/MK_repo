"""
Routes for handling user notifications.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud import notification as crud_notification
from ..database.database import get_db
from ..dependencies import get_current_active_user
from ..models.user import User
from ..schemas.notification import Notification, NotificationUpdate

router = APIRouter()

@router.get("/{user_id}", response_model=List[Notification])
async def get_user_notifications(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all notifications for a user.
    """
    if current_user.id != user_id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these notifications"
        )
    
    return crud_notification.get_notifications(db, user_id, skip, limit)


@router.post("/{notification_id}/mark-read", response_model=Notification)
async def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark a notification as read.
    """
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    if notification.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this notification"
        )
    
    return crud_notification.mark_as_read(db, notification_id)