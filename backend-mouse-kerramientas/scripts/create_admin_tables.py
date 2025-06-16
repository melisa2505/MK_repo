import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import engine, Base
from app.models import User, Tool, AdminLog, BackupConfig

def create_admin_tables():
    print("Creando tablas de administración...")
    Base.metadata.create_all(bind=engine)
    print("Tablas creadas exitosamente!")

if __name__ == "__main__":
    create_admin_tables()
