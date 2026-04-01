/**
 * MyEvidenceAssignmentsPage - Página principal para ver evidencias asignadas
 * HU-029 - Mis Evidencias Asignadas
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, ScreenContainer } from "@/Components/Ui/Index";
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
import {
  EvidenceAssignmentDetail,
  EvidenceAssignmentsTable,
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

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadAssignments();
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

  const handleViewDetails = (assignment: EvidenceAssignment) => {
    setModalState((prev) => ({ ...prev, selectedAssignment: assignment }));
  };

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

  const filteredAssignments = filterAndSortAssignments(assignments, filters);
  const moduleInfo = getModuleInfo("my_evidence_assignments");

  // Paginación
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        headerExtra={
          !error && assignments.length > 0 ? (
            <SearchInput
              placeholder="Buscar evidencias..."
              value={filters.search || ""}
              onChange={(value) =>
                handleFiltersChange({ ...filters, search: value })
              }
            />
          ) : undefined
        }
      ></PageHeader>

      <div className="space-y-6">
        {/* Error del backend */}
        {error && <BackendErrorAlert error={error} onRetry={loadAssignments} />}

        {/* Tabla de asignaciones */}
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
                ? {
                    currentPage,
                    totalPages,
                    onPageChange: setCurrentPage,
                  }
                : undefined
            }
          />
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
