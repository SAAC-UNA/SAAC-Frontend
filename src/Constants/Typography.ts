/**
 * Sistema de tipografía centralizado para el Design System SAAC-UNA
 * Define tamaños específicos por tipo de elemento usando variables CSS de index.css
 * 
 * Las variables base están definidas en @theme en index.css
 * Las clases de utilidad están en @layer utilities en index.css
 */

export const TYPOGRAPHY = {
  // ===== TEXTO HEADER =====
  header: 'size-header',                     // 8px - Texto principal en headers y títulos de sección

  // ===== TEXTO GENERAL =====
  body: 'size-body',                         // 14px - Texto general/contenido
  
  // ===== TÍTULOS DE PÁGINAS =====
  pageTitle: 'size-page-title',              // 24px - Título principal de cada página
  pageSubtitle: 'size-page-subtitle',        // 16px - Subtítulo/descripción de página
  
  // ===== BOTONES =====
  button: 'size-button',                     // 14px - Todos los botones del sistema

  // ===== TOOLTIP =====
  tooltip: 'size-tooltip',                   // 14px - Texto de tooltips
  
  // ===== SIDEBAR =====
  sidebarItem: 'size-sidebar',               // 14px - Items de navegación en sidebar
  
  // ===== FORMULARIOS Y TABLAS =====
  // Todos estos elementos comparten el mismo tamaño base (14px)
  form: {
    input: 'size-form-input',                // 14px - Inputs, selects, textareas
    label: 'size-form-label',                // 14px - Labels de formularios
    helper: 'size-form-helper',              // 12px - Textos de ayuda y validación
  },
  
  table: {
    header: 'size-table-header',             // 12px - Headers de tabla (uppercase)
    cell: 'size-table-cell',                 // 14px - Contenido de celdas
    caption: 'size-table-caption',           // 14px - Título de tabla (DataTable)
    helper: 'size-table-helper',             // 12px - Textos de ayuda debajo de tablas
  },
  
  // ===== COMPONENTES DE UI =====
  alert: {
    title: 'size-alert-title',               // 14px - Título de alertas
    message: 'size-alert-message',           // 14px - Mensaje de alertas
  },
  
  emptyState: {
    title: 'size-empty-title',               // 18px - Título de estados vacíos
    description: 'size-empty-desc',          // 14px - Descripción de estados vacíos
    titleCompact: 'size-empty-title-compact',     // 16px - Título compacto
    descriptionCompact: 'size-empty-desc-compact', // 12px - Descripción compacta
  },
  
  modal: {
    title: 'size-modal-title',               // 20px - Título de modales
    subtitle: 'size-modal-subtitle',         // 12.8px - Subtítulo de modales
    subtitleBig: 'size-modal-subtitle-big',  // 14px - Subtítulo destacado de modales
    body: 'size-modal-body',                 // 14px - Contenido de modales
  },
  
  // ===== BADGES Y CHIPS =====
  badge: 'size-badge',                       // 12px - Badges, chips, pills
  badgeSm: 'size-badge-sm',                  // 10px - Badges pequeños (tarjetas, espacios reducidos)
  
  // ===== PAGINACIÓN =====
  pagination: 'size-pagination',             // 14px - Números y texto de paginación

  // ===== TOASTS =====
  toast: {
    title: 'size-toast',                     // 12px - Título del toast
    message: 'size-toast-message',           // 11px - Mensaje secundario del toast
  },

} as const;

/**
 * Type exports para TypeScript
 */
export type TypographyKey = keyof typeof TYPOGRAPHY;
