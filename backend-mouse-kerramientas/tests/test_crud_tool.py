"""
Tests for Tool CRUD operations
"""
import pytest
from sqlalchemy.orm import Session

from app.models.tool import Tool, ToolCondition
from app.crud import tool as crud_tool
from app.schemas.tool import ToolCreate, ToolUpdate


class TestToolCrud:
    """Test class for Tool CRUD operations"""

    def test_create_tool(self, db: Session):
        """Test creating a tool"""
        # Create tool data
        tool_data = ToolCreate(
            name="Electric Drill",
            description="A powerful electric drill for home projects",
            brand="DeWalt",
            model="DCD777C2",
            daily_price=25.5,
            warranty=50.0,
            condition=ToolCondition.GOOD,
            category_id=1,
            image_url="https://example.com/drill.jpg"
        )
        
        # Create owner ID (would normally come from authenticated user)
        owner_id = 1
        
        # Call the create_tool function
        tool = crud_tool.create_tool(db, tool_data, owner_id)
        
        # Assertions
        assert tool.id is not None
        assert tool.name == tool_data.name
        assert tool.description == tool_data.description
        assert tool.brand == tool_data.brand
        assert tool.model == tool_data.model
        assert tool.daily_price == tool_data.daily_price
        assert tool.warranty == tool_data.warranty
        assert tool.condition == tool_data.condition
        assert tool.owner_id == owner_id
        assert tool.is_available is True

    def test_get_tool(self, db: Session):
        """Test retrieving a tool by ID"""
        # First create a tool
        tool_data = ToolCreate(
            name="Hammer",
            description="A standard hammer for various projects",
            brand="Stanley",
            model="51-624",
            daily_price=5.0,
            warranty=10.0,
            condition=ToolCondition.EXCELLENT,
            category_id=2,
            image_url=None
        )
        
        created_tool = crud_tool.create_tool(db, tool_data, owner_id=1)
        
        # Get the tool by ID
        retrieved_tool = crud_tool.get_tool(db, created_tool.id)
        
        # Assertions
        assert retrieved_tool is not None
        assert retrieved_tool.id == created_tool.id
        assert retrieved_tool.name == tool_data.name
        assert retrieved_tool.description == tool_data.description

    def test_get_all_tools(self, db: Session):
        """Test retrieving all available tools"""
        # Create multiple tools
        tool_data1 = ToolCreate(
            name="Screwdriver Set",
            description="Complete set of screwdrivers",
            brand="Craftsman",
            model="S12345",
            daily_price=10.0,
            warranty=15.0,
            condition=ToolCondition.NEW,
            category_id=3,
            image_url=None
        )
        
        tool_data2 = ToolCreate(
            name="Circular Saw",
            description="Powerful circular saw for cutting wood",
            brand="Makita",
            model="5007F",
            daily_price=30.0,
            warranty=60.0,
            condition=ToolCondition.GOOD,
            category_id=1,
            image_url=None
        )
        
        crud_tool.create_tool(db, tool_data1, owner_id=1)
        crud_tool.create_tool(db, tool_data2, owner_id=2)
        
        # Get all tools
        tools = crud_tool.get_all_tools(db)
        
        # Assertions
        assert len(tools) >= 2  # At least the two we just created
        
        # Find our created tools in the list
        found_tool1 = False
        found_tool2 = False
        for tool in tools:
            if tool.name == tool_data1.name:
                found_tool1 = True
            elif tool.name == tool_data2.name:
                found_tool2 = True
        
        assert found_tool1
        assert found_tool2

    def test_get_tools_by_user(self, db: Session):
        """Test retrieving tools owned by a specific user"""
        # Create a couple of tools for the same owner
        owner_id = 99  # Use a unique ID to avoid conflicts
        
        tool_data1 = ToolCreate(
            name="Wrench Set",
            description="Complete set of wrenches",
            brand="Craftsman",
            model="W12345",
            daily_price=15.0,
            warranty=20.0,
            condition=ToolCondition.EXCELLENT,
            category_id=4,
            image_url=None
        )
        
        tool_data2 = ToolCreate(
            name="Power Sander",
            description="Electric sander for smooth finishes",
            brand="Black & Decker",
            model="BDEMS600",
            daily_price=18.0,
            warranty=25.0,
            condition=ToolCondition.GOOD,
            category_id=1,
            image_url=None
        )
        
        crud_tool.create_tool(db, tool_data1, owner_id=owner_id)
        crud_tool.create_tool(db, tool_data2, owner_id=owner_id)
        
        # Get tools by owner
        user_tools = crud_tool.get_tools_by_user(db, owner_id)
        
        # Assertions
        assert len(user_tools) >= 2
        
        # All tools should belong to the specified owner
        for tool in user_tools:
            assert tool.owner_id == owner_id

    def test_update_tool(self, db: Session):
        """Test updating a tool"""
        # First create a tool
        tool_data = ToolCreate(
            name="Old Tool Name",
            description="Old description",
            brand="Old Brand",
            model="Old Model",
            daily_price=10.0,
            warranty=15.0,
            condition=ToolCondition.GOOD,
            category_id=1,
            image_url=None
        )
        
        created_tool = crud_tool.create_tool(db, tool_data, owner_id=1)
        
        # Update data
        update_data = ToolUpdate(
            name="New Tool Name",
            description="New improved description",
            daily_price=15.0,
            warranty=25.0,
            condition=ToolCondition.EXCELLENT
        )
        
        # Update the tool
        updated_tool = crud_tool.update_tool(db, created_tool.id, update_data)
        
        # Assertions
        assert updated_tool is not None
        assert updated_tool.id == created_tool.id
        assert updated_tool.name == update_data.name
        assert updated_tool.description == update_data.description
        assert updated_tool.daily_price == update_data.daily_price
        assert updated_tool.warranty == update_data.warranty
        assert updated_tool.condition == update_data.condition
        # Fields not included in the update should remain unchanged
        assert updated_tool.brand == tool_data.brand
        assert updated_tool.model == tool_data.model

    def test_delete_tool(self, db: Session):
        """Test deleting a tool"""
        # First create a tool
        tool_data = ToolCreate(
            name="Tool to Delete",
            description="This tool will be deleted",
            brand="Brand X",
            model="Model Y",
            daily_price=5.0,
            warranty=10.0,
            condition=ToolCondition.FAIR,
            category_id=5,
            image_url=None
        )
        
        created_tool = crud_tool.create_tool(db, tool_data, owner_id=1)
        
        # Verify the tool was created
        assert crud_tool.get_tool(db, created_tool.id) is not None
        
        # Delete the tool
        result = crud_tool.delete_tool(db, created_tool.id)
        
        # Assert deletion was successful
        assert result is True
        
        # Verify the tool no longer exists
        assert crud_tool.get_tool(db, created_tool.id) is None