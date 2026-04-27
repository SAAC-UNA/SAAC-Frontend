/**
 * CampusList - Tabla CRUD de Sedes.
 */

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { DataTable } from '@/Components/Ui/Table/DataTable';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { DeleteConfirmationModal } from '@/Components/Ui/Modals/DeleteConfirmationModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import { useCampuses } from '@/Hooks/UseCampuses';
import { useAuth } from '@/Context/AuthContext';
import { useToast } from '@/Context/ToastContext';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { BADGE_COLORS } from '@/Constants/StatusBadges';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { cn } from '@/Utils/ClassNames';
import { truncateText } from '@/Utils';
import { CampusFormModal } from './CampusFormModal';
import type { Campus } from '@/Types/InstitutionalStructureTypes';

interface Props {
  searchQuery: string;
  refreshSignal: number;
}

export const CampusList: React.FC<Props> = ({ searchQuery, refreshSignal }) => {
  const { campuses, isLoading, createCampus, updateCampus, deleteCampus, loadCampuses } = useCampuses();
  const { canAccess } = useAuth();
  const { showToast } = useToast();
  const firstColumn = useFirstColumnConfig();

  const canEdit   = canAccess({ requireAnyPermissions: ['campuses.edit'] });
  const canDelete = canAccess({ requireAnyPermissions: ['campuses.delete'] });

  // ── Pagination ──────────────────────────────────────────────────────────────

  const itemsPerPage = TABLE_PAGE_SIZE.standard;
  const [currentPage, setCurrentPage] = useState(1);
  const prevLength = useRef(campuses.length);
  prevLength.current = campuses.length;

  const filteredCampuses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return campuses;

    return campuses.filter((item) => {
      const universityName = item.university?.nombre ?? '';
      return (
        item.nombre.toLowerCase().includes(query)
        || universityName.toLowerCase().includes(query)
      );
    });
  }, [campuses, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCampuses.length / itemsPerPage));
  const boundedPage = Math.min(currentPage, totalPages);
  if (boundedPage !== currentPage) setCurrentPage(boundedPage);

  const paginated = useMemo(() => {
    const start = (boundedPage - 1) * itemsPerPage;
    return filteredCampuses.slice(start, start + itemsPerPage);
  }, [filteredCampuses, boundedPage, itemsPerPage]);

  // ── Modal state ─────────────────────────────────────────────────────────────

  const [formModal, setFormModal] = useState<{ isOpen: boolean; item: Campus | null }>({ isOpen: false, item: null });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; item: Campus | null; loading: boolean }>({ isOpen: false, item: null, loading: false });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    if (refreshSignal <= 0) return;
    loadCampuses();
  }, [loadCampuses, refreshSignal]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;
    setDeleteModal((p) => ({ ...p, loading: true }));
    const result = await deleteCampus(deleteModal.item.sede_id);
    setDeleteModal({ isOpen: false, item: null, loading: false });
    if (result.success) {
      setSuccessModal({ isOpen: true, title: 'Sede eliminada', message: 'La sede fue eliminada correctamente.' });
    } else {
      showToast({ type: 'error', title: 'No se pudo eliminar', message: result.error });
    }
  };

  // ── Columns ──────────────────────────────────────────────────────────────────

  const columns: DataTableColumn<Campus>[] = useMemo(() => [
    {
      key: 'nombre',
      header: 'Nombre',
      align: 'left',
      width: firstColumn.width,
      render: (_, item) => (
        <span
          className={cn('font-bold text-negro-una-2', TYPOGRAPHY.table.cell)}
          title={item.nombre}
        >
          {truncateText(item.nombre, firstColumn.maxLength)}
        </span>
      ),
    },
    {
      key: 'university',
      header: 'Universidad',
      align: 'left',
      render: (_, item) => (
        <span className={cn('text-negro-una-2', TYPOGRAPHY.table.cell)}>
          {truncateText(item.university?.nombre ?? '—', 40)}
        </span>
      ),
    },
    {
      key: 'activo',
      header: 'Estado',
      align: 'left',
      render: (_, item) => (
        <StatusBadge
          label={item.activo ? 'Activo' : 'Inactivo'}
          colorClasses={item.activo ? BADGE_COLORS.verde.colorClasses : BADGE_COLORS.error.colorClasses}
        />
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      render: (_, item) => (
        <div className="flex justify-end gap-1">
          {canEdit && (
            <TableActionButton
              action="edit"
              tooltip="Editar"
              onClick={() => setFormModal({ isOpen: true, item })}
            />
          )}
          {canDelete && (
            <TableActionButton
              action="delete"
              tooltip="Eliminar"
              onClick={() => setDeleteModal({ isOpen: true, item, loading: false })}
            />
          )}
        </div>
      ),
    },
  ], [firstColumn, canEdit, canDelete]);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <DataTable
        data={paginated as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn<Record<string, unknown>>[]}
        searchable={false}
        loading={isLoading}
        pagination={{
          currentPage: boundedPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        emptyMessage="No hay sedes registradas."
      />

      <CampusFormModal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, item: null })}
        campus={formModal.item}
        onConfirm={async (form) => {
          if (formModal.item) {
            return updateCampus(formModal.item.sede_id, form);
          }
          const result = await createCampus(form);
          if (result.success) setCurrentPage(1);
          return result;
        }}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar sede"
        itemName={deleteModal.item?.nombre}
        isLoading={deleteModal.loading}
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((p) => ({ ...p, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
      />
    </>
  );
};
