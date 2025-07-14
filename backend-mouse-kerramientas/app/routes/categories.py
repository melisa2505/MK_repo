"""
Rutas para la gestión de categorías de herramientas.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud import category as crud_category
from ..database.database import get_db
from ..schemas.category import Category, CategoryCreate

router = APIRouter()


@router.get("/", response_model=List[Category])
def get_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las categorías de herramientas.
    
    - **skip**: Número de registros para saltar (paginación)
    - **limit**: Número máximo de registros a devolver
    """
    categories = crud_category.get_categories(db, skip=skip, limit=limit)
    return categories


@router.get("/{category_id}", response_model=Category)
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene una categoría por su ID.
    
    - **category_id**: ID de la categoría a obtener
    """
    db_category = crud_category.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada"
        )
    return db_category