"""
Rutas para la gestión de herramientas.
"""
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from ..crud import admin as crud_admin
from ..database.database import get_db
from ..dependencies import get_current_admin_user, get_current_user
from ..models.tool import Tool as ToolModel, ToolCondition
from ..models.user import User
from ..schemas.admin import AdminLogCreate
from ..schemas.tool import Tool, ToolCreate, ToolDetail, ToolUpdate

router = APIRouter()


@router.get("/search", response_model=List[Tool])
def search_tools(
    q: Optional[str] = Query(None, description="Búsqueda general en nombre, descripción, marca y modelo"),
    category: Optional[str] = Query(None, description="Filtrar por categoría"),
    brand: Optional[str] = Query(None, description="Filtrar por marca"),
    condition: Optional[ToolCondition] = Query(None, description="Filtrar por condición"),
    min_price: Optional[float] = Query(None, description="Precio mínimo"),
    max_price: Optional[float] = Query(None, description="Precio máximo"),
    available: Optional[bool] = Query(None, description="Filtrar por disponibilidad"),
    skip: int = Query(0, description="Número de registros a saltar"),
    limit: int = Query(100, description="Número máximo de registros"),
    db: Session = Depends(get_db)
):
    """
    Busca y filtra herramientas con múltiples criterios.
    """
    query = db.query(ToolModel)
    
    # Búsqueda general por texto
    if q:
        search_filter = or_(
            ToolModel.name.ilike(f"%{q}%"),
            ToolModel.description.ilike(f"%{q}%"),
            ToolModel.brand.ilike(f"%{q}%"),
            ToolModel.model.ilike(f"%{q}%")
        )
        query = query.filter(search_filter)
    
    # Filtros específicos
    if category:
        query = query.filter(ToolModel.category.ilike(f"%{category}%"))
    
    if brand:
        query = query.filter(ToolModel.brand.ilike(f"%{brand}%"))
    
    if condition:
        query = query.filter(ToolModel.condition == condition)
    
    if min_price is not None:
        query = query.filter(ToolModel.daily_price >= min_price)
    
    if max_price is not None:
        query = query.filter(ToolModel.daily_price <= max_price)
    
    if available is not None:
        query = query.filter(ToolModel.is_available == available)
    
    # Aplicar paginación
    tools = query.offset(skip).limit(limit).all()
    return tools


@router.get("/filters/options", response_model=dict)
def get_filter_options(db: Session = Depends(get_db)):
    """
    Obtiene las opciones disponibles para los filtros.
    """
    # Obtener categorías únicas
    categories = db.query(ToolModel.category).distinct().filter(ToolModel.category.isnot(None)).all()
    categories = [cat[0] for cat in categories if cat[0]]
    
    # Obtener marcas únicas
    brands = db.query(ToolModel.brand).distinct().filter(ToolModel.brand.isnot(None)).all()
    brands = [brand[0] for brand in brands if brand[0]]
    
    # Obtener rango de precios
    price_stats = db.query(
        func.min(ToolModel.daily_price),
        func.max(ToolModel.daily_price)
    ).first()
    
    min_price = price_stats[0] if price_stats[0] else 0
    max_price = price_stats[1] if price_stats[1] else 0
    
    return {
        "categories": sorted(categories),
        "brands": sorted(brands),
        "conditions": [condition.value for condition in ToolCondition],
        "price_range": {
            "min": float(min_price),
            "max": float(max_price)
        }
    }


@router.get("/", response_model=List[Tool])
def get_tools(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    available: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de herramientas con filtros opcionales.
    
    - **skip**: Número de registros a saltar (para paginación)
    - **limit**: Número máximo de registros a devolver
    - **category_id**: Filtrar por ID de categoría
    - **available**: Filtrar por disponibilidad
    """
    query = db.query(ToolModel)
    
    # Aplicar filtros si están especificados
    if category_id is not None:
        query = query.filter(ToolModel.category_id == category_id)
    
    if available is not None:
        query = query.filter(ToolModel.is_available == available)
    
    # Aplicar paginación
    tools = query.offset(skip).limit(limit).all()
    return tools


@router.post("/", response_model=Tool, status_code=status.HTTP_201_CREATED)
def create_tool(
    tool: ToolCreate,
    request: Request,
    current_admin: Annotated[User, Depends(get_current_admin_user)],
    db: Session = Depends(get_db)
):
    """
    Crea una nueva herramienta.
    
    - **tool**: Datos de la herramienta a crear
    """
    db_tool = ToolModel(**tool.dict())
    
    db.add(db_tool)
    db.commit()
    db.refresh(db_tool)
    
    log = AdminLogCreate(
        action="CREATE",
        resource="tool",
        resource_id=str(db_tool.id),
        details=f"Created tool: {tool.name}"
    )
    client_ip = request.client.host if request.client else None
    crud_admin.create_admin_log(
        db=db,
        log=log,
        admin_id=current_admin.id,
        admin_username=current_admin.username,
        ip_address=client_ip
    )
    
    return db_tool


@router.get("/{tool_id}", response_model=ToolDetail)
def get_tool(tool_id: int, db: Session = Depends(get_db)):
    """
    Obtiene una herramienta por su ID.
    
    - **tool_id**: ID de la herramienta a obtener
    """
    tool = db.query(ToolModel).filter(ToolModel.id == tool_id).first()
    if tool is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Herramienta no encontrada"
        )
    return tool


@router.put("/{tool_id}", response_model=Tool)
def update_tool(
    tool_id: int,
    tool_update: ToolUpdate,
    request: Request,
    current_admin: Annotated[User, Depends(get_current_admin_user)],
    db: Session = Depends(get_db)
):
    """
    Actualiza una herramienta existente.
    
    - **tool_id**: ID de la herramienta a actualizar
    - **tool_update**: Datos a actualizar en la herramienta
    """
    db_tool = db.query(ToolModel).filter(ToolModel.id == tool_id).first()
    if db_tool is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Herramienta no encontrada"
        )
    
    update_data = tool_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_tool, key, value)
    
    db.commit()
    db.refresh(db_tool)
    
    log = AdminLogCreate(
        action="UPDATE",
        resource="tool",
        resource_id=str(tool_id),
        details=f"Updated tool: {db_tool.name}"
    )
    client_ip = request.client.host if request.client else None
    crud_admin.create_admin_log(
        db=db,
        log=log,
        admin_id=current_admin.id,
        admin_username=current_admin.username,
        ip_address=client_ip
    )
    
    return db_tool


@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tool(
    tool_id: int,
    request: Request,
    current_admin: Annotated[User, Depends(get_current_admin_user)],
    db: Session = Depends(get_db)
):
    """
    Elimina una herramienta.
    
    - **tool_id**: ID de la herramienta a eliminar
    """
    db_tool = db.query(ToolModel).filter(ToolModel.id == tool_id).first()
    if db_tool is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Herramienta no encontrada"
        )
    
    tool_name = db_tool.name
    db.delete(db_tool)
    db.commit()
    
    log = AdminLogCreate(
        action="DELETE",
        resource="tool",
        resource_id=str(tool_id),
        details=f"Deleted tool: {tool_name}"
    )
    client_ip = request.client.host if request.client else None
    crud_admin.create_admin_log(
        db=db,
        log=log,
        admin_id=current_admin.id,
        admin_username=current_admin.username,
        ip_address=client_ip
    )
    
    return None