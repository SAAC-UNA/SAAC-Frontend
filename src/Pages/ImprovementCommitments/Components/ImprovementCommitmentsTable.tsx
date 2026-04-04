import React, { useMemo } from 'react';
import { DataTable } from '@/Components/Ui/Table/DataTable';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { useFirstColumnConfig } from '@/Hooks/UseFirstColumnConfig';
import { truncateText } from '@/Utils';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_COLUMN_WIDTHS } from '@/Constants/Components';
import { formatDateShort } from '@/Utils/DateUtils';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import type { CompromisoMejora } from '@/Types/ImprovementCommitmentTypes';

interface ImprovementCommitmentsTableProps {
  commitments: CompromisoMejora[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (id: number) => void;
}

export const ImprovementCommitmentsTable: React.FC<ImprovementCommitmentsTableProps> = ({
  commitments,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onView,
}) => {
  const firstColumn = useFirstColumnConfig();

  const columns: DataTableColumn<CompromisoMejora>[] = useMemo(() => [
    {
      key: 'descripcion',
      header: 'Descripción',
      align: 'left',
      width: firstColumn.width,
      render: (_, compromiso) => (
        <div className="flex items-start">
          <p
            className={`block font-sans antialiased font-bold leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}
            title={compromiso.descripcion || 'Sin descripción'}
          >
            {truncateText(compromiso.descripcion, firstColumn.maxLength) || 'Sin descripción'}
          </p>
        </div>
      ),
    },
    {
      key: 'fecha_inicio',
      header: 'Fecha Inicio',
      align: 'left',
      render: (_, compromiso) => (
        <p className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
          {formatDateShort(compromiso.fecha_inicio)}
        </p>
      ),
    },
    {
      key: 'fecha_fin',
      header: 'Fecha Fin',
      align: 'left',
      render: (_, compromiso) => (
        <p className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
          {formatDateShort(compromiso.fecha_fin)}
        </p>
      ),
    },
    {
      key: 'criterios',
      header: 'Criterios',
      align: 'left',
      render: (_, compromiso) => (
        <p className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
          {compromiso.selecciones?.length || 0}
        </p>
      ),
    },
    {
      key: 'asignaciones',
      header: 'Asignaciones',
      align: 'left',
      render: (_, compromiso) => (
        <p className={`block font-sans antialiased font-normal leading-normal text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
          {compromiso.assignedEvidences?.length || 0}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'left',
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, compromiso) => (
        <div className="flex items-start">
          <StatusBadge
            label={compromiso.is_overdue ? 'Vencido' : 'Activo'}
            colorClasses={
              compromiso.is_overdue
                ? 'text-error-dark bg-error-ring'
                : 'text-verde-dark bg-verde-ring'
            }
          />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      width: TABLE_COLUMN_WIDTHS.actionsSmall,
      render: (_, compromiso) => (
        <div className="flex items-center justify-center gap-2 pr-2">
          <TableActionButton
            action="view"
            tooltip="Ver detalles"
            onClick={() => onView(compromiso.compromiso_mejora_id)}
          />
        </div>
      ),
    },
  ], [firstColumn, onView]);

  return (
    <div className="w-full">
      <DataTable
        data={commitments as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn<Record<string, unknown>>[]}
        title=""
        searchable={false}
        pagination={
          totalPages > 1
            ? { currentPage, totalPages, onPageChange }
            : undefined
        }
        loading={isLoading}
        emptyMessage="No hay compromisos registrados. Utilice el botón 'Crear' para registrar un nuevo compromiso de mejora."
      />
    </div>
  );
};
