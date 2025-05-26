#!/usr/bin/env python3
"""
MOUSE KERRAMIENTAS - GENERADOR DE PROYECCIÓN FINANCIERA
========================================================

Este script genera una proyección financiera completa a 4 años
para la aplicación Mouse Kerramientas basada en el análisis
del proyecto presentado.

Autor: Basado en el proyecto de "Biagioli y los mashas"
Fecha: 2025
"""

import os
import sys
import warnings
warnings.filterwarnings('ignore')

# Verificar dependencias
required_packages = ['pandas', 'openpyxl', 'numpy']
missing_packages = []

for package in required_packages:
    try:
        __import__(package)
    except ImportError:
        missing_packages.append(package)

if missing_packages:
    print("❌ Faltan las siguientes dependencias:")
    for package in missing_packages:
        print(f"   - {package}")
    print("\n💡 Instálalas con: pip install " + " ".join(missing_packages))
    sys.exit(1)

# Imports después de verificar dependencias
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import math
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Border, Side, Alignment
from openpyxl.utils.dataframe import dataframe_to_rows
from openpyxl.chart import LineChart, Reference

class MouseKerramientasProjector:
    """
    Generador de proyecciones financieras para Mouse Kerramientas
    """
    def __init__(self):
        # Inversión inicial basada en el documento
        self.initial_investment = 5000  # Desarrollo de la app
        self.marketing_investment = 500  # Marketing inicial 
        self.working_capital = 1000  # Capital de trabajo
        
        # Parámetros de crecimiento (basado en análisis TAM-SAM-SOM)
        self.initial_users = 100
        self.monthly_growth_rates = {
            'year_1': 0.05,  # 5% mensual - adopción gradual
            'year_2': 0.12,  # 12% mensual - aceleración
            'year_3': 0.05,  # 5% mensual - maduración
            'year_4': 0.03,  # 3% mensual - estabilización
        }
        
        # Modelo de ingresos
        self.avg_rental_value = 150  # Ticket promedio por alquiler
        self.commission_rate = 0.10  # 10% de comisión (según documento)
        self.premium_conversion = 0.15  # 15% conversión premium
        self.premium_fee = 40  # Cuota mensual premium
        self.rentals_per_user_month = 5  # Alquileres por usuario/mes
        
        # Factores estacionales del sector construcción
        self.seasonal_factors = {
            1: 0.8, 2: 0.75, 3: 0.9, 4: 1.0, 5: 1.2, 6: 1.3,
            7: 1.3, 8: 1.2, 9: 1.1, 10: 1.0, 11: 0.9, 12: 0.7
        }
        
        # Costos operativos (basado en análisis del documento)
        self.fixed_costs = {
            'developers': 4000,  # 4 desarrolladores × S/1000
            'marketing': 1200,   # Marketing digital
            'aws_hosting': 38,   # Hosting en la nube
            'database': 57,      # Base de datos
            'apis': 15,         # APIs externas
            'licenses': 95,      # Licencias Play Store, etc.
            'legal': 300,        # Asesoría legal
        }
        
        self.variable_cost_rate = 0.05  # 5% de ingresos
    
    def calculate_users_growth(self, months=48):
        """Calcula crecimiento de usuarios con estacionalidad"""
        users = [self.initial_users]
        
        for month in range(1, months + 1):
            # Determinar tasa de crecimiento según año
            if month <= 12:
                growth_rate = self.monthly_growth_rates['year_1']
            elif month <= 24:
                growth_rate = self.monthly_growth_rates['year_2']
            elif month <= 36:
                growth_rate = self.monthly_growth_rates['year_3']
            else:
                growth_rate = self.monthly_growth_rates['year_4']
            
            # Aplicar estacionalidad del sector construcción
            month_in_year = ((month - 1) % 12) + 1
            seasonal_factor = self.seasonal_factors[month_in_year]
            adjusted_growth = growth_rate * seasonal_factor
            
            new_users = users[-1] * (1 + adjusted_growth)
            users.append(int(new_users))
        
        return users[1:]
    
    def calculate_monthly_revenues(self, users_by_month):
        """Calcula ingresos mensuales por todas las fuentes"""
        revenues = []
        
        for month, users in enumerate(users_by_month, 1):
            month_in_year = ((month - 1) % 12) + 1
            seasonal_factor = self.seasonal_factors[month_in_year]
            
            # Ingresos por comisiones de alquiler
            monthly_rentals = users * self.rentals_per_user_month * seasonal_factor
            rental_revenue = monthly_rentals * self.avg_rental_value
            commission_revenue = rental_revenue * self.commission_rate
            
            # Ingresos por membresías premium
            premium_users = int(users * self.premium_conversion)
            premium_revenue = premium_users * self.premium_fee
            
            # No contemplar servicios adicionales en este modelo
            additional_services = 0
            
            total_revenue = commission_revenue + premium_revenue + additional_services
            
            revenues.append({
                'month': month,
                'users': users,
                'premium_users': premium_users,
                'monthly_rentals': int(monthly_rentals),
                'commission_revenue': commission_revenue,
                'premium_revenue': premium_revenue,
                'additional_services': additional_services,
                'total_revenue': total_revenue
            })
        
        return revenues
    
    def calculate_monthly_costs(self, revenues):
        """Calcula costos mensuales fijos y variables"""
        costs = []
        
        for rev_data in revenues:
            month = rev_data['month']
            total_revenue = rev_data['total_revenue']
            
            # Costos fijos mensuales
            fixed_cost_total = sum(self.fixed_costs.values())
            
            # Costos variables (escalan con ingresos)
            variable_costs = total_revenue * self.variable_cost_rate
            
            # Marketing intensivo en primeros 12 meses
            if month <= 12:
                marketing_cost = self.fixed_costs['marketing'] * 1.5
            else:
                marketing_cost = self.fixed_costs['marketing']
            
            total_costs = fixed_cost_total + variable_costs + (marketing_cost - self.fixed_costs['marketing'])
            
            costs.append({
                'month': month,
                'fixed_costs': fixed_cost_total,
                'variable_costs': variable_costs,
                'marketing_costs': marketing_cost,
                'total_costs': total_costs
            })
        
        return costs
    
    def generate_cash_flow(self, months=48):
        """Genera flujo de caja completo"""
        users_growth = self.calculate_users_growth(months)
        revenues = self.calculate_monthly_revenues(users_growth)
        costs = self.calculate_monthly_costs(revenues)
        
        cash_flow = []
        cumulative_cash_flow = -(self.initial_investment + self.marketing_investment + self.working_capital)
        
        for i in range(months):
            rev = revenues[i]
            cost = costs[i]
            
            net_cash_flow = rev['total_revenue'] - cost['total_costs']
            cumulative_cash_flow += net_cash_flow
            
            start_date = datetime(2025, 1, 1)
            current_date = start_date + timedelta(days=30 * i)
            
            cash_flow.append({
                'date': current_date.strftime('%Y-%m'),
                'month': rev['month'],
                'year': math.ceil(rev['month'] / 12),
                'users': rev['users'],
                'premium_users': rev['premium_users'],
                'monthly_rentals': rev['monthly_rentals'],
                'commission_revenue': round(rev['commission_revenue'], 2),
                'premium_revenue': round(rev['premium_revenue'], 2),
                'additional_services': round(rev['additional_services'], 2),
                'total_revenue': round(rev['total_revenue'], 2),
                'fixed_costs': round(cost['fixed_costs'], 2),
                'variable_costs': round(cost['variable_costs'], 2),
                'marketing_costs': round(cost['marketing_costs'], 2),
                'total_costs': round(cost['total_costs'], 2),
                'net_cash_flow': round(net_cash_flow, 2),
                'cumulative_cash_flow': round(cumulative_cash_flow, 2)
            })
        
        return cash_flow
    
    def calculate_financial_metrics(self, cash_flow_data):
        """Calcula VAN, TIR y otros indicadores clave"""
        initial_investment_total = self.initial_investment + self.marketing_investment + self.working_capital
        cash_flows = [-initial_investment_total] + [row['net_cash_flow'] for row in cash_flow_data]
        
        # VAN con tasa de descuento del 12%
        discount_rate = 0.12
        van = sum([cf / (1 + discount_rate) ** i for i, cf in enumerate(cash_flows)])
        
        # TIR usando método de aproximación
        def calculate_npv(rate, flows):
            return sum([cf / (1 + rate) ** i for i, cf in enumerate(flows)])
        
        # Búsqueda de TIR por bisección
        low, high = 0.0, 2.0
        precision = 0.0001
        
        for _ in range(1000):  # Máximo 1000 iteraciones
            mid = (low + high) / 2
            npv = calculate_npv(mid, cash_flows)
            
            if abs(npv) < precision:
                break
                
            if npv > 0:
                low = mid
            else:
                high = mid
        
        tir = mid
        
        # Punto de equilibrio
        breakeven_month = None
        for i, row in enumerate(cash_flow_data):
            if row['cumulative_cash_flow'] > 0:
                breakeven_month = i + 1
                break
        
        # ROI
        total_investment = initial_investment_total
        total_net_cash_flow = sum([row['net_cash_flow'] for row in cash_flow_data])
        roi = (total_net_cash_flow / total_investment) * 100
        
        return {
            'van': round(van, 2),
            'tir': round(tir * 100, 2),
            'breakeven_month': breakeven_month,
            'roi_4_years': round(roi, 2),
            'total_investment': total_investment,
            'total_revenue_4_years': sum([row['total_revenue'] for row in cash_flow_data]),
            'total_costs_4_years': sum([row['total_costs'] for row in cash_flow_data])
        }

def main():
    """Función principal que ejecuta todo el proceso"""
    
    print("🚀 MOUSE KERRAMIENTAS - GENERADOR DE PROYECCIÓN FINANCIERA")
    print("=" * 65)
    print("📱 Aplicación para alquiler de herramientas de construcción")
    print("🎯 Dirigida a MYPES y trabajadores independientes")
    print("📊 Proyección a 4 años (48 meses)")
    print("=" * 65)
    
    try:
        # Generar proyección
        print("\n📈 Generando proyección financiera...")
        projector = MouseKerramientasProjector()
        cash_flow_data = projector.generate_cash_flow(48)
        metrics = projector.calculate_financial_metrics(cash_flow_data)
        
        # Crear DataFrame para análisis
        df = pd.DataFrame(cash_flow_data)
        
        # Mostrar resultados clave
        print("\n✅ RESULTADOS DE LA PROYECCIÓN")
        print("-" * 40)
        print(f"💰 VAN (4 años): S/. {metrics['van']:,.2f}")
        print(f"📈 TIR: {metrics['tir']:.1f}%")
        print(f"🎯 ROI (4 años): {metrics['roi_4_years']:.1f}%")
        print(f"⚖️ Punto de equilibrio: Mes {metrics['breakeven_month']}")
        print(f"💵 Inversión total: S/. {metrics['total_investment']:,.0f}")
        print(f"👥 Usuarios finales: {cash_flow_data[-1]['users']:,.0f}")
        print(f"💸 Ingresos mes 48: S/. {cash_flow_data[-1]['total_revenue']:,.0f}")
        
        # Generar archivo Excel
        print(f"\n📊 Generando archivo Excel...")
        
        filename = f"Mouse_Kerramientas_Proyeccion_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"
        
        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            # Hoja de resumen
            summary_data = {
                'Indicador': ['VAN', 'TIR (%)', 'ROI (%)', 'Punto Equilibrio', 'Inversión Total', 'Usuarios Finales'],
                'Valor': [
                    f"S/. {metrics['van']:,.2f}",
                    f"{metrics['tir']:.1f}%",
                    f"{metrics['roi_4_years']:.1f}%",
                    f"Mes {metrics['breakeven_month']}",
                    f"S/. {metrics['total_investment']:,.0f}",
                    f"{cash_flow_data[-1]['users']:,.0f}"
                ]
            }
            pd.DataFrame(summary_data).to_excel(writer, sheet_name='Resumen', index=False)
            
            # Hoja de flujo de caja completo
            df.to_excel(writer, sheet_name='Flujo_Caja_Detallado', index=False)
            
            # Hoja de resumen anual
            yearly_summary = []
            for year in range(1, 5):
                year_data = df[df['year'] == year]
                if not year_data.empty:
                    yearly_summary.append({
                        'Año': year,
                        'Usuarios_Promedio': int(year_data['users'].mean()),
                        'Ingresos_Totales': year_data['total_revenue'].sum(),
                        'Costos_Totales': year_data['total_costs'].sum(),
                        'Flujo_Neto': year_data['total_revenue'].sum() - year_data['total_costs'].sum(),
                        'Flujo_Acumulado_Final': year_data['cumulative_cash_flow'].iloc[-1]
                    })
            
            pd.DataFrame(yearly_summary).to_excel(writer, sheet_name='Resumen_Anual', index=False)
            
            # Hoja de supuestos
            assumptions_data = {
                'Parámetro': [
                    'Usuarios iniciales',
                    'Crecimiento mensual Año 1',
                    'Crecimiento mensual Año 2', 
                    'Crecimiento mensual Año 3',
                    'Crecimiento mensual Año 4',
                    'Ticket promedio alquiler',
                    'Comisión por alquiler',
                    'Conversión a premium',
                    'Cuota mensual premium',
                    'Alquileres por usuario/mes',
                    'Costos desarrolladores',
                    'Costos marketing',
                    'Costos tecnológicos',
                    'Costos variables'
                ],
                'Valor': [
                    '100 usuarios',
                    '5%',
                    '8%', 
                    '5%',
                    '3%',
                    'S/. 150',
                    '10%',
                    '15%',
                    'S/. 40',
                    '2 alquileres',
                    'S/. 4,800/mes',
                    'S/. 1,600/mes',
                    'S/. 490/mes',
                    '5% de ingresos'
                ],
                'Descripción': [
                    'Base de usuarios al iniciar operaciones',
                    'Adopción gradual del mercado',
                    'Aceleración por reconocimiento de marca',
                    'Maduración del mercado',
                    'Estabilización del crecimiento',
                    'Valor promedio por transacción',
                    'Porcentaje que cobra la plataforma',
                    'Porcentaje que se suscribe a premium',
                    'Precio de suscripción mensual',
                    'Frecuencia promedio de uso',
                    '4 desarrolladores × S/. 1,200',
                    'Marketing digital y publicidad',
                    'AWS + DB + APIs + Licencias',
                    'Costos que escalan con ventas'
                ]
            }
            pd.DataFrame(assumptions_data).to_excel(writer, sheet_name='Supuestos', index=False)
        
        print(f"✅ Archivo generado: {filename}")
        
        # Análisis de sensibilidad rápido
        print(f"\n🔍 ANÁLISIS DE SENSIBILIDAD")
        print("-" * 40)
        
        scenarios = {
            "Conservador": 0.7,
            "Optimista": 1.3
        }
        
        for scenario_name, factor in scenarios.items():
            scenario_projector = MouseKerramientasProjector()
            # Ajustar tasas de crecimiento
            for year in scenario_projector.monthly_growth_rates:
                scenario_projector.monthly_growth_rates[year] *= factor
            
            scenario_cash_flow = scenario_projector.generate_cash_flow(48)
            scenario_metrics = scenario_projector.calculate_financial_metrics(scenario_cash_flow)
            
            print(f"{scenario_name:12}: VAN S/. {scenario_metrics['van']:>10,.0f} | "
                  f"TIR {scenario_metrics['tir']:>5.1f}% | "
                  f"Usuarios {scenario_cash_flow[-1]['users']:>8,.0f}")
        
        # Mostrar evolución trimestral
        print(f"\n📅 EVOLUCIÓN TRIMESTRAL")
        print("-" * 60)
        print("Trimestre   Usuarios    Ingresos    Flujo Neto   Acumulado")
        print("-" * 60)
        
        for quarter in range(1, 17):  # 16 trimestres en 4 años
            quarter_end = quarter * 3 - 1  # Mes final del trimestre
            if quarter_end < len(cash_flow_data):
                data = cash_flow_data[quarter_end]
                print(f"Q{quarter:2d}/Año{data['year']}  {data['users']:>8,.0f}  "
                      f"S/. {data['total_revenue']:>8,.0f}  "
                      f"S/. {data['net_cash_flow']:>9,.0f}  "
                      f"S/. {data['cumulative_cash_flow']:>10,.0f}")
        
        # Recomendaciones basadas en resultados
        print(f"\n💡 RECOMENDACIONES ESTRATÉGICAS")
        print("-" * 50)
        
        if metrics['van'] > 0:
            print("✅ Proyecto VIABLE financieramente")
        else:
            print("❌ Proyecto NO VIABLE - Requiere ajustes")
        
        if metrics['tir'] > 20:
            print("✅ TIR atractiva para inversionistas")
        elif metrics['tir'] > 12:
            print("⚠️ TIR moderada - Evaluar alternativas")
        else:
            print("❌ TIR baja - Revisar modelo de negocio")
        
        if metrics['breakeven_month'] and metrics['breakeven_month'] <= 18:
            print("✅ Punto de equilibrio alcanzable")
        elif metrics['breakeven_month'] and metrics['breakeven_month'] <= 30:
            print("⚠️ Punto de equilibrio tardío")
        else:
            print("❌ Punto de equilibrio muy tardío o inalcanzable")
        
        # Factores críticos de éxito
        print(f"\n🎯 FACTORES CRÍTICOS DE ÉXITO")
        print("-" * 40)
        print("• Velocidad de adopción de usuarios")
        print("• Conversión a membresías premium")
        print("• Control de costos de adquisición")
        print("• Alianzas estratégicas con ferreterías")
        print("• Diferenciación vs. grandes retailers")
        
        # Próximos pasos
        print(f"\n📋 PRÓXIMOS PASOS RECOMENDADOS")
        print("-" * 40)
        print("1. Validar supuestos con investigación de mercado")
        print("2. Desarrollar MVP para testear demanda real")
        print("3. Establecer partnerships con ferreterías")
        print("4. Buscar financiamiento inicial")
        print("5. Implementar métricas de seguimiento")
        
        print(f"\n🎉 Análisis completado exitosamente!")
        print(f"📁 Revisa el archivo: {filename}")
        
        return filename, metrics
        
    except Exception as e:
        print(f"\n❌ Error durante la ejecución: {str(e)}")
        print("💡 Verifica que tengas instaladas las dependencias:")
        print("   pip install pandas openpyxl numpy")
        return None, None

def show_help():
    """Muestra información de ayuda"""
    print("""
🔧 MOUSE KERRAMIENTAS - GENERADOR DE PROYECCIÓN FINANCIERA
========================================================

Este script genera una proyección financiera completa para la aplicación
Mouse Kerramientas basada en el modelo de negocio presentado.

📊 QUÉ GENERA:
• Flujo de caja mensual a 4 años (48 meses)
• Cálculo de VAN, TIR, ROI y punto de equilibrio
• Análisis de escenarios (conservador, base, optimista)
• Archivo Excel con múltiples hojas de análisis

📋 SUPUESTOS PRINCIPALES:
• Modelo de comisiones del 10% sobre alquileres
• Membresías premium del 15% de usuarios
• Crecimiento inicial del 5% mensual
• Estacionalidad del sector construcción

🔧 DEPENDENCIAS REQUERIDAS:
pip install pandas openpyxl numpy

💻 USO:
python main_execution.py

📁 SALIDA:
Mouse_Kerramientas_Proyeccion_YYYYMMDD_HHMM.xlsx

Para más información sobre el proyecto, consulta la documentación adjunta.
    """)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] in ['--help', '-h', 'help']:
        show_help()
    else:
        filename, metrics = main()
        
        if filename and metrics:
            # Intentar abrir el archivo automáticamente
            try:
                import subprocess
                import platform
                
                system = platform.system()
                if system == "Darwin":  # macOS
                    subprocess.call(['open', filename])
                elif system == "Windows":
                    subprocess.call(['start', filename], shell=True)
                elif system == "Linux":
                    subprocess.call(['xdg-open', filename])
                    
                print(f"\n📂 Archivo abierto automáticamente")
                
            except:
                print(f"\n💡 Para abrir el archivo manualmente, busca: {filename}")
        
        print(f"\n" + "="*65)
        print("Análisis desarrollado para Mouse Kerramientas")
        print("Equipo: Biagioli y los mashas - UTEC 2025")
        print("="*65)