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

import React, { useMemo, useCallback } from 'react';
import { DataTable } from '@/Components/Ui/Table/DataTable';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_TRUNCATE } from '@/Constants/TableTruncate';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import type { AuditLog } from '@/Types/AuditLogTypes';

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
  /**
   * Formatea una fecha ISO a formato legible
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  };

  /**
   * Trunca texto largo
   */
  const truncateText = useCallback((text: string | null, maxLength: number = 50): string => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);

  /**
   * Obtiene el badge de color según el tipo de acción
   */
  const getActionBadge = (actionType: string): { color: string; icon: React.ReactNode } => {
    const actionMap: Record<string, { color: string; icon: React.ReactNode }> = {
      crear: { color: 'bg-green-100 text-green-800', icon: <SystemIcons.structure.create className="w-3 h-3" /> },
      editar: { color: 'bg-blue-100 text-blue-800', icon: <SystemIcons.actions.edit className="w-3 h-3" /> },
      eliminar: { color: 'bg-red-100 text-red-800', icon: <SystemIcons.actions.delete className="w-3 h-3" /> },
      consultar: { color: 'bg-gray-100 text-gray-800', icon: <SystemIcons.actions.view className="w-3 h-3" /> },
      login: { color: 'bg-green-100 text-green-800', icon: <SystemIcons.users.user className="w-3 h-3" /> },
      logout: { color: 'bg-orange-100 text-orange-800', icon: <SystemIcons.actions.logout className="w-3 h-3" /> },
      login_fallido: { color: 'bg-red-100 text-red-800', icon: <SystemIcons.interface.alert className="w-3 h-3" /> },
      activar: { color: 'bg-green-100 text-green-800', icon: <SystemIcons.interface.checkCircle className="w-3 h-3" /> },
      desactivar: { color: 'bg-gray-100 text-gray-800', icon: <SystemIcons.actions.cancel className="w-3 h-3" /> },
      asignar_rol: { color: 'bg-purple-100 text-purple-800', icon: <SystemIcons.users.roles className="w-3 h-3" /> },
      asignar_permisos: { color: 'bg-indigo-100 text-indigo-800', icon: <SystemIcons.modal.key className="w-3 h-3" /> },
      exportar: { color: 'bg-teal-100 text-teal-800', icon: <SystemIcons.repository.boxArchive className="w-3 h-3" /> },
      asignar: { color: 'bg-blue-100 text-blue-800', icon: <SystemIcons.actions.save className="w-3 h-3" /> },
    };

    return actionMap[actionType.toLowerCase()] || { color: 'bg-gray-100 text-gray-800', icon: null };
  };

  /**
   * Definición de columnas de la tabla
   */
  const columns: DataTableColumn<AuditLog>[] = useMemo(
    () => [
      {
        key: 'usuario',
        header: 'Usuario',
        accessor: (log) => log.usuario?.nombre || 'Sistema',
        render: (_, log) => (
          <div className="flex flex-col">
            <p className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.table.cell}`} title={log.usuario?.nombre || 'Sistema'}>
              {truncateText(log.usuario?.nombre || 'Sistema', TABLE_TRUNCATE.name)}
            </p>
            {log.usuario?.email && (
              <p className={`text-gray-500 ${TYPOGRAPHY.badge}`} title={log.usuario.email}>
                {truncateText(log.usuario.email, TABLE_TRUNCATE.email)}
              </p>
            )}
          </div>
        ),
      },
      {
        key: 'tipo_accion',
        header: 'Acción',
        accessor: (log) => log.tipo_accion.descripcion,
        render: (_, log) => {
          const { color, icon } = getActionBadge(log.tipo_accion.descripcion);
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium ${TYPOGRAPHY.badge} ${color}`}
            >
              {icon}
              {log.tipo_accion.descripcion}
            </span>
          );
        },
      },
      {
        key: 'modulo',
        header: 'Módulo',
        accessor: (log) => log.modulo || 'N/A',
        render: (_, log) => (
          <span className={`text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
            {log.modulo || <span className="text-gray-400 italic">Sin módulo</span>}
          </span>
        ),
      },
      {
        key: 'detalle',
        header: 'Detalle',
        accessor: (log) => log.detalle || 'N/A',
        render: (_, log) => (
          <p className={`text-negro-una-2 ${TYPOGRAPHY.table.cell}`} title={log.detalle || 'Sin detalle'}>
            {truncateText(log.detalle, TABLE_TRUNCATE.text)}
          </p>
        ),
      },
      {
        key: 'fecha_hora',
        header: 'Fecha y Hora',
        accessor: (log) => log.fecha_hora,
        render: (_, log) => (
          <div className="flex flex-col">
            <p className={`text-negro-una-2 font-medium ${TYPOGRAPHY.table.cell}`}>
              {formatDate(log.fecha_hora).split(', ')[0]}
            </p>
            <p className={`text-gray-500 ${TYPOGRAPHY.badge}`}>{formatDate(log.fecha_hora).split(', ')[1]}</p>
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'Acciones',
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
    [onViewDetail, truncateText]
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
