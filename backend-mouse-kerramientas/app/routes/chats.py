"""
Routes for handling user chats.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud import chat as crud_chat
from ..crud import message as crud_message
from ..crud import request as crud_request
from ..database.database import get_db
from ..dependencies import get_current_active_user
from ..models.user import User
from ..schemas.chat import Chat, ChatCreate, ChatWithMessages
from ..schemas.message import Message, MessageCreate
from ..schemas.request import RequestCreate

router = APIRouter()

@router.get("/{user_id}", response_model=List[Chat])
async def get_user_chats(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all chats where the user is either owner or consumer.
    """
    if current_user.id != user_id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these chats"
        )
    
    return crud_chat.get_chats_by_user(db, user_id)


@router.get("/{chat_id}/detail", response_model=ChatWithMessages)
async def get_chat_detail(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get details of a specific chat including messages.
    """
    chat = crud_chat.get_chat(db, chat_id)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    # Check if user is part of this chat
    if chat.owner_id != current_user.id and chat.consumer_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this chat"
        )
    
    # TODO: Add messages to the response once the relationship is set up
    return chat


@router.post("/{chat_id}/mensaje", response_model=Message)
async def send_message(
    chat_id: int,
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Send a new message in a chat.
    """
    chat = crud_chat.get_chat(db, chat_id)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    # Check if user is part of this chat
    if chat.owner_id != current_user.id and chat.consumer_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to send messages in this chat"
        )
    
    return crud_message.create_message(db, chat_id, current_user.id, message.content)


@router.post("/{chat_id}/solicitar-alquiler", status_code=status.HTTP_201_CREATED)
async def request_rental(
    chat_id: int,
    request_data: RequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a rental request from a chat.
    """
    chat = crud_chat.get_chat(db, chat_id)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    # Ensure the current user is the consumer in this chat
    if chat.consumer_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the consumer can create rental requests"
        )
    
    # Ensure the tool, owner, and consumer IDs match the chat
    if (request_data.tool_id != chat.tool_id or 
        request_data.owner_id != chat.owner_id or 
        request_data.consumer_id != chat.consumer_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request data doesn't match chat participants and tool"
        )
    
    # Create the rental request
    new_request = crud_request.create_request(db, request_data)
    
    # Create a notification message in the chat
    crud_message.create_message(
        db, 
        chat_id, 
        None,  # System message
        f"Rental request created: from {new_request.start_date} to {new_request.end_date}"
    )
    
    return new_request


@router.post("/create", response_model=Chat, status_code=status.HTTP_201_CREATED)
async def create_chat(
    owner_id: int,
    consumer_id: int,
    tool_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new chat between owner and consumer for a specific tool.
    """
    # Ensure the current user is either the owner or the consumer
    if current_user.id != owner_id and current_user.id != consumer_id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create chats where you are a participant"
        )
    
    return crud_chat.create_chat(db, owner_id, consumer_id, tool_id)