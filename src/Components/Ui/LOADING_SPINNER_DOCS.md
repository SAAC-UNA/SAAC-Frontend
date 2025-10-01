# LoadingSpinner - Componente de Carga Unificado

## Descripción
Componente unificado para mostrar indicadores de carga en toda la aplicación SAAC-UNA. Reemplaza todos los spinners manuales dispersos por el código para garantizar consistencia visual y facilitar el mantenimiento.

## Características

### ✅ Antes de la Unificación
- **Inconsistencia visual**: Diferentes estilos de spinner en cada archivo
- **Colores dispersos**: Rojo UNA, gris, negro, sin consistencia
- **Tamaños inconsistentes**: 8px, 12px, 16px sin estándar
- **Código duplicado**: Mismo HTML de spinner en múltiples archivos
- **Difícil mantenimiento**: Cambios requerían editar múltiples archivos

### ✅ Después de la Unificación
- **Consistencia total**: Un solo componente para todos los casos
- **Paleta de colores estándar**: Primary (Azul UNA), Secondary (Rojo UNA), White, Gray, Current
- **Sistema de tamaños**: XS (12px), SM (16px), MD (24px), LG (32px), XL (48px)
- **Fácil mantenimiento**: Un solo archivo para todos los cambios
- **Mejor accesibilidad**: Atributos ARIA incluidos

## API del Componente

```tsx
interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray' | 'current';
  className?: string;
  thickness?: 'thin' | 'normal' | 'thick';
}
```

## Ejemplos de Uso

### Uso Básico
```tsx
import { LoadingSpinner } from '@/components/Ui/Loading';

// Spinner por defecto (MD, Primary)
<LoadingSpinner />
```

### Configuraciones Comunes

#### Carga de página completa
```tsx
<div className="flex items-center justify-center min-h-screen">
  <div className="text-center">
    <LoadingSpinner size="xl" color="secondary" className="mx-auto mb-4" />
    <p className="text-gray-600">Cargando...</p>
  </div>
</div>
```

#### Carga en tabla/lista
```tsx
<div className="flex items-center justify-center py-12">
  <LoadingSpinner size="lg" color="secondary" />
  <span className="ml-3 text-gray-600">Cargando datos...</span>
</div>
```

#### Carga en botón
```tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
  <LoadingSpinner size="sm" color="current" className="mr-2" />
  Guardando...
</button>
```

#### Fondo oscuro
```tsx
<div className="bg-gray-800 p-4">
  <LoadingSpinner size="md" color="white" />
</div>
```

## Archivos Actualizados

### Componentes UI
- ✅ `Button.tsx` - Spinner en estado loading
- ✅ `DataTable.tsx` - Spinner en carga de datos
- ✅ `Loading.tsx` - Componente principal mejorado

### Páginas Structure
- ✅ `StructureRepository.tsx` - Carga inicial de datos
- ✅ `StructureEditList.tsx` - Carga de lista de elementos
- ✅ `StructureEditForm.tsx` - Carga de formulario de edición
- ✅ `StructureDeletion.tsx` - Carga de datos para eliminación

## Paleta de Colores

| Color | Uso Recomendado | Valor CSS |
|-------|----------------|-----------|
| `primary` | Páginas principales, estados neutros | `border-azul-una` |
| `secondary` | Páginas de gestión, acciones importantes | `border-rojo-una-2` |
| `white` | Fondos oscuros, overlays | `border-white` |
| `gray` | Tablas, estados secundarios | `border-gray-900` |
| `current` | Botones, inherit del contexto | `border-current` |

## Sistema de Tamaños

| Tamaño | Píxeles | Uso Recomendado |
|--------|---------|----------------|
| `xs` | 12px | Iconos pequeños, badges |
| `sm` | 16px | Botones, inputs |
| `md` | 24px | Contenido general (por defecto) |
| `lg` | 32px | Listas, tablas |
| `xl` | 48px | Páginas completas, carga inicial |

## Migración Completada

### Reemplazos Realizados

1. **Button.tsx**
   ```tsx
   // Antes
   <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
   
   // Después
   <LoadingSpinner size="sm" color="current" className="mr-2" />
   ```

2. **DataTable.tsx**
   ```tsx
   // Antes
   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
   
   // Después
   <LoadingSpinner size="lg" color="gray" />
   ```

3. **Structure Pages**
   ```tsx
   // Antes
   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
   
   // Después
   <LoadingSpinner size="xl" color="secondary" className="mx-auto mb-4" />
   ```

## Beneficios Obtenidos

1. **Consistencia Visual**: Todos los spinners usan la misma animación y proporción
2. **Mantenibilidad**: Un solo archivo para cambios globales
3. **Accesibilidad**: Atributos ARIA incluidos automáticamente
4. **Flexibilidad**: Sistema de props para diferentes contextos
5. **Performance**: Código optimizado y sin duplicación
6. **Brand Compliance**: Colores oficiales UNA

## Próximos Pasos

1. **Monitoreo**: Verificar que todos los casos de uso funcionen correctamente
2. **Documentación**: Agregar ejemplos al Storybook si existe
3. **Tests**: Crear tests unitarios para el componente
4. **Extensión**: Agregar más variantes si se necesitan (pulsating, dots, etc.)

---

**Nota**: Este componente reemplaza completamente todos los spinners manuales del proyecto. Si necesitas un spinner, siempre usa este componente en lugar de crear uno nuevo.