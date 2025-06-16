"""
Script para crear la tabla de calificaciones en la base de datos.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database.database import SessionLocal, engine


def create_ratings_table():
    """Crea la tabla de calificaciones."""
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        tool_id INTEGER NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating FLOAT NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(tool_id, user_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_ratings_tool_id ON ratings(tool_id);
    CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
    CREATE INDEX IF NOT EXISTS idx_ratings_rating ON ratings(rating);
    """
    
    db = SessionLocal()
    try:
        db.execute(text(create_table_sql))
        db.commit()
        print("Tabla 'ratings' creada exitosamente!")
    except Exception as e:
        print(f"Error al crear la tabla 'ratings': {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_ratings_table()
