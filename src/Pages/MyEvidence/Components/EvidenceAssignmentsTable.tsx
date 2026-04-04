/**
 * EvidenceAssignmentsTable - Tabla de asignaciones de evidencias
 * HU-029 - Mis Evidencias Asignadas
 *
 * Muestra las asignaciones en formato tabla con:
 * - Información de evidencia y criterio
 * - Estado y fechas
 * - Acciones (ver detalles, subir archivos)
 */

import React, { useMemo } from "react";
import {
  DataTable,
  type DataTableColumn,
} from "@/Components/Ui/Table/DataTable";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { truncateText } from "@/Utils";
import { TableActionButton } from "@/Components/Ui/Buttons/TableActionButton";
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { ASSIGNMENT_STATUS_BADGE } from '@/Constants/StatusBadges';
import type { EvidenceAssignment } from "@/Types/EvidenceAssignmentTypes";
import { formatDate, isOverdue } from "@/Types/EvidenceAssignmentTypes";
import { useFirstColumnConfig } from "@/Hooks/UseFirstColumnConfig";

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
  /** Callback al cambiar estado (toggle completado / en_progreso) */
  onStatusChange?: (
    assignment: EvidenceAssignment,
    newStatus: "en_progreso" | "completado",
  ) => void;
  /** Paginación */
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export const EvidenceAssignmentsTable: React.FC<
  EvidenceAssignmentsTableProps
> = ({
  assignments,
  loading = false,
  hasFilters = false,
  onViewDetails,
  onUploadFiles,
  onRequestExtension,
  onStatusChange,
  pagination,
}) => {
  const firstColumn = useFirstColumnConfig();

  // Configuración de columnas
  const columns = useMemo<DataTableColumn<EvidenceAssignment>[]>(
    () => [
      {
        key: "evidencia",
        header: "Evidencia",
        align: "left",
        width: firstColumn.width,
        render: (_: unknown, assignment: EvidenceAssignment) => {
          const { evidencia } = assignment;
          if (!evidencia)
            return <span className="text-gris-una">Sin información</span>;

          const fullText = `${evidencia.nomenclatura} - ${evidencia.descripcion}`;
          const criterionText = evidencia.criterion
            ? `${evidencia.criterion.nomenclatura} - ${evidencia.criterion.descripcion}`
            : "Sin criterio";

          return (
            <div className="flex flex-col pl-2">
              <p
                className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
                title={fullText}
              >
                {truncateText(fullText, firstColumn.maxLength)}
              </p>
              <p
                className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.helper}`}
                title={`Criterio: ${criterionText}`}
              >
                {truncateText(criterionText, firstColumn.maxLength)}
              </p>
            </div>
          );
        },
      },
      {
        key: "fecha_asignacion",
        header: "Fecha Asignación",
        align: "left",
        render: (_: unknown, assignment: EvidenceAssignment) => (
            <span
              className={`relative grid items-start font-sans text-negro-una-2 rounded-corner select-none whitespace-nowrap ${TYPOGRAPHY.table.cell}`}
            >
              {formatDate(assignment.fecha_asignacion)}
            </span>
        ),
      },
      {
        key: "fecha_limite",
        header: "Fecha Límite",
        align: "left",
        render: (_: unknown, assignment: EvidenceAssignment) => {
          const fechaLimite = assignment.fecha_limite
            ? formatDate(assignment.fecha_limite)
            : "Sin límite";
          const overdue = isOverdue(assignment);
          return (
            <span
              className={`relative grid items-start font-sans rounded-corner select-none whitespace-nowrap ${TYPOGRAPHY.table.cell} ${overdue ? "text-red-600 font-bold" : "text-negro-una-2"}`}
            >
              {fechaLimite}
            </span>
          );
        },
      },
      {
        key: "estado",
        header: "Estado",
        align: "left",
        render: (_: unknown, assignment: EvidenceAssignment) => {
          const estado = isOverdue(assignment) ? "vencido" : assignment.estado;
          return (
            <div className="flex justify-start">
              <StatusBadge
                label={ASSIGNMENT_STATUS_BADGE[estado]?.label ?? estado}
                colorClasses={ASSIGNMENT_STATUS_BADGE[estado]?.colorClasses ?? 'bg-gris-light text-gris-una'}
              />
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Acciones",
        align: "center",
        render: (_: unknown, assignment: EvidenceAssignment) => {
          // Determinar si puede solicitar ampliación
          // No puede solicitar si:
          // 1. Ya tiene una solicitud pendiente
          // 2. El estado no es pendiente o en_progreso
          const hasPendingRequest =
            assignment.has_pending_extension_request === true;
          const validStatus = ["pendiente", "en_progreso"].includes(
            assignment.estado,
          );
          const canRequestExtension = !hasPendingRequest && validStatus;

          // Tooltip dinámico
          let tooltip = "Solicitar ampliación";
          if (hasPendingRequest) {
            tooltip = "Ya hay una solicitud pendiente";
          } else if (!validStatus) {
            tooltip = "No se puede solicitar ampliación";
          }

          const isCompleted = assignment.estado === "completado";
          const canMarkCompleted = assignment.has_uploaded_files === true;
          const completeTooltip = isCompleted
            ? "Revertir a en progreso"
            : canMarkCompleted
              ? "Marcar completado"
              : "Debe subir al menos un archivo o enlace";

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

              {/* Botón de solicitar ampliación */}
              {onRequestExtension && (
                <TableActionButton
                  action="clock"
                  tooltip={tooltip}
                  onClick={() => onRequestExtension(assignment)}
                  disabled={!canRequestExtension}
                />
              )}

              {/* Toggle de estado: completado ↔ en_progreso */}
              {onStatusChange && (
                <TableActionButton
                  action={isCompleted ? "markInProgress" : "markComplete"}
                  tooltip={completeTooltip}
                  onClick={() =>
                    onStatusChange(
                      assignment,
                      isCompleted ? "en_progreso" : "completado",
                    )
                  }
                  disabled={!isCompleted && !canMarkCompleted}
                />
              )}
            </div>
          );
        },
      },
    ],
    [
      firstColumn,
      onViewDetails,
      onUploadFiles,
      onRequestExtension,
      onStatusChange,
    ],
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
          ? "No se encontraron asignaciones que coincidan con los filtros aplicados."
          : "No tienes evidencias asignadas. Cuando se te asigne una evidencia, aparecerá aquí."
      }
      pagination={pagination}
    />
  );
};
