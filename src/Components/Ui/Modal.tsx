import React, { useEffect, useRef } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { cn } from '@/Utils/ClassNames';
import { Button } from './Button';

/**
 * Props para el componente Modal Unificado
 * Combina funcionalidad básica y avanzada en un solo componente
 */
interface UnifiedModalProps {
  /** Controla si el modal está visible */
  isOpen: boolean;
  
  /** Función para cerrar el modal */
  onClose: () => void;
  
  /** Título del modal */
  title: string;
  
  /** Tamaño del modal */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Si se puede cerrar haciendo clic fuera del modal o con Escape */
  closable?: boolean;
  
  /** Clases CSS adicionales para el contenedor */
  className?: string;

  /** Clases CSS adicionales para el contenido */
  contentClassName?: string;
  
  // ===== MODO BÁSICO (como Modal.tsx) =====
  /** Contenido personalizado del modal */
  children?: React.ReactNode;
  
  /** Botones personalizados del footer */
  footerButtons?: React.ReactNode;
  
  // ===== MODO AVANZADO (como UniversalModal.tsx) =====
  /** Variante del modal con iconos automáticos */
  variant?: 'danger' | 'warning' | 'info' | 'success';
  
  /** Ocultar el mensaje automático de peligro para acciones irreversibles */
  hideDefaultDangerMessage?: boolean;
  
  /** Mensaje principal (modo confirmación) */
  message?: string | React.ReactNode;
  
  /** Mostrar botón de confirmación */
  showConfirm?: boolean;
  
  /** Label del botón de confirmación */
  confirmLabel?: string;
  
  /** Función al confirmar */
  onConfirm?: () => void;
  
  /** Estado de carga del botón de confirmación */
  confirmLoading?: boolean;
  
  /** Mostrar botón de cancelar */
  showCancel?: boolean;
  
  /** Label del botón de cancelar */
  cancelLabel?: string;
}

export const Modal: React.FC<UnifiedModalProps> = React.memo(({
  isOpen,
  onClose,
  title,
  size = 'md',
  closable = true,
  className,
  contentClassName,
  
  // Modo básico
  children,
  footerButtons,
  
  // Modo avanzado
  variant,
  hideDefaultDangerMessage = false,
  message,
  showConfirm = true,
  confirmLabel = 'Confirmar',
  onConfirm,
  confirmLoading = false,
  showCancel = true,
  cancelLabel = 'Cancelar'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  // Determinar si estamos en modo básico o avanzado
  const isAdvancedMode = variant || message || onConfirm;
  const isBasicMode = children || footerButtons;
  
  // Configuración de tamaños
  const sizeClasses = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-2xl',
    lg: 'sm:max-w-4xl',
    xl: 'sm:max-w-6xl'
  };
  
  // Configuración de variantes
  const getVariantConfig = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: SystemIcons.interface.alert,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmClasses: 'bg-red-600 hover:bg-red-500 text-white'
        };
      case 'warning':
        return {
          icon: SystemIcons.interface.alert,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmClasses: 'bg-yellow-600 hover:bg-yellow-500 text-white'
        };
      case 'success':
        return {
          icon: SystemIcons.interface.checkCircle,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          confirmClasses: 'bg-green-600 hover:bg-green-500 text-white'
        };
      case 'info':
      default:
        return {
          icon: SystemIcons.interface.informationCircle,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmClasses: 'bg-blue-600 hover:bg-blue-500 text-white'
        };
    }
  };
  
  const config = getVariantConfig();
  const IconComponent = config.icon;
  
  // Manejo de foco y scroll
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Manejo de tecla Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closable && !confirmLoading) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, closable, confirmLoading, onClose]);
  
  // Handlers
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && closable && !confirmLoading) {
      onClose();
    }
  };
  
  const handleConfirm = () => {
    onConfirm?.();
  };
  
  const handleClose = () => {
    if (!confirmLoading) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog 
      open={isOpen} 
      onClose={closable ? handleClose : () => {}} 
      className="relative z-50"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md transition-all duration-300 data-closed:opacity-0"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div 
          className="flex min-h-full items-center justify-center p-4"
          onClick={handleOverlayClick}
        >
          <DialogPanel
            ref={modalRef}
            transition
            className={cn(
              'relative transform overflow-hidden rounded-corner bg-white text-left shadow-2xl border border-gray-100 transition-all duration-300 ease-out sm:my-8 sm:w-full',
              'data-closed:translate-y-4 data-closed:opacity-0 data-closed:sm:scale-95',
              sizeClasses[size],
              className
            )}
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-8 py-6">
              <DialogTitle className="text-xl font-bold leading-6 text-gray-800 tracking-tight">
                {title}
              </DialogTitle>
              
              {closable && (
                <button
                  type="button"
                  className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none transition-all duration-200"
                  onClick={handleClose}
                  disabled={confirmLoading}
                  aria-label="Cerrar modal"
                >
                  <SystemIcons.interface.closeCircle className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className={cn(
              'bg-white px-8 py-6 max-h-[60vh] overflow-y-auto',
              contentClassName
            )}>
              {isAdvancedMode && variant && (
                <div className="sm:flex sm:items-start">
                  {/* Icono para modo avanzado */}
                  <div className={cn(
                    'mx-auto flex size-16 shrink-0 items-center justify-center rounded-full shadow-sm',
                    'sm:mx-0 sm:size-12',
                    config.iconBg
                  )}>
                    <IconComponent data-testid="icon" className={cn('size-8 sm:size-6', config.iconColor)} />
                  </div>
                  
                  {/* Contenido avanzado */}
                  <div className="mt-4 text-center sm:mt-0 sm:ml-6 sm:text-left flex-1">
                    {message && (
                      <p className="text-base text-gray-700 leading-relaxed">
                        {message}
                      </p>
                    )}
                    
                    {variant === 'danger' && !hideDefaultDangerMessage && (
                      <div className="mt-4 p-3 bg-[var(--bg-error)] border border-[var(--border-error)] rounded-corner">
                        <p className="text-sm text-[var(--text-error)] font-medium">
                          Esta acción no se puede deshacer.
                        </p>
                      </div>
                    )}
                    
                    {children && (
                      <div className="mt-4">
                        {children}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {isBasicMode && !isAdvancedMode && (
                // Contenido básico (sin icono)
                children
              )}
            </div>

            {/* Footer */}
            {(footerButtons || isAdvancedMode) && (
              <div className="flex justify-end space-x-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white px-8 py-6">
                {footerButtons ? (
                  // Footer personalizado para modo básico
                  footerButtons
                ) : (
                  // Footer automático para modo avanzado
                  <>
                    {showCancel && (
                      <Button
                        variant="secondary"
                        onClick={handleClose}
                        disabled={confirmLoading}
                        standardWidth={true}
                      >
                        {cancelLabel}
                      </Button>
                    )}
                    
                    {showConfirm && (
                      <Button
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={confirmLoading}
                        standardWidth={true}
                      >
                        {confirmLoading ? 'Procesando...' : confirmLabel}
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
});

/**
 * Hook para manejar estado de modales
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const toggleModal = () => setIsOpen(!isOpen);

  return {
    isOpen,
    open: openModal,
    close: closeModal,
    toggle: toggleModal,
    // Aliases para compatibilidad
    openModal,
    closeModal,
    toggleModal
  };
};

export default Modal;