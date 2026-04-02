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

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { DataTable } from '@/components/index';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { BackendErrorAlert } from '@/Components/Ui/Feedback/BackendErrorAlert';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_TRUNCATE } from '@/Constants/TableTruncate';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { truncateText } from '@/Utils';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { EXTENSION_REQUEST_STATUS_BADGE } from '@/Constants/StatusBadges';
import type { ExtensionRequest, ExtensionRequestStatus } from '@/Types/ExtensionRequestTypes';
import { filterExtensionRequests } from '@/Types/ExtensionRequestTypes';
import { formatDate } from '@/Utils/DateUtils';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';

const EMPTY_REQUESTS: ExtensionRequest[] = [];

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
  onApproveRequest?: (request: ExtensionRequest) => void;
  onRejectRequest?: (request: ExtensionRequest) => void;
}

export const ManageExtensionRequestsTable: React.FC<ManageExtensionRequestsTableProps> = ({
  requests = EMPTY_REQUESTS,
  isLoading = false,
  error = null,
  searchQuery = '',
  filterEstado = 'todos',
  itemsPerPage = TABLE_PAGE_SIZE.standard,
  unstyled = false,
  onRetry,
  onReviewRequest,
  onApproveRequest,
  onRejectRequest,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset página cuando cambian los filtros (sin useEffect - patrón derived state)
  const prevFiltersRef = useRef({ searchQuery, filterEstado });
  if (prevFiltersRef.current.searchQuery !== searchQuery || prevFiltersRef.current.filterEstado !== filterEstado) {
    prevFiltersRef.current = { searchQuery, filterEstado };
    setCurrentPage(1);
  }

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
      align: 'center',
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
          {formatDate(item.created_at)}
        </span>
      )
    },
    {
      key: 'fecha_sugerida',
      header: 'Fecha Sugerida',
      align: 'center',
      render: (_: unknown, item: ExtensionRequest) => (
        <span className={`block font-sans antialiased leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
          {formatDate(item.fecha_sugerida)}
        </span>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (_: unknown, item: ExtensionRequest) => 
        <div className="flex justify-center">
          <StatusBadge
            label={EXTENSION_REQUEST_STATUS_BADGE[item.estado]?.label ?? item.estado}
            colorClasses={EXTENSION_REQUEST_STATUS_BADGE[item.estado]?.colorClasses ?? 'bg-gris-light text-gris-una'}
          />
        </div>
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'center',
      render: (_: unknown, item: ExtensionRequest) => {
        const isPending = item.estado === 'pendiente';
        const isApproved = item.estado === 'aprobada';
        return (
          <div className="flex items-center justify-center gap-2 pr-2">
            <TableActionButton
              action="view"
              tooltip="Ver detalles"
              onClick={() => onReviewRequest?.(item)}
            />
            {/* Toggle decisión: aprobada ↔ rechazada / pendiente → aprobar */}
            <TableActionButton
              action={isApproved || isPending ? 'approveRequest' : 'rejectRequest'}
              tooltip={isPending ? 'Aprobar solicitud' : isApproved ? 'Solicitud aprobada' : 'Solicitud rechazada'}
              onClick={() => onApproveRequest?.(item)}
              disabled={!isPending}
            />
          </div>
        );
      }
    }
  ], [onReviewRequest, onApproveRequest, onRejectRequest]);

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
