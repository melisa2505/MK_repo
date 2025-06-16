# Panel de Administración - Mouse Kerramientas

Este panel de administración proporciona todas las funcionalidades necesarias para gestionar el sistema de manera segura y eficiente.

## Características Implementadas

### 1. Panel de administración accesible solo para admins

- **Verificación de permisos**: Solo usuarios con `is_superuser = true` pueden acceder
- **Protección de rutas**: Middleware de verificación en todas las rutas de admin
- **Redirección automática**: Los usuarios no admin son redirigidos al login

### 2. CRUD de herramientas del sistema

#### Backend (FastAPI):
- `POST /api/tools/` - Crear nueva herramienta
- `GET /api/tools/{tool_id}` - Obtener herramienta por ID
- `PUT /api/tools/{tool_id}` - Actualizar herramienta
- `DELETE /api/tools/{tool_id}` - Eliminar herramienta
- `GET /api/tools/` - Listar herramientas con filtros

#### Frontend (React Native):
- Pantalla de gestión de herramientas (`/(admin)/tools.tsx`)
- Modal para crear/editar herramientas
- Lista con acciones de editar/eliminar
- Formulario completo con validación

### 3. Logs de actividad de administradores

#### Backend:
- Modelo `AdminLog` para registrar todas las acciones
- Logging automático en todas las operaciones CRUD
- Información registrada:
  - Acción realizada (CREATE, UPDATE, DELETE, BACKUP, RESTORE)
  - Recurso afectado
  - ID del recurso
  - Detalles adicionales
  - IP del administrador
  - Timestamp

#### Frontend:
- Pantalla de logs (`/(admin)/logs.tsx`)
- Visualización con códigos de color por tipo de acción
- Filtrado y actualización en tiempo real

### 4. Backup y restore de configuraciones

#### Backend:
- `POST /api/admin/backup/create` - Crear backup del sistema
- `GET /api/admin/backup/list` - Listar backups disponibles
- `POST /api/admin/backup/restore/{filename}` - Restaurar desde backup
- CRUD completo para configuraciones de backup

#### Frontend:
- Pantalla de backup (`/(admin)/backup.tsx`)
- Gestión de configuraciones de backup
- Creación y restauración de backups
- Visualización de archivos de backup con tamaños y fechas

## Estructura de Archivos

### Backend
```
app/
├── models/
│   ├── admin_log.py        # Modelo para logs de actividad
│   └── backup_config.py    # Modelo para configuraciones de backup
├── crud/
│   └── admin.py           # Operaciones CRUD para administración
├── schemas/
│   └── admin.py           # Schemas de Pydantic para admin
├── routes/
│   └── admin.py           # Rutas del panel de administración
└── dependencies.py        # Dependency para verificar admin
```

### Frontend
```
app/
└── (admin)/
    ├── _layout.tsx        # Layout del panel de admin
    ├── index.tsx          # Dashboard principal
    ├── tools.tsx          # Gestión de herramientas
    ├── logs.tsx           # Logs de actividad
    └── backup.tsx         # Backup y configuraciones
```

## Endpoints de la API

### Dashboard
- `GET /api/admin/dashboard` - Estadísticas generales del sistema

### Logs
- `GET /api/admin/logs` - Obtener logs de actividad
- `POST /api/admin/logs` - Crear nuevo log

### Configuraciones de Backup
- `GET /api/admin/backup-configs` - Listar configuraciones
- `POST /api/admin/backup-configs` - Crear configuración
- `PUT /api/admin/backup-configs/{id}` - Actualizar configuración
- `DELETE /api/admin/backup-configs/{id}` - Eliminar configuración

### Backups
- `POST /api/admin/backup/create` - Crear backup
- `GET /api/admin/backup/list` - Listar backups
- `POST /api/admin/backup/restore/{filename}` - Restaurar backup

## Acceso al Panel

1. **Desde la aplicación móvil**:
   - Los usuarios administradores verán una opción "Panel de Administración" en su perfil
   - El acceso está protegido por verificación de `is_superuser`

2. **Navegación**:
   - Dashboard principal con estadísticas
   - Menú lateral para acceder a cada sección
   - Breadcrumbs para navegación fácil

## Seguridad

- **Autenticación JWT**: Todas las rutas requieren token válido
- **Autorización**: Verificación de permisos de administrador en cada endpoint
- **Logging**: Todas las acciones quedan registradas con IP y timestamp
- **Validación**: Schemas de Pydantic para validar entrada de datos

## Instalación y Configuración

1. **Crear las tablas**:
   ```bash
   python scripts/create_admin_tables.py
   ```

2. **Crear usuario administrador**:
   ```python
   # En la base de datos, actualizar un usuario existente:
   UPDATE users SET is_superuser = true WHERE email = 'admin@ejemplo.com';
   ```

3. **Configurar permisos de archivos**:
   ```bash
   mkdir backups
   chmod 755 backups
   ```

## Uso

1. **Acceso**: Los administradores ven la opción en su perfil
2. **Dashboard**: Vista general con estadísticas del sistema
3. **Herramientas**: CRUD completo con interfaz intuitiva
4. **Logs**: Monitoreo de todas las actividades
5. **Backups**: Gestión de respaldos y configuraciones

Este panel proporciona todas las herramientas necesarias para la administración completa del sistema Mouse Kerramientas.
