/**
 * AccreditationCyclesPage - Gestión de Ciclos de Acreditación (HU-030)
 *
 * Tabla paginada con CRUD completo:
 *  - Crear ciclo (Administrador / Superusuario)
 *  - Editar ciclo (solo si estado === 'activo'; Administrador / Superusuario)
 *  - Eliminar ciclo con confirmación por nombre (Administrador / Superusuario)
 *  - Reactivar ciclo (solo Superusuario)
 */

import React, { useMemo, useState, useRef } from 'react';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import {
  PageHeader,
  Button,
  StatusBadge,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/Components/Ui/Index';
import { DataTable } from '@/Components/Ui/Table/DataTable';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { AccreditationCycleFormModal } from './Components/AccreditationCycleFormModal';
import { AccreditationCycleDeleteModal } from './Components/AccreditationCycleDeleteModal';
import { AccreditationCycleDetailModal } from './Components/AccreditationCycleDetailModal';
import { useAccreditationCycles } from '@/Hooks/UseAccreditationCycles';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import { useAuth } from '@/Context/AuthContext';
import { useToast } from '@/Context/ToastContext';
import { truncateText } from '@/Utils';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_TRUNCATE } from '@/Constants/TableTruncate';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { TABLE_ACTION_BUTTON } from '@/Constants/Components';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { cn } from '@/Utils/ClassNames';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import type {
  AccreditationCycle,
  AccreditationCycleStatus,
  CreateAccreditationCycleForm,
  EditAccreditationCycleForm,
} from '@/Types/AccreditationCycleTypes';

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<AccreditationCycleStatus, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  completado: 'Completado',
};

const STATUS_COLOR: Record<AccreditationCycleStatus, string> = {
  activo: 'text-verde-dark bg-verde-ring',
  inactivo: 'text-error-dark bg-error-ring',
  completado: 'text-info-dark bg-info-ring',
};

// ── Page ──────────────────────────────────────────────────────────────────────

const AccreditationCyclesPage: React.FC = () => {
  const { isSuperUser, isAdmin } = useAuth();
  const { showToast } = useToast();
  const firstColumn = useFirstColumnConfig();

  const {
    cycles,
    isLoading,
    createCycle,
    updateCycle,
    deleteCycle,
    reactivateCycle,
  } = useAccreditationCycles();

  const [currentPage, setCurrentPage] = useState(1);
  const prevCyclesLength = useRef(cycles.length);

  const itemsPerPage = TABLE_PAGE_SIZE.standard;
  const totalPages = Math.max(1, Math.ceil(cycles.length / itemsPerPage));
  const boundedCurrentPage = Math.min(currentPage, totalPages);
  if (boundedCurrentPage !== currentPage) {
    setCurrentPage(boundedCurrentPage);
  }

  // When cycles are added, go to page 1 to show the new item at the top
  if (cycles.length > prevCyclesLength.current) {
    prevCyclesLength.current = cycles.length;
    setCurrentPage(1);
  } else {
    prevCyclesLength.current = cycles.length;
  }

  const paginatedCycles = useMemo(() => {
    const start = (boundedCurrentPage - 1) * itemsPerPage;
    return cycles.slice(start, start + itemsPerPage);
  }, [cycles, boundedCurrentPage, itemsPerPage]);

  const canCreate = isAdmin() || isSuperUser();
  const canEdit = isAdmin() || isSuperUser();
  const canDelete = isAdmin() || isSuperUser();
  const canReactivate = isSuperUser();

  // ── Modal state ───────────────────────────────────────────────────────────

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    cycle: AccreditationCycle | null;
  }>({ isOpen: false, cycle: null });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    cycle: AccreditationCycle | null;
    loading: boolean;
  }>({ isOpen: false, cycle: null, loading: false });

  const [reactivateModal, setReactivateModal] = useState<{
    isOpen: boolean;
    cycle: AccreditationCycle | null;
    loading: boolean;
  }>({ isOpen: false, cycle: null, loading: false });

  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    cycle: AccreditationCycle | null;
  }>({ isOpen: false, cycle: null });

  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateConfirm = async (form: CreateAccreditationCycleForm | EditAccreditationCycleForm) =>
    await createCycle(form as CreateAccreditationCycleForm);

  const handleEditConfirm = async (form: CreateAccreditationCycleForm | EditAccreditationCycleForm) => {
    if (!formModal.cycle) return { success: false, error: 'Sin ciclo seleccionado' };
    return updateCycle(formModal.cycle.ciclo_acreditacion_id, form as EditAccreditationCycleForm);
  };

  const handleDeleteConfirm = async (confirmacion: string) => {
    if (!deleteModal.cycle) return;
    setDeleteModal(p => ({ ...p, loading: true }));
    const result = await deleteCycle(deleteModal.cycle.ciclo_acreditacion_id, confirmacion);
    setDeleteModal({ isOpen: false, cycle: null, loading: false });
    if (result.success) {
      setSuccessModal({ isOpen: true, title: 'Ciclo eliminado', message: 'El ciclo fue eliminado exitosamente.' });
    } else {
      showToast({ type: 'error', title: result.error ?? 'Error al eliminar el ciclo' });
    }
  };

  const confirmReactivate = async () => {
    if (!reactivateModal.cycle) return;
    setReactivateModal(p => ({ ...p, loading: true }));
    const cycle = reactivateModal.cycle;
    const result = await reactivateCycle(cycle.ciclo_acreditacion_id);
    setReactivateModal({ isOpen: false, cycle: null, loading: false });
    if (result.success) {
      setSuccessModal({
        isOpen: true,
        title: 'Ciclo reactivado',
        message: `El ciclo "${cycle.nombre}" fue reactivado correctamente.`,
      });
    } else {
      showToast({ type: 'error', title: result.error ?? 'Error al reactivar el ciclo' });
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────

  const columns: DataTableColumn<AccreditationCycle>[] = useMemo(
    () => [
      {
        key: 'nombre',
        header: 'Nombre',
        align: 'left',
        width: firstColumn.width,
        render: (_, item) => (
          <div className="flex flex-col pl-2">
            <p
              className={cn(
                'block font-sans antialiased font-bold leading-normal text-negro-una-2',
                TYPOGRAPHY.table.cell,
              )}
              title={item.nombre}
            >
              {truncateText(item.nombre, firstColumn.maxLength)}
            </p>
          </div>
        ),
      },
      {
        key: 'carrera_sede',
        header: 'Carrera – Sede',
        align: 'left',
        render: (_, item) => {
          const cs = item.carrera_sede;
          const carrera = cs?.carrera_nombre ?? '—';
          const sede = cs?.sede_nombre ?? '—';
          return (
            <div className="flex flex-col">
              <span
                className={cn(
                  'block font-sans antialiased font-normal leading-normal text-negro-una-2',
                  TYPOGRAPHY.table.cell,
                )}
                title={`${carrera} – ${sede}`}
              >
                {truncateText(carrera, TABLE_TRUNCATE.name)}
              </span>
              <span
                className={cn(
                  'block font-sans antialiased font-normal leading-normal text-gris-una',
                  TYPOGRAPHY.badge,
                )}
              >
                {truncateText(sede, TABLE_TRUNCATE.name)}
              </span>
            </div>
          );
        },
      },
      {
        key: 'modelo',
        header: 'Modelo',
        align: 'center',
        render: (_, item) => (
          <span
            className={cn(
              'block font-sans antialiased font-normal leading-normal text-negro-una-2',
              TYPOGRAPHY.table.cell,
            )}
            title={item.modelo_estructura?.nombre}
          >
            {truncateText(item.modelo_estructura?.nombre ?? '—', TABLE_TRUNCATE.name)}
          </span>
        ),
      },
      {
        key: 'estado',
        header: 'Estado',
        align: 'center',
        render: (_, item) => (
          <div className="flex justify-center">
            <StatusBadge
              label={STATUS_LABEL[item.estado]}
              colorClasses={STATUS_COLOR[item.estado]}
              size="sm"
            />
          </div>
        ),
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
              onClick={() => setViewModal({ isOpen: true, cycle: item })}
            />
            {canEdit && (
              <TableActionButton
                action="edit"
                tooltip={item.estado !== 'activo' ? 'Solo se puede editar un ciclo activo' : 'Editar ciclo'}
                onClick={() => setFormModal({ isOpen: true, cycle: item })}
                disabled={item.estado !== 'activo'}
              />
            )}
            {canReactivate && (
              <TableActionButton
                action="custom"
                customIcon={<SystemIcons.interface.refresh className={TABLE_ACTION_BUTTON.icon} />}
                customVariant="tablePower"
                tooltip={item.estado === 'activo' ? 'El ciclo ya está activo' : 'Reactivar ciclo'}
                onClick={() => setReactivateModal({ isOpen: true, cycle: item, loading: false })}
                disabled={item.estado === 'activo'}
              />
            )}
            {canDelete && (
              <TableActionButton
                action="delete"
                tooltip="Eliminar ciclo"
                onClick={() => setDeleteModal({ isOpen: true, cycle: item, loading: false })}
              />
            )}
          </div>
        ),
      },
    ],
    [firstColumn, canEdit, canReactivate, canDelete],
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ScreenContainer>
      <PageHeader
        title="Ciclos de Acreditación"
        description="Gestiona los ciclos de acreditación por carrera y sede."
        headerExtra={
          canCreate ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFormModal({ isOpen: true, cycle: null })}
                >
                  Crear
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Crear nuevo ciclo de acreditación</TooltipContent>
            </Tooltip>
          ) : undefined
        }
      />

      <DataTable
        title=""
        data={paginatedCycles as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn<Record<string, unknown>>[]}
        loading={isLoading}
        searchable={false}
        emptyMessage="No hay ciclos de acreditación registrados."
        pagination={
          totalPages > 1
            ? {
                currentPage: boundedCurrentPage,
                totalPages,
                onPageChange: setCurrentPage,
              }
            : undefined
        }
        getRowKey={(item) =>
          String((item as unknown as AccreditationCycle).ciclo_acreditacion_id)
        }
      />

      {/* Modal detalles */}
      <AccreditationCycleDetailModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, cycle: null })}
        cycle={viewModal.cycle}
      />

      {/* Modal crear */}
      <AccreditationCycleFormModal
        isOpen={formModal.isOpen && !formModal.cycle}
        onClose={() => setFormModal({ isOpen: false, cycle: null })}
        onConfirm={handleCreateConfirm}
      />

      {/* Modal editar */}
      <AccreditationCycleFormModal
        isOpen={formModal.isOpen && !!formModal.cycle}
        onClose={() => setFormModal({ isOpen: false, cycle: null })}
        cycle={formModal.cycle}
        onConfirm={handleEditConfirm}
      />

      {/* Modal eliminar */}
      <AccreditationCycleDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, cycle: null, loading: false })}
        cycle={deleteModal.cycle}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.loading}
      />

      {/* Modal reactivar */}
      {reactivateModal.cycle && (
        <Modal
          isOpen={reactivateModal.isOpen}
          onClose={() => setReactivateModal({ isOpen: false, cycle: null, loading: false })}
          onConfirm={confirmReactivate}
          variant="success"
          title="Confirmar reactivación"
          confirmLabel="Sí, reactivar"
          cancelLabel="Cancelar"
          confirmLoading={reactivateModal.loading}
          showCancel
          showConfirm
          footerMeta="Solo Superusuario puede reactivar ciclos"
        >
          <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed')}>
            ¿Está seguro de reactivar el ciclo{' '}
            <strong className="text-negro-una">"{reactivateModal.cycle.nombre}"</strong>?
            {' '}Se establecerá como el ciclo activo para su carrera-sede.
          </p>
        </Modal>
      )}

      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
      />
    </ScreenContainer>
  );
};

export default AccreditationCyclesPage;
