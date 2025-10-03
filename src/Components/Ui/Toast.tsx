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
        return `${baseStyles} toast-success`;
      case 'error':
        return `${baseStyles} toast-error`;
      case 'warning':
        return `${baseStyles} toast-warning`;
      case 'info':
        return `${baseStyles} toast-info`;
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