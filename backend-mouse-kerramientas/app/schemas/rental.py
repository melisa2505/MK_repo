"""
Esquemas Pydantic para validación de datos de alquileres.
"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from ..models.rental import RentalStatus


class RentalBase(BaseModel):
    """Esquema base para alquileres."""
    start_date: datetime = Field(..., description="Fecha de inicio del alquiler")
    end_date: datetime = Field(..., description="Fecha de fin del alquiler")
    notes: Optional[str] = Field(None, max_length=500, description="Notas adicionales")


class RentalCreate(RentalBase):
    """Esquema para crear un nuevo alquiler."""
    tool_id: int = Field(..., description="ID de la herramienta a alquilar")


class RentalUpdate(BaseModel):
    """Esquema para actualizar un alquiler existente."""
    end_date: Optional[datetime] = Field(None, description="Nueva fecha de fin")
    status: Optional[RentalStatus] = Field(None, description="Nuevo estado del alquiler")
    notes: Optional[str] = Field(None, max_length=500, description="Notas adicionales")


class RentalReturn(BaseModel):
    """Esquema para devolver una herramienta."""
    actual_return_date: datetime = Field(..., description="Fecha real de devolución")
    notes: Optional[str] = Field(None, max_length=500, description="Notas sobre la devolución")


class Rental(RentalBase):
    """Esquema para respuestas de alquiler."""
    id: int
    tool_id: int
    user_id: int
    actual_return_date: Optional[datetime]
    total_price: float
    status: RentalStatus
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        """Configuración del modelo."""
        orm_mode = True


class RentalWithDetails(Rental):
    """Esquema para alquiler con detalles de herramienta y usuario."""
    tool_name: str
    tool_brand: str
    tool_model: str
    tool_daily_price: float
    user_username: str
    user_full_name: Optional[str]


class RentalStats(BaseModel):
    """Esquema para estadísticas de alquileres."""
    total_rentals: int
    active_rentals: int
    overdue_rentals: int
    completed_rentals: int
    total_revenue: float
