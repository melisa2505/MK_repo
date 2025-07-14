"""
Tests for Payment CRUD operations
"""
import pytest
from sqlalchemy.orm import Session

from app.models.payment import Payment, PaymentType
from app.crud import payment as crud_payment
from app.crud import request as crud_request
from app.schemas.request import RequestCreate
from app.schemas.payment import PaymentCreate


class TestPaymentCrud:
    """Test class for Payment CRUD operations"""

    def test_create_payment(self, db: Session):
        """Test creating a payment"""
        # Create a request to associate with the payment
        request_data = RequestCreate(
            tool_id=1,
            owner_id=2,
            consumer_id=3,
            start_date="2025-07-20",
            end_date="2025-07-23",
            total_amount=75.0
        )
        request = crud_request.create_request(db, request_data)
        
        # Create payment data
        request_id = request.id
        amount = 75.0
        payment_type = PaymentType.PAYMENT
        
        # Create payment
        payment = crud_payment.create_payment(db, request_id, amount, payment_type)
        
        # Assertions
        assert payment.id is not None
        assert payment.request_id == request_id
        assert payment.amount == amount
        assert payment.type == payment_type
        assert payment.status == "pending"  # Initial status
        assert payment.timestamp is not None

    def test_create_refund_payment(self, db: Session):
        """Test creating a refund payment"""
        # Create a request to associate with the payment
        request_data = RequestCreate(
            tool_id=1,
            owner_id=2,
            consumer_id=3,
            start_date="2025-07-20",
            end_date="2025-07-23",
            total_amount=75.0
        )
        request = crud_request.create_request(db, request_data)
        
        # Create refund payment
        request_id = request.id
        amount = 75.0
        payment_type = PaymentType.REFUND
        
        payment = crud_payment.create_payment(db, request_id, amount, payment_type)
        
        # Assertions
        assert payment.id is not None
        assert payment.request_id == request_id
        assert payment.amount == amount
        assert payment.type == payment_type
        assert payment.status == "pending"

    def test_get_payments_by_request(self, db: Session):
        """Test retrieving payments for a specific request"""
        # Create a request
        request_data = RequestCreate(
            tool_id=1,
            owner_id=2,
            consumer_id=3,
            start_date="2025-07-20",
            end_date="2025-07-23",
            total_amount=75.0
        )
        request = crud_request.create_request(db, request_data)
        request_id = request.id
        
        # Create multiple payments for this request
        payment1 = crud_payment.create_payment(
            db, request_id, 50.0, PaymentType.PAYMENT
        )
        payment2 = crud_payment.create_payment(
            db, request_id, 25.0, PaymentType.PAYMENT
        )
        
        # Create a payment for a different request
        other_request_data = RequestCreate(
            tool_id=4,
            owner_id=5,
            consumer_id=6,
            start_date="2025-07-20",
            end_date="2025-07-23",
            total_amount=100.0
        )
        other_request = crud_request.create_request(db, other_request_data)
        other_payment = crud_payment.create_payment(
            db, other_request.id, 100.0, PaymentType.PAYMENT
        )
        
        # Get payments for our request
        payments = crud_payment.get_payments_by_request(db, request_id)
        
        # Assertions
        assert len(payments) >= 2  # At least the two we created
        
        # All payments should belong to our request
        for payment in payments:
            assert payment.request_id == request_id
        
        # Check that our payments are in the results
        payment_ids = [p.id for p in payments]
        assert payment1.id in payment_ids
        assert payment2.id in payment_ids
        
        # Check that the other payment is not in the results
        assert other_payment.id not in payment_ids
        
        # Verify the order (should be by timestamp)
        for i in range(1, len(payments)):
            assert payments[i-1].timestamp <= payments[i].timestamp

    def test_update_payment_status(self, db: Session):
        """Test updating the status of a payment"""
        # Create a request and a payment
        request_data = RequestCreate(
            tool_id=1,
            owner_id=2,
            consumer_id=3,
            start_date="2025-07-20",
            end_date="2025-07-23",
            total_amount=75.0
        )
        request = crud_request.create_request(db, request_data)
        
        payment = crud_payment.create_payment(
            db, request.id, 75.0, PaymentType.PAYMENT
        )
        
        # Initial status should be "pending"
        assert payment.status == "pending"
        
        # Update the status
        new_status = "completed"
        updated_payment = crud_payment.update_payment_status(db, payment.id, new_status)
        
        # Assertions
        assert updated_payment is not None
        assert updated_payment.id == payment.id
        assert updated_payment.status == new_status