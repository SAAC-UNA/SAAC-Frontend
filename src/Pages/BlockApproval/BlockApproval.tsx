import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ScreenContainer, PageHeader } from '@/Components/Ui/Index';
import { useToast } from '@/Context/ToastContext';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { axiosInstance } from '@/Config/axios';
import { ApprovalModal } from './Components/ApprovalModal';
import { EvidenceApprovalModal } from './Components/EvidenceApprovalModal';
import { CriterionEvidencesModal } from './Components/CriterionEvidencesModal.tsx';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { BlockApprovalTable } from './Components/BlockApprovalTable';
import type { Criterio, Evidencia, EvidenceApprovalItem, EvidenceApprovalStatus } from './Components/BlockApprovalTable';
import { GLOBAL_FILTER_CONTEXT_CHANGED_EVENT } from '@/Services/GlobalFilterContextService';
import { getOperationalContextSnapshot } from '@/Services/OperationalContextStore';

type BlockApprovalStatus = 'pendiente' | 'aprobado' | 'rechazado' | 'incompleto';

const toNumericId = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseTimestamp = (value: unknown): number => {
  if (typeof value !== 'string') return 0;

  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : 0;
};

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

const normalizeEvidenceStatus = (value: unknown): EvidenceApprovalStatus => {
  const normalized = normalizeSearchValue(value).trim();

  if (normalized.startsWith('aprobad')) return 'aprobado';
  if (normalized.startsWith('rechazad')) return 'rechazado';
  if (normalized.startsWith('pendient')) return 'pendiente';

  return 'pendiente';
};

const normalizeBlockStatus = (value: unknown): BlockApprovalStatus => {
  const normalized = normalizeSearchValue(value).trim();

  if (normalized.startsWith('aprobad')) return 'aprobado';
  if (normalized.startsWith('rechazad')) return 'rechazado';
  if (normalized.startsWith('incomplet')) return 'incompleto';
  if (normalized.startsWith('pendient')) return 'pendiente';

  return 'pendiente';
};

const normalizeAssignmentStatus = (value: unknown): string => {
  const normalized = normalizeSearchValue(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (normalized === 'en proceso') return 'en progreso';

  return normalized;
};

const isCompletedAssignmentStatus = (value: unknown): boolean =>
  normalizeAssignmentStatus(value).startsWith('completad');

const isDecisionCurrentForAssignment = (
  decisionUpdatedAt: unknown,
  assignmentUpdatedAt: number,
): boolean => {
  if (assignmentUpdatedAt <= 0) return true;

  const decisionUpdated = parseTimestamp(decisionUpdatedAt);
  if (decisionUpdated <= 0) return false;

  return decisionUpdated >= assignmentUpdatedAt;
};

const hasFreshSubmissionSinceDecision = (
  latestSubmissionAt: number,
  latestDecisionAt: number,
): boolean => {
  if (latestSubmissionAt <= 0) return false;
  if (latestDecisionAt <= 0) return true;
  return latestSubmissionAt > latestDecisionAt;
};

const BLOCK_STATUS_SEARCH_TERMS: Record<BlockApprovalStatus, string[]> = {
  pendiente: ['pendiente', 'pendientes'],
  aprobado: ['aprobado', 'aprobada', 'aprobados', 'aprobadas'],
  rechazado: ['rechazado', 'rechazada', 'rechazados', 'rechazadas'],
  incompleto: ['incompleto', 'incompleta', 'incompletos', 'incompletas'],
};

const extractEvidenceDecisionFlags = (
  evidencias: EvidenceApprovalItem[] | undefined,
): { hasApproved: boolean; hasRejected: boolean } => {
  if (!evidencias || evidencias.length === 0) {
    return { hasApproved: false, hasRejected: false };
  }

  let hasApproved = false;
  let hasRejected = false;

  evidencias.forEach((evidencia) => {
    const baseStatus = normalizeEvidenceStatus(evidencia.approval_status);
    if (baseStatus === 'aprobado') hasApproved = true;
    if (baseStatus === 'rechazado') hasRejected = true;

    Object.values(evidencia.approvals_by_user ?? {}).forEach((decision) => {
      const decisionStatus = normalizeEvidenceStatus(decision?.approval_status);
      if (decisionStatus === 'aprobado') hasApproved = true;
      if (decisionStatus === 'rechazado') hasRejected = true;
    });
  });

  return { hasApproved, hasRejected };
};

const hasCriterionRulesLoaded = (
  rules: Record<number, EvidenceApprovalItem[]>,
  criterionId: number,
): boolean => Object.prototype.hasOwnProperty.call(rules, criterionId);

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
  const selectedProcesoIdNum = toNumericId(selectedProcesoId);
  const itemsPerPage = TABLE_PAGE_SIZE.standard;

  const selectedProcess = useMemo(
    () =>
      processes.find(
        (p) => toNumericId(p.proceso_id) === selectedProcesoIdNum,
      ) ?? null,
    [processes, selectedProcesoIdNum],
  );
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
      const nextProcessId = toNumericId(snapshot.processId);

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
      const selectedRaw = processesArray.find(
        (p) => toNumericId(p.proceso_id) === selectedProcesoIdNum,
      );
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

        const getLatestAssignmentsByUser = (assignments: any[]): any[] =>
          Array.from(
            assignments.reduce((acc: Map<number, any>, assignment: any) => {
              const userId = Number(assignment?.usuario_id);
              if (!Number.isFinite(userId)) return acc;

              const currentUpdatedAt = parseTimestamp(
                assignment?.updated_at ?? assignment?.fecha_asignacion,
              );
              const previous = acc.get(userId);
              const previousUpdatedAt = parseTimestamp(
                previous?.updated_at ?? previous?.fecha_asignacion,
              );

              if (!previous || currentUpdatedAt >= previousUpdatedAt) {
                acc.set(userId, assignment);
              }

              return acc;
            }, new Map<number, any>()).values(),
          );

        const latestApprovalByElement = new Map<
          number,
          { estado: BlockApprovalStatus; comentario: string | null; updated_at?: string | null }
        >();

        const approvalsByElementAndUser = new Map<
          number,
          Record<
            string,
            {
              approval_status: EvidenceApprovalStatus;
              comentario_rechazo?: string | null;
              updated_at?: string | null;
            }
          >
        >();

        allApprovals.forEach((approval: any) => {
          const elementId = Number(approval?.elemento_id);
          if (!Number.isFinite(elementId)) return;

          const next = {
            estado: normalizeBlockStatus(approval?.estado),
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
            updated_at: typeof approval?.updated_at === 'string' ? approval.updated_at : null,
          };
        });

        const reviewableAssignments: any[] = allAssignments.filter((assignment: any) =>
          isCompletedAssignmentStatus(assignment?.estado),
        );

        const allAssignmentsByElement = new Map<number, any[]>();
        allAssignments.forEach((assignment: any) => {
          const elementId = Number(assignment?.elemento_id);
          if (!Number.isFinite(elementId)) return;

          if (!allAssignmentsByElement.has(elementId)) {
            allAssignmentsByElement.set(elementId, []);
          }

          allAssignmentsByElement.get(elementId)!.push(assignment);
        });

        const allElementsById = new Map<number, any>();
        allElements.forEach((element: any) => {
          const elementId = Number(element?.elemento_id);
          if (Number.isFinite(elementId)) {
            allElementsById.set(elementId, element);
          }
        });

        const latestCompletedAssignmentByBlock = new Map<number, number>();
        const latestAssignmentByBlock = new Map<number, number>();

        allAssignments.forEach((assignment: any) => {
          const childElementId = Number(assignment?.elemento_id);
          if (!Number.isFinite(childElementId)) return;

          const childElement = allElementsById.get(childElementId);
          const blockId = Number(childElement?.padre_id);
          if (!Number.isFinite(blockId)) return;

          const assignmentUpdatedAt = parseTimestamp(
            assignment?.updated_at ?? assignment?.fecha_asignacion,
          );
          const previousUpdatedAt = latestAssignmentByBlock.get(blockId) ?? 0;

          if (assignmentUpdatedAt >= previousUpdatedAt) {
            latestAssignmentByBlock.set(blockId, assignmentUpdatedAt);
          }
        });

        reviewableAssignments.forEach((assignment: any) => {
          const childElementId = Number(assignment?.elemento_id);
          if (!Number.isFinite(childElementId)) return;

          const childElement = allElementsById.get(childElementId);
          const blockId = Number(childElement?.padre_id);
          if (!Number.isFinite(blockId)) return;

          const assignmentUpdatedAt = parseTimestamp(
            assignment?.updated_at ?? assignment?.fecha_asignacion,
          );
          const previousUpdatedAt = latestCompletedAssignmentByBlock.get(blockId) ?? 0;

          if (assignmentUpdatedAt >= previousUpdatedAt) {
            latestCompletedAssignmentByBlock.set(blockId, assignmentUpdatedAt);
          }
        });

        const rejectedElementIds = new Set<number>();
        allAssignmentsByElement.forEach((elementAssignments, elementId) => {
          const approvalsByUser = approvalsByElementAndUser.get(elementId) ?? {};

          const latestAssignmentsByUser = getLatestAssignmentsByUser(elementAssignments);

          const hasCurrentRejected = latestAssignmentsByUser.some((assignment) => {
            const userId = Number(assignment?.usuario_id);
            if (!Number.isFinite(userId)) return false;

            const decision = approvalsByUser[String(userId)];
            if (!decision) return false;

            const decisionStatus = normalizeEvidenceStatus(decision.approval_status);
            if (decisionStatus !== 'rechazado') return false;

            if (!isCompletedAssignmentStatus(assignment?.estado)) {
              return true;
            }

            const assignmentUpdatedAt = parseTimestamp(
              assignment?.updated_at ?? assignment?.fecha_asignacion,
            );

            if (
              !isDecisionCurrentForAssignment(
                decision?.updated_at,
                assignmentUpdatedAt,
              )
            ) {
              return false;
            }

            return true;
          });

          if (hasCurrentRejected) {
            rejectedElementIds.add(elementId);
          }
        });

        // Only show blocks whose children have reviewable assignments
        const assignedElementIds = new Set<number>(reviewableAssignments.map((a: any) => a.elemento_id));

        const assignedLeaves = allElements.filter(
          (e: any) =>
            (assignedElementIds.has(e.elemento_id) || rejectedElementIds.has(e.elemento_id))
            && e.activo !== false,
        );
        const relevantParentIds = new Set<number>(
          assignedLeaves
            .map((e: any) => e.padre_id)
            .filter((id: any): id is number => id !== null && id !== undefined),
        );

        const blocks = allElements.filter((e: any) => relevantParentIds.has(e.elemento_id) && e.activo !== false);

        const criteriaFromBlocks: Criterio[] = blocks.map((b: any) => {
          const latestBlockApproval = latestApprovalByElement.get(b.elemento_id);
          const latestBlockApprovalAt = parseTimestamp(latestBlockApproval?.updated_at ?? null);
          const latestSubmissionAt =
            latestAssignmentByBlock.get(b.elemento_id)
            ?? latestCompletedAssignmentByBlock.get(b.elemento_id)
            ?? 0;
          const hasFreshSubmission = hasFreshSubmissionSinceDecision(
            latestSubmissionAt,
            latestBlockApprovalAt,
          );

          // Collect unique users across all reviewable child assignments of this block
          const childElementIds = new Set(
            assignedLeaves
              .filter((e: any) => e.padre_id === b.elemento_id)
              .map((e: any) => e.elemento_id),
          );
          const linkedCount = childElementIds.size;

          let hasApprovedDecision = false;
          let hasRejectedDecision = false;
          let hasUndecidedCompleted = false;
          let hasPendingAssignment = false;

          childElementIds.forEach((childId) => {
            const childAssignments = allAssignmentsByElement.get(childId) ?? [];
            const latestAssignmentsByUser = getLatestAssignmentsByUser(childAssignments);
            const approvalsByUser = approvalsByElementAndUser.get(childId) ?? {};

            latestAssignmentsByUser.forEach((assignment) => {
              const userId = Number(assignment?.usuario_id);
              if (!Number.isFinite(userId)) {
                hasUndecidedCompleted = true;
                return;
              }

              const decision = approvalsByUser[String(userId)];
              const assignmentUpdatedAt = parseTimestamp(
                assignment?.updated_at ?? assignment?.fecha_asignacion,
              );
              const decisionStatus = normalizeEvidenceStatus(
                decision?.approval_status,
              );

              if (!isCompletedAssignmentStatus(assignment?.estado)) {
                if (decisionStatus === 'rechazado') {
                  hasRejectedDecision = true;
                } else {
                  hasPendingAssignment = true;
                }
                return;
              }

              if (
                !decision
                || !isDecisionCurrentForAssignment(
                  decision?.updated_at,
                  assignmentUpdatedAt,
                )
              ) {
                hasUndecidedCompleted = true;
                return;
              }

              if (decisionStatus === 'aprobado') {
                hasApprovedDecision = true;
                return;
              }

              if (decisionStatus === 'rechazado') {
                hasRejectedDecision = true;
                return;
              }

              hasUndecidedCompleted = true;
            });
          });

          const derivedStatus: BlockApprovalStatus =
            hasPendingAssignment
            || hasUndecidedCompleted
            || (!hasApprovedDecision && !hasRejectedDecision)
              ? 'pendiente'
              : hasApprovedDecision && hasRejectedDecision
                ? 'incompleto'
                : hasRejectedDecision
                  ? 'rechazado'
                  : 'aprobado';

          const effectiveBlockStatus: BlockApprovalStatus = hasFreshSubmission
            ? 'pendiente'
            : (derivedStatus !== 'pendiente'
              ? derivedStatus
              : (latestBlockApproval?.estado ?? 'pendiente'));

          const responsableMap = new Map<number, string>();
          allAssignments
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
            estado_aprobacion: effectiveBlockStatus,
            responsables: Array.from(responsableMap.entries()).map(([id, name]) => ({ id, name })),
            linked_count: linkedCount,
          };
        });

        const childrenByBlock: Record<number, EvidenceApprovalItem[]> = {};
        blocks.forEach((b: any) => {
          childrenByBlock[b.elemento_id] = allElements
            .filter(
              (e: any) =>
                e.padre_id === b.elemento_id
                && (assignedElementIds.has(e.elemento_id) || rejectedElementIds.has(e.elemento_id))
                && e.activo !== false,
            )
            .map((child: any) => {
              const childId = child.elemento_id;
              const approvalsByUser = approvalsByElementAndUser.get(childId) ?? {};
              const childAssignments = allAssignmentsByElement.get(childId) ?? [];
              const uniqueAssignees = getLatestAssignmentsByUser(childAssignments);

              const includedAssignees = uniqueAssignees.filter((assignment) => {
                if (isCompletedAssignmentStatus(assignment?.estado)) {
                  return true;
                }

                const userId = Number(assignment?.usuario_id);
                if (!Number.isFinite(userId)) return false;

                const decision = approvalsByUser[String(userId)];
                if (!decision) return false;

                return normalizeEvidenceStatus(decision.approval_status) === 'rechazado';
              });

              if (includedAssignees.length === 0) {
                return null;
              }

              const filteredApprovalsByUser = includedAssignees.reduce<
                Record<
                  string,
                  {
                    approval_status: EvidenceApprovalStatus;
                    comentario_rechazo?: string | null;
                    updated_at?: string | null;
                  }
                >
              >((acc, assignment) => {
                const userId = Number(assignment?.usuario_id);
                if (!Number.isFinite(userId)) return acc;

                const decision = approvalsByUser[String(userId)];
                if (!decision) return acc;

                const decisionStatus = normalizeEvidenceStatus(decision.approval_status);

                if (!isCompletedAssignmentStatus(assignment?.estado)) {
                  if (decisionStatus !== 'rechazado') {
                    return acc;
                  }

                  acc[String(userId)] = {
                    approval_status: decisionStatus,
                    comentario_rechazo: decision.comentario_rechazo ?? null,
                    updated_at: decision.updated_at ?? null,
                  };

                  return acc;
                }

                const assignmentUpdatedAt = parseTimestamp(
                  assignment?.updated_at ?? assignment?.fecha_asignacion,
                );

                if (
                  !isDecisionCurrentForAssignment(
                    decision?.updated_at,
                    assignmentUpdatedAt,
                  )
                ) {
                  return acc;
                }

                acc[String(userId)] = {
                  approval_status: decisionStatus,
                  comentario_rechazo: decision.comentario_rechazo ?? null,
                  updated_at: decision.updated_at ?? null,
                };

                return acc;
              }, {});

              const firstDecision = includedAssignees
                .map((assignment) => filteredApprovalsByUser[String(assignment.usuario_id)])
                .find((decision) => Boolean(decision));

              const firstAssignment = includedAssignees[0];
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
                  updated_at: firstAssignment.updated_at ?? null,
                } : null,
                asignacion_id: firstAssignment?.elemento_asignacion_id,
                approvals_by_user: filteredApprovalsByUser,
                responsables_asignados: includedAssignees.map((assignment: any) => ({
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
                  updated_at: assignment.updated_at ?? null,
                })),
              };
            })
            .filter((item): item is EvidenceApprovalItem => item !== null);
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

        const reviewableAssignments = assignmentsArray.filter((assignment: any) =>
          isCompletedAssignmentStatus(assignment?.estado),
        );

        const latestCompletedAssignmentByCriterion = new Map<number, number>();
        const latestCompletedAssignmentByEvidence = new Map<
          number,
          { assignment: any; updatedAt: number }
        >();
        const latestCompletedAssignmentByEvidenceUser = new Map<
          string,
          { assignment: any; updatedAt: number }
        >();

        const evidenceIdsByCriterion = new Map<number, Set<number>>();
        reviewableAssignments.forEach((assignment: any) => {
          const evidenceData = assignment?.evidencia ?? assignment?.evidence ?? null;
          const criterionIdRaw = evidenceData?.criterio_id ?? assignment?.criterio_id;
          const criterionId = Number(criterionIdRaw);
          if (!Number.isFinite(criterionId)) return;

          const evidenceIdRaw =
            assignment?.evidencia_id ?? evidenceData?.evidencia_id ?? evidenceData?.id;
          const evidenceId = Number(evidenceIdRaw);
          if (!Number.isFinite(evidenceId)) return;

          const assignmentUpdatedAt = parseTimestamp(
            assignment?.updated_at ?? assignment?.fecha_asignacion,
          );

          const previousCriterionUpdatedAt =
            latestCompletedAssignmentByCriterion.get(criterionId) ?? 0;
          if (assignmentUpdatedAt >= previousCriterionUpdatedAt) {
            latestCompletedAssignmentByCriterion.set(criterionId, assignmentUpdatedAt);
          }

          const previousEvidenceAssignment = latestCompletedAssignmentByEvidence.get(evidenceId);
          if (!previousEvidenceAssignment || assignmentUpdatedAt >= previousEvidenceAssignment.updatedAt) {
            latestCompletedAssignmentByEvidence.set(evidenceId, {
              assignment,
              updatedAt: assignmentUpdatedAt,
            });
          }

          const userId = Number(
            assignment?.usuario_id
              ?? assignment?.usuario?.usuario_id
              ?? assignment?.user?.usuario_id,
          );

          if (Number.isFinite(userId)) {
            const evidenceUserKey = `${evidenceId}-${userId}`;
            const previousEvidenceUserAssignment =
              latestCompletedAssignmentByEvidenceUser.get(evidenceUserKey);

            if (
              !previousEvidenceUserAssignment
              || assignmentUpdatedAt >= previousEvidenceUserAssignment.updatedAt
            ) {
              latestCompletedAssignmentByEvidenceUser.set(evidenceUserKey, {
                assignment,
                updatedAt: assignmentUpdatedAt,
              });
            }
          }

          if (!evidenceIdsByCriterion.has(criterionId)) {
            evidenceIdsByCriterion.set(criterionId, new Set<number>());
          }

          evidenceIdsByCriterion.get(criterionId)!.add(evidenceId);
        });

        const linkedCountByCriterion = new Map<number, number>();
        evidenceIdsByCriterion.forEach((evidenceIds, criterionId) => {
          linkedCountByCriterion.set(criterionId, evidenceIds.size);
        });

        const latestCriterionApprovalByKey = new Map<
          string,
          { estado: BlockApprovalStatus; updatedAt: number }
        >();
        approvalsArray.forEach((aprobacion: any) => {
          const criterionId = toNumericId(
            aprobacion?.criterio_id ?? aprobacion?.criterion?.criterio_id,
          );
          const processId = toNumericId(
            aprobacion?.proceso_id ?? aprobacion?.process?.proceso_id,
          );
          if (criterionId === null || processId === null) return;

          const key = `${criterionId}-${processId}`;
          const next = {
            estado: normalizeBlockStatus(aprobacion?.estado),
            updatedAt: parseTimestamp(aprobacion?.updated_at),
          };

          const prev = latestCriterionApprovalByKey.get(key);
          if (!prev || next.updatedAt >= prev.updatedAt) {
            latestCriterionApprovalByKey.set(key, next);
          }
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

        const visibleCriterionIds = new Set<number>(evidenceIdsByCriterion.keys());

        const filteredCriteria = criteriaArray.filter((criterion: any) => {
          const criterionId = Number(criterion?.id ?? criterion?.criterio_id);
          return Number.isFinite(criterionId) && visibleCriterionIds.has(criterionId);
        });

        const criteriaWithStatus: Criterio[] = filteredCriteria.map((c: any) => {
          const criterionId = Number(c.id ?? c.criterio_id);
          const key = selectedProcesoIdNum !== null ? `${criterionId}-${selectedProcesoIdNum}` : null;
          const latestApproval = key ? latestCriterionApprovalByKey.get(key) : undefined;
          const latestCompletedSubmissionAt =
            latestCompletedAssignmentByCriterion.get(criterionId) ?? 0;
          const latestApprovalAt = latestApproval?.updatedAt ?? 0;
          const hasFreshSubmission = hasFreshSubmissionSinceDecision(
            latestCompletedSubmissionAt,
            latestApprovalAt,
          );
          const responsibleUsers = Array.from(
            (responsablesByCriterion.get(criterionId) ?? new Map<number, string>()).entries(),
          ).map(([id, name]) => ({ id, name }));
          return {
            ...c,
            id: criterionId,
            nomenclatura: c.nomenclatura ?? '',
            descripcion: c.descripcion ?? '',
            estado_aprobacion: (hasFreshSubmission
              ? 'pendiente'
              : (latestApproval?.estado ?? 'pendiente')) as BlockApprovalStatus,
            linked_count: linkedCountByCriterion.get(criterionId) ?? 0,
            responsables: responsibleUsers,
          };
        });

        const preloadedEvidenceApprovals: Record<number, EvidenceApprovalItem[]> = {};

        if (selectedProcesoId) {
          const pendingCriteriaIds = criteriaWithStatus
            .filter((criterio: Criterio) => (criterio.estado_aprobacion ?? 'pendiente') === 'pendiente')
            .map((criterio: Criterio) => criterio.id);

          const evidenceApprovalResults = await Promise.all(
            pendingCriteriaIds.map(async (criterionId: number) => {
              try {
                const res = await axiosInstance.get(
                  `/criterios/${criterionId}/evidencias/aprobaciones`,
                  { params: { proceso_id: selectedProcesoId } },
                );

                const loaded: EvidenceApprovalItem[] = (
                  res.data?.data?.evidences ?? []
                )
                  .map((item: any) => {
                    const evidenceId = Number(item?.evidencia_id);
                    if (!Number.isFinite(evidenceId)) return null;

                    const evidenceAssignmentSnapshot =
                      latestCompletedAssignmentByEvidence.get(evidenceId);
                    if (!evidenceAssignmentSnapshot) return null;

                    const rawApprovalsByUser = item?.approvals_by_user ?? {};
                    const filteredApprovalsByUser = Object.entries(rawApprovalsByUser).reduce<
                      Record<
                        string,
                        {
                          approval_status: EvidenceApprovalStatus;
                          comentario_rechazo?: string | null;
                          aprobacion_evidencia_id?: number | null;
                          updated_at?: string | null;
                        }
                      >
                    >((acc, [userIdRaw, decision]) => {
                      const userId = Number(userIdRaw);
                      if (!Number.isFinite(userId)) return acc;

                      const assignmentSnapshot =
                        latestCompletedAssignmentByEvidenceUser.get(
                          `${evidenceId}-${userId}`,
                        );
                      if (!assignmentSnapshot) return acc;

                      if (
                        !isDecisionCurrentForAssignment(
                          (decision as any)?.updated_at,
                          assignmentSnapshot.updatedAt,
                        )
                      ) {
                        return acc;
                      }

                      acc[String(userId)] = {
                        approval_status: normalizeEvidenceStatus(
                          (decision as any)?.approval_status,
                        ),
                        comentario_rechazo:
                          (decision as any)?.comentario_rechazo ?? null,
                        aprobacion_evidencia_id:
                          (decision as any)?.aprobacion_evidencia_id ?? null,
                        updated_at: (decision as any)?.updated_at ?? null,
                      };

                      return acc;
                    }, {});

                    const latestDecision = Object.values(filteredApprovalsByUser)
                      .sort(
                        (a, b) =>
                          parseTimestamp(b.updated_at ?? null)
                          - parseTimestamp(a.updated_at ?? null),
                      )[0];

                    const assignmentData = evidenceAssignmentSnapshot.assignment;
                    const assignmentUserId = Number(
                      assignmentData?.usuario_id
                        ?? assignmentData?.usuario?.usuario_id
                        ?? assignmentData?.user?.usuario_id,
                    );

                    return {
                      ...item,
                      approval_status: latestDecision?.approval_status ?? 'pendiente',
                      comentario_rechazo: latestDecision?.comentario_rechazo ?? null,
                      asignacion:
                        Number.isFinite(assignmentUserId)
                          ? {
                              estado: assignmentData?.estado,
                              fecha_limite: assignmentData?.fecha_limite ?? null,
                              usuario_id: assignmentUserId,
                              usuario_nombre:
                                assignmentData?.usuario?.nombre
                                ?? assignmentData?.user?.nombre
                                ?? assignmentData?.usuario_nombre
                                ?? null,
                              updated_at:
                                assignmentData?.updated_at
                                ?? assignmentData?.fecha_asignacion
                                ?? null,
                            }
                          : null,
                      asignacion_id:
                        assignmentData?.evidencia_asignacion_id
                        ?? item?.asignacion_id,
                      approvals_by_user: filteredApprovalsByUser,
                    } satisfies EvidenceApprovalItem;
                  })
                  .filter((item): item is EvidenceApprovalItem => item !== null);

                return [criterionId, loaded] as const;
              } catch {
                return [criterionId, [] as EvidenceApprovalItem[]] as const;
              }
            }),
          );

          evidenceApprovalResults.forEach(([criterionId, approvals]) => {
            preloadedEvidenceApprovals[criterionId] = approvals;
          });
        }

        setEvidenceApprovalsByCriterion(preloadedEvidenceApprovals);
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
      const status = normalizeBlockStatus(criterio.estado_aprobacion);
      const statusSearchTerms = BLOCK_STATUS_SEARCH_TERMS[status];

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
        status,
        ...statusSearchTerms,
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

  const actionRulesByCriterion = useMemo(
    () =>
      criteria.reduce<Record<number, { canApproveByEvidence: boolean; canRejectByEvidence: boolean; isLoaded: boolean }>>(
        (acc, criterio) => {
          const isLoaded =
            isFlexible
            || normalizeBlockStatus(criterio.estado_aprobacion) !== 'pendiente'
            || hasCriterionRulesLoaded(evidenceApprovalsByCriterion, criterio.id);

          if (!isLoaded) {
            acc[criterio.id] = {
              canApproveByEvidence: false,
              canRejectByEvidence: false,
              isLoaded: false,
            };
            return acc;
          }

          const flags = extractEvidenceDecisionFlags(
            evidenceApprovalsByCriterion[criterio.id],
          );

          acc[criterio.id] = {
            canApproveByEvidence: !flags.hasRejected,
            canRejectByEvidence: !flags.hasApproved,
            isLoaded: true,
          };
          return acc;
        },
        {},
      ),
    [criteria, evidenceApprovalsByCriterion, isFlexible],
  );

  const loadCriterionApprovalsIfNeeded = useCallback(
    async (criterionId: number): Promise<EvidenceApprovalItem[]> => {
      const cached = evidenceApprovalsByCriterion[criterionId];
      if (cached !== undefined) return cached;

      if (!selectedProcesoId || isFlexible) {
        return [];
      }

      try {
        const res = await axiosInstance.get(
          `/criterios/${criterionId}/evidencias/aprobaciones`,
          { params: { proceso_id: selectedProcesoId } },
        );

        const loaded: EvidenceApprovalItem[] = (
          res.data?.data?.evidences ?? []
        ).map((item: any) => ({
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
          [criterionId]: loaded,
        }));

        return loaded;
      } catch {
        setEvidenceApprovalsByCriterion((prev) => ({
          ...prev,
          [criterionId]: [],
        }));
        return [];
      }
    },
    [evidenceApprovalsByCriterion, isFlexible, selectedProcesoId],
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
  const handleAprobar = useCallback(async (criterio: Criterio) => {
    const evidencias = await loadCriterionApprovalsIfNeeded(criterio.id);
    const flags = extractEvidenceDecisionFlags(evidencias);
    if (flags.hasRejected) {
      showToast({
        type: 'warning',
        title: 'Acción no permitida',
        message: `No se puede aprobar el bloque porque ya existen ${isFlexible ? 'elementos' : 'evidencias'} rechazadas dentro del bloque.`,
      });
      return;
    }

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
  }, [isFlexible, loadCriterionApprovalsIfNeeded, showToast]);

  const handleRechazar = useCallback(async (criterio: Criterio) => {
    const blockStatus = normalizeBlockStatus(criterio.estado_aprobacion);
    if (blockStatus !== 'pendiente') {
      showToast({
        type: 'warning',
        title: 'Acción no permitida',
        message:
          blockStatus === 'aprobado'
            ? 'No se puede rechazar un bloque ya aprobado.'
            : 'No se puede rechazar un bloque que ya fue procesado.',
      });
      return;
    }

    const evidencias = await loadCriterionApprovalsIfNeeded(criterio.id);
    const flags = extractEvidenceDecisionFlags(evidencias);
    if (flags.hasApproved) {
      showToast({
        type: 'warning',
        title: 'Acción no permitida',
        message: `No se puede rechazar porque ya existen ${isFlexible ? 'elementos' : 'evidencias'} aprobadas dentro del bloque.`,
      });
      return;
    }

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
  }, [isFlexible, loadCriterionApprovalsIfNeeded, showToast]);

  const handleConfirmAction = async (
    comentario: string,
    nuevaFechaLimite?: string,
  ) => {
    const { criterion, action } = approvalState;
    if (!criterion || !selectedProcesoId) return;

    const evidencias = await loadCriterionApprovalsIfNeeded(criterion.id);
    const flags = extractEvidenceDecisionFlags(evidencias);
    if (action === 'aprobar' && flags.hasRejected) {
      showToast({
        type: 'warning',
        title: 'Acción no permitida',
        message: `No se puede aprobar el bloque porque ya existen ${isFlexible ? 'elementos' : 'evidencias'} rechazadas dentro del bloque.`,
      });
      setApprovalState((prev) => ({ ...prev, isOpen: false, criterion: null }));
      return;
    }

    if (action === 'rechazar' && flags.hasApproved) {
      showToast({
        type: 'warning',
        title: 'Acción no permitida',
        message: `No se puede rechazar el bloque porque ya existen ${isFlexible ? 'elementos' : 'evidencias'} aprobadas dentro del bloque.`,
      });
      setApprovalState((prev) => ({ ...prev, isOpen: false, criterion: null }));
      return;
    }

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
      if (normalizeEvidenceStatus(evidencia.approval_status) === 'aprobado') {
        showToast({
          type: 'warning',
          title: 'Acción no permitida',
          message: 'No se puede rechazar un elemento ya aprobado.',
        });
        return;
      }

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
    [showToast],
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
        title: "Error al procesar el elemento",
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
        actionRulesByCriterion={actionRulesByCriterion}
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

      {/* Éxito de evidencia individual */}
      <SuccessModal
        isOpen={evidenceModal.successOpen}
        onClose={() =>
          setEvidenceModal((prev) => ({ ...prev, successOpen: false }))
        }
        title={
          evidenceModal.action === "aprobar"
            ? "Elemento Aprobado"
            : "Elemento Rechazado"
        }
        message={`El elemento ha sido ${evidenceModal.action === "aprobar" ? "aprobado" : "rechazado"} exitosamente.`}
      />
    </ScreenContainer>
  );
};

export default BlockApproval;
