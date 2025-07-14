"""
Tests for Chat CRUD operations
"""
import pytest
from sqlalchemy.orm import Session

from app.models.chat import Chat
from app.crud import chat as crud_chat
from app.schemas.chat import ChatCreate


class TestChatCrud:
    """Test class for Chat CRUD operations"""

    def test_create_chat(self, db: Session):
        """Test creating a chat"""
        # Set up data
        owner_id = 1
        consumer_id = 2
        tool_id = 3
        
        # Create a chat
        chat = crud_chat.create_chat(db, owner_id, consumer_id, tool_id)
        
        # Assertions
        assert chat.id is not None
        assert chat.owner_id == owner_id
        assert chat.consumer_id == consumer_id
        assert chat.tool_id == tool_id
        assert chat.created_at is not None

    def test_get_chat(self, db: Session):
        """Test retrieving a chat by ID"""
        # First create a chat
        owner_id = 1
        consumer_id = 2
        tool_id = 3
        
        created_chat = crud_chat.create_chat(db, owner_id, consumer_id, tool_id)
        
        # Get the chat by ID
        retrieved_chat = crud_chat.get_chat(db, created_chat.id)
        
        # Assertions
        assert retrieved_chat is not None
        assert retrieved_chat.id == created_chat.id
        assert retrieved_chat.owner_id == owner_id
        assert retrieved_chat.consumer_id == consumer_id
        assert retrieved_chat.tool_id == tool_id

    def test_get_chats_by_user(self, db: Session):
        """Test retrieving chats for a specific user"""
        # Create a few chats for different users
        user_id = 99  # Use a unique ID to avoid conflicts
        other_id = 88
        
        # Create chats where our user is the owner
        chat1 = crud_chat.create_chat(db, user_id, other_id, 1)
        chat2 = crud_chat.create_chat(db, user_id, other_id + 1, 2)
        
        # Create chats where our user is the consumer
        chat3 = crud_chat.create_chat(db, other_id, user_id, 3)
        chat4 = crud_chat.create_chat(db, other_id + 1, user_id, 4)
        
        # Get chats for our user
        user_chats = crud_chat.get_chats_by_user(db, user_id)
        
        # Assertions
        assert len(user_chats) >= 4
        
        # Verify our user is either the owner or consumer in all returned chats
        for chat in user_chats:
            assert chat.owner_id == user_id or chat.consumer_id == user_id
        
        # Check that our specific created chats are in the results
        chat_ids = [chat.id for chat in user_chats]
        assert chat1.id in chat_ids
        assert chat2.id in chat_ids
        assert chat3.id in chat_ids
        assert chat4.id in chat_ids

    def test_chat_exists_between_users(self, db: Session):
        """Test checking if a chat exists between users for a specific tool"""
        # Create users and tool IDs
        user1_id = 101
        user2_id = 102
        tool_id = 201
        
        # Initially, no chat should exist
        existing_chat = crud_chat.chat_exists_between_users(db, user1_id, user2_id, tool_id)
        assert existing_chat is None
        
        # Create a chat
        created_chat = crud_chat.create_chat(db, user1_id, user2_id, tool_id)
        
        # Now the chat should exist
        existing_chat = crud_chat.chat_exists_between_users(db, user1_id, user2_id, tool_id)
        assert existing_chat is not None
        assert existing_chat.id == created_chat.id
        
        # Check in the opposite direction (user2 to user1)
        existing_chat = crud_chat.chat_exists_between_users(db, user2_id, user1_id, tool_id)
        assert existing_chat is not None
        assert existing_chat.id == created_chat.id
        
        # Different tool should not match
        different_tool_id = 202
        existing_chat = crud_chat.chat_exists_between_users(db, user1_id, user2_id, different_tool_id)
        assert existing_chat is None