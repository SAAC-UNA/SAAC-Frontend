import React from 'react';
import { motion } from 'framer-motion';
import { SCROLL_REVEAL_VARIANTS } from '@/Constants/Animations';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ScrollReveal — Envuelve cualquier contenido para que aparezca suavemente
 * al entrar en el viewport mientras el usuario hace scroll.
 *
 * Uso:
 *   <ScrollReveal>
 *     <MiTabla />
 *   </ScrollReveal>
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({ children, className }) => {
  return (
    <motion.div
      variants={SCROLL_REVEAL_VARIANTS}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
