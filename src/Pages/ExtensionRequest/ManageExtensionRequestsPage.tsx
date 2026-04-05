/**
 * ManageExtensionRequestsPage - Página para gestionar solicitudes de ampliación (Encargados)
 * HU-016 - Vista de gestión para encargados de acreditación
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader, ScreenContainer, CustomSelect } from '@/Components/Ui/Index';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import { FilterButton, type FilterOption } from '@/Components/Ui/Buttons/FilterButton';
import { extensionRequestService } from '@/Services/ExtensionRequestService';
import { flexibleExtensionRequestService } from '@/Services/FlexibleExtensionRequestService';
import { useToast } from '@/Context/ToastContext';
import { useAuth } from '@/Context/AuthContext';
import { getContextualInfo } from '@/Constants/ModuleInfo';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { ManageExtensionRequestsTable } from './Components/ManageExtensionRequestsTable';
import { ReviewExtensionRequestModal } from '@/Pages/ExtensionRequest/Components/ManageExtensionRequestDetailsModal';
import { CreateConfirmationModal } from '@/Components/Ui/Modals/CreateConfirmationModal';
import { DeleteConfirmationModal } from '@/Components/Ui/Modals/DeleteConfirmationModal';
import type { 
  ExtensionRequest, 
  ExtensionRequestPaginatedResponse,
  ExtensionRequestStatus,
  ReviewFormData 
} from '@/Types/ExtensionRequestTypes';
import type { SelectOption } from '@/Types/StructureTypes';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';

export const ManageExtensionRequestsPage: React.FC = () => {
  const { showToast } = useToast();
  const { isAuthenticated, canAccess } = useAuth();

  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = getContextualInfo('extension_requests', 'manage');
  
  // ── Estado de datos ───────────────────────────────────────────────────────
  const [tradState, setTradState] = useState<{ solicitudes: ExtensionRequest[]; loading: boolean; error: string | null }>({ solicitudes: [], loading: true, error: null });
  const [flexState, setFlexState] = useState<{ solicitudes: ExtensionRequest[]; loading: boolean; error: string | null }>({ solicitudes: [], loading: false, error: null });

  // ── Selector de ciclo de acreditación ────────────────────────────────────
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);

  const loading = tradState.loading || flexState.loading;
  const error = tradState.error;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<{ filtroEstado: ExtensionRequestStatus | 'todos' }>({ filtroEstado: 'todos' });
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
    fetcher: (filters: Record<string, unknown>) => Promise<ExtensionRequestPaginatedResponse>,
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
    try {
      setTradState(prev => ({ ...prev, loading: true, error: null }));
      setFlexState(prev => ({ ...prev, loading: true, error: null }));

      const baseFilters = {
        estado: filtroEstado === 'todos' ? undefined : filtroEstado,
      };

      const tradFetcher = filtroEstado === 'pendiente'
        ? extensionRequestService.getPendingRequests.bind(extensionRequestService)
        : extensionRequestService.getAllRequests.bind(extensionRequestService);
      const flexFetcher = filtroEstado === 'pendiente'
        ? flexibleExtensionRequestService.getPendingRequests.bind(flexibleExtensionRequestService)
        : flexibleExtensionRequestService.getAllRequests.bind(flexibleExtensionRequestService);

      const [tradRes, flexRes] = await Promise.allSettled([
        fetchAllPages(tradFetcher, baseFilters),
        fetchAllPages(flexFetcher, baseFilters),
      ]);

      if (tradRes.status === 'fulfilled') {
        setTradState(prev => ({ ...prev, solicitudes: tradRes.value, loading: false }));
      } else {
        setTradState(prev => ({ ...prev, error: tradRes.reason?.message ?? 'Error', loading: false }));
      }

      if (flexRes.status === 'fulfilled') {
        setFlexState(prev => ({ ...prev, solicitudes: flexRes.value, loading: false }));
      } else {
        setFlexState(prev => ({ ...prev, error: flexRes.reason?.message ?? 'Error', loading: false }));
      }
    } catch (error: any) {
      const msg = error.message || 'No se pudieron cargar las solicitudes';
      setTradState(prev => ({ ...prev, error: msg, loading: false }));
      setFlexState(prev => ({ ...prev, loading: false }));
      showToast({ type: 'error', title: 'Error al Cargar', message: msg });
    }
  };

  // ── Ciclos disponibles ────────────────────────────────────────────────────
  const availableCycles = useMemo(() => {
    const cycleMap = new Map<number, { nombre: string }>();

    for (const s of tradState.solicitudes) {
      const cicloId = s.evidencia_asignacion?.process?.ciclo_acreditacion_id;
      if (cicloId && !cycleMap.has(cicloId)) {
        const nombre = s.evidencia_asignacion?.process?.nombre;
        cycleMap.set(cicloId, { nombre: nombre ?? `Ciclo ${cicloId}` });
      }
    }

    for (const s of flexState.solicitudes) {
      const cicloId = s.elemento_asignacion?.process?.ciclo_acreditacion_id;
      if (cicloId && !cycleMap.has(cicloId)) {
        const nombre = s.elemento_asignacion?.process?.nombre;
        cycleMap.set(cicloId, { nombre: nombre ?? `Ciclo ${cicloId}` });
      }
    }

    return [...cycleMap.entries()].map(([id, info]) => ({ ciclo_id: id, ...info }));
  }, [tradState.solicitudes, flexState.solicitudes]);

  useEffect(() => {
    if (availableCycles.length > 0 && selectedCycleId === null) {
      setSelectedCycleId(availableCycles[0].ciclo_id);
    }
  }, [availableCycles, selectedCycleId]);

  const cycleOptions: SelectOption[] = availableCycles.map(c => ({
    value: String(c.ciclo_id),
    label: c.nombre,
  }));

  // ── Lista filtrada por ciclo ───────────────────────────────────────────────
  const solicitudes = useMemo(() => {
    const trad = selectedCycleId
      ? tradState.solicitudes.filter(s => s.evidencia_asignacion?.process?.ciclo_acreditacion_id === selectedCycleId)
      : tradState.solicitudes;
    const flex = selectedCycleId
      ? flexState.solicitudes.filter(s => s.elemento_asignacion?.process?.ciclo_acreditacion_id === selectedCycleId)
      : flexState.solicitudes;
    return [...trad, ...flex];
  }, [tradState.solicitudes, flexState.solicitudes, selectedCycleId]);

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
        await flexibleExtensionRequestService.approveRequest(target.solicitud_ampliacion_id, data);
      } else {
        await extensionRequestService.approveRequest(target.solicitud_ampliacion_id, data);
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
        await flexibleExtensionRequestService.rejectRequest(target.solicitud_ampliacion_id, data);
      } else {
        await extensionRequestService.rejectRequest(target.solicitud_ampliacion_id, data);
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
        headerExtra={
          isAuthenticated && canManageRequests ? (
            <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto">
              {cycleOptions.length > 1 && (
                <CustomSelect
                  className="w-80"
                  label="Ciclo de acreditación"
                  options={cycleOptions}
                  value={selectedCycleId ? String(selectedCycleId) : ""}
                  onChange={(v) => setSelectedCycleId(Number(v))}
                />
              )}
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
