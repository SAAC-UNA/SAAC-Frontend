/**
 * EvidenceSearchResultsTable - Tabla de resultados de búsqueda de evidencias
 * Componente para mostrar los resultados filtrados con acciones
 */

import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/Utils/ClassNames';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { DataTable, type DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TableActionButton } from '@/Components/index';
import { 
  EVIDENCE_STATUS_LABELS, 
  EVIDENCE_STATUS_BADGE,
  type EvidenceSearchResult 
} from '@/Types/EvidenceSearchTypes';
import { ICON_SIZES } from '@/Constants/Components';

export interface EvidenceSearchResultsTableProps {
  results: EvidenceSearchResult[];
  loading?: boolean;
  onViewDetails: (evidenceId: number) => void;
  itemsPerPage?: number;
}

export const EvidenceSearchResultsTable: React.FC<EvidenceSearchResultsTableProps> = ({
  results,
  loading = false,
  onViewDetails,
  itemsPerPage = 4
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Función para formatear fecha
  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Calcular datos paginados - memoizado
  const { totalPages, paginatedData } = useMemo(() => {
    const total = Math.ceil(results.length / itemsPerPage);
    const paginated = results.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    return { totalPages: total, paginatedData: paginated };
  }, [results, currentPage, itemsPerPage]);

  // Handler de cambio de página
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Definir columnas - memoizado
  const columns: DataTableColumn<EvidenceSearchResult>[] = useMemo(() => [
    {
      key: 'criterio',
      header: 'Criterio',
      render: (_, item) => (
        <div className="flex flex-col pl-2 py-1">
          <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
            {item.criterio_nomenclatura}
          </p>
          <p className={`block font-sans antialiased font-normal leading-normal text-gris-una opacity-70 max-w-xs truncate ${TYPOGRAPHY.table.cell}`}>
            {item.criterio_descripcion}
          </p>
        </div>
      )
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (_, item) => (
        <div className="flex flex-col pl-2 py-1">
          <p className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 max-w-md ${TYPOGRAPHY.table.cell}`}>
            {item.descripcion}
          </p>
        </div>
      )
    },
    {
      key: 'responsables',
      header: 'Responsables',
      align: 'center',
      render: (_, item) => {
        const count = item.responsables.length;
        return (
          <div className={`flex flex-col items-center ${TYPOGRAPHY.table.cell}`}>
            <span className={`block font-sans antialiased font-semibold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
              {count === 0 && 'Sin asignar'}
              {count === 1 && '1 responsable'}
              {count > 1 && `${count} responsables`}
            </span>
          </div>
        );
      }
    },
    {
      key: 'fecha_publicacion',
      header: 'Fecha Creación',
      align: 'center',
      render: (_, item) => (
        <div className={`flex flex-col items-center ${TYPOGRAPHY.table.cell}`}>
          <span className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
            {formatDate(item.fecha_publicacion)}
          </span>
        </div>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (_, item) => {
        const badgeClass = EVIDENCE_STATUS_BADGE[item.estado];
        return (
          <div className="w-max mx-auto">
            <div className={cn(
              'relative grid items-center px-2 py-1 font-sans font-bold rounded-corner select-none whitespace-nowrap',
              TYPOGRAPHY.badge,
              badgeClass
            )}>
              <span>{EVIDENCE_STATUS_LABELS[item.estado]}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'recursos',
      header: 'Recursos',
      align: 'center',
      render: (_, item) => (
        <div className={`flex items-center justify-center gap-3 text-gray-600 ${TYPOGRAPHY.table.cell}`}>
          {item.archivos_count > 0 && (
            <div className="flex items-center gap-1" title="Archivos adjuntos">
              <SystemIcons.modal.document className={`text-gris-una ${ICON_SIZES.sm}`} />
              <span>{item.archivos_count}</span>
            </div>
          )}
          {item.enlaces_count > 0 && (
            <div className="flex items-center gap-1" title="Enlaces">
              <SystemIcons.interface.link className={`text-gris-una ${ICON_SIZES.sm}`} />
              <span>{item.enlaces_count}</span>
            </div>
          )}
          {item.archivos_count === 0 && item.enlaces_count === 0 && (
            <span className={`text-gray-400 ${TYPOGRAPHY.table.cell}`}>Sin recursos</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (_, item) => (
        <div className="flex items-center justify-center gap-2 pr-2">
          <TableActionButton
            action="view"
            tooltip="Ver detalles"
            onClick={() => onViewDetails(item.evidencia_id)}
          />
        </div>
      )
    }
  ], [onViewDetails]);

  return (
    <DataTable
      data={paginatedData as any}
      columns={columns as any}
      title=""
      searchable={false}
      loading={loading}
      emptyMessage="No existen evidencias que cumplan con los filtros aplicados. Intenta ajustar los criterios de búsqueda."
      pagination={totalPages > 1 ? {
        currentPage,
        totalPages,
        onPageChange: handlePageChange
      } : undefined}
      unstyled={true}
    />
  );
};

export default EvidenceSearchResultsTable;
