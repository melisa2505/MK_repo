"""
Tests para operaciones CRUD de usuarios
"""
import pytest
from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.crud.user import (
    authenticate_user,
    create_user,
    get_user,
    get_user_by_email,
    get_user_by_username,
    update_user,
)
from app.schemas.user import UserCreate, UserUpdate


class TestUserCRUD:
    """Tests para operaciones CRUD de usuarios"""

    def test_create_user(self, test_db):
        """Test para crear usuario"""
        user_data = UserCreate(
            email="create@example.com",
            username="createuser",
            password="testpassword123",
            password_confirm="testpassword123",
            full_name="Create User"
        )
        
        user = create_user(test_db, user_data)
        
        assert user.email == "create@example.com"
        assert user.username == "createuser"
        assert user.full_name == "Create User"
        assert user.is_active is True
        assert user.id is not None
        assert verify_password("testpassword123", user.hashed_password)

    def test_get_user_by_email(self, test_db):
        """Test para obtener usuario por email"""
        # Crear usuario
        user_data = UserCreate(
            email="email@example.com",
            username="emailuser",
            password="testpassword123",
            password_confirm="testpassword123"
        )
        created_user = create_user(test_db, user_data)
        
        # Buscar por email
        found_user = get_user_by_email(test_db, "email@example.com")
        
        assert found_user is not None
        assert found_user.id == created_user.id
        assert found_user.email == "email@example.com"

    def test_get_user_by_username(self, test_db):
        """Test para obtener usuario por username"""
        # Crear usuario
        user_data = UserCreate(
            email="username@example.com",
            username="usernameuser",
            password="testpassword123",
            password_confirm="testpassword123"
        )
        created_user = create_user(test_db, user_data)
        
        # Buscar por username
        found_user = get_user_by_username(test_db, "usernameuser")
        
        assert found_user is not None
        assert found_user.id == created_user.id
        assert found_user.username == "usernameuser"

    def test_authenticate_user_success(self, test_db):
        """Test para autenticación exitosa"""
        # Crear usuario
        user_data = UserCreate(
            email="auth@example.com",
            username="authuser",
            password="testpassword123",
            password_confirm="testpassword123"
        )
        create_user(test_db, user_data)
        
        # Autenticar
        authenticated_user = authenticate_user(test_db, "authuser", "testpassword123")
        
        assert authenticated_user is not None
        assert authenticated_user.username == "authuser"

    def test_authenticate_user_wrong_password(self, test_db):
        """Test para autenticación con contraseña incorrecta"""
        # Crear usuario
        user_data = UserCreate(
            email="wrongpass@example.com",
            username="wrongpassuser",
            password="testpassword123",
            password_confirm="testpassword123"
        )
        create_user(test_db, user_data)
        
        # Intentar autenticar con contraseña incorrecta
        authenticated_user = authenticate_user(test_db, "wrongpassuser", "wrongpassword")
        
        assert authenticated_user is None

    def test_authenticate_user_nonexistent(self, test_db):
        """Test para autenticación de usuario inexistente"""
        # Intentar autenticar usuario que no existe
        authenticated_user = authenticate_user(test_db, "nonexistent", "password")
        
        assert authenticated_user is None