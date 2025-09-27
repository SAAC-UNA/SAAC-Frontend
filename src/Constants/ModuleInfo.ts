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
  // Gestión de Roles
  roles: {
    title: 'Gestión de Roles',
    subtitle: 'Administración de Roles y Permisos',
    description: 'Crea, edita y administra los roles del sistema',
    shortDescription: 'Administrar roles y permisos del sistema'
  },

  roles_create: {
    title: 'Crear Nuevo Rol',
    subtitle: 'Definición de Rol y Permisos',
    description: 'Define un nuevo rol del sistema asignando los permisos correspondientes',
    shortDescription: 'Crear nuevo rol con permisos'
  },

  roles_list: {
    title: 'Lista de Roles',
    subtitle: 'Roles del Sistema',
    description: 'Visualiza y administra todos los roles existentes en el sistema SAAC-UNA',
    shortDescription: 'Ver todos los roles del sistema'
  },

  // Gestión de Usuarios
  users: {
    title: 'Gestión de Usuarios',
    subtitle: 'Administración de Usuarios',
    description: 'Administra los usuarios del sistema, sus roles y permisos de acceso',
    shortDescription: 'Administrar usuarios del sistema'
  },

  users_create: {
    title: 'Crear Nuevo Usuario',
    subtitle: 'Registro de Usuario',
    description: 'Registra un nuevo usuario en el sistema y asigna sus roles correspondientes',
    shortDescription: 'Registrar nuevo usuario'
  },

  // Gestión de Reportes
  reports: {
    title: 'Gestión de Reportes',
    subtitle: 'Generación de Reportes',
    description: 'Genera y administra reportes del sistema académico y administrativo',
    shortDescription: 'Generar y administrar reportes'
  },

  // Gestión de Programas Académicos
  programs: {
    title: 'Gestión de Programas',
    subtitle: 'Programas Académicos',
    description: 'Administra los programas académicos de la universidad',
    shortDescription: 'Administrar programas académicos'
  },

  // Gestión de Ciclos Académicos
  cycles: {
    title: 'Gestión de Ciclos',
    subtitle: 'Ciclos Académicos',
    description: 'Administra los ciclos académicos y periodos de estudio',
    shortDescription: 'Administrar ciclos académicos'
  },

  // Página principal
  home: {
    title: 'Sistema SAAC-UNA',
    subtitle: 'Panel de Administración',
    description: 'Sistema de Acreditación y Autoevaluación de Carreras - Universidad Nacional de Costa Rica',
    shortDescription: 'Panel principal del sistema'
  }
};

/**
 * Obtiene la información de un módulo
 * @param moduleKey - Clave del módulo
 * @returns Información completa del módulo
 */
export const getModuleInfo = (moduleKey: string): ModuleInfo => {
  return MODULE_INFO[moduleKey] || {
    title: 'Módulo del Sistema',
    description: 'Funcionalidad del sistema SAAC-UNA',
    shortDescription: 'Módulo del sistema'
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