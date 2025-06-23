"""
Rutas para la gestión de alquileres.
"""
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud import rental as crud_rental
from ..database.database import get_db
from ..dependencies import get_current_user, get_current_admin_user
from ..models.user import User
from ..models.tool import Tool
from ..schemas.rental import Rental, RentalCreate, RentalUpdate, RentalReturn, RentalWithDetails, RentalStats

router = APIRouter()


@router.post("/", response_model=Rental, status_code=status.HTTP_201_CREATED)
def create_rental(
    rental: RentalCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Crea un nuevo alquiler de herramienta.
    """
    tool = db.query(Tool).filter(Tool.id == rental.tool_id).first()
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Herramienta no encontrada"
        )
    
    if not tool.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La herramienta no está disponible"
        )
    
    existing_rental = crud_rental.get_active_rental_for_tool(db, tool_id=rental.tool_id)
    if existing_rental:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La herramienta ya está alquilada"
        )
    
    return crud_rental.create_rental(db=db, rental=rental, user_id=current_user.id)


@router.get("/user/me", response_model=List[RentalWithDetails])
def get_my_rentals(
    skip: int = 0,
    limit: int = 100,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Obtiene los alquileres del usuario actual.
    """
    rentals = crud_rental.get_rentals_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
    
    rentals_with_details = []
    for rental in rentals:
        rental_dict = {
            "id": rental.id,
            "tool_id": rental.tool_id,
            "user_id": rental.user_id,
            "start_date": rental.start_date,
            "end_date": rental.end_date,
            "actual_return_date": rental.actual_return_date,
            "total_price": rental.total_price,
            "status": rental.status,
            "notes": rental.notes,
            "created_at": rental.created_at,
            "updated_at": rental.updated_at,
            "tool_name": rental.tool.name,
            "tool_brand": rental.tool.brand,
            "tool_model": rental.tool.model,
            "tool_daily_price": rental.tool.daily_price,
            "user_username": rental.user.username,
            "user_full_name": rental.user.full_name
        }
        rentals_with_details.append(rental_dict)
    
    return rentals_with_details


@router.get("/user/me/active", response_model=List[RentalWithDetails])
def get_my_active_rentals(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Obtiene los alquileres activos del usuario actual.
    """
    rentals = crud_rental.get_user_active_rentals(db, user_id=current_user.id)
    
    rentals_with_details = []
    for rental in rentals:
        rental_dict = {
            "id": rental.id,
            "tool_id": rental.tool_id,
            "user_id": rental.user_id,
            "start_date": rental.start_date,
            "end_date": rental.end_date,
            "actual_return_date": rental.actual_return_date,
            "total_price": rental.total_price,
            "status": rental.status,
            "notes": rental.notes,
            "created_at": rental.created_at,
            "updated_at": rental.updated_at,
            "tool_name": rental.tool.name,
            "tool_brand": rental.tool.brand,
            "tool_model": rental.tool.model,
            "tool_daily_price": rental.tool.daily_price,
            "user_username": rental.user.username,
            "user_full_name": rental.user.full_name
        }
        rentals_with_details.append(rental_dict)
    
    return rentals_with_details


@router.put("/{rental_id}/activate", response_model=Rental)
def activate_rental(
    rental_id: int,
    current_admin: Annotated[User, Depends(get_current_admin_user)],
    db: Session = Depends(get_db)
):
    """
    Activa un alquiler (marca como entregado).
    """
    rental = crud_rental.get_rental(db, rental_id=rental_id)
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alquiler no encontrado"
        )
    
    updated_rental = crud_rental.activate_rental(db, rental_id=rental_id)
    return updated_rental


@router.put("/{rental_id}/return", response_model=Rental)
def return_rental(
    rental_id: int,
    return_data: RentalReturn,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Procesa la devolución de una herramienta.
    """
    rental = crud_rental.get_rental(db, rental_id=rental_id)
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alquiler no encontrado"
        )
    
    if rental.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para devolver esta herramienta"
        )
    
    updated_rental = crud_rental.return_rental(db, rental_id=rental_id, return_data=return_data)
    return updated_rental


@router.put("/{rental_id}/cancel", response_model=Rental)
def cancel_rental(
    rental_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Cancela un alquiler.
    """
    rental = crud_rental.get_rental(db, rental_id=rental_id)
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alquiler no encontrado"
        )
    
    if rental.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para cancelar esta herramienta"
        )
    
    updated_rental = crud_rental.cancel_rental(db, rental_id=rental_id)
    return updated_rental


@router.get("/{rental_id}", response_model=RentalWithDetails)
def get_rental(
    rental_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Obtiene un alquiler específico.
    """
    rental = crud_rental.get_rental(db, rental_id=rental_id)
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alquiler no encontrado"
        )
    
    if rental.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver este alquiler"
        )
    
    rental_dict = {
        "id": rental.id,
        "tool_id": rental.tool_id,
        "user_id": rental.user_id,
        "start_date": rental.start_date,
        "end_date": rental.end_date,
        "actual_return_date": rental.actual_return_date,
        "total_price": rental.total_price,
        "status": rental.status,
        "notes": rental.notes,
        "created_at": rental.created_at,
        "updated_at": rental.updated_at,
        "tool_name": rental.tool.name,
        "tool_brand": rental.tool.brand,
        "tool_model": rental.tool.model,
        "tool_daily_price": rental.tool.daily_price,
        "user_username": rental.user.username,
        "user_full_name": rental.user.full_name
    }
    
    return rental_dict


@router.get("/stats/general", response_model=RentalStats)
def get_rental_stats(
    current_admin: Annotated[User, Depends(get_current_admin_user)],
    db: Session = Depends(get_db)
):
    """
    Obtiene estadísticas generales de alquileres.
    """
    stats = crud_rental.get_rental_stats(db)
    return stats


@router.post("/check-overdue")
def check_overdue_rentals(
    current_admin: Annotated[User, Depends(get_current_admin_user)],
    db: Session = Depends(get_db)
):
    """
    Verifica y marca como vencidos los alquileres que superaron la fecha de devolución.
    """
    overdue_count = crud_rental.check_overdue_rentals(db)
    return {"message": f"Se marcaron {overdue_count} alquileres como vencidos"}
