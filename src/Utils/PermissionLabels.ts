/**
 * Mapeo de permisos técnicos a etiquetas legibles
 * 
 * Este archivo centraliza la transformación de nombres técnicos
 * de permisos (como los envía el backend) a etiquetas legibles
 * para mostrar al usuario.
 */

export interface PermissionMapping {
  [key: string]: {
    label: string;
    description?: string;
    category?: string;
  };
}

/**
 * Mapeo completo de permisos del sistema
 */
export const PERMISSION_LABELS: PermissionMapping = {
  // Gestión de Roles
  'gestion_roles': {
    label: 'Gestión de Roles',
    description: 'Crear, editar, eliminar y asignar roles del sistema',
    category: 'Administración'
  },
  
  // Gestión de Usuarios
  'gestion_usuarios': {
    label: 'Gestión de Usuarios',
    description: 'Administrar usuarios del sistema',
    category: 'Administración'
  },
  
  // Gestión de Reportes
  'gestion_reportes': {
    label: 'Gestión de Reportes',
    description: 'Generar y administrar reportes del sistema',
    category: 'Reportes'
  },
  
  // Gestión de Programas
  'gestion_programas': {
    label: 'Gestión de Programas',
    description: 'Administrar programas académicos',
    category: 'Académico'
  },
  
  // Gestión de Ciclos
  'gestion_ciclos': {
    label: 'Gestión de Ciclos',
    description: 'Administrar ciclos académicos',
    category: 'Académico'
  }
};

/**
 * Obtiene la etiqueta legible de un permiso técnico
 * @param technicalName - Nombre técnico del permiso (ej: "gestion_roles")
 * @returns Etiqueta legible (ej: "Gestión de Roles")
 */
export const getPermissionLabel = (technicalName: string): string => {
  return PERMISSION_LABELS[technicalName]?.label || technicalName;
};

/**
 * Obtiene la descripción de un permiso
 * @param technicalName - Nombre técnico del permiso
 * @returns Descripción del permiso
 */
export const getPermissionDescription = (technicalName: string): string => {
  return PERMISSION_LABELS[technicalName]?.description || '';
};

/**
 * Obtiene la categoría de un permiso
 * @param technicalName - Nombre técnico del permiso
 * @returns Categoría del permiso
 */
export const getPermissionCategory = (technicalName: string): string => {
  return PERMISSION_LABELS[technicalName]?.category || 'General';
};

/**
 * Transforma un array de nombres técnicos a PermissionOption
 * @param technicalNames - Array de nombres técnicos
 * @returns Array de PermissionOption con value y label
 */
export const transformPermissionsToOptions = (technicalNames: string[]): Array<{value: string, label: string}> => {
  return technicalNames.map(name => ({
    value: name,
    label: getPermissionLabel(name)
  }));
};

/**
 * Agrupa permisos por categoría
 * @param technicalNames - Array de nombres técnicos
 * @returns Objeto agrupado por categorías
 */
export const groupPermissionsByCategory = (technicalNames: string[]): Record<string, Array<{value: string, label: string}>> => {
  const grouped: Record<string, Array<{value: string, label: string}>> = {};
  
  technicalNames.forEach(name => {
    const category = getPermissionCategory(name);
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({
      value: name,
      label: getPermissionLabel(name)
    });
  });
  
  return grouped;
};