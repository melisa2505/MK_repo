"""
Script para agregar herramientas de ejemplo para probar el sistema de búsqueda y filtros.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database.database import SessionLocal, engine
from app.models.tool import Tool, ToolCondition
from app.models.user import User

def create_sample_tools():
    db = SessionLocal()
    try:
        # Datos de herramientas de ejemplo
        sample_tools = [
            {
                "name": "Taladro Inalámbrico DeWalt",
                "description": "Taladro inalámbrico de 20V con batería de litio, ideal para trabajos de construcción y bricolaje",
                "brand": "DeWalt",
                "model": "DCD777C2",
                "category": "Herramientas eléctricas",
                "daily_price": 25.50,
                "condition": ToolCondition.EXCELLENT,
                "is_available": True,
                "image_url": "https://example.com/taladro-dewalt.jpg"
            },
            {
                "name": "Sierra Circular Bosch",
                "description": "Sierra circular profesional de 7-1/4 pulgadas, perfecta para cortes precisos en madera",
                "brand": "Bosch",
                "model": "CS10",
                "category": "Herramientas eléctricas",
                "daily_price": 35.00,
                "condition": ToolCondition.GOOD,
                "is_available": True,
                "image_url": "https://example.com/sierra-bosch.jpg"
            },
            {
                "name": "Martillo de Carpintero",
                "description": "Martillo tradicional con mango de madera, perfecto para trabajos de carpintería",
                "brand": "Stanley",
                "model": "16oz",
                "category": "Herramientas manuales",
                "daily_price": 8.00,
                "condition": ToolCondition.NEW,
                "is_available": True,
                "image_url": "https://example.com/martillo-stanley.jpg"
            },
            {
                "name": "Lijadora Orbital Makita",
                "description": "Lijadora orbital eléctrica para acabados finos en superficies de madera",
                "brand": "Makita",
                "model": "BO5041K",
                "category": "Herramientas eléctricas",
                "daily_price": 22.75,
                "condition": ToolCondition.EXCELLENT,
                "is_available": False,
                "image_url": "https://example.com/lijadora-makita.jpg"
            },
            {
                "name": "Juego de Destornilladores",
                "description": "Set completo de destornilladores de diferentes tamaños y tipos",
                "brand": "Craftsman",
                "model": "CMHT65040",
                "category": "Herramientas manuales",
                "daily_price": 12.00,
                "condition": ToolCondition.GOOD,
                "is_available": True,
                "image_url": "https://example.com/destornilladores-craftsman.jpg"
            },
            {
                "name": "Soldadora MIG Milwaukee",
                "description": "Soldadora MIG profesional para trabajos de metal pesado",
                "brand": "Milwaukee",
                "model": "2739-20",
                "category": "Herramientas de soldadura",
                "daily_price": 45.00,
                "condition": ToolCondition.FAIR,
                "is_available": True,
                "image_url": "https://example.com/soldadora-milwaukee.jpg"
            },
            {
                "name": "Nivel Láser Hilti",
                "description": "Nivel láser de líneas cruzadas para mediciones precisas en construcción",
                "brand": "Hilti",
                "model": "PM 2-LG",
                "category": "Instrumentos de medición",
                "daily_price": 38.50,
                "condition": ToolCondition.NEW,
                "is_available": True,
                "image_url": "https://example.com/nivel-hilti.jpg"
            },
            {
                "name": "Compresor de Aire Porter-Cable",
                "description": "Compresor de aire portátil para herramientas neumáticas",
                "brand": "Porter-Cable",
                "model": "C2002",
                "category": "Compresores",
                "daily_price": 32.00,
                "condition": ToolCondition.GOOD,
                "is_available": True,
                "image_url": "https://example.com/compresor-porter.jpg"
            },
            {
                "name": "Llave Inglesa Adjustable",
                "description": "Llave inglesa ajustable de 12 pulgadas, herramienta básica para fontanería",
                "brand": "Ridgid",
                "model": "31015",
                "category": "Herramientas manuales",
                "daily_price": 6.50,
                "condition": ToolCondition.EXCELLENT,
                "is_available": True,
                "image_url": "https://example.com/llave-ridgid.jpg"
            },
            {
                "name": "Router Festool",
                "description": "Router de precisión para trabajos finos de carpintería y ebanistería",
                "brand": "Festool",
                "model": "OF 1400 EBQ",
                "category": "Herramientas eléctricas",
                "daily_price": 42.25,
                "condition": ToolCondition.POOR,
                "is_available": False,
                "image_url": "https://example.com/router-festool.jpg"
            },
            {
                "name": "Cortadora de Azulejos DEWALT",
                "description": "Cortadora eléctrica para azulejos y cerámicos con disco de diamante",
                "brand": "DeWalt",
                "model": "D24000S",
                "category": "Herramientas especializadas",
                "daily_price": 55.00,
                "condition": ToolCondition.GOOD,
                "is_available": True,
                "image_url": "https://example.com/cortadora-dewalt.jpg"
            },
            {
                "name": "Multímetro Digital",
                "description": "Multímetro digital profesional para mediciones eléctricas",
                "brand": "Fluke",
                "model": "117",
                "category": "Instrumentos de medición",
                "daily_price": 18.75,
                "condition": ToolCondition.EXCELLENT,
                "is_available": True,
                "image_url": "https://example.com/multimetro-fluke.jpg"
            }
        ]

        # Crear las herramientas
        for tool_data in sample_tools:
            tool = Tool(**tool_data)
            db.add(tool)

        db.commit()
        print(f"Se crearon {len(sample_tools)} herramientas de ejemplo exitosamente!")

    except Exception as e:
        print(f"Error al crear herramientas de ejemplo: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_tools()
