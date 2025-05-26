"""
Utilidades de seguridad para autenticación y autorización.
"""
from datetime import datetime, timedelta
from typing import Any, Optional, Union

from jose import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .config import settings
from ..database.database import get_db
from ..models.user import User as UserModel

# Configuración para el hash de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuración para el token OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica si una contraseña en texto plano coincide con el hash almacenado.
    
    Args:
        plain_password: La contraseña en texto plano
        hashed_password: El hash almacenado de la contraseña
        
    Returns:
        bool: True si la contraseña coincide, False en caso contrario
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Genera un hash seguro para una contraseña.
    
    Args:
        password: La contraseña en texto plano
        
    Returns:
        str: El hash de la contraseña
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Crea un token JWT de acceso.
    
    Args:
        data: Datos a incluir en el token
        expires_delta: Tiempo hasta que expire el token
        
    Returns:
        str: El token JWT generado
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm="HS256"
    )
    return encoded_jwt


def authenticate_user(db: Session, username: str, password: str) -> Union[UserModel, bool]:
    """
    Autentica un usuario verificando su nombre de usuario y contraseña.
    
    Args:
        db: Sesión de base de datos
        username: Nombre de usuario o email
        password: Contraseña en texto plano
        
    Returns:
        Union[User, bool]: Objeto de usuario si la autenticación es exitosa, False en caso contrario
    """
    # Buscar usuario por email o nombre de usuario
    user = db.query(UserModel).filter(
        (UserModel.email == username) | (UserModel.username == username)
    ).first()
    
    if not user:
        return False
    
    if not verify_password(password, user.hashed_password):
        return False
    
    return user


async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> UserModel:
    """
    Obtiene el usuario actual a partir del token JWT.
    
    Args:
        db: Sesión de base de datos
        token: Token JWT de autenticación
        
    Returns:
        User: El objeto de usuario autenticado
        
    Raises:
        HTTPException: Si el token es inválido o el usuario no existe
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=["HS256"]
        )
        username_or_email: str = payload.get("sub")
        if username_or_email is None:
            raise credentials_exception
    except jwt.JWTError:
        raise credentials_exception
    
    user = db.query(UserModel).filter(
        (UserModel.email == username_or_email) | (UserModel.username == username_or_email)
    ).first()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    
    return user


async def get_current_active_user(
    current_user: UserModel = Depends(get_current_user),
) -> UserModel:
    """
    Obtiene el usuario actual y verifica que esté activo.
    
    Args:
        current_user: Usuario actual
        
    Returns:
        User: El usuario actual si está activo
        
    Raises:
        HTTPException: Si el usuario no está activo
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    return current_user


async def get_current_active_admin(
    current_user: UserModel = Depends(get_current_user),
) -> UserModel:
    """
    Obtiene el usuario actual y verifica que sea administrador.
    
    Args:
        current_user: Usuario actual
        
    Returns:
        User: El usuario actual si es administrador
        
    Raises:
        HTTPException: Si el usuario no es administrador
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes suficientes permisos"
        )
    return current_user