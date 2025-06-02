"""
Archivo principal de la aplicación FastAPI para Mouse Kerramientas
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database.database import Base, engine
from .routes import auth, products, tools, users

# Crear las tablas de la base de datos
Base.metadata.create_all(bind=engine)

# Crear la instancia de la aplicación
app = FastAPI(
    title="MouseKerramientas API",
    description="API para la aplicación de alquiler de herramientas MouseKerramientas",
    version="0.1.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar los orígenes exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los routers de la aplicación
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(tools.router, prefix="/api/tools", tags=["tools"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/", tags=["health"])
async def root():
    """
    Endpoint raíz para comprobar que la API está funcionando
    """
    return {"message": "Bienvenido a la API de MouseKerramientas"}

@app.get("/health", tags=["health"])
async def health_check():
    """
    Endpoint para comprobar el estado de la API
    """
    return {"status": "ok"}