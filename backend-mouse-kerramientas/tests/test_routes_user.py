"""
Tests for user routes
"""
import pytest
from fastapi import status

from app.crud import user as crud_user
from app.models.user import User


class TestUserRoutes:
    """Tests for user routes"""

    def test_get_users(self, client, db):
        """Test for GET /users/ endpoint"""
        # Create some users first
        user1_data = {
            "email": "user1@example.com",
            "username": "user1",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "User One",
            "is_active": True
        }
        user2_data = {
            "email": "user2@example.com",
            "username": "user2",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "User Two",
            "is_active": True
        }
        
        # Using CRUD operation to create users directly
        crud_user.create_user(db, UserCreate(**user1_data))
        crud_user.create_user(db, UserCreate(**user2_data))
        
        response = client.get("/api/users/")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2
        
        # Check pagination
        response = client.get("/api/users/?skip=1&limit=1")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1

    def test_create_user(self, client, db):
        """Test for POST /users/ endpoint"""
        user_data = {
            "email": "createuser@example.com",
            "username": "createuser",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Create User",
            "phone_number": "+1234567890"
        }
        
        response = client.post("/api/users/", json=user_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["username"] == user_data["username"]
        assert data["full_name"] == user_data["full_name"]
        
        # Check the user was actually created in the database
        db_user = crud_user.get_user_by_email(db, email=user_data["email"])
        assert db_user is not None
        assert db_user.username == user_data["username"]

    def test_create_user_duplicate_email(self, client, db):
        """Test creating a user with an email that already exists"""
        user_data = {
            "email": "duplicate_email@example.com",
            "username": "uniqueuser1",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Unique User One",
            "phone_number": "+1234567890"
        }
        
        # First create a user
        client.post("/api/users/", json=user_data)
        
        # Try to create another user with the same email
        duplicate_data = {
            "email": "duplicate_email@example.com",
            "username": "uniqueuser2",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Unique User Two",
            "phone_number": "+0987654321"
        }
        
        response = client.post("/api/users/", json=duplicate_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "El email ya está registrado" in response.json()["detail"]

    def test_create_user_duplicate_username(self, client, db):
        """Test creating a user with a username that already exists"""
        user_data = {
            "email": "unique1@example.com",
            "username": "duplicate_username",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Unique Email One",
            "phone_number": "+1234567890"
        }
        
        # First create a user
        client.post("/api/users/", json=user_data)
        
        # Try to create another user with the same username
        duplicate_data = {
            "email": "unique2@example.com",
            "username": "duplicate_username",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Unique Email Two",
            "phone_number": "+0987654321"
        }
        
        response = client.post("/api/users/", json=duplicate_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "El nombre de usuario ya está registrado" in response.json()["detail"]

    def test_get_user_by_id(self, client, db):
        """Test for GET /users/{user_id} endpoint"""
        # Create a user first
        user_data = {
            "email": "getuser@example.com",
            "username": "getuser",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Get User",
            "is_active": True
        }
        
        db_user = crud_user.create_user(db, UserCreate(**user_data))
        
        # Get the user by ID
        response = client.get(f"/api/users/{db_user.id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == db_user.id
        assert data["email"] == user_data["email"]
        assert data["username"] == user_data["username"]

    def test_get_nonexistent_user(self, client):
        """Test getting a user that doesn't exist"""
        # Use a high ID that shouldn't exist
        user_id = 9999
        
        response = client.get(f"/api/users/{user_id}")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Usuario no encontrado" in response.json()["detail"]

    def test_update_user(self, client, db):
        """Test for PUT /users/{user_id} endpoint"""
        # Create a user first
        user_data = {
            "email": "updateuser@example.com",
            "username": "updateuser",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Update User Original",
            "phone_number": "+1234567890",
            "is_active": True
        }
        
        db_user = crud_user.create_user(db, UserCreate(**user_data))
        user_id = db_user.id
        
        # Update user data
        update_data = {
            "full_name": "Update User Modified"
        }
        
        response = client.put(f"/api/users/{db_user.id}", json=update_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == db_user.id
        assert data["email"] == user_data["email"]  # Email shouldn't change
        assert data["username"] == user_data["username"]  # Username shouldn't change
        assert data["full_name"] == update_data["full_name"]  # Should be updated
        
        # Importante: Refrescar la sesión para ver los cambios realizados por otra sesión
        db.commit()
        db.refresh(db_user)
        
        # Verificar cambios en la base de datos
        assert db_user.full_name == update_data["full_name"]

    def test_update_nonexistent_user(self, client):
        """Test updating a user that doesn't exist"""
        user_id = 9999  # Use a high ID that shouldn't exist
        
        update_data = {
            "full_name": "Nonexistent User"
        }
        
        response = client.put(f"/api/users/{user_id}", json=update_data)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Usuario no encontrado" in response.json()["detail"]

    def test_update_user_duplicate_email(self, client, db):
        """Test updating a user with an email that belongs to another user"""
        # Create two users first
        user1_data = {
            "email": "user1_update@example.com",
            "username": "user1_update",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "User One Update",
            "is_active": True
        }
        
        user2_data = {
            "email": "user2_update@example.com",
            "username": "user2_update",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "User Two Update",
            "is_active": True
        }
        
        db_user1 = crud_user.create_user(db, UserCreate(**user1_data))
        db_user2 = crud_user.create_user(db, UserCreate(**user2_data))
        
        # Try to update user2's email to user1's email
        update_data = {
            "email": user1_data["email"]
        }
        
        response = client.put(f"/api/users/{db_user2.id}", json=update_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "El email ya está registrado" in response.json()["detail"]

    def test_update_user_duplicate_username(self, client, db):
        """Test updating a user with a username that belongs to another user"""
        # Create two users first
        user1_data = {
            "email": "user1_username@example.com",
            "username": "user1_username",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "User One Username",
            "is_active": True
        }
        
        user2_data = {
            "email": "user2_username@example.com",
            "username": "user2_username",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "User Two Username",
            "is_active": True
        }
        
        db_user1 = crud_user.create_user(db, UserCreate(**user1_data))
        db_user2 = crud_user.create_user(db, UserCreate(**user2_data))
        
        # Try to update user2's username to user1's username
        update_data = {
            "username": user1_data["username"]
        }
        
        response = client.put(f"/api/users/{db_user2.id}", json=update_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "El nombre de usuario ya está registrado" in response.json()["detail"]


# Import this here to avoid circular import issues
from app.schemas.user import UserCreate