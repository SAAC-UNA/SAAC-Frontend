/**
 * EvidenceAssignment - Wizard principal para asignar evidencias
 * 
 * Componente wizard que guía al usuario a través del proceso de
 * asignación de evidencias a usuarios y roles específicos.
 */

import React, { useState } from 'react';
import { ScreenContainer, PageHeader, Button, LoadingSpinner, WizardProgress } from '@/Components/Ui/Index';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal.tsx';
import { EditConfirmationModal } from '@/Components/Ui/Modals/EditConfirmationModal.tsx';
import { useToast } from '@/Context/ToastContext';
import { getContextualInfo } from '@/Constants/ModuleInfo';
import { LAYOUT } from '@/Constants/Layout';
import type { 
  EvidenceAssignmentFormData, 
  WizardStep, 
  ValidationErrors 
} from '@/Types/EvidenceAssignment';
import evidenceAssignmentService from '@/Services/EvidenceAssignmentService';

// Importar los componentes de cada paso
import { SelectionStep } from './Components/SelectionStep.tsx';
import { ConfigurationStep } from './Components/ConfigurationStep.tsx';
import { ReviewStep } from './Components/ReviewStep.tsx';

const EvidenceAssignment: React.FC = () => {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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
    comentario: '',
    excludedUsers: []
  });

  const steps: WizardStep[] = [
    {
      id: 1,
      title: 'Selección',
    },
    {
      id: 2,
      title: 'Configuración',
    },
    {
      id: 3,
      title: 'Revisión',
    }
  ];

  /**
   * Validar datos del paso actual
   */
  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};
    
    switch (step) {
      case 1:
        // Validar proceso, evidencias y destinatarios (ahora todo en paso 1)
        if (!formData.proceso_id) {
          newErrors.proceso = 'Debe seleccionar un proceso';
        }
        if (formData.selectedEvidences.length === 0) {
          newErrors.evidences = 'Debe seleccionar al menos una evidencia';
        }
        if (formData.selectedUsers.length === 0 && formData.selectedRoles.length === 0) {
          newErrors.destinatarios = 'Debe seleccionar al menos un usuario o rol';
        }
        break;
        
      case 2:
        // Validaciones opcionales para configuración
        if (formData.fecha_limite) {
          const selectedDate = new Date(formData.fecha_limite);
          const today = new Date();
          if (selectedDate <= today) {
            newErrors.fecha_limite = 'La fecha límite debe ser posterior a hoy';
          }
        }
        break;
        
      case 3:
        // Validación final - revalidar todos los pasos
        const step1Valid = validateStep(1);
        const step2Valid = validateStep(2);
        
        return step1Valid && step2Valid;
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
   * Maneja el envío del formulario (abre modal de confirmación)
   */
  const handleFormSubmit = async () => {
    if (!validateStep(4)) {
      showToast({
        type: 'error',
        title: 'Error de validación',
        message: 'Por favor, revise los datos ingresados'
      });
      return;
    }

    // Mostrar modal de confirmación
    setShowConfirmModal(true);
  };

  /**
   * Confirma y ejecuta la asignación de evidencias
   */
  const handleSubmit = async () => {
    if (isSubmitting) {
      return; // Evitar múltiples envíos
    }

    setIsSubmitting(true);

    try {
      // Procesar cada evidencia seleccionada
      for (const evidenceId of formData.selectedEvidences) {
        // Filtrar usuarios excluidos por duplicados
        const excludedUsersSet = new Set(formData.excludedUsers || []);
        const finalUsers = formData.selectedUsers.filter(id => !excludedUsersSet.has(id));
        
        const assignmentData = {
          proceso_id: formData.proceso_id!,
          evidencia_id: evidenceId,
          usuarios: finalUsers.length > 0 ? finalUsers : undefined,
          roles: formData.selectedRoles.length > 0 ? formData.selectedRoles : undefined,
          fecha_limite: formData.fecha_limite || undefined,
          comentario: formData.comentario || undefined
        };

        await evidenceAssignmentService.createAssignment(assignmentData);
      }

      // Cerrar modal de confirmación y mostrar modal de éxito
      setShowConfirmModal(false);
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
        comentario: '',
        excludedUsers: []
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
   * Cierra el modal de confirmación
   */
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
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
        return <SelectionStep {...commonProps} />;
      case 2:
        return <ConfigurationStep {...commonProps} />;
      case 3:
        return <ReviewStep {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <ScreenContainer>
      <PageHeader
          title={moduleInfo.title}
          description={moduleInfo.description}
          forceLeftAlign={true}
          headerExtra={
            <div className="hidden md:block">
              <WizardProgress 
                steps={steps} 
                currentStep={currentStep} 
                onStepClick={setCurrentStep}
                variant="compact"
              />
            </div>
          }
      />

      {/* Progress móvil - Solo se muestra en dispositivos pequeños */}
      <div className="block md:hidden mb-6">
        <WizardProgress 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={setCurrentStep}
        />
      </div>

      {/* Layout que empuja botones al fondo cuando hay poco contenido */}
      <div className={LAYOUT.FORM_CONTAINER}>
        <div className={LAYOUT.FLEX_GROW}>
          {isSubmitting ? (
            <div className="relative py-12 min-h-[400px]">
              <LoadingSpinner variant="loader" />
            </div>
          ) : (
            renderCurrentStep()
          )}
        </div>

        {/* Línea divisoria inferior */}
        <hr className="border-0 border-t border-gris-una/20 mx-6 mt-6 mb-6" />

        {/* Navigation Buttons */}
        {!isSubmitting && (
          <div className="px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5 lg:pb-6">
            <div className="flex justify-between items-center">
              <Button
                variant="secondary"
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                standardWidth={true}
                size="sm"
              >
                Anterior
              </Button>

              {currentStep < 3 ? (
                <Button
                  variant="primary"
                  onClick={handleNextStep}
                  standardWidth={true}
                  size="sm"
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleFormSubmit}
                  disabled={isSubmitting}
                  standardWidth={true}
                  size="sm"
                >
                  Confirmar
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de confirmación */}
      <EditConfirmationModal
        isOpen={showConfirmModal}
        onClose={closeConfirmModal}
        onConfirm={handleSubmit}
        title="Confirmar Asignación de Evidencias"
        message={`¿Está seguro de que desea asignar ${formData.selectedEvidences.length} evidencia(s)?`}
        confirmLabel="Asignar"
        cancelLabel="Cancelar"
        isLoading={isSubmitting}
      />
      
      {/* Modal de éxito */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="¡Asignación completada!"
        message={`Se asignaron ${assignedEvidencesCount} evidencia(s) exitosamente.`}
        onClose={() => setShowSuccessModal(false)}
        autoClose={true}
      />
    </ScreenContainer>
  );
};

export default EvidenceAssignment;