"""
Esquemas Pydantic para validación de datos de calificaciones.
"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class RatingBase(BaseModel):
    """Esquema base para calificaciones."""
    rating: float = Field(..., ge=1.0, le=5.0, description="Calificación de 1 a 5 estrellas")
    comment: Optional[str] = Field(None, max_length=500, description="Comentario opcional")


class RatingCreate(RatingBase):
    """Esquema para crear una nueva calificación."""
    tool_id: int = Field(..., description="ID de la herramienta a calificar")


class RatingUpdate(BaseModel):
    """Esquema para actualizar una calificación existente."""
    rating: Optional[float] = Field(None, ge=1.0, le=5.0, description="Calificación de 1 a 5 estrellas")
    comment: Optional[str] = Field(None, max_length=500, description="Comentario opcional")


class Rating(RatingBase):
    """Esquema para respuestas de calificación."""
    id: int
    tool_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        """Configuración del modelo."""
        orm_mode = True


class RatingWithUser(Rating):
    """Esquema para calificación con información del usuario."""
    user_username: str
    user_full_name: Optional[str]


class RatingWithTool(Rating):
    """Esquema para calificación con información de la herramienta."""
    tool_name: str
    tool_brand: str
    tool_model: str


class RatingStats(BaseModel):
    """Esquema para estadísticas de calificaciones."""
    total_ratings: int
    average_rating: float
    rating_distribution: dict
