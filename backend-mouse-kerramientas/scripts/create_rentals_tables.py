"""
Script para crear las tablas de alquileres y ratings en la base de datos.
"""
import sys
import os

# Agregar el directorio padre al path para importar módulos de la app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import engine, Base
from app.models.rental import Rental
from app.models.rating import Rating

def create_tables():
    """Crea las tablas de alquileres y ratings."""
    print("Creando tablas de alquileres y ratings...")
    
    try:
        # Crear todas las tablas definidas en los modelos
        Base.metadata.create_all(bind=engine)
        print("Tablas creadas exitosamente!")
        
    except Exception as e:
        print(f"Error al crear las tablas: {e}")
        return False
    
    return True

if __name__ == "__main__":
    create_tables()
