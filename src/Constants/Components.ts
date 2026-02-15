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
 * Tamaños estandarizados para botones del header de la aplicación
 * Botón cuadrado de 32px con icono de 20px (más grande que los de tabla)
 */
export const APP_HEADER_BUTTON = {
  /** Clase para el tamaño del botón (32px × 32px) */
  button: 'size-header-button p-header-action',
  
  /** Clase para el tamaño del icono dentro del botón (20px × 20px) */
  icon: 'size-header-icon',
} as const;
