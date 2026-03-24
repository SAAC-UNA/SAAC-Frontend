import { showCustomToast } from '@/Components/Ui/Toast';

export const useToast = () => ({
  error:   (message: string) => showCustomToast('error', message),
  success: (message: string) => showCustomToast('success', message),
  info:    (message: string) => showCustomToast('info', message),
  warning: (message: string) => showCustomToast('warning', message),
});
