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
export const MODULE_INFO: Record<string, ModuleInfo> = {
    // Página principal
  home: {
    title: 'Panel Principal',
    subtitle: 'Sistema SAAC-UNA',
    description: 'Acceda a todas las funcionalidades de acreditación y autoevaluación de carreras',
    shortDescription: 'Panel principal de funcionalidades'
  },
  
  // Gestión de Roles
  roles: {
    title: 'Gestión de Roles',
    subtitle: 'Administración de Roles y Permisos',
    description: 'Cree, edite y administre los roles y permisos disponibles',
    shortDescription: 'Administrar roles y permisos'
  },

  roles_create: {
    title: 'Crear Nuevo Rol',
    subtitle: 'Definición de Rol y Permisos',
    description: 'Defina un nuevo rol asignando los permisos correspondientes para los usuarios',
    shortDescription: 'Crear nuevo rol con permisos'
  },

  roles_edit: {
    title: 'Editar Rol',
    subtitle: 'Modificación de Rol y Permisos',
    description: 'Modifique la información del rol seleccionado y sus permisos asignados',
    shortDescription: 'Editar rol existente'
  },

  roles_list: {
    title: 'Gestión de Roles',
    subtitle: 'Administración de Roles y Permisos',
    description: 'Cree, edite y administre los roles y permisos disponibles',
    shortDescription: 'Administrar roles y permisos'
  },

  // Gestión de Usuarios
  users: {
    title: 'Gestión de Usuarios',
    subtitle: 'Administración de Usuarios',
    description: 'Administre los usuarios, sus roles y permisos de acceso a las funcionalidades',
    shortDescription: 'Administrar usuarios'
  },

  users_create: {
    title: 'Crear Nuevo Usuario',
    subtitle: 'Registro de Usuario',
    description: 'Registre un nuevo usuario y asigne los roles correspondientes para su acceso',
    shortDescription: 'Registrar nuevo usuario'
  },

  users_edit: {
    title: 'Editar Usuario',
    subtitle: 'Modificación de Usuario',
    description: 'Gestione los roles y permisos del usuario',
    shortDescription: 'Editar usuario existente'
  },

  users_list: {
    title: 'Gestión de Usuarios',
    subtitle: 'Administración de Usuarios',
    description: 'Administre los usuarios, sus roles y permisos de acceso a las funcionalidades',
    shortDescription: 'Administrar usuarios'
  },

  // Asignación de Evidencias
  evidence_assignment: {
    title: 'Asignación de Evidencias',
    subtitle: 'Wizard de Asignación',
    description: 'Asigne evidencias específicas a usuarios y roles del sistema de manera guiada',
    shortDescription: 'Asignar evidencias a usuarios'
  },

  evidence_assignment_wizard: {
    title: 'Asignar Evidencias',
    subtitle: 'Proceso de Asignación Guiado',
    description: 'Complete el proceso de asignación de evidencias siguiendo los pasos',
    shortDescription: 'Wizard de asignación de evidencias'
  },

  // Mis Evidencias Asignadas
  my_evidence_assignments: {
    title: 'Mis Evidencias Asignadas',
    subtitle: 'Evidencias Pendientes y Completadas',
    description: 'Visualice y administre las evidencias que le han sido asignadas',
    shortDescription: 'Ver evidencias asignadas a mí'
  },

  // Subida de Evidencias
  evidence_upload: {
    title: 'Subir Evidencias',
    subtitle: 'Carga de Archivos',
    description: 'Suba archivos digitales como respaldo de las evidencias del proceso de acreditación',
    shortDescription: 'Subir archivos de evidencias'
  },

  // Gestión de Reportes
  reports: {
    title: 'Gestión de Reportes',
    subtitle: 'Generación de Reportes',
    description: 'Genere y administre reportes académicos y administrativos con datos actualizados',
    shortDescription: 'Generar y administrar reportes'
  },

  // Gestión de Programas Académicos
  programs: {
    title: 'Gestión de Programas',
    subtitle: 'Programas Académicos',
    description: 'Administre los programas académicos y sus configuraciones institucionales',
    shortDescription: 'Administrar programas académicos'
  },

  // Gestión de Ciclos Académicos
  cycles: {
    title: 'Gestión de Ciclos',
    subtitle: 'Ciclos Académicos',
    description: 'Administre los ciclos académicos, periodos de estudio y calendarios institucionales',
    shortDescription: 'Administrar ciclos académicos'
  },

  // Bitácora del Sistema
  auditlog: {
    title: 'Bitácora del Sistema',
    subtitle: 'Registro de Auditoría',
    description: 'Consulte todos los registros de acciones realizadas en el sistema para garantizar trazabilidad y seguridad',
    shortDescription: 'Ver bitácora del sistema'
  },

  auditlog_list: {
    title: 'Bitácora del Sistema',
    subtitle: 'Consulta de Registros',
    description: 'Visualice y filtre todos los registros de auditoría del sistema',
    shortDescription: 'Consultar bitácora'
  },

  listRoles: {
    title: 'Lista de Roles',
    subtitle: 'Roles Existentes',
    description: 'Visualiza y administra todos los roles existentes con sus permisos asignados',
    shortDescription: 'Ver todos los roles existentes'
  },
// Gestión de Estructura
  structure: {
    title: 'Gestión de Estructura',
    subtitle: 'Administración de Elementos del Repositorio',
    description: 'Crea, edita y administra los elementos de la estructura del repositorio',
    shortDescription: 'Administrar elementos de la estructura'
  },

  structure_list: {
    title: 'Lista de Elementos',
    subtitle: 'Elementos de la Estructura',
    description: 'Visualiza y administra todos los elementos existentes en la estructura del repositorio',
    shortDescription: 'Ver todos los elementos'
  }
};

/**
 * Obtiene la información de un módulo
 * @param moduleKey - Clave del módulo
 * @returns Información completa del módulo
 */
export const getModuleInfo = (moduleKey: string): ModuleInfo => {
  return MODULE_INFO[moduleKey] || {
    title: 'Módulo',
    description: 'Funcionalidad de acreditación y autoevaluación de carreras',
    shortDescription: 'Módulo de funcionalidades'
  };
};

/**
 * Obtiene solo el título de un módulo
 * @param moduleKey - Clave del módulo
 * @returns Título del módulo
 */
export const getModuleTitle = (moduleKey: string): string => {
  return getModuleInfo(moduleKey).title;
};

/**
 * Obtiene solo la descripción de un módulo
 * @param moduleKey - Clave del módulo
 * @returns Descripción del módulo
 */
export const getModuleDescription = (moduleKey: string): string => {
  return getModuleInfo(moduleKey).description;
};

/**
 * Obtiene información contextual basada en la acción
 * @param module - Módulo base
 * @param action - Acción (create, edit, list, view)
 * @returns Información contextualizada
 */
export const getContextualInfo = (module: string, action?: string): ModuleInfo => {
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
  itemName?: string
): ModuleInfo => {
  const baseInfo = getContextualInfo(module, action);
  
  // Si es edición y tenemos nombre del item, personalizar título
  if (action === 'edit' && itemName) {
    return {
      ...baseInfo,
      title: `${baseInfo.title}: ${itemName}`
    };
  }
  
  return baseInfo;
};