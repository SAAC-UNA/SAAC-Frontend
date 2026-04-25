/**
 * Definiciones centralizadas de títulos y descripciones para módulos del sistema
 *
 * Este archivo centraliza todos los textos de títulos, subtítulos y descripciones
 * que se muestran en las diferentes páginas y componentes del sistema.
 */

export interface ModuleInfo {
  title: string;
  subtitle?: string;
  description: string;
  shortDescription?: string; // Para tooltips o espacios pequeños
}

/**
 * Información de módulos principales del sistema
 */
const MODULE_INFO: Record<string, ModuleInfo> = {
  // Página principal
  home: {
    title: "Panel Principal",
    subtitle: "Sistema SAAC-UNA",
    description:
      "Acceda a todas las funcionalidades de acreditación y autoevaluación de carreras",
    shortDescription: "Panel principal de funcionalidades",
  },

  // Gestión de Roles
  roles: {
    title: "Gestión de Roles",
    subtitle: "Administración de Roles y Permisos",
    description: "Cree, edite y administre los roles y permisos disponibles",
    shortDescription: "Administrar roles y permisos",
  },

  roles_create: {
    title: "Crear Nuevo Rol",
    subtitle: "Definición de Rol y Permisos",
    description:
      "Defina un nuevo rol asignando los permisos correspondientes para los usuarios",
    shortDescription: "Crear nuevo rol con permisos",
  },

  roles_edit: {
    title: "Editar Rol",
    subtitle: "Modificación de Rol y Permisos",
    description:
      "Modifique la información del rol seleccionado y sus permisos asignados",
    shortDescription: "Editar rol existente",
  },

  roles_list: {
    title: "Gestión de Roles",
    subtitle: "Administración de Roles y Permisos",
    description: "Cree, edite y administre los roles y permisos disponibles",
    shortDescription: "Administrar roles y permisos",
  },

  // Gestión de Usuarios
  users: {
    title: "Gestión de Usuarios",
    subtitle: "Administración de Usuarios",
    description:
      "Administre los usuarios, sus roles y permisos de acceso a las funcionalidades",
    shortDescription: "Administrar usuarios",
  },

  users_create: {
    title: "Crear Nuevo Usuario",
    subtitle: "Registro de Usuario",
    description:
      "Registre un nuevo usuario y asigne los roles correspondientes para su acceso",
    shortDescription: "Registrar nuevo usuario",
  },

  users_edit: {
    title: "Editar Usuario",
    subtitle: "Modificación de Usuario",
    description: "Gestione los roles y permisos del usuario",
    shortDescription: "Editar usuario existente",
  },

  users_list: {
    title: "Gestión de Usuarios",
    subtitle: "Administración de Usuarios",
    description:
      "Administre los usuarios, sus roles y permisos de acceso a las funcionalidades",
    shortDescription: "Administrar usuarios",
  },

  // Asignación de Evidencias
  evidence_assignment: {
    title: "Asignación de Entregables",
    subtitle: "Wizard de Asignación",
    description:
      "Asigne entregables específicos a usuarios y roles del sistema de manera guiada",
    shortDescription: "Asignar entregables a usuarios",
  },

  evidence_assignment_wizard: {
    title: "Asignar Entregables",
    subtitle: "Proceso de Asignación Guiado",
    description:
      "Complete el proceso de asignación de entregables siguiendo los pasos",
    shortDescription: "Wizard de asignación de entregables",
  },

  // Mis Evidencias Asignadas
  my_evidence_assignments: {
    title: "Mis Entregables Asignados",
    subtitle: "Entregables Pendientes y Completados",
    description:
      "Visualice y administre los entregables que le han sido asignados",
    shortDescription: "Ver entregables asignados a mí",
  },

  // Subida de Evidencias
  evidence_upload: {
    title: "Subir Entregables",
    subtitle: "Carga de Archivos",
    description:
      "Suba archivos digitales como respaldo de los entregables del proceso de acreditación",
    shortDescription: "Subir archivos de entregables",
  },

  // Búsqueda Avanzada de Evidencias
  evidence_search: {
    title: "Buscar Entregables",
    subtitle: "Criterios y Evidencias",
    description:
      "Busque entregables, criterios y evidencias asociadas al proceso activo",
    shortDescription: "Buscar entregables y evidencias",
  },

  // Solicitudes de Ampliación
  extension_requests_my: {
    title: "Mis Solicitudes de Ampliación",
    subtitle: "Solicitudes de Extensión de Plazo",
    description:
      "Visualice el estado de sus solicitudes de ampliación de plazo para evidencias",
    shortDescription: "Ver mis solicitudes de ampliación",
  },

  extension_requests_manage: {
    title: "Gestión de Solicitudes de Ampliación",
    subtitle: "Revisión y Aprobación de Solicitudes",
    description:
      "Revise y gestione las solicitudes de ampliación de plazo para evidencias",
    shortDescription: "Gestionar solicitudes de ampliación",
  },

  // Gestión de Reportes
  reports: {
    title: "Gestión de Reportes",
    subtitle: "Generación de Reportes",
    description:
      "Genere y administre reportes académicos y administrativos con datos actualizados",
    shortDescription: "Generar y administrar reportes",
  },

  // Gestión de Programas Académicos
  programs: {
    title: "Gestión de Programas",
    subtitle: "Programas Académicos",
    description:
      "Administre los programas académicos y sus configuraciones institucionales",
    shortDescription: "Administrar programas académicos",
  },

  // Gestión de Ciclos Académicos
  cycles: {
    title: "Gestión de Ciclos",
    subtitle: "Ciclos Académicos",
    description:
      "Administre los ciclos académicos, periodos de estudio y calendarios institucionales",
    shortDescription: "Administrar ciclos académicos",
  },

  // Bitácora del Sistema
  auditlog: {
    title: "Bitácora del Sistema",
    subtitle: "Registro de Auditoría",
    description:
      "Consulte todos los registros de acciones realizadas en el sistema",
    shortDescription: "Ver bitácora del sistema",
  },

  auditlog_list: {
    title: "Bitácora del Sistema",
    subtitle: "Consulta de Registros",
    description:
      "Visualice y filtre todos los registros de auditoría del sistema",
    shortDescription: "Consultar bitácora",
  },

  listRoles: {
    title: "Lista de Roles",
    subtitle: "Roles Existentes",
    description:
      "Visualiza y administra todos los roles existentes con sus permisos asignados",
    shortDescription: "Ver todos los roles existentes",
  },
  // Gestión de Estructura
  structure: {
    title: "Gestión de Estructura",
    subtitle: "Administración de Elementos del Repositorio",
    description:
      "Cree, edite y administre los elementos de la estructura del repositorio",
    shortDescription: "Administrar elementos de la estructura",
  },

  // Aprobación de Bloques
  block_approval: {
    title: "Aprobación de Bloques",
    subtitle: "Validación de Criterios",
    description:
      "Seleccione un proceso para ver y aprobar los criterios correspondientes validando que todos los entregables estén adjuntados",
    shortDescription: "Aprobar criterios por bloques",
  },

  // Gestión de Enlaces
  final_reports: {
    title: "Gestión de Enlaces",
    subtitle: "Enlaces Públicos y Exportación",
    description:
      "Genere enlaces públicos para los entregables de criterios aprobados y exporte tablas en Excel o PDF",
    shortDescription: "Gestionar enlaces públicos",
  },

  structure_list: {
    title: "Gestión de Estructura",
    subtitle: "Elementos de la Estructura",
    description:
      "Visualice y administre todos los elementos existentes en la estructura del repositorio",
    shortDescription: "Ver todos los elementos",
  },

  structure_creation: {
    title: "Crear Elemento de Estructura",
    subtitle: "Nueva Estructura",
    description:
      "Agregue un nuevo elemento a la jerarquía del Sistema SAAC-UNA respetando las reglas de estructura.",
    shortDescription: "Crear elemento de estructura",
  },

  improvement_commitments: {
    title: "Compromisos de Mejora",
    subtitle: "Gestión de Compromisos",
    description:
      "Gestione los compromisos de mejora vinculados a criterios y entregables",
    shortDescription: "Gestionar compromisos de mejora",
  },

  accreditation_processes: {
    title: "Procesos de Acreditación",
    subtitle: "Gestión de Procesos",
    description:
      "Gestione los procesos de acreditación asociados a ciclos de acreditación",
    shortDescription: "Gestionar procesos de acreditación",
  },

  // Informe de Acreditación
  accreditation_report_admin: {
    title: "Informe de Acreditación",
    subtitle: "Gestión Administrativa",
    description:
      "Administre la resolución de acreditación vigente, publique el informe final y consulte el historial de publicaciones",
    shortDescription: "Gestionar informe de acreditación",
  },

  accreditation_report_public: {
    title: "Informe de Acreditación",
    subtitle: "Vista Pública",
    description:
      "Consulte el estado de acreditación, el informe final publicado y el historial de resoluciones",
    shortDescription: "Ver informe de acreditación",
  },

  // Ciclos de Acreditación
  accreditation_cycles: {
    title: "Ciclos de Acreditación",
    subtitle: "Acreditación por Carrera y Sede",
    description: "Gestione los ciclos de acreditación por carrera y sede.",
    shortDescription: "Gestionar ciclos de acreditación",
  },

  // Modelos de Acreditación
  accreditation_models: {
    title: "Modelos de Acreditación",
    subtitle: "Modelos de Estructura",
    description: "Gestione los modelos de estructura que definen cómo se organiza el proceso de acreditación.",
    shortDescription: "Gestionar modelos de acreditación",
  },

  // Compromisos de Mejora — vistas específicas
  improvement_commitments_list: {
    title: "Compromisos de Mejora",
    subtitle: "Listado de Compromisos",
    description: "Lista los compromisos de mejora registrados en el sistema.",
    shortDescription: "Ver compromisos de mejora",
  },

  improvement_commitments_create: {
    title: "Configurar Compromiso de Mejora",
    subtitle: "Nueva Configuración",
    description: "Seleccione elementos y configure sus asignaciones.",
    shortDescription: "Configurar compromiso de mejora",
  },

  improvement_commitments_detail: {
    title: "Detalle del Compromiso",
    subtitle: "Información del Compromiso",
    description: "Revise la información general, selecciones y evidencias del compromiso.",
    shortDescription: "Ver detalle del compromiso",
  },
};

/**
 * Obtiene la información de un módulo
 * @param moduleKey - Clave del módulo
 * @returns Información completa del módulo
 */
export const getModuleInfo = (moduleKey: string): ModuleInfo => {
  return (
    MODULE_INFO[moduleKey] || {
      title: "Módulo",
      description: "Funcionalidad de acreditación y autoevaluación de carreras",
      shortDescription: "Módulo de funcionalidades",
    }
  );
};

/**
 * Obtiene información contextual basada en la acción
 * @param module - Módulo base
 * @param action - Acción (create, edit, list, view)
 * @returns Información contextualizada
 */
export const getContextualInfo = (
  module: string,
  action?: string,
): ModuleInfo => {
  const key = action ? `${module}_${action}` : module;
  return getModuleInfo(key);
};

/**
 * Obtiene información de módulo con título dinámico para edición
 * @param module - Módulo base
 * @param action - Acción (create, edit, etc.)
 * @param itemName - Nombre del item para títulos dinámicos
 * @returns Información contextualizada con título dinámico
 */
export const getModuleInfoWithDynamicTitle = (
  module: string,
  action?: string,
  itemName?: string,
): ModuleInfo => {
  const baseInfo = getContextualInfo(module, action);

  // Si es edición y tenemos nombre del item, personalizar título
  if (action === "edit" && itemName) {
    return {
      ...baseInfo,
      title: `${baseInfo.title}: ${itemName}`,
    };
  }

  return baseInfo;
};
