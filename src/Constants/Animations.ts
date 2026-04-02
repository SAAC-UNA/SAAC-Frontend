/**
 * Animations - Variantes de animación centralizadas para framer-motion
 *
 * Uso:
 *   import { DROPDOWN_VARIANTS, DROPDOWN_VARIANTS_UP, ITEM_VARIANTS, SPRING_HOVER, SPRING_CHEVRON } from '@/Constants/Animations';
 */

// Dropdown que abre hacia abajo
export const DROPDOWN_VARIANTS = {
  hidden: { opacity: 0, y: -8, scale: 0.96, transformOrigin: 'top center' },
  visible: {
    opacity: 1, y: 0, scale: 1, transformOrigin: 'top center',
    transition: { type: 'spring' as const, damping: 30, stiffness: 400, mass: 0.8 },
  },
  exit: {
    opacity: 0, y: -6, scale: 0.97, transformOrigin: 'top center',
    transition: { duration: 0.15, ease: [0.32, 0, 0.67, 0] as [number, number, number, number] },
  },
};

// Dropdown que abre hacia arriba
export const DROPDOWN_VARIANTS_UP = {
  hidden: { opacity: 0, y: 8, scale: 0.96, transformOrigin: 'bottom center' },
  visible: {
    opacity: 1, y: 0, scale: 1, transformOrigin: 'bottom center',
    transition: { type: 'spring' as const, damping: 30, stiffness: 400, mass: 0.8 },
  },
  exit: {
    opacity: 0, y: 6, scale: 0.97, transformOrigin: 'bottom center',
    transition: { duration: 0.15, ease: [0.32, 0, 0.67, 0] as [number, number, number, number] },
  },
};

// Animación de entrada escalonada por ítem de lista
export const ITEM_VARIANTS = {
  hidden: { opacity: 0, x: 6 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: {
      delay: i * 0.018,
      duration: 0.18,
      ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
    },
  }),
};

// Spring para el fondo deslizable de hover en ítems
export const SPRING_HOVER = { type: 'spring' as const, damping: 30, stiffness: 520, mass: 0.8 };

// Spring para el fondo deslizable del sidebar (hover indicator y child hover indicator)
export const SPRING_SIDEBAR = { type: 'spring' as const, stiffness: 400, damping: 30, mass: 0.8 };

// Spring para la rotación del chevron en botones trigger
export const SPRING_CHEVRON = { type: 'spring' as const, damping: 25, stiffness: 300, mass: 0.6 };

// Fade de página — usado por el Layout al cambiar de ruta (simple y limpio)
export const PAGE_TRANSITION_VARIANTS = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.18, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12, ease: 'easeIn' as const },
  },
};

// Patrón OSS Hero: contenedor de stagger para secciones dentro de una página
export const OSS_HERO_CONTAINER: import('framer-motion').Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

// Ítem individual del patrón OSS Hero (spring con blur)
export const OSS_HERO_ITEM: import('framer-motion').Variants = {
  initial: { opacity: 0, y: 28, filter: 'blur(6px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 360,
      damping: 28,
      mass: 0.75,
    },
  },
};

// Aparición progresiva al entrar en el viewport (scroll reveal)
export const SCROLL_REVEAL_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
  },
};
