#!/usr/bin/env python3
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

print("🚀 Iniciando script simple...")

# Test básico de conexión
try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        database='postgres',
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )
    print("✅ Conexión a postgres exitosa")
    conn.close()
except Exception as e:
    print(f"❌ Error: {e}")

print("🏁 Script completado")
