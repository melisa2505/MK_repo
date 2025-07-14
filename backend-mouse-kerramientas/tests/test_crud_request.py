"""
Tests for Request CRUD operations
"""
import pytest
from datetime import date, timedelta
from sqlalchemy.orm import Session

from app.crud import request as crud_request
from app.models.request import Request
from app.schemas.request import RequestCreate, RequestUpdate


class TestRequestCrud:
    """Test class for Request CRUD operations"""

    def test_create_request(self, db: Session):
        """Test creating a rental request"""
        # Create request data
        start_date = date.today() + timedelta(days=5)
        end_date = date.today() + timedelta(days=8)
        
        request_data = RequestCreate(
            tool_id=1,
            owner_id=2,
            consumer_id=3,
            start_date=start_date,
            end_date=end_date,
            total_amount=75.0
        )
        
        # Create the request
        request = crud_request.create_request(db, request_data)
        
        # Assertions
        assert request.id is not None
        assert request.tool_id == request_data.tool_id
        assert request.owner_id == request_data.owner_id
        assert request.consumer_id == request_data.consumer_id
        assert request.start_date == request_data.start_date
        assert request.end_date == request_data.end_date
        assert request.total_amount == request_data.total_amount
        assert request.status == "pending"  # Initial status
        assert request.created_at is not None

    def test_get_request(self, db: Session):
        """Test retrieving a request by ID"""
        # First create a request
        start_date = date.today() + timedelta(days=5)
        end_date = date.today() + timedelta(days=8)
        
        request_data = RequestCreate(
            tool_id=1,
            owner_id=2,
            consumer_id=3,
            start_date=start_date,
            end_date=end_date,
            total_amount=75.0
        )
        
        created_request = crud_request.create_request(db, request_data)
        
        # Get the request by ID
        retrieved_request = crud_request.get_request(db, created_request.id)
        
        # Assertions
        assert retrieved_request is not None
        assert retrieved_request.id == created_request.id
        assert retrieved_request.tool_id == request_data.tool_id
        assert retrieved_request.owner_id == request_data.owner_id
        assert retrieved_request.consumer_id == request_data.consumer_id
        assert retrieved_request.total_amount == request_data.total_amount

    def test_get_requests_by_consumer(self, db: Session):
        """Test retrieving all requests made by a consumer"""
        # Create some requests with the same consumer
        consumer_id = 99  # Unique ID to avoid conflicts
        
        # Create a couple of requests
        start_date = date.today() + timedelta(days=5)
        end_date = date.today() + timedelta(days=8)
        
        request_data1 = RequestCreate(
            tool_id=1,
            owner_id=2,
            consumer_id=consumer_id,
            start_date=start_date,
            end_date=end_date,
            total_amount=75.0
        )
        
        request_data2 = RequestCreate(
            tool_id=3,
            owner_id=4,
            consumer_id=consumer_id,
            start_date=start_date + timedelta(days=10),
            end_date=end_date + timedelta(days=10),
            total_amount=100.0
        )
        
        # Create a request for a different consumer
        request_data3 = RequestCreate(
            tool_id=5,
            owner_id=6,
            consumer_id=88,
            start_date=start_date,
            end_date=end_date,
            total_amount=50.0
        )
        
        # Create all requests
        request1 = crud_request.create_request(db, request_data1)
        request2 = crud_request.create_request(db, request_data2)
        crud_request.create_request(db, request_data3)
        
        # Get requests for our consumer
        consumer_requests = crud_request.get_requests_by_consumer(db, consumer_id)
        
        # Assertions
        assert len(consumer_requests) >= 2  # At least the two we created
        
        # All requests should belong to the specified consumer
        for request in consumer_requests:
            assert request.consumer_id == consumer_id
        
        # Check that our specific requests are in the results
        request_ids = [r.id for r in consumer_requests]
        assert request1.id in request_ids
        assert request2.id in request_ids

    def test_get_requests_by_owner(self, db: Session):
        """Test retrieving all requests for tools owned by a user"""
        # Create some requests with the same owner
        owner_id = 77  # Unique ID to avoid conflicts
        
        # Create a couple of requests
        start_date = date.today() + timedelta(days=5)
        end_date = date.today() + timedelta(days=8)
        
        request_data1 = RequestCreate(
            tool_id=1,
            owner_id=owner_id,
            consumer_id=2,
            start_date=start_date,
            end_date=end_date,
            total_amount=75.0
        )
        
        request_data2 = RequestCreate(
            tool_id=3,
            owner_id=owner_id,
            consumer_id=4,
            start_date=start_date + timedelta(days=10),
            end_date=end_date + timedelta(days=10),
            total_amount=100.0
        )
        
        # Create a request for a different owner
        request_data3 = RequestCreate(
            tool_id=5,
            owner_id=66,
            consumer_id=2,
            start_date=start_date,
            end_date=end_date,
            total_amount=50.0
        )
        
        # Create all requests
        request1 = crud_request.create_request(db, request_data1)
        request2 = crud_request.create_request(db, request_data2)
        crud_request.create_request(db, request_data3)
        
        # Get requests for our owner
        owner_requests = crud_request.get_requests_by_owner(db, owner_id)
        
        # Assertions
        assert len(owner_requests) >= 2  # At least the two we created
        
        # All requests should have tools belonging to the specified owner
        for request in owner_requests:
            assert request.owner_id == owner_id
        
        # Check that our specific requests are in the results
        request_ids = [r.id for r in owner_requests]
        assert request1.id in request_ids
        assert request2.id in request_ids

    def test_update_request_status(self, db: Session):
        """Test updating the status of a request"""
        # First create a request
        request_data = RequestCreate(
            tool_id=1,
            owner_id=2,
            consumer_id=3,
            start_date=date.today() + timedelta(days=5),
            end_date=date.today() + timedelta(days=8),
            total_amount=75.0
        )
        
        request = crud_request.create_request(db, request_data)
        
        # Initial status should be "pending"
        assert request.status == "pending"
        
        # Update the status
        new_status = "confirmed"
        updated_request = crud_request.update_request_status(db, request.id, new_status)
        
        # Assertions
        assert updated_request is not None
        assert updated_request.id == request.id
        assert updated_request.status == new_status

    def test_cancel_request(self, db: Session):
        """Test cancelling a request"""
        # Create a request
        request_data = RequestCreate(
            tool_id=1,
            owner_id=2,
            consumer_id=3,
            start_date=date.today() + timedelta(days=5),
            end_date=date.today() + timedelta(days=8),
            total_amount=75.0
        )
        
        request = crud_request.create_request(db, request_data)
        
        # Cancel the request
        cancelled_request = crud_request.cancel_request(db, request.id)
        
        # Assertions
        assert cancelled_request is not None
        assert cancelled_request.id == request.id
        assert cancelled_request.status == "cancelled"

    def test_confirm_delivery(self, db: Session):
        """Test confirming delivery of a tool"""
        # Create a request and update to confirmed status first
        request_data = RequestCreate(
            tool_id=1,
            owner_id=2,
            consumer_id=3,
            start_date=date.today() + timedelta(days=5),
            end_date=date.today() + timedelta(days=8),
            total_amount=75.0
        )
        
        request = crud_request.create_request(db, request_data)
        crud_request.update_request_status(db, request.id, "confirmed")
        
        # Confirm delivery
        delivered_request = crud_request.confirm_delivery(db, request.id)
        
        # Assertions
        assert delivered_request is not None
        assert delivered_request.id == request.id
        assert delivered_request.status == "delivered"

    def test_confirm_return(self, db: Session):
        """Test confirming return of a tool"""
        # Create a request and update to delivered status first
        request_data = RequestCreate(
            tool_id=1,
            owner_id=2,
            consumer_id=3,
            start_date=date.today() + timedelta(days=5),
            end_date=date.today() + timedelta(days=8),
            total_amount=75.0
        )
        
        request = crud_request.create_request(db, request_data)
        crud_request.update_request_status(db, request.id, "confirmed")
        crud_request.confirm_delivery(db, request.id)
        
        # Confirm return
        returned_request = crud_request.confirm_return(db, request.id)
        
        # Assertions
        assert returned_request is not None
        assert returned_request.id == request.id
        assert returned_request.status == "returned"

    def test_confirm_reception(self, db: Session):
        """Test confirming reception of a returned tool"""
        # Create a request and update through the flow to returned status
        request_data = RequestCreate(
            tool_id=1,
            owner_id=2,
            consumer_id=3,
            start_date=date.today() + timedelta(days=5),
            end_date=date.today() + timedelta(days=8),
            total_amount=75.0
        )
        
        request = crud_request.create_request(db, request_data)
        crud_request.update_request_status(db, request.id, "confirmed")
        crud_request.confirm_delivery(db, request.id)
        crud_request.confirm_return(db, request.id)
        
        # Confirm reception
        completed_request = crud_request.confirm_reception(db, request.id)
        
        # Assertions
        assert completed_request is not None
        assert completed_request.id == request.id
        assert completed_request.status == "completed"

    def test_reject_request(self, db: Session):
        """Test rejecting a request"""
        # Create a request
        request_data = RequestCreate(
            tool_id=1,
            owner_id=2,
            consumer_id=3,
            start_date=date.today() + timedelta(days=5),
            end_date=date.today() + timedelta(days=8),
            total_amount=75.0
        )
        
        request = crud_request.create_request(db, request_data)
        
        # Reject the request
        rejected_request = crud_request.reject_request(db, request.id)
        
        # Assertions
        assert rejected_request is not None
        assert rejected_request.id == request.id
        assert rejected_request.status == "rejected"

    def test_pay_request(self, db: Session):
        """Test paying for a request"""
        # Create a request
        request_data = RequestCreate(
            tool_id=1,
            owner_id=2,
            consumer_id=3,
            start_date=date.today() + timedelta(days=5),
            end_date=date.today() + timedelta(days=8),
            total_amount=75.0
        )
        
        request = crud_request.create_request(db, request_data)
        
        # Pay for the request
        yape_code = "YAP123456789"
        paid_request = crud_request.pay_request(db, request.id, yape_code)
        
        # Assertions
        assert paid_request is not None
        assert paid_request.id == request.id
        assert paid_request.status == "confirmed"
        assert paid_request.yape_approval_code == yape_code