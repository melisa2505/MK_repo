"""
Rutas para la gestión de usuarios.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.database import get_db
from ..models.user import User as UserModel
from ..schemas.user import User, UserCreate, UserUpdate

router = APIRouter()


@router.get("/", response_model=List[User])
def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de usuarios.
    
    - **skip**: Número de registros para saltar (paginación)
    - **limit**: Número máximo de registros a devolver
    """
    # En una aplicación real, este endpoint debería estar protegido
    # y solo accesible para administradores
    users = db.query(UserModel).offset(skip).limit(limit).all()
    return users


@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo usuario.
    
    - **user**: Datos del usuario a crear
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

    # En una implementación real, hashearíamos la contraseña aquí
    # hashed_password = get_password_hash(user.password)
    
    # Para este ejemplo, simplemente usamos la contraseña como está (¡NO HACER ESTO EN PRODUCCIÓN!)
    db_user = UserModel(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        phone_number=user.phone_number,
        hashed_password=user.password  # En producción: hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/me", response_model=User)
def read_user_me():
    """
    Obtiene información del usuario actualmente autenticado.
    
    En una implementación real, este endpoint utilizaría
    un dependencia para obtener el usuario actual del token.
    """
    # Implementación ficticia - en una app real obtendrías el usuario actual del token
    return {
        "id": 1,
        "email": "usuario@ejemplo.com",
        "username": "usuario_ejemplo",
        "full_name": "Usuario Ejemplo",
        "phone_number": "+52 55 1234 5678",
        "is_active": True,
        "is_admin": False,
        "created_at": "2025-01-01T00:00:00"
    }


@router.get("/{user_id}", response_model=User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un usuario por su ID.
    
    - **user_id**: ID del usuario a obtener
    """
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return db_user


@router.put("/{user_id}", response_model=User)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualiza un usuario existente.
    
    - **user_id**: ID del usuario a actualizar
    - **user_update**: Datos a actualizar en el usuario
    """
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Actualiza solo los campos que no son None en el request
    update_data = user_update.dict(exclude_unset=True)
    
    # Verificar si el email ya está en uso por otro usuario
    if "email" in update_data and update_data["email"] != db_user.email:
        existing_user = db.query(UserModel).filter(UserModel.email == update_data["email"]).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
    
    # Verificar si el nombre de usuario ya está en uso por otro usuario
    if "username" in update_data and update_data["username"] != db_user.username:
        existing_user = db.query(UserModel).filter(UserModel.username == update_data["username"]).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de usuario ya está registrado"
            )
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user