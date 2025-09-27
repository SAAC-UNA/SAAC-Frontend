/**
 * Hook para obtener información de módulos de forma dinámica
 * 
 * Facilita el acceso a títulos, descripciones y información contextual
 * de los diferentes módulos del sistema.
 */

import { useMemo } from 'react';
import { getModuleInfo, getContextualInfo, type ModuleInfo } from '../Constants/ModuleInfo';

export interface UseModuleInfoReturn {
  /** Información completa del módulo */
  moduleInfo: ModuleInfo;
  /** Solo el título del módulo */
  title: string;
  /** Solo la descripción del módulo */
  description: string;
  /** Solo el subtítulo del módulo */
  subtitle?: string;
  /** Descripción corta del módulo */
  shortDescription?: string;
}

/**
 * Hook para obtener información de un módulo específico
 * @param moduleKey - Clave del módulo (ej: 'roles', 'users')
 * @param action - Acción específica (ej: 'create', 'edit', 'list')
 * @returns Información completa del módulo
 */
export const useModuleInfo = (moduleKey: string, action?: string): UseModuleInfoReturn => {
  const moduleInfo = useMemo(() => {
    return getContextualInfo(moduleKey, action);
  }, [moduleKey, action]);

  return useMemo(() => ({
    moduleInfo,
    title: moduleInfo.title,
    description: moduleInfo.description,
    subtitle: moduleInfo.subtitle,
    shortDescription: moduleInfo.shortDescription
  }), [moduleInfo]);
};

/**
 * Hook para obtener información de múltiples módulos
 * @param moduleKeys - Array de claves de módulos
 * @returns Mapa de información de módulos
 */
export const useMultipleModuleInfo = (moduleKeys: string[]): Record<string, ModuleInfo> => {
  return useMemo(() => {
    const result: Record<string, ModuleInfo> = {};
    moduleKeys.forEach(key => {
      result[key] = getModuleInfo(key);
    });
    return result;
  }, [moduleKeys]);
};

/**
 * Hook para obtener información basada en la URL actual
 * Útil para páginas que necesitan detectar automáticamente su contexto
 */
export const useCurrentModuleInfo = (): UseModuleInfoReturn => {
  const moduleKey = useMemo(() => {
    // Lógica simple para detectar el módulo basado en la URL
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/roles')) return 'roles';
      if (path.includes('/users')) return 'users';
      if (path.includes('/reports')) return 'reports';
      if (path.includes('/programs')) return 'programs';
      if (path.includes('/cycles')) return 'cycles';
    }
    return 'home';
  }, []);

  return useModuleInfo(moduleKey);
};