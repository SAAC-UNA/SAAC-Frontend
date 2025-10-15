/**
 * Sistema global de tamaños para componentes UI
 * Define tamaños consistentes para texto, padding y border-radius
 */

export const COMPONENT_SIZES = {
  sm: {
    text: 'text-sm',           // 14px
    padding: {
      x: 'px-3',               // 12px horizontal
      y: 'py-2'                // 8px vertical  
    },
    borderRadius: 'rounded-[12px]'
  },
  md: {
    text: 'text-base',         // 16px
    padding: {
      x: 'px-4',               // 16px horizontal
      y: 'py-3'                // 12px vertical
    },
    borderRadius: 'rounded-[15px]'
  },
  lg: {
    text: 'text-lg',           // 18px
    padding: {
      x: 'px-4',               // 16px horizontal (mismo que md)
      y: 'py-4'                // 16px vertical
    },
    borderRadius: 'rounded-[18px]'
  }
} as const;

/**
 * Generar clases de tamaño para diferentes tipos de componentes
 */
export const getComponentSizeClasses = {
  // Para Input y Textarea (sin border-radius específico)
  input: (size: keyof typeof COMPONENT_SIZES) => {
    const s = COMPONENT_SIZES[size];
    return `${s.padding.x} ${s.padding.y} ${s.text}`;
  },

  // Para Button (con border-radius específico) 
  button: (size: keyof typeof COMPONENT_SIZES) => {
    const s = COMPONENT_SIZES[size];
    return `${s.padding.x} ${s.padding.y} ${s.text} ${s.borderRadius}`;
  },

  // Para MultiSelect y otros contenedores
  container: (size: keyof typeof COMPONENT_SIZES) => {
    const s = COMPONENT_SIZES[size];
    return {
      text: s.text,
      padding: `${s.padding.x} ${s.padding.y}`,
      borderRadius: s.borderRadius
    };
  }
};

export type ComponentSize = keyof typeof COMPONENT_SIZES;