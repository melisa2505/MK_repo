"""
Rutas para la gestión de calificaciones.
"""
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud import rating as crud_rating
from ..database.database import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..schemas.rating import Rating, RatingCreate, RatingUpdate, RatingWithUser, RatingStats

router = APIRouter()


@router.get("/tool/{tool_id}", response_model=List[RatingWithUser])
def get_tool_ratings(
    tool_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Obtiene las calificaciones de una herramienta específica.
    """
    ratings = crud_rating.get_ratings_by_tool(db, tool_id=tool_id, skip=skip, limit=limit)
    
    ratings_with_user = []
    for rating in ratings:
        rating_dict = {
            "id": rating.id,
            "tool_id": rating.tool_id,
            "user_id": rating.user_id,
            "rating": rating.rating,
            "comment": rating.comment,
            "created_at": rating.created_at,
            "updated_at": rating.updated_at,
            "user_username": rating.user.username,
            "user_full_name": rating.user.full_name
        }
        ratings_with_user.append(rating_dict)
    
    return ratings_with_user


@router.get("/tool/{tool_id}/stats", response_model=RatingStats)
def get_tool_rating_stats(tool_id: int, db: Session = Depends(get_db)):
    """
    Obtiene estadísticas de calificación para una herramienta.
    """
    stats = crud_rating.get_tool_rating_stats(db, tool_id=tool_id)
    return stats


@router.post("/", response_model=Rating, status_code=status.HTTP_201_CREATED)
def create_rating(
    rating: RatingCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Crea una nueva calificación para una herramienta.
    """
    existing_rating = crud_rating.get_user_rating_for_tool(
        db, user_id=current_user.id, tool_id=rating.tool_id
    )
    
    if existing_rating:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya has calificado esta herramienta"
        )
    
    return crud_rating.create_rating(db=db, rating=rating, user_id=current_user.id)


@router.put("/{rating_id}", response_model=Rating)
def update_rating(
    rating_id: int,
    rating_update: RatingUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Actualiza una calificación existente.
    """
    db_rating = crud_rating.get_rating(db, rating_id=rating_id)
    if not db_rating:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calificación no encontrada"
        )
    
    if db_rating.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar esta calificación"
        )
    
    updated_rating = crud_rating.update_rating(db, rating_id=rating_id, rating_update=rating_update)
    return updated_rating


@router.delete("/{rating_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rating(
    rating_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Elimina una calificación.
    """
    db_rating = crud_rating.get_rating(db, rating_id=rating_id)
    if not db_rating:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calificación no encontrada"
        )
    
    if db_rating.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar esta calificación"
        )
    
    crud_rating.delete_rating(db, rating_id=rating_id)
    return None


@router.get("/user/me", response_model=List[Rating])
def get_my_ratings(
    skip: int = 0,
    limit: int = 100,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Obtiene las calificaciones realizadas por el usuario actual.
    """
    return crud_rating.get_ratings_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
