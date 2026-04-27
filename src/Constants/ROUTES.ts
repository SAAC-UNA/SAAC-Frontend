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
  CONTEXT_SELECTOR: "/selector-procesos",

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
  ACCREDITATION: "/acreditacion",
  ACCREDITATION_CYCLES: "/ciclos-acreditacion",
  ACCREDITATION_PROCESSES: "/procesos-acreditacion",

  // ---------------------------------------------------------------------------
  // Entregables
  // ---------------------------------------------------------------------------
  EVIDENCE_ASSIGN: "/entregables/asignar",
  EVIDENCE_MY: "/entregables/mias",
  EVIDENCE_SEARCH: "/entregables/buscar",

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
  REPORTS: "/gestion-enlaces",
  REPORTS_PUBLIC: "/informe-publico",
  SINAES_ADMIN: "/informes-acreditacion",
} as const;
