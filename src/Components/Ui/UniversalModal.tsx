/**
 * UniversalModal - Modal reutilizable basado en Headless UI
 * 
 * Características:
 * - Múltiples variantes (danger, warning, info, success)
 * - Iconos automáticos según el tipo
 * - Botones personalizables
 * - Transiciones suaves
 * - Completamente accesible
 * 
 * Uso:
 * <UniversalModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   variant="danger"
 *   title="Eliminar Rol"
 *   message="¿Estás seguro de que deseas eliminar este rol?"
 *   confirmLabel="Eliminar"
 *   onConfirm={handleDelete}
 * />
 */

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Button } from './Button'

interface UniversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message?: string;
  children?: React.ReactNode; // Para contenido personalizado
  
  // Botón de confirmación
  showConfirm?: boolean;
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmLoading?: boolean;
  
  // Botón de cancelar
  showCancel?: boolean;
  cancelLabel?: string;
  
  // Configuración adicional
  size?: 'sm' | 'md' | 'lg';
  closable?: boolean; // Si se puede cerrar clickeando fuera
}

export const UniversalModal: React.FC<UniversalModalProps> = ({
  isOpen,
  onClose,
  variant = 'info',
  title,
  message,
  children,
  showConfirm = true,
  confirmLabel = 'Confirmar',
  onConfirm,
  confirmLoading = false,
  showCancel = true,
  cancelLabel = 'Cancelar',
  size = 'md',
  closable = true
}) => {
  
  // Configuraciones por variante
  const getVariantConfig = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          icon: ExclamationTriangleIcon,
          confirmButtonVariant: 'secondary' as const,
          confirmButtonClasses: 'bg-red-600 hover:bg-red-500 text-white'
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          icon: ExclamationTriangleIcon,
          confirmButtonVariant: 'secondary' as const,
          confirmButtonClasses: 'bg-yellow-600 hover:bg-yellow-500 text-white'
        };
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          icon: CheckCircleIcon,
          confirmButtonVariant: 'primary' as const,
          confirmButtonClasses: 'bg-green-600 hover:bg-green-500 text-white'
        };
      case 'info':
      default:
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          icon: InformationCircleIcon,
          confirmButtonVariant: 'primary' as const,
          confirmButtonClasses: 'bg-blue-600 hover:bg-blue-500 text-white'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'sm:max-w-md';
      case 'lg':
        return 'sm:max-w-2xl';
      case 'md':
      default:
        return 'sm:max-w-lg';
    }
  };

  const config = getVariantConfig();
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleClose = () => {
    if (!confirmLoading) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={closable ? handleClose : () => {}} 
      className="relative z-50"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-negro-una/40 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className={`relative transform overflow-hidden rounded-lg bg-blanco-una-2 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full ${getSizeClasses()} data-closed:sm:translate-y-0 data-closed:sm:scale-95`}
          >
            {/* Contenido principal */}
            <div className="bg-blanco-una px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                {/* Icono */}
                <div className={`mx-auto flex size-12 shrink-0 items-center justify-center rounded-full ${config.iconBg} sm:mx-0 sm:size-10`}>
                  <IconComponent aria-hidden="true" className={`size-6 ${config.iconColor}`} />
                </div>
                
                {/* Contenido */}
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle as="h3" className="text-base font-semibold text-negro-una">
                    {title}
                  </DialogTitle>
                  
                  <div className="mt-2">
                    {message && (
                      <p className="text-sm text-gris-una">
                        {message}
                      </p>
                    )}
                    
                    {variant === 'danger' && (
                      <p className="text-xs text-rojo-una mt-2">
                        Esta acción no se puede deshacer.
                      </p>
                    )}
                    
                    {/* Contenido personalizado */}
                    {children}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botones */}
            {(showConfirm || showCancel) && (
              <div className="bg-blanco-una-2 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                {showConfirm && (
                  <Button
                    variant={config.confirmButtonVariant}
                    size="sm"
                    onClick={handleConfirm}
                    disabled={confirmLoading}
                    isLoading={confirmLoading}
                    className="inline-flex w-full justify-center sm:ml-3 sm:w-auto min-w-[80px]"
                  >
                    {confirmLoading ? 'Procesando...' : confirmLabel}
                  </Button>
                )}
                
                {showCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClose}
                    disabled={confirmLoading}
                    className="mt-3 inline-flex w-full justify-center sm:mt-0 sm:w-auto min-w-[80px]"
                  >
                    {cancelLabel}
                  </Button>
                )}
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};