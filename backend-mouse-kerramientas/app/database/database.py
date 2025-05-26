"""
Configuración de la base de datos para la aplicación.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# URL de conexión a la base de datos
# Para desarrollo, pueden usar SQLite
# SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"
# Para producción, pueden usar PostgreSQL
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://usuario:contraseña@localhost:5432/mousekerramientas"
)

# Crear motor de base de datos
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # Necesario sólo para SQLite. Para otras bases de datos, puede eliminar esta línea
    # connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
)

# Crear sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos declarativos
Base = declarative_base()

# Función para obtener una sesión de base de datos
def get_db():
    """Proporciona una sesión de base de datos para las operaciones de la API."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()