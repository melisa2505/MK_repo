"""
Routes for handling user notifications.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..crud import notification as crud_notification
from ..database.database import get_db
from ..dependencies import get_current_active_user
from ..models.user import User
from ..models.notification import Notification as NotificationModel
from ..schemas.notification import Notification

router = APIRouter()

@router.get("/", 
    response_model=List[Notification],
    summary="Obtener notificaciones del usuario actual",
    description="Obtiene todas las notificaciones del usuario autenticado con opciones de paginación"
)
async def get_current_user_notifications(
    skip: int = Query(0, ge=0, description="Número de registros a saltar para paginación"),
    limit: int = Query(100, ge=1, le=100, description="Número máximo de registros a devolver"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud_notification.get_notifications(db, current_user.id, skip, limit)


@router.get("/{user_id}", 
    response_model=List[Notification],
    summary="Obtener notificaciones de un usuario específico",
    description="Obtiene todas las notificaciones de un usuario específico (solo para el propio usuario o superusuarios)"
)
async def get_user_notifications(
    user_id: int,
    skip: int = Query(0, ge=0, description="Número de registros a saltar para paginación"),
    limit: int = Query(100, ge=1, le=100, description="Número máximo de registros a devolver"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.id != user_id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado para ver estas notificaciones"
        )
    
    return crud_notification.get_notifications(db, user_id, skip, limit)


@router.post("/{notification_id}/mark-read", 
    response_model=Notification,
    summary="Marcar notificación como leída",
    description="Marca una notificación específica como leída"
)
async def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    notification = db.query(NotificationModel).filter(NotificationModel.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificación no encontrada"
        )
    
    if notification.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado para modificar esta notificación"
        )
    
    return crud_notification.mark_as_read(db, notification_id)