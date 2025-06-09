from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

class ResenaCreate(BaseModel):
    herramienta_sql_id: int
    cliente_sql_id: int
    alquiler_sql_id: int
    calificacion: int = Field(..., ge=1, le=5)
    comentario: Optional[str] = None

class NotificacionCreate(BaseModel):
    usuario_sql_id: int
    tipo: str
    titulo: Optional[str] = None
    mensaje: Optional[str] = None
    referencia_id: Optional[str] = None
    referencia_tipo: Optional[str] = None
    importante: bool = False

class EventoPromocionCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    tipo: str
    descuento_porcentaje: Optional[float] = None
    herramientas_aplicables_sql_ids: List[int] = []
    categorias_aplicables_sql_ids: List[int] = []
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    codigo_promocion: Optional[str] = None
    limite_usos: Optional[int] = None
    condiciones: List[str] = []
    imagen_url: Optional[str] = None
