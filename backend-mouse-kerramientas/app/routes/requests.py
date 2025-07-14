"""
Routes for handling tool rental requests.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud import request as crud_request
from ..crud import notification as crud_notification
from ..crud import user as crud_user
from ..database.database import get_db
from ..dependencies import get_current_active_user
from ..models.user import User
from ..schemas.request import Request, RequestCreate, RequestUpdate, RequestDetail

router = APIRouter()

# "Mis solicitudes" (I rent from others)
@router.get("/mis-solicitudes/{user_id}", response_model=List[Request])
async def get_my_requests(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all requests made by the current user (consumer).
    """
    if current_user.id != user_id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these requests"
        )
    
    return crud_request.get_requests_by_consumer(db, user_id)


@router.get("/mis-solicitudes/{request_id}/detail", response_model=RequestDetail)
async def get_my_request_detail(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get details of a specific request made by the current user.
    """
    request = crud_request.get_request(db, request_id)
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    if request.consumer_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this request"
        )
    
    return request


@router.post("/mis-solicitudes/{request_id}/cancelar", response_model=Request)
async def cancel_my_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cancel a request made by the current user.
    """
    request = crud_request.get_request(db, request_id)
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    if request.consumer_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this request"
        )
    
    if request.status not in ["pending", "confirmed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel request in '{request.status}' status"
        )
    
    updated_request = crud_request.cancel_request(db, request_id)
    
    # Create notification for the tool owner
    crud_notification.create_notification(
        db=db,
        user_id=request.owner_id,
        notification_type="request_canceled",
        content=f"La solicitud para tu herramienta ha sido cancelada por {current_user.username}"
    )
    
    return updated_request


@router.post("/mis-solicitudes/{request_id}/pagar", response_model=Request)
async def pay_request(
    request_id: int,
    yape_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Pay for a request made by the current user.
    """
    request = crud_request.get_request(db, request_id)
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    if request.consumer_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to pay for this request"
        )
    
    if request.status != "confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot pay for request in '{request.status}' status"
        )
    
    updated_request = crud_request.pay_request(db, request_id, yape_code)
    
    # Create notification for the tool owner
    crud_notification.create_notification(
        db=db,
        user_id=request.owner_id,
        notification_type="request_paid",
        content=f"{current_user.username} ha realizado el pago para la solicitud de tu herramienta"
    )
    
    return updated_request


@router.post("/mis-solicitudes/{request_id}/confirmar-recepcion", response_model=Request)
async def confirm_reception(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Confirm that the tool has been received by the consumer.
    """
    request = crud_request.get_request(db, request_id)
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    if request.consumer_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to confirm reception for this request"
        )
    
    if request.status != "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot confirm reception for request in '{request.status}' status"
        )
    
    updated_request = crud_request.confirm_delivery(db, request_id)
    
    # Create notification for the tool owner
    crud_notification.create_notification(
        db=db,
        user_id=request.owner_id,
        notification_type="tool_received",
        content=f"{current_user.username} ha confirmado la recepción de tu herramienta"
    )
    
    return updated_request


# "Sus solicitudes" (Others rent from me)
@router.get("/sus-solicitudes/{user_id}", response_model=List[Request])
async def get_owner_requests(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all requests for tools owned by the current user.
    """
    if current_user.id != user_id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these requests"
        )
    
    return crud_request.get_requests_by_owner(db, user_id)


@router.get("/sus-solicitudes/{request_id}/detail", response_model=RequestDetail)
async def get_owner_request_detail(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get details of a specific request for a tool owned by the current user.
    """
    request = crud_request.get_request(db, request_id)
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    if request.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this request"
        )
    
    return request


@router.post("/sus-solicitudes/{request_id}/confirmar", response_model=Request)
async def confirm_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Confirm a request for a tool owned by the current user.
    """
    request = crud_request.get_request(db, request_id)
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    if request.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to confirm this request"
        )
    
    updated_request = crud_request.update_request_status(db, request_id, "confirmed")
    
    # Create notification for the consumer
    crud_notification.create_notification(
        db=db,
        user_id=request.consumer_id,
        notification_type="request_confirmed",
        content=f"Tu solicitud de herramienta ha sido confirmada por {current_user.username}"
    )
    
    return updated_request


@router.post("/sus-solicitudes/{request_id}/rechazar", response_model=Request)
async def reject_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Reject a request for a tool owned by the current user.
    """
    request = crud_request.get_request(db, request_id)
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    if request.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to reject this request"
        )
    
    if request.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject request in '{request.status}' status"
        )
    
    updated_request = crud_request.reject_request(db, request_id)
    
    # Create notification for the consumer
    crud_notification.create_notification(
        db=db,
        user_id=request.consumer_id,
        notification_type="request_rejected",
        content=f"Tu solicitud de herramienta ha sido rechazada por {current_user.username}"
    )
    
    return updated_request


@router.post("/sus-solicitudes/{request_id}/confirmar-devolucion", response_model=Request)
async def confirm_return_by_owner(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Confirm that the owner has received the returned tool.
    """
    request = crud_request.get_request(db, request_id)
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    if request.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to confirm return reception for this request"
        )
    
    if request.status != "delivered":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot confirm return reception for request in '{request.status}' status"
        )
    
    updated_request = crud_request.confirm_reception(db, request_id)
    
    # Create notification for the consumer
    crud_notification.create_notification(
        db=db,
        user_id=request.consumer_id,
        notification_type="return_confirmed",
        content=f"{current_user.username} ha confirmado la recepción de la herramienta devuelta"
    )
    
    return updated_request