/**
 * ElementAssignmentsTable - Tabla de pautas asignadas (modelo flexible)
 * Utilizada en MyEvidenceAssignmentsPage cuando el usuario tiene asignaciones
 * de tipo ELEMENTO_ASIGNACION (modelo flexible SINAES 2025).
 */

import React, { useMemo } from 'react';
import {
  DataTable,
  type DataTableColumn,
} from '@/Components/Ui/Table/DataTable';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { truncateText } from '@/Utils';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { EVIDENCE_STATUS_BADGE } from '@/Constants/StatusBadges';
import type { FlexibleAssignmentItem } from '@/Types/EvidenceAssignment';
import type { FlexibleElement } from '@/Types/StructureModelTypes';
import { getElementPath } from '@/Utils/elementTreeUtils';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import { formatDate } from '@/Utils/DateUtils';
import { TABLE_COLUMN_WIDTHS } from '@/Constants/Components';

interface ElementAssignmentsTableProps {
  assignments: FlexibleAssignmentItem[];
  loading?: boolean;
  hasFilters?: boolean;
  onViewDetails: (assignment: FlexibleAssignmentItem) => void;
  onUploadFiles: (assignment: FlexibleAssignmentItem) => void;
  onStatusChange?: (
    assignment: FlexibleAssignmentItem,
    newStatus: 'En Progreso' | 'Completado'
  ) => void;
  onRequestExtension?: (assignment: FlexibleAssignmentItem) => void;
  allElements?: FlexibleElement[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export const ElementAssignmentsTable: React.FC<ElementAssignmentsTableProps> = ({
  assignments,
  loading = false,
  hasFilters = false,
  onViewDetails,
  onUploadFiles,
  onStatusChange,
  onRequestExtension,
  allElements,
  pagination,
}) => {
  const firstColumn = useFirstColumnConfig();

  const columns = useMemo<DataTableColumn<FlexibleAssignmentItem>[]>(
    () => [
      {
        key: 'element',
        header: 'Pauta',
        align: 'left',
        width: firstColumn.width,
        render: (_: unknown, assignment: FlexibleAssignmentItem) => {
          const { element } = assignment;
          const nombre = element?.nombre ?? 'Sin nombre';
          const tipo = element?.tipo ?? '';
          const path = allElements && element
            ? getElementPath(element.elemento_id, allElements)
            : null;
          return (
            <div className="flex flex-col pl-2">
              <p
                className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
                title={path ?? nombre}
              >
                {truncateText(nombre, firstColumn.maxLength)}
              </p>
              {path ? (
                <p
                  className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.helper}`}
                  title={path}
                >
                  {truncateText(path, firstColumn.maxLength + 20)}
                </p>
              ) : tipo ? (
                <p
                  className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.helper}`}
                >
                  {tipo}
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        key: 'process',
        header: 'Proceso',
        align: 'left',
        width: TABLE_COLUMN_WIDTHS.actionsLarge,
        render: (_: unknown, assignment: FlexibleAssignmentItem) => (
          <span className={`font-sans text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
            {assignment.process?.nombre ?? `Proceso ${assignment.proceso_id}`}
          </span>
        ),
      },
      {
        key: 'fecha_limite',
        header: 'Fecha Límite',
        align: 'left',
        width: TABLE_COLUMN_WIDTHS.status,
        render: (_: unknown, assignment: FlexibleAssignmentItem) => {
          const fecha = assignment.fecha_limite
            ? formatDate(assignment.fecha_limite)
            : 'Sin límite';
          const vencido = assignment.estado === 'Vencido';
          return (
            <span
              className={`font-sans rounded-corner select-none whitespace-nowrap ${TYPOGRAPHY.table.cell} ${vencido ? 'text-red-600 font-bold' : 'text-negro-una-2'}`}
            >
              {fecha}
            </span>
          );
        },
      },
      {
        key: 'estado',
        header: 'Estado',
        align: 'left',
        width: TABLE_COLUMN_WIDTHS.status,
        render: (_: unknown, assignment: FlexibleAssignmentItem) => {
          const badge = EVIDENCE_STATUS_BADGE[assignment.estado as keyof typeof EVIDENCE_STATUS_BADGE];
          return (
            <div className="flex justify-start">
              <StatusBadge
                label={badge?.label ?? assignment.estado}
                colorClasses={badge?.colorClasses ?? 'bg-gris-light text-gris-una'}
              />
            </div>
          );
        },
      },
      {
        key: 'actions',
        header: 'Acciones',
        align: 'center',
        width: TABLE_COLUMN_WIDTHS.actionsLarge,
        render: (_: unknown, assignment: FlexibleAssignmentItem) => {
          const isCompleted = assignment.estado === 'Completado';
          const isActionable = ['Pendiente', 'En Progreso'].includes(assignment.estado);
          const hasPending = assignment.has_pending_extension_request === true;
          const canExtend = !hasPending && isActionable;
          const canMarkCompleted = assignment.has_uploaded_files === true;

          let extensionTooltip = 'Solicitar ampliación';
          if (hasPending) extensionTooltip = 'Ya hay una solicitud pendiente';
          else if (!isActionable) extensionTooltip = 'No se puede solicitar ampliación';

          const completeTooltip = isCompleted
            ? 'Revertir a en progreso'
            : canMarkCompleted
              ? 'Marcar completado'
              : 'Debe subir al menos un archivo o enlace';

          return (
            <div className="flex items-center justify-center gap-2 pr-2">
              <TableActionButton
                action="view"
                tooltip="Ver detalles"
                onClick={() => onViewDetails(assignment)}
              />

              <TableActionButton
                action="uploadArrow"
                tooltip="Subir archivos"
                onClick={() => onUploadFiles(assignment)}
              />

              {onRequestExtension && (
                <TableActionButton
                  action="clock"
                  tooltip={extensionTooltip}
                  onClick={() => onRequestExtension(assignment)}
                  disabled={!canExtend}
                />
              )}

              {onStatusChange && (isActionable || isCompleted) && (
                <TableActionButton
                  action={isCompleted ? 'markInProgress' : 'markComplete'}
                  tooltip={completeTooltip}
                  disabled={!isCompleted && !canMarkCompleted}
                  onClick={() =>
                    onStatusChange(assignment, isCompleted ? 'En Progreso' : 'Completado')
                  }
                />
              )}
            </div>
          );
        },
      },
    ],
    [firstColumn, onViewDetails, onUploadFiles, onStatusChange, onRequestExtension]
  );

  return (
    <DataTable
      data={assignments as any}
      columns={columns}
      title=""
      loading={loading}
      searchable={false}
      emptyMessage={
        hasFilters
          ? 'No se encontraron pautas que coincidan con los filtros aplicados.'
          : 'No tienes pautas asignadas. Cuando se te asigne una pauta, aparecerá aquí.'
      }
      pagination={pagination}
    />
  );
};
