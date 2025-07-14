"""
Pydantic schemas for request data validation.
"""
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field


class RequestBase(BaseModel):
    """Base schema for rental requests."""
    tool_id: int = Field(..., example=1)
    owner_id: int = Field(..., example=2)
    consumer_id: int = Field(..., example=3)
    start_date: date = Field(..., example="2025-07-15")
    end_date: date = Field(..., example="2025-07-17")
    total_amount: float = Field(..., gt=0, example=75.0)


class RequestCreate(RequestBase):
    """Schema for creating a new request."""
    pass


class RequestUpdate(BaseModel):
    """Schema for updating an existing request."""
    status: Optional[str] = Field(None, example="confirmed")
    yape_approval_code: Optional[str] = Field(None, example="YAP123456789")
    total_amount: Optional[float] = Field(None, gt=0)


class Request(RequestBase):
    """Schema for request responses."""
    id: int
    status: str
    yape_approval_code: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        """Model configuration."""
        from_attributes = True


class RequestDetail(Request):
    """Schema for detailed request responses."""
    # payments: List["Payment"] = []
    
    class Config:
        """Model configuration."""
        from_attributes = True