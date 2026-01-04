/**
 * CrearCompromiso - Wizard para registrar compromisos de mejora
 * 
 * Componente wizard que guía al usuario a través del proceso de
 * registro de compromisos de mejora vinculados a criterios específicos.
 */

import React, { useState } from 'react';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { Button, LoadingSpinner, WizardProgress } from '@/Components/Ui/Index';
import { SuccessModal } from '@/Components/Ui/SuccessModal';
import { useToast } from '@/Context/ToastContext';
import { useNavigate } from 'react-router-dom';

// Importar los componentes de cada paso
import ProcesoStep from './Components/ProcesoStep';
import SeleccionesStep from './Components/SeleccionesStep';
import DescripcionStep from './Components/DescripcionStep';
import FechasStep from './Components/FechasStep';
import EvidenciasStep from './Components/EvidenciasStep';
import ReviewStep from './Components/ReviewStep';

interface Seleccion {
  entidad_tipo: 'ESTANDAR' | 'DIMENSION' | 'COMPONENTE' | 'CRITERIO' | 'EVIDENCIA';
  entidad_id: number;
}

interface CompromisoFormData {
  proceso_id: number | null;
  ciclo_acreditacion_id: number | null;
  selecciones: Seleccion[];
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  evidencias_asignadas: number[];
}

interface ValidationErrors {
  proceso?: string;
  selecciones?: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  evidencias?: string;
}

interface WizardStep {
  id: number;
  title: string;
}

const CrearCompromiso: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<CompromisoFormData>({
    proceso_id: null,
    ciclo_acreditacion_id: null,
    selecciones: [],
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    evidencias_asignadas: []
  });

  const steps: WizardStep[] = [
    { id: 1, title: 'Proceso/Ciclo' },
    { id: 2, title: 'Selecciones' },
    { id: 3, title: 'Descripción' },
    { id: 4, title: 'Fechas' },
    { id: 5, title: 'Evidencias' },
    { id: 6, title: 'Revisión' }
  ];

  /**
   * Validar datos del paso actual
   */
  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.proceso_id && !formData.ciclo_acreditacion_id) {
          newErrors.proceso = 'Debe seleccionar un proceso o ciclo de acreditación';
        }
        break;
      case 2:
        if (formData.selecciones.length === 0) {
          newErrors.selecciones = 'Debe seleccionar al menos un criterio o evidencia';
        }
        break;
      case 3:
        if (!formData.descripcion.trim()) {
          newErrors.descripcion = 'La descripción es obligatoria';
        } else if (formData.descripcion.trim().length > 100) {
          newErrors.descripcion = 'La descripción no puede exceder 100 caracteres';
        }
        break;
      case 4:
        if (!formData.fecha_inicio) {
          newErrors.fecha_inicio = 'La fecha de inicio es obligatoria';
        } else {
          const fechaInicio = new Date(formData.fecha_inicio);
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          if (fechaInicio < hoy) {
            newErrors.fecha_inicio = 'La fecha de inicio debe ser igual o posterior a hoy';
          }
        }
        if (!formData.fecha_fin) {
          newErrors.fecha_fin = 'La fecha fin es obligatoria';
        } else if (formData.fecha_inicio) {
          const fechaInicio = new Date(formData.fecha_inicio);
          const fechaFin = new Date(formData.fecha_fin);
          if (fechaFin <= fechaInicio) {
            newErrors.fecha_fin = 'La fecha fin debe ser posterior a la fecha de inicio';
          }
        }
        break;
      case 5:
        // Evidencias asignadas son opcionales, no se valida
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
      showToast('Por favor, complete todos los campos obligatorios', 'error');
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
   * Enviar el formulario
   */
  const handleSubmit = async () => {
    if (!validateStep(currentStep - 1)) {
      showToast('Hay errores en el formulario', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Llamar al servicio para crear el compromiso
      // await compromisoService.create(formData);
      
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSuccessModal(true);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Error al registrar el compromiso',
        'error'
      );
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
          <ProcesoStep
            procesoId={formData.proceso_id}
            cicloId={formData.ciclo_acreditacion_id}
            onSelectProceso={(id: number) => setFormData({ ...formData, proceso_id: id, ciclo_acreditacion_id: null })}
            onSelectCiclo={(id: number) => setFormData({ ...formData, ciclo_acreditacion_id: id, proceso_id: null })}
            error={errors.proceso}
          />
        );
      case 2:
        return (
          <SeleccionesStep
            selecciones={formData.selecciones}
            procesoId={formData.proceso_id}
            cicloId={formData.ciclo_acreditacion_id}
            onSelect={(selecciones) => setFormData({ ...formData, selecciones })}
            error={errors.selecciones}
          />
        );
      case 3:
        return (
          <DescripcionStep
            descripcion={formData.descripcion}
            onChange={(desc) => setFormData({ ...formData, descripcion: desc })}
            error={errors.descripcion}
          />
        );
      case 4:
        return (
          <FechasStep
            fechaInicio={formData.fecha_inicio}
            fechaFin={formData.fecha_fin}
            onChangeFechaInicio={(fecha) => setFormData({ ...formData, fecha_inicio: fecha })}
            onChangeFechaFin={(fecha) => setFormData({ ...formData, fecha_fin: fecha })}
            errorInicio={errors.fecha_inicio}
            errorFin={errors.fecha_fin}
          />
        );
      case 5:
        return (
          <EvidenciasStep
            evidenciasAsignadas={formData.evidencias_asignadas}
            onChangeEvidenciasAsignadas={(evidencias) => setFormData({ ...formData, evidencias_asignadas: evidencias })}
            procesoId={formData.proceso_id || undefined}
          />
        );
      case 6:
        return (
          <ReviewStep
            procesoId={formData.proceso_id || undefined}
            cicloAcreditacionId={formData.ciclo_acreditacion_id || undefined}
            selecciones={formData.selecciones}
            descripcion={formData.descripcion}
            fechaInicio={formData.fecha_inicio}
            fechaFin={formData.fecha_fin}
            evidenciasAsignadas={formData.evidencias_asignadas}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScreenContainer
      title="Registrar Compromiso de Mejora"
      showBackButton
      onBack={() => navigate('/compromisos/listar')}
    >
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <WizardProgress
          steps={steps}
          currentStep={currentStep}
          className="mb-8"
        />

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
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
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Registrando...
                  </>
                ) : (
                  'Registrar Compromiso'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="¡Compromiso Registrado!"
        message="El compromiso de mejora ha sido registrado exitosamente con estado 'Pendiente'."
      />
    </ScreenContainer>
  );
};

export default CrearCompromiso;
