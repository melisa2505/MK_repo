"""
Model for request payments.
"""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, Float, Enum
from sqlalchemy.sql import func
import enum
from sqlalchemy.orm import relationship

from ..database.database import Base


class PaymentType(str, enum.Enum):
    """Enumeration for payment type."""
    PAYMENT = "payment"
    REFUND = "refund"


class Payment(Base):
    """Model for request payments."""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"))
    amount = Column(Float)
    type = Column(Enum(PaymentType), name="payment_type")
    status = Column(String(20))  # pending, completed...
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    # request = relationship("Request", back_populates="payments")