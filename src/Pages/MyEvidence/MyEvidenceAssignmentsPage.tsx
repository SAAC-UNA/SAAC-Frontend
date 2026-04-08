/**
 * MyEvidenceAssignmentsPage - Página principal para ver evidencias asignadas
 * HU-029 - Mis Evidencias Asignadas
 */

import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  PageHeader,
  ScreenContainer,
  CustomSelect,
  LoadingSpinner,
} from "@/Components/Ui/Index";
import type { SelectOption } from "@/Components/Ui/Index";
import { BackendErrorAlert } from "@/Components/Ui/Feedback/BackendErrorAlert";
import { SearchInput } from "@/Components/Ui/Forms/SearchInput";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { TABLE_PAGE_SIZE } from "@/Constants/TablePagination";
import { useToast } from "@/Context/ToastContext";
import { useAuth } from "@/Context/AuthContext";
import { evidenceAssignmentService } from "@/Services/EvidenceAssignmentService";
import { extensionRequestService } from "@/Services/ExtensionRequestService";
import { Modal } from "@/Components/Ui/Modals/Modal";
import type {
  EvidenceAssignment,
  AssignmentFilters,
} from "@/Types/EvidenceAssignmentTypes";
import { filterAndSortAssignments } from "@/Types/EvidenceAssignmentTypes";
import type { CreateExtensionRequestData } from "@/Types/ExtensionRequestTypes";
import type { FlexibleAssignmentItem } from "@/Types/EvidenceAssignment";
import type { UserCycle } from "@/Types/EvidenceAssignment";
import { filterFlexAssignments } from "@/Types/EvidenceAssignment";
import {
  EvidenceAssignmentDetail,
  EvidenceAssignmentsTable,
  ElementAssignmentsTable,
} from "./Components";
import { CreateExtensionRequestModal } from "@/Pages/MyEvidence/Components/CreateExtensionRequestModal";
import { ElementAssignmentDetailModal } from "@/Pages/MyEvidence/Components/ElementAssignmentDetailModal";
import { ElementUploadPage } from "./Components/ElementUploadModal";
import { EvidenceUploadPage } from "./Components/EvidenceUploadModal";

const parsePositiveInt = (value: string | null): number | null => {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const MyEvidenceAssignmentsPage: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [pageState, setPageState] = useState<{
    assignments: EvidenceAssignment[];
    loading: boolean;
    error: string | null;
  }>({ assignments: [], loading: true, error: null });
  const assignments = pageState.assignments;
  const loading = pageState.loading;
  const error = pageState.error;
  const [filters, setFilters] = useState<AssignmentFilters>({
    estado: "todos",
    search: "",
    sortBy: "fecha_asignacion",
    sortDirection: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = TABLE_PAGE_SIZE.standard;

  // Selector de ciclo — datos vienen del endpoint mis-ciclos
  const [userCycles, setUserCycles] = useState<UserCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [appliedRouteContextKey, setAppliedRouteContextKey] = useState<
    string | null
  >(null);

  // Estado del modelo flexible
  const [flexState, setFlexState] = useState<{
    assignments: FlexibleAssignmentItem[];
    loading: boolean;
    error: string | null;
  }>({ assignments: [], loading: false, error: null });
  const [flexModal, setFlexModal] = useState<{
    selectedId: number | null;
    showExtension: boolean;
    selectedForExtension: FlexibleAssignmentItem | null;
  }>({ selectedId: null, showExtension: false, selectedForExtension: null });

  // Confirmación de revertir estado en modelo flexible
  const [flexRevertConfirm, setFlexRevertConfirm] = useState<{
    open: boolean;
    assignment: FlexibleAssignmentItem | null;
    loading: boolean;
  }>({ open: false, assignment: null, loading: false });

  // HU-016: modales de detalle y extensión
  const [modalState, setModalState] = useState<{
    selectedAssignment: EvidenceAssignment | null;
    showExtensionModal: boolean;
    selectedAssignmentForExtension: EvidenceAssignment | null;
  }>({
    selectedAssignment: null,
    showExtensionModal: false,
    selectedAssignmentForExtension: null,
  });

  const [uploadModal, setUploadModal] = useState<{
    open: boolean;
    assignment: FlexibleAssignmentItem | null;
  }>({ open: false, assignment: null });

  const [evidenceUploadModal, setEvidenceUploadModal] = useState<{
    open: boolean;
    assignment: EvidenceAssignment | null;
  }>({ open: false, assignment: null });

  // Modal de confirmación para revertir estado completado → en_progreso
  const [revertConfirmState, setRevertConfirmState] = useState<{
    open: boolean;
    assignment: EvidenceAssignment | null;
    loading: boolean;
  }>({ open: false, assignment: null, loading: false });
  const selectedAssignment = modalState.selectedAssignment;
  const showExtensionModal = modalState.showExtensionModal;
  const selectedAssignmentForExtension =
    modalState.selectedAssignmentForExtension;

  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  };

  // Cargar asignaciones al montar y al volver a la pestaña
  useEffect(() => {
    loadAssignments();
    loadFlexAssignments();
    loadUserCycles();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadAssignments();
        loadFlexAssignments();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user]);

  const loadAssignments = async () => {
    // Intentar obtener el ID del usuario (puede venir como usuario_id o id)
    const userWithOptionalId = user as {
      usuario_id?: number;
      id?: number;
    } | null;
    const userId = userWithOptionalId?.usuario_id ?? userWithOptionalId?.id;

    if (!userId) {
      setPageState((prev) => ({
        ...prev,
        error: "No se pudo obtener la información del usuario",
        loading: false,
      }));
      return;
    }

    try {
      setPageState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await evidenceAssignmentService.getMyAssignments(userId);
      setPageState((prev) => ({ ...prev, assignments: data }));
    } catch (error: unknown) {
      setPageState((prev) => ({
        ...prev,
        error: getErrorMessage(
          error,
          "No se pudieron obtener las evidencias asignadas",
        ),
      }));
    } finally {
      setPageState((prev) => ({ ...prev, loading: false }));
    }
  };

  const loadFlexAssignments = async () => {
    const userWithOptionalId = user as {
      usuario_id?: number;
      id?: number;
    } | null;
    const userId = userWithOptionalId?.usuario_id ?? userWithOptionalId?.id;
    if (!userId) return;

    try {
      setFlexState((prev) => ({ ...prev, loading: true, error: null }));
      const data =
        await evidenceAssignmentService.getMyElementAssignments(userId);
      setFlexState((prev) => ({ ...prev, assignments: data }));
    } catch (error: unknown) {
      setFlexState((prev) => ({
        ...prev,
        error: getErrorMessage(
          error,
          "No se pudieron obtener las pautas asignadas",
        ),
      }));
    } finally {
      setFlexState((prev) => ({ ...prev, loading: false }));
    }
  };

  const loadUserCycles = async () => {
    const userWithOptionalId = user as {
      usuario_id?: number;
      id?: number;
    } | null;
    const userId = userWithOptionalId?.usuario_id ?? userWithOptionalId?.id;
    if (!userId) return;
    try {
      const data = await evidenceAssignmentService.getUserCycles(userId);
      setUserCycles(data);
    } catch {
      // silencioso: los nombres se pueden inferir desde las asignaciones
    }
  };

  // Auto-seleccionar el primer ciclo disponible al cargar
  const availableCycles = useMemo(() => {
    if (userCycles.length > 0) {
      return userCycles.map((c) => ({
        ciclo_id: c.ciclo_acreditacion_id,
        nombre: c.nombre,
        isFlexible: c.tipo_modelo === "elemento_flexible",
      }));
    }

    // Fallback: inferir desde las asignaciones si el endpoint no responde
    const cycleMap = new Map<number, { nombre: string; isFlexible: boolean }>();

    for (const a of assignments) {
      const cicloId = a.proceso?.ciclo_acreditacion_id;
      if (cicloId && !cycleMap.has(cicloId)) {
        cycleMap.set(cicloId, {
          nombre: `Ciclo ${cicloId}`,
          isFlexible: false,
        });
      }
    }

    for (const a of flexState.assignments) {
      const cicloId = a.process?.ciclo_acreditacion_id;
      if (cicloId && !cycleMap.has(cicloId)) {
        cycleMap.set(cicloId, {
          nombre: `Ciclo ${cicloId}`,
          isFlexible: true,
        });
      }
    }

    return [...cycleMap.entries()].map(([id, info]) => ({
      ciclo_id: id,
      ...info,
    }));
  }, [userCycles, assignments, flexState.assignments]);

  useEffect(() => {
    if (availableCycles.length > 0 && selectedCycleId === null) {
      setSelectedCycleId(availableCycles[0].ciclo_id);
    }
  }, [availableCycles, selectedCycleId]);

  const selectedCycle =
    availableCycles.find((c) => c.ciclo_id === selectedCycleId) ?? null;
  const isFlexible = selectedCycle?.isFlexible ?? false;

  const cycleOptions: SelectOption[] = availableCycles.map((c) => ({
    value: String(c.ciclo_id),
    label: c.nombre,
  }));

  const routeContext = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const cycleId = parsePositiveInt(params.get("ciclo_acreditacion_id"));
    const processId = parsePositiveInt(params.get("proceso_id"));
    return {
      cycleId,
      processId,
      key: `${cycleId ?? ""}|${processId ?? ""}`,
    };
  }, [location.search]);

  useEffect(() => {
    if (appliedRouteContextKey === routeContext.key) {
      return;
    }

    const { cycleId, processId, key } = routeContext;
    if (cycleId === null && processId === null) {
      setAppliedRouteContextKey(key);
      return;
    }

    const applyCycleSelection = (cycleToSelect: number) => {
      if (selectedCycleId !== cycleToSelect) {
        setSelectedCycleId(cycleToSelect);
        setCurrentPage(1);
      }
      setAppliedRouteContextKey(key);
    };

    if (cycleId !== null) {
      const cycleExists = availableCycles.some(
        (cycle) => cycle.ciclo_id === cycleId,
      );
      if (cycleExists) {
        applyCycleSelection(cycleId);
        return;
      }
    }

    if (processId !== null) {
      const traditionalCycleId =
        assignments.find(
          (assignment) =>
            (assignment.proceso?.proceso_id ?? assignment.proceso_id) ===
            processId,
        )?.proceso?.ciclo_acreditacion_id ?? null;

      const flexibleCycleId =
        flexState.assignments.find(
          (assignment) => assignment.process?.proceso_id === processId,
        )?.process?.ciclo_acreditacion_id ?? null;

      const targetCycleId = traditionalCycleId ?? flexibleCycleId;

      if (targetCycleId !== null) {
        applyCycleSelection(targetCycleId);
        return;
      }
    }

    if (!loading && !flexState.loading) {
      setAppliedRouteContextKey(key);
    }
  }, [
    appliedRouteContextKey,
    routeContext,
    selectedCycleId,
    availableCycles,
    assignments,
    flexState.assignments,
    loading,
    flexState.loading,
  ]);

  const handleViewDetails = (assignment: EvidenceAssignment) => {
    setModalState((prev) => ({ ...prev, selectedAssignment: assignment }));
  };

  // ── Handlers modelo flexible ──────────────────────────────────────────────

  const handleFlexViewDetails = (a: FlexibleAssignmentItem) => {
    setFlexModal((prev) => ({ ...prev, selectedId: a.elemento_asignacion_id }));
  };

  const handleFlexUploadFiles = (a: FlexibleAssignmentItem) => {
    setUploadModal({ open: true, assignment: a });
  };

  const handleFlexStatusChange = async (
    a: FlexibleAssignmentItem,
    newStatus: "En Progreso" | "Completado",
  ) => {
    if (newStatus === "Completado" && !a.has_uploaded_files) {
      showToast({
        type: "warning",
        title: "Acción no permitida",
        message: "Debe subir al menos un archivo o enlace antes de marcar como completada.",
      });
      return;
    }

    if (newStatus === "En Progreso") {
      setFlexRevertConfirm({ open: true, assignment: a, loading: false });
      return;
    }

    await applyFlexStatusChange(a, newStatus);
  };

  const applyFlexStatusChange = async (
    a: FlexibleAssignmentItem,
    newStatus: "En Progreso" | "Completado",
  ) => {
    try {
      const updated = await evidenceAssignmentService.updateElementStatus(
        a.elemento_asignacion_id,
        newStatus,
      );
      setFlexState((prev) => ({
        ...prev,
        assignments: prev.assignments.map((x) =>
          x.elemento_asignacion_id === updated.elemento_asignacion_id
            ? updated
            : x,
        ),
      }));
      showToast({
        type: "success",
        title: "Estado actualizado",
        message: `Pauta marcada como ${newStatus === "Completado" ? "completada" : "en progreso"}`,
      });
    } catch {
      showToast({
        type: "error",
        title: "Error",
        message: "No se pudo actualizar el estado",
      });
    }
  };

  const handleFlexConfirmRevert = async () => {
    if (!flexRevertConfirm.assignment) return;
    const a = flexRevertConfirm.assignment;
    setFlexRevertConfirm((prev) => ({ ...prev, loading: true }));
    await applyFlexStatusChange(a, "En Progreso");
    setFlexRevertConfirm({ open: false, assignment: null, loading: false });
  };

  const handleFlexRequestExtension = (a: FlexibleAssignmentItem) => {
    setFlexModal((prev) => ({
      ...prev,
      selectedForExtension: a,
      showExtension: true,
    }));
  };

  const handleFlexConfirmExtension = async (
    data: CreateExtensionRequestData,
  ) => {
    const assignment = flexModal.selectedForExtension;
    if (!assignment) return;
    try {
      await evidenceAssignmentService.requestElementExtension(
        assignment.elemento_asignacion_id,
        { motivo: data.motivo, fecha_sugerida: data.fecha_sugerida },
      );
      setFlexModal((prev) => ({
        ...prev,
        showExtension: false,
        selectedForExtension: null,
      }));
      showToast({
        type: "success",
        title: "Solicitud enviada",
        message: "Su solicitud de ampliación ha sido enviada",
      });
      loadFlexAssignments();
    } catch (error: unknown) {
      const message = getErrorMessage(error, "No se pudo enviar la solicitud");
      const isDuplicate = message.includes("Ya existe una solicitud pendiente");
      showToast({
        type: "error",
        title: isDuplicate ? "Solicitud duplicada" : "Error",
        message: isDuplicate
          ? "Ya tienes una solicitud pendiente para esta pauta"
          : message,
      });
      if (isDuplicate) {
        setFlexModal((prev) => ({
          ...prev,
          showExtension: false,
          selectedForExtension: null,
        }));
        loadFlexAssignments();
      } else {
        throw new Error(message);
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  const handleCloseDetail = () => {
    setModalState((prev) => ({ ...prev, selectedAssignment: null }));
  };

  const handleStatusUpdate = (updatedAssignment: EvidenceAssignment) => {
    // Actualizar la asignación en la lista
    setPageState((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) =>
        a.evidencia_asignacion_id === updatedAssignment.evidencia_asignacion_id
          ? updatedAssignment
          : a,
      ),
    }));
  };

  const handleUploadFiles = (assignment: EvidenceAssignment) => {
    if (!assignment.evidencia) {
      showToast({
        type: "error",
        title: "Error",
        message: "No se pudo obtener la información de la evidencia",
      });
      return;
    }
<<<<<<< HEAD
    setEvidenceUploadModal({ open: true, assignment });
=======

    // Navegar a la página de subida con los parámetros necesarios
    const params = new URLSearchParams({
      evidenciaId: assignment.evidencia.evidencia_id.toString(),
      procesoId: (
        assignment.proceso?.proceso_id ?? assignment.proceso_id
      ).toString(),
      usuarioId: assignment.usuario_id.toString(),
      nombre: `${assignment.evidencia.nomenclatura} - ${assignment.evidencia.descripcion}`,
    });

    navigate(`/evidencias/subir?${params.toString()}`);
>>>>>>> development
  };

  // HU-016: Handler para solicitar ampliación
  const handleRequestExtension = (assignment: EvidenceAssignment) => {
    setModalState((prev) => ({
      ...prev,
      selectedAssignmentForExtension: assignment,
      showExtensionModal: true,
    }));
  };

  const handleConfirmExtensionRequest = async (
    data: CreateExtensionRequestData,
  ) => {
    try {
      await extensionRequestService.createRequest(data);
      setModalState((prev) => ({
        ...prev,
        showExtensionModal: false,
        selectedAssignmentForExtension: null,
      }));
      showToast({
        type: "success",
        title: "Solicitud enviada",
        message: "Su solicitud de ampliación ha sido enviada correctamente",
      });
      // Recargar asignaciones para actualizar estados
      loadAssignments();
    } catch (error: unknown) {
      // Manejo específico para solicitud duplicada
      const message = getErrorMessage(error, "No se pudo enviar la solicitud");
      const isDuplicate = message.includes("Ya existe una solicitud pendiente");

      showToast({
        type: "error",
        title: isDuplicate ? "Solicitud duplicada" : "Error",
        message: isDuplicate
          ? "Ya tienes una solicitud de ampliación pendiente para esta evidencia"
          : message,
      });

      // Si es duplicado, cerrar modal y recargar para actualizar el estado
      if (isDuplicate) {
        setModalState((prev) => ({
          ...prev,
          showExtensionModal: false,
          selectedAssignmentForExtension: null,
        }));
        loadAssignments();
      } else {
        throw new Error(message); // Re-lanzar para que el modal maneje el estado de loading
      }
    }
  };

  const handleCloseExtensionModal = () => {
    setModalState((prev) => ({
      ...prev,
      showExtensionModal: false,
      selectedAssignmentForExtension: null,
    }));
  };

  const handleTableStatusChange = async (
    assignment: EvidenceAssignment,
    newStatus: "en_progreso" | "completado",
  ) => {
    if (newStatus === "completado" && assignment.has_uploaded_files !== true) {
      showToast({
        type: "warning",
        title: "Acción no permitida",
        message:
          "Debe subir al menos un archivo o enlace antes de marcar como completada.",
      });
      return;
    }

    // Si se está revirtiendo a en_progreso, pedir confirmación primero
    if (newStatus === "en_progreso") {
      setRevertConfirmState({ open: true, assignment, loading: false });
      return;
    }
    await applyStatusChange(assignment, newStatus);
  };

  const applyStatusChange = async (
    assignment: EvidenceAssignment,
    newStatus: "en_progreso" | "completado",
  ) => {
    try {
      const updated = await evidenceAssignmentService.updateStatus(
        assignment.evidencia_asignacion_id,
        { estado: newStatus },
      );
      handleStatusUpdate(updated);
      showToast({
        type: "success",
        title: "Estado actualizado",
        message: `Evidencia marcada como ${newStatus === "completado" ? "completada" : "en progreso"}`,
      });
    } catch {
      showToast({
        type: "error",
        title: "Error",
        message: "No se pudo actualizar el estado",
      });
    }
  };

  const handleConfirmRevert = async () => {
    if (!revertConfirmState.assignment) return;
    const assignment = revertConfirmState.assignment;
    setRevertConfirmState((prev) => ({ ...prev, loading: true }));
    await applyStatusChange(assignment, "en_progreso");
    setRevertConfirmState({ open: false, assignment: null, loading: false });
  };

  const handleFiltersChange = (newFilters: AssignmentFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const filteredAssignments = filterAndSortAssignments(
    assignments.filter(
      (a) => a.proceso?.ciclo_acreditacion_id === selectedCycleId,
    ),
    filters,
  );
  const filteredFlex = filterFlexAssignments(
    flexState.assignments.filter(
      (a) => a.process?.ciclo_acreditacion_id === selectedCycleId,
    ),
    filters.search,
  );

  const hasTraditionalSearch = !error && assignments.length > 0;
  const hasFlexibleSearch = !flexState.error && flexState.assignments.length > 0;
  const showSearchInput = isFlexible ? hasFlexibleSearch : hasTraditionalSearch;
  const moduleInfo = getModuleInfo("my_evidence_assignments");

  // Paginación unificada por proceso
  const activeList = isFlexible ? filteredFlex : filteredAssignments;
  const totalPages = Math.ceil(activeList.length / itemsPerPage);
  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const paginatedFlex = filteredFlex.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        headerExtra={
          cycleOptions.length > 1 ||
          showSearchInput ? (
            <div className="flex items-end gap-3">
              {cycleOptions.length > 1 && (
                <CustomSelect
                  className="w-80"
                  label="Ciclo de acreditación"
                  options={cycleOptions}
                  value={selectedCycleId ? String(selectedCycleId) : ""}
                  onChange={(v) => {
                    setSelectedCycleId(Number(v));
                    setCurrentPage(1);
                  }}
                />
              )}
              {showSearchInput && (
                <SearchInput
                  placeholder={isFlexible ? "Buscar pautas..." : "Buscar evidencias..."}
                  value={filters.search || ""}
                  onChange={(value) =>
                    handleFiltersChange({ ...filters, search: value })
                  }
                />
              )}
            </div>
          ) : undefined
        }
      ></PageHeader>

      <div className="space-y-6">
        {/* Carga inicial */}
        {(loading || flexState.loading) && !selectedCycleId && (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        )}

        {/* Sin procesos asignados */}
        {!loading && !flexState.loading && availableCycles.length === 0 && (
          <p className="text-sm text-gris-una text-center py-10">
            No tienes asignaciones en ningún proceso de acreditación.
          </p>
        )}

        {/* ── Modelo tradicional (Criterios) ── */}
        {selectedCycleId !== null && !isFlexible && (
          <>
            {error && (
              <BackendErrorAlert error={error} onRetry={loadAssignments} />
            )}
            {!error && (
              <EvidenceAssignmentsTable
                assignments={paginatedAssignments}
                loading={loading}
                onViewDetails={handleViewDetails}
                onUploadFiles={handleUploadFiles}
                onStatusChange={handleTableStatusChange}
                onRequestExtension={handleRequestExtension}
                hasFilters={filters.estado !== "todos" || filters.search !== ""}
                pagination={
                  totalPages > 1
                    ? { currentPage, totalPages, onPageChange: setCurrentPage }
                    : undefined
                }
              />
            )}
          </>
        )}

        {/* ── Modelo flexible (Pautas) ── */}
        {selectedCycleId !== null && isFlexible && (
          <>
            {flexState.error && (
              <BackendErrorAlert
                error={flexState.error}
                onRetry={loadFlexAssignments}
              />
            )}
            {!flexState.error && (
              <ElementAssignmentsTable
                assignments={paginatedFlex}
                loading={flexState.loading}
                onViewDetails={handleFlexViewDetails}
                onUploadFiles={handleFlexUploadFiles}
                onStatusChange={handleFlexStatusChange}
                onRequestExtension={handleFlexRequestExtension}
                hasFilters={filters.search?.trim() !== ""}
                pagination={
                  totalPages > 1
                    ? { currentPage, totalPages, onPageChange: setCurrentPage }
                    : undefined
                }
              />
            )}
          </>
        )}
      </div>

      {/* Modal de detalle */}
      {selectedAssignment && (
        <EvidenceAssignmentDetail
          assignmentId={selectedAssignment.evidencia_asignacion_id}
          onClose={handleCloseDetail}
        />
      )}

      {/* Modal para solicitar ampliación */}
      {showExtensionModal && selectedAssignmentForExtension && (
        <CreateExtensionRequestModal
          isOpen={showExtensionModal}
          onClose={handleCloseExtensionModal}
          onConfirm={handleConfirmExtensionRequest}
          evidenciaAsignacionId={
            selectedAssignmentForExtension.evidencia_asignacion_id
          }
          fechaLimiteActual={
            selectedAssignmentForExtension.fecha_limite || undefined
          }
        />
      )}

      {/* Modal de detalle flexible */}
      {flexModal.selectedId !== null && (
        <ElementAssignmentDetailModal
          assignmentId={flexModal.selectedId}
          onClose={() => setFlexModal((prev) => ({ ...prev, selectedId: null }))}
        />
      )}

      {/* Modal ampliación flexible */}
      {flexModal.showExtension && flexModal.selectedForExtension && (
        <CreateExtensionRequestModal
          isOpen={flexModal.showExtension}
          onClose={() =>
            setFlexModal((prev) => ({
              ...prev,
              showExtension: false,
              selectedForExtension: null,
            }))
          }
          onConfirm={handleFlexConfirmExtension}
          evidenciaAsignacionId={
            flexModal.selectedForExtension.elemento_asignacion_id
          }
          fechaLimiteActual={
            flexModal.selectedForExtension.fecha_limite || undefined
          }
        />
      )}

      {/* Modal de confirmación revertir estado flexible */}
      <Modal
        isOpen={flexRevertConfirm.open}
        onClose={() => setFlexRevertConfirm({ open: false, assignment: null, loading: false })}
        onConfirm={handleFlexConfirmRevert}
        title="Revertir estado de pauta"
        variant="info"
        confirmLabel="Sí, revertir"
        cancelLabel="Cancelar"
        confirmLoading={flexRevertConfirm.loading}
        showCancel
        showConfirm
        footerMeta="Esta acción puede volver a completarse posteriormente"
      >
        <p className="text-sm text-gris-una-2 leading-relaxed">
          ¿Está seguro de que desea marcar esta pauta como{" "}
          <strong>en progreso</strong>?
        </p>
        <p className="mt-2 text-sm text-gris-una-2">
          La pauta dejará de estar marcada como completada.
        </p>
      </Modal>

      {/* Modal de subida de archivos para modelo tradicional */}
      {evidenceUploadModal.open && evidenceUploadModal.assignment?.evidencia && (
        <EvidenceUploadPage
          isOpen={evidenceUploadModal.open}
          onClose={() => setEvidenceUploadModal({ open: false, assignment: null })}
          evidenciaId={evidenceUploadModal.assignment.evidencia.evidencia_id}
          procesoId={
            evidenceUploadModal.assignment.proceso?.proceso_id ??
            evidenceUploadModal.assignment.proceso_id
          }
          nombre={`${evidenceUploadModal.assignment.evidencia.nomenclatura} - ${evidenceUploadModal.assignment.evidencia.descripcion}`}
          onSuccess={loadAssignments}
        />
      )}

      {/* Modal de subida de archivos para modelo flexible */}
      {uploadModal.open && uploadModal.assignment && (
        <ElementUploadPage
          isOpen={uploadModal.open}
          onClose={() => setUploadModal({ open: false, assignment: null })}
          elementoId={uploadModal.assignment.elemento_id}
          procesoId={uploadModal.assignment.proceso_id}
          nombre={uploadModal.assignment.element?.nombre ?? 'Pauta'}
          onSuccess={loadFlexAssignments}
        />
      )}

      {/* Modal de confirmación para revertir estado completado → en_progreso */}
      <Modal
        isOpen={revertConfirmState.open}
        onClose={() =>
          setRevertConfirmState({
            open: false,
            assignment: null,
            loading: false,
          })
        }
        onConfirm={handleConfirmRevert}
        title="Revertir estado de evidencia"
        variant="info"
        confirmLabel="Sí, revertir"
        cancelLabel="Cancelar"
        confirmLoading={revertConfirmState.loading}
        showCancel
        showConfirm
        footerMeta="Esta acción puede volver a completarse posteriormente"
      >
        <p className="text-sm text-gris-una-2 leading-relaxed">
          ¿Está seguro de que desea marcar esta evidencia como{" "}
          <strong>en progreso</strong>?
        </p>
        <p className="mt-2 text-sm text-gris-una-2">
          La evidencia dejará de estar marcada como completada.
        </p>
      </Modal>
    </ScreenContainer>
  );
};
