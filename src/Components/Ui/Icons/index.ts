/**
 * Punto de entrada principal para el sistema de iconos
 * 
 * Exporta todos los iconos del sistema de manera organizada
 */

import { SystemIcons } from './SystemIcons';
export { SystemIcons, type IconProps } from './SystemIcons';

// Re-exportar categorías específicas para facilidad de uso
export const {
  actions: ActionIcons,
  navigation: NavigationIcons,
  interface: InterfaceIcons,
  users: UserIcons,
  work: WorkIcons
} = SystemIcons;

/**
 * Hook para usar iconos con configuración predeterminada
 */
export const useSystemIcons = () => {
  return {
    SystemIcons,
    // Aliases comunes
    Icons: SystemIcons,
    // Acceso directo a categorías
    Actions: SystemIcons.actions,
    Navigation: SystemIcons.navigation,
    Interface: SystemIcons.interface,
    Users: SystemIcons.users,
    Work: SystemIcons.work,
    Structure: SystemIcons.structure,
    Repository: SystemIcons.repository
  };
};