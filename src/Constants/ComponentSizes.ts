/**
 * Sistema global de tamaños para componentes UI
 * Define tamaños consistentes usando variables CSS de index.css
 * 
 * Las variables base están definidas en @theme en index.css
 * Las clases de utilidad están en @layer utilities en index.css
 */

import { TYPOGRAPHY } from './Typography';

export const COMPONENT_SIZES = {
  sm: {
    text: TYPOGRAPHY.button,         // 12px - size-button (botones)
    height: 'h-component',           // 40px - Altura estándar
    padding: {
      x: 'px-component-sm',          // 12px horizontal
      y: 'py-component-sm'           // 8px vertical  
    }
  },
  md: {
    text: TYPOGRAPHY.button,         // 12px - size-button (botones)
    height: 'h-component',           // 40px - Altura estándar
    padding: {
      x: 'px-component-md',          // 16px horizontal
      y: 'py-component-md'           // 12px vertical
    }
  },
  lg: {
    text: TYPOGRAPHY.button,         // 12px - size-button (botones)
    height: 'h-component',           // 40px - Altura estándar
    padding: {
      x: 'px-component-lg',          // 16px horizontal (mismo que md)
      y: 'py-component-lg'           // 16px vertical
    }
  }
} as const;

/**
 * Generar clases de tamaño para diferentes tipos de componentes
 */
export const getComponentSizeClasses = {
  // Para Input y Textarea (sin border-radius específico)
  input: (size: keyof typeof COMPONENT_SIZES) => {
    const s = COMPONENT_SIZES[size];
    return `${s.height} ${s.padding.x} ${s.text}`;
  },

  // Para Button (sin border-radius - se usa rounded-corner estándar) 
  button: (size: keyof typeof COMPONENT_SIZES) => {
    const s = COMPONENT_SIZES[size];
    return `${s.height} ${s.padding.x} ${s.text}`;
  },

  // Para MultiSelect y otros contenedores
  container: (size: keyof typeof COMPONENT_SIZES) => {
    const s = COMPONENT_SIZES[size];
    return {
      height: s.height,
      text: s.text,
      padding: `${s.padding.x}`
    };
  }
};

export type ComponentSize = keyof typeof COMPONENT_SIZES;