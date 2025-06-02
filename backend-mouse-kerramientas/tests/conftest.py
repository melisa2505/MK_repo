"""
Configuración de pytest para tests
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database.database import get_db, Base

# Base de datos en memoria para tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_temp.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override de la función get_db para usar base de datos de test"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def test_db():
    """Fixture que crea una base de datos limpia para cada test"""
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)

    # Override de la dependencia
    app.dependency_overrides[get_db] = override_get_db

    yield TestingSessionLocal()

    # Limpiar override
    app.dependency_overrides.clear()

    # Eliminar todas las tablas después del test
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db):
    """Fixture del cliente de testing"""
    with TestClient(app) as test_client:
        yield test_client