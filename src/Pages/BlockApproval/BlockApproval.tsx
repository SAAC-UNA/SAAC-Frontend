import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScreenContainer, PageHeader } from "@/Components/Ui/Index";
import { useToast } from "@/Context/ToastContext";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { axiosInstance } from "@/Config/axios";
import { ApprovalModal } from "./Components/ApprovalModal";
import { EvidenceApprovalModal } from "./Components/EvidenceApprovalModal";
import { EvidenceFilesModal } from "./Components/EvidenceFilesModal";
import { SuccessModal } from "@/Components/Ui/Modals/SuccessModal";
import {
  FilterButton,
  type FilterOption,
} from "@/Components/Ui/Buttons/FilterButton";
import { TABLE_PAGE_SIZE } from "@/Constants/TablePagination";
import { BlockApprovalTable } from "./Components/BlockApprovalTable";
import type {
  Criterio,
  Evidencia,
  EvidenceApprovalItem,
} from "./Components/BlockApprovalTable";
import { GLOBAL_FILTER_CONTEXT_CHANGED_EVENT } from "@/Services/GlobalFilterContextService";
import { getOperationalContextSnapshot } from "@/Services/OperationalContextStore";

type BlockApprovalStatus =
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | "incompleto";

const BlockApproval: React.FC = () => {
  const moduleInfo = getModuleInfo("block_approval");
  const { showToast } = useToast();
  const [dataState, setDataState] = useState<{
    isLoading: boolean;
    criteria: Criterio[];
    evidences: Evidencia[];
  }>({ isLoading: true, criteria: [], evidences: [] });

  const [filterState, setFilterState] = useState<{
    selectedProcesoId: number | null;
    currentPage: number;
    approvalFilter: BlockApprovalStatus | "todos";
  }>({ selectedProcesoId: null, currentPage: 1, approvalFilter: "pendiente" });

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

  // Modal de archivos
  const [filesModal, setFilesModal] = useState<{
    open: boolean;
    evidencia: Evidencia | null;
  }>({ open: false, evidencia: null });

  const { isLoading, criteria, evidences } = dataState;
  const { selectedProcesoId, currentPage, approvalFilter } = filterState;
  const itemsPerPage = TABLE_PAGE_SIZE.standard;

  const filtroOptions: FilterOption<BlockApprovalStatus | "todos">[] = [
    { value: "pendiente", label: "Pendientes" },
    { value: "incompleto", label: "Incompletos" },
    { value: "aprobado", label: "Aprobados" },
    { value: "rechazado", label: "Rechazados" },
    { value: "todos", label: "Todos" },
  ];

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
    setDataState((prev) => ({ ...prev, isLoading: true }));
    try {
      const [criteriaResponse, evidencesResponse, approvalsResponse] =
        await Promise.all([
          axiosInstance.get("/estructura/criterios"),
          axiosInstance.get("/estructura/evidencias"),
          axiosInstance.get("/aprobaciones-criterios"),
        ]);

      const criteriaArray = criteriaResponse.data.data || criteriaResponse.data;
      const evidencesArray =
        evidencesResponse.data.data || evidencesResponse.data;
      const approvalsArray =
        approvalsResponse.data.data || approvalsResponse.data;

      const normalizedCriteria: Criterio[] = (criteriaArray as any[])
        .map((item) => ({
          ...item,
          id: item.id ?? item.criterio_id,
          nomenclatura: item.nomenclatura,
          descripcion: item.descripcion,
        }))
        .filter((item) => typeof item.id === "number");

      const normalizedEvidences: Evidencia[] = (evidencesArray as any[])
        .map((item) => ({
          ...item,
          id: item.id ?? item.evidencia_id,
          criterio_id: item.criterio_id,
          nomenclatura: item.nomenclatura,
          descripcion: item.descripcion,
        }))
        .filter(
          (item) =>
            typeof item.id === "number" && typeof item.criterio_id === "number",
        );

      const approvalsMap = new Map<string, BlockApprovalStatus>();
      approvalsArray.forEach((aprobacion: any) => {
        const key = `${aprobacion.criterio_id}-${aprobacion.proceso_id}`;
        approvalsMap.set(key, aprobacion.estado as BlockApprovalStatus);
      });

      const criteriaWithStatus = normalizedCriteria.map((c: any) => {
        const key = selectedProcesoId ? `${c.id}-${selectedProcesoId}` : "";
        return {
          ...c,
          estado_aprobacion: (approvalsMap.get(key) ??
            "pendiente") as BlockApprovalStatus,
        };
      });

      setDataState({
        criteria: criteriaWithStatus,
        evidences: normalizedEvidences,
        isLoading: false,
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error al cargar datos",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "No se pudieron cargar los criterios",
      });
      setDataState((prev) => ({ ...prev, isLoading: false }));
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
        const evidences: EvidenceApprovalItem[] =
          res.data?.data?.evidences ?? [];
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

  const filteredCriteria = useMemo(
    () =>
      criteria.filter(
        (c) =>
          approvalFilter === "todos" || c.estado_aprobacion === approvalFilter,
      ),
    [criteria, approvalFilter],
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
    setApprovalState((prev) => ({
      ...prev,
      isOpen: true,
      action: "aprobar",
      criterion: criterio,
    }));
  }, []);

  const handleRechazar = useCallback((criterio: Criterio) => {
    setApprovalState((prev) => ({
      ...prev,
      isOpen: true,
      action: "rechazar",
      criterion: criterio,
    }));
  }, []);

  const handleConfirmAction = async (
    comentario: string,
    nuevaFechaLimite?: string,
  ) => {
    const { criterion, action } = approvalState;
    if (!criterion || !selectedProcesoId) return;

    try {
      const endpoint =
        action === "aprobar"
          ? `/criterios/${criterion.id}/aprobar`
          : `/criterios/${criterion.id}/rechazar`;

      await axiosInstance.post(endpoint, {
        proceso_id: selectedProcesoId,
        comentario: comentario || null,
        ...(nuevaFechaLimite ? { nueva_fecha_limite: nuevaFechaLimite } : {}),
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
        title: "Error al procesar la solicitud",
        message: error.response?.data?.message || "Ocurrió un error inesperado",
      });
      setApprovalState((prev) => ({ ...prev, isOpen: false, criterion: null }));
    }
  };

  // --- Handlers de EVIDENCIA INDIVIDUAL ---
  const handleAprobarEvidencia = useCallback(
    (criterio: Criterio, evidencia: EvidenceApprovalItem) => {
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
      const endpoint =
        action === "aprobar"
          ? `/criterios/${criterio.id}/evidencias/${evidencia.evidencia_id}/aprobar`
          : `/criterios/${criterio.id}/evidencias/${evidencia.evidencia_id}/rechazar`;

      await axiosInstance.post(endpoint, {
        proceso_id: selectedProcesoId,
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

  const handleViewFiles = useCallback((evidencia: Evidencia) => {
    setFilesModal({ open: true, evidencia });
  }, []);

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        breadcrumbMode="contextual"
        headerExtra={
          <div className="flex gap-4 items-end">
            <FilterButton
              tooltipText="Filtrar por estado"
              options={filtroOptions}
              value={approvalFilter}
              onChange={(value) =>
                setFilterState((prev) => ({ ...prev, approvalFilter: value }))
              }
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
        onPageChange={(value) =>
          setFilterState((prev) => ({ ...prev, currentPage: value }))
        }
        onAprobar={handleAprobar}
        onRechazar={handleRechazar}
        onViewFiles={handleViewFiles}
        onAprobarEvidencia={handleAprobarEvidencia}
        onRechazarEvidencia={handleRechazarEvidencia}
        onExpandCriterion={handleExpandCriterion}
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
          criterio={approvalState.criterion}
          evidencias={getEvidencesByCriterion(approvalState.criterion.id)}
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
            ? "Evidencia Aprobada"
            : "Evidencia Rechazada"
        }
        message={`La evidencia ha sido ${evidenceModal.action === "aprobar" ? "aprobada" : "rechazada"} exitosamente.`}
      />

      {/* Modal de archivos */}
      <EvidenceFilesModal
        isOpen={filesModal.open}
        onClose={() => setFilesModal({ open: false, evidencia: null })}
        evidencia={filesModal.evidencia}
      />
    </ScreenContainer>
  );
};

export default BlockApproval;
