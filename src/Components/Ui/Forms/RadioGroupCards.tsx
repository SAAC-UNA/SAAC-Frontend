import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ITEM_VARIANTS } from '@/Constants/Animations';

export interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  /** Icono renderizable (SVG inline, componente, etc.) */
  icon?: React.ReactNode;
  /** Clase Tailwind para el fondo del contenedor del icono, ej. 'bg-warning-light' */
  iconBg?: string;
}

interface RadioGroupCardsProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioCardOption[];
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

/**
 * RadioGroupCards — Selector de opciones con diseño de tarjetas
 *
 * Fondo deslizable animado (SPRING_HOVER + layoutId compartido) idéntico
 * al patrón de SingleSelect. Radio centrado verticalmente en la tarjeta.
 */
export const RadioGroupCards: React.FC<RadioGroupCardsProps> = ({
  name,
  value,
  onChange,
  options,
  error,
  label,
  required = false,
  className,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.form.label}`}>
          {label}{' '}
          {required && <span className="text-error-dark">*</span>}
        </label>
      )}

      <div className="flex flex-col gap-3">
        {options.map((option, i) => {
          const isSelected = value === option.value;
          const isHovered = hoveredItem === option.value;
          const showBg = isHovered || (!hoveredItem && isSelected);

          return (
            <motion.label
              key={option.value}
              htmlFor={`${name}_${option.value}`}
              custom={i}
              variants={ITEM_VARIANTS}
              initial="hidden"
              animate="visible"
              onMouseEnter={() => setHoveredItem(option.value)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                'relative flex items-center gap-3 p-3 rounded-lg border cursor-pointer overflow-hidden',
                isSelected ? 'border-azul-una' : 'border-gris-light',
              )}
            >
              {/* Fondo animado */}
              <motion.div
                className="absolute inset-0 bg-info-light rounded-lg"
                initial={false}
                animate={{ opacity: showBg ? 1 : 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
              />

              {/* Icono */}
              {option.icon && (
                <div
                  className={cn(
                    'relative z-10 p-1.5 rounded-lg flex-shrink-0',
                    option.iconBg ?? 'bg-gris-light',
                  )}
                >
                  {option.icon}
                </div>
              )}

              {/* Texto */}
              <div className="relative z-10 flex-1 flex flex-col gap-0.5">
                <span className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.body}`}>
                  {option.label}
                </span>
                {option.description && (
                  <span className={`text-gris-una-2 ${TYPOGRAPHY.form.helper}`}>
                    {option.description}
                  </span>
                )}
              </div>

              {/* Radio centrado */}
              <input
                type="radio"
                id={`${name}_${option.value}`}
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="relative z-10 accent-azul-una flex-shrink-0"
              />
            </motion.label>
          );
        })}
      </div>

      {error && (
        <p className={`text-error-dark ${TYPOGRAPHY.form.helper}`}>{error}</p>
      )}
    </div>
  );
};
