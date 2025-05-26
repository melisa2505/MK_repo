"""
Rutas para autenticación de usuarios.
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database.database import get_db
from ..core.security import authenticate_user, create_access_token
from ..core.config import settings
from ..schemas.token import Token
from ..schemas.user import User, UserCreate
from ..models.user import User as UserModel

router = APIRouter()


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Obtiene un token de acceso JWT para autenticar futuras solicitudes.
    
    - **username**: Nombre de usuario o email
    - **password**: Contraseña
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Registra un nuevo usuario en el sistema.
    
    - **email**: Email del usuario
    - **username**: Nombre de usuario
    - **password**: Contraseña
    - **password_confirm**: Confirmación de contraseña
    """
    # Verificar si el email ya está registrado
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Verificar si el nombre de usuario ya está registrado
    db_user = db.query(UserModel).filter(UserModel.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está registrado"
        )
    
    # Crear el nuevo usuario
    from ..core.security import get_password_hash
    
    db_user = UserModel(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        phone_number=user.phone_number,
        hashed_password=get_password_hash(user.password)
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/logout")
async def logout():
    """
    Cierra la sesión del usuario actual.
    
    En un sistema basado en JWT, esta función podría:
    1. Añadir el token a una lista negra
    2. Limpiar cookies si se están utilizando
    """
    return {"message": "Sesión cerrada correctamente"}