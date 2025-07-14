"""
CRUD operations for messages
"""
from typing import List, Optional

from sqlalchemy.orm import Session

from ..models.message import Message
from ..schemas.message import MessageCreate


def create_message(db: Session, chat_id: int, sender_id: Optional[int], content: str) -> Message:
    """
    Create a new message in a chat
    """
    db_message = Message(
        chat_id=chat_id,
        sender_id=sender_id,
        content=content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def get_messages_by_chat(db: Session, chat_id: int, skip: int = 0, limit: int = 100) -> List[Message]:
    """
    Get all messages from a specific chat
    """
    return db.query(Message).filter(
        Message.chat_id == chat_id
    ).order_by(Message.timestamp).offset(skip).limit(limit).all()