"""
Esquemas para validación de datos de categorías
"""
from typing import Optional
from pydantic import BaseModel


class CategoryBase(BaseModel):
    """Esquema base para categorías."""
    name: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    """Esquema para crear una categoría."""
    pass


class CategoryUpdate(CategoryBase):
    """Esquema para actualizar una categoría."""
    name: Optional[str] = None


class Category(CategoryBase):
    """Esquema para devolver una categoría."""
    id: int

    class Config:
        """Configuración del modelo."""
        from_attributes = True