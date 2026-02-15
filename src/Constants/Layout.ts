/**
 * Constantes para clases de layout reutilizables
 * Estas clases están definidas en index.css
 */
export const LAYOUT = {
  /** 
   * Layout para formularios con botones al fondo.
   * - Cuando hay poco contenido: empuja botones al fondo (min-height: 60vh)
   * - Cuando hay mucho contenido: mantiene espaciado razonable
   */
  FORM_CONTAINER: 'content-layout-form',
  
  /**
   * Layout para formularios que necesitan más altura vertical (min-height: 70vh)
   */
  FORM_CONTAINER_TALL: 'content-layout-form-tall',
  
  /**
   * Aplicar a contenido que debe crecer y empujar botones al fondo
   * Usar dentro de FORM_CONTAINER o FORM_CONTAINER_TALL
   */
  FLEX_GROW: 'content-flex-grow',
} as const;
