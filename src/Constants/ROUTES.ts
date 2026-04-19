/**
 * ROUTES - Fuente única de verdad para todas las rutas del frontend.
 *
 * Convención adoptada:
 *   /[modulo]                → listado general
 *   /[modulo]/nuevo          → crear
 *   /[modulo]/mias           → vista personal del usuario autenticado
 *   /[modulo]/detalle        → detalle (ID viaja en location.state, NO en la URL)
 *   /[modulo]/editar         → editar  (ID viaja en location.state, NO en la URL)
 *
 * Los IDs NUNCA aparecen en la URL. Se pasan como navigate(ruta, { state: { id } })
 * y se leen en el componente destino con useLocation().state.id.
 * Si el state no tiene ID (p.ej. refresh), el componente redirige al listado.
 *
 * Seguridad: las rutas son solo apariencia visual.
 * La autorización real ocurre en Laravel (middleware + policies).
 * El frontend valida con ProtectedRoute para evitar renderizado innecesario,
 * pero NUNCA como capa de seguridad definitiva.
 */

// ---------------------------------------------------------------------------
// Rutas públicas
// ---------------------------------------------------------------------------
export const ROUTES = {
  LOGIN: "/login",
  SESSION_EXPIRED: "/session-expired",
  PUBLIC_FOLDER: "/p/:token",

  // ---------------------------------------------------------------------------
  // Inicio
  // ---------------------------------------------------------------------------
  HOME: "/",

  // ---------------------------------------------------------------------------
  // Administración
  // ---------------------------------------------------------------------------
  ROLES: "/roles",
  ROLES_NEW: "/roles/nuevo",
  ROLES_EDIT: "/roles/editar",

  USERS: "/usuarios",
  USERS_EDIT: "/usuarios/editar",

  AUDIT_LOG: "/bitacora",

  // ---------------------------------------------------------------------------
  // Estructura
  // ---------------------------------------------------------------------------
  STRUCTURE: "/estructura",
  STRUCTURE_MODELS: "/estructura/modelos",

  // ---------------------------------------------------------------------------
  // Acreditación
  // ---------------------------------------------------------------------------
  ACCREDITATION_CYCLES: "/ciclos-acreditacion",
  ACCREDITATION_PROCESSES: "/procesos-acreditacion",

  // ---------------------------------------------------------------------------
  // Entregables (Evidencias)
  // ---------------------------------------------------------------------------
  EVIDENCE_ASSIGN: "/evidencias/asignar",
  EVIDENCE_MY: "/evidencias/mias",
  EVIDENCE_SEARCH: "/evidencias/buscar",

  // ---------------------------------------------------------------------------
  // Solicitudes de Ampliación
  // ---------------------------------------------------------------------------
  EXTENSION_REQUESTS_MY: "/solicitudes-ampliacion/mias",
  EXTENSION_REQUESTS_MANAGE: "/solicitudes-ampliacion/gestionar",

  // ---------------------------------------------------------------------------
  // Compromisos de Mejora
  // ---------------------------------------------------------------------------
  COMMITMENTS: "/compromisos",
  COMMITMENTS_NEW: "/compromisos/nuevo",
  COMMITMENTS_DETAIL: "/compromisos/detalle",
  COMMITMENTS_EDIT: "/compromisos/editar",

  // ---------------------------------------------------------------------------
  // Aprobación de Bloques
  // ---------------------------------------------------------------------------
  BLOCK_APPROVAL: "/aprobacion-bloques",

  // ---------------------------------------------------------------------------
  // Informes
  // ---------------------------------------------------------------------------
  REPORTS: "/informes",
} as const;

// ---------------------------------------------------------------------------
// Rutas antiguas — solo para redirects de compatibilidad en App.tsx.
// NO usar estas rutas en navegación nueva.
// ---------------------------------------------------------------------------
export const LEGACY_ROUTES = {
  ROLES_LIST: "/roles/listar",
  ROLES_CREATE: "/roles/crear",
  ROLES_EDIT_OLD: "/roles/editar/:id",

  USERS_LIST: "/usuarios/listar",
  USERS_EDIT_OLD: "/usuarios/editar/:id",

  STRUCTURE_LIST: "/estructura/listar",
  STRUCTURE_MODELS_OLD: "/estructura/modelos",

  EVIDENCE_MY_OLD: "/mis-evidencias-asignadas",
  EVIDENCE_SEARCH_OLD: "/evidencias/busqueda-avanzada",

  EXTENSION_REQUESTS_MY_OLD: "/solicitudes-ampliacion/mis-solicitudes",

  COMMITMENTS_LIST: "/compromisos/listar",
  COMMITMENTS_CREATE: "/compromisos/crear",
  COMMITMENTS_VIEW_OLD: "/compromisos/ver/:id",
  COMMITMENTS_EDIT_OLD: "/compromisos/editar/:id",

  ACCREDITATION_PROCESSES_LIST: "/procesos-acreditacion/listar",

  REPORTS_OLD: "/gestion-informes",
} as const;
