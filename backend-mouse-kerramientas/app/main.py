"""
Archivo principal de la aplicación FastAPI para Mouse Kerramientas - Arquitectura Híbrida
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from .database.database import Base, engine
from .config.mongodb import connect_to_mongo, close_mongo_connection
from .routes import auth, products, tools, users, hybrid, ratings

load_dotenv()

# Crear las tablas de la base de datos SQL
Base.metadata.create_all(bind=engine)

# Crear la instancia de la aplicación
app = FastAPI(
    title="MouseKerramientas API - Híbrido",
    description="API híbrida con PostgreSQL y MongoDB para la aplicación de alquiler de herramientas MouseKerramientas",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar los orígenes exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    print("Aplicación iniciada - Conectado a MongoDB y PostgreSQL")

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()
    print("Aplicación cerrada - Conexiones cerradas")

# Incluir los routers de la aplicación
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(tools.router, prefix="/api/tools", tags=["tools"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(hybrid.router, prefix="/api/hybrid", tags=["hybrid"])
app.include_router(ratings.router, prefix="/api/ratings", tags=["ratings"])

# Importar y registrar las rutas de admin
from .routes import admin
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/", tags=["health"])
async def root():
    """
    Endpoint raíz para comprobar que la API híbrida está funcionando
    """
    return {
        "message": "Bienvenido a la API híbrida de MouseKerramientas",
        "version": "1.0.0",
        "databases": ["PostgreSQL", "MongoDB"]
    }

@app.get("/health", tags=["health"])
async def health_check():
    """
    Endpoint para comprobar el estado de la API híbrida
    """
    return {
        "status": "ok",
        "sql_database": "connected",
        "nosql_database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)