"""
Operaciones CRUD para calificaciones.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from ..models.rating import Rating
from ..models.user import User
from ..models.tool import Tool
from ..schemas.rating import RatingCreate, RatingUpdate


def get_rating(db: Session, rating_id: int) -> Optional[Rating]:
    """Obtiene una calificación por su ID."""
    return db.query(Rating).filter(Rating.id == rating_id).first()


def get_ratings_by_tool(db: Session, tool_id: int, skip: int = 0, limit: int = 100) -> List[Rating]:
    """Obtiene las calificaciones de una herramienta específica."""
    return db.query(Rating).filter(Rating.tool_id == tool_id).offset(skip).limit(limit).all()


def get_ratings_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Rating]:
    """Obtiene las calificaciones realizadas por un usuario específico."""
    return db.query(Rating).filter(Rating.user_id == user_id).offset(skip).limit(limit).all()


def get_user_rating_for_tool(db: Session, user_id: int, tool_id: int) -> Optional[Rating]:
    """Obtiene la calificación de un usuario para una herramienta específica."""
    return db.query(Rating).filter(
        and_(Rating.user_id == user_id, Rating.tool_id == tool_id)
    ).first()


def create_rating(db: Session, rating: RatingCreate, user_id: int) -> Rating:
    """Crea una nueva calificación."""
    db_rating = Rating(
        tool_id=rating.tool_id,
        user_id=user_id,
        rating=rating.rating,
        comment=rating.comment
    )
    db.add(db_rating)
    db.commit()
    db.refresh(db_rating)
    return db_rating


def update_rating(db: Session, rating_id: int, rating_update: RatingUpdate) -> Optional[Rating]:
    """Actualiza una calificación existente."""
    db_rating = db.query(Rating).filter(Rating.id == rating_id).first()
    if not db_rating:
        return None
    
    update_data = rating_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_rating, key, value)
    
    db.commit()
    db.refresh(db_rating)
    return db_rating


def delete_rating(db: Session, rating_id: int) -> bool:
    """Elimina una calificación."""
    db_rating = db.query(Rating).filter(Rating.id == rating_id).first()
    if not db_rating:
        return False
    
    db.delete(db_rating)
    db.commit()
    return True


def get_tool_rating_stats(db: Session, tool_id: int) -> dict:
    """Obtiene estadísticas de calificación para una herramienta."""
    ratings = db.query(Rating.rating).filter(Rating.tool_id == tool_id).all()
    
    if not ratings:
        return {
            "total_ratings": 0,
            "average_rating": 0.0,
            "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }
    
    rating_values = [r.rating for r in ratings]
    total_ratings = len(rating_values)
    average_rating = sum(rating_values) / total_ratings
    
    rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for rating in rating_values:
        rating_distribution[int(rating)] += 1
    
    return {
        "total_ratings": total_ratings,
        "average_rating": round(average_rating, 2),
        "rating_distribution": rating_distribution
    }
