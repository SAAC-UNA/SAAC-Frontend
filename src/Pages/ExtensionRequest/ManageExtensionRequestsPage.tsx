/**
 * ManageExtensionRequestsPage - Página para gestionar solicitudes de ampliación (Encargados)
 * HU-016 - Vista de gestión para encargados de acreditación
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, ScreenContainer } from '@/Components/Ui/Index';
import { SearchInput } from '@/Components/Ui/SearchInput';
import { FilterButton, type FilterOption } from '@/Components/Ui/FilterButton';
import { extensionRequestService } from '@/Services/ExtensionRequestService';
import { useToast } from '@/Context/ToastContext';
import { useAuth } from '@/Context/AuthContext';
import { getContextualInfo } from '@/Constants/ModuleInfo';
import { ManageExtensionRequestsTable } from './Components/ManageExtensionRequestsTable';
import { ReviewExtensionRequestModal } from '@/Components/Ui/ReviewExtensionRequestModal';
import type { 
  ExtensionRequest, 
  ExtensionRequestStatus,
  ReviewFormData 
} from '@/Types/ExtensionRequestTypes';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';

export const ManageExtensionRequestsPage: React.FC = () => {
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = getContextualInfo('extension_requests', 'manage');
  
  const [solicitudes, setSolicitudes] = useState<ExtensionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<ExtensionRequestStatus | 'todos'>('pendiente');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estado para el modal de revisión
  const [selectedSolicitud, setSelectedSolicitud] = useState<ExtensionRequest | null>(null);

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
      setLoading(true);
      setError(null);
      
      const filters = {
        estado: filtroEstado === 'todos' ? undefined : filtroEstado,
        page: currentPage,
        per_page: 15
      };

      const response = filtroEstado === 'pendiente' 
        ? await extensionRequestService.getPendingRequests(filters)
        : await extensionRequestService.getAllRequests(filters);

      setSolicitudes(response.data);
    } catch (error: any) {
      const errorMessage = error.message || 'No se pudieron cargar las solicitudes';
      setError(errorMessage);
      showToast({
        type: 'error',
        title: 'Error al Cargar',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleReviewRequest = useCallback((solicitud: ExtensionRequest) => {
    setSelectedSolicitud(solicitud);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedSolicitud(null);
  }, []);

  const handleApprove = async (data: ReviewFormData) => {
    if (!selectedSolicitud) return;

    try {
      await extensionRequestService.approveRequest(
        selectedSolicitud.solicitud_ampliacion_id,
        data
      );

      showToast({
        type: 'success',
        title: 'Solicitud Aprobada',
        message: 'La solicitud ha sido aprobada correctamente y la fecha límite ha sido actualizada.'
      });

      // Recargar la lista
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

  const handleReject = async (data: ReviewFormData) => {
    if (!selectedSolicitud) return;

    try {
      await extensionRequestService.rejectRequest(
        selectedSolicitud.solicitud_ampliacion_id,
        data
      );

      showToast({
        type: 'warning',
        title: 'Solicitud Rechazada',
        message: 'La solicitud ha sido rechazada.'
      });

      // Recargar la lista
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

  // Validar que tenga rol de Encargado de Acreditación o Superusuario
  const hasPermission = user?.roles?.some(r => 
    r.name === 'Encargado de Acreditación' || r.name === 'Superusuario'
  );

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        headerExtra={
          isAuthenticated && hasPermission ? (
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
                  setFiltroEstado(value);
                  setCurrentPage(1);
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
      ) : !hasPermission ? (
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
            itemsPerPage={15}
            onRetry={loadSolicitudes}
            onReviewRequest={handleReviewRequest}
          />
          
          {/* Modal de revisión */}
          {selectedSolicitud && (
            <ReviewExtensionRequestModal
              isOpen={!!selectedSolicitud}
              onClose={handleCloseModal}
              onApprove={handleApprove}
              onReject={handleReject}
              solicitud={selectedSolicitud}
            />
          )}
        </>
      )}
    </ScreenContainer>
  );
};
