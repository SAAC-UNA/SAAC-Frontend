import React, { useMemo, useRef, useState } from "react";
import { DataTable } from "@/components/index";
import type { DataTableColumn } from "@/Components/Ui/Table/DataTable";
import { TABLE_PAGE_SIZE } from "@/Constants/TablePagination";
import { useDebounce } from "@/Hooks/UseDebounce";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { TableActionButton } from "@/Components/Ui/Buttons/TableActionButton";
import { ButtonWithTooltip } from "@/Components/Ui/Buttons/ButtonWithTooltip";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { TABLE_ACTION_BUTTON } from "@/Constants/Components";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { formatDateShort } from "@/Utils/DateUtils";
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

  const columns: DataTableColumn<AccreditationProcessRow>[] = [
    {
      key: "type",
      header: "Tipo de Proceso",
      align: "center",
      render: (_, process) => (
        <p
          className={`block text-center font-sans antialiased font-semibold leading-normal text-negro-una-2 text-[13px] ${TYPOGRAPHY.table.cell}`}
        >
          {process.type}
        </p>
      ),
    },
    {
      key: "accreditationCycleName",
      header: "Ciclo",
      align: "center",
      render: (_, process) => (
        <div className="flex flex-col items-center justify-center leading-tight">
          <p
            className={`block text-center font-sans antialiased font-semibold text-negro-una-2 text-[13px] ${TYPOGRAPHY.table.cell}`}
          >
            {process.accreditationCycleName}
          </p>
          <p
            className="text-[10px] font-semibold text-gris-una-2/90 max-w-[220px] truncate"
            title={process.careerName || "Sin carrera"}
          >
            {process.careerName || "Sin carrera"}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      align: "center",
      render: (_, process) => (
        <div className="flex w-full items-center justify-center">
          <StatusBadge
            label={process.status === "activo" ? "Activo" : "Inactivo"}
            colorClasses={
              process.status === "activo"
                ? "text-verde-dark bg-verde-ring font-semibold text-[11px]"
                : "text-error-dark bg-error-ring font-semibold text-[11px]"
            }
          />
        </div>
      ),
    },
    {
      key: "period",
      header: "Periodo",
      align: "center",
      render: (_, process) => (
        <div className="flex flex-col items-center justify-center leading-tight">
          <p
            className={`block text-center font-sans antialiased font-semibold text-negro-una-2 text-[12px] ${TYPOGRAPHY.table.cell}`}
          >
            Inicio: {formatDateShort(process.startDate)}
          </p>
          <p className="text-[11px] font-semibold text-gris-una-2">
            Fin: {formatDateShort(process.estimatedEndDate)}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      align: "center",
      render: (_, process) => {
        const isCompromiso = process.type === 'Compromiso de mejora';
        return (
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
            <ButtonWithTooltip
              variant="tableView"
              size="sm"
              tooltip={isCompromiso ? 'Configurar criterios' : 'No se configura en esta sección'}
              disabled={!isCompromiso}
              onClick={() => isCompromiso && onConfigure?.(process)}
              className={TABLE_ACTION_BUTTON.button}
            >
              <SystemIcons.structure.nut className={TABLE_ACTION_BUTTON.icon} />
            </ButtonWithTooltip>
            <TableActionButton
              action="delete"
              tooltip="Eliminar proceso"
              onClick={() => onDelete?.(process)}
            />
          </div>
        );
      },
    },
  ];

  return (
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
  );
};
