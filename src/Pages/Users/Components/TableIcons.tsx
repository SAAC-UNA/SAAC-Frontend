/**
 * TableIcons - Adaptador para iconos de tabla usando SystemIcons
 *
 * MIGRACIÓN: Este archivo ahora usa SystemIcons como fuente central.
 * Mantiene la misma API pero con el sistema centralizado por debajo.
 */

import { SystemIcons, type IconProps } from '@/components/Ui/Icons/SystemIcons';

/**
 * Iconos específicos para tablas - Ahora usa SystemIcons
 * Mantiene la misma interfaz pero con sistema centralizado
 */
export const TableIcons = {
  // Usando el sistema centralizado manteniendo la API original
  view: ({ className = "w-4 h-4" }: IconProps) =>
    SystemIcons.actions.view({ className, size: 'sm' }),

  edit: ({ className = "w-4 h-4" }: IconProps) =>
    SystemIcons.actions.edit({ className, size: 'sm' }),

  power: ({ className = "w-4 h-4" }: IconProps) =>
    SystemIcons.actions.power({ className, size: 'sm' }),

  add: ({ className = "w-4 h-4" }: IconProps) =>
    SystemIcons.actions.add({ className, size: 'sm' }),

  search: ({ className = "w-4 h-4" }: IconProps) =>
    SystemIcons.interface.search({ className, size: 'sm' }),

  users: ({ className = "w-4 h-4" }: IconProps) =>
    SystemIcons.users.user({ className, size: 'sm' })
};