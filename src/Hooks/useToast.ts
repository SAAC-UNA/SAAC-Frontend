import { showToast } from '@/Components/Ui/Toast/Toast';

export const useToast = () => {
  return {
    error: (message: string) => showToast(message, 'error'),
    success: (message: string) => showToast(message, 'success'),
    info: (message: string) => showToast(message, 'info'),
    warning: (message: string) => showToast(message, 'warning'),
  };
};
