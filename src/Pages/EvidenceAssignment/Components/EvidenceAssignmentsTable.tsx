/**
 * EvidenceAssignmentsTable - Tabla de asignaciones de evidencias
 * HU-029 - Mis Evidencias Asignadas
 * 
 * Muestra las asignaciones en formato tabla con:
 * - Información de evidencia y criterio
 * - Estado y fechas
 * - Acciones (ver detalles, subir archivos)
 */

import React, { useMemo, useCallback } from 'react';
import { DataTable, type DataTableColumn } from '@/Components/Ui/DataTable';
import { TableActionButton } from '@/Components/index';
import type { EvidenceAssignment } from '@/Types/EvidenceAssignmentTypes';
import { getStatusBadgeInfo, formatDate, isOverdue } from '@/Types/EvidenceAssignmentTypes';

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
  pagination
}) => {
  // Función para truncar texto
  const truncateText = useCallback((text: string, maxLength: number = 30): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);

  // Configuración de columnas
  const columns = useMemo<DataTableColumn<EvidenceAssignment>[]>(() => [
    {
      key: 'evidencia',
      header: 'Evidencia',
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
              className="block font-sans text-sm antialiased font-bold leading-normal text-negro-una"
              title={fullText}
            >
              {truncateText(fullText, 40)}
            </p>
            <p 
              className="block font-sans text-sm antialiased font-normal leading-normal text-gris-una opacity-70"
              title={`Criterio: ${criterionText}`}
            >
              {truncateText(criterionText, 40)}
            </p>
          </div>
        );
      }
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (_: unknown, assignment: EvidenceAssignment) => {
        const statusInfo = getStatusBadgeInfo(assignment.estado);
        const overdue = isOverdue(assignment);
        const finalInfo = overdue ? getStatusBadgeInfo('vencido') : statusInfo;

        return (
          <div className="w-max mx-auto">
            <div 
              className="relative grid items-center px-2 py-1 font-sans text-xs font-bold uppercase rounded-md select-none whitespace-nowrap"
              style={{ 
                backgroundColor: finalInfo.bgColor,
                color: finalInfo.color 
              }}
            >
              <span>{finalInfo.label}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'fechas',
      header: 'Fechas',
      align: 'center',
      render: (_: unknown, assignment: EvidenceAssignment) => {
        const fechaAsignacion = formatDate(assignment.fecha_asignacion);
        const fechaLimite = assignment.fecha_limite 
          ? formatDate(assignment.fecha_limite)
          : 'Sin límite';

        return (
          <div className="flex flex-col items-center text-sm">
            <div className="flex items-center gap-1 text-gris-una">
              <span>Asignada: {fechaAsignacion}</span>
            </div>
            <div className="flex items-center gap-1 text-gris-una mt-1">
              <span className={isOverdue(assignment) ? 'text-red-600 font-bold' : ''}>
                Límite: {fechaLimite}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (_: unknown, assignment: EvidenceAssignment) => (
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
        </div>
      )
    }
  ], [truncateText, onViewDetails, onUploadFiles]);

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
