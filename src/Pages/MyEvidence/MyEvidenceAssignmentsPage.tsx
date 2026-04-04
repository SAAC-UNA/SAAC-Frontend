/**
 * MyEvidenceAssignmentsPage - Página principal para ver evidencias asignadas
 * HU-029 - Mis Evidencias Asignadas
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, ScreenContainer, CustomSelect, LoadingSpinner } from "@/Components/Ui/Index";
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
import type { FlexibleAssignmentItem, Process } from "@/Types/EvidenceAssignment";
import {
  EvidenceAssignmentDetail,
  EvidenceAssignmentsTable,
  ElementAssignmentsTable,
} from "./Components";
import { CreateExtensionRequestModal } from "@/Pages/MyEvidence/Components/CreateExtensionRequestModal";

export const MyEvidenceAssignmentsPage: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  // Selector de ciclo — detecta modelo según asignaciones cargadas
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);

  // Estado del modelo flexible
  const [flexState, setFlexState] = useState<{
    assignments: FlexibleAssignmentItem[];
    loading: boolean;
    error: string | null;
  }>({ assignments: [], loading: false, error: null });
  const [flexModal, setFlexModal] = useState<{
    selected: FlexibleAssignmentItem | null;
    showExtension: boolean;
    selectedForExtension: FlexibleAssignmentItem | null;
  }>({ selected: null, showExtension: false, selectedForExtension: null });

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
    loadProcesses();

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
    const userWithOptionalId = user as { usuario_id?: number; id?: number } | null;
    const userId = userWithOptionalId?.usuario_id ?? userWithOptionalId?.id;
    if (!userId) return;

    try {
      setFlexState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await evidenceAssignmentService.getMyElementAssignments(userId);
      setFlexState((prev) => ({ ...prev, assignments: data }));
    } catch (error: unknown) {
      setFlexState((prev) => ({
        ...prev,
        error: getErrorMessage(error, "No se pudieron obtener las pautas asignadas"),
      }));
    } finally {
      setFlexState((prev) => ({ ...prev, loading: false }));
    }
  };

  const loadProcesses = async () => {
    try {
      const data = await evidenceAssignmentService.getAllProcesses();
      setProcesses(data);
    } catch {
      // silencioso: los nombres se pueden inferir desde las asignaciones
    }
  };

  // Auto-seleccionar el primer ciclo disponible al cargar
  const availableCycles = useMemo(() => {
    const cycleMap = new Map<number, { nombre: string; isFlexible: boolean }>();

    for (const a of assignments) {
      const cicloId = a.proceso?.ciclo_acreditacion_id;
      if (cicloId && !cycleMap.has(cicloId)) {
        const proc = processes.find((p) => p.ciclo_acreditacion_id === cicloId);
        cycleMap.set(cicloId, {
          nombre: proc?.ciclo_nombre ?? `Ciclo ${cicloId}`,
          isFlexible: false,
        });
      }
    }

    for (const a of flexState.assignments) {
      const cicloId = a.process?.ciclo_acreditacion_id;
      if (cicloId && !cycleMap.has(cicloId)) {
        const proc = processes.find((p) => p.ciclo_acreditacion_id === cicloId);
        cycleMap.set(cicloId, {
          nombre: proc?.ciclo_nombre ?? `Ciclo ${cicloId}`,
          isFlexible: true,
        });
      }
    }

    return [...cycleMap.entries()].map(([id, info]) => ({ ciclo_id: id, ...info }));
  }, [assignments, flexState.assignments, processes]);

  useEffect(() => {
    if (availableCycles.length > 0 && selectedCycleId === null) {
      setSelectedCycleId(availableCycles[0].ciclo_id);
    }
  }, [availableCycles, selectedCycleId]);

  const selectedCycle = availableCycles.find((c) => c.ciclo_id === selectedCycleId) ?? null;
  const isFlexible = selectedCycle?.isFlexible ?? false;

  const cycleOptions: SelectOption[] = availableCycles.map((c) => ({
    value: String(c.ciclo_id),
    label: c.nombre,
  }));

  const handleViewDetails = (assignment: EvidenceAssignment) => {
    setModalState((prev) => ({ ...prev, selectedAssignment: assignment }));
  };

  // ── Handlers modelo flexible ──────────────────────────────────────────────

  const handleFlexViewDetails = (a: FlexibleAssignmentItem) => {
    setFlexModal((prev) => ({ ...prev, selected: a }));
  };

  const handleFlexStatusChange = async (
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
          x.elemento_asignacion_id === updated.elemento_asignacion_id ? updated : x,
        ),
      }));
      showToast({
        type: "success",
        title: "Estado actualizado",
        message: `Pauta marcada como ${newStatus === "Completado" ? "completada" : "en progreso"}`,
      });
    } catch {
      showToast({ type: "error", title: "Error", message: "No se pudo actualizar el estado" });
    }
  };

  const handleFlexRequestExtension = (a: FlexibleAssignmentItem) => {
    setFlexModal((prev) => ({ ...prev, selectedForExtension: a, showExtension: true }));
  };

  const handleFlexConfirmExtension = async (data: CreateExtensionRequestData) => {
    const assignment = flexModal.selectedForExtension;
    if (!assignment) return;
    try {
      await evidenceAssignmentService.requestElementExtension(
        assignment.elemento_asignacion_id,
        { motivo: data.motivo, fecha_sugerida: data.fecha_sugerida },
      );
      setFlexModal((prev) => ({ ...prev, showExtension: false, selectedForExtension: null }));
      showToast({ type: "success", title: "Solicitud enviada", message: "Su solicitud de ampliación ha sido enviada" });
      loadFlexAssignments();
    } catch (error: unknown) {
      const message = getErrorMessage(error, "No se pudo enviar la solicitud");
      const isDuplicate = message.includes("Ya existe una solicitud pendiente");
      showToast({
        type: "error",
        title: isDuplicate ? "Solicitud duplicada" : "Error",
        message: isDuplicate ? "Ya tienes una solicitud pendiente para esta pauta" : message,
      });
      if (isDuplicate) {
        setFlexModal((prev) => ({ ...prev, showExtension: false, selectedForExtension: null }));
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

    // Navegar a la página de subida con los parámetros necesarios
    const params = new URLSearchParams({
      evidenciaId: assignment.evidencia.evidencia_id.toString(),
      procesoId: (
        assignment.proceso?.proceso_id ?? assignment.proceso_id
      ).toString(),
      nombre: `${assignment.evidencia.nomenclatura} - ${assignment.evidencia.descripcion}`,
    });

    navigate(`/evidencias/subir?${params.toString()}`);
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
    assignments.filter((a) => a.proceso?.ciclo_acreditacion_id === selectedCycleId),
    filters,
  );
  const filteredFlex = flexState.assignments.filter(
    (a) => a.process?.ciclo_acreditacion_id === selectedCycleId,
  );
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
          cycleOptions.length > 1 || (!isFlexible && !error && assignments.length > 0) ? (
            <div className="flex items-end gap-3">
              {cycleOptions.length > 1 && (
                <CustomSelect className="w-80"
                  label="Ciclo de acreditación"
                  options={cycleOptions}
                  value={selectedCycleId ? String(selectedCycleId) : ""}
                  onChange={(v) => {
                    setSelectedCycleId(Number(v));
                    setCurrentPage(1);
                  }}
                />
              )}
              {!isFlexible && !error && assignments.length > 0 && (
                <SearchInput
                  placeholder="Buscar evidencias..."
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
            {error && <BackendErrorAlert error={error} onRetry={loadAssignments} />}
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
              <BackendErrorAlert error={flexState.error} onRetry={loadFlexAssignments} />
            )}
            {!flexState.error && (
              <ElementAssignmentsTable
                assignments={paginatedFlex}
                loading={flexState.loading}
                onViewDetails={handleFlexViewDetails}
                onStatusChange={handleFlexStatusChange}
                onRequestExtension={handleFlexRequestExtension}
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
      {flexModal.selected && (
        <Modal
          isOpen
          onClose={() => setFlexModal((prev) => ({ ...prev, selected: null }))}
          title="Detalle de Pauta"
          variant="info"
          showConfirm={false}
          showCancel
          cancelLabel="Cerrar"
        >
          <div className="space-y-3 text-sm text-negro-una-2">
            <p><span className="font-semibold">Pauta:</span> {flexModal.selected.element?.nombre ?? '—'}</p>
            <p><span className="font-semibold">Tipo:</span> {flexModal.selected.element?.tipo ?? '—'}</p>
            <p><span className="font-semibold">Proceso:</span> {flexModal.selected.process?.nombre ?? `Proceso ${flexModal.selected.proceso_id}`}</p>
            <p><span className="font-semibold">Estado:</span> {flexModal.selected.estado}</p>
            <p><span className="font-semibold">Fecha límite:</span> {flexModal.selected.fecha_limite ?? 'Sin límite'}</p>
            {flexModal.selected.comentario && (
              <p><span className="font-semibold">Comentario:</span> {flexModal.selected.comentario}</p>
            )}
          </div>
        </Modal>
      )}

      {/* Modal ampliación flexible */}
      {flexModal.showExtension && flexModal.selectedForExtension && (
        <CreateExtensionRequestModal
          isOpen={flexModal.showExtension}
          onClose={() =>
            setFlexModal((prev) => ({ ...prev, showExtension: false, selectedForExtension: null }))
          }
          onConfirm={handleFlexConfirmExtension}
          evidenciaAsignacionId={flexModal.selectedForExtension.elemento_asignacion_id}
          fechaLimiteActual={flexModal.selectedForExtension.fecha_limite || undefined}
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
