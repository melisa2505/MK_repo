"""
Modelo para los usuarios en la base de datos.
"""
from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database.database import Base


class User(Base):
    """Modelo para usuarios del sistema."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100))
    phone_number = Column(String(20))
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    tools = relationship("Tool", back_populates="owner")
    rentals_as_client = relationship("Rental", back_populates="client", foreign_keys="Rental.client_id")

    class Config:
        """Configuración del modelo."""
        orm_mode = True