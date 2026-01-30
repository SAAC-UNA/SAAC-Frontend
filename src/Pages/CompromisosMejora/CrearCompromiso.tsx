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
import { config } from '@/Config/app.config';

// Importar los componentes de cada paso
import ProcesoStep from './Components/ProcesoStep';
import SeleccionesStep from './Components/SeleccionesStep';
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
    { id: 1, title: 'Proceso, Fechas y Descripción' },
    { id: 2, title: 'Selecciones' },
    { id: 3, title: 'Revisión' }
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
        // Descripción es opcional, solo validar longitud si hay contenido
        if (formData.descripcion.trim().length > 250) {
          newErrors.descripcion = 'La descripción no puede exceder 250 caracteres';
        }
        break;
      case 2:
        if (formData.selecciones.length === 0) {
          newErrors.selecciones = 'Debe seleccionar al menos un criterio o evidencia';
        }
        break;
      case 3:
        // Revisión final, no hay validación adicional
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
      // Preparar datos eliminando campos null
      const dataToSend: any = {
        descripcion: formData.descripcion,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        selecciones: formData.selecciones,
        evidencias_asignadas: formData.evidencias_asignadas
      };
      
      // Solo agregar proceso_id si tiene valor
      if (formData.proceso_id !== null) {
        dataToSend.proceso_id = formData.proceso_id;
      }
      
      // Solo agregar ciclo_acreditacion_id si tiene valor
      if (formData.ciclo_acreditacion_id !== null) {
        dataToSend.ciclo_acreditacion_id = formData.ciclo_acreditacion_id;
      }
      
      console.log('Datos a enviar:', dataToSend);
      
      const response = await fetch(`${config.API_BASE_URL}/compromisos-de-mejora`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del backend:', errorData);
        throw new Error(errorData.message || 'Error al registrar el compromiso');
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error completo:', error);
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
            fechaInicio={formData.fecha_inicio}
            fechaFin={formData.fecha_fin}
            onSelectProceso={(id: number) => setFormData({ ...formData, proceso_id: id, ciclo_acreditacion_id: null })}
            onSelectCiclo={(id: number) => setFormData({ ...formData, ciclo_acreditacion_id: id, proceso_id: null })}
            onChangeFechaInicio={(fecha) => setFormData({ ...formData, fecha_inicio: fecha })}
            onChangeFechaFin={(fecha) => setFormData({ ...formData, fecha_fin: fecha })}
            descripcion={formData.descripcion}
            onChangeDescripcion={(desc) => setFormData({ ...formData, descripcion: desc })}
            error={errors.proceso}
            errorInicio={errors.fecha_inicio}
            errorFin={errors.fecha_fin}
            errorDescripcion={errors.descripcion}
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
      description="Complete el proceso de asignación de compromisos de mejora siguiendo los pasos"
      showBackButton
      onBack={() => navigate('/compromisos/listar')}
      headerExtra={
        <div className="hidden md:block">
          <WizardProgress 
            steps={steps} 
            currentStep={currentStep} 
            variant="compact"
          />
        </div>
      }
    >
      {/* Progress móvil - Solo se muestra en dispositivos pequeños */}
      <div className="block md:hidden mb-6">
        <WizardProgress 
          steps={steps} 
          currentStep={currentStep}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Step Content */}
        <div className="py-4">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
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
