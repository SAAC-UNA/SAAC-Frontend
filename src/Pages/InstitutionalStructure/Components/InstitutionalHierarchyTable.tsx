/**
 * InstitutionalHierarchyTable - Tabla jerárquica Universidad > Sede > Carrera.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from '@/Components/Ui/Table/DataTable';
import type { DataTableColumn, ExpandableChildItem } from '@/Components/Ui/Table/DataTable';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { DeleteConfirmationModal } from '@/Components/Ui/Modals/DeleteConfirmationModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import { useUniversities } from '@/Hooks/UseUniversities';
import { useCampuses } from '@/Hooks/UseCampuses';
import { useCareers } from '@/Hooks/UseCareers';
import { useAuth } from '@/Context/AuthContext';
import { useToast } from '@/Context/ToastContext';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { BADGE_COLORS } from '@/Constants/StatusBadges';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { cn } from '@/Utils/ClassNames';
import { truncateText } from '@/Utils';
import { UniversityFormModal } from './UniversityFormModal';
import { CampusFormModal } from './CampusFormModal';
import { CareerFormModal } from './CareerFormModal';
import type { Campus, Career, University } from '@/Types/InstitutionalStructureTypes';

type DeleteTarget =
  | { type: 'universidad'; item: University }
  | { type: 'sede'; item: Campus }
  | { type: 'carrera'; item: Career };

type ToggleTarget =
  | { type: 'universidad'; item: University }
  | { type: 'carrera'; item: Career };

interface Props {
  searchQuery: string;
  refreshSignal: number;
}

type UniversityRow = University & Record<string, unknown> & {
  campusCount: number;
  careerCount: number;
};

const matchesQuery = (value: string, query: string): boolean =>
  value.toLowerCase().includes(query);

export const InstitutionalHierarchyTable: React.FC<Props> = ({
  searchQuery,
  refreshSignal,
}) => {
  const {
    universities,
    isLoading: loadingUniversities,
    createUniversity,
    updateUniversity,
    deleteUniversity,
    setUniversityActive,
    loadUniversities,
  } = useUniversities();
  const {
    campuses,
    isLoading: loadingCampuses,
    updateCampus,
    deleteCampus,
    loadCampuses,
  } = useCampuses();
  const {
    careers,
    isLoading: loadingCareers,
    updateCareer,
    deleteCareer,
    setCareerActive,
    loadCareers,
  } = useCareers();

  const { canAccess } = useAuth();
  const { showToast } = useToast();
  const firstColumn = useFirstColumnConfig();

  const canEditUniversidad = canAccess({ requireAnyPermissions: ['universidades.edit'] });
  const canDeleteUniversidad = canAccess({ requireAnyPermissions: ['universidades.delete'] });
  const canEditSede = canAccess({ requireAnyPermissions: ['campuses.edit'] });
  const canDeleteSede = canAccess({ requireAnyPermissions: ['campuses.delete'] });
  const canEditCarrera = canAccess({ requireAnyPermissions: ['carreras.edit'] });
  const canDeleteCarrera = canAccess({ requireAnyPermissions: ['carreras.delete'] });

  const isLoading = loadingUniversities || loadingCampuses || loadingCareers;

  const [currentPage, setCurrentPage] = useState(1);
  const prevLength = useRef(universities.length);

  const [universityFormModal, setUniversityFormModal] = useState<{ isOpen: boolean; item: University | null }>({ isOpen: false, item: null });
  const [campusFormModal, setCampusFormModal] = useState<{ isOpen: boolean; item: Campus | null }>({ isOpen: false, item: null });
  const [careerFormModal, setCareerFormModal] = useState<{ isOpen: boolean; item: Career | null }>({ isOpen: false, item: null });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; target: DeleteTarget | null; loading: boolean }>({ isOpen: false, target: null, loading: false });
  const [toggleModal, setToggleModal] = useState<{ isOpen: boolean; target: ToggleTarget | null; loading: boolean }>({ isOpen: false, target: null, loading: false });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    if (refreshSignal <= 0) return;
    loadUniversities();
    loadCampuses();
    loadCareers();
  }, [loadCampuses, loadCareers, loadUniversities, refreshSignal]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredRows = useMemo<UniversityRow[]>(() => {
    const universityRows = universities.map((university) => {
      const relatedCampuses = campuses.filter((campus) => campus.universidad_id === university.universidad_id);
      const relatedCareers = careers.filter((career) => career.universidad_id === university.universidad_id);

      return {
        ...university,
        campusCount: relatedCampuses.length,
        careerCount: relatedCareers.length,
      };
    });

    if (!normalizedQuery) return universityRows;

    return universityRows.filter((university) => {
      if (matchesQuery(university.nombre, normalizedQuery)) return true;

      const relatedCampuses = campuses.filter((campus) => campus.universidad_id === university.universidad_id);
      if (relatedCampuses.some((campus) => matchesQuery(campus.nombre, normalizedQuery))) return true;

      return careers.some((career) =>
        career.universidad_id === university.universidad_id
        && matchesQuery(career.nombre, normalizedQuery),
      );
    });
  }, [campuses, careers, normalizedQuery, universities]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (universities.length > prevLength.current) {
    prevLength.current = universities.length;
  }
  prevLength.current = universities.length;

  const itemsPerPage = TABLE_PAGE_SIZE.standard;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const boundedPage = Math.min(currentPage, totalPages);
  if (boundedPage !== currentPage) setCurrentPage(boundedPage);

  const paginatedRows = useMemo(() => {
    const start = (boundedPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [boundedPage, filteredRows, itemsPerPage]);

  const buildCareerItem = (career: Career): ExpandableChildItem => ({
    key: `career-${career.carrera_id}`,
    content: (
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={cn('font-semibold text-negro-una-2', TYPOGRAPHY.table.cell)} title={career.nombre}>
            {truncateText(career.nombre, 48)}
          </p>
          <p className={cn('text-gris-una', TYPOGRAPHY.table.helper)}>
            Carrera
          </p>
        </div>
        <StatusBadge
          label={career.activo ? 'Activo' : 'Inactivo'}
          colorClasses={career.activo ? BADGE_COLORS.verde.colorClasses : BADGE_COLORS.error.colorClasses}
        />
      </div>
    ),
    action: (
      <div className="flex items-center gap-1">
        {canEditCarrera && (
          <TableActionButton
            action="edit"
            tooltip="Editar carrera"
            onClick={() => setCareerFormModal({ isOpen: true, item: career })}
          />
        )}
        {canEditCarrera && (
          <TableActionButton
            action="power"
            tooltip={career.activo ? 'Inactivar carrera' : 'Activar carrera'}
            isActive={career.activo}
            onClick={() => setToggleModal({ isOpen: true, target: { type: 'carrera', item: career }, loading: false })}
          />
        )}
        {canDeleteCarrera && (
          <TableActionButton
            action="delete"
            tooltip="Eliminar carrera"
            onClick={() => setDeleteModal({ isOpen: true, target: { type: 'carrera', item: career }, loading: false })}
          />
        )}
      </div>
    ),
  });

  const buildCampusChildren = (university: University): ExpandableChildItem[] => {
    const relatedCampuses = campuses.filter((campus) => campus.universidad_id === university.universidad_id);
    const relatedCareers = careers.filter((career) => career.universidad_id === university.universidad_id);

    const visibleCampuses = !normalizedQuery
      ? relatedCampuses
      : relatedCampuses.filter((campus) =>
          matchesQuery(campus.nombre, normalizedQuery)
          || matchesQuery(university.nombre, normalizedQuery),
        );

    const visibleCareers = !normalizedQuery
      ? relatedCareers
      : relatedCareers.filter((career) => matchesQuery(career.nombre, normalizedQuery));

    const campusItems: ExpandableChildItem[] = visibleCampuses.map((campus) => ({
      key: `campus-${campus.sede_id}`,
      content: (
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <p className={cn('font-semibold text-negro-una-2', TYPOGRAPHY.table.cell)} title={campus.nombre}>
              {truncateText(campus.nombre, 48)}
            </p>
            <p className={cn('text-gris-una', TYPOGRAPHY.table.helper)}>
              Sede de {university.nombre}
            </p>
          </div>
          <StatusBadge
            label={campus.activo ? 'Activo' : 'Inactivo'}
            colorClasses={campus.activo ? BADGE_COLORS.verde.colorClasses : BADGE_COLORS.error.colorClasses}
          />
        </div>
      ),
      action: (
        <div className="flex items-center gap-1">
          {canEditSede && (
            <TableActionButton
              action="edit"
              tooltip="Editar sede"
              onClick={() => setCampusFormModal({ isOpen: true, item: campus })}
            />
          )}
          {canDeleteSede && (
            <TableActionButton
              action="delete"
              tooltip="Eliminar sede"
              onClick={() => setDeleteModal({ isOpen: true, target: { type: 'sede', item: campus }, loading: false })}
            />
          )}
        </div>
      ),
    }));

    const careerItems: ExpandableChildItem[] = visibleCareers.map(buildCareerItem);

    return [...campusItems, ...careerItems];
  };

  const columns: DataTableColumn<UniversityRow>[] = useMemo(() => [
    {
      key: 'nombre',
      header: 'Universidad',
      align: 'left',
      width: firstColumn.width,
      render: (_, item) => (
        <span className={cn('font-bold text-negro-una-2', TYPOGRAPHY.table.cell)} title={item.nombre}>
          {truncateText(item.nombre, firstColumn.maxLength)}
        </span>
      ),
    },
    {
      key: 'campusCount',
      header: 'Sedes',
      align: 'center',
      render: (_, item) => (
        <span className={cn('text-negro-una-2', TYPOGRAPHY.table.cell)}>{item.campusCount}</span>
      ),
    },
    {
      key: 'careerCount',
      header: 'Carreras',
      align: 'center',
      render: (_, item) => (
        <span className={cn('text-negro-una-2', TYPOGRAPHY.table.cell)}>{item.careerCount}</span>
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
        <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
          {canEditUniversidad && (
            <TableActionButton
              action="edit"
              tooltip="Editar universidad"
              onClick={() => setUniversityFormModal({ isOpen: true, item })}
            />
          )}
          {canEditUniversidad && (
            <TableActionButton
              action="power"
              tooltip={item.activo ? 'Inactivar universidad' : 'Activar universidad'}
              isActive={item.activo}
              onClick={() => setToggleModal({ isOpen: true, target: { type: 'universidad', item }, loading: false })}
            />
          )}
          {canDeleteUniversidad && (
            <TableActionButton
              action="delete"
              tooltip="Eliminar universidad"
              onClick={() => setDeleteModal({ isOpen: true, target: { type: 'universidad', item }, loading: false })}
            />
          )}
        </div>
      ),
    },
  ], [canDeleteUniversidad, canEditSede, canEditCarrera, canDeleteSede, canDeleteCarrera, canEditUniversidad, firstColumn]);

  const handleDeleteConfirm = async () => {
    if (!deleteModal.target) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));

    let result: { success: boolean; error?: string };
    let successTitle = '';
    let successMessage = '';

    if (deleteModal.target.type === 'universidad') {
      result = await deleteUniversity(deleteModal.target.item.universidad_id);
      successTitle = 'Universidad eliminada';
      successMessage = 'La universidad fue eliminada correctamente.';
    } else if (deleteModal.target.type === 'sede') {
      result = await deleteCampus(deleteModal.target.item.sede_id);
      successTitle = 'Sede eliminada';
      successMessage = 'La sede fue eliminada correctamente.';
    } else {
      result = await deleteCareer(deleteModal.target.item.carrera_id);
      successTitle = 'Carrera eliminada';
      successMessage = 'La carrera fue eliminada correctamente.';
    }

    setDeleteModal({ isOpen: false, target: null, loading: false });

    if (result.success) {
      setSuccessModal({ isOpen: true, title: successTitle, message: successMessage });
      return;
    }

    showToast({
      type: 'error',
      title: 'No se pudo eliminar',
      message: result.error,
    });
  };

  const handleToggleConfirm = async () => {
    if (!toggleModal.target) return;

    setToggleModal((prev) => ({ ...prev, loading: true }));

    let result: { success: boolean; error?: string };
    let successTitle = '';
    let successMessage = '';

    if (toggleModal.target.type === 'universidad') {
      const nextActive = !toggleModal.target.item.activo;
      result = await setUniversityActive(toggleModal.target.item.universidad_id, nextActive);
      successTitle = nextActive ? 'Universidad activada' : 'Universidad inactivada';
      successMessage = `La universidad fue ${nextActive ? 'activada' : 'inactivada'} correctamente.`;
    } else {
      const nextActive = !toggleModal.target.item.activo;
      result = await setCareerActive(toggleModal.target.item.carrera_id, nextActive);
      successTitle = nextActive ? 'Carrera activada' : 'Carrera inactivada';
      successMessage = `La carrera fue ${nextActive ? 'activada' : 'inactivada'} correctamente.`;
    }

    setToggleModal({ isOpen: false, target: null, loading: false });

    if (result.success) {
      setSuccessModal({ isOpen: true, title: successTitle, message: successMessage });
      return;
    }

    showToast({
      type: 'error',
      title: 'No se pudo actualizar el estado',
      message: result.error,
    });
  };

  return (
    <>
      <DataTable<UniversityRow>
        data={paginatedRows}
        columns={columns}
        searchable={false}
        loading={isLoading}
        pagination={{
          currentPage: boundedPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        getRowKey={(item) => `university-${item.universidad_id}`}
        expandableRow={(item) => buildCampusChildren(item)}
        emptyMessage="No hay registros de estructura institucional."
      />

      <UniversityFormModal
        isOpen={universityFormModal.isOpen}
        onClose={() => setUniversityFormModal({ isOpen: false, item: null })}
        university={universityFormModal.item}
        onConfirm={async (form) => {
          if (!universityFormModal.item) {
            const result = await createUniversity(form);
            if (result.success) setCurrentPage(1);
            return result;
          }
          return updateUniversity(universityFormModal.item.universidad_id, form);
        }}
      />

      <CampusFormModal
        isOpen={campusFormModal.isOpen}
        onClose={() => setCampusFormModal({ isOpen: false, item: null })}
        campus={campusFormModal.item}
        onConfirm={async (form) => {
          if (!campusFormModal.item) {
            return { success: false, error: 'No hay sede seleccionada.' };
          }
          return updateCampus(campusFormModal.item.sede_id, form);
        }}
      />

      <CareerFormModal
        isOpen={careerFormModal.isOpen}
        onClose={() => setCareerFormModal({ isOpen: false, item: null })}
        career={careerFormModal.item}
        onConfirm={async (form) => {
          if (!careerFormModal.item) {
            return { success: false, error: 'No hay carrera seleccionada.' };
          }
          return updateCareer(careerFormModal.item.carrera_id, form);
        }}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, target: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title={
          deleteModal.target?.type === 'universidad'
            ? 'Eliminar universidad'
            : deleteModal.target?.type === 'sede'
              ? 'Eliminar sede'
              : 'Eliminar carrera'
        }
        itemName={deleteModal.target?.item.nombre}
        isLoading={deleteModal.loading}
      />

      <DeleteConfirmationModal
        isOpen={toggleModal.isOpen}
        onClose={() => setToggleModal({ isOpen: false, target: null, loading: false })}
        onConfirm={handleToggleConfirm}
        title={
          toggleModal.target?.type === 'universidad'
            ? (toggleModal.target.item.activo ? 'Inactivar universidad' : 'Activar universidad')
            : (toggleModal.target?.item.activo ? 'Inactivar carrera' : 'Activar carrera')
        }
        message={
          toggleModal.target?.type === 'universidad'
            ? (
              toggleModal.target.item.activo
                ? <>¿Inactivar "<strong>{toggleModal.target.item.nombre}</strong>"? Sus sedes también serán inactivadas.</>
                : <>¿Activar "<strong>{toggleModal.target.item.nombre}</strong>"? Sus sedes también serán activadas.</>
            )
            : (
              toggleModal.target?.item.activo
                ? <>¿Inactivar "<strong>{toggleModal.target.item.nombre}</strong>"?</>
                : <>¿Activar "<strong>{toggleModal.target?.item.nombre}</strong>"?</>
            )
        }
        confirmLabel={toggleModal.target?.item.activo ? 'Inactivar' : 'Activar'}
        variant={toggleModal.target?.item.activo ? 'danger' : 'warning'}
        isLoading={toggleModal.loading}
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
      />
    </>
  );
};
