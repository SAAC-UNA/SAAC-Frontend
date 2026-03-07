/**
 * Límites de truncado de texto en tablas
 * 
 * Centraliza los valores para mantener consistencia visual
 * en todas las tablas del sistema.
 * 
 * Uso:
 *   truncateText(value, TABLE_TRUNCATE.name)
 *   truncateText(value, TABLE_TRUNCATE.email)
 *   truncateText(value, TABLE_TRUNCATE.text)
 */

export const TABLE_TRUNCATE = {
  /** Nombres, roles, títulos cortos — 20 caracteres */
  name: 20,
  /** Correos electrónicos — 25 caracteres */
  email: 25,
  /** Texto largo: motivos, detalles, descripciones — 40 caracteres */
  text: 20,
} as const;
