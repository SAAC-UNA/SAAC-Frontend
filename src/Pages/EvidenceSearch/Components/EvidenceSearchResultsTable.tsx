/**
 * EvidenceSearchResultsTable - Tabla de resultados de búsqueda de evidencias
 * Componente para mostrar los resultados filtrados con acciones
 */

import React, { useState, useMemo, useCallback } from 'react';
import { DataTable, type DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { 
  type EvidenceSearchResult 
} from '@/Types/EvidenceSearchTypes';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';

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
  itemsPerPage = TABLE_PAGE_SIZE.standard
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Función para truncar texto
  const truncateText = useCallback((text: string, maxLength: number = 20): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);

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

  const firstColumn = useFirstColumnConfig();

  // Handler de cambio de página
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Definir columnas - memoizado
  const columns: DataTableColumn<EvidenceSearchResult>[] = useMemo(() => [
    {
      key: 'criterio',
      header: 'Criterio',
      align: 'left',
      width: firstColumn.width,
      render: (_, item) => (
        <div className="flex flex-col pl-2">
          <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`} title={item.criterio_nomenclatura}>
            {truncateText(item.criterio_nomenclatura, firstColumn.maxLength)}
          </p>
          <p className={`block font-sans antialiased font-normal leading-normal text-gris-una-2 ${TYPOGRAPHY.table.cell}`} title={item.criterio_descripcion}>
            {truncateText(item.criterio_descripcion, firstColumn.maxLength)}
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
            <span className={`block font-sans antialiased leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
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
          <span className={`block font-sans antialiased leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
            {formatDate(item.fecha_publicacion)}
          </span>
        </div>
      )
    },
    {
      key: 'recursos',
      header: 'Recursos',
      align: 'center',
      render: (_, item) => (
        <div className="flex items-center justify-center gap-2">
          {item.archivos_count > 0 && (
            <StatusBadge
              label={`${item.archivos_count} ${item.archivos_count === 1 ? 'archivo' : 'archivos'}`}
              colorClasses="bg-info-ring text-info-dark"
            />
          )}
          {item.enlaces_count > 0 && (
            <StatusBadge
              label={`${item.enlaces_count} ${item.enlaces_count === 1 ? 'enlace' : 'enlaces'}`}
              colorClasses="bg-morado-ring text-morado-dark"
            />
          )}
          {item.archivos_count === 0 && item.enlaces_count === 0 && (
            <StatusBadge
              label="Sin recursos"
              colorClasses="bg-gris-light text-gris-una"
            />
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

