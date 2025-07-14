"""
Pydantic schemas for notification data validation.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class NotificationBase(BaseModel):
    """Base schema for notifications."""
    user_id: int = Field(..., description="ID del usuario que recibirá la notificación", example=1)
    type: str = Field(..., description="Tipo de notificación", example="request_created")
    content: str = Field(..., description="Contenido de la notificación", example="Se ha realizado una nueva solicitud para tu herramienta.")


class NotificationCreate(NotificationBase):
    """Schema for creating a new notification."""
    pass


class NotificationUpdate(BaseModel):
    """Schema for updating a notification."""
    read: bool = Field(..., description="Estado de lectura de la notificación", example=True)


class Notification(NotificationBase):
    """Schema for notification responses."""
    id: int = Field(..., description="ID único de la notificación", example=1)
    read: bool = Field(..., description="Si la notificación ha sido leída", example=False)
    timestamp: datetime = Field(..., description="Fecha y hora de creación de la notificación")

    class Config:
        """Model configuration."""
        from_attributes = True