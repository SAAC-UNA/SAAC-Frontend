import React, { createContext, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';
import { showCustomToast } from '@/Components/Ui/Toast';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  isVisible: boolean;
}

interface ToastContextType {
  showToast: (toastData: Omit<Toast, 'id' | 'isVisible'>) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showToast = useCallback((toastData: Omit<Toast, 'id' | 'isVisible'>) => {
    const { type, title, message, duration = 5000 } = toastData;
    showCustomToast(type, title, message, duration);
  }, []);

  const hideToast = useCallback((id: string) => {
    toast.dismiss(id);
  }, []);

  const clearAllToasts = useCallback(() => {
    toast.dismiss();
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, clearAllToasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};