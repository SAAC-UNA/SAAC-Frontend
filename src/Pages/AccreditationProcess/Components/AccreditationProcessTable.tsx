import React, { useMemo, useRef, useState } from "react";
import { DataTable } from "@/components/index";
import type { DataTableColumn } from "@/Components/Ui/Table/DataTable";
import { TABLE_PAGE_SIZE } from "@/Constants/TablePagination";
import { useDebounce } from "@/Hooks/UseDebounce";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { TableActionButton } from "@/Components/Ui/Buttons/TableActionButton";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { TABLE_COLUMN_WIDTHS, TABLE_ACTION_BUTTON } from "@/Constants/Components";
import { ACCREDITATION_CYCLE_STATUS_BADGE } from "@/Constants/StatusBadges";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { formatDate } from "@/Utils/DateUtils";
import { truncateText } from '@/Utils';
import { useFirstColumnConfig } from "@/Hooks/UseFirstColumnConfig";
import type { AccreditationProcess as AccreditationProcessRow } from "@/Types/AccreditationProcessTypes";

interface AccreditationProcessTableProps {
  processes: AccreditationProcessRow[];
  isLoading: boolean;
  searchQuery?: string;
  onEdit?: (process: AccreditationProcessRow) => void;
  onView?: (process: AccreditationProcessRow) => void;
  onDelete?: (process: AccreditationProcessRow) => void;
  onConfigure?: (process: AccreditationProcessRow) => void;
  onToggleStatus?: (process: AccreditationProcessRow) => void;
}

const normalizeText = (value?: string) => {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export const AccreditationProcessTable: React.FC<
  AccreditationProcessTableProps
> = ({ processes, isLoading, searchQuery = "", onEdit, onView, onDelete, onConfigure, onToggleStatus }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const firstColumn = useFirstColumnConfig();

  const previousSearch = useRef(debouncedSearchQuery);

  if (previousSearch.current !== debouncedSearchQuery) {
    previousSearch.current = debouncedSearchQuery;
    setCurrentPage(1);
  }

  const filteredProcesses = useMemo(() => {
    const query = normalizeText(debouncedSearchQuery);

    return processes.filter((process) => {
      if (!query) return true;

      const statusLabel = process.status === "activo" ? "activo" : "inactivo";
      return (
        normalizeText(process.type).includes(query) ||
        normalizeText(process.accreditationCycleName).includes(query) ||
        normalizeText(process.careerName).includes(query) ||
        normalizeText(process.campusName).includes(query) ||
        normalizeText(statusLabel).includes(query)
      );
    });
  }, [processes, debouncedSearchQuery]);

  const safeItemsPerPage = TABLE_PAGE_SIZE.standard;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProcesses.length / safeItemsPerPage),
  );
  const boundedCurrentPage = Math.min(currentPage, totalPages);

  if (boundedCurrentPage !== currentPage) {
    setCurrentPage(boundedCurrentPage);
  }

  const paginatedData = useMemo(() => {
    const start = (boundedCurrentPage - 1) * safeItemsPerPage;
    return filteredProcesses.slice(start, start + safeItemsPerPage);
  }, [filteredProcesses, boundedCurrentPage, safeItemsPerPage]);

  const columns: DataTableColumn<AccreditationProcessRow>[] = useMemo(() => [
    {
      key: "accreditationCycleName",
      header: "Ciclo",
      align: "left",
      width: firstColumn.width,
      render: (_, process) => (
        <div className="flex flex-col">
          <p
            className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
            title={process.careerName || "Sin carrera"}
          >
            {process.careerName || "Sin carrera"}
          </p>
          <p
            className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.helper}`}
            title={process.accreditationCycleName} 
          >
            {process.accreditationCycleName}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipo de Proceso",
      align: "left",
      render: (_, process) => (
        <div className="flex flex-col items-start">
          <p
            className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
            title={process.type}
          >
            {truncateText(process.type, firstColumn.maxLength)}
          </p>
        </div>
      ),
    },
    {
      key: "startDate",
      header: "Fecha inicio",
      align: "left",
      render: (_, process) => (
        <p
          className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
        >
          {formatDate(process.startDate)}
        </p>
      ),
    },
    {
      key: "estimatedEndDate",
      header: "Fecha fin",
      align: "left",
      render: (_, process) => (
        <p
          className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
        >
          {formatDate(process.estimatedEndDate)}
        </p>
      ),
    },
    {
      key: "status",
      header: "Estado",
      align: "left",
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, process) => {
        const statusBadge = ACCREDITATION_CYCLE_STATUS_BADGE[process.status];

        return (
          <div className="flex justify-start">
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
      render: (_, process) => (
        <div className="flex items-center justify-center gap-2">
          <TableActionButton
            action="view"
            tooltip="Ver detalles"
            onClick={() => onView?.(process)}
          />
          <TableActionButton
            action="edit"
            tooltip="Editar proceso"
            onClick={() => onEdit?.(process)}
          />
          <TableActionButton
            action="nut"
            tooltip={process.type === "Compromiso de mejora" ? "Configurar compromisos" : "Disponible solo para compromisos"}
            onClick={() => onConfigure?.(process)}
            disabled={process.type !== "Compromiso de mejora"}
            customIcon={<SystemIcons.structure.nut className={TABLE_ACTION_BUTTON.icon} />}
          />
          <TableActionButton
            action="power"
            tooltip={process.status === "activo" ? "Inactivar proceso" : "Activar proceso"}
            onClick={() => onToggleStatus?.(process)}
            isActive={process.status === "activo"}
          />
          <TableActionButton
            action="delete"
            tooltip="Eliminar proceso"
            onClick={() => onDelete?.(process)}
          />
        </div>
      ),
    },
  ], [onView, onEdit, onDelete, onConfigure, onToggleStatus, firstColumn]);

  return (
    <div className="w-full">
      <DataTable
      data={paginatedData}
      columns={columns}
      title=""
      searchable={false}
      pagination={
        totalPages > 1
          ? {
              currentPage: boundedCurrentPage,
              totalPages,
              onPageChange: setCurrentPage,
            }
          : undefined
      }
      loading={isLoading}
      emptyMessage={
        debouncedSearchQuery
          ? `No se encontraron procesos que coincidan con "${debouncedSearchQuery}"`
          : "No hay procesos de acreditación registrados"
      }
    />
    </div>
  );
};
