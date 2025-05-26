"""
Esquemas Pydantic para tokens de autenticación.
"""
from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """Esquema para la respuesta de token de acceso."""
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    """Esquema para el payload del token JWT."""
    sub: Optional[str] = None
    # Puedes agregar más campos según sea necesario