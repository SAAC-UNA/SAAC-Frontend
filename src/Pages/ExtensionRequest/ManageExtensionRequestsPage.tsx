/**
 * ManageExtensionRequestsPage - Página para gestionar solicitudes de ampliación (Encargados)
 * HU-016 - Vista de gestión para encargados de acreditación
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PageHeader, ScreenContainer } from "@/Components/Ui/Index";
import { SearchInput } from "@/Components/Ui/Forms/SearchInput";
import {
  FilterButton,
  type FilterOption,
} from "@/Components/Ui/Buttons/FilterButton";
import { extensionRequestService } from "@/Services/ExtensionRequestService";
import { flexibleExtensionRequestService } from "@/Services/FlexibleExtensionRequestService";
import { useToast } from "@/Context/ToastContext";
import { useAuth } from "@/Context/AuthContext";
import { useOperationalContextSnapshot } from "@/Hooks/useOperationalContextSnapshot";
import { getContextualInfo } from "@/Constants/ModuleInfo";
import { TABLE_PAGE_SIZE } from "@/Constants/TablePagination";
import { ManageExtensionRequestsTable } from "./Components/ManageExtensionRequestsTable";
import { ReviewExtensionRequestModal } from "@/Pages/ExtensionRequest/Components/ManageExtensionRequestDetailsModal";
import { CreateConfirmationModal } from "@/Components/Ui/Modals/CreateConfirmationModal";
import { DeleteConfirmationModal } from "@/Components/Ui/Modals/DeleteConfirmationModal";
import type {
  ExtensionRequest,
  ExtensionRequestPaginatedResponse,
  ExtensionRequestStatus,
  ReviewFormData,
} from "@/Types/ExtensionRequestTypes";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";

export const ManageExtensionRequestsPage: React.FC = () => {
  const { showToast } = useToast();
  const { isAuthenticated, canAccess } = useAuth();
  const contextSnapshot = useOperationalContextSnapshot();

  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = getContextualInfo("extension_requests", "manage");

  // ── Estado de datos ───────────────────────────────────────────────────────
  const [tradState, setTradState] = useState<{
    solicitudes: ExtensionRequest[];
    loading: boolean;
    error: string | null;
  }>({ solicitudes: [], loading: true, error: null });
  const [flexState, setFlexState] = useState<{
    solicitudes: ExtensionRequest[];
    loading: boolean;
    error: string | null;
  }>({ solicitudes: [], loading: false, error: null });

  const loading = tradState.loading || flexState.loading;
  const error = tradState.error;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<{
    filtroEstado: ExtensionRequestStatus | "todos";
  }>({ filtroEstado: "todos" });
  const filtroEstado = filterState.filtroEstado;

  // Estado para el modal de revisión (detalles)
  const [selectedSolicitud, setSelectedSolicitud] =
    useState<ExtensionRequest | null>(null);

  // Estado para las confirmaciones de aprobación/rechazo
  const [confirmState, setConfirmState] = useState<{
    action: "approve" | "reject" | null;
    solicitud: ExtensionRequest | null;
    loading: boolean;
  }>({ action: null, solicitud: null, loading: false });

  // Opciones para el filtro de estado
  const estadoOptions: FilterOption<ExtensionRequestStatus | "todos">[] = [
    { value: "todos", label: "Todos" },
    { value: "pendiente", label: "Pendiente" },
    { value: "aprobada", label: "Aprobada" },
    { value: "rechazada", label: "Rechazada" },
  ];

  useEffect(() => {
    loadSolicitudes();
  }, [filtroEstado]);

  /** Obtener todas las páginas de un endpoint paginado */
  const fetchAllPages = async (
    fetcher: (
      filters: Record<string, unknown>,
    ) => Promise<ExtensionRequestPaginatedResponse>,
    baseFilters: Record<string, unknown>,
  ): Promise<ExtensionRequest[]> => {
    const first = await fetcher({ ...baseFilters, per_page: 100, page: 1 });
    const all = [...first.data];
    const lastPage = first.meta?.last_page ?? 1;
    for (let p = 2; p <= lastPage; p++) {
      const next = await fetcher({ ...baseFilters, per_page: 100, page: p });
      all.push(...next.data);
    }
    return all;
  };

  const loadSolicitudes = async () => {
    const cycleModelType = contextSnapshot.cycleModelType;
    const isTradicional = cycleModelType === "tradicional";
    const isFlexible = cycleModelType === "elemento_flexible";

    try {
      setTradState((prev) => ({ ...prev, loading: true, error: null }));
      setFlexState((prev) => ({ ...prev, loading: isFlexible, error: null }));

      const baseFilters = {
        estado: filtroEstado === "todos" ? undefined : filtroEstado,
      };

      // Solo llamar al servicio que corresponde al modelo del ciclo activo
      if (!isFlexible) {
        const tradFetcher =
          filtroEstado === "pendiente"
            ? extensionRequestService.getPendingRequests.bind(
                extensionRequestService,
              )
            : extensionRequestService.getAllRequests.bind(
                extensionRequestService,
              );
        const tradRes = await fetchAllPages(tradFetcher, baseFilters).catch(
          (e: Error) => { throw e; }
        );
        setTradState({ solicitudes: tradRes, loading: false, error: null });
        setFlexState({ solicitudes: [], loading: false, error: null });
        return;
      }

      if (!isTradicional) {
        const flexFetcher =
          filtroEstado === "pendiente"
            ? flexibleExtensionRequestService.getPendingRequests.bind(
                flexibleExtensionRequestService,
              )
            : flexibleExtensionRequestService.getAllRequests.bind(
                flexibleExtensionRequestService,
              );
        const flexRes = await fetchAllPages(flexFetcher, baseFilters).catch(
          (e: Error) => { throw e; }
        );
        setFlexState({ solicitudes: flexRes, loading: false, error: null });
        setTradState({ solicitudes: [], loading: false, error: null });
        return;
      }

      // modelo desconocido: cargar ambos (fallback)
      const [tradRes, flexRes] = await Promise.allSettled([
        fetchAllPages(
          filtroEstado === "pendiente"
            ? extensionRequestService.getPendingRequests.bind(extensionRequestService)
            : extensionRequestService.getAllRequests.bind(extensionRequestService),
          baseFilters,
        ),
        fetchAllPages(
          filtroEstado === "pendiente"
            ? flexibleExtensionRequestService.getPendingRequests.bind(flexibleExtensionRequestService)
            : flexibleExtensionRequestService.getAllRequests.bind(flexibleExtensionRequestService),
          baseFilters,
        ),
      ]);

      setTradState({
        solicitudes: tradRes.status === "fulfilled" ? tradRes.value : [],
        loading: false,
        error: tradRes.status === "rejected" ? (tradRes.reason?.message ?? "Error") : null,
      });
      setFlexState({
        solicitudes: flexRes.status === "fulfilled" ? flexRes.value : [],
        loading: false,
        error: flexRes.status === "rejected" ? (flexRes.reason?.message ?? "Error") : null,
      });
    } catch (error: any) {
      const msg = error.message || "No se pudieron cargar las solicitudes";
      setTradState((prev) => ({ ...prev, error: msg, loading: false }));
      setFlexState((prev) => ({ ...prev, loading: false }));
      showToast({ type: "error", title: "Error al Cargar", message: msg });
    }
  };

  const solicitudes = useMemo(() => {
    const selectedCycleId = contextSnapshot.cycleId;
    const selectedProcessId = contextSnapshot.processId;

    const matchesContext = (solicitud: ExtensionRequest): boolean => {
      const requestContext = (
        solicitud as ExtensionRequest & {
          context?: {
            proceso_id?: number | null;
            ciclo_acreditacion_id?: number | null;
          };
        }
      ).context;

      const requestProcessId =
        requestContext?.proceso_id ??
        solicitud.evidencia_asignacion?.process?.proceso_id ??
        solicitud.evidencia_asignacion?.proceso_id ??
        solicitud.elemento_asignacion?.process?.proceso_id ??
        solicitud.elemento_asignacion?.proceso_id ??
        null;
      const requestCycleId =
        requestContext?.ciclo_acreditacion_id ??
        solicitud.evidencia_asignacion?.process?.ciclo_acreditacion_id ??
        solicitud.elemento_asignacion?.process?.ciclo_acreditacion_id ??
        null;

      if (selectedProcessId !== null) {
        return requestProcessId === selectedProcessId;
      }

      if (selectedCycleId !== null) {
        return requestCycleId === selectedCycleId;
      }

      return true;
    };

    return [...tradState.solicitudes, ...flexState.solicitudes].filter(
      matchesContext,
    );
  }, [
    tradState.solicitudes,
    flexState.solicitudes,
    contextSnapshot.cycleId,
    contextSnapshot.processId,
  ]);

  // Handlers
  const handleReviewRequest = useCallback((solicitud: ExtensionRequest) => {
    setSelectedSolicitud(solicitud);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedSolicitud(null);
  }, []);

  const handleOpenApprove = useCallback((solicitud: ExtensionRequest) => {
    setConfirmState({ action: "approve", solicitud, loading: false });
  }, []);

  const handleOpenReject = useCallback((solicitud: ExtensionRequest) => {
    setConfirmState({ action: "reject", solicitud, loading: false });
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setConfirmState({ action: null, solicitud: null, loading: false });
  }, []);

  const handleConfirmAction = async () => {
    const { action, solicitud } = confirmState;
    if (!action || !solicitud) return;
    setConfirmState((prev) => ({ ...prev, loading: true }));
    try {
      const data: ReviewFormData = { justificacion: "" };
      if (action === "approve") {
        await handleApprove(data, solicitud);
      } else {
        await handleReject(data, solicitud);
      }
      handleCloseConfirm();
    } catch {
      setConfirmState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleApprove = async (
    data: ReviewFormData,
    solicitud?: ExtensionRequest,
  ) => {
    const target = solicitud ?? selectedSolicitud;
    if (!target) return;

    try {
      if (target.elemento_asignacion_id) {
        await flexibleExtensionRequestService.approveRequest(
          target.solicitud_ampliacion_id,
          data,
        );
      } else {
        await extensionRequestService.approveRequest(
          target.solicitud_ampliacion_id,
          data,
        );
      }

      showToast({
        type: "success",
        title: "Solicitud Aprobada",
        message:
          "La solicitud ha sido aprobada correctamente y la fecha límite ha sido actualizada.",
      });

      await loadSolicitudes();
      handleCloseModal();
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error al Aprobar",
        message: error.message || "No se pudo aprobar la solicitud",
      });
      throw error;
    }
  };

  const handleReject = async (
    data: ReviewFormData,
    solicitud?: ExtensionRequest,
  ) => {
    const target = solicitud ?? selectedSolicitud;
    if (!target) return;

    try {
      if (target.elemento_asignacion_id) {
        await flexibleExtensionRequestService.rejectRequest(
          target.solicitud_ampliacion_id,
          data,
        );
      } else {
        await extensionRequestService.rejectRequest(
          target.solicitud_ampliacion_id,
          data,
        );
      }

      showToast({
        type: "warning",
        title: "Solicitud Rechazada",
        message: "La solicitud ha sido rechazada.",
      });

      await loadSolicitudes();
      handleCloseModal();
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error al Rechazar",
        message: error.message || "No se pudo rechazar la solicitud",
      });
      throw error;
    }
  };

  const canManageRequests = canAccess({
    requireAnyPermissions: [
      "solicitudes_ampliacion.approve",
      "solicitudes_ampliacion.reject",
    ],
  });

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        breadcrumbMode="contextual"
        headerExtra={
          isAuthenticated && canManageRequests ? (
            <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto">
              <SearchInput
                placeholder="Buscar por solicitante, email o motivo..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-full sm:w-72"
              />
              <FilterButton
                tooltipText="Filtrar por estado"
                options={estadoOptions}
                value={filtroEstado}
                onChange={(value) => {
                  setFilterState({ filtroEstado: value });
                }}
              />
            </div>
          ) : undefined
        }
      ></PageHeader>

      {!isAuthenticated ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-corner p-6 text-center">
          <SystemIcons.interface.xCircle
            size="3xl"
            className="text-yellow-600 mx-auto mb-3"
          />
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            Autenticación Requerida
          </h3>
          <p className="text-yellow-700">
            Debe iniciar sesión para acceder a esta sección.
          </p>
        </div>
      ) : !canManageRequests ? (
        <div className="bg-red-50 border border-red-200 rounded-corner p-6 text-center">
          <SystemIcons.interface.xCircle
            size="3xl"
            className="text-red-600 mx-auto mb-3"
          />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Acceso Denegado
          </h3>
          <p className="text-red-700">
            No tiene permisos para gestionar solicitudes de ampliación. Esta
            sección es solo para Encargados de Acreditación.
          </p>
        </div>
      ) : (
        <>
          <ManageExtensionRequestsTable
            requests={solicitudes}
            isLoading={loading}
            error={error}
            searchQuery={searchQuery}
            filterEstado={filtroEstado}
            itemsPerPage={TABLE_PAGE_SIZE.standard}
            onRetry={loadSolicitudes}
            onReviewRequest={handleReviewRequest}
            onApproveRequest={handleOpenApprove}
            onRejectRequest={handleOpenReject}
          />

          {/* Modal de detalles (solo lectura) */}
          {selectedSolicitud && (
            <ReviewExtensionRequestModal
              isOpen={!!selectedSolicitud}
              onClose={handleCloseModal}
              solicitud={selectedSolicitud}
            />
          )}

          {/* Confirmación de aprobación */}
          <CreateConfirmationModal
            isOpen={confirmState.action === "approve"}
            onClose={handleCloseConfirm}
            onConfirm={handleConfirmAction}
            title="Aprobar solicitud"
            message="¿Está seguro de que desea aprobar esta solicitud de ampliación? La fecha límite de la asignación se actualizará automáticamente."
            confirmLabel="Aprobar"
            isLoading={confirmState.loading}
            variant="success"
          />

          {/* Confirmación de rechazo */}
          <DeleteConfirmationModal
            isOpen={confirmState.action === "reject"}
            onClose={handleCloseConfirm}
            onConfirm={handleConfirmAction}
            title="Rechazar solicitud"
            message="¿Está seguro de que desea rechazar esta solicitud de ampliación? Esta acción no se puede revertir."
            confirmLabel="Rechazar"
            footerMeta="Esta acción no se puede deshacer"
            isLoading={confirmState.loading}
            variant="danger"
          />
        </>
      )}
    </ScreenContainer>
  );
};
