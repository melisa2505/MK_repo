"""
Esquemas Pydantic para validación de datos de usuarios.
"""
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime


class UserBase(BaseModel):
    """Esquema base para usuarios."""
    email: EmailStr = Field(..., example="usuario@ejemplo.com")
    username: str = Field(..., min_length=3, max_length=50, example="usuario123")
    full_name: Optional[str] = Field(None, max_length=100, example="Juan Pérez")
    phone_number: Optional[str] = Field(None, max_length=20, example="+52 55 1234 5678")


class UserCreate(UserBase):
    """Esquema para crear un nuevo usuario."""
    password: str = Field(..., min_length=8, example="contraseña123")
    password_confirm: str = Field(..., min_length=8, example="contraseña123")
    
    @validator('password_confirm')
    def passwords_match(cls, v, values, **kwargs):
        """Validar que las contraseñas coincidan."""
        if 'password' in values and v != values['password']:
            raise ValueError('Las contraseñas no coinciden')
        return v


class UserUpdate(BaseModel):
    """Esquema para actualizar un usuario existente."""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None


class User(UserBase):
    """Esquema para respuestas de usuario."""
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        """Configuración del modelo."""
        orm_mode = True


class UserInDB(User):
    """Esquema para usuario en la base de datos (solo para uso interno)."""
    hashed_password: str