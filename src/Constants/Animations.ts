/**
 * Animations - Variantes de animación centralizadas para framer-motion
 *
 * Uso:
 *   import { DROPDOWN_VARIANTS, DROPDOWN_VARIANTS_UP, ITEM_VARIANTS, SPRING_HOVER, SPRING_CHEVRON } from '@/Constants/Animations';
 *   import { COLLAPSIBLE_PANEL, SPRING_LAYOUT } from '@/Constants/Animations';
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

/**
 * COLLAPSIBLE_PANEL — Panel colapsable con altura animada (filtros, sidebars, accordions)
 *
 * Uso con motion.div:
 *   <motion.div
 *     className="w-full overflow-hidden"
 *     initial="collapsed"
 *     animate="open"
 *     exit="collapsed"
 *     variants={COLLAPSIBLE_PANEL}
 *   >
 *     <div className={COLLAPSIBLE_PANEL_INNER}>
 *       {children}
 *     </div>
 *   </motion.div>
 *
 * Usar COLLAPSIBLE_PANEL_INNER como className del div interno para que las
 * sombras de las cards no sean recortadas por overflow-hidden.
 */
export const COLLAPSIBLE_PANEL = {
  open: {
    height: 'auto',
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 30, stiffness: 300, mass: 0.8 },
  },
  collapsed: {
    height: 0,
    opacity: 0,
    y: -8,
    transition: { type: 'spring' as const, damping: 30, stiffness: 300, mass: 0.8 },
  },
};

/** Padding interno del wrapper para que las sombras no sean recortadas por overflow-hidden */
export const COLLAPSIBLE_PANEL_INNER = 'px-2 pb-2 pt-1';

/**
 * SPRING_LAYOUT — Transición spring para layout animations (motion.div con prop `layout`)
 * Úsalo en elementos que deben moverse suavemente cuando un vecino cambia de tamaño.
 *
 * Uso:
 *   <motion.div layout transition={SPRING_LAYOUT}>...</motion.div>
 */
export const SPRING_LAYOUT = { type: 'spring' as const, damping: 30, stiffness: 300, mass: 0.8 };

/**
 * TABLE_ROW_VARIANTS — Entrada escalonada de filas de tabla.
 * Cada fila hace fade + slide desde abajo con un delay incremental.
 * El delay está acotado a 180ms para listas largas.
 *
 * Uso en DataTable (motion.tbody con key cambiante + motion.tr con custom):
 *   <motion.tbody key={bodyKey} initial="hidden" animate="visible">
 *     {data.map((item, index) => (
 *       <motion.tr variants={TABLE_ROW_VARIANTS} custom={index} ...>
 */
export const TABLE_ROW_VARIANTS = {
  hidden: { opacity: 0, y: 5 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i * 0.012, 0.18),
      duration: 0.2,
      ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
    },
  }),
};
