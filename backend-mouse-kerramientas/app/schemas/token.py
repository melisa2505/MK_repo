"""
Esquemas Pydantic para autenticación y tokens
"""
from typing import Optional

from pydantic import BaseModel


class Token(BaseModel):
    """
    Schema para respuesta de token
    """
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """
    Schema para datos del token
    """
    username: Optional[str] = None