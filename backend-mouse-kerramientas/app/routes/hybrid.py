from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.config.database import get_db
from app.config.mongodb import get_mongo_db
from app.models.sql.models import Herramienta
from app.models.nosql.models import Resena
from app.schemas.nosql_schemas import ResenaCreate
from app.services.integration import actualizar_calificacion_herramienta
from typing import List

router = APIRouter()

@router.post("/herramientas/{herramienta_id}/resenas")
async def crear_resena(
    herramienta_id: int,
    resena_data: ResenaCreate,
    db: Session = Depends(get_db)
):
    """
    Crear una nueva reseña para una herramienta (guarda en MongoDB y actualiza SQL)
    """
    try:
        # Verificar que la herramienta existe en SQL
        herramienta = db.query(Herramienta).filter(Herramienta.id == herramienta_id).first()
        if not herramienta:
            raise HTTPException(status_code=404, detail="Herramienta no encontrada")
        
        # Obtener la base de datos MongoDB
        db_mongo = get_mongo_db()
        
        # Crear la reseña en MongoDB
        resena_dict = resena_data.dict()
        resena_dict["herramienta_sql_id"] = herramienta_id
        resena_dict["fecha"] = datetime.now()
        
        result = await db_mongo.resenas.insert_one(resena_dict)
        
        # Actualizar la calificación promedio en SQL
        stats = await actualizar_calificacion_herramienta(herramienta_id)
        
        return {
            "message": "Reseña creada exitosamente",
            "resena_id": str(result.inserted_id),
            "nueva_calificacion_promedio": stats["promedio"],
            "total_resenas": stats["total_calificaciones"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando reseña: {str(e)}")

@router.get("/herramientas/{herramienta_id}/resenas")
async def obtener_resenas(herramienta_id: int):
    """
    Obtener todas las reseñas de una herramienta desde MongoDB
    """
    try:
        db_mongo = get_mongo_db()
        
        resenas_cursor = db_mongo.resenas.find({"herramienta_sql_id": herramienta_id})
        resenas = await resenas_cursor.to_list(None)
        
        # Convertir ObjectId a string para serialización
        for resena in resenas:
            resena["_id"] = str(resena["_id"])
        
        return {
            "herramienta_id": herramienta_id,
            "total_resenas": len(resenas),
            "resenas": resenas
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo reseñas: {str(e)}")

@router.get("/herramientas/{herramienta_id}/estadisticas")
async def obtener_estadisticas_herramienta(
    herramienta_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas completas de una herramienta (SQL + MongoDB)
    """
    try:
        # Datos básicos desde SQL
        herramienta = db.query(Herramienta).filter(Herramienta.id == herramienta_id).first()
        if not herramienta:
            raise HTTPException(status_code=404, detail="Herramienta no encontrada")
        
        # Estadísticas de reseñas desde MongoDB
        db_mongo = get_mongo_db()
        resenas_cursor = db_mongo.resenas.find({"herramienta_sql_id": herramienta_id})
        resenas = await resenas_cursor.to_list(None)
        
        # Calcular distribución de calificaciones
        distribucion = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for resena in resenas:
            distribucion[resena["calificacion"]] += 1
        
        return {
            "herramienta": {
                "id": herramienta.id,
                "nombre": herramienta.nombre,
                "calificacion_promedio": float(herramienta.calificacion_promedio),
                "total_resenas": herramienta.cantidad_resenas,
                "precio_diario": float(herramienta.precio_diario),
                "stock_disponible": herramienta.stock_disponible
            },
            "estadisticas_resenas": {
                "distribucion_calificaciones": distribucion,
                "total_resenas": len(resenas),
                "promedio_calculado": sum(r["calificacion"] for r in resenas) / len(resenas) if resenas else 0
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo estadísticas: {str(e)}")
