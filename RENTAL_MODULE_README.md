# Módulo de Alquiler de Herramientas - Documentación

## Descripción General

Este módulo implementa un sistema completo de alquiler de herramientas que permite a los usuarios solicitar, gestionar y devolver herramientas a través de la aplicación. El sistema incluye funcionalidades tanto del lado del usuario como del administrador.

## Arquitectura del Sistema

### Backend (FastAPI)

#### Modelos de Datos

**RentalStatus (Enum)**
- `PENDING`: Alquiler solicitado, pendiente de entrega
- `ACTIVE`: Alquiler activo, herramienta entregada
- `RETURNED`: Herramienta devuelta correctamente
- `OVERDUE`: Alquiler vencido (pasó la fecha de devolución)
- `CANCELLED`: Alquiler cancelado

**Rental (Modelo Principal)**
- `id`: Identificador único
- `tool_id`: ID de la herramienta alquilada
- `user_id`: ID del usuario que alquila
- `start_date`: Fecha de inicio del alquiler
- `end_date`: Fecha programada de devolución
- `actual_return_date`: Fecha real de devolución (opcional)
- `total_price`: Precio total calculado
- `status`: Estado del alquiler
- `notes`: Notas adicionales
- `created_at` / `updated_at`: Timestamps

#### Schemas (Pydantic)
- `RentalCreate`: Para crear nuevos alquileres
- `RentalUpdate`: Para actualizar alquileres existentes
- `RentalReturn`: Para procesar devoluciones
- `RentalWithDetails`: Vista enriquecida con datos de herramienta y usuario
- `RentalStats`: Estadísticas de alquileres

#### CRUD Operations (`crud/rental.py`)
- `create_rental()`: Crear nuevo alquiler
- `get_rental()`: Obtener alquiler por ID
- `get_rentals_by_user()`: Obtener alquileres de un usuario
- `get_user_active_rentals()`: Obtener alquileres activos de un usuario
- `activate_rental()`: Activar alquiler (marcar como entregado)
- `return_rental()`: Procesar devolución
- `cancel_rental()`: Cancelar alquiler
- `get_rental_stats()`: Obtener estadísticas generales
- `check_overdue_rentals()`: Verificar y marcar alquileres vencidos

#### API Endpoints (`routes/rentals.py`)

**Públicos (Usuario autenticado)**
- `POST /api/rentals/`: Crear solicitud de alquiler
- `GET /api/rentals/user/me`: Obtener mis alquileres
- `GET /api/rentals/user/me/active`: Obtener mis alquileres activos
- `GET /api/rentals/{rental_id}`: Obtener detalles de un alquiler
- `PUT /api/rentals/{rental_id}/return`: Procesar devolución
- `PUT /api/rentals/{rental_id}/cancel`: Cancelar alquiler

**Administrativos (Solo admin)**
- `PUT /api/rentals/{rental_id}/activate`: Activar alquiler (entrega)
- `GET /api/rentals/stats/general`: Estadísticas generales
- `POST /api/rentals/check-overdue`: Verificar alquileres vencidos

### Frontend (React Native + TypeScript)

#### Tipos TypeScript (`types/rental.ts`)
- `RentalStatus`: Enum de estados
- `RentalCreate`: Para crear alquileres
- `RentalReturn`: Para devoluciones
- `Rental`: Modelo base
- `RentalWithDetails`: Con detalles completos
- `RentalStats`: Estadísticas

#### Servicios API (`services/api.ts`)
- `rentalsService`: Objeto con todas las funciones de API
  - `createRental()`
  - `getMyRentals()`
  - `getMyActiveRentals()`
  - `getRental()`
  - `returnRental()`
  - `cancelRental()`
  - `getRentalStats()`

#### Hooks Personalizados (`hooks/useRentals.ts`)
- `useRentals()`: Hook principal para gestión de alquileres
- `useRentalStats()`: Hook para estadísticas

#### Componentes

**RentalCard** (`components/RentalCard.tsx`)
- Muestra información completa de un alquiler
- Botones de acción según el estado
- Indicadores visuales de estado
- Soporte para devolución y cancelación

**RentalForm** (`components/RentalForm.tsx`)
- Formulario para solicitar alquiler
- Selector de fechas
- Cálculo automático de precios
- Validaciones de fechas

**ReturnForm** (`components/ReturnForm.tsx`)
- Formulario para procesar devolución
- Selector de fecha/hora de devolución
- Campo para notas sobre el estado

#### Pantallas

**Mis Alquileres** (`app/rentals/index.tsx`)
- Lista de todos los alquileres del usuario
- Filtros por estado (Todos, Pendientes, Activos, Devueltos)
- Funcionalidades de devolución y cancelación
- Pull-to-refresh

**Detalle de Alquiler** (`app/rentals/[id].tsx`)
- Vista detallada de un alquiler específico
- Información completa de la herramienta
- Cronología del alquiler
- Acciones disponibles según el estado

**Crear Alquiler** (`app/rentals/create/[toolId].tsx`)
- Formulario para solicitar alquiler de una herramienta
- Información de la herramienta seleccionada
- Validación de disponibilidad

## Flujo de Trabajo

### 1. Solicitud de Alquiler
1. Usuario selecciona herramienta disponible
2. Navega a formulario de alquiler
3. Selecciona fechas de inicio y fin
4. Agrega notas opcionales
5. Confirma solicitud
6. Sistema crea alquiler con estado `PENDING`

### 2. Entrega (Admin)
1. Admin revisa solicitud pendiente
2. Confirma disponibilidad física de la herramienta
3. Activa el alquiler (estado `ACTIVE`)
4. Herramienta se marca como no disponible

### 3. Devolución
1. Usuario accede a alquiler activo
2. Inicia proceso de devolución
3. Selecciona fecha/hora de devolución
4. Agrega notas sobre el estado
5. Confirma devolución
6. Sistema actualiza estado a `RETURNED`
7. Herramienta vuelve a estar disponible

### 4. Gestión de Vencidos
1. Sistema verifica automáticamente fechas
2. Marca como `OVERDUE` los alquileres vencidos
3. Admin puede tomar acciones correctivas

## Características de Seguridad

- **Autorización**: Solo el propietario del alquiler puede ver sus detalles
- **Validaciones**: Fechas lógicas, disponibilidad de herramientas
- **Auditoría**: Timestamps de creación y actualización
- **Estados**: Control estricto de transiciones de estado

## Integraciones

### Con Módulo de Herramientas
- Verificación de disponibilidad
- Actualización automática de estado `is_available`
- Obtención de precios y detalles

### Con Módulo de Usuarios
- Autenticación requerida
- Asociación de alquileres por usuario
- Permisos diferenciados (usuario/admin)

### Con Módulo de Calificaciones
- Los usuarios pueden calificar herramientas después de devolverlas
- Integración en la vista de detalles

## Configuración y Despliegue

### Backend
1. Ejecutar migraciones: `python3 scripts/create_rentals_tables.py`
2. Los endpoints se integran automáticamente en `/docs`

### Frontend
1. Instalar dependencia: `npm install @react-native-community/datetimepicker`
2. Las rutas se configuran automáticamente con Expo Router

## Consideraciones de Performance

- **Paginación**: Implementada en listados de alquileres
- **Caché**: Estados se mantienen en hooks personalizados
- **Optimización**: Queries específicas para diferentes vistas

## Próximas Mejoras

1. **Notificaciones Push**: Recordatorios de devolución
2. **Geolocalización**: Ubicación de herramientas
3. **Pagos**: Integración con sistemas de pago
4. **Historial Detallado**: Logs de todas las acciones
5. **Reportes**: Dashboard administrativo con métricas

## Troubleshooting

### Problemas Comunes

**Error "Herramienta no disponible"**
- Verificar que `is_available = true`
- Comprobar que no exista alquiler activo

**Error de permisos**
- Verificar autenticación del usuario
- Confirmar que el alquiler pertenece al usuario

**Fechas inválidas**
- Fecha de fin debe ser posterior a fecha de inicio
- No se pueden seleccionar fechas pasadas

### Logs y Debugging
- Verificar logs del servidor FastAPI
- Usar herramientas de desarrollo del navegador
- Revisar estados en Redux DevTools (si aplicable)
