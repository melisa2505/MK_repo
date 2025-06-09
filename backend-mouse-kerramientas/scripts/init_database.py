import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config.database import engine, Base
from app.config.mongodb import connect_to_mongo
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

async def init_database():
    try:
        # Crear tablas SQL usando SQLAlchemy
        Base.metadata.create_all(bind=engine)
        print("Tablas PostgreSQL creadas correctamente")
        
        # Conectar a MongoDB
        await connect_to_mongo()
        print("MongoDB conectado correctamente")
        
        print("Inicialización completa - PostgreSQL + MongoDB")
        
    except Exception as error:
        print(f"Error inicializando base de datos: {error}")

if __name__ == "__main__":
    asyncio.run(init_database())
