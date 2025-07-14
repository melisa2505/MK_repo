"""
Punto de entrada para ejecutar la aplicación FastAPI para Mouse Kerramientas
"""
# Importar la app correctamente configurada desde el paquete app
from app.main import app

# Punto de entrada para ejecutar la aplicación con uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)