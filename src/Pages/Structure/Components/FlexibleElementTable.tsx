/**
 * FlexibleElementTable - Tabla de elementos de un modelo de acreditación flexible.
 *
 * Sigue el mismo patrón que StructureTable: DataTable, paginación, búsqueda debounced,
 * misma tipografía y badges del sistema.
 *
 * Columnas: Tipo, Nomenclatura, Descripción, Categoría, Estado, Acciones.
 * Acciones: ver, editar, activar/desactivar, eliminar (sin "agregar hijo").
 */

import React, { useState, useMemo, useRef } from 'react';
import { DataTable } from '@/components/index';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { useDebounce } from '@/Hooks/UseDebounce';
import { truncateText } from '@/Utils';
import { cn } from '@/Utils/ClassNames';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import type { FlexibleElement } from '@/Types/StructureModelTypes';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { Modal } from '@/Components/Ui/Modals/Modal';

interface FlexibleElementTableProps {
  elements: FlexibleElement[];
  isLoading: boolean;
  searchQuery?: string;
  onEdit?: (el: FlexibleElement) => void;
  onDelete?: (el: FlexibleElement) => void;
  onToggleActive?: (el: FlexibleElement) => void;
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

  // Reset página al cambiar búsqueda — patrón derived state (igual que StructureTable)
  const prevDebouncedSearch = useRef(debouncedSearchQuery);
  if (prevDebouncedSearch.current !== debouncedSearchQuery) {
    prevDebouncedSearch.current = debouncedSearchQuery;
    setCurrentPage(1);
  }

  const normalizeSearchText = (value?: string | null): string => {
    if (!value) return '';
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  };

  const filteredElements = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return elements;
    const query = normalizeSearchText(debouncedSearchQuery);
    return elements.filter(el =>
      normalizeSearchText(el.tipo).includes(query) ||
      normalizeSearchText(el.nomenclatura).includes(query) ||
      normalizeSearchText(el.descripcion).includes(query) ||
      normalizeSearchText(el.categoria).includes(query) ||
      normalizeSearchText(el.activo ? 'Activo' : 'Inactivo').includes(query)
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
      boundedPage * safeItemsPerPage
    );
    return { totalPages: total, paginatedData: paginated, boundedCurrentPage: boundedPage };
  }, [filteredElements, currentPage, safeItemsPerPage]);

  if (currentPage !== boundedCurrentPage) setCurrentPage(boundedCurrentPage);

  const getParentLabel = (el: FlexibleElement): string => {
    if (!el.padre_id) return 'Sin padre';
    const parent = elements.find(e => e.elemento_id === el.padre_id);
    if (!parent) return 'Sin padre';
    return parent.nomenclatura ? `${parent.nomenclatura} – ${parent.tipo}` : parent.tipo;
  };

  const columns: DataTableColumn<FlexibleElement>[] = [
    {
      key: 'descripcion',
      header: 'Identificador',
      align: 'left',
      width: firstColumn.width,
      render: (_, el) => {
        const hasNombre = Boolean(el.nombre);
        const hasDesc = Boolean(el.descripcion);
        if (hasNombre && hasDesc) {
          return (
            <div className="flex flex-col">
              <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`} title={el.nombre!}>
                {truncateText(el.nombre, firstColumn.maxLength)}
              </p>
              <p className={`${TYPOGRAPHY.table.helper} text-gris-una mt-0.5`} title={el.descripcion!}>
                {truncateText(el.descripcion, firstColumn.maxLength)}
              </p>
            </div>
          );
        }
        if (hasNombre) {
          return (
            <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`} title={el.nombre!}>
              {truncateText(el.nombre, firstColumn.maxLength)}
            </p>
          );
        }
        if (hasDesc) {
          return (
            <p className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`} title={el.descripcion!}>
              {truncateText(el.descripcion, firstColumn.maxLength)}
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
      render: (_, el) => (
        <div className="flex flex-col">
          <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
            {el.tipo}
          </p>
          {el.nomenclatura && (
            <p className={`${TYPOGRAPHY.table.helper} text-gris-una-2 mt-0.5`}>
              {el.nomenclatura}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      align: 'center',
      width: '10%',
      render: (_, el) => (
        <div className="flex justify-center">
          {el.categoria ? (
            <StatusBadge label={el.categoria} colorClasses="bg-azul-una/10 text-azul-una" />
          ) : (
            <span className={`${TYPOGRAPHY.table.cell} text-gris-una`}>—</span>
          )}
        </div>
      ),
    },
    {
      key: 'activo',
      header: 'Estado',
      align: 'center',
      width: '10%',
      render: (_, el) => (
        <div className="flex justify-center">
          <StatusBadge
            label={el.activo ? 'Activo' : 'Inactivo'}
            colorClasses={el.activo ? 'text-verde-dark bg-verde-ring' : 'text-error-dark bg-error-ring'}
            badgeClassName="min-w-[76px] justify-center text-center"
          />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      width: '14%',
      render: (_, el) => {
        const parentEl = el.padre_id ? elements.find(e => e.elemento_id === el.padre_id) : null;
        const canActivate = el.activo || !parentEl || parentEl.activo;
        return (
          <div className="flex items-center justify-center gap-2">
            <TableActionButton
              action="view"
              tooltip="Ver detalles"
              onClick={() => setDetailModal({ isOpen: true, element: el })}
            />
            <TableActionButton
              action="edit"
              tooltip="Editar elemento"
              onClick={() => onEdit?.(el)}
            />
            <TableActionButton
              action="power"
              isActive={el.activo}
              tooltip={
                !canActivate
                  ? 'No se puede activar: el padre está inactivo'
                  : el.activo
                  ? 'Inactivar elemento'
                  : 'Activar elemento'
              }
              onClick={() => onToggleActive?.(el)}
              disabled={!canActivate}
            />
            <TableActionButton
              action="delete"
              tooltip="Eliminar elemento"
              onClick={() => onDelete?.(el)}
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
            ? { currentPage: boundedCurrentPage, totalPages, onPageChange: setCurrentPage }
            : undefined
        }
        loading={isLoading}
        emptyMessage={
          debouncedSearchQuery
            ? `No se encontraron elementos que coincidan con "${debouncedSearchQuery}"`
            : 'No hay elementos creados aún. ¡Crea el primer elemento!'
        }
      />

      {/* Modal de detalle */}
      {detailModal.element && (
        <Modal
          isOpen={detailModal.isOpen}
          onClose={() => setDetailModal({ isOpen: false, element: null })}
          variant="info"
          size="lg"
          maxHeight="lg"
          title={detailModal.element.nomenclatura || detailModal.element.tipo}
          subtitle={detailModal.element.tipo}
          heroIcon={
            <div className="w-11 h-11 rounded-[10px] flex items-center justify-center bg-white/20 border border-white/35 text-white font-bold text-base select-none">
              {detailModal.element.tipo.slice(0, 2).toUpperCase()}
            </div>
          }
          showCancel={false}
          showConfirm={false}
        >
          <div className="flex flex-col gap-4">

            {/* IDENTIFICACIÓN */}
            <div>
              <DetailSectionLabel label="Identificación" />
              <div className="border border-gray-200 rounded-corner p-4 grid grid-cols-2 gap-x-6 gap-y-4">
                <DetailInfoCell label="Tipo de elemento">
                  <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2 font-medium')}>
                    {detailModal.element.tipo}
                  </span>
                </DetailInfoCell>
                <DetailInfoCell label="Estado">
                  <span className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold',
                    TYPOGRAPHY.badge,
                    detailModal.element.activo
                      ? 'bg-verde-light text-verde-dark border border-verde-ring'
                      : 'bg-error-light text-error-dark border border-error-ring',
                  )}>
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      detailModal.element.activo ? 'bg-verde' : 'bg-error'
                    )} />
                    {detailModal.element.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </DetailInfoCell>
                {detailModal.element.nomenclatura && (
                  <DetailInfoCell label="Nomenclatura">
                    <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>
                      {detailModal.element.nomenclatura}
                    </span>
                  </DetailInfoCell>
                )}
                {detailModal.element.categoria && (
                  <DetailInfoCell label="Categoría">
                    <StatusBadge
                      label={detailModal.element.categoria}
                      colorClasses="bg-azul-una/10 text-azul-una"
                    />
                  </DetailInfoCell>
                )}
                {detailModal.element.descripcion && (
                  <DetailInfoCell label="Descripción" className="col-span-2">
                    <p className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2 leading-relaxed')}>
                      {detailModal.element.descripcion}
                    </p>
                  </DetailInfoCell>
                )}
              </div>
            </div>

            {/* JERARQUÍA */}
            <div>
              <DetailSectionLabel label="Jerarquía" />
              <div className="border border-gray-200 rounded-corner p-4">
                <DetailInfoCell label="Elemento padre">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-azul-una shrink-0" />
                    <span className={cn(TYPOGRAPHY.table.cell, 'text-gris-una-2')}>
                      {getParentLabel(detailModal.element)}
                    </span>
                  </div>
                </DetailInfoCell>
              </div>
            </div>

          </div>
        </Modal>
      )}
    </>
  );
};

// ── Sub-components for detail modal layout ────────────────────────────────────

const DetailSectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <p className="text-xs font-semibold uppercase tracking-wider text-gris-una mb-2">{label}</p>
);

const DetailInfoCell: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
  <div className={cn('flex flex-col gap-1', className)}>
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.table.header)}>
      {label}
    </span>
    <div>{children}</div>
  </div>
);
