/**
 * ImprovementCommitmentDetailModal
 * Muestra el detalle completo de un compromiso de mejora en un modal xl.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { DetailsModal } from '@/Components/Ui/Modals/DetailsModal';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { improvementCommitmentService } from '@/Services/ImprovementCommitmentService';
import type { CompromisoMejora } from '@/Types/ImprovementCommitmentTypes';
import { CompromisoStatusBadge } from './CompromisoStatusBadge';
import { DataTable } from '@/components/index';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { ButtonWithTooltip } from '@/Components/Ui/Buttons/ButtonWithTooltip';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_ACTION_BUTTON, ICON_SIZES } from '@/Constants/Components';
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';
import { formatDateShort } from '@/Utils/DateUtils';
import { cn } from '@/Utils/ClassNames';

// ── Helper components ─────────────────────────────────────────────────────────

const InfoCell: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label, children, className,
}) => (
  <div className={cn('flex flex-col gap-1', className)}>
    <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.modal.subtitle)}>
      {label}
    </span>
    <div>{children}</div>
  </div>
);

const Separator: React.FC = () => (
  <div className="col-span-6 py-1">
    <hr className="border-gris-light" />
  </div>
);

interface Props {
  id: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ImprovementCommitmentDetailModal: React.FC<Props> = ({ id, isOpen, onClose }) => {
  const [fetchState, setFetchState] = useState<{
    loading: boolean;
    error: string | null;
    compromiso: CompromisoMejora | null;
  }>({ loading: true, error: null, compromiso: null });
  const loading = fetchState.loading;
  const error = fetchState.error;
  const compromiso = fetchState.compromiso;

  const [criterionModal, setCriterionModal] = useState<{
    criterionDetail: any | null;
    showCriterionModal: boolean;
  }>({ criterionDetail: null, showCriterionModal: false });
  const criterionDetail = criterionModal.criterionDetail;
  const showCriterionModal = criterionModal.showCriterionModal;

  const [evidenceDetails, setEvidenceDetails] = useState<Record<number, any>>({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isOpen || !id) return;
    setFetchState({ loading: true, error: null, compromiso: null });
    setCurrentPage(1);

    const fetch = async () => {
      try {
        const data = await improvementCommitmentService.obtenerCompromiso(id);
        setFetchState({ loading: false, error: null, compromiso: data });
      } catch (err: any) {
        setFetchState({
          loading: false,
          error: err?.response?.data?.message || err?.message || 'No se pudo cargar el compromiso.',
          compromiso: null,
        });
      }
    };

    fetch();
  }, [id, isOpen]);

  const assignedEvidences = useMemo(() => {
    const anyCompromiso = compromiso as any;
    return anyCompromiso?.assigned_evidences || compromiso?.assignedEvidences || [];
  }, [compromiso]);

  useEffect(() => {
    const loadEvidenceDetails = async () => {
      const ids = Array.from(
        new Set(
          assignedEvidences
            .map((a: any) => a.evidencia_id)
            .filter((id: unknown): id is number => typeof id === 'number')
        )
      ) as number[];

      if (ids.length === 0) { setEvidenceDetails({}); return; }

      const results = await Promise.all(
        ids.map(i => improvementCommitmentService.obtenerEvidencia(i).catch(() => null))
      );
      const map: Record<number, any> = {};
      results.forEach((e) => { if (e?.evidencia_id) map[e.evidencia_id] = e; });
      setEvidenceDetails(map);
    };
    loadEvidenceDetails();
  }, [assignedEvidences]);

  const selectedCriteria = useMemo(() => {
    return (compromiso?.selecciones || []).filter((s: any) => s.criterio);
  }, [compromiso]);

  const getAssignmentsByCriterion = (criterionId?: number) => {
    if (!criterionId) return [];
    return assignedEvidences.filter((assignment: any) => {
      const evidence = evidenceDetails[assignment.evidencia_id] || assignment.evidence;
      return evidence?.criterio_id === criterionId;
    });
  };

  const getCriterionStatus = (criterionId?: number) => {
    const asignaciones = getAssignmentsByCriterion(criterionId);
    if (asignaciones.length === 0) return 'Pendiente';
    const estados = asignaciones.map((a: any) => a.estado);
    if (estados.some((e: string) => e === 'Vencido')) return 'Vencido';
    if (estados.every((e: string) => e === 'Completado')) return 'Completado';
    if (estados.some((e: string) => e === 'En Progreso')) return 'En Progreso';
    return 'Pendiente';
  };

  const handleOpenCriterion = (item: any) => {
    setCriterionModal({ criterionDetail: item, showCriterionModal: true });
  };

  const criterionId = criterionDetail?.criterio?.criterio_id;
  const criterionAssignments = criterionId ? getAssignmentsByCriterion(criterionId) : [];

  const groupedByEvidence = useMemo(() => {
    const groups = new Map<number, {
      evidenciaId: number;
      nomenclatura: string;
      descripcion: string;
      fechaLimite: string | undefined;
      estado: string;
      comentario: string | undefined;
      usuarios: string[];
      roles: string[];
      totalAsignaciones: number;
    }>();

    for (const assignment of criterionAssignments as any[]) {
      const evidenciaId = assignment.evidencia_id;
      const evidence = assignment.evidence || evidenceDetails[evidenciaId];
      const userName = assignment.user?.nombre;
      const roleNamesFromUser = Array.isArray(assignment.user?.roles)
        ? assignment.user.roles
            .map((role: any) => role?.name)
            .filter((name: unknown): name is string => typeof name === 'string' && name.trim().length > 0)
        : [];
      const roleNameFromAssignment =
        typeof assignment.role?.name === 'string' && assignment.role.name.trim().length > 0
          ? assignment.role.name
          : null;

      if (!groups.has(evidenciaId)) {
        groups.set(evidenciaId, {
          evidenciaId,
          nomenclatura: evidence?.nomenclatura || `Evidencia ${evidenciaId}`,
          descripcion: evidence?.descripcion || 'Sin descripcion',
          fechaLimite: assignment.fecha_limite,
          estado: assignment.estado || 'Pendiente',
          comentario: assignment.comentario,
          usuarios: userName ? [userName] : [],
          roles: [
            ...roleNamesFromUser,
            ...(roleNameFromAssignment ? [roleNameFromAssignment] : []),
          ],
          totalAsignaciones: 1,
        });
      } else {
        const current = groups.get(evidenciaId)!;
        if (userName && !current.usuarios.includes(userName)) current.usuarios.push(userName);
        for (const roleName of roleNamesFromUser) {
          if (!current.roles.includes(roleName)) current.roles.push(roleName);
        }
        if (roleNameFromAssignment && !current.roles.includes(roleNameFromAssignment))
          current.roles.push(roleNameFromAssignment);
        current.totalAsignaciones += 1;
        if (!current.fechaLimite && assignment.fecha_limite) current.fechaLimite = assignment.fecha_limite;
      }
    }

    return Array.from(groups.values());
  }, [criterionAssignments, evidenceDetails]);

  const criterionStatus = criterionId ? getCriterionStatus(criterionId) : 'Pendiente';

  const criterionFechaLimite = useMemo(() => {
    const fechas = Array.from(
      new Set(
        criterionAssignments
          .map((a: any) => a.fecha_limite)
          .filter((d: unknown): d is string => typeof d === 'string')
      )
    ) as string[];
    if (fechas.length === 0) return 'Sin fecha';
    if (fechas.length === 1) return formatDateShort(fechas[0]);
    return 'Varias fechas';
  }, [criterionAssignments]);

  const itemsPerPage = TABLE_PAGE_SIZE.standard;
  const totalPages = Math.ceil(selectedCriteria.length / itemsPerPage);
  const paginatedCriteria = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return selectedCriteria.slice(start, start + itemsPerPage);
  }, [selectedCriteria, currentPage, itemsPerPage]);

  const criteriaColumns: DataTableColumn<any>[] = [
    {
      key: 'nomenclatura',
      header: 'Nomenclatura',
      align: 'center',
      width: '150px',
      render: (_, item) => (
        <p className={cn('block font-sans antialiased font-medium leading-normal text-negro-una', TYPOGRAPHY.modal.body)}>
          {item.criterio?.nomenclatura || 'Criterio'}
        </p>
      ),
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      align: 'left',
      render: (_, item) => (
        <p
          className={cn('block font-sans antialiased font-normal leading-normal text-gris-una max-w-2xl truncate', TYPOGRAPHY.modal.body)}
          title={item.criterio?.descripcion || 'Sin descripción'}
        >
          {item.criterio?.descripcion || 'Sin descripción'}
        </p>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      width: '150px',
      render: (_, item) => (
        <div className="flex justify-center">
          <CompromisoStatusBadge estado={getCriterionStatus(item.criterio?.criterio_id)} />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      width: '100px',
      render: (_, item) => (
        <div className="flex items-center justify-center">
          <ButtonWithTooltip
            variant="tableView"
            size="sm"
            tooltip="Ver detalles"
            onClick={() => handleOpenCriterion(item)}
            className={TABLE_ACTION_BUTTON.button}
          >
            <SystemIcons.actions.view className={TABLE_ACTION_BUTTON.icon} />
          </ButtonWithTooltip>
        </div>
      ),
    },
  ];

  const cicleName =
    (compromiso as any)?.process?.accreditationCycle?.nombre ??
    (compromiso as any)?.process?.accreditation_cycle?.nombre ??
    '—';

  return (
    <>
      <DetailsModal
        isOpen={isOpen}
        onClose={onClose}
        title="Detalle del Compromiso"
        subtitle="Visualice criterios, encargados y fechas"
        size="xl"
        variant="info"
        heroIcon={
          <SystemIcons.modal.document className={cn(ICON_SIZES.md, 'text-blanco-una')} />
        }
      >
        {loading ? (
          <div className="relative py-12 min-h-[300px]">
            <LoadingSpinner variant="loader" />
          </div>
        ) : error ? (
          <p className={cn(TYPOGRAPHY.modal.body, 'text-error py-4')}>{error}</p>
        ) : compromiso ? (
          <div className="grid grid-cols-6 gap-x-4 gap-y-3">

            {/* div1 — Descripción */}
            <InfoCell label="Descripción" className="col-start-1 col-end-7">
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                {compromiso.descripcion || '—'}
              </span>
            </InfoCell>

            <Separator />

            {/* div2 — Fecha de inicio */}
            <InfoCell label="Fecha de inicio" className="col-start-1 col-end-3">
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                {formatDateShort(compromiso.fecha_inicio)}
              </span>
            </InfoCell>

            {/* Fecha de finalización */}
            <InfoCell label="Fecha de finalización" className="col-start-3 col-end-5">
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                {formatDateShort(compromiso.fecha_fin)}
              </span>
            </InfoCell>

            {/* div3 — Ciclo de acreditación */}
            <InfoCell label="Ciclo de acreditación" className="col-start-5 col-end-7">
              <span className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2')}>
                {cicleName}
              </span>
            </InfoCell>

            <Separator />

            {/* div4 — Criterios incluidos */}
            <div className="col-start-1 col-end-7">
              <div className="flex items-center justify-between mb-3">
                <span className={cn('uppercase tracking-wider font-semibold text-gris-una-2', TYPOGRAPHY.modal.subtitle)}>
                  Criterios incluidos
                </span>
                <span className={cn(TYPOGRAPHY.form.helper, 'text-gris-una')}>
                  {selectedCriteria.length} {selectedCriteria.length === 1 ? 'criterio' : 'criterios'}
                </span>
              </div>
              {selectedCriteria.length === 0 ? (
                <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una')}>No hay criterios vinculados.</p>
              ) : (
                <DataTable
                  data={paginatedCriteria as any}
                  columns={criteriaColumns as any}
                  title=""
                  searchable={false}
                  pagination={
                    totalPages > 1
                      ? { currentPage, totalPages, onPageChange: setCurrentPage }
                      : undefined
                  }
                  loading={false}
                  emptyMessage="No hay criterios vinculados."
                />
              )}
            </div>

          </div>
        ) : null}
      </DetailsModal>

      {/* Sub-modal: detalle de criterio */}
      {showCriterionModal && criterionDetail && (
        <Modal
          isOpen={showCriterionModal}
          onClose={() => setCriterionModal({ criterionDetail: null, showCriterionModal: false })}
          title={`Detalle: ${criterionDetail?.criterio?.nomenclatura || 'Criterio'}`}
          size="lg"
          variant="neutral"
          heroIcon={<SystemIcons.modal.document className={cn(ICON_SIZES.md, 'text-blanco-una')} />}
          showCancel
          cancelLabel="Cerrar"
        >
          <div className="space-y-4">
            {/* Descripción + Evidencias */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.4fr] gap-6">
              <div className="space-y-4">
                <div>
                  <p className={cn('uppercase tracking-wider font-semibold text-gris-una-2 mb-1', TYPOGRAPHY.modal.subtitle)}>Descripción</p>
                  <p className={cn(TYPOGRAPHY.modal.body, 'text-negro-una')}>
                    {criterionDetail?.criterio?.descripcion || 'Sin descripción'}
                  </p>
                </div>

                <div className="flex items-start gap-8">
                  <div>
                    <p className={cn('uppercase tracking-wider font-semibold text-gris-una-2 mb-1', TYPOGRAPHY.modal.subtitle)}>Estado</p>
                    <CompromisoStatusBadge estado={criterionStatus} />
                  </div>
                  <div>
                    <p className={cn('uppercase tracking-wider font-semibold text-gris-una-2 mb-1', TYPOGRAPHY.modal.subtitle)}>Fecha límite</p>
                    <p className={cn(TYPOGRAPHY.modal.body, 'text-negro-una')}>{criterionFechaLimite}</p>
                  </div>
                </div>

                {(() => {
                  const comentarios = Array.from(
                    new Set(
                      criterionAssignments
                        .map((a: any) => a.comentario)
                        .filter((c: unknown): c is string => typeof c === 'string')
                    )
                  ) as string[];
                  if (comentarios.length === 0) return null;
                  return (
                    <div>
                      <p className={cn('uppercase tracking-wider font-semibold text-gris-una-2 mb-1', TYPOGRAPHY.modal.subtitle)}>Comentario</p>
                      <p className={cn(TYPOGRAPHY.modal.body, 'text-negro-una')}>
                        {comentarios.length === 1 ? comentarios[0] : 'Varios comentarios'}
                      </p>
                    </div>
                  );
                })()}
              </div>

              <div>
                <p className={cn('uppercase tracking-wider font-semibold text-gris-una-2 mb-3', TYPOGRAPHY.modal.subtitle)}>
                  Evidencias asignadas ({groupedByEvidence.length})
                </p>

                {groupedByEvidence.length === 0 ? (
                  <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una')}>No hay asignaciones para este criterio.</p>
                ) : (
                  <div className="grid gap-3">
                    {groupedByEvidence.map((item) => (
                      <div key={item.evidenciaId} className="border border-gris-light rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className={cn(TYPOGRAPHY.modal.body, 'font-semibold text-negro-una')}>{item.nomenclatura}</p>
                            <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una')}>{item.descripcion}</p>
                            <p className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una')}>{item.usuarios.length} usuario(s)</p>
                            <p className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una')}>{item.roles.length} rol(es)</p>
                          </div>
                          <div className="text-right">
                            <p className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una')}>Fecha límite</p>
                            <p className={cn(TYPOGRAPHY.modal.body, 'text-negro-una')}>{formatDateShort(item.fechaLimite)}</p>
                            <p className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una mt-2')}>Estado</p>
                            <p className={cn(TYPOGRAPHY.modal.body, 'text-negro-una')}>{item.estado}</p>
                          </div>
                        </div>
                        {item.comentario && (
                          <p className={cn(TYPOGRAPHY.modal.subtitle, 'text-gris-una mt-2')}>Comentario: {item.comentario}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
