"""
Tests para las rutas de autenticación
"""
import pytest
from fastapi import status


class TestAuthRoutes:
    """Tests para rutas de autenticación"""

    def test_register_user_success(self, client):
        """Test para registro exitoso de usuario"""
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpassword123",
            "password_confirm": "testpassword123",
            "full_name": "Test User"
        }
        
        response = client.post("/api/auth/register", json=user_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["username"] == user_data["username"]
        assert data["full_name"] == user_data["full_name"]
        assert "id" in data
        assert "hashed_password" not in data  # No debe retornar la contraseña

    def test_register_user_duplicate_email(self, client):
        """Test para registro con email duplicado"""
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpassword123",
            "password_confirm": "testpassword123",
            "full_name": "Test User"
        }
        
        # Primer registro
        client.post("/api/auth/register", json=user_data)
        
        # Segundo registro con mismo email
        user_data["username"] = "testuser2"
        response = client.post("/api/auth/register", json=user_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email already registered" in response.json()["detail"]

    def test_register_user_duplicate_username(self, client):
        """Test para registro con username duplicado"""
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpassword123",
            "password_confirm": "testpassword123",
            "full_name": "Test User"
        }
        
        # Primer registro
        client.post("/api/auth/register", json=user_data)
        
        # Segundo registro con mismo username
        user_data["email"] = "test2@example.com"
        response = client.post("/api/auth/register", json=user_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Username already taken" in response.json()["detail"]

    def test_login_success_oauth2(self, client):
        """Test para login exitoso usando OAuth2"""
        # Primero registrar un usuario
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpassword123",
            "password_confirm": "testpassword123",
            "full_name": "Test User"
        }
        client.post("/api/auth/register", json=user_data)
        
        # Ahora hacer login
        login_data = {
            "username": "testuser",
            "password": "testpassword123"
        }
        
        response = client.post("/api/auth/login", data=login_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_success_json(self, client):
        """Test para login exitoso usando JSON"""
        # Primero registrar un usuario
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpassword123",
            "password_confirm": "testpassword123",
            "full_name": "Test User"
        }
        client.post("/api/auth/register", json=user_data)
        
        # Ahora hacer login con JSON
        login_data = {
            "username": "testuser",
            "password": "testpassword123"
        }
        
        response = client.post("/api/auth/login-json", json=login_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_credentials(self, client):
        """Test para login con credenciales inválidas"""
        login_data = {
            "username": "nonexistent",
            "password": "wrongpassword"
        }
        
        response = client.post("/api/auth/login", data=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Incorrect username or password" in response.json()["detail"]

    def test_get_current_user(self, client):
        """Test para obtener información del usuario actual"""
        # Registrar y obtener token
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpassword123",
            "password_confirm": "testpassword123",
            "full_name": "Test User"
        }
        client.post("/api/auth/register", json=user_data)
        
        login_data = {
            "username": "testuser",
            "password": "testpassword123"
        }
        login_response = client.post("/api/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        
        # Usar token para acceder a endpoint protegido
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"

    def test_test_token_endpoint(self, client):
        """Test para endpoint de test de token"""
        # Registrar y obtener token
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpassword123",
            "password_confirm": "testpassword123",
            "full_name": "Test User"
        }
        client.post("/api/auth/register", json=user_data)
        
        login_data = {
            "username": "testuser",
            "password": "testpassword123"
        }
        login_response = client.post("/api/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        
        # Usar token para acceder a endpoint de test
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/auth/test-token", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "message" in data
        assert "testuser" in data["message"]
        assert "user_id" in data

    def test_protected_endpoint_without_token(self, client):
        """Test para acceder a endpoint protegido sin token"""
        response = client.get("/api/auth/me")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_protected_endpoint_invalid_token(self, client):
        """Test para acceder a endpoint protegido con token inválido"""
        headers = {"Authorization": "Bearer invalidtoken"}
        response = client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED