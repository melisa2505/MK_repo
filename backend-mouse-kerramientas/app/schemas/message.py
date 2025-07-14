"""
Pydantic schemas for message data validation.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class MessageBase(BaseModel):
    """Base schema for messages."""
    chat_id: int = Field(..., example=1)
    sender_id: Optional[int] = Field(None, example=1)
    content: str = Field(..., example="Hello, I'm interested in your tool.")


class MessageCreate(MessageBase):
    """Schema for creating a new message."""
    pass


class Message(MessageBase):
    """Schema for message responses."""
    id: int
    timestamp: datetime

    class Config:
        """Model configuration."""
        from_attributes = True