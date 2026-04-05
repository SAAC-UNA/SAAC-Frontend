import React, { useMemo } from 'react';
import { DataTable } from '@/Components/Ui/Table/DataTable';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { ButtonWithTooltip } from '@/Components/Ui/Buttons/ButtonWithTooltip';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';

import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_ACTION_BUTTON, TABLE_COLUMN_WIDTHS } from '@/Constants/Components';

const ICON = 'size-4 shrink-0';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';

export type BlockApprovalStatus = 'pendiente' | 'aprobado' | 'rechazado' | 'incompleto';
export type EvidenceApprovalStatus = 'pendiente' | 'aprobado' | 'rechazado';

const BLOCK_STATUS_BADGE: Record<BlockApprovalStatus, { label: string; colorClasses: string }> = {
  pendiente:   { label: 'Pendiente',   colorClasses: 'text-warning-dark bg-warning-ring' },
  aprobado:    { label: 'Aprobado',    colorClasses: 'text-verde-dark bg-verde-ring' },
  rechazado:   { label: 'Rechazado',   colorClasses: 'text-error-dark bg-error-ring' },
  incompleto:  { label: 'Incompleto',  colorClasses: 'text-orange-700 bg-orange-100' },
};

const EVIDENCE_STATUS_BADGE: Record<EvidenceApprovalStatus, { label: string; colorClasses: string }> = {
  pendiente: { label: 'Pendiente', colorClasses: 'text-warning-dark bg-warning-ring' },
  aprobado:  { label: 'Aprobado',  colorClasses: 'text-verde-dark bg-verde-ring' },
  rechazado: { label: 'Rechazado', colorClasses: 'text-error-dark bg-error-ring' },
};

export interface EvidenceApprovalItem {
  evidencia_id: number;
  nomenclatura: string;
  descripcion: string;
  approval_status: EvidenceApprovalStatus;
  comentario_rechazo?: string | null;
  asignacion?: { estado: string; fecha_limite: string | null; usuario_id: number } | null;
}

export interface Evidencia {
  id: number;
  nomenclatura: string;
  descripcion: string;
  criterio_id: number;
  archivo_adjuntado?: boolean;
}

export interface Criterio {
  id: number;
  nomenclatura: string;
  descripcion: string;
  estado_aprobacion?: BlockApprovalStatus;
}

interface BlockApprovalTableProps {
  criteria: Criterio[];
  evidences: Evidencia[];
  evidenceApprovals: Record<number, EvidenceApprovalItem[]>;
  loadingEvidences: Set<number>;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  selectedProcesoId: number | null;
  onPageChange: (page: number) => void;
  onAprobar: (criterio: Criterio) => void;
  onRechazar: (criterio: Criterio) => void;
  onViewFiles: (evidencia: Evidencia) => void;
  onAprobarEvidencia: (criterio: Criterio, evidencia: EvidenceApprovalItem) => void;
  onRechazarEvidencia: (criterio: Criterio, evidencia: EvidenceApprovalItem) => void;
  onExpandCriterion: (criterionId: number) => void;
}

export const BlockApprovalTable: React.FC<BlockApprovalTableProps> = ({
  criteria,
  evidences,
  evidenceApprovals,
  loadingEvidences,
  isLoading,
  currentPage,
  totalPages,
  selectedProcesoId,
  onPageChange,
  onAprobar,
  onRechazar,
  onViewFiles,
  onAprobarEvidencia,
  onRechazarEvidencia,
  onExpandCriterion,
}) => {
  const getEvidencesByCriterion = (criterionId: number) =>
    evidences.filter(ev => ev.criterio_id === criterionId);

  const columns: DataTableColumn<Criterio>[] = useMemo(() => [
    {
      key: 'nomenclatura',
      header: 'Criterio',
      align: 'left',
      render: (_, item) => (
        <div className="flex flex-col pl-2">
          <p
            className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 truncate ${TYPOGRAPHY.table.cell}`}
            title={`${item.nomenclatura} — ${item.descripcion}`}
          >
            <span className="font-bold">{item.nomenclatura}</span>
            <span className="text-gris-una"> — {item.descripcion}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'estado_aprobacion',
      header: 'Estado',
      align: 'left',
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, item) => {
        const config = BLOCK_STATUS_BADGE[item.estado_aprobacion ?? 'pendiente'];
        return (
          <div className="flex items-start">
            <StatusBadge label={config.label} colorClasses={config.colorClasses} />
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      width: TABLE_COLUMN_WIDTHS.actions,
      render: (_, item) => {
        const canApproveBlock = item.estado_aprobacion === 'pendiente';
        const canRejectBlock  = item.estado_aprobacion !== 'aprobado';
        return (
          <div className="flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <TableActionButton
              action="custom"
              customIcon={<SystemIcons.interface.checkCircle className={ICON} />}
              customVariant="tablePower"
              tooltip={canApproveBlock ? 'Aprobar bloque' : item.estado_aprobacion === 'incompleto' ? 'Bloque incompleto: hay evidencias rechazadas' : 'Bloque ya procesado'}
              onClick={() => onAprobar(item)}
              isActive={canApproveBlock}
              disabled={!canApproveBlock}
            />
            <TableActionButton
              action="custom"
              customIcon={<SystemIcons.interface.xCircle className={ICON} />}
              customVariant="tableDelete"
              tooltip={canRejectBlock ? 'Rechazar bloque' : 'Bloque ya aprobado'}
              onClick={() => onRechazar(item)}
              disabled={!canRejectBlock}
            />
          </div>
        );
      },
    },
  ], [onAprobar, onRechazar]);

  if (!selectedProcesoId) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 py-16">
        <div className="text-center">
          <SystemIcons.modal.document size="lg" className="mx-auto text-gray-400 mb-3" />
          <p className="text-sm font-medium text-negro-una mb-1">No hay datos disponibles</p>
          <p className="text-sm text-gris-una">Seleccione un proceso para continuar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DataTable
        data={criteria as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn<Record<string, unknown>>[]}
        title=""
        searchable={false}
        loading={isLoading}
        emptyMessage="No hay criterios disponibles para el filtro seleccionado"
        pagination={totalPages > 1 ? { currentPage, totalPages, onPageChange } : undefined}
        getRowKey={(item) => String((item as unknown as Criterio).id)}
        onRowExpand={(rowKey, isExpanding) => {
          if (isExpanding) onExpandCriterion(Number(rowKey));
        }}
        expandableRow={(row) => {
          const criterio = row as unknown as Criterio;
          const isLoadingEv = loadingEvidences.has(criterio.id);
          const approvals = evidenceApprovals[criterio.id];
          const blockIsApproved = criterio.estado_aprobacion === 'aprobado';
          const blockIsIncompleto = criterio.estado_aprobacion === 'incompleto';

          // Mostrar spinner mientras carga
          if (isLoadingEv) {
            return [{
              key: 'loading',
              noBorder: true,
              content: (
                <div className="flex justify-center py-2">
                  <LoadingSpinner variant="loader" />
                </div>
              ),
            }];
          }

          // Si tenemos aprobaciones individuales, mostrarlas
          if (approvals && approvals.length > 0) {
            return approvals.map(ev => {
              const isLocked = ev.approval_status === 'aprobado' && blockIsIncompleto;
              const statusConfig = EVIDENCE_STATUS_BADGE[ev.approval_status];
              const canApprove = !blockIsApproved && !isLocked && ev.approval_status !== 'aprobado';
              const canReject  = !blockIsApproved && !isLocked && ev.approval_status !== 'rechazado';
              return {
                key: String(ev.evidencia_id),
                content: (
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusBadge label={statusConfig.label} colorClasses={statusConfig.colorClasses} />
                    <p className={`truncate ${TYPOGRAPHY.table.helper}`}>
                      <span className="font-medium text-negro-una">{ev.nomenclatura}</span>
                      <span className="text-gris-una"> — {ev.descripcion}</span>
                    </p>
                    {ev.comentario_rechazo && (
                      <span className={`shrink-0 text-error-dark ${TYPOGRAPHY.table.helper}`} title={ev.comentario_rechazo}>
                        · {ev.comentario_rechazo}
                      </span>
                    )}
                  </div>
                ),
                action: (
                  <div className="flex items-center gap-1">
                    <ButtonWithTooltip
                      variant="tablePower"
                      size="sm"
                      tooltip={isLocked ? 'Evidencia aprobada (bloqueada)' : canApprove ? 'Aprobar evidencia' : 'Ya aprobada'}
                      tooltipPosition="left"
                      disabled={!canApprove}
                      onClick={(e) => { e.stopPropagation(); onAprobarEvidencia(criterio, ev); }}
                      className={TABLE_ACTION_BUTTON.button}
                    >
                      <SystemIcons.interface.checkCircle className={ICON} />
                    </ButtonWithTooltip>
                    <ButtonWithTooltip
                      variant="tableDelete"
                      size="sm"
                      tooltip={isLocked ? 'Evidencia aprobada (bloqueada)' : canReject ? 'Rechazar evidencia' : 'Ya rechazada'}
                      tooltipPosition="left"
                      disabled={!canReject}
                      onClick={(e) => { e.stopPropagation(); onRechazarEvidencia(criterio, ev); }}
                      className={TABLE_ACTION_BUTTON.button}
                    >
                      <SystemIcons.interface.xCircle className={ICON} />
                    </ButtonWithTooltip>
                    <ButtonWithTooltip
                      variant="tableView"
                      size="sm"
                      tooltip="Ver archivos asociados"
                      tooltipPosition="left"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewFiles({ id: ev.evidencia_id, nomenclatura: ev.nomenclatura, descripcion: ev.descripcion, criterio_id: criterio.id });
                      }}
                      className={TABLE_ACTION_BUTTON.button}
                    >
                      <SystemIcons.actions.view className={ICON} />
                    </ButtonWithTooltip>
                  </div>
                ),
              };
            });
          }

          // Fallback: evidencias sin estado de aprobación individual (solo ver archivos)
          return getEvidencesByCriterion(criterio.id).map(evidencia => ({
            key: String(evidencia.id),
            content: (
              <p className={`truncate ${TYPOGRAPHY.table.helper}`}>
                <span className="font-medium text-negro-una">{evidencia.nomenclatura}</span>
                <span className="text-gris-una"> — {evidencia.descripcion}</span>
              </p>
            ),
            action: (
              <ButtonWithTooltip
                variant="tableView"
                size="sm"
                tooltip="Ver archivos asociados"
                tooltipPosition="left"
                onClick={(e) => { e.stopPropagation(); onViewFiles(evidencia); }}
                className={TABLE_ACTION_BUTTON.button}
              >
                <SystemIcons.actions.view className={ICON} />
              </ButtonWithTooltip>
            ),
          }));
        }}
      />
    </div>
  );
};
