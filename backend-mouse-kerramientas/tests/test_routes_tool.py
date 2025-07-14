"""
Tests for tool routes
"""
import pytest
from fastapi import status

from app.crud import tool as crud_tool


class TestToolRoutes:
    """Tests for tool routes"""

    def test_get_tools(self, client, db):
        """Test for GET /tools/ endpoint"""
        # First create a test user
        user_data = {
            "email": "toolowner@example.com",
            "username": "toolowner",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Tool Owner"
        }
        
        register_response = client.post("/api/auth/register", json=user_data)
        user_id = register_response.json()["id"]
        login_response = client.post("/api/auth/login", data={
            "username": "toolowner",
            "password": "password123"
        })
        token = login_response.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        # Create some test tools
        tool_data1 = {
            "name": "Hammer",
            "description": "A standard hammer for driving nails",
            "brand": "Stanley",
            "model": "51-624",
            "daily_price": 10.0,
            "warranty": 10.0,
            "condition": "good",
            "is_available": True,
            "category_id": 1
        }
        
        tool_data2 = {
            "name": "Drill",
            "description": "Electric drill with various bits",
            "brand": "DeWalt",
            "model": "DCD777C2",
            "daily_price": 20.0,
            "warranty": 15.0,
            "condition": "excellent",
            "is_available": True,
            "category_id": 1
        }
        
        client.post("/api/tools/", json=tool_data1, headers=auth_headers)
        client.post("/api/tools/", json=tool_data2, headers=auth_headers)
        
        # Test the endpoint
        response = client.get("/api/tools/")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2
        
        tool_names = [tool["name"] for tool in data]
        assert "Hammer" in tool_names
        assert "Drill" in tool_names

    def test_get_tools_with_filters(self, client, db):
        """Test for GET /tools/ endpoint with filters"""
        # First create a test user and add some tools
        user_data = {
            "email": "filteruser@example.com",
            "username": "filteruser",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Filter User"
        }
        
        register_response = client.post("/api/auth/register", json=user_data)
        user_id = register_response.json()["id"]
        login_response = client.post("/api/auth/login", data={
            "username": "filteruser",
            "password": "password123"
        })
        token = login_response.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        # Create tools with different availability
        available_tool = {
            "name": "Available Tool",
            "description": "This tool is available",
            "brand": "Stanley",
            "model": "AT-100",
            "daily_price": 15.0,
            "warranty": 10.0,
            "condition": "good",
            "is_available": True,
            "category_id": 1
        }
        
        unavailable_tool = {
            "name": "Unavailable Tool",
            "description": "This tool is not available",
            "brand": "DeWalt",
            "model": "UT-200",
            "daily_price": 25.0,
            "warranty": 15.0,
            "condition": "fair",
            "is_available": False,
            "category_id": 1
        }
        
        client.post("/api/tools/", json=available_tool, headers=auth_headers)
        client.post("/api/tools/", json=unavailable_tool, headers=auth_headers)
        
        # Test filtering by availability
        response = client.get("/api/tools/?available=true")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert all(tool["is_available"] for tool in data)
        
        response = client.get("/api/tools/?available=false")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert all(not tool["is_available"] for tool in data)

    def test_get_tool_by_id(self, client, db):
        """Test for GET /tools/{tool_id} endpoint"""
        # First create a test user
        user_data = {
            "email": "tooluser@example.com",
            "username": "tooluser",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Tool User"
        }
        
        register_response = client.post("/api/auth/register", json=user_data)
        user_id = register_response.json()["id"]
        login_response = client.post("/api/auth/login", data={
            "username": "tooluser",
            "password": "password123"
        })
        token = login_response.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        # Create a test tool
        tool_data = {
            "name": "Screwdriver",
            "description": "Phillips head screwdriver",
            "brand": "Stanley",
            "model": "SP-100",
            "daily_price": 5.0,
            "warranty": 5.0,
            "condition": "good",
            "is_available": True,
            "category_id": 1
        }
        
        create_response = client.post("/api/tools/", json=tool_data, headers=auth_headers)
        tool_id = create_response.json()["id"]
        
        # Test the endpoint
        response = client.get(f"/api/tools/{tool_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == tool_id
        assert data["name"] == tool_data["name"]
        assert data["description"] == tool_data["description"]
        assert float(data["daily_price"]) == tool_data["daily_price"]

    def test_get_tool_not_found(self, client):
        """Test getting a non-existent tool"""
        # Use a very large ID that shouldn't exist
        non_existent_id = 9999
        response = client.get(f"/api/tools/{non_existent_id}")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Herramienta no encontrada" in response.json()["detail"]

    def test_create_tool(self, client, db):
        """Test for POST /tools/ endpoint"""
        # First create a test user
        user_data = {
            "email": "creator@example.com",
            "username": "creator",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Tool Creator"
        }
        
        client.post("/api/auth/register", json=user_data)
        login_response = client.post("/api/auth/login", data={
            "username": "creator",
            "password": "password123"
        })
        token = login_response.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        # Create a tool
        tool_data = {
            "name": "New Tool",
            "description": "A brand new tool",
            "brand": "Milwaukee", 
            "model": "NT-2023",
            "daily_price": 15.0,
            "warranty": 12.0,
            "condition": "new",
            "is_available": True,
            "category_id": 1
        }
        
        response = client.post("/api/tools/", json=tool_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == tool_data["name"]
        assert data["description"] == tool_data["description"]
        assert float(data["daily_price"]) == tool_data["daily_price"]
        assert data["is_available"] == tool_data["is_available"]
        assert "id" in data

    def test_create_tool_unauthorized(self, client):
        """Test creating a tool without authentication"""
        tool_data = {
            "name": "Unauthorized Tool",
            "description": "This shouldn't work",
            "brand": "Generic",
            "model": "UT-100",
            "daily_price": 15.0,
            "warranty": 0.0,
            "condition": "good",
            "is_available": True,
            "category_id": 1
        }
        
        response = client.post("/api/tools/", json=tool_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_user_tools(self, client, db):
        """Test for GET /tools/user/{user_id} endpoint"""
        # First create a test user
        user_data = {
            "email": "usertool@example.com",
            "username": "usertool",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "User Tool"
        }
        
        register_response = client.post("/api/auth/register", json=user_data)
        user_id = register_response.json()["id"]
        login_response = client.post("/api/auth/login", data={
            "username": "usertool",
            "password": "password123"
        })
        token = login_response.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        # Create tools for this user
        tool_data1 = {
            "name": "User Tool 1",
            "description": "First tool for user",
            "brand": "Makita",
            "model": "UT-101",
            "daily_price": 10.0,
            "warranty": 8.0,
            "condition": "good",
            "is_available": True,
            "category_id": 1
        }
        
        tool_data2 = {
            "name": "User Tool 2",
            "description": "Second tool for user",
            "brand": "Bosch",
            "model": "UT-202",
            "daily_price": 20.0,
            "warranty": 12.0,
            "condition": "excellent",
            "is_available": True,
            "category_id": 1
        }
        
        client.post("/api/tools/", json=tool_data1, headers=auth_headers)
        client.post("/api/tools/", json=tool_data2, headers=auth_headers)
        
        # Test the endpoint
        response = client.get(f"/api/tools/user/{user_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2
        
        tool_names = [tool["name"] for tool in data]
        assert "User Tool 1" in tool_names
        assert "User Tool 2" in tool_names
        
        # All tools should belong to the same user
        for tool in data:
            assert tool["owner_id"] == user_id

    def test_update_tool(self, client, db):
        """Test for PUT /tools/{tool_id} endpoint"""
        # First create a test user
        user_data = {
            "email": "updatetool@example.com",
            "username": "updatetool",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Update Tool User"
        }
        
        register_response = client.post("/api/auth/register", json=user_data)
        user_id = register_response.json()["id"]
        login_response = client.post("/api/auth/login", data={
            "username": "updatetool",
            "password": "password123"
        })
        token = login_response.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        # Create a test tool
        tool_data = {
            "name": "Tool to Update",
            "description": "This will be updated",
            "brand": "Craftsman",
            "model": "TU-100",
            "daily_price": 15.0,
            "warranty": 6.0,
            "condition": "good",
            "is_available": True,
            "category_id": 1
        }
        
        create_response = client.post("/api/tools/", json=tool_data, headers=auth_headers)
        tool_id = create_response.json()["id"]
        
        # Update the tool
        update_data = {
            "name": "Updated Tool",
            "description": "This has been updated",
            "daily_price": 25.0
        }
        
        response = client.put(f"/api/tools/{tool_id}", json=update_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == tool_id
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert float(data["daily_price"]) == update_data["daily_price"]
        assert data["is_available"] == tool_data["is_available"]  # Should remain unchanged

    def test_update_tool_not_found(self, client, db):
        """Test updating a non-existent tool"""
        # First create a test user
        user_data = {
            "email": "notfound@example.com",
            "username": "notfound",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Not Found User"
        }
        
        client.post("/api/auth/register", json=user_data)
        login_response = client.post("/api/auth/login", data={
            "username": "notfound",
            "password": "password123"
        })
        token = login_response.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        # Use a very large ID that shouldn't exist
        non_existent_id = 9999
        update_data = {"name": "This Won't Work"}
        
        response = client.put(f"/api/tools/{non_existent_id}", json=update_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Herramienta no encontrada" in response.json()["detail"]

    def test_update_tool_unauthorized(self, client, db):
        """Test updating a tool as a non-owner"""
        # Create two users
        owner_data = {
            "email": "owner@example.com",
            "username": "owner",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Tool Owner"
        }
        
        non_owner_data = {
            "email": "nonowner@example.com",
            "username": "nonowner",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Non Owner"
        }
        
        client.post("/api/auth/register", json=owner_data)
        client.post("/api/auth/register", json=non_owner_data)
        
        # Log in as owner and create a tool
        owner_login = client.post("/api/auth/login", data={
            "username": "owner",
            "password": "password123"
        })
        owner_token = owner_login.json()["access_token"]
        owner_headers = {"Authorization": f"Bearer {owner_token}"}
        
        tool_data = {
            "name": "Owner's Tool",
            "description": "This belongs to the owner",
            "brand": "Ryobi",
            "model": "OT-500",
            "daily_price": 15.0,
            "warranty": 7.0,
            "condition": "good",
            "is_available": True,
            "category_id": 1
        }
        
        create_response = client.post("/api/tools/", json=tool_data, headers=owner_headers)
        tool_id = create_response.json()["id"]
        
        # Log in as non-owner and try to update the tool
        non_owner_login = client.post("/api/auth/login", data={
            "username": "nonowner",
            "password": "password123"
        })
        non_owner_token = non_owner_login.json()["access_token"]
        non_owner_headers = {"Authorization": f"Bearer {non_owner_token}"}
        
        update_data = {"name": "Trying to change this"}
        
        response = client.put(f"/api/tools/{tool_id}", json=update_data, headers=non_owner_headers)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "No autorizado para actualizar esta herramienta" in response.json()["detail"]

    def test_delete_tool(self, client, db):
        """Test for DELETE /tools/{tool_id} endpoint"""
        # First create a test user
        user_data = {
            "email": "deletetool@example.com",
            "username": "deletetool",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Delete Tool User"
        }
        
        client.post("/api/auth/register", json=user_data)
        login_response = client.post("/api/auth/login", data={
            "username": "deletetool",
            "password": "password123"
        })
        token = login_response.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        # Create a test tool
        tool_data = {
            "name": "Tool to Delete",
            "description": "This will be deleted",
            "brand": "Black & Decker",
            "model": "TD-100",
            "daily_price": 15.0,
            "warranty": 5.0,
            "condition": "good",
            "is_available": True,
            "category_id": 1
        }
        
        create_response = client.post("/api/tools/", json=tool_data, headers=auth_headers)
        tool_id = create_response.json()["id"]
        
        # Delete the tool
        response = client.delete(f"/api/tools/{tool_id}", headers=auth_headers)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify the tool is deleted
        get_response = client.get(f"/api/tools/{tool_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_tool_not_found(self, client, db):
        """Test deleting a non-existent tool"""
        # First create a test user
        user_data = {
            "email": "notfounddelete@example.com",
            "username": "notfounddelete",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Not Found Delete User"
        }
        
        client.post("/api/auth/register", json=user_data)
        login_response = client.post("/api/auth/login", data={
            "username": "notfounddelete",
            "password": "password123"
        })
        token = login_response.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        # Use a very large ID that shouldn't exist
        non_existent_id = 9999
        
        response = client.delete(f"/api/tools/{non_existent_id}", headers=auth_headers)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Herramienta no encontrada" in response.json()["detail"]

    def test_delete_tool_unauthorized(self, client, db):
        """Test deleting a tool as a non-owner"""
        # Create two users
        owner_data = {
            "email": "deleteowner@example.com",
            "username": "deleteowner",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Delete Tool Owner"
        }
        
        non_owner_data = {
            "email": "deletenonowner@example.com",
            "username": "deletenonowner",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Delete Non Owner"
        }
        
        client.post("/api/auth/register", json=owner_data)
        client.post("/api/auth/register", json=non_owner_data)
        
        # Log in as owner and create a tool
        owner_login = client.post("/api/auth/login", data={
            "username": "deleteowner",
            "password": "password123"
        })
        owner_token = owner_login.json()["access_token"]
        owner_headers = {"Authorization": f"Bearer {owner_token}"}
        
        tool_data = {
            "name": "Owner's Tool to Delete",
            "description": "This belongs to the owner",
            "brand": "Craftsman",
            "model": "DTD-100",
            "daily_price": 15.0,
            "warranty": 10.0,
            "condition": "excellent",
            "is_available": True,
            "category_id": 1
        }
        
        create_response = client.post("/api/tools/", json=tool_data, headers=owner_headers)
        tool_id = create_response.json()["id"]
        
        # Log in as non-owner and try to delete the tool
        non_owner_login = client.post("/api/auth/login", data={
            "username": "deletenonowner",
            "password": "password123"
        })
        non_owner_token = non_owner_login.json()["access_token"]
        non_owner_headers = {"Authorization": f"Bearer {non_owner_token}"}
        
        response = client.delete(f"/api/tools/{tool_id}", headers=non_owner_headers)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "No autorizado para eliminar esta herramienta" in response.json()["detail"]