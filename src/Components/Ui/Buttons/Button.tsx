/**
 * Button - Componente de botón reutilizable del Design System SAAC-UNA
 *
 * Características:
 * - Múltiples variantes usando class-variance-authority (CVA)
 * - Variantes filled (primary, secondary, success) y bordered (tertiary, outline, error)
 * - Variantes premium: shimmer (gradiente animado) y glow (sombra azul)
 * - Soporte para íconos a la izquierda y derecha (leftIcon / rightIcon)
 * - Estados de loading con animación de entrada/salida
 * - Accesibilidad: aria-busy, aria-hidden en capas de loading
 */
import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/Utils/ClassNames';
import { getComponentSizeClasses } from '@/Constants/ComponentSizes';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    'font-poppins font-semibold',
    'transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'rounded-corner-md',
    'group relative overflow-hidden',
  ].join(' '),
  {
    variants: {
      variant: {
        // ===== Variantes principales (filled) =====
        primary: [
          'bg-azul-una text-blanco-una border-0',
          'shadow-[0_4px_14px_rgba(3,73,145,0.35)] hover:shadow-[0_4px_20px_rgba(3,73,145,0.50)]',
          'hover:bg-azul-una/90',
          'focus-visible:ring-azul-una',
          '[--ripple-color:rgba(255,255,255,0.30)]',
          '[--shine-opacity:1]',
        ].join(' '),

        secondary: [
          'bg-rojo-una-2 text-blanco-una-2 border-0',
          'shadow-[0_4px_14px_rgba(195,43,48,0.35)] hover:shadow-[0_4px_20px_rgba(195,43,48,0.50)]',
          'hover:bg-rojo-una-2/90',
          'focus-visible:ring-rojo-una-2',
          '[--ripple-color:rgba(255,255,255,0.30)]',
          '[--shine-opacity:1]',
        ].join(' '),

        warning: [
          'bg-warning text-blanco-una border-0',
          'shadow-[0_4px_14px_rgba(245,158,11,0.35)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.50)]',
          'hover:bg-warning/90',
          'focus-visible:ring-warning',
          '[--ripple-color:rgba(255,255,255,0.30)]',
          '[--shine-opacity:1]',
        ].join(' '),

        success: [
          'bg-verde text-blanco-una border-0',
          'shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.50)]',
          'hover:bg-verde/90',
          'focus-visible:ring-verde',
          '[--ripple-color:rgba(255,255,255,0.30)]',
          '[--shine-opacity:1]',
        ].join(' '),

        // ===== Variantes de contorno (bordered) =====
        tertiary: [
          'bg-transparent text-gris-una border-2 border-gris-una',
          'hover:bg-gris-una/5',
          'focus-visible:ring-gris-una',
          '[--ripple-color:rgba(167,167,169,0.25)]',
        ].join(' '),

        outline: [
          'border border-gris-una/50 bg-transparent text-negro-una',
          'hover:bg-gris-una/10',
          'focus-visible:ring-gris-una',
          '[--ripple-color:rgba(0,0,0,0.08)]',
        ].join(' '),

        error: [
          'bg-transparent text-error-dark border-2 border-error',
          'hover:bg-error/10',
          'focus-visible:ring-error',
          '[--ripple-color:rgba(239,68,68,0.18)]',
        ].join(' '),

        // ===== Variantes sutiles =====
        ghost: [
          'bg-transparent text-gris-una border-0',
          'hover:bg-gris-una/10',
          'focus-visible:ring-azul-una',
          '[--ripple-color:rgba(3,73,145,0.12)]',
        ].join(' '),

        transparent: [
          'bg-transparent text-azul-una border-0',
          'hover:bg-azul-una/10',
          'focus-visible:ring-azul-una',
          '[--ripple-color:rgba(3,73,145,0.12)]',
        ].join(' '),

        // ===== Variantes premium =====
        shimmer: [
          'text-blanco-una border-0',
          'bg-gradient-to-r from-azul-una via-azul-una-2 to-azul-una',
          '[background-size:200%_auto]',
          'animate-shimmer',
          'shadow-[0_4px_14px_rgba(3,73,145,0.35)] hover:shadow-[0_4px_20px_rgba(3,73,145,0.50)]',
          'focus-visible:ring-azul-una',
          '[--ripple-color:rgba(255,255,255,0.30)]',
          '[--shine-opacity:1]',
        ].join(' '),

        glow: [
          'bg-azul-una text-blanco-una border-0',
          'shadow-[0_4px_20px_rgba(3,73,145,0.35)] hover:shadow-[0_6px_28px_rgba(3,73,145,0.55)]',
          'hover:bg-azul-una/90',
          'focus-visible:ring-azul-una',
          '[--ripple-color:rgba(255,255,255,0.30)]',
          '[--shine-opacity:1]',
        ].join(' '),

        // ===== Variantes de tabla (sin ancho estándar ni estilos principales) =====
        tableView: [
          'bg-transparent text-info border-0 p-2',
          'hover:[filter:drop-shadow(0_0_6px_rgba(59,130,246,0.85))] transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        ].join(' '),

        tableEdit: [
          'bg-transparent text-warning border-0 p-2',
          'hover:[filter:drop-shadow(0_0_6px_rgba(245,158,11,0.85))] transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        ].join(' '),

        tableDelete: [
          'bg-transparent text-error border-0 p-2',
          'hover:[filter:drop-shadow(0_0_6px_rgba(239,68,68,0.85))] transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        ].join(' '),

        tablePower: [
          'bg-transparent text-verde border-0 p-2',
          'hover:[filter:drop-shadow(0_0_6px_rgba(16,185,129,0.85))] transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        ].join(' '),

        tablePowerInactive: [
          'bg-transparent text-gris-una border-0 p-2',
          'hover:[filter:drop-shadow(0_0_6px_rgba(107,114,128,0.75))] transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        ].join(' '),
      },

      size: {
        sm: getComponentSizeClasses.button('sm'),
        md: getComponentSizeClasses.button('md'),
        lg: getComponentSizeClasses.button('lg'),
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
    },
  }
);

// Tipo derivado de CVA para uso externo
export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;

// Variantes que no reciben ancho estándar automático
const TABLE_VARIANTS: ButtonVariant[] = [
  'tableView', 'tableEdit', 'tableDelete', 'tablePower', 'tablePowerInactive', 'ghost',
];

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  /** Para layouts flexbox específicos */
  flex?: boolean;
  /** Manejo responsivo automático (usar con precaución) */
  responsive?: boolean;
  /** Aplica el ancho estándar de 128px para botones de modales */
  standardWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'sm',
  isLoading = false,
  loadingText,
  fullWidth = false,
  flex = false,
  responsive = false,
  standardWidth = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  onPointerDown,
  children,
  ...props
}, ref) => {
  const isTableVariant = TABLE_VARIANTS.includes(variant as ButtonVariant);
  const resolvedLoadingText = loadingText || (typeof children === 'string' ? children : 'Procesando');

  // ===== Ripple effect =====
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isTableVariant) {
      const rect = e.currentTarget.getBoundingClientRect();
      const id = Date.now();
      setRipples(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
    }
    onPointerDown?.(e);
  };

  const getResponsiveClasses = () => {
    if (!responsive) return '';
    return 'flex-1 lg:flex-none lg:min-w-32 lg:px-8';
  };

  return (
    <button
      ref={ref}
      className={cn(
        buttonVariants({ variant, size }),
        isLoading && 'select-none',
        !isTableVariant && 'hover:scale-[1.02] active:scale-[0.97]',
        !isTableVariant && !fullWidth && !flex && !responsive && !standardWidth && 'w-button-standard',
        standardWidth && 'w-button-standard',
        fullWidth && !standardWidth && 'w-full',
        flex && !standardWidth && 'flex-1',
        responsive && !standardWidth && getResponsiveClasses(),
        className
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      onPointerDown={handlePointerDown}
      {...props}
    >
      {/* Capa shine — solo en variantes filled (--shine-opacity:1) */}
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[var(--shine-opacity,0)]"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent 60%)' }}
        aria-hidden="true"
      />

      {/* Capa ripple — renderizada bajo el contenido */}
      {ripples.map(r => (
        <span
          key={r.id}
          className="animate-ripple pointer-events-none absolute rounded-full"
          style={{
            left: r.x,
            top: r.y,
            width: '1.25rem',
            height: '1.25rem',
            backgroundColor: 'var(--ripple-color, rgba(255,255,255,0.25))',
          }}
          aria-hidden="true"
        />
      ))}
      {/* Capa 1: Contenido normal — oculto durante loading */}
      <span
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all duration-200',
          isLoading ? 'translate-y-1 opacity-0' : 'translate-y-0 opacity-100'
        )}
        aria-hidden={isLoading}
      >
        {leftIcon && <span aria-hidden="true" className="inline-flex">{leftIcon}</span>}
        {children}
        {rightIcon && <span aria-hidden="true" className="inline-flex">{rightIcon}</span>}
      </span>

      {/* Capa 2: Overlay de loading — oculto en reposo para no duplicar texto en DOM */}
      <span
        className={cn(
          'pointer-events-none absolute inset-0 flex items-center justify-center gap-2 transition-all duration-200',
          isLoading ? 'translate-y-0 opacity-100' : 'hidden -translate-y-1 opacity-0'
        )}
        aria-hidden={!isLoading}
      >
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          role="status"
          aria-label={resolvedLoadingText}
        />
        <span>{resolvedLoadingText}</span>
      </span>
    </button>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
