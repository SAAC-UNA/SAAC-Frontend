/**
 * CrearCompromiso - Wizard para crear compromisos de mejora
 *
 * Flujo de 2 pasos:
 * 1. Selección de ciclo y criterios (con modal para cada criterio)
 * 2. Revisión y confirmación
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/Constants/ROUTES';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { Button, PageHeader } from '@/Components/Ui/Index';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { CreateConfirmationModal } from '@/Components/Ui/Modals/CreateConfirmationModal';
import { useToast } from '@/Context/ToastContext';
import { improvementCommitmentService } from '@/Services/ImprovementCommitmentService';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { DateRangePicker, type DateRange } from '@/Components/Ui/Calendar/DateRangePicker';
import type {
  CompromisoFormData,
  CriterioSeleccionado,
  ElementoSeleccionado,
  ValidationErrors,
  CrearCompromisoPayload,
  CrearCompromisoElementoPayload,
  Criterio,
} from "@/Types/ImprovementCommitmentTypes";
import type { FlexibleElement } from "@/Types/StructureModelTypes";
// Importar componentes de los pasos
import { CreationStep } from './Components/CreationStep';
import type { StatusFilter } from './Components/CreationStep';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import { FilterButton } from '@/Components/Ui/Buttons/FilterButton';
import type { FilterOption } from '@/Components/Ui/Buttons/FilterButton';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import type { SelectOption } from '@/Components/Ui/Forms/SingleSelect';


const CreateImprovementCommitment: React.FC = () => {
  const moduleInfo = getModuleInfo("improvement_commitments");
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // State recibido desde AccreditationProcessList al pulsar "Configurar".
  // Los datos de contexto del proceso se pasan vía navigate state, no por query params.
  const locationState = (location.state ?? {}) as {
    procesoId?: string;
    cicloId?: string;
    startDate?: string;
    estimatedEndDate?: string;
    modeloTipo?: string;
    modeloId?: number;
  };
  const procesoId   = locationState.procesoId   ?? undefined;
  const cicloId     = locationState.cicloId     ?? undefined;
  const startDate   = locationState.startDate   ?? undefined;
  const estimatedEndDate = locationState.estimatedEndDate ?? undefined;
  const modeloTipo  = locationState.modeloTipo  ?? undefined;
  const modeloIdRaw = locationState.modeloId    ?? undefined;

  const fromProcess = !!procesoId;
  const isFlexible  = modeloTipo === 'elemento_flexible';
  
  const [submitState, setSubmitState] = useState<{ isSubmitting: boolean; errors: ValidationErrors }>({ isSubmitting: false, errors: {} });
  const isSubmitting = submitState.isSubmitting;
  const errors = submitState.errors;
  const [modals, setModals] = useState({
    showSuccessModal: false,
    showConfirmModal: false,
  });
  const showSuccessModal = modals.showSuccessModal;
  const showConfirmModal = modals.showConfirmModal;

  const [creationFilter, setCreationFilter] = useState<{
    searchTerm: string;
    statusFilter: StatusFilter;
  }>({
    searchTerm: "",
    statusFilter: "todos",
  });

  const [cicloOptions, setCicloOptions] = useState<SelectOption[]>([]);

  const handleCicloChange = (value: string) => {
    setFormData(prev => ({ ...prev, ciclo_acreditacion_id: parseInt(value) }));
  };

  const filterOptions: FilterOption<StatusFilter>[] = [
    { value: "todos", label: "Todos" },
    { value: "seleccionados", label: "Seleccionados" },
    { value: "pendientes", label: "Pendientes" },
  ];

  const [formData, setFormData] = useState<CompromisoFormData>({
    ciclo_acreditacion_id: cicloId ? parseInt(cicloId) : null,
    proceso_id: procesoId ? parseInt(procesoId) : undefined,
    descripcion: '',
    fecha_inicio: startDate ?? '',
    fecha_fin: estimatedEndDate ?? '',
    criterios_seleccionados: [],
    elementos_seleccionados: [],
  });

  const [existingCompromisoId, setExistingCompromisoId] = useState<
    number | null
  >(null);
  const [existingElementIdMap, setExistingElementIdMap] = useState<
    Record<number, number>
  >({});


  // Cargar datos existentes al abrir si el proceso ya tiene compromiso configurado
  useEffect(() => {
    if (!fromProcess || !procesoId) return;
    const procesoIdNum = parseInt(procesoId);
    if (isFlexible) {
      improvementCommitmentService.obtenerCompromisoElementosPorProceso(procesoIdNum)
        .then(commitments => {
          if (!commitments.length) return;
          const idMap: Record<number, number> = {};
          const elementosSeleccionados: ElementoSeleccionado[] = [];
          commitments.forEach((commitment: any) => {
            const assignments: any[] = commitment.assigned_elements ?? [];
            if (!assignments.length) return;

            // Group by the PAUTA's ID (element.padre_id), not the fuente's own ID.
            // When pautas are leaves (flat model) padre_id is null, so fall back to
            // the element's own ID so the badge check still matches.
            const byPauta: Record<number, any[]> = {};
            assignments.forEach((a: any) => {
              const pautaId = a.element?.padre_id ?? a.elemento_id;
              if (!byPauta[pautaId]) byPauta[pautaId] = [];
              byPauta[pautaId].push(a);
            });
            Object.entries(byPauta).forEach(([pautaIdStr, assigns]) => {
              const pautaId = Number(pautaIdStr);
              idMap[pautaId] = commitment.compromiso_elemento_id;
              const hasFuentes = !!assigns[0]?.element?.padre_id;
              const hijoIds = hasFuentes ? [...new Set(assigns.map((a: any) => a.elemento_id as number))] : undefined;
              const uniqueUsers = [...new Set(assigns.map((a: any) => a.usuario_id as number))];
              const usuariosInfo = assigns
                .filter((a: any, i: number, arr: any[]) => arr.findIndex(x => x.usuario_id === a.usuario_id) === i)
                .map((a: any) => ({ id: a.usuario_id as number, name: (a.user?.name ?? a.user?.nombre ?? '') as string }));
              elementosSeleccionados.push({
                elemento_id: pautaId,
                elemento: {
                  elemento_id: pautaId,
                  modelo_estructura_id: modeloIdRaw ?? 0,
                  padre_id: null,
                  tipo: '',
                  nombre: null,
                  categoria: null,
                  nomenclatura: null,
                  descripcion: null,
                  activo: true,
                  created_at: '',
                  updated_at: '',
                } as FlexibleElement,
                hijos_seleccionados: hijoIds,
                encargados_usuarios: uniqueUsers,
                encargados_roles: [],
                encargados_usuarios_info: usuariosInfo,
                fecha_limite: assigns[0]?.fecha_limite ?? '',
                comentario: assigns[0]?.comentario ?? '',
              });
            });
          });
          setExistingElementIdMap(idMap);
          if (elementosSeleccionados.length) {
            setFormData((prev) => ({
              ...prev,
              elementos_seleccionados: elementosSeleccionados,
            }));
          }
        })
        .catch(() => {});
    } else {
      improvementCommitmentService.obtenerCompromisoPorProceso(procesoIdNum)
        .then(commitment => {
          if (!commitment) return;
          setExistingCompromisoId(commitment.compromiso_mejora_id);
          const assignedEvidences: any[] =
            (commitment as any).assigned_evidences ?? [];
          const criteriosSeleccionados: CriterioSeleccionado[] = (
            (commitment as any).selecciones ?? []
          ).map((sel: any) => {
            const criterioId: number = sel.criterio?.criterio_id;
            const evidenciaIds: number[] = (sel.evidencias ?? []).map((e: any) => e.evidencia_id);
            const matchingAssignments = assignedEvidences.filter(ae => evidenciaIds.includes(ae.evidencia_id));
            const uniqueUsers = [...new Set(matchingAssignments.map((ae: any) => ae.usuario_id as number))];
            const usuariosInfo = matchingAssignments
              .filter((ae: any, i: number, arr: any[]) => arr.findIndex(x => x.usuario_id === ae.usuario_id) === i)
              .map((ae: any) => ({ id: ae.usuario_id as number, name: (ae.user?.name ?? ae.user?.nombre ?? '') as string }));
            return {
              criterio_id: criterioId,
              criterio: {
                criterio_id: criterioId,
                nomenclatura: sel.criterio?.nomenclatura ?? "",
                descripcion: sel.criterio?.descripcion ?? "",
                componente_id: 0,
                activo: true,
              } as Criterio,
              evidencias_seleccionadas: evidenciaIds,
              encargados_usuarios: uniqueUsers,
              encargados_roles: [],
              encargados_usuarios_info: usuariosInfo,
              fecha_limite: matchingAssignments[0]?.fecha_limite ?? '',
              comentario: matchingAssignments[0]?.pivot?.comentario ?? matchingAssignments[0]?.comentario ?? '',
            } as CriterioSeleccionado;
          });
          setFormData((prev) => ({
            ...prev,
            descripcion: (commitment as any).descripcion ?? "",
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
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  /**
   * Agregar un criterio seleccionado
   */
  const addCriterion = (criterio: CriterioSeleccionado) => {
    setFormData((prev) => ({
      ...prev,
      criterios_seleccionados: [...prev.criterios_seleccionados, criterio],
    }));
  };

  /**
   * Eliminar un criterio seleccionado
   */
  const deleteCriterion = (criterioId: number) => {
    setFormData((prev) => ({
      ...prev,
      criterios_seleccionados: prev.criterios_seleccionados.filter(
        (c) => c.criterio_id !== criterioId,
      ),
    }));
  };

  /**
   * Actualizar un criterio existente
   */
  const updateCriterion = (criterioActualizado: CriterioSeleccionado) => {
    setFormData((prev) => ({
      ...prev,
      criterios_seleccionados: prev.criterios_seleccionados.map((c) =>
        c.criterio_id === criterioActualizado.criterio_id
          ? criterioActualizado
          : c,
      ),
    }));
  };

  /**
   * Agregar un elemento seleccionado (modelo flexible)
   */
  const addElemento = (elemento: ElementoSeleccionado) => {
    setFormData((prev) => ({
      ...prev,
      elementos_seleccionados: [
        ...(prev.elementos_seleccionados ?? []),
        elemento,
      ],
    }));
  };

  /**
   * Eliminar un elemento seleccionado (modelo flexible)
   */
  const deleteElemento = (elementoId: number) => {
    setFormData((prev) => ({
      ...prev,
      elementos_seleccionados: (prev.elementos_seleccionados ?? []).filter(
        (e) => e.elemento_id !== elementoId,
      ),
    }));
  };

  /**
   * Actualizar un elemento existente (modelo flexible)
   */
  const updateElemento = (elementoActualizado: ElementoSeleccionado) => {
    setFormData((prev) => ({
      ...prev,
      elementos_seleccionados: (prev.elementos_seleccionados ?? []).map((e) =>
        e.elemento_id === elementoActualizado.elemento_id
          ? elementoActualizado
          : e,
      ),
    }));
  };

  /**
   * Validar el formulario — retorna los errores encontrados, o null si no hay errores.
   */
  const validateStep = (): ValidationErrors | null => {
    const newErrors: ValidationErrors = {};
    
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

    setSubmitState((prev) => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0 ? null : newErrors;
  };

  /**
   * Enviar el formulario al backend
   */
  const handleSubmit = async () => {
    if (validateStep()) {
      showToast({ type: 'error', title: 'Hay errores en el formulario' });
      return;
    }

    setSubmitState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      if (isFlexible) {
        // Modelo flexible — un compromiso por elemento seleccionado
        const elementosSeleccionados = formData.elementos_seleccionados ?? [];
        const descripcionBase =
          formData.descripcion ||
          `Compromiso de mejora ${new Date().toLocaleDateString()}`;

        for (const elemento of elementosSeleccionados) {
          const payload: CrearCompromisoElementoPayload = {
            proceso_id: formData.proceso_id!,
            elemento_id: elemento.elemento_id,
            descripcion: descripcionBase,
            fecha_inicio: formData.fecha_inicio,
            fecha_fin: formData.fecha_fin,
            elementos_asignar:
              improvementCommitmentService.transformarElementosParaBackend(
                elemento,
              ),
          };
          const existingId = existingElementIdMap[elemento.elemento_id];
          if (existingId) {
            await improvementCommitmentService.actualizarCompromisoElemento(
              existingId,
              {
                elementos_asignar:
                  improvementCommitmentService.transformarElementosParaBackend(
                    elemento,
                  ),
                descripcion: descripcionBase,
                fecha_inicio: formData.fecha_inicio,
                fecha_fin: formData.fecha_fin,
                elemento_id: elemento.elemento_id,
              },
            );
          } else {
            await improvementCommitmentService.crearCompromisoElemento(payload);
          }
        }
      } else {
        // Modelo tradicional — un único compromiso con todos los criterios
        const selecciones =
          improvementCommitmentService.transformarCriteriosParaBackend(
            formData.criterios_seleccionados,
          );
        const evidencias_asignar =
          improvementCommitmentService.transformarEvidenciasParaBackend(
            formData.criterios_seleccionados,
          );
        const payload: CrearCompromisoPayload = {
          ciclo_acreditacion_id: formData.ciclo_acreditacion_id!,
          ...(formData.proceso_id !== undefined && {
            proceso_id: formData.proceso_id,
          }),
          descripcion:
            formData.descripcion ||
            `Compromiso de mejora ${new Date().toLocaleDateString()}`,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin,
          selecciones,
          evidencias_asignar,
        };
        if (existingCompromisoId) {
          await improvementCommitmentService.actualizarCompromiso(
            existingCompromisoId,
            {
              selecciones,
              evidencias_asignar,
              descripcion: payload.descripcion,
              fecha_inicio: payload.fecha_inicio,
              fecha_fin: payload.fecha_fin,
            },
          );
        } else {
          await improvementCommitmentService.crearCompromiso(payload);
        }
      }

      setModals({ showSuccessModal: true, showConfirmModal: false });
    } catch (error: any) {
      console.error("Error completo:", error);

      if (error.response?.data?.errors) {
        // Errores de validación del backend
        const backendErrors = error.response.data.errors as Record<
          string,
          string[]
        >;
        const mappedErrors: ValidationErrors = {};

        const allowedFields = new Set([
          "ciclo_acreditacion_id",
          "proceso_id",
          "descripcion",
          "fecha_inicio",
          "fecha_fin",
          "criterios",
          "evidencias_asignar",
          "selecciones",
        ]);

        Object.entries(backendErrors).forEach(([field, messages]) => {
          const message = messages?.[0] || "";
          // ciclo_acreditacion_id errors go only to toast, not to inline state
          if (field === "ciclo_acreditacion_id" || field === "proceso_id") {
            if (!mappedErrors.general) mappedErrors.general = message;
          } else if (allowedFields.has(field)) {
            (mappedErrors as any)[field] = message;
          } else if (!mappedErrors.general) {
            mappedErrors.general = message;
          }
        });

        if (!mappedErrors.general) {
          mappedErrors.general = Object.values(backendErrors).flat().join(", ");
        }

        setSubmitState((prev) => ({ ...prev, errors: mappedErrors }));

        showToast({
          type: "error",
          title: "Error al configurar el compromiso",
          message:
            mappedErrors.general ||
            error.response?.data?.message ||
            "Error de validación",
        });
      } else {
        const status = error.response?.status;
        let toastTitle = "Error al configurar el compromiso";
        let toastMessage: string;

        if (status === 409) {
          toastTitle = "Conflicto al configurar el compromiso";
          toastMessage =
            error.response?.data?.message ||
            "Ya existe un registro con los mismos datos.";
        } else if (status === 500) {
          toastMessage =
            "Error interno al configurar el compromiso. Intente nuevamente.";
        } else if (status === 403) {
          toastTitle = "Sin permisos";
          toastMessage =
            "No tiene permisos para configurar compromisos de mejora.";
        } else {
          toastMessage =
            error.response?.data?.message ||
            error.message ||
            "Error inesperado. Intente nuevamente.";
        }

        showToast({ type: "error", title: toastTitle, message: toastMessage });
      }

      setModals((prev) => ({ ...prev, showConfirmModal: false }));
    } finally {
      setSubmitState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  /**
   * Mostrar modal de confirmación
   */
  const handleConfirmCreate = () => {
    if (validateStep()) {
      showToast({ type: 'error', title: 'Hay errores en el formulario' });
      return;
    }
    setModals((prev) => ({ ...prev, showConfirmModal: true }));
  };

  /**
   * Manejar cierre del modal de éxito
   */
  const handleSuccessClose = () => {
    setModals((prev) => ({ ...prev, showSuccessModal: false }));
    navigate(ROUTES.ACCREDITATION_PROCESSES);
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
            breadcrumbMode="cycle-only"
            headerExtra={
              <div className="flex gap-4 items-center">
                <CustomSelect
                  label="Ciclo"
                  value={formData.ciclo_acreditacion_id?.toString() || ''}
                  options={cicloOptions}
                  placeholder="Seleccione un ciclo..."
                  onChange={handleCicloChange}
                  required
                  error={errors.ciclo_acreditacion_id}
                  size="sm"
                  disabled={fromProcess}
                  className="w-60"
                />
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
              </div>
            }
          />

          {/* Criterios / Elementos */}
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
            modeloTipo={modeloTipo}
            modeloId={modeloIdRaw}
            onCiclosLoaded={setCicloOptions}
          />

          {/* Información opcional del compromiso */}
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <Textarea
                label="Descripción del Compromiso (opcional)"
                value={formData.descripcion}
                onChange={(e) => updateFormData({ descripcion: e.target.value })}
                placeholder="Descripción general del compromiso de mejora..."
                rows={3}
                maxLength={100}
                characterCount
                error={errors.descripcion}
                helperText="Máximo 100 caracteres"
              />
            </div>
            {!fromProcess && (
              <div className="w-80">
                <DateRangePicker
                  label="Periodo del Compromiso"
                  value={{ from: formData.fecha_inicio, to: formData.fecha_fin }}
                  onChange={(range: DateRange) => {
                    updateFormData({
                      fecha_inicio: range?.from ?? '',
                      fecha_fin: range?.to ?? '',
                    });
                  }}
                  error={errors.fecha_inicio || errors.fecha_fin}
                  required
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-2">
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.ACCREDITATION_PROCESSES)}
              disabled={isSubmitting}
              standardWidth
              size="sm"
            >
              Regresar
            </Button>
            <Button
              onClick={handleConfirmCreate}
              disabled={isSubmitting}
              variant="primary"
            >
              Configurar
            </Button>
          </div>
        </div>
      </ScreenContainer>

      {/* Modal de Confirmación */}
      <CreateConfirmationModal
        isOpen={showConfirmModal}
        onClose={() =>
          setModals((prev) => ({ ...prev, showConfirmModal: false }))
        }
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
