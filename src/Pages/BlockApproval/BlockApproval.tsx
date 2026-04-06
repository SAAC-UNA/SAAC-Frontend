import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ScreenContainer, PageHeader } from '@/Components/Ui/Index';
import { useToast } from '@/Context/ToastContext';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import { axiosInstance } from '@/Config/axios';
import { ApprovalModal } from './Components/ApprovalModal';
import { EvidenceApprovalModal } from './Components/EvidenceApprovalModal';
import { EvidenceFilesModal } from './Components/EvidenceFilesModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { FilterButton, type FilterOption } from '@/Components/Ui/Buttons/FilterButton';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { BlockApprovalTable } from './Components/BlockApprovalTable';
import type { Criterio, Evidencia, EvidenceApprovalItem, EvidenceApprovalStatus } from './Components/BlockApprovalTable';
import { Card } from '@/Components/Ui/Layout/Card';

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

const BlockApproval: React.FC = () => {
  const moduleInfo = getModuleInfo('block_approval');
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
    approvalFilter: BlockApprovalStatus | 'todos';
  }>({ selectedProcesoId: null, currentPage: 1, approvalFilter: 'pendiente' });

  // Aprobaciones individuales por criterio
  const [evidenceApprovalsByCriterion, setEvidenceApprovalsByCriterion] = useState<Record<number, EvidenceApprovalItem[]>>({});
  const [loadingEvidences, setLoadingEvidences] = useState<Set<number>>(new Set());

  // Modal de bloque (approve/reject por criterio)
  const [approvalState, setApprovalState] = useState<{
    isOpen: boolean;
    action: 'aprobar' | 'rechazar';
    criterion: Criterio | null;
    successOpen: boolean;
  }>({ isOpen: false, action: 'aprobar', criterion: null, successOpen: false });

  // Modal de evidencia individual
  const [evidenceModal, setEvidenceModal] = useState<{
    isOpen: boolean;
    action: 'aprobar' | 'rechazar';
    criterio: Criterio | null;
    evidencia: EvidenceApprovalItem | null;
    successOpen: boolean;
  }>({ isOpen: false, action: 'aprobar', criterio: null, evidencia: null, successOpen: false });

  // Modal de archivos (flexible: includes criterio + approvalItem for inline review)
  const [filesModal, setFilesModal] = useState<{
    open: boolean;
    evidencia: Evidencia | null;
    criterio: Criterio | null;
    approvalItem: EvidenceApprovalItem | null;
  }>({ open: false, evidencia: null, criterio: null, approvalItem: null });

  const { isLoading, criteria, evidences, processes } = dataState;
  const { selectedProcesoId, currentPage, approvalFilter } = filterState;
  const itemsPerPage = TABLE_PAGE_SIZE.standard;

  const selectedProcess = useMemo(
    () => processes.find(p => p.proceso_id === selectedProcesoId) ?? null,
    [processes, selectedProcesoId]);
  const isFlexible = selectedProcess?.accreditation_cycle?.modelo_estructura?.tipo === 'elemento_flexible';

  const filtroOptions: FilterOption<BlockApprovalStatus | 'todos'>[] = [
    { value: 'pendiente',   label: 'Pendientes' },
    { value: 'incompleto',  label: 'Incompletos' },
    { value: 'aprobado',    label: 'Aprobados' },
    { value: 'rechazado',   label: 'Rechazados' },
    { value: 'todos',       label: 'Todos' },
  ];

  // Limpiar caché de evidencias y recargar datos cuando cambie el proceso
  useEffect(() => {
    setEvidenceApprovalsByCriterion({});
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProcesoId]);

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

        const approvalsMap = new Map<number, { estado: BlockApprovalStatus; comentario: string | null }>();
        allApprovals.forEach((a: any) => {
          approvalsMap.set(a.elemento_id, { estado: a.estado as BlockApprovalStatus, comentario: a.comentario ?? null });
        });

        // Only include assignments that are ready for review (Completado, Observada, Validada)
        const REVIEWABLE_ESTADOS = ['Completado', 'Observada', 'Validada'];
        const reviewableAssignments: any[] = allAssignments.filter((a: any) => REVIEWABLE_ESTADOS.includes(a.estado));

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
          const responsableMap = new Map<number, string>();
          reviewableAssignments
            .filter((a: any) => childElementIds.has(a.elemento_id))
            .forEach((a: any) => {
              const uid = a.usuario_id;
              if (uid && !responsableMap.has(uid)) {
                responsableMap.set(uid, a.user?.nombre ?? a.user?.name ?? String(uid));
              }
            });
          return {
            id: b.elemento_id,
            nomenclatura: b.nomenclatura ?? '',
            descripcion: b.nombre ?? b.descripcion ?? '',
            estado_aprobacion: approvalsMap.get(b.elemento_id)?.estado ?? 'pendiente',
            responsables: Array.from(responsableMap.entries()).map(([id, name]) => ({ id, name })),
          };
        });

        const childrenByBlock: Record<number, EvidenceApprovalItem[]> = {};
        blocks.forEach((b: any) => {
          childrenByBlock[b.elemento_id] = allElements
            .filter((e: any) => e.padre_id === b.elemento_id && assignedElementIds.has(e.elemento_id) && e.activo !== false)
            .map((child: any) => {
              const childId = child.elemento_id;
              const apr = approvalsMap.get(childId);
              const childAssignments = assignmentsByElement.get(childId) ?? [];
              const firstAssignment = childAssignments[0];
              const validStatuses: EvidenceApprovalStatus[] = ['pendiente', 'aprobado', 'rechazado'];
              return {
                evidencia_id: childId,
                nomenclatura: child.nomenclatura ?? '',
                descripcion: child.nombre ?? child.descripcion ?? '',
                approval_status: (validStatuses.includes(apr?.estado as EvidenceApprovalStatus) ? apr!.estado : 'pendiente') as EvidenceApprovalStatus,
                comentario_rechazo: apr?.comentario ?? null,
                asignacion: firstAssignment ? {
                  estado: firstAssignment.estado,
                  fecha_limite: firstAssignment.fecha_limite,
                  usuario_id: firstAssignment.usuario_id,
                } : null,
                asignacion_id: firstAssignment?.elemento_asignacion_id,
              };
            });
        });

        setDataState({ isLoading: false, criteria: criteriaFromBlocks, evidences: [], processes: processesArray });
        setEvidenceApprovalsByCriterion(childrenByBlock);

      } else {
        // ── Traditional mode: load criteria + evidences + criterion approvals ─
        const [criteriaResponse, evidencesResponse, approvalsResponse] = await Promise.all([
          axiosInstance.get('/estructura/criterios'),
          axiosInstance.get('/estructura/evidencias'),
          axiosInstance.get('/aprobaciones-criterios'),
        ]);

        const criteriaArray  = criteriaResponse.data.data  || criteriaResponse.data;
        const evidencesArray = evidencesResponse.data.data || evidencesResponse.data;
        const approvalsArray = approvalsResponse.data.data || approvalsResponse.data;

        const approvalsMap = new Map<string, BlockApprovalStatus>();
        approvalsArray.forEach((aprobacion: any) => {
          const key = `${aprobacion.criterio_id}-${aprobacion.proceso_id}`;
          approvalsMap.set(key, aprobacion.estado as BlockApprovalStatus);
        });

        const criteriaWithStatus = criteriaArray.map((c: any) => {
          const key = selectedProcesoId ? `${c.id}-${selectedProcesoId}` : '';
          return {
            ...c,
            estado_aprobacion: (approvalsMap.get(key) ?? 'pendiente') as BlockApprovalStatus,
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
  const handleExpandCriterion = useCallback(async (criterionId: number) => {
    if (!selectedProcesoId || evidenceApprovalsByCriterion[criterionId] !== undefined) return;
    setLoadingEvidences(prev => new Set(prev).add(criterionId));
    try {
      const res = await axiosInstance.get(`/criterios/${criterionId}/evidencias/aprobaciones`, {
        params: { proceso_id: selectedProcesoId },
      });
      const evidences: EvidenceApprovalItem[] = res.data?.data?.evidences ?? [];
      setEvidenceApprovalsByCriterion(prev => ({ ...prev, [criterionId]: evidences }));
    } catch {
      setEvidenceApprovalsByCriterion(prev => ({ ...prev, [criterionId]: [] }));
    } finally {
      setLoadingEvidences(prev => { const s = new Set(prev); s.delete(criterionId); return s; });
    }
  }, [selectedProcesoId, evidenceApprovalsByCriterion]);

  const getEvidencesByCriterion = useCallback((criterionId: number) =>
    evidences.filter(ev => ev.criterio_id === criterionId),
  [evidences]);

  const filteredCriteria = useMemo(() =>
    criteria.filter(c => approvalFilter === 'todos' || c.estado_aprobacion === approvalFilter),
  [criteria, approvalFilter]);

  const totalPages = Math.ceil(filteredCriteria.length / itemsPerPage);
  const paginatedCriteria = useMemo(() =>
    filteredCriteria.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
  [filteredCriteria, currentPage, itemsPerPage]);

  useEffect(() => {
    setFilterState(prev => ({ ...prev, currentPage: 1 }));
  }, [filteredCriteria.length]);

  // --- Handlers de BLOQUE ---
  const handleAprobar = useCallback((criterio: Criterio) => {
    setApprovalState(prev => ({ ...prev, isOpen: true, action: 'aprobar', criterion: criterio }));
  }, []);

  const handleRechazar = useCallback((criterio: Criterio) => {
    setApprovalState(prev => ({ ...prev, isOpen: true, action: 'rechazar', criterion: criterio }));
  }, []);

  const handleConfirmAction = async (comentario: string, nuevaFechaLimite?: string) => {
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
        ...(nuevaFechaLimite ? { nueva_fecha_limite: nuevaFechaLimite } : {}),
      });

      setApprovalState(prev => ({ ...prev, isOpen: false, criterion: null, successOpen: true }));
      // Invalidar caché de evidencias del criterio afectado
      setEvidenceApprovalsByCriterion(prev => { const n = { ...prev }; delete n[criterion.id]; return n; });
      await fetchData();
    } catch (error: any) {
      showToast({ type: 'error', title: 'Error al procesar la solicitud', message: error.response?.data?.message || 'Ocurrió un error inesperado' });
      setApprovalState(prev => ({ ...prev, isOpen: false, criterion: null }));
    }
  };

  // --- Handlers de EVIDENCIA INDIVIDUAL ---
  const handleAprobarEvidencia = useCallback((criterio: Criterio, evidencia: EvidenceApprovalItem) => {
    setEvidenceModal({ isOpen: true, action: 'aprobar', criterio, evidencia, successOpen: false });
  }, []);

  const handleRechazarEvidencia = useCallback((criterio: Criterio, evidencia: EvidenceApprovalItem) => {
    setEvidenceModal({ isOpen: true, action: 'rechazar', criterio, evidencia, successOpen: false });
  }, []);

  const handleConfirmEvidenceAction = async (comentario?: string, nuevaFechaLimite?: string) => {
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
        ...(comentario ? { comentario } : {}),
        ...(nuevaFechaLimite ? { nueva_fecha_limite: nuevaFechaLimite } : {}),
      });

      setEvidenceModal(prev => ({ ...prev, isOpen: false, evidencia: null, successOpen: true }));
      // Invalidar caché del criterio para recargar estados individuales
      setEvidenceApprovalsByCriterion(prev => { const n = { ...prev }; delete n[criterio.id]; return n; });
      await fetchData();
    } catch (error: any) {
      showToast({ type: 'error', title: 'Error al procesar la evidencia', message: error.response?.data?.message || 'Ocurrió un error inesperado' });
      setEvidenceModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleViewFiles = useCallback((evidencia: Evidencia) => {
    setFilesModal({ open: true, evidencia, criterio: null, approvalItem: null });
  }, []);

  const handleViewElementRow = useCallback((criterio: Criterio, ev: EvidenceApprovalItem) => {
    setFilesModal({
      open: true,
      evidencia: { id: ev.asignacion_id ?? ev.evidencia_id, nomenclatura: ev.nomenclatura, descripcion: ev.descripcion, criterio_id: criterio.id },
      criterio,
      approvalItem: ev,
    });
  }, []);

  const handleFilesModalAction = useCallback(async (action: 'aprobar' | 'rechazar', comentario?: string) => {
    const { criterio, approvalItem } = filesModal;
    if (!criterio || !approvalItem || !selectedProcesoId) return;
    const endpoint = action === 'aprobar'
      ? `/elementos/${criterio.id}/hijos/${approvalItem.evidencia_id}/aprobar`
      : `/elementos/${criterio.id}/hijos/${approvalItem.evidencia_id}/rechazar`;
    await axiosInstance.post(endpoint, {
      proceso_id: selectedProcesoId,
      ...(comentario ? { comentario } : {}),
    });
    setFilesModal({ open: false, evidencia: null, criterio: null, approvalItem: null });
    setEvidenceApprovalsByCriterion(prev => { const n = { ...prev }; delete n[criterio.id]; return n; });
    await fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesModal, selectedProcesoId]);

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        headerExtra={
          <div className="flex gap-4 items-end">
            <Card className="w-80">
              <CustomSelect
                label="Seleccionar Proceso"
                value={selectedProcesoId?.toString() || ''}
                placeholder="Seleccione un proceso"
                size="sm"
                onChange={(value) => setFilterState(prev => ({ ...prev, selectedProcesoId: value ? Number(value) : null }))}
                options={processes
                  .map((p) => {
                    const career = p.accreditation_cycle?.career_campus?.career?.nombre;
                    const campus = p.accreditation_cycle?.career_campus?.campus?.nombre;
                    const cycleLabel = career && campus
                      ? `${career} - ${campus}`
                      : p.accreditation_cycle?.nombre ?? `Proceso ${p.proceso_id}`;
                    return {
                      value: p.proceso_id.toString(),
                      label: `${cycleLabel} (${p.tipo_proceso})`,
                    };
                  })}
                maxVisibleItems={5}
              />
            </Card>
            <FilterButton
              tooltipText="Filtrar por estado"
              options={filtroOptions}
              value={approvalFilter}
              onChange={(value) => setFilterState(prev => ({ ...prev, approvalFilter: value }))}
            />
          </div>
        }
      />

      <BlockApprovalTable
        criteria={paginatedCriteria}
        evidences={evidences}
        evidenceApprovals={evidenceApprovalsByCriterion}
        loadingEvidences={loadingEvidences}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        selectedProcesoId={selectedProcesoId}
        isFlexible={isFlexible}
        onPageChange={(value) => setFilterState(prev => ({ ...prev, currentPage: value }))}
        onAprobar={handleAprobar}
        onRechazar={handleRechazar}
        onViewFiles={handleViewFiles}
        onAprobarEvidencia={handleAprobarEvidencia}
        onRechazarEvidencia={handleRechazarEvidencia}
        onExpandCriterion={handleExpandCriterion}
        onViewElementRow={handleViewElementRow}
      />

      {/* Modal de bloque */}
      {approvalState.criterion && (
        <ApprovalModal
          isOpen={approvalState.isOpen}
          onClose={() => setApprovalState(prev => ({ ...prev, isOpen: false, criterion: null }))}
          onConfirm={handleConfirmAction}
          action={approvalState.action}
          criterio={approvalState.criterion}
          evidencias={getEvidencesByCriterion(approvalState.criterion.id)}
        />
      )}

      {/* Modal de evidencia individual */}
      <EvidenceApprovalModal
        isOpen={evidenceModal.isOpen}
        onClose={() => setEvidenceModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmEvidenceAction}
        action={evidenceModal.action}
        criterio={evidenceModal.criterio}
        evidencia={evidenceModal.evidencia}
      />

      {/* Éxito de bloque */}
      <SuccessModal
        isOpen={approvalState.successOpen}
        onClose={() => setApprovalState(prev => ({ ...prev, successOpen: false }))}
        title={approvalState.action === 'aprobar' ? 'Bloque Aprobado' : 'Bloque Rechazado'}
        message={`El bloque ha sido ${approvalState.action === 'aprobar' ? 'aprobado' : 'rechazado'} exitosamente.`}
      />

      {/* Éxito de evidencia individual */}
      <SuccessModal
        isOpen={evidenceModal.successOpen}
        onClose={() => setEvidenceModal(prev => ({ ...prev, successOpen: false }))}
        title={evidenceModal.action === 'aprobar' ? 'Evidencia Aprobada' : 'Evidencia Rechazada'}
        message={`La evidencia ha sido ${evidenceModal.action === 'aprobar' ? 'aprobada' : 'rechazada'} exitosamente.`}
      />

      {/* Modal de archivos (y revisión en modo flexible) */}
      <EvidenceFilesModal
        isOpen={filesModal.open}
        onClose={() => setFilesModal({ open: false, evidencia: null, criterio: null, approvalItem: null })}
        evidencia={filesModal.evidencia}
        approvalStatus={filesModal.approvalItem?.approval_status}
        blockIsApproved={filesModal.criterio?.estado_aprobacion === 'aprobado'}
        onAprobar={filesModal.criterio && filesModal.approvalItem
          ? (comentario) => handleFilesModalAction('aprobar', comentario)
          : undefined}
        onRechazar={filesModal.criterio && filesModal.approvalItem
          ? (comentario) => handleFilesModalAction('rechazar', comentario)
          : undefined}
      />
    </ScreenContainer>
  );
};

export default BlockApproval;