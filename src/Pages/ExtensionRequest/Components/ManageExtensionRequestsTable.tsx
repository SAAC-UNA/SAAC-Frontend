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
import { BackendErrorAlert } from '@/Components/Ui/Feedback/BackendErrorAlert';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_TRUNCATE } from '@/Constants/TableTruncate';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { truncateText } from '@/Utils';
import { ExtensionRequestStatusBadge } from './ExtensionRequestStatusBadge';
import type { ExtensionRequest, ExtensionRequestStatus } from '@/Types/ExtensionRequestTypes';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';

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
  itemsPerPage = TABLE_PAGE_SIZE.standard,
  unstyled = false,
  onRetry,
  onReviewRequest
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrar solicitudes
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Filtrar por estado
    if (filterEstado !== 'todos') {
      filtered = filtered.filter(req => req.estado === filterEstado);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(req =>
        req.motivo.toLowerCase().includes(q) ||
        req.solicitud_ampliacion_id.toString().includes(q) ||
        req.usuario?.nombre?.toLowerCase().includes(q) ||
        req.usuario?.email?.toLowerCase().includes(q) ||
        new Date(req.fecha_sugerida).toLocaleDateString('es-ES').includes(q) ||
        new Date(req.created_at).toLocaleDateString('es-ES').includes(q)
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

  const firstColumn = useFirstColumnConfig();

  // Handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Columnas de la tabla
  const columns = useMemo(() => [
    {
      key: 'solicitante',
      header: 'Solicitante',
      align: 'left',
      width: firstColumn.width,
      render: (_: unknown, item: ExtensionRequest) => (
        <div className="flex flex-col">
          <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`} title={item.usuario?.nombre || 'N/A'}>
            {truncateText(item.usuario?.nombre || 'N/A', firstColumn.maxLength)}
          </p>
          <p className={`block font-sans antialiased leading-normal text-gris-una-2 ${TYPOGRAPHY.table.cell}`} title={item.usuario?.email || ''}>
            {truncateText(item.usuario?.email || '', firstColumn.maxLength)}
          </p>
        </div>
      )
    },
    {
      key: 'motivo',
      header: 'Motivo',
      render: (_: unknown, item: ExtensionRequest) => (
        <div className="flex flex-col">
          <p className={`block font-sans antialiased leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`} title={item.motivo}>
            {truncateText(item.motivo, TABLE_TRUNCATE.name)}
          </p>
        </div>
      )
    },
    {
      key: 'fecha_solicitud',
      header: 'Fecha Solicitud',
      align: 'center',
      render: (_: unknown, item: ExtensionRequest) => (
        <span className={`block font-sans antialiased leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
          {new Date(item.created_at).toLocaleDateString('es-ES')}
        </span>
      )
    },
    {
      key: 'fecha_sugerida',
      header: 'Fecha Sugerida',
      align: 'center',
      render: (_: unknown, item: ExtensionRequest) => (
        <span className={`block font-sans antialiased leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
          {new Date(item.fecha_sugerida).toLocaleDateString('es-ES')}
        </span>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (_: unknown, item: ExtensionRequest) => <ExtensionRequestStatusBadge estado={item.estado} />
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'center',
      render: (_: unknown, item: ExtensionRequest) => (
        <div className="flex items-center justify-center gap-2 pr-2">
          <TableActionButton
            action="edit"
            tooltip={item.estado === 'pendiente' ? 'Revisar solicitud' : 'Solicitud ya resuelta'}
            onClick={() => onReviewRequest?.(item)}
            disabled={item.estado !== 'pendiente'}
          />
        </div>
      )
    }
  ], [onReviewRequest]);

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
