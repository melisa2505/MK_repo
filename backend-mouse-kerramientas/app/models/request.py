"""
Model for tool rental requests.
"""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, Float, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..database.database import Base


class Request(Base):
    """Model for tool rental requests."""
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    tool_id = Column(Integer, ForeignKey("tools.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))
    consumer_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String(20))  # pending, confirmed, delivered, returned, rejected...
    start_date = Column(Date)
    end_date = Column(Date)
    total_amount = Column(Float)
    yape_approval_code = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    # tool = relationship("Tool")
    # owner = relationship("User", foreign_keys=[owner_id])
    # consumer = relationship("User", foreign_keys=[consumer_id])
    # payments = relationship("Payment", back_populates="request")