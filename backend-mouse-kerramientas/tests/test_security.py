"""
Tests para el módulo de seguridad
"""
import pytest
from jose import jwt

from app.core.config import settings
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
    verify_token,
)


class TestSecurity:
    """Tests para funciones de seguridad"""

    def test_create_access_token(self):
        """Test para crear token de acceso"""
        username = "testuser"
        token = create_access_token(subject=username)
        
        assert token is not None
        assert isinstance(token, str)
        
        # Verificar que el token se puede decodificar
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert payload["sub"] == username

    def test_verify_token_valid(self):
        """Test para verificar token válido"""
        username = "testuser"
        token = create_access_token(subject=username)
        
        decoded_username = verify_token(token)
        assert decoded_username == username

    def test_verify_token_invalid(self):
        """Test para verificar token inválido"""
        invalid_token = "invalid.token.here"
        result = verify_token(invalid_token)
        assert result is None

    def test_password_hashing(self):
        """Test para hashear contraseñas"""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert verify_password(password, hashed) is True
        assert verify_password("wrongpassword", hashed) is False

    def test_password_verification(self):
        """Test para verificar contraseñas"""
        password = "mypassword"
        wrong_password = "wrongpassword"
        hashed_password = get_password_hash(password)
        
        assert verify_password(password, hashed_password) is True
        assert verify_password(wrong_password, hashed_password) is False