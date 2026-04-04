/**
 * ManageExtensionRequestsPage - Página para gestionar solicitudes de ampliación (Encargados)
 * HU-016 - Vista de gestión para encargados de acreditación
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, ScreenContainer } from '@/Components/Ui/Index';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import { FilterButton, type FilterOption } from '@/Components/Ui/Buttons/FilterButton';
import { extensionRequestService } from '@/Services/ExtensionRequestService';
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
  ExtensionRequestStatus,
  ReviewFormData 
} from '@/Types/ExtensionRequestTypes';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';

export const ManageExtensionRequestsPage: React.FC = () => {
  const { showToast } = useToast();
  const { isAuthenticated, canAccess } = useAuth();
  
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = getContextualInfo('extension_requests', 'manage');
  
  const [pageState, setPageState] = useState<{ solicitudes: ExtensionRequest[]; loading: boolean; error: string | null }>({ solicitudes: [], loading: true, error: null });
  const solicitudes = pageState.solicitudes;
  const loading = pageState.loading;
  const error = pageState.error;
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<{ filtroEstado: ExtensionRequestStatus | 'todos'; currentPage: number }>({ filtroEstado: 'todos', currentPage: 1 });
  const filtroEstado = filterState.filtroEstado;
  const currentPage = filterState.currentPage;

  // Estado para el modal de revisión (detalles)
  const [selectedSolicitud, setSelectedSolicitud] = useState<ExtensionRequest | null>(null);

  // Estado para las confirmaciones de aprobación/rechazo
  const [confirmState, setConfirmState] = useState<{ action: 'approve' | 'reject' | null; solicitud: ExtensionRequest | null; loading: boolean }>({ action: null, solicitud: null, loading: false });

  // Opciones para el filtro de estado
  const estadoOptions: FilterOption<ExtensionRequestStatus | 'todos'>[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'aprobada', label: 'Aprobada' },
    { value: 'rechazada', label: 'Rechazada' }
  ];

  useEffect(() => {
    loadSolicitudes();
  }, [filtroEstado, currentPage]);

  const loadSolicitudes = async () => {
    try {
      setPageState(prev => ({...prev, loading: true, error: null}));
      
      const filters = {
        estado: filtroEstado === 'todos' ? undefined : filtroEstado,
        page: currentPage,
        per_page: 15
      };

      const response = filtroEstado === 'pendiente' 
        ? await extensionRequestService.getPendingRequests(filters)
        : await extensionRequestService.getAllRequests(filters);

      setPageState(prev => ({...prev, solicitudes: response.data}));
    } catch (error: any) {
      const errorMessage = error.message || 'No se pudieron cargar las solicitudes';
      setPageState(prev => ({...prev, error: errorMessage}));
      showToast({
        type: 'error',
        title: 'Error al Cargar',
        message: errorMessage
      });
    } finally {
      setPageState(prev => ({...prev, loading: false}));
    }
  };

  // Handlers
  const handleReviewRequest = useCallback((solicitud: ExtensionRequest) => {
    setSelectedSolicitud(solicitud);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedSolicitud(null);
  }, []);

  const handleOpenApprove = useCallback((solicitud: ExtensionRequest) => {
    setConfirmState({ action: 'approve', solicitud, loading: false });
  }, []);

  const handleOpenReject = useCallback((solicitud: ExtensionRequest) => {
    setConfirmState({ action: 'reject', solicitud, loading: false });
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setConfirmState({ action: null, solicitud: null, loading: false });
  }, []);

  const handleConfirmAction = async () => {
    const { action, solicitud } = confirmState;
    if (!action || !solicitud) return;
    setConfirmState(prev => ({ ...prev, loading: true }));
    try {
      const data: ReviewFormData = { justificacion: '' };
      if (action === 'approve') {
        await handleApprove(data, solicitud);
      } else {
        await handleReject(data, solicitud);
      }
      handleCloseConfirm();
    } catch {
      setConfirmState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleApprove = async (data: ReviewFormData, solicitud?: ExtensionRequest) => {
    const target = solicitud ?? selectedSolicitud;
    if (!target) return;

    try {
      await extensionRequestService.approveRequest(
        target.solicitud_ampliacion_id,
        data
      );

      showToast({
        type: 'success',
        title: 'Solicitud Aprobada',
        message: 'La solicitud ha sido aprobada correctamente y la fecha límite ha sido actualizada.'
      });

      await loadSolicitudes();
      handleCloseModal();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error al Aprobar',
        message: error.message || 'No se pudo aprobar la solicitud'
      });
      throw error;
    }
  };

  const handleReject = async (data: ReviewFormData, solicitud?: ExtensionRequest) => {
    const target = solicitud ?? selectedSolicitud;
    if (!target) return;

    try {
      await extensionRequestService.rejectRequest(
        target.solicitud_ampliacion_id,
        data
      );

      showToast({
        type: 'warning',
        title: 'Solicitud Rechazada',
        message: 'La solicitud ha sido rechazada.'
      });

      await loadSolicitudes();
      handleCloseModal();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error al Rechazar',
        message: error.message || 'No se pudo rechazar la solicitud'
      });
      throw error;
    }
  };

  const canManageRequests = canAccess({
    requireAnyPermissions: ['solicitudes_ampliacion.approve', 'solicitudes_ampliacion.reject'],
  });

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
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
                  setFilterState({ filtroEstado: value, currentPage: 1 });
                }}
              />
            </div>
          ) : undefined
        }
      >
      </PageHeader>
      
      {!isAuthenticated ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-corner p-6 text-center">
          <SystemIcons.interface.xCircle size="3xl" className="text-yellow-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            Autenticación Requerida
          </h3>
          <p className="text-yellow-700">
            Debe iniciar sesión para acceder a esta sección.
          </p>
        </div>
      ) : !canManageRequests ? (
        <div className="bg-red-50 border border-red-200 rounded-corner p-6 text-center">
          <SystemIcons.interface.xCircle size="3xl" className="text-red-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Acceso Denegado
          </h3>
          <p className="text-red-700">
            No tiene permisos para gestionar solicitudes de ampliación. Esta sección es solo para Encargados de Acreditación.
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
            isOpen={confirmState.action === 'approve'}
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
            isOpen={confirmState.action === 'reject'}
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
