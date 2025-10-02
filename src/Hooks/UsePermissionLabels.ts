/**
 * Hook personalizado para manejar permisos con transformación automática
 * 
 * Este hook facilita el trabajo con permisos proporcionando:
 * - Transformación automática de nombres técnicos a etiquetas legibles
 * - Agrupación por categorías
 * - Funciones de utilidad para mostrar permisos
 */

import { useMemo } from 'react';
import { 
  getPermissionLabel, 
  getPermissionDescription, 
  getPermissionCategory,
  transformPermissionsToOptions,
  groupPermissionsByCategory
} from '@/utils/PermissionLabels';

export interface UsePermissionLabelsReturn {
  /** Obtiene la etiqueta legible de un permiso técnico */
  getLabel: (technicalName: string) => string;
  
  /** Obtiene la descripción de un permiso */
  getDescription: (technicalName: string) => string;
  
  /** Obtiene la categoría de un permiso */
  getCategory: (technicalName: string) => string;
  
  /** Transforma array de nombres técnicos a opciones para componentes */
  transformToOptions: (technicalNames: string[]) => Array<{value: string, label: string}>;
  
  /** Agrupa permisos por categoría */
  groupByCategory: (technicalNames: string[]) => Record<string, Array<{value: string, label: string}>>;
  
  /** Transforma múltiples permisos con información completa */
  transformWithDetails: (technicalNames: string[]) => Array<{
    value: string;
    label: string;
    description: string;
    category: string;
  }>;
  
  /** Obtiene todos los permisos agrupados y ordenados */
  getPermissionsGrouped: (technicalNames: string[]) => Array<{
    category: string;
    permissions: Array<{value: string, label: string}>;
  }>;
}

/**
 * Hook para manejar transformación de permisos
 */
export const usePermissionLabels = (): UsePermissionLabelsReturn => {
  
  const transformWithDetails = useMemo(() => {
    return (technicalNames: string[]) => {
      return technicalNames.map(name => ({
        value: name,
        label: getPermissionLabel(name),
        description: getPermissionDescription(name),
        category: getPermissionCategory(name)
      }));
    };
  }, []);
  
  const getPermissionsGrouped = useMemo(() => {
    return (technicalNames: string[]) => {
      const grouped = groupPermissionsByCategory(technicalNames);
      return Object.entries(grouped)
        .map(([category, permissions]) => ({
          category,
          permissions
        }))
        .sort((a, b) => a.category.localeCompare(b.category));
    };
  }, []);
  
  return {
    getLabel: getPermissionLabel,
    getDescription: getPermissionDescription,
    getCategory: getPermissionCategory,
    transformToOptions: transformPermissionsToOptions,
    groupByCategory: groupPermissionsByCategory,
    transformWithDetails,
    getPermissionsGrouped
  };
};

/**
 * Hook para formatear un permiso específico
 */
export const usePermissionFormat = (technicalName: string) => {
  return useMemo(() => ({
    value: technicalName,
    label: getPermissionLabel(technicalName),
    description: getPermissionDescription(technicalName),
    category: getPermissionCategory(technicalName)
  }), [technicalName]);
};

/**
 * Hook para formatear múltiples permisos
 */
export const usePermissionsFormat = (technicalNames: string[]) => {
  return useMemo(() => {
    return transformPermissionsToOptions(technicalNames);
  }, [technicalNames]);
};