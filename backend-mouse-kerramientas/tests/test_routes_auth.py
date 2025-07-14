"""
Tests for auth routes
"""
import pytest
from fastapi import status

from app.crud import user as crud_user


class TestAuthRoutes:
    """Tests for auth routes"""

    def test_register(self, client, db):
        """Test for POST /auth/register endpoint"""
        user_data = {
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "New User"
        }
        
        response = client.post("/api/auth/register", json=user_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["username"] == user_data["username"]
        assert data["full_name"] == user_data["full_name"]
        assert "id" in data
        assert "password" not in data  # Password should not be returned

    def test_register_email_already_exists(self, client, db):
        """Test registration with an email that already exists"""
        # First register a user
        user_data = {
            "email": "duplicate@example.com",
            "username": "originaluser",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Original User"
        }
        
        client.post("/api/auth/register", json=user_data)
        
        # Try to register another user with the same email
        duplicate_data = {
            "email": "duplicate@example.com",
            "username": "anotheruser",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Another User"
        }
        
        response = client.post("/api/auth/register", json=duplicate_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email already registered" in response.json()["detail"]

    def test_register_username_already_exists(self, client, db):
        """Test registration with a username that already exists"""
        # First register a user
        user_data = {
            "email": "original@example.com",
            "username": "duplicateuser",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Original User"
        }
        
        client.post("/api/auth/register", json=user_data)
        
        # Try to register another user with the same username
        duplicate_data = {
            "email": "another@example.com",
            "username": "duplicateuser",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Another User"
        }
        
        response = client.post("/api/auth/register", json=duplicate_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Username already taken" in response.json()["detail"]

    def test_login(self, client, db):
        """Test for POST /auth/login endpoint with form data"""
        # First register a user
        user_data = {
            "email": "loginuser@example.com",
            "username": "loginuser",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Login User"
        }
        
        client.post("/api/auth/register", json=user_data)
        
        # Login with the registered user
        login_data = {
            "username": "loginuser",
            "password": "password123"
        }
        
        response = client.post("/api/auth/login", data=login_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_json(self, client, db):
        """Test for POST /auth/login-json endpoint with JSON data"""
        # First register a user
        user_data = {
            "email": "jsonlogin@example.com",
            "username": "jsonlogin",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "JSON Login User"
        }
        
        client.post("/api/auth/register", json=user_data)
        
        # Login with JSON
        login_data = {
            "username": "jsonlogin",
            "password": "password123"
        }
        
        response = client.post("/api/auth/login-json", json=login_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_incorrect_credentials(self, client, db):
        """Test login with incorrect credentials"""
        # First register a user
        user_data = {
            "email": "wrongcreds@example.com",
            "username": "wrongcreds",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Wrong Credentials User"
        }
        
        client.post("/api/auth/register", json=user_data)
        
        # Login with incorrect password
        login_data = {
            "username": "wrongcreds",
            "password": "wrongpassword"
        }
        
        response = client.post("/api/auth/login", data=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Incorrect username or password" in response.json()["detail"]
        
        # Login with non-existent username
        login_data = {
            "username": "nonexistentuser",
            "password": "password123"
        }
        
        response = client.post("/api/auth/login", data=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Incorrect username or password" in response.json()["detail"]

    def test_login_inactive_user(self, client, db):
        """Test login with an inactive user"""
        # First register a user and then set is_active to False
        user_data = {
            "email": "inactive@example.com",
            "username": "inactiveuser",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Inactive User"
        }
        
        response = client.post("/api/auth/register", json=user_data)
        user_id = response.json()["id"]
        
        # Set the user to inactive
        db_user = crud_user.get_user(db, user_id)
        db_user.is_active = False
        db.commit()
        
        # Try to login
        login_data = {
            "username": "inactiveuser",
            "password": "password123"
        }
        
        response = client.post("/api/auth/login", data=login_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Inactive user" in response.json()["detail"]

    def test_me_endpoint(self, client, db):
        """Test for GET /auth/me endpoint"""
        # First register and login
        user_data = {
            "email": "meuser@example.com",
            "username": "meuser",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Me User"
        }
        
        register_response = client.post("/api/auth/register", json=user_data)
        user_id = register_response.json()["id"]
        
        login_response = client.post("/api/auth/login", data={
            "username": "meuser",
            "password": "password123"
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Access the /me endpoint
        response = client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == user_id
        assert data["email"] == user_data["email"]
        assert data["username"] == user_data["username"]
        assert data["full_name"] == user_data["full_name"]

    def test_me_endpoint_unauthorized(self, client):
        """Test /auth/me endpoint without authentication"""
        response = client.get("/api/auth/me")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Not authenticated" in response.json()["detail"]

    def test_test_token(self, client, db):
        """Test for GET /auth/test-token endpoint"""
        # First register and login
        user_data = {
            "email": "testtoken@example.com",
            "username": "testtoken",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Test Token User"
        }
        
        register_response = client.post("/api/auth/register", json=user_data)
        user_id = register_response.json()["id"]
        
        login_response = client.post("/api/auth/login", data={
            "username": "testtoken",
            "password": "password123"
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Access the test-token endpoint
        response = client.get("/api/auth/test-token", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["message"] == f"Hello {user_data['username']}!"
        assert data["user_id"] == user_id

    def test_test_token_unauthorized(self, client):
        """Test /auth/test-token endpoint without authentication"""
        response = client.get("/api/auth/test-token")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Not authenticated" in response.json()["detail"]