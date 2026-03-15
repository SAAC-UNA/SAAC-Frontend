import React, { useEffect, useState } from 'react';

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
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen && autoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  const handleClose = () => {
    setIsClosing(true);
    onClose?.();
    setTimeout(() => {
      setIsClosing(false);
    }, 400);
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };



  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes modalBounce {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(50px);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes modalSlideOut {
          0% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          100% {
            opacity: 0;
            transform: scale(0.8) translateY(-50px);
          }
        }

        @keyframes rotateGlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(200px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes fillBackground {
          0% { fill: #e0e0e0; }
          100% { fill: #6cbe45; }
        }

        @keyframes drawStroke {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }

        @keyframes drawCheck {
          0% { stroke-dashoffset: 22; }
          100% { stroke-dashoffset: 0; }
        }

        @keyframes shine {
          0%, 100% {
            filter: drop-shadow(0 4px 15px rgba(108, 190, 69, 0.3));
          }
          50% {
            filter: drop-shadow(0 4px 25px rgba(108, 190, 69, 0.6));
          }
        }

        .success-modal-overlay {
          animation: fadeIn 0.4s ease;
        }

        .success-modal-overlay.fadeOut {
          animation: fadeOut 0.4s ease forwards;
        }

        .success-modal-content {
          animation: modalBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .success-modal-content.slideOut {
          animation: modalSlideOut 0.4s cubic-bezier(0.4, 0, 1, 1) forwards;
        }

        .success-modal-content::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
          animation: rotateGlow 8s linear infinite;
          border-radius: 16px;
          z-index: 0;
        }

        .success-checkmark {
          width: 80px;
          height: 80px;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 4px 15px rgba(108, 190, 69, 0.3));
          animation: shine 2s ease-in-out infinite;
          animation-delay: 1.5s;
        }

        .success-checkmark .background {
          fill: #e0e0e0;
          animation: fillBackground 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.3s;
        }

        .success-checkmark .stroke {
          fill: none;
          stroke: #fff;
          stroke-miterlimit: 10;
          stroke-width: 2px;
          stroke-dashoffset: 100;
          stroke-dasharray: 100;
          animation: drawStroke 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.7s;
        }

        .success-checkmark .check {
          fill: none;
          stroke: #fff;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 2.5px;
          stroke-dashoffset: 22;
          stroke-dasharray: 22;
          animation: drawCheck 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 1.1s;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
      `}</style>
      
      <div 
        className={`success-modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 ${isClosing ? 'fadeOut' : ''}`}
        role="presentation"
        onClick={handleOverlayClick}
      >
        <div 
          className={`success-modal-content relative bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4 overflow-visible ${isClosing ? 'slideOut' : ''}`}
          role="presentation"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Contenedor del checkmark */}
          <div className="relative flex justify-center items-center min-h-40 mb-4">
            {/* Ícono de confirmación SVG */}
            <svg className="success-checkmark" viewBox="0 0 35.6 35.6">
              <circle className="background" cx="17.8" cy="17.8" r="17.8"></circle>
              <circle className="stroke" cx="17.8" cy="17.8" r="14.37"></circle>
              <polyline className="check" points="11.78 18.12 15.55 22.23 25.17 12.87"></polyline>
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2 relative z-10">
            {title}
          </h2>
          
          <p className="text-sm text-gray-600 relative z-10">
            {message}
          </p>
        </div>
      </div>
    </>
  );
};