import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';

interface SidebarLabelProps {
  label: string;
  isCollapsed?: boolean;
  isActive?: boolean;
}

/**
 * Texto del sidebar
 * Usa Framer Motion para animar opacity + display simultáneamente (CSS solo no puede).
 * En hover el texto se desplaza ligeramente a la derecha, igual que el prompt de Aceternity.
 */
export const SidebarLabel: React.FC<SidebarLabelProps> = ({ label, isCollapsed = false, isActive = false }) => {
  return (
    <motion.span
      animate={{
        display: isCollapsed ? 'none' : 'inline-block',
        opacity: isCollapsed ? 0 : 1,
      }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        'truncate whitespace-pre inline-block',
        'group-hover/btn:translate-x-1 transition-transform duration-150',
        'group-hover/btn:brightness-125',
        TYPOGRAPHY.sidebarItem,
        isActive ? 'text-rojo-una-2' : 'text-blanco-una-2',
      )}
    >
      {label}
    </motion.span>
  );
};
