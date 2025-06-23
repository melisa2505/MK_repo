"""
Modelo para los alquileres de herramientas.
"""
import enum
from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database.database import Base


class RentalStatus(str, enum.Enum):
    """Enumeración para el estado del alquiler."""
    PENDING = "pending"
    ACTIVE = "active"
    RETURNED = "returned"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class Rental(Base):
    """Modelo para los alquileres de herramientas."""
    __tablename__ = "rentals"

    id = Column(Integer, primary_key=True, index=True)
    tool_id = Column(Integer, ForeignKey("tools.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    actual_return_date = Column(DateTime(timezone=True), nullable=True)
    total_price = Column(Float, nullable=False)
    status = Column(Enum(RentalStatus), default=RentalStatus.PENDING)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    tool = relationship("Tool", back_populates="rentals")
    user = relationship("User", back_populates="rentals")

    class Config:
        """Configuración del modelo."""
        orm_mode = True
