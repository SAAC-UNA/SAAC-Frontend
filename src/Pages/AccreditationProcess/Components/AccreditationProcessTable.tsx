import React, { useMemo, useRef, useState } from "react";
import { DataTable } from "@/components/index";
import type { DataTableColumn } from "@/Components/Ui/Table/DataTable";
import { TABLE_PAGE_SIZE } from "@/Constants/TablePagination";
import { useDebounce } from "@/Hooks/UseDebounce";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { TableActionButton } from "@/Components/Ui/Buttons/TableActionButton";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { TABLE_COLUMN_WIDTHS, TABLE_ACTION_BUTTON } from "@/Constants/Components";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { formatDateShort } from "@/Utils/DateUtils";
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
> = ({ processes, isLoading, searchQuery = "", onEdit, onView, onDelete, onConfigure }) => {
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
        <div className="flex flex-col pl-2">
          <p
            className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
            title={process.accreditationCycleName}
          >
            {process.accreditationCycleName}
          </p>
          <p
            className={`block font-sans antialiased font-normal leading-normal text-gris-una ${TYPOGRAPHY.table.helper}`}
            title={process.careerName || "Sin carrera"}
          >
            {process.careerName || "Sin carrera"}
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
      key: "period",
      header: "Periodo",
      align: "left",
      render: (_, process) => (
        <div className="flex flex-col items-start">
          <p
            className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
          >
            Inicio: {formatDateShort(process.startDate)}
          </p>
          <p
            className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
          >
            Fin: {formatDateShort(process.estimatedEndDate)}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      align: "left",
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, process) => (
        <div className="flex justify-start">
          <StatusBadge
            label={process.status === "activo" ? "Activo" : "Inactivo"}
            colorClasses={
              process.status === "activo"
                ? "text-verde-dark bg-verde-ring"
                : "text-error-dark bg-error-ring"
            }
          />
        </div>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      align: "center",
      render: (_, process) => (
        <div className="flex items-center justify-center gap-2 pr-2">
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
            action="custom"
            tooltip={process.type === "Compromiso de mejora" ? "Configurar compromisos" : "Solo disponible para Compromisos de mejora"}
            onClick={() => onConfigure?.(process)}
            disabled={process.type !== "Compromiso de mejora"}
            customIcon={<SystemIcons.structure.nut className={TABLE_ACTION_BUTTON.icon} />}
            customVariant="tableView"
          />
          <TableActionButton
            action="delete"
            tooltip="Eliminar proceso"
            onClick={() => onDelete?.(process)}
          />
        </div>
      ),
    },
  ], [onView, onEdit, onDelete, onConfigure, firstColumn]);

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
