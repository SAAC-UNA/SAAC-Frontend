/**
 * Constantes para tamaños y configuración de componentes
 * Define clases reutilizables para componentes del sistema
 */

/**
 * Tamaños estandarizados para botones de acción en tablas
 * Estos botones siguen el patrón: botón cuadrado de 32px con icono de 16px
 */
export const TABLE_ACTION_BUTTON = {
  /** Clase para el tamaño del botón (32px × 32px) */
  button: 'size-table-action-button p-table-action',
  
  /** Clase para el tamaño del icono dentro del botón (16px × 16px) */
  icon: 'size-table-action-icon',
} as const;

/**
 * Dimensiones del item de navegación del sidebar.
 * Botón, ícono y texto son independientes entre sí.
 * Cambiar el tamaño del texto (TYPOGRAPHY.sidebarItem) NO afecta la altura del botón.
 */
export const SIDEBAR_ITEM = {
  /** Altura fija del botón + padding horizontal (no se ve afectado por font-size) */
  button: 'h-sidebar-item px-sidebar-item',

  /** Tamaño del ícono (cuadrado 20px) */
  icon: 'size-sidebar-icon',

  /** Tipografía del label — usar junto con TYPOGRAPHY.sidebarItem */
  label: 'flex-1 truncate',
} as const;

/**
 * Tamaños estandarizados para botones del header de la aplicación
 * Botón cuadrado de 32px con icono de 20px (más grande que los de tabla)
 */
export const APP_HEADER_BUTTON = {
  /** Clase para el tamaño del botón (32px × 32px) */
  button: 'size-header-button p-header-action',
  
  /** Clase para el tamaño del icono dentro del botón (20px × 20px) */
  icon: 'size-header-icon',
} as const;
