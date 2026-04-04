import React, { useMemo } from 'react';
import { DataTable } from '@/Components/Ui/Table/DataTable';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { ButtonWithTooltip } from '@/Components/Ui/Buttons/ButtonWithTooltip';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';

import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_ACTION_BUTTON, TABLE_COLUMN_WIDTHS } from '@/Constants/Components';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';

type ApprovalStatus = 'pendiente' | 'aprobado' | 'rechazado';

const APPROVAL_STATUS_BADGE: Record<ApprovalStatus, { label: string; colorClasses: string }> = {
  pendiente: { label: 'Pendiente', colorClasses: 'text-warning-dark bg-warning-ring' },
  aprobado:  { label: 'Aprobado',  colorClasses: 'text-verde-dark bg-verde-ring' },
  rechazado: { label: 'Rechazado', colorClasses: 'text-error-dark bg-error-ring' },
};

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
  estado_aprobacion?: ApprovalStatus;
}

interface BlockApprovalTableProps {
  criteria: Criterio[];
  evidences: Evidencia[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  selectedProcesoId: number | null;
  onPageChange: (page: number) => void;
  onAprobar: (criterio: Criterio) => void;
  onRechazar: (criterio: Criterio) => void;
  onViewFiles: (evidencia: Evidencia) => void;
}

export const BlockApprovalTable: React.FC<BlockApprovalTableProps> = ({
  criteria,
  evidences,
  isLoading,
  currentPage,
  totalPages,
  selectedProcesoId,
  onPageChange,
  onAprobar,
  onRechazar,
  onViewFiles,
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
            const config = APPROVAL_STATUS_BADGE[item.estado_aprobacion ?? 'pendiente'];
            return (
            <div className="flex item-start">
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
            const isPending = item.estado_aprobacion === 'pendiente';
            return (
            <div className="flex items-center justify-center" onClick={e => e.stopPropagation()}>
                <TableActionButton
                action="custom"
                customIcon={<SystemIcons.interface.checkCircle className={TABLE_ACTION_BUTTON.icon} />}
                customVariant="tablePower"
                tooltip={isPending ? 'Aprobar criterio' : 'Ya procesado'}
                onClick={() => onAprobar(item)}
                isActive={isPending}
                disabled={!isPending}
                />
                <TableActionButton
                action="custom"
                customIcon={<SystemIcons.interface.xCircle className={TABLE_ACTION_BUTTON.icon} />}
                customVariant="tableDelete"
                tooltip={isPending ? 'Rechazar criterio' : 'Ya procesado'}
                onClick={() => onRechazar(item)}
                disabled={!isPending}
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
            expandableRow={(row) => {
              const criterio = row as unknown as Criterio;
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
                    <SystemIcons.actions.view className={TABLE_ACTION_BUTTON.icon} />
                  </ButtonWithTooltip>
                ),
              }));
            }}
        />
    </div>
  );
};
