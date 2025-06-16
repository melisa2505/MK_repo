#!/bin/bash

echo "=== Instalación de Mouse Kerramientas - Arquitectura Híbrida ==="

# Navegar al directorio del backend
cd /home/fabryzzio/Documentos/GitHub/MK_repo/backend-mouse-kerramientas

echo "1. Instalando dependencias de Python..."
pip install -r requirements.txt

echo "2. Verificando variables de entorno..."
if [ ! -f "../.env" ]; then
    echo "⚠️  Archivo .env no encontrado. Por favor configura las variables:"
    echo "   - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD (PostgreSQL)"
    echo "   - MONGODB_URL (MongoDB)"
    echo "   - JWT_SECRET_KEY, JWT_ALGORITHM"
    echo "   - PORT"
else
    echo "✅ Archivo .env encontrado"
fi

echo "3. Verificando conexiones de base de datos..."
echo "   - Asegúrate de que PostgreSQL esté ejecutándose en el puerto configurado"
echo "   - Asegúrate de que MongoDB esté ejecutándose en el puerto configurado"

echo "4. Para inicializar las bases de datos, ejecuta:"
echo "   python scripts/init_database.py"
echo "   python scripts/create_admin_tables.py"

echo "5. Para ejecutar la aplicación en modo desarrollo:"
echo "   python -m app.main"
echo "   O usando uvicorn: uvicorn app.main:app --reload --port 8000"

echo "=== Instalación completada ==="
echo "Arquitectura híbrida lista: PostgreSQL + MongoDB + FastAPI"
