/**
 * Button - Componente de botón reutilizable del Design System SAAC-UNA
 * 
 * Características:
 * - Múltiples variantes (primary, secondary, outline, ghost, transparent)
 * - Sistema de tamaños responsivo integrado
 * - Estados de loading, disabled, fullWidth
 * - Colores consistentes con la marca UNA
 * - Transiciones suaves y accesibilidad
 * 
 * Uso:
 * <Button variant="primary" size="sm" isLoading={false}>
 *   Crear Rol
 * </Button>
 */
import React from 'react';
import { cn } from '@/utils/ClassNames';
import { getComponentSizeClasses, type ComponentSize } from '@/constants/ComponentSizes';
import { LoadingSpinner } from './Loading';

/**
 * Variantes disponibles para el componente Button
 */
type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'transparent' | 'success' | 'tableView' | 'tableEdit' | 'tableDelete';

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
  children: React.ReactNode;
}

// Definición de estilos para cada variante del botón
const VARIANT_CLASSES = {
  // Botón principal con color Azul UNA
  primary: [
    'bg-transparent text-azul-una font-poppins font-semibold border-2 border-azul-una',
    'hover:bg-azul-una/5 transition-colors duration-200',
    'disabled:bg-gris-una disabled:cursor-not-allowed'
  ].join(' '),
  
  // Botón secundario con color Rojo UNA
  secondary: [
    'bg-transparent text-rojo-una-2 font-poppins font-semibold border-2 border-rojo-una-2', 
    'hover:bg-rojo-una-2/5 transition-colors duration-200 shadow-sm',
    'disabled:bg-gris-una/10 disabled:cursor-not-allowed'
  ].join(' '),

  tertiary: [
    'bg-transparent text-gris-una font-poppins font-semibold border-2 border-gris-una', 
    'hover:bg-gris-una/5 transition-colors duration-200 shadow-sm',
    'disabled:bg-negro-una/10 disabled:cursor-not-allowed'
  ].join(' '),

  // Botón de éxito/activar con color verde
  success: [
    'bg-transparent text-green-600 font-poppins font-semibold border-2 border-green-600', 
    'hover:bg-green-600/5 transition-colors duration-200 shadow-sm',
    'disabled:bg-gris-una/10 disabled:cursor-not-allowed'
  ].join(' '),

  // Botón transparente para acciones discretas
  transparent: [
    'bg-transparent text-azul-una font-poppins font-semibold border-0', 
    'hover:bg-azul-una/10 transition-colors duration-200',
    'disabled:bg-gris-una/5 disabled:cursor-not-allowed disabled:text-gris-una'
  ].join(' '),

  // Botón con solo borde
  outline: 'border border-gris-una/30 bg-transparent text-negro-una hover:bg-gris-una/5',
  // Botón fantasma para acciones sutiles
  ghost: 'bg-transparent text-gris-una hover:bg-gris-una/10',
  
  // Variantes específicas para acciones de tabla
  tableView: [
    'bg-transparent text-green-600 border-0 p-2 rounded-md',
    'hover:bg-green-50 hover:text-green-700 transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ].join(' '),
  
  tableEdit: [
    'bg-transparent text-red-600 border-0 p-2 rounded-md',
    'hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200', 
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ].join(' '),
  
  tableDelete: [
    'bg-transparent text-red-600 border-0 p-2 rounded-md',
    'hover:bg-red-50 hover:text-red-700 transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ].join(' ')
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'sm',
  isLoading = false,
  fullWidth = false,
  flex = false,
  responsive = false,
  className,
  disabled,
  children,
  ...props
}) => {
  const baseClasses = [
    'font-poppins transition-colors duration-200',
    'focus:outline-none disabled:cursor-not-allowed',
    'inline-flex items-center justify-center gap-2'
  ];

  // Lógica para manejo responsivo
  const getResponsiveClasses = () => {
    if (!responsive) return '';
    
    // En desktop: ancho mínimo y padding específico
    // En mobile: flex para ocupar todo el ancho
    return 'flex-1 lg:flex-none lg:min-w-28 lg:px-8';
  };

  return (
    <button
      className={cn(
        baseClasses,
        getComponentSizeClasses.button(size),
        VARIANT_CLASSES[variant],
        fullWidth && 'w-full',
        flex && 'flex-1',
        responsive && getResponsiveClasses(),
        (disabled || isLoading) && 'opacity-50',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <LoadingSpinner variant="ring" size="sm" color="current" className="mr-2" />
      )}
      {children}
    </button>
  );
};