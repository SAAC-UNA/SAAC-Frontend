import { useState, useEffect } from 'react';
import styles from './Toast.module.css';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info' | 'warning';
  duration?: number;
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    // Escuchar evento personalizado de toast
    const handleToast = (event: CustomEvent<ToastMessage>) => {
      const toast = event.detail;
      setToasts((prev) => [...prev, toast]);

      // Auto-remover después de la duración
      if (toast.duration !== -1) {
        setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration || 3000);
      }
    };

    window.addEventListener('showToast', handleToast as EventListener);
    return () => window.removeEventListener('showToast', handleToast as EventListener);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className={styles['toast-container']}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles['toast']} ${styles[`toast-${toast.type}`]}`}>
          <div className={styles['toast-content']}>
            <span className={styles['toast-message']}>{toast.message}</span>
            <button
              className={styles['toast-close']}
              onClick={() => removeToast(toast.id)}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const showToast = (message: string, type: 'error' | 'success' | 'info' | 'warning' = 'info', duration = 3000) => {
  const id = `${Date.now()}-${Math.random()}`;
  const event = new CustomEvent('showToast', {
    detail: { id, message, type, duration } as ToastMessage,
  });
  window.dispatchEvent(event);
};
