/**
 * ManageExtensionRequestsPage - Página para gestionar solicitudes de ampliación (Encargados)
 * HU-016 - Vista de gestión para encargados de acreditación
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { BackendErrorAlert } from '@/Components/Ui/BackendErrorAlert';
import { PageHeader } from '@/Components/Ui/PageHeader';
import { ReviewExtensionRequestModal } from '@/Components/Ui/ReviewExtensionRequestModal';
import { useToast } from '@/Context/ToastContext';
import { useAuth } from '@/Context/AuthContext';
import { extensionRequestService } from '@/Services/ExtensionRequestService';
import type { 
  ExtensionRequest, 
  ExtensionRequestStatus,
  ReviewFormData 
} from '@/Types/ExtensionRequestTypes';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Table, type TableColumn } from '@/Components/Ui/Table';
import { TableActionButton } from '@/Components/Ui/TableActionButton';
import { FilterButton, type FilterOption } from '@/Components/Ui/FilterButton';

export const ManageExtensionRequestsPage: React.FC = () => {
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [solicitudes, setSolicitudes] = useState<ExtensionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<ExtensionRequestStatus | 'todos'>('pendiente');
  const [selectedSolicitud, setSelectedSolicitud] = useState<ExtensionRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      setTotalPages(response.meta.last_page);
    } catch (error: any) {
      setError(error.message || 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (solicitud: ExtensionRequest) => {
    setSelectedSolicitud(solicitud);
  };

  const handleCloseModal = () => {
    setSelectedSolicitud(null);
  };

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
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error al Rechazar',
        message: error.message || 'No se pudo rechazar la solicitud'
      });
      throw error;
    }
  };

  const getEstadoBadge = (estado: ExtensionRequestStatus) => {
    const badges = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      aprobada: 'bg-green-100 text-green-800 border-green-300',
      rechazada: 'bg-red-100 text-red-800 border-red-300'
    };

    const icons = {
      pendiente: <SystemIcons.interface.clock size="sm" />,
      aprobada: <SystemIcons.interface.checkCircle size="sm" />,
      rechazada: <SystemIcons.interface.xCircle size="sm" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badges[estado]}`}>
        {icons[estado]}
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  // Opciones para el filtro de estado
  const estadoOptions: FilterOption<ExtensionRequestStatus | 'todos'>[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'aprobada', label: 'Aprobada' },
    { value: 'rechazada', label: 'Rechazada' }
  ];

  // Definir columnas de la tabla
  const columns = useMemo<TableColumn<ExtensionRequest>[]>(() => [
    {
      key: 'usuario',
      header: 'Solicitante',
      render: (_value, item) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {item.usuario?.nombre || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">
            {item.usuario?.email || ''}
          </div>
        </div>
      )
    },
    {
      key: 'motivo',
      header: 'Motivo',
      render: (_value, item) => (
        <div className="text-sm text-gray-900 max-w-xs truncate" title={item.motivo}>
          {item.motivo}
        </div>
      )
    },
    {
      key: 'fecha_solicitud',
      header: 'Fecha Solicitud',
      render: (_value, item) => (
        <span className="text-sm text-gray-500">
          {new Date(item.fecha_solicitud).toLocaleDateString('es-ES')}
        </span>
      )
    },
    {
      key: 'fecha_sugerida',
      header: 'Fecha Sugerida',
      render: (_value, item) => (
        <span className="text-sm font-medium text-gray-900">
          {new Date(item.fecha_sugerida).toLocaleDateString('es-ES')}
        </span>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (_value, item) => getEstadoBadge(item.estado)
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_value, item) => (
        <div className="flex justify-end gap-2">
          {item.estado === 'pendiente' ? (
            <TableActionButton
              action="edit"
              tooltip="Revisar solicitud"
              onClick={() => handleReviewClick(item)}
            />
          ) : (
            <span className="text-xs text-gray-500">
              {item.resolutor?.nombre || 'N/A'}
            </span>
          )}
        </div>
      )
    }
  ], []);

  // Validar autenticación y permisos
  if (!isAuthenticated) {
    return (
      <ScreenContainer>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <SystemIcons.interface.xCircle size="3xl" className="text-yellow-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            Autenticación Requerida
          </h3>
          <p className="text-yellow-700">
            Debe iniciar sesión para acceder a esta sección.
          </p>
        </div>
      </ScreenContainer>
    );
  }

  // Validar que tenga rol de Encargado de Acreditación
  const hasPermission = user?.roles?.some(r => r.name === 'Encargado de Acreditación');
  if (!hasPermission) {
    return (
      <ScreenContainer>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <SystemIcons.interface.xCircle size="3xl" className="text-red-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Acceso Denegado
          </h3>
          <p className="text-red-700">
            No tiene permisos para gestionar solicitudes de ampliación. Esta sección es solo para Encargados de Acreditación.
          </p>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader
        title="Gestión de Solicitudes de Ampliación"
        description="Revise y gestione las solicitudes de ampliación de plazo para evidencias"
      />

      {error && (
        <BackendErrorAlert 
          error={error} 
          onRetry={loadSolicitudes}
        />
      )}

      {/* Filtros */}
      <div className="mb-6 flex justify-end">
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

      {/* Tabla de solicitudes */}
      <Table
        data={solicitudes as unknown as Record<string, unknown>[]}
        columns={columns as unknown as TableColumn<Record<string, unknown>>[]}
        loading={loading}
        emptyMessage={
          filtroEstado !== 'todos' 
            ? `No hay solicitudes ${filtroEstado}` 
            : 'No hay solicitudes de ampliación registradas'
        }
        pagination={
          totalPages > 1
            ? {
                currentPage,
                totalPages,
                onPageChange: setCurrentPage
              }
            : undefined
        }
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
    </ScreenContainer>
  );
};
