/**
 * CareerList - Tabla CRUD de Carreras.
 */

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { DataTable } from '@/Components/Ui/Table/DataTable';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { DeleteConfirmationModal } from '@/Components/Ui/Modals/DeleteConfirmationModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import { useCareers } from '@/Hooks/UseCareers';
import { useAuth } from '@/Context/AuthContext';
import { useToast } from '@/Context/ToastContext';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { BADGE_COLORS } from '@/Constants/StatusBadges';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { cn } from '@/Utils/ClassNames';
import { truncateText } from '@/Utils';
import { CareerFormModal } from './CareerFormModal';
import type { Career } from '@/Types/InstitutionalStructureTypes';

interface Props {
  searchQuery: string;
  refreshSignal: number;
}

export const CareerList: React.FC<Props> = ({ searchQuery, refreshSignal }) => {
  const { careers, isLoading, createCareer, updateCareer, deleteCareer, setCareerActive, loadCareers } = useCareers();
  const { canAccess } = useAuth();
  const { showToast } = useToast();
  const firstColumn = useFirstColumnConfig();

  const canEdit   = canAccess({ requireAnyPermissions: ['carreras.edit'] });
  const canDelete = canAccess({ requireAnyPermissions: ['carreras.delete'] });

  // ── Pagination ──────────────────────────────────────────────────────────────

  const itemsPerPage = TABLE_PAGE_SIZE.standard;
  const [currentPage, setCurrentPage] = useState(1);
  const prevLength = useRef(careers.length);
  prevLength.current = careers.length;

  const filteredCareers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return careers;

    return careers.filter((item) => {
      const campuses = item.campuses?.map((campus) => campus.nombre).join(' ') ?? '';
      return (
        item.nombre.toLowerCase().includes(query)
        || campuses.toLowerCase().includes(query)
      );
    });
  }, [careers, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCareers.length / itemsPerPage));
  const boundedPage = Math.min(currentPage, totalPages);
  if (boundedPage !== currentPage) setCurrentPage(boundedPage);

  const paginated = useMemo(() => {
    const start = (boundedPage - 1) * itemsPerPage;
    return filteredCareers.slice(start, start + itemsPerPage);
  }, [filteredCareers, boundedPage, itemsPerPage]);

  // ── Modal state ─────────────────────────────────────────────────────────────

  const [formModal, setFormModal] = useState<{ isOpen: boolean; item: Career | null }>({ isOpen: false, item: null });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; item: Career | null; loading: boolean }>({ isOpen: false, item: null, loading: false });
  const [toggleModal, setToggleModal] = useState<{ isOpen: boolean; item: Career | null; loading: boolean }>({ isOpen: false, item: null, loading: false });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    if (refreshSignal <= 0) return;
    loadCareers();
  }, [loadCareers, refreshSignal]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;
    setDeleteModal((p) => ({ ...p, loading: true }));
    const result = await deleteCareer(deleteModal.item.carrera_id);
    setDeleteModal({ isOpen: false, item: null, loading: false });
    if (result.success) {
      setSuccessModal({ isOpen: true, title: 'Carrera eliminada', message: 'La carrera fue eliminada correctamente.' });
    } else {
      showToast({ type: 'error', title: 'No se pudo eliminar', message: result.error });
    }
  };

  const handleToggleConfirm = async () => {
    if (!toggleModal.item) return;
    setToggleModal((p) => ({ ...p, loading: true }));
    const newActive = !toggleModal.item.activo;
    const result = await setCareerActive(toggleModal.item.carrera_id, newActive);
    setToggleModal({ isOpen: false, item: null, loading: false });
    if (result.success) {
      setSuccessModal({
        isOpen: true,
        title: newActive ? 'Carrera activada' : 'Carrera inactivada',
        message: `La carrera fue ${newActive ? 'activada' : 'inactivada'} correctamente.`,
      });
    } else {
      showToast({ type: 'error', title: 'No se pudo actualizar el estado', message: result.error });
    }
  };

  // ── Columns ──────────────────────────────────────────────────────────────────

  const columns: DataTableColumn<Career>[] = useMemo(() => [
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
      key: 'sedes',
      header: 'Sedes',
      align: 'left',
      render: (_, item) => {
        const sedes = item.campuses?.map((c) => c.nombre).join(', ') ?? '—';
        return (
          <span className={cn('text-gris-una', TYPOGRAPHY.table.cell)} title={sedes}>
            {truncateText(sedes, 50)}
          </span>
        );
      },
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
          {canEdit && (
            <TableActionButton
              action="power"
              tooltip={item.activo ? 'Inactivar' : 'Activar'}
              isActive={item.activo}
              onClick={() => setToggleModal({ isOpen: true, item, loading: false })}
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
        emptyMessage="No hay carreras registradas."
      />

      <CareerFormModal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, item: null })}
        career={formModal.item}
        onConfirm={async (form) => {
          if (formModal.item) {
            return updateCareer(formModal.item.carrera_id, form);
          }
          const result = await createCareer(form);
          if (result.success) setCurrentPage(1);
          return result;
        }}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar carrera"
        itemName={deleteModal.item?.nombre}
        isLoading={deleteModal.loading}
      />

      <DeleteConfirmationModal
        isOpen={toggleModal.isOpen}
        onClose={() => setToggleModal({ isOpen: false, item: null, loading: false })}
        onConfirm={handleToggleConfirm}
        title={toggleModal.item?.activo ? 'Inactivar carrera' : 'Activar carrera'}
        message={
          toggleModal.item?.activo
            ? <>¿Inactivar "<strong>{toggleModal.item?.nombre}</strong>"?</>
            : <>¿Activar "<strong>{toggleModal.item?.nombre}</strong>"?</>
        }
        confirmLabel={toggleModal.item?.activo ? 'Inactivar' : 'Activar'}
        variant={toggleModal.item?.activo ? 'danger' : 'warning'}
        isLoading={toggleModal.loading}
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
