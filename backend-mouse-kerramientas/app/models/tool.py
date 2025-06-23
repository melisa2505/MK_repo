"""
Modelo para las herramientas en la base de datos.
"""
import enum
from sqlalchemy import Boolean, Column, Enum, Float, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import Date
from ..database.database import Base


class ToolCondition(str, enum.Enum):
    """Enumeración para el estado de la herramienta."""
    NEW = "new"
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


class Tool(Base):
    """Modelo para las herramientas."""
    __tablename__ = "tools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    description = Column(Text)
    brand = Column(String(50))
    model = Column(String(50))
    # category_id = Column(Integer, ForeignKey("categories.id"))  # Comentado temporalmente
    category = Column(String(50))  # Campo temporal para categoría
    daily_price = Column(Float)
    condition = Column(Enum(ToolCondition), default=ToolCondition.GOOD)
    is_available = Column(Boolean, default=True)
    image_url = Column(String(255), nullable=True)
    # owner_id = Column(Integer, ForeignKey("users.id"))  # Comentado temporalmente
    
    # Relaciones comentadas temporalmente
    # owner = relationship("User", back_populates="tools")
    # category = relationship("Category", back_populates="tools")
    rentals = relationship("Rental", back_populates="tool")
    ratings = relationship("Rating", back_populates="tool")

    class Config:
        """Configuración del modelo."""
        orm_mode = True