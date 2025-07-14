"""
Rutas para la gestión de herramientas.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..crud import tool as crud_tool
from ..database.database import get_db
from ..dependencies import get_current_active_user
from ..models.tool import Tool as ToolModel
from ..models.user import User
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


@router.post("/", response_model=Tool, status_code=status.HTTP_201_CREATED)
def create_tool(
    tool: ToolCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    print("hola")
    print(tool)
    """
    Crea una nueva herramienta.
    
    - **tool**: Datos de la herramienta a crear
    """
    # Aquí normalmente validarías que la categoría existe
    # y que el usuario actual tiene permisos
    
    # Obtener el ID del propietario del usuario actual
    owner_id = current_user.id
    
    return crud_tool.create_tool(db, tool, owner_id)


@router.get("/user/{user_id}", response_model=List[Tool])
def get_user_tools(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las herramientas de un usuario específico.
    
    - **user_id**: ID del propietario de la herramienta
    - **skip**: Número de registros a saltar (para paginación)
    - **limit**: Número máximo de registros a devolver
    """
    return crud_tool.get_tools_by_user(db, user_id, skip, limit)


@router.put("/{tool_id}", response_model=Tool)
def update_tool(
    tool_id: int,
    tool_update: ToolUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Actualiza una herramienta existente.
    
    - **tool_id**: ID de la herramienta a actualizar
    - **tool_update**: Datos a actualizar en la herramienta
    """
    # Primero verifica si la herramienta existe
    db_tool = db.query(ToolModel).filter(ToolModel.id == tool_id).first()
    if db_tool is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Herramienta no encontrada"
        )
    
    # Verifica si el usuario actual es el propietario de la herramienta
    if db_tool.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado para actualizar esta herramienta"
        )
    
    return crud_tool.update_tool(db, tool_id, tool_update)


@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tool(
    tool_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Elimina una herramienta.
    
    - **tool_id**: ID de la herramienta a eliminar
    """
    # Primero verifica si la herramienta existe
    db_tool = db.query(ToolModel).filter(ToolModel.id == tool_id).first()
    if db_tool is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Herramienta no encontrada"
        )
    
    # Verifica si el usuario actual es el propietario de la herramienta
    if db_tool.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado para eliminar esta herramienta"
        )
    
    db.delete(db_tool)
    db.commit()
    return None