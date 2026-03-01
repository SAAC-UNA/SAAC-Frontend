/**
 * WizardProgress - Componente reutilizable para mostrar el progreso de un wizard
 * 
 * Características:
 * - Círculos numerados con estados (completado, activo, pendiente)
 * - Líneas conectoras entre pasos
 * - Navegación hacia pasos anteriores
 * - Títulos personalizables para cada paso
 * - Estilos consistentes con el sistema de diseño
 */

import React from 'react';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { cn } from '@/Utils/ClassNames';

export interface WizardStep {
  id: number;
  title: string;
  description?: string;
}

export interface WizardProgressProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  variant?: 'default' | 'compact';
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  steps,
  currentStep,
  onStepClick,
  variant = 'default'
}) => {
  const handleStepClick = (step: number) => {
    // Solo permitir navegar a pasos anteriores o el actual
    if (step <= currentStep && onStepClick) {
      onStepClick(step);
    }
  };
  {/* Wizard compacto para la esquina del formulario */}
  if (variant === 'compact') {
    return (
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isClickable = step.id <= currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle - Compact */}
              <button
                onClick={() => handleStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-200',
                  isCompleted && 'bg-green-600 text-white hover:bg-green-700',
                  isActive && !isCompleted && 'bg-rojo-una text-white',
                  !isActive && !isCompleted && 'bg-gris-una/20 text-gris-una',
                  isClickable && 'cursor-pointer',
                  !isClickable && 'cursor-not-allowed'
                )}
              >
                {isCompleted ? (
                  <SystemIcons.interface.checkCircle size="xs" className="w-3 h-3" />
                ) : (
                  step.id
                )}
              </button>

              {/* Connector Line - Compact */}
              {index < steps.length - 1 && (
                <div 
                  className="h-0.5 w-6 mx-1.5 rounded-full transition-all duration-200 bg-gris-una/20"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  {/* Variante default (grande para la página) */}
  return (
      <div className="flex items-start justify-center">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isClickable = step.id <= currentStep;

          return (
            <div key={step.id} className="flex items-start">
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <button
                  onClick={() => handleStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-200',
                    isCompleted && 'bg-green-600 text-white hover:bg-green-700',
                    isActive && !isCompleted && 'bg-rojo-una-2 text-white',
                    !isActive && !isCompleted && 'bg-gris-una/20 text-gris-una',
                    isClickable && 'cursor-pointer',
                    !isClickable && 'cursor-not-allowed'
                  )}
                >
                  {isCompleted ? (
                    <SystemIcons.interface.checkCircle size="md" />
                  ) : (
                    step.id
                  )}
                </button>

                {/* Step Title */}
                <span
                  className={cn(
                    'mt-3 text-sm font-medium text-center max-w-28 leading-tight',
                    isActive && 'text-rojo-una-2',
                    isCompleted && 'text-verde',
                    !isActive && !isCompleted && 'text-gris-una'
                  )}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div 
                  className="h-1 w-24 mt-10 mx-6 rounded-full transition-all duration-200 bg-gris-una/20"
                />
              )}
            </div>
          );
        })}
      </div>
  );
};