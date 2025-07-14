"""
Pydantic schemas for notification data validation.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class NotificationBase(BaseModel):
    """Base schema for notifications."""
    user_id: int = Field(..., example=1)
    type: str = Field(..., example="request_created")
    content: str = Field(..., example="A new request has been made for your tool.")


class NotificationCreate(NotificationBase):
    """Schema for creating a new notification."""
    pass


class NotificationUpdate(BaseModel):
    """Schema for updating a notification."""
    read: bool = Field(..., example=True)


class Notification(NotificationBase):
    """Schema for notification responses."""
    id: int
    read: bool
    timestamp: datetime

    class Config:
        """Model configuration."""
        from_attributes = True