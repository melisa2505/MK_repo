"""
CRUD operations for tool rental requests
"""
from typing import List, Optional

from sqlalchemy.orm import Session

from ..models.request import Request
from ..schemas.request import RequestCreate, RequestUpdate


def create_request(db: Session, request_data: RequestCreate) -> Request:
    """
    Create a new tool rental request
    """
    db_request = Request(
        tool_id=request_data.tool_id,
        owner_id=request_data.owner_id,
        consumer_id=request_data.consumer_id,
        start_date=request_data.start_date,
        end_date=request_data.end_date,
        total_amount=request_data.total_amount,
        status="pending"  # Initial status is always pending
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request


def get_request(db: Session, request_id: int) -> Optional[Request]:
    """
    Get request by ID
    """
    return db.query(Request).filter(Request.id == request_id).first()


def get_requests_by_consumer(db: Session, user_id: int) -> List[Request]:
    """
    Get all requests made by a consumer
    """
    return db.query(Request).filter(Request.consumer_id == user_id).all()


def get_requests_by_owner(db: Session, user_id: int) -> List[Request]:
    """
    Get all requests for tools owned by a user
    """
    return db.query(Request).filter(Request.owner_id == user_id).all()


def update_request_status(db: Session, request_id: int, new_status: str) -> Optional[Request]:
    """
    Update the status of a request
    """
    db_request = get_request(db, request_id)
    if db_request:
        db_request.status = new_status
        db.commit()
        db.refresh(db_request)
    return db_request


def cancel_request(db: Session, request_id: int) -> Optional[Request]:
    """
    Cancel a request
    """
    return update_request_status(db, request_id, "cancelled")


def confirm_delivery(db: Session, request_id: int) -> Optional[Request]:
    """
    Confirm that the tool has been delivered to the consumer
    """
    return update_request_status(db, request_id, "delivered")


def confirm_return(db: Session, request_id: int) -> Optional[Request]:
    """
    Confirm that the tool has been returned to the owner
    """
    return update_request_status(db, request_id, "returned")


def confirm_reception(db: Session, request_id: int) -> Optional[Request]:
    """
    Confirm that the owner has received the returned tool
    """
    return update_request_status(db, request_id, "completed")


def reject_request(db: Session, request_id: int) -> Optional[Request]:
    """
    Reject a request
    """
    return update_request_status(db, request_id, "rejected")


def pay_request(db: Session, request_id: int, yape_code: str) -> Optional[Request]:
    """
    Add payment information to a request
    """
    db_request = get_request(db, request_id)
    if db_request:
        db_request.yape_approval_code = yape_code
        db_request.status = "confirmed"  # Update status to confirmed after payment
        db.commit()
        db.refresh(db_request)
    return db_request