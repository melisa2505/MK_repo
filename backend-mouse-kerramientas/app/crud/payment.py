"""
CRUD operations for payments
"""
from typing import List, Optional

from sqlalchemy.orm import Session

from ..models.payment import Payment, PaymentType
from ..schemas.payment import PaymentCreate


def create_payment(db: Session, request_id: int, amount: float, payment_type: PaymentType) -> Payment:
    """
    Create a new payment record
    """
    db_payment = Payment(
        request_id=request_id,
        amount=amount,
        type=payment_type,
        status="pending"  # Initial status is always pending
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


def get_payments_by_request(db: Session, request_id: int) -> List[Payment]:
    """
    Get all payments associated with a request
    """
    return db.query(Payment).filter(
        Payment.request_id == request_id
    ).order_by(Payment.timestamp).all()


def update_payment_status(db: Session, payment_id: int, new_status: str) -> Optional[Payment]:
    """
    Update the status of a payment
    """
    db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if db_payment:
        db_payment.status = new_status
        db.commit()
        db.refresh(db_payment)
    return db_payment