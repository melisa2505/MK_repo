from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class Respuesta(BaseModel):
    texto: str
    fecha: datetime

class Resena(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    herramienta_sql_id: int
    cliente_sql_id: int
    alquiler_sql_id: int
    calificacion: int = Field(..., ge=1, le=5)
    comentario: Optional[str] = None
    fecha: datetime = Field(default_factory=datetime.now)
    respuesta: Optional[Respuesta] = None
    likes: int = 0
    reportado: bool = False
    fecha_creacion: datetime = Field(default_factory=datetime.now)
    fecha_actualizacion: datetime = Field(default_factory=datetime.now)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Notificacion(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    usuario_sql_id: int
    tipo: str
    titulo: Optional[str] = None
    mensaje: Optional[str] = None
    referencia_id: Optional[str] = None
    referencia_tipo: Optional[str] = None
    leido: bool = False
    importante: bool = False
    fecha_envio: datetime = Field(default_factory=datetime.now)
    fecha_lectura: Optional[datetime] = None
    metadatos: Optional[Dict[str, Any]] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class CriteriosSegmentacion(BaseModel):
    ubicacion: Optional[Dict[str, List[str]]] = None
    tipo_cliente: Optional[List[str]] = None
    historial_minimo: Optional[int] = None

class EventoPromocion(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
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
    usos_actuales: int = 0
    condiciones: List[str] = []
    imagen_url: Optional[str] = None
    activo: bool = True
    prioridad: int = 0
    criterios_segmentacion: Optional[CriteriosSegmentacion] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
