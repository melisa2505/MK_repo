"""
CRUD operations para categorías
"""
from typing import List, Optional

from sqlalchemy.orm import Session

from ..models.category import Category
from ..schemas.category import CategoryCreate, CategoryUpdate


def get_categories(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
    """
    Obtener todas las categorías
    """
    return db.query(Category).offset(skip).limit(limit).all()


def get_category(db: Session, category_id: int) -> Optional[Category]:
    """
    Obtener una categoría por su ID
    """
    return db.query(Category).filter(Category.id == category_id).first()


def get_category_by_name(db: Session, name: str) -> Optional[Category]:
    """
    Obtener una categoría por su nombre
    """
    return db.query(Category).filter(Category.name == name).first()


def create_category(db: Session, category: CategoryCreate) -> Category:
    """
    Crear una nueva categoría
    """
    db_category = Category(
        name=category.name,
        description=category.description
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, category_update: CategoryUpdate) -> Optional[Category]:
    """
    Actualizar una categoría
    """
    db_category = get_category(db, category_id)
    if db_category:
        update_data = category_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_category, field, value)
        
        db.commit()
        db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int) -> bool:
    """
    Eliminar una categoría
    """
    db_category = get_category(db, category_id)
    if db_category:
        db.delete(db_category)
        db.commit()
        return True
    return False