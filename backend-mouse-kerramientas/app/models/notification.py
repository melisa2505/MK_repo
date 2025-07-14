"""
Model for user notifications.
"""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..database.database import Base


class Notification(Base):
    """Model for user notifications."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String(30))
    content = Column(Text)
    read = Column(Boolean, default=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    # user = relationship("User")