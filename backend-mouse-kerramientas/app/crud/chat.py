"""
CRUD operations for chats
"""
from typing import List, Optional

from sqlalchemy import or_, and_
from sqlalchemy.orm import Session

from ..models.chat import Chat
from ..schemas.chat import ChatCreate


def create_chat(db: Session, owner_id: int, consumer_id: int, tool_id: int) -> Chat:
    """
    Create a new chat between owner and consumer for a specific tool
    """
    # Check if chat already exists
    existing_chat = chat_exists_between_users(db, owner_id, consumer_id, tool_id)
    if existing_chat:
        return existing_chat
    
    # Create new chat
    db_chat = Chat(
        owner_id=owner_id,
        consumer_id=consumer_id,
        tool_id=tool_id
    )
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat


def get_chat(db: Session, chat_id: int) -> Optional[Chat]:
    """
    Get chat by ID
    """
    return db.query(Chat).filter(Chat.id == chat_id).first()


def get_chats_by_user(db: Session, user_id: int) -> List[Chat]:
    """
    Get all chats where user is either owner or consumer
    """
    return db.query(Chat).filter(
        or_(Chat.owner_id == user_id, Chat.consumer_id == user_id)
    ).all()


def chat_exists_between_users(db: Session, user1_id: int, user2_id: int, tool_id: int) -> Optional[Chat]:
    """
    Check if a chat already exists between two users for a specific tool
    """
    return db.query(Chat).filter(
        or_(
            and_(Chat.owner_id == user1_id, Chat.consumer_id == user2_id, Chat.tool_id == tool_id),
            and_(Chat.owner_id == user2_id, Chat.consumer_id == user1_id, Chat.tool_id == tool_id)
        )
    ).first()