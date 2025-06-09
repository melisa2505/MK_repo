# Mouse Kerramientas - Arquitectura Híbrida

## 🏗️ Arquitectura

Este proyecto implementa una **arquitectura híbrida** que combina:

- **PostgreSQL (SQL)**: Para datos estructurados y transaccionales
- **MongoDB (NoSQL)**: Para datos flexibles y analytics
- **FastAPI**: Framework web de alto rendimiento

## 🗄️ Distribución de Datos

### PostgreSQL (Datos Estructurados)
- `categorias` - Categorías de herramientas
- `herramientas` - Inventario principal
- `especificaciones_tecnicas` - Specs técnicas
- `clientes` - Información de usuarios
- `alquileres` - Transacciones de alquiler
- `alquiler_items` - Items por alquiler
- `pagos` - Pagos y transacciones
- `conversaciones` - Conversaciones
- `mensajes` - Mensajes del chat

### MongoDB (Datos Flexibles)
- `resenas` - Reseñas y calificaciones
- `notificaciones` - Sistema de notificaciones
- `eventos_promocion` - Promociones y eventos

## 🚀 Instalación

### Prerrequisitos
- Python 3.8+
- PostgreSQL Server
- MongoDB Server

### Pasos de Instalación

1. **Clonar y navegar al proyecto**
```bash
cd backend-mouse-kerramientas
```

2. **Ejecutar script de instalación**
```bash
./install.sh
```

3. **Configurar variables de entorno**
Editar el archivo `.env` en la raíz del proyecto:
```env
# Base de datos SQL (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mouse_kerramientas
DB_USER=postgres
DB_PASSWORD=tu_password

# Base de datos NoSQL (MongoDB)
MONGODB_URL=mongodb://localhost:27017/mouse_kerramientas_nosql

# JWT
JWT_SECRET_KEY=tu_jwt_secret_key
JWT_ALGORITHM=HS256

# Puerto de la aplicación
PORT=8000
```

4. **Inicializar bases de datos**
```bash
python scripts/init_database.py
```

5. **Ejecutar aplicación**
```bash
# Modo desarrollo
python -m app.main

# O usando uvicorn
uvicorn app.main:app --reload --port 8000
```

## 🔗 Integración Híbrida

### Ejemplo de Flujo Híbrido

1. **Crear Reseña**: Se guarda en MongoDB
2. **Actualizar Calificación**: Se actualiza automáticamente en PostgreSQL
3. **Consultar Estadísticas**: Combina datos de ambas bases

### Endpoints Híbridos

- `POST /api/hybrid/herramientas/{id}/resenas` - Crear reseña
- `GET /api/hybrid/herramientas/{id}/resenas` - Obtener reseñas
- `GET /api/hybrid/herramientas/{id}/estadisticas` - Stats completas

## 📊 Servicios de Integración

El módulo `app.services.integration` maneja la sincronización entre bases:

```python
from app.services.integration import actualizar_calificacion_herramienta

# Actualiza calificación promedio en PostgreSQL basado en reseñas de MongoDB
stats = await actualizar_calificacion_herramienta(herramienta_id)
```

## 🧪 Testing

```bash
# Ejecutar tests
pytest

# Test específico de integración híbrida
pytest tests/test_hybrid.py
```

## 📝 Estructura del Proyecto

```
app/
├── config/
│   ├── database.py      # Configuración PostgreSQL
│   └── mongodb.py       # Configuración MongoDB
├── models/
│   ├── sql/
│   │   └── models.py    # Modelos SQLAlchemy
│   └── nosql/
│       └── models.py    # Modelos Pydantic/MongoDB
├── routes/
│   ├── hybrid.py        # Rutas híbridas
│   └── ...
├── services/
│   └── integration.py   # Servicios de integración
├── schemas/
│   └── nosql_schemas.py # Schemas para NoSQL
└── main.py              # Aplicación principal
```

## 🔍 Monitoreo

La aplicación expone endpoints de salud que verifican ambas bases:

- `GET /health` - Estado general
- `GET /` - Información de la API

## 🚀 Producción

Para despliegue en producción:

1. Configurar variables de entorno seguras
2. Usar conexiones SSL para las bases de datos
3. Implementar balanceador de carga
4. Configurar monitoring y logging

## 📞 Soporte

Para soporte técnico sobre la arquitectura híbrida, consulta la documentación o crea un issue en el repositorio.
