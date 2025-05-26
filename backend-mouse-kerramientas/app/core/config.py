"""
Configuración central de la aplicación.
"""
import os
from pydantic import BaseSettings, AnyHttpUrl, PostgresDsn
from typing import List, Optional, Union
from dotenv import load_dotenv

# Cargar variables de entorno desde .env si existe
load_dotenv()

class Settings(BaseSettings):
    """
    Configuración de la aplicación con valores por defecto.
    Estos valores pueden ser sobrescritos por variables de entorno.
    """
    # Configuración general
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "MouseKerramientas API"
    DESCRIPTION: str = "API para la aplicación de alquiler de herramientas MouseKerramientas"
    VERSION: str = "0.1.0"
    
    # Configuración de seguridad
    SECRET_KEY: str = os.getenv("SECRET_KEY", "unsecretomuysecreto")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 días
    
    # Configuración de CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    
    # Configuración de base de datos
    DATABASE_URL: Optional[str] = os.getenv(
        "DATABASE_URL", "postgresql://usuario:contraseña@localhost:5432/mousekerramientas"
    )
    
    class Config:
        case_sensitive = True


# Instancia de configuración para usar en toda la aplicación
settings = Settings()