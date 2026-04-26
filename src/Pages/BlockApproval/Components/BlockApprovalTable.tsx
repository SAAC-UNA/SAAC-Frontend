import React, { useMemo } from 'react';
import { DataTable } from '@/Components/Ui/Table/DataTable';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { UserAvatars } from '@/Components/Ui/UserAvatars/UserAvatars';
import type { UserAvatarsUser } from '@/Components/Ui/UserAvatars/UserAvatars';

import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_COLUMN_WIDTHS } from '@/Constants/Components';
import { BADGE_COLORS } from '@/Constants/StatusBadges';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';

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

export interface EvidenceApprovalItem {
  evidencia_id: number;
  nomenclatura: string;
  descripcion: string;
  approval_status: EvidenceApprovalStatus;
  comentario_rechazo?: string | null;
  asignacion?: {
    estado: string;
    fecha_limite: string | null;
    usuario_id: number;
    usuario_nombre?: string | null;
  } | null;
  asignacion_id?: number;
  approvals_by_user?: Record<
    string,
    {
      approval_status: EvidenceApprovalStatus;
      comentario_rechazo?: string | null;
      aprobacion_evidencia_id?: number | null;
      updated_at?: string | null;
    }
  >;
  responsables_asignados?: Array<{
    usuario_id: number;
    usuario_nombre?: string | null;
    estado: string;
    fecha_limite: string | null;
    asignacion_id?: number;
    proceso_id?: number;
  }>;
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
  linked_count?: number;
  responsables?: UserAvatarsUser[];
}

interface BlockApprovalTableProps {
  criteria: Criterio[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  selectedProcesoId: number | null;
  isFlexible?: boolean;
  onPageChange: (page: number) => void;
  onAprobar: (criterio: Criterio) => void;
  onRechazar: (criterio: Criterio) => void;
  onOpenCriterionEvidences: (criterio: Criterio) => void;
}

export const BlockApprovalTable: React.FC<BlockApprovalTableProps> = ({
  criteria,
  isLoading,
  currentPage,
  totalPages,
  selectedProcesoId,
  isFlexible = false,
  onPageChange,
  onAprobar,
  onRechazar,
  onOpenCriterionEvidences,
}) => {
  const firstColumn = useFirstColumnConfig();

  const columns: DataTableColumn<Criterio>[] = useMemo(() => [
    {
      key: 'nomenclatura',
      header: isFlexible ? 'Elemento' : 'Criterio',
      align: 'left',
      width: firstColumn.width,
      render: (_, item) => (
        <div className="flex flex-col">
          <p
            className={`block truncate text-gris-una ${TYPOGRAPHY.table.cell}`}
            title={`${item.nomenclatura} — ${item.descripcion}`}
          >
            <span className="font-bold text-negro-una-2">{item.nomenclatura}</span>
            <span> — {item.descripcion}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'responsables',
      header: 'Responsables',
      align: 'center' as const,
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_: unknown, item: Criterio) => {
        const users = item.responsables ?? [];
        if (users.length === 0) {
          return (
            <div className="flex justify-center">
              <span className={`${TYPOGRAPHY.table.helper} text-gris-una/50`}>—</span>
            </div>
          );
        }
        return (
          <div className="flex w-full justify-center pr-1">
            <UserAvatars users={users} size={28} maxVisible={4} tooltipPlacement="bottom" />
          </div>
        );
      },
    },
    {
      key: 'linked_count',
      header: 'Recursos',
      align: 'center',
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, item) => {
        const count = item.linked_count ?? 0;
        return (
          <div className="flex justify-center">
            {count > 0 ? (
              <StatusBadge
                label={`${count} ${count === 1 ? 'recurso' : 'recursos'}`}
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
      },
    },
    {
      key: 'estado_aprobacion',
      header: 'Estado',
      align: 'center',
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, item) => {
        const config = BLOCK_STATUS_BADGE[item.estado_aprobacion ?? 'pendiente'];
        return (
          <div className="flex justify-center">
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
          <div className="flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
            <TableActionButton
              action="custom"
              customIcon={<SystemIcons.actions.linkedResources className={ICON} />}
              customVariant="tableList"
              tooltip={isFlexible ? 'Ver fuentes asociadas' : 'Ver evidencias asociadas'}
              onClick={() => onOpenCriterionEvidences(item)}
            />
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
  ], [onAprobar, onRechazar, onOpenCriterionEvidences, isFlexible, TYPOGRAPHY, firstColumn.width]);

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
        emptyMessage={isFlexible ? 'No hay elementos disponibles para el filtro seleccionado' : 'No hay criterios disponibles para el filtro seleccionado'}
        pagination={totalPages > 1 ? { currentPage, totalPages, onPageChange } : undefined}
        getRowKey={(item) => String((item as unknown as Criterio).id)}
      />
    </div>
  );
};
