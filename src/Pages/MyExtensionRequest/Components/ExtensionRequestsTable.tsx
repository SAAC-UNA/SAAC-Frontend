/**
 * ExtensionRequestsTable - Tabla de solicitudes de ampliación
 * HU-016
 * 
 * Características:
 * - DataTable con paginación
 * - Filtros por estado
 * - Búsqueda
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { DataTable } from '@/components/index';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { BackendErrorAlert } from '@/Components/Ui/Feedback/BackendErrorAlert';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { ExtensionRequestStatusBadge } from './ExtensionRequestStatusBadge';
import type { ExtensionRequest, ExtensionRequestStatus } from '@/Types/ExtensionRequestTypes';
import { filterExtensionRequests, formatExtensionDate } from '@/Types/ExtensionRequestTypes';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';

const EMPTY_REQUESTS: ExtensionRequest[] = [];

interface ExtensionRequestsTableProps {
  requests?: ExtensionRequest[];
  isLoading?: boolean;
  error?: string | null;
  searchQuery?: string;
  filterEstado?: ExtensionRequestStatus | 'todos';
  itemsPerPage?: number;
  unstyled?: boolean;
  onRetry?: () => void;
  onViewDetails?: (request: ExtensionRequest) => void;
}

export const ExtensionRequestsTable: React.FC<ExtensionRequestsTableProps> = ({
  requests = EMPTY_REQUESTS,
  isLoading = false,
  error = null,
  searchQuery = '',
  filterEstado = 'todos',
  itemsPerPage = TABLE_PAGE_SIZE.standard,
  unstyled = false,
  onRetry,
  onViewDetails
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset página cuando cambian los filtros (sin useEffect - patrón derived state)
  const prevFiltersRef = useRef({ searchQuery, filterEstado });
  if (prevFiltersRef.current.searchQuery !== searchQuery || prevFiltersRef.current.filterEstado !== filterEstado) {
    prevFiltersRef.current = { searchQuery, filterEstado };
    setCurrentPage(1);
  }

  // Función para truncar texto
  const truncateText = useCallback((text: string, maxLength: number = 30): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);

  // Filtrar solicitudes
  const filteredRequests = useMemo(() =>
    filterExtensionRequests(requests, searchQuery, filterEstado)
  , [requests, filterEstado, searchQuery]);

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
  // (movido a patrón derived state arriba)

  const firstColumn = useFirstColumnConfig();

  // Handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Columnas de la tabla
  const columns = useMemo(() => [
    {
      key: 'motivo',
      header: 'Motivo',
      align: 'left',
      width: firstColumn.width,
      render: (_: unknown, item: ExtensionRequest) => (
        <div className="flex flex-col">
          <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`} title={item.motivo}>
            {truncateText(item.motivo, firstColumn.maxLength)}
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
          {formatExtensionDate(item.created_at)}
        </span>
      )
    },
    {
      key: 'fecha_sugerida',
      header: 'Fecha Sugerida',
      align: 'center',
      render: (_: unknown, item: ExtensionRequest) => (
        <span className={`block font-sans antialiased leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
          {formatExtensionDate(item.fecha_sugerida)}
        </span>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (_: unknown, item: ExtensionRequest) => 
        <div className="flex justify-center">
          <ExtensionRequestStatusBadge estado={item.estado} />
        </div>
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (_: unknown, item: ExtensionRequest) => (
        <div className="flex items-center justify-center gap-2 pr-2">
          <TableActionButton
            action="view"
            tooltip="Ver detalles de la solicitud"
            onClick={() => onViewDetails?.(item)}
          />
        </div>
      )
    }
  ], [onViewDetails]);

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
              ? `No tiene solicitudes ${filterEstado}`
              : 'No tiene solicitudes. Puede crear solicitudes desde la sección de evidencias asignadas'
        }
        unstyled={unstyled}
      />
    </div>
  );
};
