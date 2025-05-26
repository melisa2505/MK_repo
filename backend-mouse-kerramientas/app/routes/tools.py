"""
Rutas para la gestión de herramientas.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database.database import get_db
from ..models.tool import Tool as ToolModel
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
def create_tool(tool: ToolCreate, db: Session = Depends(get_db)):
    """
    Crea una nueva herramienta.
    
    - **tool**: Datos de la herramienta a crear
    """
    # Aquí normalmente validarías que la categoría existe
    # y que el usuario actual tiene permisos
    
    # Para este ejemplo, asumimos que el ID del propietario es 1
    # En una implementación real, esto vendría del token JWT
    owner_id = 1
    
    db_tool = ToolModel(
        **tool.dict(),
        owner_id=owner_id
    )
    
    db.add(db_tool)
    db.commit()
    db.refresh(db_tool)
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
    
    # Actualiza solo los campos que no son None en el request
    update_data = tool_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_tool, key, value)
    
    db.commit()
    db.refresh(db_tool)
    return db_tool


@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tool(tool_id: int, db: Session = Depends(get_db)):
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
    
    db.delete(db_tool)
    db.commit()
    return None