/**
 * CrearCompromiso - Wizard para crear compromisos de mejora
 * 
 * Flujo de 2 pasos:
 * 1. Selección de ciclo y criterios (con modal para cada criterio)
 * 2. Revisión y confirmación
 */

import React, { useState, useEffect } from 'react';
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
  ElementoSeleccionado,
  ValidationErrors,
  CrearCompromisoPayload,
  CrearCompromisoElementoPayload,
  Criterio,
} from '@/Types/ImprovementCommitmentTypes';
import type { FlexibleElement } from '@/Types/StructureModelTypes';
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
    modeloTipo?: string;
    modeloId?: number;
  };
  const fromProcess = !!locationState.procesoId;
  const isFlexible = locationState.modeloTipo === 'elemento_flexible';
  
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
    criterios_seleccionados: [],
    elementos_seleccionados: [],
  });

  const [existingCompromisoId, setExistingCompromisoId] = useState<number | null>(null);
  const [existingElementIdMap, setExistingElementIdMap] = useState<Record<number, number>>({});

  const steps: WizardStep[] = [
    { id: 1, title: 'Configuración' },
    { id: 2, title: 'Revisión' }
  ];

  // Cargar datos existentes al abrir si el proceso ya tiene compromiso configurado
  useEffect(() => {
    if (!fromProcess || !locationState.procesoId) return;
    const procesoId = parseInt(locationState.procesoId);
    if (isFlexible) {
      improvementCommitmentService.obtenerCompromisoElementosPorProceso(procesoId)
        .then(commitments => {
          if (!commitments.length) return;
          const idMap: Record<number, number> = {};
          const elementosSeleccionados: ElementoSeleccionado[] = [];
          commitments.forEach((commitment: any) => {
            const assignments: any[] = commitment.assigned_elements ?? [];
            if (!assignments.length) return;
            const byElemento: Record<number, any[]> = {};
            assignments.forEach((a: any) => {
              if (!byElemento[a.elemento_id]) byElemento[a.elemento_id] = [];
              byElemento[a.elemento_id].push(a);
            });
            Object.entries(byElemento).forEach(([elIdStr, assigns]) => {
              const elementoId = Number(elIdStr);
              idMap[elementoId] = commitment.compromiso_elemento_id;
              const elementDetails = assigns[0]?.element;
              elementosSeleccionados.push({
                elemento_id: elementoId,
                elemento: {
                  elemento_id: elementoId,
                  modelo_estructura_id: locationState.modeloId ?? 0,
                  padre_id: elementDetails?.padre_id ?? null,
                  tipo: elementDetails?.tipo ?? '',
                  nombre: elementDetails?.nombre ?? null,
                  categoria: elementDetails?.categoria ?? null,
                  nomenclatura: elementDetails?.nomenclatura ?? null,
                  descripcion: elementDetails?.descripcion ?? null,
                  activo: elementDetails?.activo ?? true,
                  created_at: elementDetails?.created_at ?? '',
                  updated_at: elementDetails?.updated_at ?? '',
                } as FlexibleElement,
                encargados_usuarios: assigns.map((a: any) => a.usuario_id),
                encargados_roles: [],
                fecha_limite: assigns[0]?.fecha_limite ?? '',
                comentario: assigns[0]?.comentario ?? '',
              });
            });
          });
          setExistingElementIdMap(idMap);
          if (elementosSeleccionados.length) {
            setFormData(prev => ({ ...prev, elementos_seleccionados: elementosSeleccionados }));
          }
        })
        .catch(() => {});
    } else {
      improvementCommitmentService.obtenerCompromisoPorProceso(procesoId)
        .then(commitment => {
          if (!commitment) return;
          setExistingCompromisoId(commitment.compromiso_mejora_id);
          const assignedEvidences: any[] = (commitment as any).assigned_evidences ?? [];
          const criteriosSeleccionados: CriterioSeleccionado[] = ((commitment as any).selecciones ?? []).map((sel: any) => {
            const criterioId: number = sel.criterio?.criterio_id;
            const evidenciaIds: number[] = (sel.evidencias ?? []).map((e: any) => e.evidencia_id);
            const matchingAssignments = assignedEvidences.filter(ae => evidenciaIds.includes(ae.evidencia_id));
            const uniqueUsers = [...new Set(matchingAssignments.map((ae: any) => ae.usuario_id as number))];
            return {
              criterio_id: criterioId,
              criterio: {
                criterio_id: criterioId,
                nomenclatura: sel.criterio?.nomenclatura ?? '',
                descripcion: sel.criterio?.descripcion ?? '',
                componente_id: 0,
                activo: true,
              } as Criterio,
              evidencias_seleccionadas: evidenciaIds,
              encargados_usuarios: uniqueUsers,
              encargados_roles: [],
              fecha_limite: matchingAssignments[0]?.fecha_limite ?? '',
              comentario: matchingAssignments[0]?.pivot?.comentario ?? matchingAssignments[0]?.comentario ?? '',
            } as CriterioSeleccionado;
          });
          setFormData(prev => ({
            ...prev,
            descripcion: (commitment as any).descripcion ?? '',
            fecha_inicio: (commitment as any).fecha_inicio ?? prev.fecha_inicio,
            fecha_fin: (commitment as any).fecha_fin ?? prev.fecha_fin,
            criterios_seleccionados: criteriosSeleccionados,
          }));
        })
        .catch(() => {});
    }
  }, []);

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
   * Agregar un elemento seleccionado (modelo flexible)
   */
  const addElemento = (elemento: ElementoSeleccionado) => {
    setFormData(prev => ({
      ...prev,
      elementos_seleccionados: [...(prev.elementos_seleccionados ?? []), elemento],
    }));
  };

  /**
   * Eliminar un elemento seleccionado (modelo flexible)
   */
  const deleteElemento = (elementoId: number) => {
    setFormData(prev => ({
      ...prev,
      elementos_seleccionados: (prev.elementos_seleccionados ?? []).filter(
        e => e.elemento_id !== elementoId
      ),
    }));
  };

  /**
   * Actualizar un elemento existente (modelo flexible)
   */
  const updateElemento = (elementoActualizado: ElementoSeleccionado) => {
    setFormData(prev => ({
      ...prev,
      elementos_seleccionados: (prev.elementos_seleccionados ?? []).map(e =>
        e.elemento_id === elementoActualizado.elemento_id ? elementoActualizado : e
      ),
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
        if (isFlexible) {
          if (!formData.elementos_seleccionados?.length) {
            newErrors.criterios = 'Debe seleccionar al menos un elemento';
          }
        } else {
          if (formData.criterios_seleccionados.length === 0) {
            newErrors.criterios = 'Debe seleccionar al menos un criterio';
          }
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
      if (isFlexible) {
        // Modelo flexible — un compromiso por elemento seleccionado
        const elementosSeleccionados = formData.elementos_seleccionados ?? [];
        const descripcionBase = formData.descripcion || `Compromiso de mejora ${new Date().toLocaleDateString()}`;

        for (const elemento of elementosSeleccionados) {
          const payload: CrearCompromisoElementoPayload = {
            proceso_id: formData.proceso_id!,
            elemento_id: elemento.elemento_id,
            descripcion: descripcionBase,
            fecha_inicio: formData.fecha_inicio,
            fecha_fin: formData.fecha_fin,
            elementos_asignar: improvementCommitmentService.transformarElementosParaBackend(elemento),
          };
          const existingId = existingElementIdMap[elemento.elemento_id];
          if (existingId) {
            await improvementCommitmentService.actualizarCompromisoElemento(existingId, {
              elementos_asignar: improvementCommitmentService.transformarElementosParaBackend(elemento),
              descripcion: descripcionBase,
              fecha_inicio: formData.fecha_inicio,
              fecha_fin: formData.fecha_fin,
              elemento_id: elemento.elemento_id,
            });
          } else {
            await improvementCommitmentService.crearCompromisoElemento(payload);
          }
        }
      } else {
        // Modelo tradicional — un único compromiso con todos los criterios
        const selecciones = improvementCommitmentService.transformarCriteriosParaBackend(
          formData.criterios_seleccionados
        );
        const evidencias_asignar = improvementCommitmentService.transformarEvidenciasParaBackend(
          formData.criterios_seleccionados
        );
        const payload: CrearCompromisoPayload = {
          ciclo_acreditacion_id: formData.ciclo_acreditacion_id!,
          ...(formData.proceso_id !== undefined && { proceso_id: formData.proceso_id }),
          descripcion: formData.descripcion || `Compromiso de mejora ${new Date().toLocaleDateString()}`,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin,
          selecciones,
          evidencias_asignar,
        };
        if (existingCompromisoId) {
          await improvementCommitmentService.actualizarCompromiso(existingCompromisoId, {
            selecciones,
            evidencias_asignar,
            descripcion: payload.descripcion,
            fecha_inicio: payload.fecha_inicio,
            fecha_fin: payload.fecha_fin,
          });
        } else {
          await improvementCommitmentService.crearCompromiso(payload);
        }
      }
      
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

        setSubmitState(prev => ({...prev, errors: mappedErrors}));

        showToast({
          type: 'error',
          title: 'Error al configurar el compromiso',
          message: mappedErrors.general || error.response?.data?.message || 'Error de validación'
        });
      } else {
        const status = error.response?.status;
        let toastTitle = 'Error al configurar el compromiso';
        let toastMessage: string;

        if (status === 409) {
          toastTitle = 'Conflicto al configurar el compromiso';
          toastMessage = error.response?.data?.message || 'Ya existe un registro con los mismos datos.';
        } else if (status === 500) {
          toastMessage = 'Error interno al configurar el compromiso. Intente nuevamente.';
        } else if (status === 403) {
          toastTitle = 'Sin permisos';
          toastMessage = 'No tiene permisos para configurar compromisos de mejora.';
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
    navigate('/procesos-acreditacion/listar');
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
                title={`Configurar ${moduleInfo.title.replace('Compromisos de Mejora', 'Compromiso de Mejora')}`}
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
                agregarElemento={addElemento}
                eliminarElemento={deleteElemento}
                actualizarElemento={updateElemento}
                errors={errors}
                cicloFijo={fromProcess}
                searchTerm={creationFilter.searchTerm}
                statusFilter={creationFilter.statusFilter}
                modeloTipo={locationState.modeloTipo}
                modeloId={locationState.modeloId}
              />
            ) : currentStep === 2 ? (
              <ReviewStep
                formData={formData}
                updateFormData={updateFormData}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                errors={errors}
                fromProcess={fromProcess}
                modeloTipo={locationState.modeloTipo}
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
                onClick={() => navigate('/procesos-acreditacion/listar')}
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
                Configurar
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
        title="Confirmar configuración de compromiso"
        message="¿Está seguro de que desea configurar este compromiso de mejora? Se guardarán todas las asignaciones y notificaciones a los encargados."
        itemType="compromiso de mejora"
        confirmLabel="Configurar"
        isLoading={isSubmitting}
      />

      {/* Modal de Éxito */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Compromiso configurado exitosamente"
        message="El compromiso de mejora ha sido guardado correctamente en el sistema."
      />
    </>
  );
};

export default CreateImprovementCommitment;
