/**
 * ManageExtensionRequestsTable - Tabla de gestión de solicitudes de ampliación
 * HU-016 - Para Encargados de Acreditación
 * 
 * Características:
 * - DataTable con paginación
 * - Filtros por estado
 * - Búsqueda
 * - Acción de revisar/aprobar solicitudes
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataTable, TableActionButton } from '@/components/index';
import { BackendErrorAlert } from '@/Components/Ui/BackendErrorAlert';
import type { ExtensionRequest, ExtensionRequestStatus } from '@/Types/ExtensionRequestTypes';

interface ManageExtensionRequestsTableProps {
  requests?: ExtensionRequest[];
  isLoading?: boolean;
  error?: string | null;
  searchQuery?: string;
  filterEstado?: ExtensionRequestStatus | 'todos';
  itemsPerPage?: number;
  unstyled?: boolean;
  onRetry?: () => void;
  onReviewRequest?: (request: ExtensionRequest) => void;
}

export const ManageExtensionRequestsTable: React.FC<ManageExtensionRequestsTableProps> = ({
  requests = [],
  isLoading = false,
  error = null,
  searchQuery = '',
  filterEstado = 'todos',
  itemsPerPage = 15,
  unstyled = false,
  onRetry,
  onReviewRequest
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Función para truncar texto
  const truncateText = useCallback((text: string, maxLength: number = 30): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);

  // Badge de estado (sin íconos)
  const getEstadoBadge = useCallback((estado: ExtensionRequestStatus) => {
    const badges = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      aprobada: 'bg-green-100 text-green-800 border-green-300',
      rechazada: 'bg-red-100 text-red-800 border-red-300'
    };

    return (
      <div className="w-max mx-auto">
        <div className={`relative grid items-center px-2 py-1 font-sans text-xs font-bold uppercase rounded-md select-none whitespace-nowrap ${badges[estado]}`}>
          <span>{estado.charAt(0).toUpperCase() + estado.slice(1)}</span>
        </div>
      </div>
    );
  }, []);

  // Filtrar solicitudes
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Filtrar por estado
    if (filterEstado !== 'todos') {
      filtered = filtered.filter(req => req.estado === filterEstado);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(req =>
        req.motivo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.solicitud_ampliacion_id.toString().includes(searchQuery) ||
        req.usuario?.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.usuario?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [requests, filterEstado, searchQuery]);

  // Calcular paginación
  const { totalPages, paginatedData } = useMemo(() => {
    const total = Math.ceil(filteredRequests.length / itemsPerPage);
    const paginated = filteredRequests.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    return { totalPages: total, paginatedData: paginated };
  }, [filteredRequests, currentPage, itemsPerPage]);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterEstado]);

  // Handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Columnas de la tabla
  const columns = useMemo(() => [
    {
      key: 'solicitante',
      header: 'Solicitante',
      render: (_: unknown, item: ExtensionRequest) => (
        <div className="flex flex-col">
          <p className="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-gray-900 uppercase rounded-md select-none whitespace-nowrap">
            {item.usuario?.nombre || 'N/A'}
          </p>
          <p className="relative grid items-center px-2 py-1 font-sans text-xs text-gray-500 rounded-md select-none whitespace-nowrap">
            {item.usuario?.email || ''}
          </p>
        </div>
      )
    },
    {
      key: 'motivo',
      header: 'Motivo',
      render: (_: unknown, item: ExtensionRequest) => (
        <div className="flex flex-col">
          <p className="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-gray-900 uppercase rounded-md select-none whitespace-nowrap" title={item.motivo}>
            {truncateText(item.motivo, 40)}
          </p>
        </div>
      )
    },
    {
      key: 'fecha_solicitud',
      header: 'Fecha Solicitud',
      align: 'center',
      render: (_: unknown, item: ExtensionRequest) => (
        <span className="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-gray-900 uppercase rounded-md select-none whitespace-nowrap">
          {new Date(item.created_at).toLocaleDateString('es-ES')}
        </span>
      )
    },
    {
      key: 'fecha_sugerida',
      header: 'Fecha Sugerida',
      align: 'center',
      render: (_: unknown, item: ExtensionRequest) => (
        <span className="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-gray-900 uppercase rounded-md select-none whitespace-nowrap">
          {new Date(item.fecha_sugerida).toLocaleDateString('es-ES')}
        </span>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (_: unknown, item: ExtensionRequest) => getEstadoBadge(item.estado)
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'center',
      render: (_: unknown, item: ExtensionRequest) => (
        <div className="flex items-center justify-center gap-2 pr-2">
          {item.estado === 'pendiente' ? (
            <TableActionButton
              action="edit"
              tooltip="Revisar solicitud"
              onClick={() => onReviewRequest?.(item)}
            />
          ) : (
            <span className="text-xs text-gray-500">
              {item.resolutor?.nombre || 'N/A'}
            </span>
          )}
        </div>
      )
    }
  ], [truncateText, getEstadoBadge, onReviewRequest]);

  if (error) {
    return (
      <BackendErrorAlert
        error={error}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="w-full">
      <DataTable
        data={paginatedData as any}
        columns={columns as any}
        title=""
        searchable={false}
        pagination={totalPages > 1 ? {
          currentPage,
          totalPages,
          onPageChange: handlePageChange
        } : undefined}
        loading={isLoading}
        emptyMessage={
          searchQuery
            ? `No se encontraron solicitudes que coincidan con "${searchQuery}"`
            : filterEstado !== 'todos'
              ? `No hay solicitudes ${filterEstado}`
              : 'No hay solicitudes de ampliación registradas'
        }
        unstyled={unstyled}
      />
    </div>
  );
};
