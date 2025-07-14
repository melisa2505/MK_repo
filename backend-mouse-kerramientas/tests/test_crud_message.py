"""
Tests for Message CRUD operations
"""
import pytest
from sqlalchemy.orm import Session

from app.models.message import Message
from app.crud import message as crud_message
from app.crud import chat as crud_chat


class TestMessageCrud:
    """Test class for Message CRUD operations"""

    def test_create_message(self, db: Session):
        """Test creating a message"""
        # First create a chat to associate with the message
        owner_id = 1
        consumer_id = 2
        tool_id = 3
        chat = crud_chat.create_chat(db, owner_id, consumer_id, tool_id)
        
        # Create a message
        chat_id = chat.id
        sender_id = owner_id
        content = "Hello, I'm interested in your tool."
        
        message = crud_message.create_message(db, chat_id, sender_id, content)
        
        # Assertions
        assert message.id is not None
        assert message.chat_id == chat_id
        assert message.sender_id == sender_id
        assert message.content == content
        assert message.timestamp is not None
    
    def test_create_system_message(self, db: Session):
        """Test creating a system message (with no sender)"""
        # First create a chat
        chat = crud_chat.create_chat(db, 1, 2, 3)
        
        # Create a system message (no sender)
        chat_id = chat.id
        content = "System notification: Your rental request has been approved."
        
        message = crud_message.create_message(db, chat_id, None, content)
        
        # Assertions
        assert message.id is not None
        assert message.chat_id == chat_id
        assert message.sender_id is None
        assert message.content == content
    
    def test_get_messages_by_chat(self, db: Session):
        """Test retrieving all messages from a specific chat"""
        # Create a chat
        chat = crud_chat.create_chat(db, 1, 2, 3)
        chat_id = chat.id
        
        # Create multiple messages in the chat
        message1 = crud_message.create_message(db, chat_id, 1, "First message")
        message2 = crud_message.create_message(db, chat_id, 2, "Second message")
        message3 = crud_message.create_message(db, chat_id, 1, "Third message")
        
        # Create a message in another chat to verify filtering
        other_chat = crud_chat.create_chat(db, 4, 5, 6)
        other_message = crud_message.create_message(db, other_chat.id, 4, "Message in another chat")
        
        # Get messages for our chat
        messages = crud_message.get_messages_by_chat(db, chat_id)
        
        # Assertions
        assert len(messages) >= 3  # At least the three we created
        
        # Check that our messages are in the results
        message_ids = [msg.id for msg in messages]
        assert message1.id in message_ids
        assert message2.id in message_ids
        assert message3.id in message_ids
        
        # Check that the other message is not in the results
        assert other_message.id not in message_ids
        
        # Verify the order (should be by timestamp)
        for i in range(1, len(messages)):
            assert messages[i-1].timestamp <= messages[i].timestamp
    
    def test_get_messages_pagination(self, db: Session):
        """Test pagination of messages"""
        # Create a chat
        chat = crud_chat.create_chat(db, 1, 2, 3)
        chat_id = chat.id
        
        # Create multiple messages in the chat
        for i in range(5):
            crud_message.create_message(db, chat_id, 1, f"Message {i}")
        
        # Test skip and limit
        messages1 = crud_message.get_messages_by_chat(db, chat_id, skip=0, limit=2)
        messages2 = crud_message.get_messages_by_chat(db, chat_id, skip=2, limit=2)
        
        # Assertions
        assert len(messages1) == 2
        assert len(messages2) == 2
        
        # Messages should be different between the two queries
        message1_ids = [msg.id for msg in messages1]
        message2_ids = [msg.id for msg in messages2]
        
        for msg_id in message1_ids:
            assert msg_id not in message2_ids