import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ScreenContainer, PageHeader, Button } from '@/Components/Ui/Index';
import { useToast } from '@/Context/ToastContext';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { axiosInstance } from '@/Config/axios';
import { ApprovalModal } from './Components/ApprovalModal';
import { EvidenceApprovalModal } from './Components/EvidenceApprovalModal';
import { CriterionEvidencesModal } from './Components/CriterionEvidencesModal.tsx';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { BlockApprovalTable } from './Components/BlockApprovalTable';
import type { Criterio, Evidencia, EvidenceApprovalItem, EvidenceApprovalStatus } from './Components/BlockApprovalTable';
import { GLOBAL_FILTER_CONTEXT_CHANGED_EVENT } from '@/Services/GlobalFilterContextService';
import { getOperationalContextSnapshot } from '@/Services/OperationalContextStore';

type BlockApprovalStatus = 'pendiente' | 'aprobado' | 'rechazado' | 'incompleto';

interface Proceso {
  proceso_id: number;
  tipo_proceso: string;
  accreditation_cycle: {
    ciclo_acreditacion_id: number;
    nombre: string;
    career_campus: {
      career: { nombre: string };
      campus: { nombre: string };
    };
    modelo_estructura?: {
      modelo_estructura_id: number;
      tipo: string;
    };
  };
}

const normalizeSearchValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';

  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const BlockApproval: React.FC = () => {
  const moduleInfo = getModuleInfo("block_approval");
  const { showToast } = useToast();
  const [dataState, setDataState] = useState<{
    isLoading: boolean;
    criteria: Criterio[];
    evidences: Evidencia[];
    processes: Proceso[];
  }>({ isLoading: true, criteria: [], evidences: [], processes: [] });

  const [filterState, setFilterState] = useState<{
    selectedProcesoId: number | null;
    currentPage: number;
    searchTerm: string;
  }>({ selectedProcesoId: null, currentPage: 1, searchTerm: '' });

  // Aprobaciones individuales por criterio
  const [evidenceApprovalsByCriterion, setEvidenceApprovalsByCriterion] =
    useState<Record<number, EvidenceApprovalItem[]>>({});
  const [loadingEvidences, setLoadingEvidences] = useState<Set<number>>(
    new Set(),
  );

  // Modal de bloque (approve/reject por criterio)
  const [approvalState, setApprovalState] = useState<{
    isOpen: boolean;
    action: "aprobar" | "rechazar";
    criterion: Criterio | null;
    successOpen: boolean;
  }>({ isOpen: false, action: "aprobar", criterion: null, successOpen: false });

  // Modal de evidencia individual
  const [evidenceModal, setEvidenceModal] = useState<{
    isOpen: boolean;
    action: "aprobar" | "rechazar";
    criterio: Criterio | null;
    evidencia: EvidenceApprovalItem | null;
    successOpen: boolean;
  }>({
    isOpen: false,
    action: "aprobar",
    criterio: null,
    evidencia: null,
    successOpen: false,
  });

  // Modal de listado por criterio/bloque (reemplaza dropdown de fila)
  const [criterionEvidencesModal, setCriterionEvidencesModal] = useState<{
    open: boolean;
    criterio: Criterio | null;
  }>({ open: false, criterio: null });

  const [bulkApprovalState, setBulkApprovalState] = useState<{
    isOpen: boolean;
    loading: boolean;
    successOpen: boolean;
    approvedCount: number;
  }>({
    isOpen: false,
    loading: false,
    successOpen: false,
    approvedCount: 0,
  });

  const extractValidationMessage = (error: any, fallback: string): string => {
    const validationErrors = error?.response?.data?.errors;

    if (validationErrors && typeof validationErrors === 'object') {
      for (const value of Object.values(validationErrors)) {
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
          return value[0];
        }

        if (typeof value === 'string' && value.trim().length > 0) {
          return value;
        }
      }
    }

    return error?.response?.data?.message || error?.message || fallback;
  };

  const { isLoading, criteria, evidences, processes } = dataState;
  const { selectedProcesoId, currentPage, searchTerm } = filterState;
  const itemsPerPage = TABLE_PAGE_SIZE.standard;

  const selectedProcess = useMemo(
    () => processes.find(p => p.proceso_id === selectedProcesoId) ?? null,
    [processes, selectedProcesoId]);
  const isFlexible = selectedProcess?.accreditation_cycle?.modelo_estructura?.tipo === 'elemento_flexible';

  // Limpiar caché de evidencias y recargar datos cuando cambie el proceso
  useEffect(() => {
    setEvidenceApprovalsByCriterion({});
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProcesoId]);

  useEffect(() => {
    const syncSelectedProcessFromContext = () => {
      const snapshot = getOperationalContextSnapshot();
      const nextProcessId = snapshot.processId;

      setFilterState((prev) => {
        if (prev.selectedProcesoId === nextProcessId) {
          return prev;
        }

        return {
          ...prev,
          selectedProcesoId: nextProcessId,
          currentPage: 1,
        };
      });
    };

    syncSelectedProcessFromContext();

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener(
      GLOBAL_FILTER_CONTEXT_CHANGED_EVENT,
      syncSelectedProcessFromContext,
    );

    return () => {
      window.removeEventListener(
        GLOBAL_FILTER_CONTEXT_CHANGED_EVENT,
        syncSelectedProcessFromContext,
      );
    };
  }, []);

  const fetchData = async () => {
    setDataState(prev => ({ ...prev, isLoading: true }));
    try {
      const processesResponse = await axiosInstance.get('/estructura/procesos');
      const processesArray: Proceso[] = processesResponse.data.data || processesResponse.data;

      // Detect model type from the currently selected process
      const selectedRaw = processesArray.find(p => p.proceso_id === selectedProcesoId);
      const modeloEstructura = selectedRaw?.accreditation_cycle?.modelo_estructura;
      const isSelectedFlexible = modeloEstructura?.tipo === 'elemento_flexible';
      const selectedModeloId = modeloEstructura?.modelo_estructura_id;

      if (isSelectedFlexible && selectedModeloId && selectedProcesoId) {
        // ── Flexible mode: load elements + assignments + element approvals ────
        const [elementsResponse, assignmentsResponse, approvalsResponse] = await Promise.all([
          axiosInstance.get('/estructura/elementos', { params: { modelo_estructura_id: selectedModeloId } }),
          axiosInstance.get(`/procesos/${selectedProcesoId}/elementos-asignaciones`),
          axiosInstance.get('/aprobaciones-elementos', { params: { proceso_id: selectedProcesoId } }),
        ]);

        const allElements: any[] = Array.isArray(elementsResponse.data)
          ? elementsResponse.data
          : elementsResponse.data?.data ?? [];
        const allAssignments: any[] = assignmentsResponse.data.data ?? assignmentsResponse.data ?? [];
        const allApprovals: any[] = approvalsResponse.data.data || approvalsResponse.data;

        const parseApprovalTimestamp = (value: unknown): number => {
          if (typeof value !== 'string') return 0;
          const ts = Date.parse(value);
          return Number.isFinite(ts) ? ts : 0;
        };

        const latestApprovalByElement = new Map<
          number,
          { estado: BlockApprovalStatus; comentario: string | null; updated_at?: string | null }
        >();

        const approvalsByElementAndUser = new Map<
          number,
          Record<string, { approval_status: EvidenceApprovalStatus; comentario_rechazo?: string | null }>
        >();

        allApprovals.forEach((approval: any) => {
          const elementId = Number(approval?.elemento_id);
          if (!Number.isFinite(elementId)) return;

          const next = {
            estado: (approval?.estado ?? 'pendiente') as BlockApprovalStatus,
            comentario: approval?.comentario ?? null,
            updated_at: typeof approval?.updated_at === 'string' ? approval.updated_at : null,
          };

          const previous = latestApprovalByElement.get(elementId);
          if (
            !previous ||
            parseApprovalTimestamp(next.updated_at) >= parseApprovalTimestamp(previous.updated_at)
          ) {
            latestApprovalByElement.set(elementId, next);
          }

          const estado = approval?.estado as string;
          const userId = Number(approval?.usuario_id);
          const isRowStatus = estado === 'pendiente' || estado === 'aprobado' || estado === 'rechazado';
          if (!isRowStatus || !Number.isFinite(userId)) return;

          if (!approvalsByElementAndUser.has(elementId)) {
            approvalsByElementAndUser.set(elementId, {});
          }

          approvalsByElementAndUser.get(elementId)![String(userId)] = {
            approval_status: estado as EvidenceApprovalStatus,
            comentario_rechazo: approval?.comentario ?? null,
          };
        });

        // En esta pantalla se deben mantener visibles todas las asignaciones del proceso,
        // incluyendo pendientes/rechazadas, para no perder filas tras acciones de aprobación.
        const reviewableAssignments: any[] = allAssignments;

        // Group reviewable assignments by elemento_id
        const assignmentsByElement = new Map<number, any[]>();
        reviewableAssignments.forEach((asgn: any) => {
          const eid = asgn.elemento_id;
          if (!assignmentsByElement.has(eid)) assignmentsByElement.set(eid, []);
          assignmentsByElement.get(eid)!.push(asgn);
        });

        // Only show blocks whose children have reviewable assignments
        const assignedElementIds = new Set<number>(reviewableAssignments.map((a: any) => a.elemento_id));

        const assignedLeaves = allElements.filter(
          (e: any) => assignedElementIds.has(e.elemento_id) && e.activo !== false,
        );
        const relevantParentIds = new Set<number>(
          assignedLeaves
            .map((e: any) => e.padre_id)
            .filter((id: any): id is number => id !== null && id !== undefined),
        );
        const blocks = allElements.filter((e: any) => relevantParentIds.has(e.elemento_id) && e.activo !== false);

        const criteriaFromBlocks: Criterio[] = blocks.map((b: any) => {
          // Collect unique users across all reviewable child assignments of this block
          const childElementIds = new Set(
            assignedLeaves
              .filter((e: any) => e.padre_id === b.elemento_id)
              .map((e: any) => e.elemento_id),
          );
          const linkedCount = childElementIds.size;
          const responsableMap = new Map<number, string>();
          reviewableAssignments
            .filter((a: any) => childElementIds.has(a.elemento_id))
            .forEach((a: any) => {
              const uid = a.usuario_id;
              const userName =
                a.user?.nombre ??
                a.user?.name ??
                a.usuario?.nombre ??
                a.usuario?.name ??
                a.usuario_nombre ??
                null;
              if (uid && !responsableMap.has(uid)) {
                responsableMap.set(uid, userName ?? String(uid));
              }
            });
          return {
            id: b.elemento_id,
            nomenclatura: b.nomenclatura ?? '',
            descripcion: b.nombre ?? b.descripcion ?? '',
            estado_aprobacion: latestApprovalByElement.get(b.elemento_id)?.estado ?? 'pendiente',
            responsables: Array.from(responsableMap.entries()).map(([id, name]) => ({ id, name })),
            linked_count: linkedCount,
          };
        });

        const childrenByBlock: Record<number, EvidenceApprovalItem[]> = {};
        blocks.forEach((b: any) => {
          childrenByBlock[b.elemento_id] = allElements
            .filter((e: any) => e.padre_id === b.elemento_id && assignedElementIds.has(e.elemento_id) && e.activo !== false)
            .map((child: any) => {
              const childId = child.elemento_id;
              const approvalsByUser = approvalsByElementAndUser.get(childId) ?? {};
              const firstDecision = Object.values(approvalsByUser)[0];
              const childAssignments = assignmentsByElement.get(childId) ?? [];
              const uniqueAssignees = Array.from(
                childAssignments.reduce((acc: Map<number, any>, assignment: any) => {
                  const uid = assignment?.usuario_id;
                  if (!uid || acc.has(uid)) return acc;
                  acc.set(uid, assignment);
                  return acc;
                }, new Map<number, any>()).values(),
              );
              const firstAssignment = childAssignments[0];
              return {
                evidencia_id: childId,
                nomenclatura: child.nomenclatura ?? '',
                descripcion: child.nombre ?? child.descripcion ?? '',
                approval_status: firstDecision?.approval_status ?? 'pendiente',
                comentario_rechazo: firstDecision?.comentario_rechazo ?? null,
                asignacion: firstAssignment ? {
                  estado: firstAssignment.estado,
                  fecha_limite: firstAssignment.fecha_limite,
                  usuario_id: firstAssignment.usuario_id,
                  usuario_nombre: firstAssignment.user?.nombre ?? firstAssignment.user?.name ?? null,
                } : null,
                asignacion_id: firstAssignment?.elemento_asignacion_id,
                approvals_by_user: approvalsByUser,
                responsables_asignados: uniqueAssignees.map((assignment: any) => ({
                  usuario_id: assignment.usuario_id,
                  usuario_nombre:
                    assignment.user?.nombre ??
                    assignment.user?.name ??
                    assignment.usuario?.nombre ??
                    assignment.usuario_nombre ??
                    null,
                  estado: assignment.estado,
                  fecha_limite: assignment.fecha_limite ?? null,
                  asignacion_id: assignment.elemento_asignacion_id,
                  proceso_id: assignment.proceso_id,
                })),
              };
            });
        });

        setDataState({ isLoading: false, criteria: criteriaFromBlocks, evidences: [], processes: processesArray });
        setEvidenceApprovalsByCriterion(childrenByBlock);

      } else {
        // ── Traditional mode: load criteria + evidences + criterion approvals ─
        const [criteriaResponse, evidencesResponse, approvalsResponse, assignmentsResponse] = await Promise.all([
          axiosInstance.get('/estructura/criterios'),
          axiosInstance.get('/estructura/evidencias'),
          axiosInstance.get('/aprobaciones-criterios'),
          selectedProcesoId
            ? axiosInstance.get(`/procesos/${selectedProcesoId}/asignaciones`)
            : Promise.resolve({ data: { data: [] } }),
        ]);

        const criteriaArray  = criteriaResponse.data.data  || criteriaResponse.data;
        const evidencesArray = evidencesResponse.data.data || evidencesResponse.data;
        const approvalsArray = approvalsResponse.data.data || approvalsResponse.data;
        const assignmentsArray = assignmentsResponse.data?.data || assignmentsResponse.data || [];

        const reviewableAssignments = assignmentsArray;

        const evidenceIdsByCriterion = new Map<number, Set<number>>();
        reviewableAssignments.forEach((assignment: any) => {
          const evidenceData = assignment?.evidencia ?? assignment?.evidence ?? null;
          const criterionIdRaw = evidenceData?.criterio_id ?? assignment?.criterio_id;
          const criterionId = Number(criterionIdRaw);
          if (!Number.isFinite(criterionId)) return;

          if (!evidenceIdsByCriterion.has(criterionId)) {
            evidenceIdsByCriterion.set(criterionId, new Set<number>());
          }

          const evidenceIdRaw =
            assignment?.evidencia_id ?? evidenceData?.evidencia_id ?? evidenceData?.id;
          const evidenceId = Number(evidenceIdRaw);

          if (Number.isFinite(evidenceId)) {
            evidenceIdsByCriterion.get(criterionId)!.add(evidenceId);
          }
        });

        const linkedCountByCriterion = new Map<number, number>();
        evidenceIdsByCriterion.forEach((evidenceIds, criterionId) => {
          linkedCountByCriterion.set(criterionId, evidenceIds.size);
        });

        const approvalsMap = new Map<string, BlockApprovalStatus>();
        approvalsArray.forEach((aprobacion: any) => {
          const key = `${aprobacion.criterio_id}-${aprobacion.proceso_id}`;
          approvalsMap.set(key, aprobacion.estado as BlockApprovalStatus);
        });

        const responsablesByCriterion = new Map<number, Map<number, string>>();
        reviewableAssignments.forEach((assignment: any) => {
          const evidenceData = assignment?.evidencia ?? assignment?.evidence ?? null;
          const criterionId = evidenceData?.criterio_id ?? assignment?.criterio_id;
          const userData = assignment?.usuario ?? assignment?.user ?? null;
          const userId = assignment?.usuario_id ?? userData?.usuario_id ?? null;
          const userName =
            userData?.nombre ??
            userData?.name ??
            assignment?.usuario_nombre ??
            assignment?.user_name ??
            null;

          if (!criterionId || !userId) return;

          if (!responsablesByCriterion.has(criterionId)) {
            responsablesByCriterion.set(criterionId, new Map<number, string>());
          }

          const usersMap = responsablesByCriterion.get(criterionId)!;
          if (!usersMap.has(userId)) {
            usersMap.set(userId, userName ?? String(userId));
          }
        });

        const criterionIdsWithAssignments = new Set<number>(evidenceIdsByCriterion.keys());
        const criterionIdsWithApprovals = new Set<number>();

        approvalsArray.forEach((aprobacion: any) => {
          if (selectedProcesoId && aprobacion?.proceso_id !== selectedProcesoId) {
            return;
          }

          const criterionId = Number(aprobacion?.criterio_id);
          if (Number.isFinite(criterionId)) {
            criterionIdsWithApprovals.add(criterionId);
          }
        });

        const visibleCriterionIds = new Set<number>([
          ...criterionIdsWithAssignments,
          ...criterionIdsWithApprovals,
        ]);

        const filteredCriteria = criteriaArray.filter((criterion: any) => {
          const criterionId = Number(criterion?.id ?? criterion?.criterio_id);
          return Number.isFinite(criterionId) && visibleCriterionIds.has(criterionId);
        });

        const criteriaWithStatus = filteredCriteria.map((c: any) => {
          const key = selectedProcesoId ? `${c.id}-${selectedProcesoId}` : '';
          const criterionId = c.id ?? c.criterio_id;
          const responsibleUsers = Array.from(
            (responsablesByCriterion.get(criterionId) ?? new Map<number, string>()).entries(),
          ).map(([id, name]) => ({ id, name }));
          return {
            ...c,
            estado_aprobacion: (approvalsMap.get(key) ?? 'pendiente') as BlockApprovalStatus,
            linked_count: linkedCountByCriterion.get(criterionId) ?? 0,
            responsables: responsibleUsers,
          };
        });

        setDataState({ criteria: criteriaWithStatus, evidences: evidencesArray, processes: processesArray, isLoading: false });
      }
    } catch (error: any) {
      showToast({ type: 'error', title: 'Error al cargar datos', message: error?.response?.data?.message || error?.message || 'No se pudieron cargar los datos' });
      setDataState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Cargar aprobaciones individuales de un criterio (lazy, al expandir fila)
  const handleExpandCriterion = useCallback(
    async (criterionId: number) => {
      if (
        !selectedProcesoId ||
        evidenceApprovalsByCriterion[criterionId] !== undefined
      )
        return;
      setLoadingEvidences((prev) => new Set(prev).add(criterionId));
      try {
        const res = await axiosInstance.get(
          `/criterios/${criterionId}/evidencias/aprobaciones`,
          {
            params: { proceso_id: selectedProcesoId },
          },
        );
        const evidences: EvidenceApprovalItem[] = (res.data?.data?.evidences ?? []).map((item: any) => ({
          ...item,
          asignacion: item?.asignacion
            ? {
                ...item.asignacion,
                usuario_nombre:
                  item.asignacion.usuario_nombre ??
                  item.asignacion.usuario?.nombre ??
                  item.asignacion.user?.nombre ??
                  null,
              }
            : null,
        }));
        setEvidenceApprovalsByCriterion((prev) => ({
          ...prev,
          [criterionId]: evidences,
        }));
      } catch {
        setEvidenceApprovalsByCriterion((prev) => ({
          ...prev,
          [criterionId]: [],
        }));
      } finally {
        setLoadingEvidences((prev) => {
          const s = new Set(prev);
          s.delete(criterionId);
          return s;
        });
      }
    },
    [selectedProcesoId, evidenceApprovalsByCriterion],
  );

  const getEvidencesByCriterion = useCallback(
    (criterionId: number) =>
      evidences.filter((ev) => ev.criterio_id === criterionId),
    [evidences],
  );

  const handleOpenCriterionEvidences = useCallback(
    async (criterio: Criterio) => {
      setCriterionEvidencesModal({ open: true, criterio });
      await handleExpandCriterion(criterio.id);
    },
    [handleExpandCriterion],
  );

  const selectedCriterionEvidences = useMemo(() => {
    const criterio = criterionEvidencesModal.criterio;
    if (!criterio) return [];

    const loaded = evidenceApprovalsByCriterion[criterio.id];
    if (loaded) return loaded;

    if (isFlexible) return [];

    return getEvidencesByCriterion(criterio.id).map((ev) => ({
      evidencia_id: ev.id,
      nomenclatura: ev.nomenclatura,
      descripcion: ev.descripcion,
      approval_status: 'pendiente' as const,
      comentario_rechazo: null,
      asignacion: null,
      asignacion_id: undefined,
    }));
  }, [
    criterionEvidencesModal.criterio,
    evidenceApprovalsByCriterion,
    getEvidencesByCriterion,
    isFlexible,
  ]);

  const selectedCriterionLoading =
    !!criterionEvidencesModal.criterio &&
    loadingEvidences.has(criterionEvidencesModal.criterio.id);

  const filteredCriteria = useMemo(() => {
    const term = normalizeSearchValue(searchTerm.trim());
    if (!term) {
      return criteria;
    }

    return criteria.filter((criterio) => {
      const status = criterio.estado_aprobacion ?? 'pendiente';
      const statusLabel =
        status === 'aprobado'
          ? 'aprobado'
          : status === 'rechazado'
            ? 'rechazado'
            : status === 'incompleto'
              ? 'incompleto'
              : 'pendiente';

      const responsables = criterio.responsables ?? [];
      const responsablesText = responsables
        .map((user) => user.name ?? '')
        .join(' ');
      const responsablesIds = responsables
        .map((user) => String(user.id ?? ''))
        .join(' ');

      const recursosCount = criterio.linked_count ?? 0;
      const recursosText =
        recursosCount > 0
          ? `${recursosCount} ${recursosCount === 1 ? 'recurso' : 'recursos'}`
          : 'sin recursos';

      const searchableValues = [
        criterio.nomenclatura ?? '',
        criterio.descripcion ?? '',
        `${criterio.nomenclatura ?? ''} ${criterio.descripcion ?? ''}`,
        statusLabel,
        status,
        responsablesText,
        responsablesIds,
        String(recursosCount),
        recursosText,
      ];

      return searchableValues.some((value) =>
        normalizeSearchValue(value).includes(term),
      );
    });
  }, [criteria, searchTerm]);

  const pendingApprovalCriteria = useMemo(
    () =>
      criteria.filter(
        (criterio) =>
          (criterio.estado_aprobacion ?? 'pendiente') === 'pendiente',
      ),
    [criteria],
  );

  const totalPages = Math.ceil(filteredCriteria.length / itemsPerPage);
  const paginatedCriteria = useMemo(
    () =>
      filteredCriteria.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      ),
    [filteredCriteria, currentPage, itemsPerPage],
  );

  useEffect(() => {
    setFilterState((prev) => ({ ...prev, currentPage: 1 }));
  }, [filteredCriteria.length]);

  // --- Handlers de BLOQUE ---
  const handleAprobar = useCallback((criterio: Criterio) => {
    setCriterionEvidencesModal({ open: false, criterio: null });
    setEvidenceModal((prev) => ({
      ...prev,
      isOpen: false,
      successOpen: false,
      criterio: null,
      evidencia: null,
    }));
    setApprovalState((prev) => ({
      ...prev,
      isOpen: true,
      action: "aprobar",
      criterion: criterio,
      successOpen: false,
    }));
  }, []);

  const handleRechazar = useCallback((criterio: Criterio) => {
    setCriterionEvidencesModal({ open: false, criterio: null });
    setEvidenceModal((prev) => ({
      ...prev,
      isOpen: false,
      successOpen: false,
      criterio: null,
      evidencia: null,
    }));
    setApprovalState((prev) => ({
      ...prev,
      isOpen: true,
      action: "rechazar",
      criterion: criterio,
      successOpen: false,
    }));
  }, []);

  const handleConfirmAction = async (
    comentario: string,
    nuevaFechaLimite?: string,
  ) => {
    const { criterion, action } = approvalState;
    if (!criterion || !selectedProcesoId) return;

    try {
      const endpoint = isFlexible
        ? action === 'aprobar'
          ? `/elementos/${criterion.id}/aprobar`
          : `/elementos/${criterion.id}/rechazar`
        : action === 'aprobar'
          ? `/criterios/${criterion.id}/aprobar`
          : `/criterios/${criterion.id}/rechazar`;

      await axiosInstance.post(endpoint, {
        proceso_id: selectedProcesoId,
        comentario: comentario || null,
        ...(nuevaFechaLimite
          ? isFlexible
            ? { fecha_limite: nuevaFechaLimite }
            : { nueva_fecha_limite: nuevaFechaLimite }
          : {}),
      });

      setApprovalState((prev) => ({
        ...prev,
        isOpen: false,
        criterion: null,
        successOpen: true,
      }));
      // Invalidar caché de evidencias del criterio afectado
      setEvidenceApprovalsByCriterion((prev) => {
        const n = { ...prev };
        delete n[criterion.id];
        return n;
      });
      await fetchData();
    } catch (error: any) {
      showToast({
        type: "error",
        title: "No se pudo rechazar/aprobar el bloque",
        message: extractValidationMessage(error, 'Ocurrió un error inesperado al procesar el bloque.'),
      });
      setApprovalState((prev) => ({ ...prev, isOpen: false, criterion: null }));
    }
  };

  const handleConfirmApproveAll = async () => {
    if (!selectedProcesoId || pendingApprovalCriteria.length === 0) return;

    setBulkApprovalState((prev) => ({ ...prev, loading: true }));

    const failed: string[] = [];
    let approvedCount = 0;

    for (const criterio of pendingApprovalCriteria) {
      const endpoint = isFlexible
        ? `/elementos/${criterio.id}/aprobar`
        : `/criterios/${criterio.id}/aprobar`;

      try {
        await axiosInstance.post(endpoint, {
          proceso_id: selectedProcesoId,
          comentario: null,
        });
        approvedCount += 1;
      } catch (error: any) {
        failed.push(
          `${criterio.nomenclatura || criterio.id}: ${extractValidationMessage(
            error,
            'No se pudo aprobar',
          )}`,
        );
      }
    }

    setEvidenceApprovalsByCriterion({});
    await fetchData();

    setBulkApprovalState({
      isOpen: false,
      loading: false,
      successOpen: approvedCount > 0,
      approvedCount,
    });

    if (failed.length > 0) {
      showToast({
        type: approvedCount > 0 ? 'warning' : 'error',
        title:
          approvedCount > 0
            ? 'Aprobación parcial'
            : 'No se pudieron aprobar los bloques',
        message:
          failed.length === 1
            ? failed[0]
            : `${failed.length} bloques no se pudieron aprobar. Revise los pendientes e inténtelo nuevamente.`,
      });
    }
  };

  // --- Handlers de EVIDENCIA INDIVIDUAL ---
  const handleAprobarEvidencia = useCallback(
    (criterio: Criterio, evidencia: EvidenceApprovalItem) => {
      setCriterionEvidencesModal({ open: false, criterio: null });
      setApprovalState((prev) => ({
        ...prev,
        isOpen: false,
        criterion: null,
        successOpen: false,
      }));
      setEvidenceModal({
        isOpen: true,
        action: "aprobar",
        criterio,
        evidencia,
        successOpen: false,
      });
    },
    [],
  );

  const handleRechazarEvidencia = useCallback(
    (criterio: Criterio, evidencia: EvidenceApprovalItem) => {
      setCriterionEvidencesModal({ open: false, criterio: null });
      setApprovalState((prev) => ({
        ...prev,
        isOpen: false,
        criterion: null,
      }));
      setEvidenceModal({
        isOpen: true,
        action: "rechazar",
        criterio,
        evidencia,
        successOpen: false,
      });
    },
    [],
  );

  const handleConfirmEvidenceAction = async (
    comentario?: string,
    nuevaFechaLimite?: string,
  ) => {
    const { criterio, evidencia, action } = evidenceModal;
    if (!criterio || !evidencia || !selectedProcesoId) return;

    try {
      const endpoint = isFlexible
        ? action === 'aprobar'
          ? `/elementos/${criterio.id}/hijos/${evidencia.evidencia_id}/aprobar`
          : `/elementos/${criterio.id}/hijos/${evidencia.evidencia_id}/rechazar`
        : action === 'aprobar'
          ? `/criterios/${criterio.id}/evidencias/${evidencia.evidencia_id}/aprobar`
          : `/criterios/${criterio.id}/evidencias/${evidencia.evidencia_id}/rechazar`;

      await axiosInstance.post(endpoint, {
        proceso_id: selectedProcesoId,
        ...(typeof evidencia.asignacion?.usuario_id === 'number'
          ? { responsable_usuario_id: evidencia.asignacion.usuario_id }
          : {}),
        ...(comentario ? { comentario } : {}),
        ...(nuevaFechaLimite ? { nueva_fecha_limite: nuevaFechaLimite } : {}),
      });

      setEvidenceModal((prev) => ({
        ...prev,
        isOpen: false,
        evidencia: null,
        successOpen: true,
      }));
      // Invalidar caché del criterio para recargar estados individuales
      setEvidenceApprovalsByCriterion((prev) => {
        const n = { ...prev };
        delete n[criterio.id];
        return n;
      });
      await fetchData();
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error al procesar la evidencia",
        message: error.response?.data?.message || "Ocurrió un error inesperado",
      });
      setEvidenceModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        breadcrumbMode="contextual"
        headerExtra={
          <div className="flex gap-4 items-end">
            <SearchInput
              placeholder="Buscar elementos, responsables o estado..."
              value={searchTerm}
              onChange={(value) =>
                setFilterState((prev) => ({ ...prev, searchTerm: value }))
              }
            />
            <Button
              variant="secondary"
              onClick={() =>
                setBulkApprovalState((prev) => ({ ...prev, isOpen: true }))
              }
              disabled={
                isLoading ||
                !selectedProcesoId ||
                pendingApprovalCriteria.length === 0
              }
            >
              Aceptar todos
            </Button>
          </div>
        }
      />

      <BlockApprovalTable
        criteria={paginatedCriteria}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        selectedProcesoId={selectedProcesoId}
        isFlexible={isFlexible}
        onPageChange={(value) => setFilterState(prev => ({ ...prev, currentPage: value }))}
        onAprobar={handleAprobar}
        onRechazar={handleRechazar}
        onOpenCriterionEvidences={handleOpenCriterionEvidences}
      />

      <CriterionEvidencesModal
        isOpen={
          criterionEvidencesModal.open &&
          !approvalState.isOpen &&
          !evidenceModal.isOpen
        }
        onClose={() =>
          setCriterionEvidencesModal({ open: false, criterio: null })
        }
        criterio={criterionEvidencesModal.criterio}
        evidencias={selectedCriterionEvidences}
        loading={selectedCriterionLoading}
        isFlexible={isFlexible}
        procesoId={selectedProcesoId}
        onAprobarEvidencia={handleAprobarEvidencia}
        onRechazarEvidencia={handleRechazarEvidencia}
      />

      {/* Modal de bloque */}
      {approvalState.criterion && (
        <ApprovalModal
          isOpen={approvalState.isOpen}
          onClose={() =>
            setApprovalState((prev) => ({
              ...prev,
              isOpen: false,
              criterion: null,
            }))
          }
          onConfirm={handleConfirmAction}
          action={approvalState.action}
          isFlexible={isFlexible}
          criterio={approvalState.criterion}
        />
      )}

      {/* Modal de evidencia individual */}
      <EvidenceApprovalModal
        isOpen={evidenceModal.isOpen}
        onClose={() => setEvidenceModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmEvidenceAction}
        action={evidenceModal.action}
        criterio={evidenceModal.criterio}
        evidencia={evidenceModal.evidencia}
      />

      <Modal
        isOpen={bulkApprovalState.isOpen}
        onClose={() =>
          setBulkApprovalState((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={handleConfirmApproveAll}
        title="Aceptar todos"
        subtitle={`${pendingApprovalCriteria.length} ${
          pendingApprovalCriteria.length === 1
            ? isFlexible
              ? 'elemento pendiente'
              : 'criterio pendiente'
            : isFlexible
              ? 'elementos pendientes'
              : 'criterios pendientes'
        }`}
        variant="success"
        confirmLabel="Sí, aceptar todos"
        cancelLabel="Cancelar"
        confirmLoading={bulkApprovalState.loading}
        showConfirm
        showCancel
      >
        <p className="text-sm leading-relaxed text-gris-una-2">
          ¿Seguro que desea aceptar todos los bloques pendientes del proceso
          seleccionado? Esta acción aprobará en cascada sus recursos asociados.
        </p>
      </Modal>

      {/* Éxito de bloque */}
      <SuccessModal
        isOpen={approvalState.successOpen}
        onClose={() =>
          setApprovalState((prev) => ({ ...prev, successOpen: false }))
        }
        title={
          approvalState.action === "aprobar"
            ? "Bloque Aprobado"
            : "Bloque Rechazado"
        }
        message={`El bloque ha sido ${approvalState.action === "aprobar" ? "aprobado" : "rechazado"} exitosamente.`}
      />

      <SuccessModal
        isOpen={bulkApprovalState.successOpen}
        onClose={() =>
          setBulkApprovalState((prev) => ({ ...prev, successOpen: false }))
        }
        title="Bloques aprobados"
        message={`${bulkApprovalState.approvedCount} ${
          bulkApprovalState.approvedCount === 1
            ? 'bloque fue aprobado'
            : 'bloques fueron aprobados'
        } exitosamente.`}
      />

      {/* Éxito de evidencia individual */}
      <SuccessModal
        isOpen={evidenceModal.successOpen}
        onClose={() =>
          setEvidenceModal((prev) => ({ ...prev, successOpen: false }))
        }
        title={
          evidenceModal.action === "aprobar"
            ? "Evidencia Aprobada"
            : "Evidencia Rechazada"
        }
        message={`La evidencia ha sido ${evidenceModal.action === "aprobar" ? "aprobada" : "rechazada"} exitosamente.`}
      />
    </ScreenContainer>
  );
};

export default BlockApproval;
