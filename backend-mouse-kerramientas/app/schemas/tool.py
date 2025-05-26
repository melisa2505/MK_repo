"""
Esquemas Pydantic para validación de datos de herramientas.
"""
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import date
from ..models.tool import ToolCondition

class ToolBase(BaseModel):
    """Esquema base para herramientas."""
    name: str = Field(..., min_length=3, max_length=100, example="Taladro Inalámbrico")
    description: str = Field(..., min_length=10, example="Taladro inalámbrico de 12V con batería de larga duración")
    brand: str = Field(..., min_length=2, max_length=50, example="DeWalt")
    model: str = Field(..., min_length=2, max_length=50, example="DCD777C2")
    daily_price: float = Field(..., gt=0, example=25.5)
    condition: ToolCondition = Field(default=ToolCondition.GOOD)
    category_id: int = Field(..., example=1)
    image_url: Optional[str] = Field(None, example="https://example.com/image.jpg")


class ToolCreate(ToolBase):
    """Esquema para crear una nueva herramienta."""
    pass


class ToolUpdate(BaseModel):
    """Esquema para actualizar una herramienta existente."""
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None
    brand: Optional[str] = Field(None, min_length=2, max_length=50)
    model: Optional[str] = Field(None, min_length=2, max_length=50)
    daily_price: Optional[float] = Field(None, gt=0)
    condition: Optional[ToolCondition] = None
    category_id: Optional[int] = None
    is_available: Optional[bool] = None
    image_url: Optional[str] = None


class Tool(ToolBase):
    """Esquema para respuestas de herramienta."""
    id: int
    is_available: bool
    owner_id: int

    class Config:
        """Configuración del modelo."""
        orm_mode = True


class ToolDetail(Tool):
    """Esquema para respuestas detalladas de herramienta."""
    # Aquí puedes agregar relaciones si es necesario
    # Por ejemplo, información del propietario o categoría
    pass