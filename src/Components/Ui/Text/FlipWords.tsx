/**
 * FlipWords — Cicla una lista de palabras animando cada letra individualmente.
 *
 * Cada letra entra desde abajo con un blur que se despeja (stagger),
 * y sale hacia arriba con blur antes de que aparezca la siguiente palabra.
 *
 * Inspirado en el componente Flip Words de Aceternity UI.
 *
 * Uso:
 *   <FlipWords words={['Acreditación', 'Evaluación', 'Gestión']} />
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/Utils/ClassNames';

interface FlipWordsProps {
  words: string[];
  /** Duración en ms que cada palabra permanece visible antes de cambiar */
  duration?: number;
  className?: string;
}

export const FlipWords: React.FC<FlipWordsProps> = ({
  words,
  duration = 3000,
  className,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [index, words.length, duration]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[index]}
        className={cn('inline-block', className)}
        aria-live="polite"
        aria-atomic="true"
      >
        {words[index].split('').map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
            animate={{
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: {
                delay: i * 0.04,
                duration: 0.4,
                ease: [0.23, 1, 0.32, 1],
              },
            }}
            exit={{
              opacity: 0,
              y: -30,
              filter: 'blur(6px)',
              transition: {
                delay: i * 0.02,
                duration: 0.3,
                ease: [0.32, 0, 0.67, 0],
              },
            }}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
};
