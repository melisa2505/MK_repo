"""
CRUD operations for tools
"""
from typing import List, Optional

from sqlalchemy.orm import Session

from ..models.tool import Tool
from ..schemas.tool import ToolCreate, ToolUpdate


def create_tool(db: Session, tool_data: ToolCreate, owner_id: int) -> Tool:
    """
    Create a new tool
    """
    db_tool = Tool(
        name=tool_data.name,
        description=tool_data.description,
        brand=tool_data.brand,
        model=tool_data.model,
        category_id=tool_data.category_id,  # Changed from category to category_id
        daily_price=tool_data.daily_price,
        warranty=tool_data.warranty,
        condition=tool_data.condition,
        image_url=tool_data.image_url,
        owner_id=owner_id
    )
    db.add(db_tool)
    db.commit()
    db.refresh(db_tool)
    return db_tool


def get_tool(db: Session, tool_id: int) -> Optional[Tool]:
    """
    Get tool by ID
    """
    return db.query(Tool).filter(Tool.id == tool_id).first()


def get_all_tools(db: Session, skip: int = 0, limit: int = 100) -> List[Tool]:
    """
    Get all available tools
    """
    return db.query(Tool).filter(Tool.is_available == True).offset(skip).limit(limit).all()


def get_tools_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Tool]:
    """
    Get all tools owned by a user
    """
    return db.query(Tool).filter(Tool.owner_id == user_id).offset(skip).limit(limit).all()


def update_tool(db: Session, tool_id: int, tool_data: ToolUpdate) -> Optional[Tool]:
    """
    Update tool information
    """
    db_tool = get_tool(db, tool_id)
    if db_tool:
        update_data = tool_data.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_tool, field, value)
        
        db.commit()
        db.refresh(db_tool)
    return db_tool


def delete_tool(db: Session, tool_id: int) -> bool:
    """
    Delete a tool
    """
    db_tool = get_tool(db, tool_id)
    if db_tool:
        db.delete(db_tool)
        db.commit()
        return True
    return False