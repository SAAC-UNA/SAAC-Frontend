/**
 * Tamaños de página para tablas
 *
 * Centraliza los valores de paginación para mantener consistencia
 * en todas las tablas del sistema.
 *
 * Uso:
 *   itemsPerPage = TABLE_PAGE_SIZE.standard
 *   itemsPerPage = TABLE_PAGE_SIZE.large
 */

export const TABLE_PAGE_SIZE = {

  /** Tablas estándar de gestión — 5 ítems */
  standard: 7,
} as const;
