# Módulo de Búsqueda y Filtros de Herramientas

Este módulo implementa un sistema completo de búsqueda y filtros para herramientas en Mouse Kerramentas, utilizando FastAPI en el backend y React Native con TypeScript en el frontend.

## Características Implementadas

### Backend (FastAPI)

#### Nuevos Endpoints

1. **`GET /api/tools/search`** - Búsqueda avanzada con filtros múltiples
   - Parámetros de consulta:
     - `q`: Búsqueda general en nombre, descripción, marca y modelo
     - `category`: Filtrar por categoría
     - `brand`: Filtrar por marca
     - `condition`: Filtrar por condición (new, excellent, good, fair, poor)
     - `min_price`: Precio mínimo
     - `max_price`: Precio máximo
     - `available`: Filtrar por disponibilidad
     - `skip`: Paginación - registros a saltar
     - `limit`: Paginación - máximo de registros

2. **`GET /api/tools/filters/options`** - Obtiene opciones disponibles para filtros
   - Retorna:
     - `categories`: Lista de categorías únicas
     - `brands`: Lista de marcas únicas
     - `conditions`: Lista de condiciones disponibles
     - `price_range`: Rango de precios (min/max)

#### Funcionalidades del Backend

- **Búsqueda por texto**: Busca en nombre, descripción, marca y modelo usando ILIKE
- **Filtros múltiples**: Permite combinar múltiples criterios de filtrado
- **Paginación**: Soporte para paginación con skip/limit
- **Opciones dinámicas**: Obtiene filtros disponibles desde la base de datos

### Frontend (React Native + TypeScript)

#### Nuevos Componentes

1. **`SearchAndFilters.tsx`** - Componente principal de búsqueda y filtros
   - Barra de búsqueda con texto libre
   - Modal con filtros avanzados
   - Indicador de filtros activos
   - Botón para limpiar filtros

2. **`ToolCard.tsx`** - Tarjeta para mostrar herramientas
   - Imagen de la herramienta (con placeholder)
   - Información básica (nombre, marca, modelo, categoría)
   - Badge de condición con colores
   - Precio por día
   - Indicador de disponibilidad

3. **`QuickFilters.tsx`** - Filtros rápidos horizontales
   - Filtros predefinidos más comunes
   - Scroll horizontal

#### Nuevas Pantallas

1. **`/search/index.tsx`** - Pantalla principal de búsqueda
   - Lista de herramientas con scroll infinito
   - Integración con filtros
   - Estados de carga y vacío
   - Pull-to-refresh

#### Tipos y Interfaces

1. **`types/tool.ts`** - Definiciones de TypeScript
   - Interface `Tool`
   - Enum `ToolCondition`
   - Interface `SearchFilters`
   - Interface `FilterOptions`
   - Interface `SearchParams`

#### Hooks Personalizados

1. **`hooks/useToolSearch.ts`** - Hook para gestión de búsqueda
   - Estado de herramientas y carga
   - Funciones de búsqueda y refresh
   - Manejo de errores

#### Servicios API

- **Búsqueda de herramientas**: `toolsService.searchTools()`
- **Opciones de filtros**: `toolsService.getFilterOptions()`
- **Obtener herramientas**: `toolsService.getTools()`

### Integración con la Pantalla Principal

- **Barra de búsqueda mejorada** con botón de búsqueda
- **Enlace a búsqueda avanzada** con filtros
- **Herramientas destacadas** cargadas dinámicamente
- **Navegación fluida** entre pantallas

## Paleta de Colores Utilizada

El módulo mantiene consistencia con el tema existente:

- **Primary**: `#da362a` (Rojo intenso como Mickey)
- **Secondary**: `#FFF8E1` (Amarillo claro)
- **Accent**: `#FF6B00` (Naranja)
- **Background**: `#FFFFFF` (Blanco)
- **Text**: `#000000` (Negro)
- **Text Secondary**: `#666666` (Gris)
- **Border**: `#E8E8E8` (Gris claro)
- **Input Background**: `#F9F9F9` (Gris muy claro)

## Flujo de Uso

1. **Búsqueda Rápida**:
   - Usuario escribe en la barra de búsqueda
   - Presiona "Buscar" o Enter
   - Navega a pantalla de resultados

2. **Búsqueda Avanzada**:
   - Usuario presiona "Búsqueda avanzada con filtros"
   - Accede a filtros completos
   - Aplica múltiples criterios
   - Ve resultados filtrados

3. **Filtros Rápidos**:
   - Usuario toca filtros predefinidos
   - Sistema aplica filtro inmediatamente
   - Navega a resultados

4. **Gestión de Filtros**:
   - Indicador visual de filtros activos
   - Opción de limpiar todos los filtros
   - Persistencia durante la sesión

## Consideraciones Técnicas

### Rendimiento
- **Paginación** para manejar grandes conjuntos de datos
- **Debounce** en búsqueda por texto (recomendado implementar)
- **Caché** de opciones de filtros
- **Lazy loading** de imágenes

### UX/UI
- **Estados de carga** claros
- **Mensajes de error** informativos
- **Animaciones suaves** en transiciones
- **Indicadores visuales** de estado

### Escalabilidad
- **Estructura modular** fácil de extender
- **Tipos TypeScript** bien definidos
- **Separación de responsabilidades**
- **Reutilización de componentes**

## Instalación y Configuración

### Backend
```bash
# Las rutas ya están integradas en el router principal
# No requiere configuración adicional
```

### Frontend
```bash
# Instalar dependencia del picker
npm install @react-native-picker/picker

# Los componentes están listos para usar
```

## Próximas Mejoras Sugeridas

1. **Búsqueda por voz** usando expo-speech
2. **Geolocalización** para herramientas cercanas
3. **Favoritos** y listas personalizadas
4. **Historial de búsquedas**
5. **Sugerencias automáticas**
6. **Ordenamiento** de resultados
7. **Vista de mapa** para herramientas
8. **Filtros por rango de fechas**
9. **Comparación** de herramientas
10. **Notificaciones** de nuevas herramientas

## Estructura de Archivos

```
backend-mouse-kerramientas/
├── app/routes/tools.py          # Endpoints de búsqueda actualizados

frontend-mouse-kerramientas/
├── types/tool.ts                # Tipos TypeScript
├── hooks/useToolSearch.ts       # Hook de búsqueda
├── components/
│   ├── SearchAndFilters.tsx     # Filtros principales
│   ├── ToolCard.tsx            # Tarjeta de herramienta
│   └── QuickFilters.tsx        # Filtros rápidos
├── app/
│   ├── (tabs)/index.tsx        # Pantalla principal actualizada
│   └── search/index.tsx        # Pantalla de búsqueda
└── services/api.ts             # Servicios API actualizados
```

Este módulo proporciona una experiencia de búsqueda completa y profesional, manteniendo la consistencia visual y funcional con el resto de la aplicación.
