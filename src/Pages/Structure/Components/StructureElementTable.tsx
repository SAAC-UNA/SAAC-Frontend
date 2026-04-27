/**
 * FlexibleElementTable - Tabla de elementos de un modelo de acreditación flexible.
 *
 * Sigue el patrón visual de StructureTable: DataTable, paginación, búsqueda debounced
 * y acciones uniformes con botones de tabla.
 */

import React, { useMemo, useRef, useState } from 'react';
import { DataTable } from '@/components/index';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { useDebounce } from '@/Hooks/UseDebounce';
import { truncateText } from '@/Utils';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import type { FlexibleElement } from '@/Types/StructureModelTypes';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { TABLE_COLUMN_WIDTHS } from '@/Constants/Components';
import {
  BADGE_COLORS,
  getFlexibleCategoryBadgeColor,
} from '@/Constants/StatusBadges';
import { FlexibleElementDetail } from './StructureElementDetailModal';

interface FlexibleElementTableProps {
  elements: FlexibleElement[];
  isLoading: boolean;
  searchQuery?: string;
  onEdit?: (element: FlexibleElement) => void;
  onDelete?: (element: FlexibleElement) => void;
  onToggleActive?: (element: FlexibleElement) => void;
  itemsPerPage?: number;
}

export const FlexibleElementTable: React.FC<FlexibleElementTableProps> = ({
  elements,
  isLoading,
  searchQuery = '',
  onEdit,
  onDelete,
  onToggleActive,
  itemsPerPage = TABLE_PAGE_SIZE.standard,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    element: FlexibleElement | null;
  }>({ isOpen: false, element: null });

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const firstColumn = useFirstColumnConfig();

  // Reset de página cuando cambia la búsqueda debounced.
  const prevDebouncedSearch = useRef(debouncedSearchQuery);
  if (prevDebouncedSearch.current !== debouncedSearchQuery) {
    prevDebouncedSearch.current = debouncedSearchQuery;
    setCurrentPage(1);
  }

  const normalizeSearchText = (value?: string | null): string => {
    if (!value) return '';
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  };

  const filteredElements = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return elements;

    const query = normalizeSearchText(debouncedSearchQuery);

    return elements.filter((element) =>
      normalizeSearchText(element.tipo).includes(query)
      || normalizeSearchText(element.nomenclatura).includes(query)
      || normalizeSearchText(element.descripcion).includes(query)
      || normalizeSearchText(element.categoria).includes(query)
      || normalizeSearchText(element.nombre).includes(query)
      || normalizeSearchText(element.activo ? 'Activo' : 'Inactivo').includes(query),
    );
  }, [debouncedSearchQuery, elements]);

  const safeItemsPerPage = Number.isFinite(itemsPerPage) && itemsPerPage > 0
    ? Math.floor(itemsPerPage)
    : TABLE_PAGE_SIZE.standard;

  const { totalPages, paginatedData, boundedCurrentPage } = useMemo(() => {
    const total = Math.max(1, Math.ceil(filteredElements.length / safeItemsPerPage));
    const boundedPage = Math.min(currentPage, total);
    const paginated = filteredElements.slice(
      (boundedPage - 1) * safeItemsPerPage,
      boundedPage * safeItemsPerPage,
    );

    return {
      totalPages: total,
      paginatedData: paginated,
      boundedCurrentPage: boundedPage,
    };
  }, [filteredElements, currentPage, safeItemsPerPage]);

  if (currentPage !== boundedCurrentPage) {
    setCurrentPage(boundedCurrentPage);
  }

  const columns: DataTableColumn<FlexibleElement>[] = [
    {
      key: 'descripcion',
      header: 'Identificador',
      align: 'left',
      width: firstColumn.width,
      render: (_, element) => {
        const hasNombre = Boolean(element.nombre);
        const hasDesc = Boolean(element.descripcion);

        if (hasNombre && hasDesc) {
          return (
            <div className="flex flex-col">
              <p
                className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
                title={element.nombre!}
              >
                {truncateText(element.nombre, firstColumn.maxLength)}
              </p>
              <p
                className={`${TYPOGRAPHY.table.helper} text-gris-una mt-0.5`}
                title={element.descripcion!}
              >
                {truncateText(element.descripcion, firstColumn.maxLength)}
              </p>
            </div>
          );
        }

        if (hasNombre) {
          return (
            <p
              className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
              title={element.nombre!}
            >
              {truncateText(element.nombre, firstColumn.maxLength)}
            </p>
          );
        }

        if (hasDesc) {
          return (
            <p
              className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
              title={element.descripcion!}
            >
              {truncateText(element.descripcion, firstColumn.maxLength)}
            </p>
          );
        }

        return <span className={`${TYPOGRAPHY.table.cell} text-gris-una`}>—</span>;
      },
    },
    {
      key: 'tipo',
      header: 'Tipo',
      align: 'left',
      width: TABLE_COLUMN_WIDTHS.actionsLarge,
      render: (_, element) => (
        <div className="flex flex-col">
          <p
            className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
          >
            {element.tipo}
          </p>
          {element.nomenclatura && (
            <p className={`${TYPOGRAPHY.table.helper} text-gris-una-2 mt-0.5`}>
              {element.nomenclatura}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      align: 'center',
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, element) => (
        <div className="flex justify-center">
          {element.categoria ? (
            <StatusBadge
              label={element.categoria}
              colorClasses={getFlexibleCategoryBadgeColor(element.categoria)}
            />
          ) : (
            <span className={`${TYPOGRAPHY.table.cell} text-gris-una`}>-</span>
          )}
        </div>
      ),
    },
    {
      key: 'activo',
      header: 'Estado',
      align: 'center',
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, element) => (
        <div className="flex justify-center">
          <StatusBadge
            label={element.activo ? 'Activo' : 'Inactivo'}
            colorClasses={
              element.activo
                ? BADGE_COLORS.verde.colorClasses
                : BADGE_COLORS.error.colorClasses
            }
            badgeClassName="min-w-[76px] justify-center text-center"
          />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      width: TABLE_COLUMN_WIDTHS.actionsLarge,
      render: (_, element) => {
        const parent = element.padre_id
          ? elements.find((el) => el.elemento_id === element.padre_id)
          : null;

        const canActivate = element.activo || !parent || parent.activo;

        return (
          <div className="flex items-center justify-center gap-2">
            <TableActionButton
              action="view"
              tooltip="Ver detalles"
              onClick={() => setDetailModal({ isOpen: true, element })}
            />
            <TableActionButton
              action="edit"
              tooltip="Editar elemento"
              onClick={() => onEdit?.(element)}
            />
            <TableActionButton
              action="power"
              isActive={element.activo}
              tooltip={
                !canActivate
                  ? 'No se puede activar: el padre está inactivo'
                  : element.activo
                    ? 'Inactivar elemento'
                    : 'Activar elemento'
              }
              onClick={() => onToggleActive?.(element)}
              disabled={!canActivate}
            />
            <TableActionButton
              action="delete"
              tooltip="Eliminar elemento"
              onClick={() => onDelete?.(element)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        data={paginatedData as any}
        columns={columns as any}
        title=""
        searchable={false}
        pagination={
          totalPages > 1
            ? {
              currentPage: boundedCurrentPage,
              totalPages,
              onPageChange: setCurrentPage,
            }
            : undefined
        }
        loading={isLoading}
        emptyMessage={
          debouncedSearchQuery
            ? `No se encontraron elementos que coincidan con "${debouncedSearchQuery}"`
            : 'No hay elementos creados aún. Crea el primer elemento.'
        }
      />

      <FlexibleElementDetail
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, element: null })}
        element={detailModal.element}
        elements={elements}
      />
    </>
  );
};
