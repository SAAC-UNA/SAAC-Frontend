import React, { useMemo } from "react";
import { DataTable } from "@/Components/Ui/Table/DataTable";
import { TableActionButton } from "@/Components/Ui/Buttons/TableActionButton";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { useFirstColumnConfig } from "@/Hooks/UseFirstColumnConfig";
import { truncateText } from "@/Utils";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { TABLE_COLUMN_WIDTHS } from "@/Constants/Components";
import { cn } from "@/Utils/ClassNames";
import { ACCREDITATION_CYCLE_STATUS_BADGE } from "@/Constants/StatusBadges";
import type { DataTableColumn } from "@/Components/Ui/Table/DataTable";
import type { AccreditationCycle } from "@/Types/AccreditationCycleTypes";

interface AccreditationCyclesTableProps {
  cycles: AccreditationCycle[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (cycle: AccreditationCycle) => void;
  onEdit?: (cycle: AccreditationCycle) => void;
  onDelete?: (cycle: AccreditationCycle) => void;
    onToggleStatus?: (cycle: AccreditationCycle) => void;
    onMarkComplete?: (cycle: AccreditationCycle) => void;
  canEdit: boolean;
  canDelete: boolean;
  canReactivate: boolean;
}

export const AccreditationCyclesTable: React.FC<
  AccreditationCyclesTableProps
> = ({
  cycles,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
    onToggleStatus,
    onMarkComplete,
  canEdit,
  canDelete,
  canReactivate,
}) => {
  const firstColumn = useFirstColumnConfig();

  const columns: DataTableColumn<AccreditationCycle>[] = useMemo(
    () => [
      {
        key: "carrera_sede",
        header: "Carrera – Sede",
        align: "left",
        width: firstColumn.width,
        render: (_, item) => {
          const cs = item.carrera_sede;
          const carrera = cs?.carrera_nombre ?? "—";
          const sede = cs?.sede_nombre ?? "—";
          return (
            <div className="flex flex-col">
              <span
                className={cn(
                  "block font-sans antialiased font-bold leading-normal text-negro-una-2",
                  TYPOGRAPHY.table.cell,
                )}
                title={`${carrera} – ${sede}`}
              >
                {truncateText(carrera, firstColumn.maxLength)}
              </span>
              <span
                className={cn(
                  "block font-sans antialiased font-normal leading-normal text-gris-una",
                  TYPOGRAPHY.badge,
                )}
              >
                {truncateText(sede, firstColumn.maxLength)}
              </span>
            </div>
          );
        },
      },
      {
        key: "nombre",
        header: "Nombre",
        align: "left",
        render: (_, item) => (
          <div className="flex items-start">
            <p
              className={cn(
                "block font-sans antialiased font-normal leading-normal text-negro-una-2",
                TYPOGRAPHY.table.cell,
              )}
              title={item.nombre}
            >
              {truncateText(item.nombre, firstColumn.maxLength)}
            </p>
          </div>
        ),
      },
      {
        key: "fecha_inicio",
        header: "Inicio",
        align: "right",
        render: (_, item) => (
          <span className={cn("block font-sans antialiased font-normal leading-normal text-negro-una-2", TYPOGRAPHY.table.cell)}>
            {item.fecha_inicio ?? "—"}
          </span>
        ),
      },
      {
        key: "fecha_fin",
        header: "Fin",
        align: "left",
        render: (_, item) => (
          <span className={cn("block font-sans antialiased font-normal leading-normal text-negro-una-2", TYPOGRAPHY.table.cell)}>
            {item.fecha_fin ?? "—"}
          </span>
        ),
      },
      {
        key: "estado",
        header: "Estado",
        align: "left",
        width: TABLE_COLUMN_WIDTHS.status,
        render: (_, item) => {
          const statusBadge = ACCREDITATION_CYCLE_STATUS_BADGE[item.estado];

          return (
            <div className="flex items-start">
              <StatusBadge
                label={statusBadge.label}
                colorClasses={statusBadge.colorClasses}
              />
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Acciones",
        align: "center",
        width: TABLE_COLUMN_WIDTHS.actionsLarge,
        render: (_, item) => (
          <div className="flex items-center justify-center gap-2">
            <TableActionButton
              action="view"
              tooltip="Ver detalles"
              onClick={() => onView(item)}
            />
            {canEdit && (
              <TableActionButton
                action="edit"
                tooltip={
                  item.estado === "completado"
                    ? "No se puede editar un ciclo completado"
                    : "Editar ciclo"
                }
                onClick={() => onEdit?.(item)}
                disabled={item.estado === "completado"}
              />
            )}
            {canReactivate && (
              <TableActionButton
                action="power"
                tooltip={
                  item.estado === "completado"
                    ? "No se puede cambiar el estado de un ciclo completado"
                    : item.estado === "activo"
                      ? "Inactivar ciclo"
                      : "Activar ciclo"
                }
                onClick={() => onToggleStatus?.(item)}
                isActive={item.estado === "activo"}
                disabled={item.estado === "completado"}
              />
            )}
            {canEdit && (
              <TableActionButton
                action="markComplete"
                tooltip={
                  item.estado !== "activo"
                    ? "Solo se puede completar un ciclo activo"
                    : "Marcar como completado"
                }
                onClick={() => onMarkComplete?.(item)}
                disabled={item.estado !== "activo"}
              />
            )}
            {canDelete && (
              <TableActionButton
                action="delete"
                tooltip="Eliminar ciclo"
                onClick={() => onDelete?.(item)}
              />
            )}
          </div>
        ),
      },
    ],
    [
      firstColumn,
      canEdit,
      canReactivate,
      canDelete,
      onView,
      onEdit,
      onDelete,
      onToggleStatus,
      onMarkComplete,
    ],
  );

  return (
    <div className="w-full">
      <DataTable
        title=""
        data={cycles as unknown as Record<string, unknown>[]}
        columns={
          columns as unknown as DataTableColumn<Record<string, unknown>>[]
        }
        loading={isLoading}
        searchable={false}
        emptyMessage="No hay ciclos de acreditación registrados."
        pagination={
          totalPages > 1 ? { currentPage, totalPages, onPageChange } : undefined
        }
        getRowKey={(item) =>
          String((item as unknown as AccreditationCycle).ciclo_acreditacion_id)
        }
      />
    </div>
  );
};
