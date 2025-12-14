/**
 * MyExtensionRequestsPage - Página para ver mis solicitudes de ampliación
 * HU-016 - Vista para usuarios normales
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { BackendErrorAlert } from '@/Components/Ui/BackendErrorAlert';
import { extensionRequestService } from '@/Services/ExtensionRequestService';
import { getContextualInfo } from '@/Constants/ModuleInfo';
import type { 
  ExtensionRequest, 
  ExtensionRequestStatus 
} from '@/Types/ExtensionRequestTypes';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Button } from '@/Components/Ui/Button';
import { FilterButton, type FilterOption } from '@/Components/Ui/FilterButton';
import { Table, type TableColumn, type TableAction } from '@/Components/Ui/Table';

export const MyExtensionRequestsPage: React.FC = () => {
  
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = getContextualInfo('extension_requests', 'my');
  
  const [solicitudes, setSolicitudes] = useState<ExtensionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<ExtensionRequestStatus | 'todos'>('todos');
  const [selectedSolicitud, setSelectedSolicitud] = useState<ExtensionRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

      const response = await extensionRequestService.getMyRequests(filters);
      setSolicitudes(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error: any) {
      setError(error.message || 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
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

  const handleViewDetails = (solicitud: ExtensionRequest) => {
    setSelectedSolicitud(solicitud);
  };

  const handleCloseDetails = () => {
    setSelectedSolicitud(null);
  };

  // Definir columnas de la tabla
  const columns = useMemo<TableColumn<ExtensionRequest>[]>(() => [
    {
      key: 'solicitud_ampliacion_id',
      header: 'ID',
      render: (_value, item) => (
        <span className="font-medium text-gray-900">#{item.solicitud_ampliacion_id}</span>
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
        <span className="text-gray-500">
          {new Date(item.fecha_solicitud).toLocaleDateString('es-ES')}
        </span>
      )
    },
    {
      key: 'fecha_sugerida',
      header: 'Fecha Sugerida',
      render: (_value, item) => (
        <span className="font-medium text-gray-900">
          {new Date(item.fecha_sugerida).toLocaleDateString('es-ES')}
        </span>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (_value, item) => getEstadoBadge(item.estado)
    }
  ], []);

  // Definir acciones de la tabla
  const actions = useMemo<TableAction<ExtensionRequest>[]>(() => [
    {
      label: 'Ver Detalles',
      variant: 'secondary',
      onClick: handleViewDetails
    }
  ], []);

  return (
    <ScreenContainer
      title={moduleInfo.title}
      description={moduleInfo.description}
      variant="full-width"
      headerExtra={
          <FilterButton
          tooltipText="Filtrar por estado"
          options={estadoOptions}
          value={filtroEstado}
          onChange={(value) => {
            setFiltroEstado(value);
            setCurrentPage(1);
          }}
        />
      }
    >
      {error && (
        <BackendErrorAlert 
          error={error} 
          onRetry={loadSolicitudes}
        />
      )}

      {/* Tabla de solicitudes */}
      <Table
        data={solicitudes as unknown as Record<string, unknown>[]}
        columns={columns as unknown as TableColumn<Record<string, unknown>>[]}
        actions={actions as unknown as TableAction<Record<string, unknown>>[]}
        loading={loading}
        emptyMessage={
          filtroEstado !== 'todos' 
            ? `No tiene solicitudes ${filtroEstado}` 
            : 'No tiene solicitudes. Puede crear solicitudes desde la sección de evidencias asignadas'
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

      {/* Modal de detalles */}
      {selectedSolicitud && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Detalles de la Solicitud #{selectedSolicitud.solicitud_ampliacion_id}
                </h2>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SystemIcons.interface.xCircle size="lg" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Estado */}
                <div>
                  <p className="text-sm font-medium text-gray-700">Estado:</p>
                  <div className="mt-1">
                    {getEstadoBadge(selectedSolicitud.estado)}
                  </div>
                </div>

                {/* Motivo */}
                <div>
                  <p className="text-sm font-medium text-gray-700">Motivo:</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedSolicitud.motivo}</p>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Fecha de solicitud:</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedSolicitud.fecha_solicitud).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Fecha sugerida:</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedSolicitud.fecha_sugerida).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Información de asignación */}
                {selectedSolicitud.evidencia_asignacion && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900">Fecha límite actual:</p>
                    <p className="text-sm text-blue-700">
                      {new Date(selectedSolicitud.evidencia_asignacion.fecha_limite).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {/* Resolución */}
                {selectedSolicitud.estado !== 'pendiente' && (
                  <div className={`border rounded-lg p-3 ${
                    selectedSolicitud.estado === 'aprobada' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <p className={`text-sm font-medium ${
                      selectedSolicitud.estado === 'aprobada' ? 'text-green-900' : 'text-red-900'
                    }`}>
                      Resolución:
                    </p>
                    {selectedSolicitud.justificacion && (
                      <p className={`text-sm mt-1 ${
                        selectedSolicitud.estado === 'aprobada' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {selectedSolicitud.justificacion}
                      </p>
                    )}
                    {selectedSolicitud.fecha_resolucion && (
                      <p className={`text-xs mt-2 ${
                        selectedSolicitud.estado === 'aprobada' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Resuelta el {new Date(selectedSolicitud.fecha_resolucion).toLocaleDateString('es-ES')}
                        {selectedSolicitud.resolutor?.nombre && ` por ${selectedSolicitud.resolutor.nombre}`}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={handleCloseDetails}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ScreenContainer>
  );
};
