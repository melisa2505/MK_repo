"""
Model for chats between users.
"""
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..database.database import Base


class Chat(Base):
    """Model for conversations between users."""
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    consumer_id = Column(Integer, ForeignKey("users.id"))
    tool_id = Column(Integer, ForeignKey("tools.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    # owner = relationship("User", foreign_keys=[owner_id])
    # consumer = relationship("User", foreign_keys=[consumer_id])
    # tool = relationship("Tool")
    # messages = relationship("Message", back_populates="chat")