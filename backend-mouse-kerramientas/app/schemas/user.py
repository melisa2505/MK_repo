"""
Esquemas Pydantic para usuarios
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, validator


class UserBase(BaseModel):
    """
    Schema base para usuario
    """
    email: EmailStr = Field(..., example="usuario@ejemplo.com")
    username: str = Field(..., min_length=3, max_length=50, example="usuario123")
    full_name: Optional[str] = Field(None, max_length=100, example="Juan Pérez")
    is_active: bool = True


class UserCreate(UserBase):
    """
    Schema para crear usuario
    """
    password: str = Field(..., min_length=8, example="contraseña123")
    password_confirm: str = Field(..., min_length=8, example="contraseña123")
    
    @validator('password_confirm')
    def passwords_match(cls, v, values, **kwargs):
        """Validar que las contraseñas coincidan."""
        if 'password' in values and v != values['password']:
            raise ValueError('Las contraseñas no coinciden')
        return v


class UserUpdate(BaseModel):
    """
    Schema para actualizar usuario
    """
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None


class UserInDB(UserBase):
    """
    Schema para usuario en base de datos
    """
    id: int
    hashed_password: str
    is_superuser: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class User(UserBase):
    """
    Schema para respuesta de usuario (sin campos sensibles)
    """
    id: int
    is_superuser: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """
    Schema para login de usuario
    """
    username: str
    password: str