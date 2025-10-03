# Estándar de Colores para Iconos del Sistema

## Objetivo
Establecer un sistema de colores consistente para los iconos de acciones comunes en toda la aplicación, facilitando el reconocimiento visual y mejorando la experiencia de usuario.

## Iconos CON Colores Estándar

Los siguientes iconos tienen colores predefinidos que se aplican automáticamente cuando se usan en tablas, listas y otros contextos de acciones:

| Icono | Nombre | Color Estándar | Variable CSS | Uso Principal |
|-------|--------|---------------|--------------|---------------|
| 👁️ | `view` | Azul UNA | `--icon-view` | Ver/visualizar detalles |
| ✏️ | `edit` | Amarillo/Warning | `--icon-edit` | Editar elementos |
| 🗑️ | `delete` | Rojo/Error | `--icon-delete` | Eliminar elementos |
| ➕ | `add` | Verde/Success | `--icon-add` | Agregar nuevos elementos |
| 💾 | `save` | Verde/Success | `--icon-save` | Guardar cambios |
| ℹ️ | `informationCircle` | Azul/Info | `--icon-info` | Mostrar información |
| ✅ | `checkCircle` | Verde/Success | `--icon-check` | Confirmar/Éxito |
| ⚠️ | `alert` | Amarillo/Warning | `--icon-alert` | Alertas/Advertencias |
| 🔍 | `search` | Gris | `--icon-search` | Buscar/Filtrar |
| 🔄 | `refresh` | Azul/Info | `--icon-refresh` | Actualizar/Recargar |
| 🔍 | `expand` | Gris UNA | `--icon-expand` | Expandir contenido |
| 📉 | `collapse` | Gris UNA | `--icon-collapse` | Colapsar contenido |
| ↩️ | `back` | Gris UNA | `--icon-back` | Regresar/Volver |
| ❌ | `close` | Gris UNA | `--icon-close` | Cerrar ventanas/modales |
| ⏳ | `loading` | Azul/Info | `--icon-loading` | Indicador de carga |
| ❌ | `cancel` | Gris | `--icon-cancel` | Cancelar acciones |

### Ejemplo de Uso
```tsx
// El color se aplica automáticamente
<SystemIcons name="view" size="medium" />
<SystemIcons name="delete" size="small" />

// Se puede sobrescribir si es necesario
<SystemIcons name="edit" size="medium" color="var(--color-azul-una)" />
```

## Iconos SIN Colores Estándar

Los siguientes iconos **NO tienen colores predefinidos** porque se usan en el sidebar de navegación, donde deben cambiar de color dinámicamente según su estado (activo/inactivo):

| Icono | Nombre | Color | Razón |
|-------|--------|-------|-------|
| 🏠 | `home` | `currentColor` | Navegación sidebar |
| 🛡️ | `shield` | `currentColor` | Navegación sidebar |
| 📦 | `box-archive` | `currentColor` | Navegación sidebar |
| ⚙️ | `nut` | `currentColor` | Navegación sidebar (configuración) |
| ➕ | `create` | `currentColor` | Navegación sidebar (crear estructura) |
| ✏️ | `editElement` | `currentColor` | Navegación sidebar (editar elemento) |
| 🗑️ | `trashCan` | `currentColor` | Navegación sidebar (eliminar elemento) |
| 🚪 | `logout` | `currentColor` | Navegación sidebar |

### Comportamiento Dinámico en Sidebar

El componente `SidebarItem.tsx` controla los colores de estos iconos:

```tsx
// Estado inactivo: blanco
isActive ? "text-rojo-una-2" : "text-blanco-una"

// Estado activo: rojo UNA
```

Por esta razón, estos iconos **NO deben tener colores por defecto** - deben usar `currentColor` para heredar el color del texto del elemento padre.

### Ejemplo en Sidebar
```tsx
// En Navigation.ts
{
  name: 'Mantenimiento',
  icon: 'system-icon:nut',  // Usará currentColor
  path: '/maintenance'
}

// El SidebarItem aplicará text-blanco-una o text-rojo-una-2
```

## Criterios para Determinar Color Estándar

Un icono debe tener color estándar si:
- ✅ Se usa en tablas de datos (CRUD)
- ✅ Se usa en listas de elementos
- ✅ Representa una acción específica y consistente
- ✅ NO cambia de color según el estado de la UI

Un icono NO debe tener color estándar si:
- ❌ Se usa en el sidebar de navegación
- ❌ Cambia de color según el estado (activo/inactivo)
- ❌ Su color depende del contexto padre
- ❌ Es parte de un sistema de navegación

## Modificación del Sistema

### Para Agregar un Nuevo Icono con Color Estándar

1. Agregar la variable CSS en `index.css`:
```css
@theme {
  /* ... otras variables ... */
  --icon-nuevo: var(--color-deseado);
}
```

2. Actualizar el icono en `SystemIcons.tsx`:
```tsx
nuevoIcono: ({ className, size, color = 'var(--icon-nuevo)' }: IconProps) => (
  <svg fill={color}>
    {/* ... */}
  </svg>
)
```

3. Actualizar esta documentación con el nuevo icono.

### Para Agregar un Icono del Sidebar

```tsx
// NO agregar color por defecto
iconoSidebar: ({ className, size, color }: IconProps) => (
  <svg fill={color || "currentColor"}>
    {/* ... */}
  </svg>
)
```

## Valores de las Variables CSS

Las variables de colores de iconos están definidas en `src/index.css`:

```css
@theme {
  /* Colores estándar para iconos de acciones (NO aplicar a iconos del sidebar) */
  --icon-view: var(--color-azul-una);     /* Ver/Visualizar - azul UNA */
  --icon-edit: var(--color-warning);      /* Editar - amarillo/warning */
  --icon-delete: var(--color-error);      /* Eliminar - rojo/error */
  --icon-add: var(--color-success);       /* Agregar - verde/success */
  --icon-info: var(--color-info);         /* Información - azul info */
  --icon-cancel: var(--color-gris-una);   /* Cancelar - gris UNA */
  --icon-save: var(--color-success);      /* Guardar - verde/success */
  --icon-check: var(--color-success);     /* Confirmar/Éxito - verde/success */
  --icon-alert: var(--color-warning);     /* Alerta/Advertencia - amarillo/warning */
  --icon-search: var(--color-gris-una);   /* Buscar - gris UNA */
  --icon-refresh: var(--color-info);      /* Actualizar - azul info */
  --icon-expand: var(--color-gris-una);   /* Expandir - gris UNA */
  --icon-collapse: var(--color-gris-una); /* Colapsar - gris UNA */
  --icon-back: var(--color-gris-una);     /* Regresar - gris UNA */
  --icon-close: var(--color-gris-una);    /* Cerrar - gris UNA */
  --icon-loading: var(--color-info);      /* Cargando - azul info */
}
```

Que a su vez hacen referencia a:
```css
@theme {
  /* Colores base */
  --color-azul-una: #003d7a;
  --color-gris-una: #666666;
  
  /* Colores de estado */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}
```

## Mantenimiento

Fecha de última actualización: 3 de octubre de 2025

Responsable: Equipo de Frontend SAAC

**Nota importante**: Siempre verificar si un nuevo icono se usa en el sidebar antes de asignarle un color estándar.
