"""
Rutas para la gestión de herramientas.
"""
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from ..crud import admin as crud_admin
from ..database.database import get_db
from ..dependencies import get_current_admin_user, get_current_user
from ..models.tool import Tool as ToolModel
from ..models.user import User
from ..schemas.admin import AdminLogCreate
from ..schemas.tool import Tool, ToolCreate, ToolDetail, ToolUpdate

router = APIRouter()


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