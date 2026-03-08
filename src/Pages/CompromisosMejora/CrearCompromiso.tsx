/**
 * CrearCompromiso - Wizard para crear compromisos de mejora
 * 
 * Flujo de 2 pasos:
 * 1. Selección de ciclo y criterios (con modal para cada criterio)
 * 2. Revisión y confirmación
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { Button, WizardProgress } from '@/Components/Ui/Index';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { useToast } from '@/Context/ToastContext';
import { improvementCommitmentService } from '@/Services/ImprovementCommitmentService';
import type {
  CompromisoFormData,
  CriterioSeleccionado,
  ValidationErrors,
  CrearCompromisoPayload
} from '@/Types/ImprovementCommitmentTypes';

// Importar componentes de los pasos
import { CreacionStep } from './Components/CreacionStep';
import { RevisionStep } from './Components/RevisionStep';

interface WizardStep {
  id: number;
  title: string;
}

const CrearCompromiso: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [formData, setFormData] = useState<CompromisoFormData>({
    ciclo_acreditacion_id: null,
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    criterios_seleccionados: []
  });

  const steps: WizardStep[] = [
    { id: 1, title: 'Creación' },
    { id: 2, title: 'Revisión' }
  ];

  /**
   * Actualizar datos del formulario
   */
  /**
   * Actualizar datos del formulario
   */
  const updateFormData = (updates: Partial<CompromisoFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  /**
   * Agregar un criterio seleccionado
   */
  const agregarCriterio = (criterio: CriterioSeleccionado) => {
    setFormData(prev => ({
      ...prev,
      criterios_seleccionados: [...prev.criterios_seleccionados, criterio]
    }));
  };

  /**
   * Eliminar un criterio seleccionado
   */
  const eliminarCriterio = (criterioId: number) => {
    setFormData(prev => ({
      ...prev,
      criterios_seleccionados: prev.criterios_seleccionados.filter(
        c => c.criterio_id !== criterioId
      )
    }));
  };

  /**
   * Actualizar un criterio existente
   */
  const actualizarCriterio = (criterioActualizado: CriterioSeleccionado) => {
    setFormData(prev => ({
      ...prev,
      criterios_seleccionados: prev.criterios_seleccionados.map(c =>
        c.criterio_id === criterioActualizado.criterio_id ? criterioActualizado : c
      )
    }));
  };

  /**
   * Validar el paso actual
   */
  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.ciclo_acreditacion_id) {
          newErrors.ciclo_acreditacion_id = 'Debe seleccionar un ciclo de acreditación';
        }
        if (formData.criterios_seleccionados.length === 0) {
          newErrors.criterios = 'Debe seleccionar al menos un criterio';
        }
        break;
      case 2:
        if (!formData.fecha_inicio) {
          newErrors.fecha_inicio = 'La fecha de inicio es obligatoria';
        }
        if (!formData.fecha_fin) {
          newErrors.fecha_fin = 'La fecha fin es obligatoria';
        } else if (formData.fecha_inicio && new Date(formData.fecha_fin) <= new Date(formData.fecha_inicio)) {
          newErrors.fecha_fin = 'La fecha fin debe ser posterior a la fecha de inicio';
        }
        if (formData.descripcion && formData.descripcion.length > 100) {
          newErrors.descripcion = 'La descripción no puede exceder 100 caracteres';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Avanzar al siguiente paso
   */
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
      setErrors({});
    } else {
      showToast({ type: 'error', title: 'Por favor, complete todos los campos obligatorios' });
    }
  };

  /**
   * Retroceder al paso anterior
   */
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  /**
   * Enviar el formulario al backend
   */
  const handleSubmit = async () => {
    if (!validateStep(2)) {
      showToast({ type: 'error', title: 'Hay errores en el formulario' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Preparar selecciones (criterios)
      const selecciones = improvementCommitmentService.transformarCriteriosParaBackend(
        formData.criterios_seleccionados
      );
      
      // Preparar evidencias a asignar
      const evidencias_asignar = improvementCommitmentService.transformarEvidenciasParaBackend(
        formData.criterios_seleccionados
      );
      
      // Crear payload
      const payload: CrearCompromisoPayload = {
        ciclo_acreditacion_id: formData.ciclo_acreditacion_id!,
        descripcion: formData.descripcion || `Compromiso de mejora ${new Date().toLocaleDateString()}`,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        selecciones,
        evidencias_asignar
      };
      
      console.log('Enviando compromiso:', payload);
      
      // Crear compromiso
      await improvementCommitmentService.crearCompromiso(payload);
      
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error completo:', error);
      
      if (error.response?.data?.errors) {
        // Errores de validación del backend
        const backendErrors = error.response.data.errors as Record<string, string[]>;
        const mappedErrors: ValidationErrors = {};

        const allowedFields = new Set([
          'ciclo_acreditacion_id',
          'descripcion',
          'fecha_inicio',
          'fecha_fin',
          'criterios'
        ]);

        Object.entries(backendErrors).forEach(([field, messages]) => {
          const message = messages?.[0] || '';
          if (allowedFields.has(field)) {
            (mappedErrors as any)[field] = message;
          } else if (!mappedErrors.general) {
            mappedErrors.general = message;
          }
        });

        if (!mappedErrors.general) {
          mappedErrors.general = Object.values(backendErrors).flat().join(', ');
        }

        setErrors(mappedErrors);
      }
      
      showToast({
        type: 'error',
        title: error.response?.data?.message || error.message || 'Error al crear el compromiso'
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  /**
   * Manejar cierre del modal de éxito
   */
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/compromisos/listar');
  };

  /**
   * Renderizar el contenido del paso actual
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CreacionStep
            formData={formData}
            updateFormData={updateFormData}
            agregarCriterio={agregarCriterio}
            eliminarCriterio={eliminarCriterio}
            actualizarCriterio={actualizarCriterio}
            errors={errors}
          />
        );
      case 2:
        return (
          <RevisionStep
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <ScreenContainer>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/compromisos/listar')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <SystemIcons.navigation.arrow.left size="md" className="text-gris-una" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-negro-una">Crear Compromiso de Mejora</h1>
                  <p className="mt-1 text-sm text-gris-una">
                    Seleccione criterios y configure las asignaciones
                  </p>
                </div>
              </div>
            </div>
            
            {/* Wizard Progress (desktop) */}
            <div className="hidden md:block">
              <WizardProgress 
                steps={steps} 
                currentStep={currentStep} 
                variant="compact"
              />
            </div>
          </div>

          {/* Wizard Progress (mobile) */}
          <div className="block md:hidden">
            <WizardProgress 
              steps={steps} 
              currentStep={currentStep}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <SystemIcons.navigation.arrow.left size="sm" />
                  Anterior
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/compromisos/listar')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>

              {currentStep < steps.length ? (
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  variant="secondary"
                  className="gap-2"
                >
                  Siguiente
                  <SystemIcons.navigation.arrow.right size="sm" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  variant="secondary"
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <SystemIcons.interface.checkCircle size="sm" />
                      Crear Compromiso
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </ScreenContainer>

      {/* Modal de Éxito */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Compromiso creado exitosamente"
        message="El compromiso de mejora ha sido registrado correctamente en el sistema."
      />
    </>
  );
};

export default CrearCompromiso;
