"""
Archivo principal de la aplicación FastAPI para Mouse Kerramentas
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/")
async def root():
    """
    Endpoint raíz para comprobar que la API está funcionando
    """
    return {"message": "Bienvenido a la API de MouseKerramientas"}

@app.get("/health")
async def health_check():
    """
    Endpoint para comprobar el estado de la API
    """
    return {"status": "ok"}

# Punto de entrada para ejecutar la aplicación con uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)