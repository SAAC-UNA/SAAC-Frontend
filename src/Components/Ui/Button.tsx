import React from 'react';
import { cn } from '@/utils/ClassNames';
import { getComponentSizeClasses, type ComponentSize } from '@/constants/ComponentSizes';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'transparent';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ComponentSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  flex?: boolean; // Para reemplazar la funcionalidad de .btn-form
  responsive?: boolean; // Nueva prop para manejo responsivo automático
  children: React.ReactNode;
}

const variantClasses = {
  primary: [
    'bg-transparent text-azul-una font-poppins font-semibold border-2 border-azul-una',
    'hover:bg-azul-una/5 transition-colors duration-200',
    'disabled:bg-gris-una disabled:cursor-not-allowed'
  ].join(' '),
  
  secondary: [
    'bg-transparent text-rojo-una-2 font-poppins font-semibold border-2 border-rojo-una-2', 
    'hover:bg-rojo-una-2/5 transition-colors duration-200 shadow-sm',
    'disabled:bg-gris-una/10 disabled:cursor-not-allowed'
  ].join(' '),

  transparent: [
    'bg-transparent text-azul-una font-poppins font-semibold border-0', 
    'hover:bg-azul-una/10 transition-colors duration-200',
    'disabled:bg-gris-una/5 disabled:cursor-not-allowed disabled:text-gris-una'
  ].join(' '),

  outline: 'border border-gris-una/30 bg-transparent text-negro-una hover:bg-gris-una/5',
  ghost: 'bg-transparent text-gris-una hover:bg-gris-una/10'
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
        variantClasses[variant],
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
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};