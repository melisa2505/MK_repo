# 🛠️ MouseKerramientas API - Backend

Backend para la aplicación de alquiler de herramientas MouseKerramientas desarrollado con **FastAPI**.

## 📋 Características

- ✅ **API REST** completa con FastAPI
- ✅ **Autenticación JWT** segura
- ✅ **Base de datos SQLite** con SQLAlchemy
- ✅ **Validación de datos** con Pydantic
- ✅ **Documentación automática** con Swagger
- ✅ **Tests unitarios** con pytest
- ✅ **CORS** configurado para desarrollo

## 🚀 Instalación y Configuración

### Requisitos

- **Python 3.8+**
- **Pip** (gestor de paquetes de Python)
- **Git** (opcional)

### 1. Clonar el repositorio (si es necesario)

```bash
git clone <repository-url>
cd backend-mouse-kerramientas
```

### 2. Crear entorno virtual (RECOMENDADO)

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Linux/Mac:
source venv/bin/activate

# En Windows:
venv\Scripts\activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

## 🏃‍♂️ Ejecutar el Servidor

### Método 1: Usando uvicorn (Recomendado)

```bash
# Para desarrollo (con recarga automática)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Para producción
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Método 2: Usando el script principal

```bash
python main.py
```

### Método 3: Desde cualquier directorio

```bash
cd backend-mouse-kerramientas
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📚 Documentación API

Una vez que el servidor esté corriendo, puedes acceder a:

- **Swagger UI (Interactiva):** http://localhost:8000/docs
- **ReDoc (Documentación):** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

## 🧪 Ejecutar Tests

### Ejecutar todos los tests

```bash
# Desde la raíz del backend
pytest

# Con más detalles
pytest -v

# Con coverage
pytest --cov=app --cov-report=html
```

### Ejecutar tests específicos

```bash
# Solo tests de autenticación
pytest tests/test_auth.py

# Solo tests de usuarios
pytest tests/test_crud_user.py

# Solo tests de seguridad
pytest tests/test_security.py

# Test específico
pytest tests/test_auth.py::test_login_success
```

### Tests disponibles

- `test_auth.py` - Tests de endpoints de autenticación
- `test_crud_user.py` - Tests de operaciones CRUD de usuarios
- `test_security.py` - Tests de funciones de seguridad

## 🗄️ Base de Datos

### Ubicación
- **Desarrollo:** `mouse_kerramientas.db`
- **Tests:** `test.db` (se crea automáticamente)

### Reiniciar base de datos

```bash
# Eliminar base de datos actual
rm mouse_kerramientas.db

# Ejecutar el servidor (creará automáticamente las tablas)
uvicorn app.main:app --reload
```

## 🔐 Endpoints de Autenticación

### Registro de Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "username": "usuario123",
  "password": "password123",
  "password_confirm": "password123",
  "full_name": "Usuario Test"
}
```

### Login (Form Data)
```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=usuario123&password=password123
```

### Login (JSON)
```http
POST /api/auth/login-json
Content-Type: application/json

{
  "username": "usuario123",
  "password": "password123"
}
```

### Obtener Usuario Actual
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

### Test Token
```http
GET /api/auth/test-token
Authorization: Bearer <access_token>
```

## 🔧 Estructura del Proyecto

```
backend-mouse-kerramientas/
│
├── app/                          # 📁 Código principal
│   ├── main.py                   # 🚀 Punto de entrada FastAPI
│   ├── dependencies.py           # 🔗 Dependencias compartidas
│   │
│   ├── core/                     # ⚙️ Configuraciones centrales
│   │   ├── config.py             # 📋 Variables de configuración
│   │   └── security.py           # 🔐 Funciones de seguridad
│   │
│   ├── database/                 # 💾 Configuración BD
│   │   └── database.py           # 🔌 Conexión SQLAlchemy
│   │
│   ├── models/                   # 🏗️ Modelos de datos
│   │   ├── user.py               # 👤 Modelo Usuario
│   │   └── tool.py               # 🔨 Modelo Herramienta
│   │
│   ├── schemas/                  # 📝 Esquemas Pydantic
│   │   ├── user.py               # 👤 Esquemas Usuario
│   │   ├── tool.py               # 🔨 Esquemas Herramienta
│   │   └── token.py              # 🎫 Esquemas Token
│   │
│   ├── crud/                     # 📊 Operaciones BD
│   │   └── user.py               # 👤 CRUD Usuario
│   │
│   └── routes/                   # 🛣️ Endpoints API
│       ├── auth.py               # 🔐 Autenticación
│       ├── users.py              # 👤 Usuarios
│       ├── tools.py              # 🔨 Herramientas
│       └── products.py           # 📦 Productos
│
├── tests/                        # 🧪 Tests unitarios
│   ├── conftest.py               # ⚙️ Configuración pytest
│   ├── test_auth.py              # 🔐 Tests autenticación
│   ├── test_crud_user.py         # 👤 Tests CRUD usuario
│   └── test_security.py          # 🔐 Tests seguridad
│
├── main.py                       # 🏃‍♂️ Script de inicio
├── requirements.txt              # 📦 Dependencias
└── README.md                     # 📖 Esta documentación
```

## 🔍 Verificar que Todo Funciona

### 1. Health Check
```bash
curl http://localhost:8000/health
# Respuesta: {"status":"ok"}
```

### 2. Registrar un usuario
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "username": "testuser",
       "password": "testpass123",
       "password_confirm": "testpass123",
       "full_name": "Test User"
     }'
```

### 3. Hacer login
```bash
curl -X POST "http://localhost:8000/api/auth/login-json" \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "password": "testpass123"
     }'
```

## 🐛 Solución de Problemas

### Error: "ModuleNotFoundError"
```bash
# Asegúrate de estar en el directorio correcto
cd backend-mouse-kerramientas

# Reinstala las dependencias
pip install -r requirements.txt
```

### Error: "Port already in use"
```bash
# Encuentra el proceso usando el puerto 8000
lsof -i :8000

# Mata el proceso (reemplaza PID con el número real)
kill -9 <PID>

# O usa otro puerto
uvicorn app.main:app --reload --port 8001
```

### Error: "Database locked"
```bash
# Elimina la base de datos y reinicia
rm mouse_kerramientas.db
uvicorn app.main:app --reload
```

### Tests fallan
```bash
# Limpia caché de pytest
pytest --cache-clear

# Ejecuta con más información
pytest -v -s
```

## 📊 Variables de Entorno (Opcional)

Crea un archivo `.env` en la raíz del backend:

```env
# Configuración JWT
SECRET_KEY=tu_clave_secreta_super_segura_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Base de datos
DATABASE_URL=sqlite:///./mouse_kerramientas.db

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

## 🚀 Comandos Rápidos

```bash
# Configuración inicial completa
python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# Desarrollo (con recarga automática)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Tests con coverage
pytest --cov=app

# Limpiar y reiniciar
rm mouse_kerramientas.db && uvicorn app.main:app --reload
```

## 📝 Notas Importantes

- El servidor corre en **http://localhost:8000** por defecto
- La base de datos se crea automáticamente al iniciar
- Los tokens JWT expiran en **30 minutos** por defecto
- El backend acepta conexiones desde **cualquier origen** en desarrollo
- Para producción, configura CORS apropiadamente

## 🤝 Integración con Frontend

El frontend React Native debe apuntar a:
- **Emulador:** `http://localhost:8000`
- **Dispositivo físico:** `http://TU_IP_LOCAL:8000`

Asegúrate de que el backend esté corriendo antes de iniciar el frontend.

---

## ✅ Estado del Backend

**🟢 COMPLETAMENTE FUNCIONAL**

- Autenticación JWT ✅
- CRUD de usuarios ✅
- Endpoints RESTful ✅
- Tests unitarios ✅
- Documentación API ✅
- Base de datos SQLite ✅

¡El backend está listo para conectarse con el frontend y comenzar a usar la aplicación Mouse Kerramientas!