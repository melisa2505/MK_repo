"""
Tests para operaciones CRUD de categorías
"""
import pytest
from sqlalchemy.orm import Session

from app.crud import category as crud_category
from app.schemas.category import CategoryCreate, CategoryUpdate


class TestCategoryCRUD:
    """Tests para operaciones CRUD de categorías"""

    def test_create_category(self, db: Session):
        """Test para crear categoría"""
        category_data = CategoryCreate(
            name="Herramientas Eléctricas",
            description="Herramientas que funcionan con electricidad"
        )
        
        category = crud_category.create_category(db, category_data)
        
        assert category.name == "Herramientas Eléctricas"
        assert category.description == "Herramientas que funcionan con electricidad"
        assert category.id is not None

    def test_get_category(self, db: Session):
        """Test para obtener categoría por ID"""
        # Primero crear una categoría
        category_data = CategoryCreate(
            name="Herramientas Manuales",
            description="Herramientas que funcionan con fuerza humana"
        )
        
        created_category = crud_category.create_category(db, category_data)
        
        # Obtener la categoría por ID
        fetched_category = crud_category.get_category(db, created_category.id)
        
        assert fetched_category is not None
        assert fetched_category.id == created_category.id
        assert fetched_category.name == "Herramientas Manuales"
        assert fetched_category.description == "Herramientas que funcionan con fuerza humana"

    def test_get_category_by_name(self, db: Session):
        """Test para obtener categoría por nombre"""
        # Primero crear una categoría
        category_data = CategoryCreate(
            name="Herramientas de Jardinería",
            description="Herramientas para el cuidado del jardín"
        )
        
        created_category = crud_category.create_category(db, category_data)
        
        # Obtener la categoría por nombre
        fetched_category = crud_category.get_category_by_name(db, "Herramientas de Jardinería")
        
        assert fetched_category is not None
        assert fetched_category.id == created_category.id
        assert fetched_category.name == "Herramientas de Jardinería"

    def test_get_categories(self, db: Session):
        """Test para obtener todas las categorías"""
        # Crear varias categorías
        category_data1 = CategoryCreate(
            name="Herramientas de Medición",
            description="Instrumentos para mediciones precisas"
        )
        
        category_data2 = CategoryCreate(
            name="Herramientas de Corte",
            description="Herramientas para cortar diferentes materiales"
        )
        
        crud_category.create_category(db, category_data1)
        crud_category.create_category(db, category_data2)
        
        # Obtener todas las categorías
        categories = crud_category.get_categories(db)
        
        # Verificar que se hayan creado al menos las dos categorías
        assert len(categories) >= 2
        
        # Verificar que las categorías creadas estén en la lista
        category_names = [c.name for c in categories]
        assert "Herramientas de Medición" in category_names
        assert "Herramientas de Corte" in category_names

    def test_update_category(self, db: Session):
        """Test para actualizar categoría"""
        # Primero crear una categoría
        category_data = CategoryCreate(
            name="Herramientas Antiguas",
            description="Herramientas de antaño"
        )
        
        created_category = crud_category.create_category(db, category_data)
        
        # Actualizar la categoría
        update_data = CategoryUpdate(
            name="Herramientas Vintage",
            description="Herramientas clásicas y antiguas"
        )
        
        updated_category = crud_category.update_category(db, created_category.id, update_data)
        
        assert updated_category is not None
        assert updated_category.id == created_category.id
        assert updated_category.name == "Herramientas Vintage"
        assert updated_category.description == "Herramientas clásicas y antiguas"

    def test_delete_category(self, db: Session):
        """Test para eliminar categoría"""
        # Primero crear una categoría
        category_data = CategoryCreate(
            name="Categoría para eliminar",
            description="Esta categoría será eliminada"
        )
        
        created_category = crud_category.create_category(db, category_data)
        
        # Eliminar la categoría
        result = crud_category.delete_category(db, created_category.id)
        
        assert result is True
        
        # Verificar que la categoría ha sido eliminada
        fetched_category = crud_category.get_category(db, created_category.id)
        assert fetched_category is None