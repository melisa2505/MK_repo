"""
Pydantic schemas for payment data validation.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from ..models.payment import PaymentType


class PaymentBase(BaseModel):
    """Base schema for payments."""
    request_id: int = Field(..., example=1)
    amount: float = Field(..., gt=0, example=75.0)
    type: PaymentType = Field(..., example=PaymentType.PAYMENT)
    status: str = Field(..., example="pending")


class PaymentCreate(PaymentBase):
    """Schema for creating a new payment."""
    pass


class PaymentUpdate(BaseModel):
    """Schema for updating an existing payment."""
    status: str = Field(..., example="completed")


class Payment(PaymentBase):
    """Schema for payment responses."""
    id: int
    timestamp: datetime

    class Config:
        """Model configuration."""
        from_attributes = True