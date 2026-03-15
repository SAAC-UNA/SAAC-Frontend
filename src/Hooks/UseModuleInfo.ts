/**
 * Hook para obtener información de módulos de forma dinámica
 * 
 * Facilita el acceso a títulos, descripciones y información contextual
 * de los diferentes módulos del sistema.
 */

import { useMemo } from 'react';
import { getContextualInfo, type ModuleInfo } from '@/constants/ModuleInfo';

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