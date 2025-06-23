"""
Operaciones CRUD para alquileres.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime, timedelta

from ..models.rental import Rental, RentalStatus
from ..models.tool import Tool
from ..models.user import User
from ..schemas.rental import RentalCreate, RentalUpdate, RentalReturn


def get_rental(db: Session, rental_id: int) -> Optional[Rental]:
    """Obtiene un alquiler por su ID."""
    return db.query(Rental).filter(Rental.id == rental_id).first()


def get_rentals_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Rental]:
    """Obtiene los alquileres de un usuario específico."""
    return db.query(Rental).filter(Rental.user_id == user_id).offset(skip).limit(limit).all()


def get_rentals_by_tool(db: Session, tool_id: int, skip: int = 0, limit: int = 100) -> List[Rental]:
    """Obtiene los alquileres de una herramienta específica."""
    return db.query(Rental).filter(Rental.tool_id == tool_id).offset(skip).limit(limit).all()


def get_active_rental_for_tool(db: Session, tool_id: int) -> Optional[Rental]:
    """Obtiene el alquiler activo de una herramienta."""
    return db.query(Rental).filter(
        and_(
            Rental.tool_id == tool_id,
            Rental.status.in_([RentalStatus.PENDING, RentalStatus.ACTIVE])
        )
    ).first()


def get_user_active_rentals(db: Session, user_id: int) -> List[Rental]:
    """Obtiene todos los alquileres activos de un usuario."""
    return db.query(Rental).filter(
        and_(
            Rental.user_id == user_id,
            Rental.status.in_([RentalStatus.PENDING, RentalStatus.ACTIVE])
        )
    ).all()


def create_rental(db: Session, rental: RentalCreate, user_id: int) -> Rental:
    """Crea un nuevo alquiler."""
    tool = db.query(Tool).filter(Tool.id == rental.tool_id).first()
    
    days = (rental.end_date.date() - rental.start_date.date()).days + 1
    total_price = days * tool.daily_price
    
    db_rental = Rental(
        tool_id=rental.tool_id,
        user_id=user_id,
        start_date=rental.start_date,
        end_date=rental.end_date,
        total_price=total_price,
        notes=rental.notes,
        status=RentalStatus.PENDING
    )
    
    tool.is_available = False
    
    db.add(db_rental)
    db.commit()
    db.refresh(db_rental)
    return db_rental


def update_rental(db: Session, rental_id: int, rental_update: RentalUpdate) -> Optional[Rental]:
    """Actualiza un alquiler existente."""
    db_rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not db_rental:
        return None
    
    update_data = rental_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_rental, key, value)
    
    if rental_update.end_date and db_rental.tool:
        days = (rental_update.end_date.date() - db_rental.start_date.date()).days + 1
        db_rental.total_price = days * db_rental.tool.daily_price
    
    db.commit()
    db.refresh(db_rental)
    return db_rental


def return_rental(db: Session, rental_id: int, return_data: RentalReturn) -> Optional[Rental]:
    """Procesa la devolución de una herramienta."""
    db_rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not db_rental:
        return None
    
    db_rental.actual_return_date = return_data.actual_return_date
    db_rental.status = RentalStatus.RETURNED
    if return_data.notes:
        db_rental.notes = return_data.notes
    
    db_rental.tool.is_available = True
    
    db.commit()
    db.refresh(db_rental)
    return db_rental


def activate_rental(db: Session, rental_id: int) -> Optional[Rental]:
    """Activa un alquiler (marca como entregado)."""
    db_rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not db_rental:
        return None
    
    db_rental.status = RentalStatus.ACTIVE
    
    db.commit()
    db.refresh(db_rental)
    return db_rental


def cancel_rental(db: Session, rental_id: int) -> Optional[Rental]:
    """Cancela un alquiler."""
    db_rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not db_rental:
        return None
    
    db_rental.status = RentalStatus.CANCELLED
    db_rental.tool.is_available = True
    
    db.commit()
    db.refresh(db_rental)
    return db_rental


def check_overdue_rentals(db: Session):
    """Marca como vencidos los alquileres que superaron la fecha de devolución."""
    current_date = datetime.utcnow()
    overdue_rentals = db.query(Rental).filter(
        and_(
            Rental.status == RentalStatus.ACTIVE,
            Rental.end_date < current_date
        )
    ).all()
    
    for rental in overdue_rentals:
        rental.status = RentalStatus.OVERDUE
    
    db.commit()
    return len(overdue_rentals)


def get_rental_stats(db: Session) -> dict:
    """Obtiene estadísticas generales de alquileres."""
    total_rentals = db.query(Rental).count()
    active_rentals = db.query(Rental).filter(Rental.status == RentalStatus.ACTIVE).count()
    overdue_rentals = db.query(Rental).filter(Rental.status == RentalStatus.OVERDUE).count()
    completed_rentals = db.query(Rental).filter(Rental.status == RentalStatus.RETURNED).count()
    
    total_revenue = db.query(func.sum(Rental.total_price)).filter(
        Rental.status.in_([RentalStatus.RETURNED, RentalStatus.ACTIVE])
    ).scalar() or 0.0
    
    return {
        "total_rentals": total_rentals,
        "active_rentals": active_rentals,
        "overdue_rentals": overdue_rentals,
        "completed_rentals": completed_rentals,
        "total_revenue": float(total_revenue)
    }
