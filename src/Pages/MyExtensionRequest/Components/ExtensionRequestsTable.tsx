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
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { EXTENSION_REQUEST_STATUS_BADGE } from '@/Constants/StatusBadges';
import type { ExtensionRequest, ExtensionRequestStatus } from '@/Types/ExtensionRequestTypes';
import { filterExtensionRequests } from '@/Types/ExtensionRequestTypes';
import { formatDate } from '@/Utils/DateUtils';
import { TABLE_COLUMN_WIDTHS } from '@/Constants/Components';
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
  onCancelRequest?: (request: ExtensionRequest) => void;
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
  onViewDetails,
  onCancelRequest
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
          {/* Mostrar contexto: evidencia o elemento */}
          {item.evidencia_asignacion?.evidencia ? (
            <p className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.helper}`} title={item.evidencia_asignacion.evidencia.nomenclatura}>
              {truncateText(item.evidencia_asignacion.evidencia.nomenclatura, firstColumn.maxLength)}
            </p>
          ) : item.elemento_asignacion ? (
            (() => {
              const nombre = (item.elemento_asignacion as any).element?.nombre ?? `Elemento #${item.elemento_asignacion.elemento_id}`;
              return (
                <p className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.helper}`} title={nombre}>
                  {truncateText(nombre, firstColumn.maxLength)}
                </p>
              );
            })()
          ) : null}
        </div>
      )
    },
    {
      key: 'fecha_solicitud',
      header: 'Fecha Solicitud',
      align: 'left',
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_: unknown, item: ExtensionRequest) => (
        <div className="flex items-start">
          <span className={`block font-sans antialiased leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
            {formatDate(item.created_at)}
          </span>
        </div>
      )
    },
    {
      key: 'fecha_sugerida',
      header: 'Fecha Sugerida',
      align: 'left',
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_: unknown, item: ExtensionRequest) => (
        <div className="flex items-start">
          <span className={`block font-sans antialiased leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
            {formatDate(item.fecha_sugerida)}
          </span>
        </div>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'left',
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_: unknown, item: ExtensionRequest) => 
        <div className="flex justify-start">
          <StatusBadge
            label={EXTENSION_REQUEST_STATUS_BADGE[item.estado]?.label ?? item.estado}
            colorClasses={EXTENSION_REQUEST_STATUS_BADGE[item.estado]?.colorClasses ?? 'bg-gris-light text-gris-una'}
          />
        </div>
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      width: TABLE_COLUMN_WIDTHS.actionsLarge,
      render: (_: unknown, item: ExtensionRequest) => (
        <div className="flex items-center justify-center gap-2">
          <TableActionButton
            action="view"
            tooltip="Ver detalles de la solicitud"
            onClick={() => onViewDetails?.(item)}
          />
          {onCancelRequest && (
            <TableActionButton
              action="clock"
              tooltip={item.estado === 'pendiente' ? 'Cancelar ampliación' : 'Solo se pueden cancelar solicitudes pendientes'}
              customVariant={item.estado === 'pendiente' ? 'tableDelete' : undefined}
              onClick={() => onCancelRequest(item)}
              disabled={item.estado !== 'pendiente'}
            />
          )}
        </div>
      )
    }
  ], [onViewDetails, onCancelRequest]);

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
