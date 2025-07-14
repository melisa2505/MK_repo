"""
Pydantic schemas for chat data validation.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from .message import Message


class ChatBase(BaseModel):
    """Base schema for chats."""
    owner_id: int = Field(..., example=1)
    consumer_id: int = Field(..., example=2)
    tool_id: int = Field(..., example=3)


class ChatCreate(ChatBase):
    """Schema for creating a new chat."""
    pass


class Chat(ChatBase):
    """Schema for chat responses."""
    id: int
    created_at: datetime

    class Config:
        """Model configuration."""
        from_attributes = True


class ChatWithMessages(Chat):
    """Schema for chat with its messages."""
    messages: List[Message] = []

    class Config:
        """Model configuration."""
        from_attributes = True