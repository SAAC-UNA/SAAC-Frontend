/**
 * Sistema global de tamaños para componentes UI
 * Define tamaños consistentes para texto, padding y border-radius
 */

export const COMPONENT_SIZES = {
  sm: {
    text: 'text-sm',           // 14px
    height: 'h-10',            // 40px - Altura estándar
    padding: {
      x: 'px-3',               // 12px horizontal
      y: 'py-2'                // 8px vertical  
    }
  },
  md: {
    text: 'text-base',         // 16px
    height: 'h-10',            // 40px - Altura estándar
    padding: {
      x: 'px-4',               // 16px horizontal
      y: 'py-3'                // 12px vertical
    }
  },
  lg: {
    text: 'text-lg',           // 18px
    height: 'h-10',            // 40px - Altura estándar
    padding: {
      x: 'px-4',               // 16px horizontal (mismo que md)
      y: 'py-4'                // 16px vertical
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