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
import type { EvidenceSearchResult } from '@/Types/EvidenceSearchTypes';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import { EVIDENCE_STATUS_BADGE } from '@/Constants/StatusBadges';
import { EvidenceResourcesModal } from './EvidenceResourcesModal';
import { BADGE_COLORS } from '@/Constants/StatusBadges';
import { formatDateShort } from '@/Utils/DateUtils';
import { TABLE_COLUMN_WIDTHS } from '@/Constants/Components';


export interface EvidenceSearchResultsTableProps {
  results: EvidenceSearchResult[];
  loading?: boolean;
  onViewDetails: (evidenceId: number) => void;
  itemsPerPage?: number;
  isFlexible?: boolean;
}

export const EvidenceSearchResultsTable: React.FC<EvidenceSearchResultsTableProps> = ({
  results,
  loading = false,
  onViewDetails,
  itemsPerPage = TABLE_PAGE_SIZE.standard,
  isFlexible = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [resourcesModal, setResourcesModal] = useState<{ criterioNomenclatura: string; evidencias: EvidenceSearchResult[] } | null>(null);

  const openResourcesModal = useCallback((item: EvidenceSearchResult) => {
    const evidenciasDelCriterio = results.filter(r => r.criterio_id === item.criterio_id);
    setResourcesModal({ criterioNomenclatura: item.criterio_nomenclatura, evidencias: evidenciasDelCriterio });
  }, [results]);

  const closeResourcesModal = useCallback(() => {
    setResourcesModal(null);
  }, []);
  
  // Función para truncar texto
  const truncateText = useCallback((text: string, maxLength: number = 20): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);

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
      header: 'Entregable',
      align: 'left',
      width: firstColumn.width,
      render: (_, item) => (
        <div className="flex flex-col">
          <div className="flex flex-row items-baseline gap-1.5">
            <p className={`font-sans antialiased font-bold leading-normal text-negro-una-2 shrink-0 ${TYPOGRAPHY.table.cell}`} title={item.criterio_nomenclatura}>
              {truncateText(item.criterio_nomenclatura, firstColumn.maxLength)}
            </p>
            <p className={`font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`} title={item.criterio_descripcion}>
              {truncateText(item.criterio_descripcion, firstColumn.maxLength)}
            </p>
          </div>
          <p className={`${TYPOGRAPHY.table.helper} text-gris-una mt-1.5 -mb-0.5`}>
            {formatDateShort(item.fecha_publicacion)}
          </p>
        </div>
      )
    },
    {
      key: 'responsables',
      header: 'Responsables',
      align: 'left',
      render: (_, item) => {
        const count = item.responsables.length;
        return (
          <div className="flex flex-col items-start">
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
      key: 'recursos',
      header: 'Recursos',
      align: 'left',
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, item) => {
        const total = item.archivos_count + item.enlaces_count;
        return (
          <div className="flex items-start">
            {total > 0 ? (
              <StatusBadge
                label={`${total} ${total === 1 ? 'recurso' : 'recursos'}`}
                colorClasses={BADGE_COLORS.info.colorClasses}
              />
            ) : (
              <StatusBadge
                label="Sin recursos"
                colorClasses={BADGE_COLORS.gris.colorClasses}
              />
            )}
          </div>
        );
      }
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'left',
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, item) => (
        <div className="flex items-start">
          <StatusBadge
            label={EVIDENCE_STATUS_BADGE[item.estado].label}
            colorClasses={EVIDENCE_STATUS_BADGE[item.estado].colorClasses}
          />
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (_, item) => (
        <div className="flex items-center justify-center gap-2">
          <TableActionButton
            action="view"
            tooltip="Ver detalles"
            onClick={() => onViewDetails(item.evidencia_id)}
          />
        </div>
      )
    },
  ], [onViewDetails, openResourcesModal, results, isFlexible]);

  return (
    <>
      <DataTable
        data={paginatedData as any}
        columns={columns as any}
        title=""
        searchable={false}
        loading={loading}
        emptyMessage="No existen elementos que cumplan con los filtros aplicados."
        pagination={totalPages > 1 ? {
          currentPage,
          totalPages,
          onPageChange: handlePageChange
        } : undefined}
      />
      <EvidenceResourcesModal
        isOpen={resourcesModal !== null}
        onClose={closeResourcesModal}
        evidencias={resourcesModal?.evidencias ?? []}
        criterioNomenclatura={resourcesModal?.criterioNomenclatura}
        isFlexible={isFlexible}
      />
    </>
  );
};

