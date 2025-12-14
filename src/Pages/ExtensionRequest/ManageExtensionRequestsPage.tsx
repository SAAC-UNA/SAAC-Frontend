/**
 * ManageExtensionRequestsPage - Página para gestionar solicitudes de ampliación (Encargados)
 * HU-016 - Vista de gestión para encargados de acreditación
 */

import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { BackendErrorAlert } from '@/Components/Ui/BackendErrorAlert';
import { Button } from '@/Components/Ui/Button';
import { PageHeader } from '@/Components/Ui/PageHeader';
import { ReviewExtensionRequestModal } from '@/Components/Ui/ReviewExtensionRequestModal';
import { useToast } from '@/Context/ToastContext';
import { extensionRequestService } from '@/Services/ExtensionRequestService';
import type { 
  ExtensionRequest, 
  ExtensionRequestStatus,
  ReviewFormData 
} from '@/Types/ExtensionRequestTypes';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';

export const ManageExtensionRequestsPage: React.FC = () => {
  const { showToast } = useToast();
  
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <SystemIcons.interface.filter size="md" className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">Filtrar por estado</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['todos', 'pendiente', 'aprobada', 'rechazada'] as const).map((estado) => (
            <Button
              key={estado}
              variant={filtroEstado === estado ? 'primary' : 'secondary'}
              onClick={() => {
                setFiltroEstado(estado);
                setCurrentPage(1);
              }}
              size="sm"
            >
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabla de solicitudes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando solicitudes...</p>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="p-8 text-center">
            <SystemIcons.interface.clock size="3xl" className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay solicitudes {filtroEstado !== 'todos' && filtroEstado}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solicitante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Motivo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Solicitud
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Sugerida
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {solicitudes.map((solicitud) => (
                    <tr key={solicitud.solicitud_ampliacion_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {solicitud.usuario?.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {solicitud.usuario?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={solicitud.motivo}>
                          {solicitud.motivo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {new Date(solicitud.fecha_sugerida).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEstadoBadge(solicitud.estado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {solicitud.estado === 'pendiente' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleReviewClick(solicitud)}
                          >
                            Revisar
                          </Button>
                        ) : (
                          <span className="text-gray-500 text-xs">
                            {solicitud.resolutor?.nombre || 'N/A'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
