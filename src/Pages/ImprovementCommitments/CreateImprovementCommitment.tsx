/**
 * CrearCompromiso - Wizard para crear compromisos de mejora
 * 
 * Flujo de 2 pasos:
 * 1. Selección de ciclo y criterios (con modal para cada criterio)
 * 2. Revisión y confirmación
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { Button, WizardProgress, PageHeader } from '@/Components/Ui/Index';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { CreateConfirmationModal } from '@/Components/Ui/Modals/CreateConfirmationModal';
import { useToast } from '@/Context/ToastContext';
import { improvementCommitmentService } from '@/Services/ImprovementCommitmentService';
import type {
  CompromisoFormData,
  CriterioSeleccionado,
  ValidationErrors,
  CrearCompromisoPayload
} from '@/Types/ImprovementCommitmentTypes';

// Importar componentes de los pasos
import { CreationStep } from './Components/CreationStep';
import type { StatusFilter } from './Components/CreationStep';
import { ReviewStep } from './Components/ReviewStep';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import { FilterButton } from '@/Components/Ui/Buttons/FilterButton';
import type { FilterOption } from '@/Components/Ui/Buttons/FilterButton';

interface WizardStep {
  id: number;
  title: string;
}

const CreateImprovementCommitment: React.FC = () => {
  const moduleInfo = getModuleInfo('improvement_commitments');
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // State recibido desde AccreditationProcessList al pulsar "Configurar"
  const locationState = (location.state ?? {}) as {
    procesoId?: string;
    cicloId?: string;
    startDate?: string;
    estimatedEndDate?: string;
  };
  const fromProcess = !!locationState.procesoId;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [submitState, setSubmitState] = useState<{ isSubmitting: boolean; errors: ValidationErrors }>({ isSubmitting: false, errors: {} });
  const isSubmitting = submitState.isSubmitting;
  const errors = submitState.errors;
  const [modals, setModals] = useState({ showSuccessModal: false, showConfirmModal: false });
  const showSuccessModal = modals.showSuccessModal;
  const showConfirmModal = modals.showConfirmModal;

  const [creationFilter, setCreationFilter] = useState<{ searchTerm: string; statusFilter: StatusFilter }>({
    searchTerm: '',
    statusFilter: 'todos',
  });

  const filterOptions: FilterOption<StatusFilter>[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'seleccionados', label: 'Seleccionados' },
    { value: 'pendientes', label: 'Pendientes' },
  ];

  const [formData, setFormData] = useState<CompromisoFormData>({
    ciclo_acreditacion_id: locationState.cicloId ? parseInt(locationState.cicloId) : null,
    proceso_id: locationState.procesoId ? parseInt(locationState.procesoId) : undefined,
    descripcion: '',
    fecha_inicio: locationState.startDate ?? '',
    fecha_fin: locationState.estimatedEndDate ?? '',
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
  const addCriterion = (criterio: CriterioSeleccionado) => {
    setFormData(prev => ({
      ...prev,
      criterios_seleccionados: [...prev.criterios_seleccionados, criterio]
    }));
  };

  /**
   * Eliminar un criterio seleccionado
   */
  const deleteCriterion = (criterioId: number) => {
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
  const updateCriterion = (criterioActualizado: CriterioSeleccionado) => {
    setFormData(prev => ({
      ...prev,
      criterios_seleccionados: prev.criterios_seleccionados.map(c =>
        c.criterio_id === criterioActualizado.criterio_id ? criterioActualizado : c
      )
    }));
  };

  /**
   * Validar el paso actual — retorna los errores encontrados, o null si no hay errores.
   */
  const validateStep = (step: number): ValidationErrors | null => {
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
        if (!fromProcess) {
          if (!formData.fecha_inicio) {
            newErrors.fecha_inicio = 'La fecha de inicio es obligatoria';
          }
          if (!formData.fecha_fin) {
            newErrors.fecha_fin = 'La fecha fin es obligatoria';
          } else if (formData.fecha_inicio && new Date(formData.fecha_fin) <= new Date(formData.fecha_inicio)) {
            newErrors.fecha_fin = 'La fecha fin debe ser posterior a la fecha de inicio';
          }
        }
        if (formData.descripcion && formData.descripcion.length > 100) {
          newErrors.descripcion = 'La descripción no puede exceder 100 caracteres';
        }
        break;
    }
    
    setSubmitState(prev => ({...prev, errors: newErrors}));
    return Object.keys(newErrors).length === 0 ? null : newErrors;
  };

  /**
   * Avanzar al siguiente paso
   */
  const handleNext = () => {
    const errs = validateStep(currentStep);
    if (!errs) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
      setSubmitState(prev => ({...prev, errors: {}}));
    } else {
      const firstMsg = Object.values(errs)[0];
      showToast({ type: 'error', title: firstMsg || 'Por favor, complete todos los campos obligatorios' });
    }
  };

  /**
   * Enviar el formulario al backend
   */
  const handleSubmit = async () => {
    if (validateStep(2)) {
      showToast({ type: 'error', title: 'Hay errores en el formulario' });
      return;
    }

    setSubmitState(prev => ({...prev, isSubmitting: true}));
    
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
        ...(formData.proceso_id !== undefined && { proceso_id: formData.proceso_id }),
        descripcion: formData.descripcion || `Compromiso de mejora ${new Date().toLocaleDateString()}`,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        selecciones,
        evidencias_asignar
      };
      
      console.log('Enviando compromiso:', payload);
      
      // Crear compromiso
      await improvementCommitmentService.crearCompromiso(payload);
      
      setModals({ showSuccessModal: true, showConfirmModal: false });
    } catch (error: any) {
      console.error('Error completo:', error);
      
      if (error.response?.data?.errors) {
        // Errores de validación del backend
        const backendErrors = error.response.data.errors as Record<string, string[]>;
        const mappedErrors: ValidationErrors = {};

        const allowedFields = new Set([
          'ciclo_acreditacion_id',
          'proceso_id',
          'descripcion',
          'fecha_inicio',
          'fecha_fin',
          'criterios',
          'evidencias_asignar',
          'selecciones'
        ]);

        Object.entries(backendErrors).forEach(([field, messages]) => {
          const message = messages?.[0] || '';
          // ciclo_acreditacion_id errors go only to toast, not to inline state
          if (field === 'ciclo_acreditacion_id' || field === 'proceso_id') {
            if (!mappedErrors.general) mappedErrors.general = message;
          } else if (allowedFields.has(field)) {
            (mappedErrors as any)[field] = message;
          } else if (!mappedErrors.general) {
            mappedErrors.general = message;
          }
        });

        if (!mappedErrors.general) {
          mappedErrors.general = Object.values(backendErrors).flat().join(', ');
        }

        // Si el backend devuelve error del ciclo/proceso, llevar al paso 1 para corregir rápido.
        if ((backendErrors as any).ciclo_acreditacion_id || (backendErrors as any).proceso_id) {
          setCurrentStep(1);
        }

        setSubmitState(prev => ({...prev, errors: mappedErrors}));

        const isDuplicateCycle = !!(backendErrors as any).ciclo_acreditacion_id || !!(backendErrors as any).proceso_id;
        showToast({
          type: 'error',
          title: isDuplicateCycle ? 'Ya existe un compromiso para este ciclo' : 'Error al crear el compromiso',
          message: mappedErrors.general || error.response?.data?.message || 'Error de validación'
        });
      } else {
        const status = error.response?.status;
        let toastTitle = 'Error al crear el compromiso';
        let toastMessage: string;

        if (status === 409) {
          toastTitle = 'Conflicto al crear el compromiso';
          toastMessage = error.response?.data?.message || 'Ya existe un registro con los mismos datos.';
        } else if (status === 500) {
          toastMessage = 'Es posible que ya exista un compromiso de mejora para este ciclo. Verifique la lista antes de intentarlo nuevamente.';
        } else if (status === 403) {
          toastTitle = 'Sin permisos';
          toastMessage = 'No tiene permisos para crear compromisos de mejora.';
        } else {
          toastMessage = error.response?.data?.message || error.message || 'Error inesperado. Intente nuevamente.';
        }

        showToast({ type: 'error', title: toastTitle, message: toastMessage });
      }

      setModals(prev => ({...prev, showConfirmModal: false}));
    } finally {
      setSubmitState(prev => ({...prev, isSubmitting: false}));
    }
  };

  /**
   * Mostrar modal de confirmación
   */
  const handleConfirmCreate = () => {
    if (validateStep(2)) {
      showToast({ type: 'error', title: 'Hay errores en el formulario' });
      return;
    }
    setModals(prev => ({...prev, showConfirmModal: true}));
  };


  /**
   * Manejar cierre del modal de éxito
   */
  const handleSuccessClose = () => {
    setModals(prev => ({...prev, showSuccessModal: false}));
    navigate(fromProcess ? '/procesos-acreditacion/listar' : '/compromisos/listar');
  };

  /**
   * Renderizar el contenido del paso actual
   */
  // (inline en el JSX, ver abajo)

  return (
    <>
      <ScreenContainer>
        <div className="space-y-4">
          {/* Header */}
          <PageHeader
                title={`Crear ${moduleInfo.title.replace('Compromisos de Mejora', 'Compromiso de Mejora')}`}
                description="Seleccione criterios y configure las asignaciones"
                headerExtra={
                  <div className="flex gap-4 items-center">
                    <WizardProgress
                      steps={steps}
                      currentStep={currentStep}
                      variant="compact"
                    />
                    {currentStep === 1 && (
                      <>
                        <SearchInput
                          value={creationFilter.searchTerm}
                          onChange={(v) => setCreationFilter(prev => ({ ...prev, searchTerm: v }))}
                          placeholder="Buscar por nomenclatura o descripción..."
                          className="w-72"
                        />
                        <FilterButton
                          tooltipText="Filtrar por estado"
                          options={filterOptions}
                          value={creationFilter.statusFilter}
                          onChange={(v) => setCreationFilter(prev => ({ ...prev, statusFilter: v as StatusFilter }))}
                        />
                      </>
                    )}
                  </div>
                }
              />

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 1 ? (
              <CreationStep
                formData={formData}
                updateFormData={updateFormData}
                agregarCriterio={addCriterion}
                eliminarCriterio={deleteCriterion}
                actualizarCriterio={updateCriterion}
                errors={errors}
                cicloFijo={fromProcess}
                searchTerm={creationFilter.searchTerm}
                statusFilter={creationFilter.statusFilter}
              />
            ) : currentStep === 2 ? (
              <ReviewStep
                formData={formData}
                updateFormData={updateFormData}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                errors={errors}
                fromProcess={fromProcess}
              />
            ) : null}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-2">
            {currentStep === 2 ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setCurrentStep(1);
                  setSubmitState(prev => ({...prev, errors: {}}));
                }}
                disabled={isSubmitting}
                standardWidth
                size="sm"
              >
                Anterior
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => navigate(fromProcess ? '/procesos-acreditacion/listar' : '/compromisos/listar')}
                disabled={isSubmitting}
                standardWidth
                size="sm"
              >
                Regresar
              </Button>
            )}

            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                variant="primary"
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleConfirmCreate}
                disabled={isSubmitting}
                variant="primary"
              >
                Crear
              </Button>
            )}
          </div>
        </div>
      </ScreenContainer>

      {/* Modal de Confirmación */}
      <CreateConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setModals(prev => ({...prev, showConfirmModal: false}))}
        onConfirm={handleSubmit}
        title="Confirmar creación de compromiso"
        message="¿Está seguro de que desea crear este compromiso de mejora? Se asignarán todas las evidencias y notificaciones a los encargados."
        itemType="compromiso de mejora"
        confirmLabel="Crear"
        isLoading={isSubmitting}
      />

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

export default CreateImprovementCommitment;
