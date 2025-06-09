from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

class MongoDBConnection:
    client: AsyncIOMotorClient = None
    database = None

mongo_connection = MongoDBConnection()

async def connect_to_mongo():
    mongo_connection.client = AsyncIOMotorClient(MONGODB_URL)
    mongo_connection.database = mongo_connection.client.mouse_kerramientas_nosql
    print("Conectado a MongoDB")

async def close_mongo_connection():
    mongo_connection.client.close()
    print("Conexión a MongoDB cerrada")

def get_mongo_db():
    return mongo_connection.database
