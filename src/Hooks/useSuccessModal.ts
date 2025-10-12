import { useState, useCallback } from 'react';

interface SuccessModalConfig {
  title: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const useSuccessModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<SuccessModalConfig>({
    title: '',
    message: '',
    autoClose: true,
    autoCloseDelay: 3000
  });

  const showSuccess = useCallback((modalConfig: SuccessModalConfig) => {
    setConfig({
      autoClose: true,
      autoCloseDelay: 3000,
      ...modalConfig
    });
    setIsOpen(true);
  }, []);

  const hideSuccess = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    config,
    showSuccess,
    hideSuccess
  };
};