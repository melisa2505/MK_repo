"""
Model for chat messages.
"""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..database.database import Base


class Message(Base):
    """Model for chat messages."""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"))
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    content = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    # chat = relationship("Chat", back_populates="messages")
    # sender = relationship("User")