import React from 'react';
import { cn } from '@/utils/ClassNames';
import { useToast, type Toast } from '@/context/ToastContext';

interface ToastItemProps {
  toast: Toast;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const { hideToast } = useToast();

  const getToastStyles = () => {
    const baseStyles = 'border-l-4 p-4 rounded-lg shadow-lg transition-all duration-300';
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-500 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-rojo-una-2 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-azul-una/5 border-azul-una text-azul-una`;
      default:
        return `${baseStyles} bg-gris-una/5 border-gris-una text-negro-una`;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className={cn(getToastStyles(), 'animate-slide-in')}>
      <div className="flex items-start">
        <span className="text-lg mr-3 mt-0.5">{getIcon()}</span>
        
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">
            {toast.title}
          </h4>
          
          {toast.message && (
            <p className="text-xs opacity-90">
              {toast.message}
            </p>
          )}
        </div>
        
        <button
          onClick={() => hideToast(toast.id)}
          className="ml-3 text-lg opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Cerrar notificación"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts
        .filter(toast => toast.isVisible)
        .map(toast => (
          <ToastItem key={toast.id} toast={toast} />
        ))
      }
    </div>
  );
};