# Módulo de Calificaciones de Herramientas

Este módulo implementa un sistema completo de calificaciones para herramientas en Mouse Kerramentas, permitiendo a los usuarios calificar herramientas que han alquilado.

## Características Implementadas

### Backend (FastAPI)

#### Nuevo Modelo de Datos

**`Rating`** - Modelo para calificaciones
- `id`: Identificador único
- `tool_id`: ID de la herramienta calificada
- `user_id`: ID del usuario que califica
- `rating`: Calificación de 1.0 a 5.0 estrellas
- `comment`: Comentario opcional (máximo 500 caracteres)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

#### Nuevos Endpoints

1. **`GET /api/ratings/tool/{tool_id}`** - Obtiene calificaciones de una herramienta
   - Incluye información del usuario (username, full_name)
   - Soporte para paginación (skip/limit)

2. **`GET /api/ratings/tool/{tool_id}/stats`** - Estadísticas de calificación
   - Promedio de calificación
   - Total de calificaciones
   - Distribución por número de estrellas

3. **`POST /api/ratings/`** - Crear nueva calificación
   - Requiere autenticación
   - Validación: un usuario solo puede calificar una herramienta una vez
   - Validación: calificación entre 1.0 y 5.0

4. **`PUT /api/ratings/{rating_id}`** - Actualizar calificación existente
   - Solo el propietario puede modificar su calificación

5. **`DELETE /api/ratings/{rating_id}`** - Eliminar calificación
   - Solo el propietario puede eliminar su calificación

6. **`GET /api/ratings/user/me`** - Calificaciones del usuario actual
   - Lista las calificaciones realizadas por el usuario autenticado

#### Funcionalidades del Backend

- **Restricción única**: Un usuario solo puede calificar una herramienta una vez
- **Validación de rangos**: Calificaciones entre 1.0 y 5.0 estrellas
- **Cálculo automático**: Estadísticas dinámicas de calificaciones
- **Autorización**: Solo el creador puede modificar/eliminar sus calificaciones
- **Relaciones**: Integración con modelos User y Tool existentes

### Frontend (React Native + TypeScript)

#### Nuevos Componentes

1. **`StarRating.tsx`** - Componente de estrellas interactivas
   - Modos: solo lectura o interactivo
   - Tamaños: small, medium, large
   - Muestra valor numérico opcional

2. **`RatingItem.tsx`** - Elemento individual de calificación
   - Muestra usuario, fecha, estrellas y comentario
   - Formato de fecha localizado

3. **`RatingForm.tsx`** - Formulario para crear calificaciones
   - Selección de estrellas interactiva
   - Campo de comentario opcional
   - Validación y envío

4. **`RatingStatsComponent.tsx`** - Estadísticas visuales
   - Promedio de calificación
   - Distribución en barras
   - Total de calificaciones

#### Nueva Pantalla

**`/ratings/[toolId].tsx`** - Pantalla de calificaciones de herramienta
- Lista de todas las calificaciones
- Estadísticas resumidas
- Botón para agregar nueva calificación
- Modal con formulario de calificación

#### Tipos TypeScript

```typescript
interface Rating {
  id: number;
  tool_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at?: string;
}

interface RatingStats {
  total_ratings: number;
  average_rating: number;
  rating_distribution: {
    1: number; 2: number; 3: number; 4: number; 5: number;
  };
}
```

#### Servicios API

- **`ratingsService.getToolRatings()`** - Obtener calificaciones
- **`ratingsService.getToolRatingStats()`** - Obtener estadísticas
- **`ratingsService.createRating()`** - Crear calificación
- **`ratingsService.updateRating()`** - Actualizar calificación
- **`ratingsService.deleteRating()`** - Eliminar calificación
- **`ratingsService.getMyRatings()`** - Mis calificaciones

### Integración

#### ToolCard Actualizado
- Muestra promedio de estrellas
- Indica número total de calificaciones
- Carga asíncrona de estadísticas

#### Navegación
- Enlace desde detalles de herramienta a calificaciones
- Parámetros: toolId y toolName

## Flujo de Uso

1. **Ver Calificaciones**:
   - Usuario navega a detalles de herramienta
   - Ve promedio de estrellas en tarjeta
   - Puede acceder a calificaciones completas

2. **Crear Calificación**:
   - Usuario presiona "Agregar Calificación"
   - Selecciona número de estrellas (1-5)
   - Escribe comentario opcional
   - Envía calificación

3. **Gestión de Calificaciones**:
   - Usuario puede ver sus propias calificaciones
   - Puede editar calificaciones existentes
   - Puede eliminar sus calificaciones

4. **Estadísticas**:
   - Cálculo automático de promedios
   - Distribución visual por estrellas
   - Actualización en tiempo real

## Base de Datos

### Tabla `ratings`
```sql
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating FLOAT NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(tool_id, user_id)
);
```

### Índices
- `idx_ratings_tool_id` - Para consultas por herramienta
- `idx_ratings_user_id` - Para consultas por usuario
- `idx_ratings_rating` - Para estadísticas y ordenamiento

## Validaciones y Reglas de Negocio

### Backend
- ✅ Calificación entre 1.0 y 5.0
- ✅ Un usuario por herramienta
- ✅ Comentario máximo 500 caracteres
- ✅ Solo propietario puede modificar/eliminar
- ✅ Requiere autenticación para crear/modificar

### Frontend
- ✅ Validación de estrellas seleccionadas
- ✅ Contador de caracteres en comentarios
- ✅ Estados de carga y error
- ✅ Confirmaciones de acción
- ✅ Manejo de errores de API

## Consideraciones de UX

### Visual
- **Estrellas doradas** para calificaciones
- **Colores consistentes** con tema Mickey Mouse
- **Animaciones suaves** en interacciones
- **Estados claros** (carga, vacío, error)

### Interacción
- **Toque fácil** en estrellas grandes
- **Feedback inmediato** en selección
- **Navegación intuitiva** entre pantallas
- **Confirmaciones** para acciones destructivas

### Rendimiento
- **Carga asíncrona** de estadísticas
- **Paginación** de calificaciones
- **Caché local** de datos frecuentes
- **Manejo de errores** robusto

## Estructura de Archivos

```
backend-mouse-kerramientas/
├── app/
│   ├── models/rating.py              # Modelo de calificaciones
│   ├── schemas/rating.py             # Esquemas Pydantic
│   ├── crud/rating.py                # Operaciones CRUD
│   ├── routes/ratings.py             # Endpoints API
│   └── main.py                       # Router integrado
└── scripts/
    └── create_ratings_table.py       # Script de BD

frontend-mouse-kerramientas/
├── types/rating.ts                   # Tipos TypeScript
├── components/
│   ├── StarRating.tsx               # Estrellas interactivas
│   ├── RatingItem.tsx               # Elemento de calificación
│   ├── RatingForm.tsx               # Formulario
│   ├── RatingStatsComponent.tsx     # Estadísticas
│   └── ToolCard.tsx                 # Actualizado con rating
├── app/ratings/[toolId].tsx         # Pantalla de calificaciones
└── services/api.ts                  # Servicios actualizados
```

## Instalación

### Backend
```bash
# Crear tabla de calificaciones
cd backend-mouse-kerramientas
python scripts/create_ratings_table.py
```

### Frontend
```bash
# Las dependencias ya están incluidas
# No se requieren instalaciones adicionales
```

## Próximas Mejoras

1. **Filtrado avanzado** de calificaciones
2. **Ordenamiento** por fecha/calificación
3. **Respuestas** a calificaciones
4. **Imágenes** en calificaciones
5. **Moderación** de contenido
6. **Notificaciones** de nuevas calificaciones
7. **Análisis** de sentimientos en comentarios
8. **Exportación** de reportes
9. **API de métricas** para analytics
10. **Integración** con sistema de reputación

Este módulo proporciona una experiencia completa de calificaciones, manteniendo la consistencia visual y funcional con el resto de la aplicación Mouse Kerramentas.
