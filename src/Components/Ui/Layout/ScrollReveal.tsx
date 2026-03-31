import React from 'react';
import { motion } from 'framer-motion';
import { SCROLL_REVEAL_VARIANTS } from '@/Constants/Animations';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Retraso en segundos antes de que empiece la animación. Útil para cascada entre cards. */
  delay?: number;
}

/**
 * ScrollReveal — Envuelve cualquier contenido para que aparezca suavemente
 * al entrar en el viewport mientras el usuario hace scroll.
 *
 * Uso básico:
 *   <ScrollReveal><Card>...</Card></ScrollReveal>
 *
 * Cascada entre varios cards:
 *   {items.map((item, i) => (
 *     <ScrollReveal key={item.id} delay={i * 0.08}>
 *       <Card>...</Card>
 *     </ScrollReveal>
 *   ))}
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({ children, className, delay = 0 }) => {
  return (
    <motion.div
      variants={SCROLL_REVEAL_VARIANTS}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
