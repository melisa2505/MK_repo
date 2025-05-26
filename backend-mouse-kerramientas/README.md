# MouseKerramientas API

Backend para la aplicación de alquiler de herramientas MouseKerramientas desarrollado con FastAPI.

## Requisitos

- Python 3.8+
- Pip (gestor de paquetes de Python)
- Entorno virtual (recomendado)

## Instalación

1. Crear un entorno virtual (opcional pero recomendado):

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate
```

2. Instalar dependencias:

```bash
pip install -r requirements.txt
```

## Ejecutar el servidor de desarrollo

```bash
# Método 1: Usando uvicorn directamente
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Método 2: Usando el script principal
python main.py
```

## Documentación API

Una vez que el servidor esté corriendo, puedes acceder a:

- Documentación Swagger UI: http://localhost:8000/docs
- Documentación ReDoc: http://localhost:8000/redoc

## Estructura del Proyecto

```
backend-mouse-kerramientas/
│
├── app/                    # Código principal de la aplicación
│   ├── core/               # Configuraciones centrales
│   ├── database/           # Configuración de base de datos
│   ├── models/             # Modelos de la base de datos (SQLAlchemy)
│   ├── routes/             # Endpoints de la API
│   ├── schemas/            # Modelos Pydantic para validación
│   └── main.py             # Punto de entrada de la aplicación
│
├── tests/                  # Pruebas unitarias
├── docs/                   # Documentación adicional
│
├── requirements.txt        # Dependencias del proyecto
└── README.md               # Este archivo
```

## Ejemplo de uso

Para probar que la API está funcionando:

```bash
curl http://localhost:8000/health
# Debería devolver: {"status":"ok"}
```