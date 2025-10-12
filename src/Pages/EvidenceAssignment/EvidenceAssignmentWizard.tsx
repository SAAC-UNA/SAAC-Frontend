/**
 * EvidenceAssignmentWizard - Wizard principal para asignar evidencias
 * 
 * Componente wizard que guía al usuario a través del proceso de
 * asignación de evidencias a usuarios y roles específicos.
 */

import React, { useState } from 'react';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { Button, LoadingSpinner, WizardProgress } from '@/Components/Ui/Index';
import { SuccessModal } from '@/Components/Ui/SuccessModal';
import { useToast } from '@/Context/ToastContext';
import { getContextualInfo } from '@/Constants/ModuleInfo';
import type { 
  EvidenceAssignmentFormData, 
  WizardStep, 
  ValidationErrors 
} from '@/Types/EvidenceAssignment';
import evidenceAssignmentService from '@/Services/EvidenceAssignmentService';

// Importar los componentes de cada paso
import { CriterionEvidenceStep } from './Components/CriterionEvidenceStep.tsx';
import { DestinatariosStep } from './Components/DestinatariosStepSimple.tsx';
import { ConfigurationStep } from './Components/ConfigurationStep.tsx';
import { ReviewStep } from './Components/ReviewStep.tsx';

const EvidenceAssignmentWizard: React.FC = () => {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [assignedEvidencesCount, setAssignedEvidencesCount] = useState(0);

  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = getContextualInfo('evidence_assignment', 'wizard');

  const [formData, setFormData] = useState<EvidenceAssignmentFormData>({
    proceso_id: null,
    criterio_id: null,
    selectedEvidences: [],
    selectedUsers: [],
    selectedRoles: [],
    fecha_limite: '',
    comentario: ''
  });

  const steps: WizardStep[] = [
    {
      id: 1,
      title: 'Seleccionar Criterio y Evidencias',
    },
    {
      id: 2,
      title: 'Seleccionar Destinatarios',
    },
    {
      id: 3,
      title: 'Configuración Adicional',
    },
    {
      id: 4,
      title: 'Revisión y Confirmación',
    }
  ];

  /**
   * Validar datos del paso actual
   */
  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.proceso_id) {
          newErrors.proceso = 'Debe seleccionar un proceso';
        }
        if (formData.selectedEvidences.length === 0) {
          newErrors.evidences = 'Debe seleccionar al menos una evidencia';
        }
        break;
        
      case 2:
        if (formData.selectedUsers.length === 0 && formData.selectedRoles.length === 0) {
          newErrors.destinatarios = 'Debe seleccionar al menos un usuario o rol';
        }
        break;
        
      case 3:
        // Validaciones opcionales para configuración
        if (formData.fecha_limite) {
          const selectedDate = new Date(formData.fecha_limite);
          const today = new Date();
          if (selectedDate <= today) {
            newErrors.fecha_limite = 'La fecha límite debe ser posterior a hoy';
          }
        }
        break;
        
      case 4:
        // Validación final - revalidar todos los pasos
        const step1Valid = validateStep(1);
        const step2Valid = validateStep(2);
        const step3Valid = validateStep(3);
        
        return step1Valid && step2Valid && step3Valid;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Ir al siguiente paso
   */
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setErrors({});
    }
  };

  /**
   * Ir al paso anterior
   */
  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  /**
   * Actualizar datos del formulario
   */
  const updateFormData = (updates: Partial<EvidenceAssignmentFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  /**
   * Enviar formulario
   */
  const handleSubmit = async () => {
    if (!validateStep(4)) {
      showToast({
        type: 'error',
        title: 'Error de validación',
        message: 'Por favor, revise los datos ingresados'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Procesar cada evidencia seleccionada
      for (const evidenceId of formData.selectedEvidences) {
        const assignmentData = {
          proceso_id: formData.proceso_id!,
          evidencia_id: evidenceId,
          usuarios: formData.selectedUsers.length > 0 ? formData.selectedUsers : undefined,
          roles: formData.selectedRoles.length > 0 ? formData.selectedRoles : undefined,
          fecha_limite: formData.fecha_limite || undefined,
          comentario: formData.comentario || undefined
        };

        console.log('📤 Sending assignment data to backend:', assignmentData);
        await evidenceAssignmentService.createAssignment(assignmentData);
      }

      // Guardar el número de evidencias asignadas y mostrar modal de éxito
      setAssignedEvidencesCount(formData.selectedEvidences.length);
      setShowSuccessModal(true);

      // Resetear formulario
      setFormData({
        proceso_id: null,
        criterio_id: null,
        selectedEvidences: [],
        selectedUsers: [],
        selectedRoles: [],
        fecha_limite: '',
        comentario: ''
      });
      setCurrentStep(1);

    } catch (error) {
      console.error('Error al crear asignación:', error);
      showToast({
        type: 'error',
        title: 'Error al asignar evidencias',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Renderizar el paso actual
   */
  const renderCurrentStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      errors
    };

    switch (currentStep) {
      case 1:
        return <CriterionEvidenceStep {...commonProps} />;
      case 2:
        return <DestinatariosStep {...commonProps} />;
      case 3:
        return <ConfigurationStep {...commonProps} />;
      case 4:
        return <ReviewStep {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <ScreenContainer
        title={moduleInfo.title}
        description={moduleInfo.description}
        variant="full-width"
      >
      <div className="space-y-6">
        {/* Progress Steps */}
        <WizardProgress 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={setCurrentStep}
        />

        {/* Form Content */}
        <>
          {isSubmitting ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
            </div>
          ) : (
            renderCurrentStep()
          )}

          {/* Navigation Buttons */}
          {!isSubmitting && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gris-una/20">
              <Button
                variant="secondary"
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                standardWidth={true}
              >
                Anterior
              </Button>

              {currentStep < 4 ? (
                <Button
                  variant="primary"
                  onClick={handleNextStep}
                  standardWidth={true}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  standardWidth={true}
                >
                  Confirmar
                </Button>
              )}
            </div>
          )}
        </>
      </div>
      
      {/* Modal de éxito */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="¡Asignación completada!"
        message={`Se asignaron ${assignedEvidencesCount} evidencia(s) exitosamente.`}
        onClose={() => setShowSuccessModal(false)}
        autoClose={true}
        autoCloseDelay={3000}
      />
    </ScreenContainer>
  );
};

export default EvidenceAssignmentWizard;