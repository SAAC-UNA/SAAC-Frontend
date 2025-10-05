import React, { useEffect } from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 3000
}) => {
  useEffect(() => {
    if (isOpen && autoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div 
        className="relative bg-gradient-to-br from-white to-gray-50 p-16 rounded-3xl shadow-2xl text-center max-w-lg mx-4 animate-modal-bounce overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brillo sutil en el fondo */}
        <div className="absolute inset-0 bg-gradient-radial from-azul-una/10 via-transparent to-transparent animate-rotate-glow rounded-3xl"></div>
        
        {/* Contenedor del checkmark */}
        <div className="relative flex justify-center items-center min-h-48 mb-6">
          {/* Ondas expansivas */}
          <div className="absolute w-24 h-24 border-4 border-verde-una rounded-full animate-ripple-1"></div>
          <div className="absolute w-24 h-24 border-4 border-verde-una rounded-full animate-ripple-2"></div>
          <div className="absolute w-24 h-24 border-4 border-verde-una rounded-full animate-ripple-3"></div>
          
          {/* Partículas de confeti */}
          <div className="absolute w-2 h-2 bg-yellow-400 rounded animate-confetti-1"></div>
          <div className="absolute w-2 h-2 bg-red-400 rounded animate-confetti-2"></div>
          <div className="absolute w-2 h-2 bg-blue-400 rounded animate-confetti-3"></div>
          <div className="absolute w-2 h-2 bg-green-400 rounded animate-confetti-4"></div>
          
          {/* Ícono de confirmación SVG */}
          <svg 
            className="w-24 h-24 relative z-10 animate-shine drop-shadow-lg" 
            viewBox="0 0 35.6 35.6"
          >
            <circle 
              className="animate-fill-background" 
              cx="17.8" 
              cy="17.8" 
              r="17.8"
              fill="#e0e0e0"
            />
            <circle 
              className="animate-draw-stroke fill-none stroke-white stroke-2"
              cx="17.8" 
              cy="17.8" 
              r="14.37"
              strokeMiterlimit="10"
              strokeDasharray="100"
              strokeDashoffset="100"
            />
            <polyline 
              className="animate-draw-check fill-none stroke-white stroke-2 stroke-round"
              points="11.78 18.12 15.55 22.23 25.17 12.87"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="22"
              strokeDashoffset="22"
            />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-gris-oscuro-una mb-3 relative z-10">
          {title}
        </h2>
        
        <p className="text-gris-una text-lg relative z-10">
          {message}
        </p>
      </div>
    </div>
  );
};