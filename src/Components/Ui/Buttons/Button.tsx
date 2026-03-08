/**
 * Button - Componente de botón reutilizable del Design System SAAC-UNA
 *
 * Características:
 * - Múltiples variantes (primary, secondary, outline, ghost, transparent)
 * - Sistema de tamaños responsivo integrado
 * - Estados de loading, disabled, fullWidth
 * - Colores consistentes con la marca UNA
 * - Transiciones suaves y accesibilidad
 */
import React from 'react';
import { cn } from '@/Utils/ClassNames';
import { getComponentSizeClasses, type ComponentSize } from '@/constants/ComponentSizes';

/**
 * Variantes disponibles para el componente Button
 */
type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'transparent' | 'success' | 'tableView' | 'tableEdit' | 'tableDelete' | 'tablePower' | 'tablePowerInactive' | 'error';

/**
 * Props del componente Button
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ComponentSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  /** Para layouts flexbox específicos */
  flex?: boolean;
  /** Manejo responsivo automático (usar con precaución) */
  responsive?: boolean;
  /** Aplica el ancho estándar de 128px para botones de modales */
  standardWidth?: boolean;
  children: React.ReactNode;
}

// Definición de estilos para cada variante del botón
const VARIANT_CLASSES = {
  // Botón principal con color Azul UNA
  primary: [
    'bg-transparent text-azul-una font-poppins font-semibold border-2 border-azul-una',
    'hover:bg-azul-una/5 transition-colors duration-200',
    'disabled:!bg-transparent disabled:!text-gris-una disabled:!border-gris-una/30 disabled:cursor-not-allowed'
  ].join(' '),
  
  // Botón secundario con color Rojo UNA
  secondary: [
    'bg-transparent text-rojo-una-2 font-poppins font-semibold border-2 border-rojo-una-2', 
    'hover:bg-rojo-una-2/5 transition-colors duration-200',
    'disabled:!bg-transparent disabled:!text-gris-una disabled:!border-gris-una/30 disabled:cursor-not-allowed'
  ].join(' '),

  tertiary: [
    'bg-transparent text-gris-una font-poppins font-semibold border-2 border-gris-una', 
    'hover:bg-gris-una/5 transition-colors duration-200',
    'disabled:!bg-transparent disabled:!text-gris-una disabled:!border-gris-una/30 disabled:cursor-not-allowed'
  ].join(' '),

  // Botón de éxito/activar con color verde
  success: [
    'btn-success font-poppins font-semibold', 
    'transition-colors duration-200',
    'disabled:!bg-transparent disabled:!text-gris-una disabled:!border-gris-una/30 disabled:cursor-not-allowed'
  ].join(' '),

  // Botón transparente para acciones discretas
  transparent: [
    'bg-transparent text-azul-una font-poppins font-semibold border-0', 
    'hover:bg-azul-una/10 transition-colors duration-200',
    'disabled:!bg-transparent disabled:!text-gris-una disabled:!border-gris-una/30 disabled:cursor-not-allowed'
  ].join(' '),

  // Botón con solo borde
  outline: 'border border-gris-una/30 bg-transparent text-negro-una font-poppins font-semibold hover:bg-gris-una/5 disabled:!bg-transparent disabled:!text-gris-una disabled:!border-gris-una/30 disabled:cursor-not-allowed',
  // Botón fantasma para acciones sutiles
  ghost: 'bg-transparent text-gris-una hover:bg-gris-una/10 disabled:!bg-transparent disabled:!text-gris-una disabled:!border-gris-una/30 disabled:cursor-not-allowed',
  
  // Botones de la tabla (ojo, lapiz, basurero)
  tableView: [
    'bg-transparent text-info border-0 p-2',
    'hover:bg-[var(--color-info-light)] hover:text-info transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ].join(' '),
  
  tableEdit: [
    'bg-transparent text-warning border-0 p-2',
    'hover:bg-[var(--color-warning-light)] hover:text-warning transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ].join(' '),
  
  tableDelete: [
    'bg-transparent text-error border-0 p-2',
    'hover:bg-[var(--color-error-light)] hover:text-error transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ].join(' '),

  tablePower: [
    'bg-transparent text-verde border-0 p-2',
    'hover:bg-[var(--color-verde-light)] hover:text-verde transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ].join(' '),

  tablePowerInactive: [
    'bg-transparent text-gris-una border-0 p-2',
    'hover:bg-[var(--color-gris-light)] hover:text-gris-una transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ].join(' '),

  // Botón para manejo de errores
  error: [
    'bg-transparent text-error-dark font-poppins font-semibold border-2 border-error',
    'hover:bg-error/10 transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ].join(' ')
};

// Variantes de tabla: no reciben ancho mínimo estándar
const TABLE_VARIANTS: ButtonVariant[] = ['tableView', 'tableEdit', 'tableDelete', 'tablePower', 'tablePowerInactive', 'ghost'];

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'sm',
  isLoading = false,
  fullWidth = false,
  flex = false,
  responsive = false,
  standardWidth = false,
  className,
  disabled,
  children,
  ...props
}) => {
  const baseClasses = [
    'font-poppins transition-colors duration-200',
    'focus:outline-none disabled:cursor-not-allowed',
    'inline-flex items-center justify-center gap-2',
    'rounded-corner'
  ];

  const isTableVariant = TABLE_VARIANTS.includes(variant);

  // Lógica para manejo responsivo
  const getResponsiveClasses = () => {
    if (!responsive) return '';
    
    // En desktop: ancho mínimo y padding específico (128px estándar)
    // En mobile: flex para ocupar todo el ancho
    return 'flex-1 lg:flex-none lg:min-w-32 lg:px-8';
  };

  return (
    <button
      className={cn(
        baseClasses,
        getComponentSizeClasses.button(size),
        VARIANT_CLASSES[variant],
        // Ancho mínimo estándar automático para variantes no-tabla
        !isTableVariant && !fullWidth && !flex && !responsive && !standardWidth && 'w-button-standard',
        standardWidth && 'w-button-standard',
        fullWidth && !standardWidth && 'w-full',
        flex && !standardWidth && 'flex-1',
        responsive && !standardWidth && getResponsiveClasses(),
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  );
};