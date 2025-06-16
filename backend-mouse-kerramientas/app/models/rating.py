"""
Modelo para las calificaciones de herramientas.
"""
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database.database import Base


class Rating(Base):
    """Modelo para las calificaciones de herramientas."""
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    tool_id = Column(Integer, ForeignKey("tools.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    tool = relationship("Tool", back_populates="ratings")
    user = relationship("User", back_populates="ratings")

    class Config:
        """Configuración del modelo."""
        orm_mode = True
