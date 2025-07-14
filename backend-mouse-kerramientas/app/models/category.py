"""
Modelo para las categorías de herramientas en la base de datos.
"""
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from ..database.database import Base


class Category(Base):
    """Modelo para las categorías de herramientas."""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, unique=True)
    description = Column(Text, nullable=True)
    
    # Relación con las herramientas (se activará cuando se conecten los modelos)
    # tools = relationship("Tool", back_populates="category")

    class Config:
        """Configuración del modelo."""
        orm_mode = True