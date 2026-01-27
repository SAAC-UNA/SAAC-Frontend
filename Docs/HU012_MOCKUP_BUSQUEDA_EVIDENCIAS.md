# Mockup Funcional: Búsqueda Avanzada de Evidencias

## 📋 Descripción General

Este mockup funcional implementa la interfaz completa para el sistema de búsqueda avanzada de evidencias, permitiendo demostrar al equipo el diseño y flujo de usuario antes de la integración con el backend.

## 🎯 Objetivos del Mockup

- **Visualizar el diseño final**: Mostrar cómo se verá la interfaz con todos los filtros y controles
- **Validar la experiencia de usuario**: Probar el flujo completo de búsqueda y exportación
- **Obtener retroalimentación temprana**: Recopilar feedback del equipo antes de la implementación completa
- **Servir como especificación visual**: Documentar visualmente los requisitos del frontend

## 📂 Archivos Creados

### 1. Tipos TypeScript
**Archivo**: `src/Types/EvidenceSearchTypes.ts`

Define todos los tipos necesarios para:
- Filtros de búsqueda (criterio, responsable, fecha, estado, rol)
- Resultados de evidencias
- Parámetros de ordenamiento y paginación
- Solicitudes y respuestas de exportación

### 2. Componente de Filtro de Fechas
**Archivo**: `src/Components/Ui/DateRangeFilter.tsx`

Componente reutilizable para seleccionar rangos de fechas con:
- Validación automática (fecha inicio no puede ser mayor que fecha fin)
- Botón de limpiar
- Diseño responsive
- Manejo de estados disabled

### 3. Tabla de Resultados
**Archivo**: `src/Pages/Evidence/Components/EvidenceSearchResultsTable.tsx`

Tabla especializada que muestra:
- Información del criterio (nomenclatura y descripción)
- Descripción de la evidencia
- Responsable de publicación
- Fecha de publicación
- Estado con badge de colores
- Cantidad de recursos (archivos y enlaces)
- Acciones (Ver detalles)
- Estado de carga
- Mensaje cuando no hay resultados

### 4. Página Principal
**Archivo**: `src/Pages/Evidence/EvidenceSearchPage.tsx`

Implementación completa del mockup con:

#### Panel de Filtros
- ✅ Búsqueda general por texto
- ✅ Filtro por criterio (dropdown)
- ✅ Filtro por responsable (dropdown)
- ✅ Filtro por estado (dropdown)
- ✅ Filtro por rol (dropdown)
- ✅ Filtro por rango de fechas
- ✅ Botón "Buscar Evidencias"
- ✅ Botón "Limpiar Filtros"
- ✅ Panel colapsable

#### Ordenamiento
- ✅ Ordenar por: Fecha, Criterio, Responsable, Estado
- ✅ Dirección: Ascendente/Descendente

#### Tabla de Resultados
- ✅ Visualización paginada
- ✅ Información completa de cada evidencia
- ✅ Estados visuales (badges de color)
- ✅ Acciones rápidas

#### Paginación
- ✅ Controles Anterior/Siguiente
- ✅ Números de página
- ✅ Indicador de resultados (mostrando X-Y de Z)
- ✅ Puntos suspensivos para muchas páginas

#### Exportación
- ✅ Botón exportar a Excel
- ✅ Botón exportar a PDF
- ✅ Simulación de descarga
- ✅ Mensajes de confirmación

### 5. Datos Mock
**Archivo**: `src/Mocks/EvidenceSearchMockData.ts`

Datos de ejemplo que incluyen:
- 10 evidencias de muestra con datos realistas
- Diferentes estados (publicada, borrador, archivada, rechazada)
- Múltiples responsables
- Variedad de criterios
- Diferentes combinaciones de archivos y enlaces
- Opciones para todos los filtros

### 6. Iconos Adicionales
**Archivo**: `src/Components/Ui/Icons/SystemIcons.tsx`

Se agregaron:
- `chevronLeft`: Para navegación hacia atrás
- `chevronRight`: Para navegación hacia adelante

## 🎨 Características de Diseño

### Colores de Estado
```typescript
- Publicada: Verde (bg-green-100, text-green-800)
- Borrador: Amarillo (bg-yellow-100, text-yellow-800)
- Archivada: Gris (bg-gray-100, text-gray-800)
- Rechazada: Rojo (bg-red-100, text-red-800)
```

### Responsive Design
- Panel de filtros adaptable: 1 columna en móvil, 2 en tablet, 3 en desktop
- Botones apilados en móvil, horizontales en desktop
- Tabla con scroll horizontal en pantallas pequeñas

### Transiciones y Animaciones
- Hover effects en filas de tabla
- Spinner de carga
- Transiciones suaves en botones
- Estados disabled visuales

## 🔧 Funcionalidad Implementada (Mock)

### Filtros
✅ Todos los filtros funcionan localmente con datos mock
✅ Búsqueda por texto en descripción, criterio y responsable
✅ Filtros combinables (AND lógico)
✅ Validación de rangos de fechas
✅ Restricción por rol (simula permisos)

### Ordenamiento
✅ 4 campos de ordenamiento disponibles
✅ Dirección ascendente/descendente
✅ Se aplica después de filtrar

### Paginación
✅ 10 resultados por página
✅ Navegación entre páginas
✅ Indicador de posición actual
✅ Deshabilitación de botones en límites

### Exportación
✅ Simulación de exportación a PDF
✅ Simulación de exportación a Excel
✅ Delay realista (1.5s)
✅ Mensajes de confirmación
✅ Botones deshabilitados durante la exportación

## 🚀 Cómo Usar el Mockup

### Opción 1: Integración Manual
1. Agregar ruta en el router de la aplicación
2. Agregar opción en el menú de navegación
3. Navegar a la ruta configurada

### Opción 2: Prueba Directa
```typescript
import { EvidenceSearchPage } from '@/Pages/Evidence';

// Usar el componente directamente
<EvidenceSearchPage />
```

## 📊 Casos de Uso Demostrados

### Caso 1: Búsqueda Básica
1. Usuario ingresa texto en búsqueda general
2. Click en "Buscar Evidencias"
3. Resultados se filtran y muestran
4. Toast indica cantidad de resultados

### Caso 2: Filtros Múltiples
1. Usuario selecciona criterio específico
2. Usuario selecciona responsable
3. Usuario define rango de fechas
4. Usuario selecciona estado "Publicada"
5. Click en "Buscar Evidencias"
6. Solo evidencias que cumplen TODOS los criterios se muestran

### Caso 3: Sin Resultados
1. Usuario aplica filtros muy restrictivos
2. Click en "Buscar Evidencias"
3. Mensaje "No se encontraron evidencias" se muestra
4. Toast indica "sin coincidencias"

### Caso 4: Exportación
1. Usuario realiza búsqueda
2. Obtiene resultados
3. Click en botón "Excel" o "PDF"
4. Spinner de carga aparece
5. Después de 1.5s, toast de confirmación
6. Simula descarga del archivo

### Caso 5: Ordenamiento
1. Usuario tiene resultados mostrados
2. Cambia ordenamiento a "Criterio - Ascendente"
3. Resultados se reordenan automáticamente

### Caso 6: Paginación
1. Usuario realiza búsqueda amplia
2. Obtiene muchos resultados
3. Ve primera página (10 items)
4. Navega a página 2
5. Ve siguientes 10 items

## 🔄 Próximos Pasos (Integración Real)

### Backend Integration
1. Reemplazar datos mock por llamadas a la API
2. Implementar servicio `EvidenceSearchService`
3. Manejar estados de carga real
4. Implementar manejo de errores

### Exportación Real
1. Integrar con endpoint de exportación del backend
2. Manejar descarga de archivos
3. Agregar indicadores de progreso
4. Implementar caché de exportaciones

### Permisos
1. Integrar con sistema de autenticación
2. Aplicar restricciones según rol real del usuario
3. Ocultar/mostrar filtros según permisos

### Optimizaciones
1. Debounce en búsqueda por texto
2. Lazy loading de opciones de filtros
3. Virtualización de tabla para muchos resultados
4. Caché de búsquedas recientes

## 📝 Notas para el Equipo

### Para Diseñadores
- Los colores están alineados con el sistema de diseño UNA
- Los espaciados siguen las reglas de Tailwind
- Los iconos son consistentes con el resto de la aplicación

### Para Desarrolladores Backend
- Los tipos TypeScript sirven como especificación de la API
- Los filtros esperan formato específico (ver `EvidenceSearchFilters`)
- La paginación sigue el estándar Laravel
- La exportación debe retornar URL de descarga

### Para QA
- Todos los flujos están implementados y probables
- Los estados de error están manejados
- La validación de fechas funciona correctamente
- Los mensajes de toast son informativos

## ✅ Criterios de Aceptación Cumplidos

- ✅ Aplicación de filtros básicos
- ✅ Validación de parámetros de entrada
- ✅ Restricción según rol del usuario (simulado)
- ✅ Ordenamiento de resultados
- ✅ Paginación de resultados
- ✅ Mensaje de "sin coincidencias"
- ✅ Exportación de resultados (simulado)
- ✅ Confirmación de exportación

## 🎓 Aprendizajes y Mejores Prácticas

1. **Componentización**: Cada pieza tiene responsabilidad única
2. **Tipado fuerte**: TypeScript previene errores
3. **Reutilización**: Componentes UI son reutilizables
4. **Mockups útiles**: Datos realistas mejoran la demostración
5. **UX consistente**: Sigue patrones del sistema existente

---

**Fecha de creación**: Enero 2025  
**Versión**: 1.0  
**Estado**: Mockup funcional listo para demostración
