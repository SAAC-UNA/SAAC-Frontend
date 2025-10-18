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
                  'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200',
                  isCompleted && 'bg-green-600 text-white hover:bg-green-700',
                  isActive && !isCompleted && 'bg-azul-una text-white',
                  !isActive && !isCompleted && 'bg-gris-una/20 text-gris-una',
                  isClickable && 'cursor-pointer',
                  !isClickable && 'cursor-not-allowed'
                )}
              >
                {isCompleted ? (
                  <SystemIcons.interface.checkCircle size="sm" />
                ) : (
                  step.id
                )}
              </button>

              {/* Connector Line - Compact */}
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    'h-0.5 w-6 mx-2 rounded-full transition-all duration-200',
                    isCompleted ? 'bg-green-600' : 'bg-gris-una/20'
                  )}
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
                    isActive && !isCompleted && 'bg-azul-una text-white',
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
                    isActive && 'text-azul-una',
                    isCompleted && 'text-green-600',
                    !isActive && !isCompleted && 'text-gris-una'
                  )}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    'h-1 w-16 mt-6 mx-4 rounded-full transition-all duration-200',
                    isCompleted ? 'bg-green-600' : 'bg-gris-una/20'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
  );
};