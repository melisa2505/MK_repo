-- Crear base de datos PostgreSQL
CREATE DATABASE mouse_kerramientas;

-- Conectar a la base de datos
\c mouse_kerramientas;

-- Crear extensión para UUID si es necesaria
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  imagen_url VARCHAR(255),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE herramientas (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  categoria_id INTEGER NOT NULL,
  precio_diario DECIMAL(10,2) NOT NULL,
  estado VARCHAR(50) CHECK (estado IN ('Nuevo', 'Usado-Bueno', 'Usado-Regular', 'En Mantenimiento')),
  imagen_url VARCHAR(255),
  stock_total INTEGER NOT NULL DEFAULT 1,
  stock_disponible INTEGER NOT NULL DEFAULT 1,
  deposito_garantia DECIMAL(10,2) DEFAULT 0,
  requiere_deposito BOOLEAN DEFAULT FALSE,
  calificacion_promedio DECIMAL(3,2) DEFAULT 0,
  cantidad_resenas INTEGER DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE especificaciones_tecnicas (
  id SERIAL PRIMARY KEY,
  herramienta_id INTEGER NOT NULL,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  potencia VARCHAR(50),
  peso DECIMAL(8,2),
  dimensiones VARCHAR(100),
  caracteristicas_adicionales TEXT,
  fecha_fabricacion DATE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (herramienta_id) REFERENCES herramientas(id) ON DELETE CASCADE
);

CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(20) CHECK (tipo IN ('Individual', 'Empresa')),
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100),
  razon_social VARCHAR(150),
  documento_identidad VARCHAR(20),
  ruc VARCHAR(20),
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,
  ubicacion_lat DECIMAL(10,8),
  ubicacion_lng DECIMAL(11,8),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alquileres (
  id SERIAL PRIMARY KEY,
  codigo_alquiler VARCHAR(20) UNIQUE NOT NULL,
  cliente_id INTEGER NOT NULL,
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_inicio DATE NOT NULL,
  fecha_fin_prevista DATE NOT NULL,
  fecha_devolucion DATE,
  monto_total DECIMAL(10,2) NOT NULL,
  monto_deposito DECIMAL(10,2) DEFAULT 0,
  estado VARCHAR(50) CHECK (estado IN ('Solicitado', 'Aceptado', 'Rechazado', 'En Curso', 'Finalizado', 'Cancelado')),
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE alquiler_items (
  id SERIAL PRIMARY KEY,
  alquiler_id INTEGER NOT NULL,
  herramienta_id INTEGER NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  estado_devolucion VARCHAR(50) DEFAULT 'Pendiente' CHECK (estado_devolucion IN ('Pendiente', 'Devuelto-Bueno', 'Devuelto-Dañado')),
  observaciones TEXT,
  FOREIGN KEY (alquiler_id) REFERENCES alquileres(id) ON DELETE CASCADE,
  FOREIGN KEY (herramienta_id) REFERENCES herramientas(id)
);

CREATE TABLE pagos (
  id SERIAL PRIMARY KEY,
  alquiler_id INTEGER NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL,
  referencia_pago VARCHAR(100),
  es_adelanto BOOLEAN DEFAULT FALSE,
  estado VARCHAR(50) DEFAULT 'Completado',
  FOREIGN KEY (alquiler_id) REFERENCES alquileres(id) ON DELETE CASCADE
);

CREATE TABLE conversaciones (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL,
  alquiler_id INTEGER,
  asunto VARCHAR(200),
  estado VARCHAR(50) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Cerrado', 'Archivado')),
  ultimo_mensaje TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (alquiler_id) REFERENCES alquileres(id) ON DELETE SET NULL
);

CREATE TABLE mensajes (
  id SERIAL PRIMARY KEY,
  conversacion_id INTEGER NOT NULL,
  emisor_tipo VARCHAR(20) NOT NULL CHECK (emisor_tipo IN ('Cliente', 'Sistema')),
  emisor_id INTEGER NOT NULL,
  contenido TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadatos JSONB,
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE
);

-- Crear triggers para actualización automática de fecha_actualizacion
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers a las tablas
CREATE TRIGGER update_categorias_fecha_actualizacion
    BEFORE UPDATE ON categorias
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER update_herramientas_fecha_actualizacion
    BEFORE UPDATE ON herramientas
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER update_especificaciones_fecha_actualizacion
    BEFORE UPDATE ON especificaciones_tecnicas
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER update_clientes_fecha_actualizacion
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER update_alquileres_fecha_actualizacion
    BEFORE UPDATE ON alquileres
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();
