"""
Tests for Notification CRUD operations
"""
import pytest
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.crud import notification as crud_notification
from app.schemas.notification import NotificationCreate


class TestNotificationCrud:
    """Test class for Notification CRUD operations"""

    def test_create_notification(self, db: Session):
        """Test creating a notification"""
        # Set up data
        user_id = 1
        notification_type = "request_created"
        content = "A new request has been made for your tool"
        
        # Create notification
        notification = crud_notification.create_notification(db, user_id, notification_type, content)
        
        # Assertions
        assert notification.id is not None
        assert notification.user_id == user_id
        assert notification.type == notification_type
        assert notification.content == content
        assert notification.read is False  # Should default to unread
        assert notification.timestamp is not None

    def test_get_notifications(self, db: Session):
        """Test retrieving notifications for a user"""
        # Create a unique user_id for this test
        user_id = 99
        
        # Create multiple notifications for this user
        notification1 = crud_notification.create_notification(
            db, user_id, "request_created", "Notification 1"
        )
        notification2 = crud_notification.create_notification(
            db, user_id, "request_confirmed", "Notification 2"
        )
        notification3 = crud_notification.create_notification(
            db, user_id, "request_completed", "Notification 3"
        )
        
        # Create a notification for a different user
        other_notification = crud_notification.create_notification(
            db, user_id + 1, "request_created", "Other user's notification"
        )
        
        # Get notifications for our user
        notifications = crud_notification.get_notifications(db, user_id)
        
        # Assertions
        assert len(notifications) >= 3  # At least the three we created
        
        # All notifications should belong to our user
        for notification in notifications:
            assert notification.user_id == user_id
        
        # Check that our notifications are in the results
        notification_ids = [n.id for n in notifications]
        assert notification1.id in notification_ids
        assert notification2.id in notification_ids
        assert notification3.id in notification_ids
        
        # Check that the other user's notification is not in the results
        assert other_notification.id not in notification_ids
        
        # Verify the order (should be by timestamp in descending order)
        for i in range(1, len(notifications)):
            assert notifications[i-1].timestamp >= notifications[i].timestamp

    def test_mark_as_read(self, db: Session):
        """Test marking a notification as read"""
        # Create a notification (defaults to unread)
        notification = crud_notification.create_notification(
            db, 1, "request_created", "Test notification"
        )
        
        # Verify it's initially unread
        assert notification.read is False
        
        # Mark as read
        updated_notification = crud_notification.mark_as_read(db, notification.id)
        
        # Assertions
        assert updated_notification is not None
        assert updated_notification.id == notification.id
        assert updated_notification.read is True

    def test_get_notifications_pagination(self, db: Session):
        """Test pagination for notifications"""
        # Create a unique user_id for this test
        user_id = 199
        
        # Create several notifications
        for i in range(10):
            crud_notification.create_notification(
                db, user_id, "notification_type", f"Notification {i}"
            )
        
        # Test with different skip and limit values
        notifications1 = crud_notification.get_notifications(db, user_id, skip=0, limit=5)
        notifications2 = crud_notification.get_notifications(db, user_id, skip=5, limit=5)
        
        # Assertions
        assert len(notifications1) == 5
        assert len(notifications2) == 5
        
        # The two result sets should have different notifications
        ids1 = [n.id for n in notifications1]
        ids2 = [n.id for n in notifications2]
        
        for id1 in ids1:
            assert id1 not in ids2