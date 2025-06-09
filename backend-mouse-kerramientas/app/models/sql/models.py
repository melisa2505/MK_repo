from sqlalchemy import Column, Integer, String, Text, DECIMAL, Boolean, TIMESTAMP, DATE, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.config.database import Base

class Categoria(Base):
    __tablename__ = "categorias"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    imagen_url = Column(String(255))
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
    fecha_actualizacion = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    herramientas = relationship("Herramienta", back_populates="categoria")

class Herramienta(Base):
    __tablename__ = "herramientas"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=False)
    precio_diario = Column(DECIMAL(10, 2), nullable=False)
    estado = Column(String(50))
    imagen_url = Column(String(255))
    stock_total = Column(Integer, default=1)
    stock_disponible = Column(Integer, default=1)
    deposito_garantia = Column(DECIMAL(10, 2), default=0)
    requiere_deposito = Column(Boolean, default=False)
    calificacion_promedio = Column(DECIMAL(3, 2), default=0)
    cantidad_resenas = Column(Integer, default=0)
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
    fecha_actualizacion = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    categoria = relationship("Categoria", back_populates="herramientas")
    especificaciones = relationship("EspecificacionTecnica", back_populates="herramienta")

class EspecificacionTecnica(Base):
    __tablename__ = "especificaciones_tecnicas"
    
    id = Column(Integer, primary_key=True, index=True)
    herramienta_id = Column(Integer, ForeignKey("herramientas.id"), nullable=False)
    marca = Column(String(100))
    modelo = Column(String(100))
    potencia = Column(String(50))
    peso = Column(DECIMAL(8, 2))
    dimensiones = Column(String(100))
    caracteristicas_adicionales = Column(Text)
    fecha_fabricacion = Column(DATE)
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
    fecha_actualizacion = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    herramienta = relationship("Herramienta", back_populates="especificaciones")

class Cliente(Base):
    __tablename__ = "clientes"
    
    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(20))
    nombre = Column(String(100), nullable=False)
    apellidos = Column(String(100))
    razon_social = Column(String(150))
    documento_identidad = Column(String(20))
    ruc = Column(String(20))
    direccion = Column(Text)
    telefono = Column(String(20))
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    fecha_registro = Column(TIMESTAMP, server_default=func.now())
    activo = Column(Boolean, default=True)
    ubicacion_lat = Column(DECIMAL(10, 8))
    ubicacion_lng = Column(DECIMAL(11, 8))
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
    fecha_actualizacion = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

class Alquiler(Base):
    __tablename__ = "alquileres"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo_alquiler = Column(String(20), unique=True, nullable=False)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    fecha_solicitud = Column(TIMESTAMP, server_default=func.now())
    fecha_inicio = Column(DATE, nullable=False)
    fecha_fin_prevista = Column(DATE, nullable=False)
    fecha_devolucion = Column(DATE)
    monto_total = Column(DECIMAL(10, 2), nullable=False)
    monto_deposito = Column(DECIMAL(10, 2), default=0)
    estado = Column(String(50))
    observaciones = Column(Text)
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
    fecha_actualizacion = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

class AlquilerItem(Base):
    __tablename__ = "alquiler_items"
    
    id = Column(Integer, primary_key=True, index=True)
    alquiler_id = Column(Integer, ForeignKey("alquileres.id"), nullable=False)
    herramienta_id = Column(Integer, ForeignKey("herramientas.id"), nullable=False)
    cantidad = Column(Integer, default=1)
    precio_unitario = Column(DECIMAL(10, 2), nullable=False)
    subtotal = Column(DECIMAL(10, 2), nullable=False)
    estado_devolucion = Column(String(50), default='Pendiente')
    observaciones = Column(Text)

class Pago(Base):
    __tablename__ = "pagos"
    
    id = Column(Integer, primary_key=True, index=True)
    alquiler_id = Column(Integer, ForeignKey("alquileres.id"), nullable=False)
    fecha = Column(TIMESTAMP, server_default=func.now())
    monto = Column(DECIMAL(10, 2), nullable=False)
    metodo_pago = Column(String(50), nullable=False)
    referencia_pago = Column(String(100))
    es_adelanto = Column(Boolean, default=False)
    estado = Column(String(50), default='Completado')

class Conversacion(Base):
    __tablename__ = "conversaciones"
    
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    alquiler_id = Column(Integer, ForeignKey("alquileres.id"))
    asunto = Column(String(200))
    estado = Column(String(50), default='Activo')
    ultimo_mensaje = Column(TIMESTAMP)
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())

class Mensaje(Base):
    __tablename__ = "mensajes"
    
    id = Column(Integer, primary_key=True, index=True)
    conversacion_id = Column(Integer, ForeignKey("conversaciones.id"), nullable=False)
    emisor_tipo = Column(String(20), nullable=False)
    emisor_id = Column(Integer, nullable=False)
    contenido = Column(Text, nullable=False)
    leido = Column(Boolean, default=False)
    fecha_envio = Column(TIMESTAMP, server_default=func.now())
    metadatos = Column(JSON)
