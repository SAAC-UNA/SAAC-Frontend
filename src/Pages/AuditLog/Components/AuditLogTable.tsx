/**
 * AuditLogTable - Tabla de registros de bitácora del sistema (HU-005)
 * 
 * Muestra registros con:
 * - Usuario que ejecutó la acción
 * - Tipo de acción
 * - Módulo
 * - Detalle (truncado)
 * - Fecha y hora
 * - Botón para ver detalle completo
 */

import React, { useMemo } from 'react';
import { DataTable } from '@/Components/Ui/Table/DataTable';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { truncateText } from '@/Utils';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import type { AuditLog } from '@/Types/AuditLogTypes';
import { formatAuditDate } from '@/Types/AuditLogTypes';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import { AUDIT_ACTION_BADGE } from '@/Constants/StatusBadges';

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetail?: (log: AuditLog) => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  isLoading = false,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetail,
}) => {
  const firstColumn = useFirstColumnConfig();

  /**
   * Definición de columnas de la tabla
   */
  const columns: DataTableColumn<AuditLog>[] = useMemo(
    () => [
      {
        key: 'usuario',
        header: 'Usuario',
        align: 'left',
        width: firstColumn.width,
        accessor: (log) => log.usuario?.nombre || 'Sistema',
        render: (_, log) => (
          <div className="flex flex-col pl-2">
            <p className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`} title={log.usuario?.nombre || 'Sistema'}>
              {truncateText(log.usuario?.nombre || 'Sistema', firstColumn.maxLength)}
            </p>
            {log.usuario?.email && (
              <p className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.badge}`} title={log.usuario.email}>
                {truncateText(log.usuario.email, firstColumn.maxLength)}
              </p>
            )}
          </div>
        ),
      },
      {
        key: 'tipo_accion',
        header: 'Acción',
        align: 'left',
        accessor: (log) => log.tipo_accion.descripcion,
        render: (_, log) => (
          <div className="flex justify-center">
              <StatusBadge
                label={log.tipo_accion.descripcion}
                colorClasses={(AUDIT_ACTION_BADGE[log.tipo_accion.descripcion.toLowerCase()] ?? { colorClasses: 'bg-gray-100 text-gray-800' }).colorClasses}
              />
          </div>
        ),
      },
      {
        key: 'modulo',
        header: 'Módulo',
        align: 'center',
        accessor: (log) => log.modulo || 'N/A',
        render: (_, log) => (
          <span className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
            {log.modulo || <span className="text-gris-una italic">Sin módulo</span>}
          </span>
        ),
      },
      {
        key: 'fecha_hora',
        header: 'Fecha',
        align: 'center',
        accessor: (log) => log.fecha_hora,
        render: (_, log) => (
          <span className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
            {formatAuditDate(log.fecha_hora).split(', ')[0]}
          </span>
        ),
      },
      {
        key: 'hora',
        header: 'Hora',
        align: 'center',
        accessor: (log) => log.fecha_hora,
        render: (_, log) => (
          <span className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
            {formatAuditDate(log.fecha_hora).split(', ')[1]}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Acciones',
        align: 'center',
        accessor: () => '',
        render: (_, log) => (
          <div className="flex gap-2 justify-center">
            <TableActionButton
              onClick={() => onViewDetail?.(log)}
              action="view"
              tooltip="Ver detalle completo"
            />
          </div>
        ),
      },
    ],
    [onViewDetail]
  );

  return (
    <DataTable
      data={logs as unknown as Record<string, unknown>[]}
      columns={columns as unknown as DataTableColumn<Record<string, unknown>>[]}
      title=""
      description=""
      loading={isLoading}
      searchable={false}
      emptyMessage="No hay registros de bitácora que coincidan con los filtros aplicados"
      pagination={{
        currentPage,
        totalPages,
        onPageChange,
      }}
    />
  );
};
