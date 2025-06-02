"""
Configuración de la aplicación
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Configuración de la aplicación usando Pydantic Settings
    """
    # JWT Configuration
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./mouse_kerramientas.db"
    
    # Security
    BCRYPT_ROUNDS: int = 12
    
    # API Configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "MouseKerramientas API"
    
    class Config:
        env_file = ".env"


# Instancia global de configuración
settings = Settings()