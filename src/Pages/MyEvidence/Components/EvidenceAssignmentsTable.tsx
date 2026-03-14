/**
 * EvidenceAssignmentsTable - Tabla de asignaciones de evidencias
 * HU-029 - Mis Evidencias Asignadas
 * 
 * Muestra las asignaciones en formato tabla con:
 * - Información de evidencia y criterio
 * - Estado y fechas
 * - Acciones (ver detalles, subir archivos)
 */

import React, { useMemo } from 'react';
import { DataTable, type DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_TRUNCATE } from '@/Constants/TableTruncate';
import { truncateText } from '@/Utils';
import { TableActionButton } from '@/Components/index';
import { AssignmentStatusBadge } from './AssignmentStatusBadge';
import type { EvidenceAssignment } from '@/Types/EvidenceAssignmentTypes';
import { formatDate, isOverdue } from '@/Types/EvidenceAssignmentTypes';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';

interface EvidenceAssignmentsTableProps {
  /** Asignaciones a mostrar */
  assignments: EvidenceAssignment[];
  /** Estado de carga */
  loading?: boolean;
  /** Indica si hay filtros activos */
  hasFilters?: boolean;
  /** Callback al ver detalles */
  onViewDetails: (assignment: EvidenceAssignment) => void;
  /** Callback al subir archivos */
  onUploadFiles: (assignment: EvidenceAssignment) => void;
  /** HU-016: Callback al solicitar ampliación */
  onRequestExtension?: (assignment: EvidenceAssignment) => void;
  /** Paginación */
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}


export const EvidenceAssignmentsTable: React.FC<EvidenceAssignmentsTableProps> = ({
  assignments,
  loading = false,
  hasFilters = false,
  onViewDetails,
  onUploadFiles,
  onRequestExtension,
  pagination
}) => {
  
  const firstColumn = useFirstColumnConfig();

  // Configuración de columnas
  const columns = useMemo<DataTableColumn<EvidenceAssignment>[]>(() => [
    {
      key: 'evidencia',
      header: 'Evidencia',
      align: 'left',
      width: firstColumn.width,
      render: (_: unknown, assignment: EvidenceAssignment) => {
        const { evidencia } = assignment;
        if (!evidencia) return <span className="text-gris-una">Sin información</span>;

        const fullText = `${evidencia.nomenclatura} - ${evidencia.descripcion}`;
        const criterionText = evidencia.criterion 
          ? `${evidencia.criterion.nomenclatura} - ${evidencia.criterion.descripcion}`
          : 'Sin criterio';

        return (
          <div className="flex flex-col pl-2 py-1">
            <p 
              className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
              title={fullText}
            >
              {truncateText(fullText, firstColumn.maxLength)}
            </p>
            <p 
              className={`block font-sans antialiased font-normal leading-normal text-gris-una opacity-70 ${TYPOGRAPHY.table.cell}`}
              title={`Criterio: ${criterionText}`}
            >
              {truncateText(criterionText, firstColumn.maxLength)}
            </p>
          </div>
        );
      }
    },
    {
      key: 'fecha_asignacion',
      header: 'Fecha Asignación',
      align: 'center',
      render: (_: unknown, assignment: EvidenceAssignment) => (
        <span className={`relative grid items-center px-2 py-1 font-sans text-negro-una-2 rounded-corner select-none whitespace-nowrap ${TYPOGRAPHY.table.cell}`}>
          {formatDate(assignment.fecha_asignacion)}
        </span>
      )
    },
    {
      key: 'fecha_limite',
      header: 'Fecha Límite',
      align: 'center',
      render: (_: unknown, assignment: EvidenceAssignment) => {
        const fechaLimite = assignment.fecha_limite ? formatDate(assignment.fecha_limite) : 'Sin límite';
        const overdue = isOverdue(assignment);
        return (
          <span className={`relative grid items-center px-2 py-1 font-sans rounded-corner select-none whitespace-nowrap ${TYPOGRAPHY.table.cell} ${overdue ? 'text-red-600 font-bold' : 'text-negro-una-2'}`}>
            {fechaLimite}
          </span>
        );
      }
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (_: unknown, assignment: EvidenceAssignment) => {
        const estado = isOverdue(assignment) ? 'vencido' : assignment.estado;
        return <AssignmentStatusBadge estado={estado} />;
      }
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (_: unknown, assignment: EvidenceAssignment) => {
        // HU-016: Determinar si puede solicitar ampliación
        // No puede solicitar si:
        // 1. Ya tiene una solicitud pendiente
        // 2. El estado no es pendiente o en_progreso
        const hasPendingRequest = assignment.has_pending_extension_request === true;
        const validStatus = ['pendiente', 'en_progreso'].includes(assignment.estado);
        const canRequestExtension = !hasPendingRequest && validStatus;
        
        // Tooltip dinámico
        let tooltip = "Solicitar ampliación";
        if (hasPendingRequest) {
          tooltip = "Ya hay una solicitud pendiente";
        } else if (!validStatus) {
          tooltip = "No se puede solicitar ampliación";
        }
        
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
            
            {/* HU-016: Botón de solicitar ampliación */}
            {onRequestExtension && (
              <TableActionButton
                action="clock"
                tooltip={tooltip}
                onClick={() => onRequestExtension(assignment)}
                disabled={!canRequestExtension}
              />
            )}
          </div>
        );
      }
    }
  ], [firstColumn, onViewDetails, onUploadFiles, onRequestExtension]);

  return (
    <DataTable
      data={assignments as any}
      columns={columns as any}
      title=""
      loading={loading}
      searchable={false}
      emptyMessage={
        hasFilters
          ? "No se encontraron asignaciones que coincidan con los filtros aplicados."
          : "No tienes evidencias asignadas. Cuando se te asigne una evidencia, aparecerá aquí."
      }
      pagination={pagination}
      unstyled={false}
    />
  );
};
