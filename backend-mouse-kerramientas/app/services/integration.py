from app.config.database import SessionLocal
from app.config.mongodb import get_mongo_db
from app.models.sql.models import Herramienta

async def actualizar_calificacion_herramienta(herramienta_id: int):
    try:
        db_mongo = get_mongo_db()
        db_sql = SessionLocal()
        
        # Obtener todas las reseñas de la herramienta desde MongoDB
        resenas_cursor = db_mongo.resenas.find({"herramienta_sql_id": herramienta_id})
        resenas = await resenas_cursor.to_list(None)
        
        total_calificaciones = len(resenas)
        suma_calificaciones = sum(resena["calificacion"] for resena in resenas)
        
        promedio = suma_calificaciones / total_calificaciones if total_calificaciones > 0 else 0
        
        # Actualizar la herramienta en SQL
        herramienta = db_sql.query(Herramienta).filter(Herramienta.id == herramienta_id).first()
        if herramienta:
            herramienta.calificacion_promedio = round(promedio, 2)
            herramienta.cantidad_resenas = total_calificaciones
            db_sql.commit()
        
        db_sql.close()
        
        return {
            "promedio": round(promedio, 2),
            "total_calificaciones": total_calificaciones
        }
        
    except Exception as error:
        print(f"Error actualizando calificación: {error}")
        raise error
