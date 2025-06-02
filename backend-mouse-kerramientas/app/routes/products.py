"""
Rutas para la gestión de productos.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database.database import get_db
from ..dependencies import get_current_active_user

router = APIRouter()


@router.get("/")
def get_products(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de productos con filtros opcionales.
    
    - **skip**: Número de registros a saltar (para paginación)
    - **limit**: Número máximo de registros a devolver
    - **category**: Filtrar por categoría
    """
    # Este es un ejemplo, en una implementación real
    # consultarías la base de datos
    
    products = [
        {
            "id": 1,
            "name": "Martillo",
            "description": "Martillo de carpintero",
            "price": 15.99,
            "category": "herramientas manuales"
        },
        {
            "id": 2,
            "name": "Taladro",
            "description": "Taladro eléctrico",
            "price": 89.99,
            "category": "herramientas eléctricas"
        }
    ]
    
    if category:
        products = [p for p in products if p["category"] == category]
    
    # Aplicar paginación
    products = products[skip:skip + limit]
    
    return {
        "total": len(products),
        "items": products
    }


@router.get("/{product_id}")
def get_product(product_id: int):
    """
    Obtiene un producto por su ID.
    
    - **product_id**: ID del producto a obtener
    """
    # Simulamos la búsqueda de un producto
    products = {
        1: {
            "id": 1,
            "name": "Martillo",
            "description": "Martillo de carpintero profesional",
            "price": 15.99,
            "category": "herramientas manuales",
            "stock": 25,
            "rating": 4.5
        },
        2: {
            "id": 2,
            "name": "Taladro",
            "description": "Taladro eléctrico inalámbrico 18V",
            "price": 89.99,
            "category": "herramientas eléctricas",
            "stock": 10,
            "rating": 4.8
        }
    }
    
    if product_id not in products:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    return products[product_id]


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_product(
    product: dict,
    # En una aplicación real, usarías autenticación
    # current_user = Depends(get_current_active_user)
):
    """
    Crea un nuevo producto.
    
    - **product**: Datos del producto a crear
    """
    # Este es un ejemplo, en una implementación real
    # guardarías en la base de datos
    
    return {
        "id": 3,
        **product,
        "created": True
    }