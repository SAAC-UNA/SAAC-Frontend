import React, { useState, useEffect } from 'react';
import { DataTable, ExpandableChildRow } from '@/Components/Ui/Table/DataTable';
import type { DataTableColumn } from '@/Components/Ui/Table/DataTable';
import { ButtonWithTooltip } from '@/Components/Ui/Buttons/ButtonWithTooltip';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { EvidenceFilesModal } from './EvidenceFilesModal';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { TABLE_ACTION_BUTTON } from '@/Constants/Components';

export interface Archivo {
  archivo_id: number;
  nombre_original: string;
  ruta_archivo: string;
  token_publico?: string;
  is_publico: boolean;
  link_expira_en?: string;
}

export interface Evidencia {
  id: number;
  nomenclatura: string;
  descripcion: string;
  criterio_id: number;
  archivos?: Archivo[];
}

export interface Criterio extends Record<string, unknown> {
  id: number;
  nomenclatura: string;
  descripcion: string;
  estado_aprobacion?: 'pendiente' | 'aprobado' | 'rechazado';
}

// ---------- EvidenceExpansionRow ----------

interface EvidenceExpansionProps {
  criterio: Criterio;
  evidences: Evidencia[];
  loadingFiles: Set<number>;
  onLoadFile: (id: number) => void;
  onOpenLink: (evidencia: Evidencia) => void;
}

const EvidenceExpansionRow: React.FC<EvidenceExpansionProps> = ({
  criterio,
  evidences,
  loadingFiles,
  onLoadFile,
  onOpenLink,
}) => {
  const criterionEvidences = evidences.filter(e => e.criterio_id === criterio.id);
  const [noFilesModal, setNoFilesModal] = useState<{ open: boolean; evidencia: Evidencia | null }>({
    open: false,
    evidencia: null,
  });

  useEffect(() => {
    criterionEvidences.forEach(ev => {
      if (!ev.archivos) onLoadFile(ev.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criterio.id]);

  if (criterionEvidences.length === 0) {
    return <p className={`px-4 py-3 ${TYPOGRAPHY.table.helper} text-gris-una`}>Sin evidencias</p>;
  }

  return (
    <>
      <div className="space-y-1">
        {criterionEvidences.map(evidencia => {
          const tieneArchivos = (evidencia.archivos?.length ?? 0) > 0;
          const tieneEnlace = (evidencia.archivos ?? []).some(a => a.is_publico && a.token_publico);
          const isLoadingFile = loadingFiles.has(evidencia.id);

          const action = isLoadingFile ? (
            <span className={`${TYPOGRAPHY.table.helper} text-gris-una px-2`}>Cargando...</span>
          ) : tieneEnlace ? (
            <div className="flex items-center gap-1.5">
              <StatusBadge label="Enlace listo" colorClasses="text-verde-dark bg-verde-ring" />
              <ButtonWithTooltip
                variant="tableView" size="sm"
                tooltip="Abrir enlace público" tooltipPosition="left"
                onClick={() => onOpenLink(evidencia)}
                className={TABLE_ACTION_BUTTON.button}
              >
                <SystemIcons.actions.linkIcon className={TABLE_ACTION_BUTTON.icon} />
              </ButtonWithTooltip>
            </div>
          ) : tieneArchivos ? (
            <div className="flex items-center gap-1.5">
              <StatusBadge label="Sin enlace" colorClasses="text-warning-dark bg-warning-ring" />
              <ButtonWithTooltip
                variant="tableView" size="sm"
                tooltip="Abrir enlace público" tooltipPosition="left"
                onClick={() => onOpenLink(evidencia)}
                className={TABLE_ACTION_BUTTON.button}
              >
                <SystemIcons.actions.linkIcon className={TABLE_ACTION_BUTTON.icon} />
              </ButtonWithTooltip>
            </div>
          ) : (
            <ButtonWithTooltip
              variant="tableView" size="sm"
              tooltip="Ver archivos asociados" tooltipPosition="left"
              onClick={() => setNoFilesModal({ open: true, evidencia })}
              className={TABLE_ACTION_BUTTON.button}
            >
              <SystemIcons.actions.view className={TABLE_ACTION_BUTTON.icon} />
            </ButtonWithTooltip>
          );

          return (
            <ExpandableChildRow
              key={evidencia.id}
              item={{
                key: String(evidencia.id),
                content: (
                  <p
                    className={`truncate flex-1 min-w-0 ${TYPOGRAPHY.table.helper}`}
                    title={`${evidencia.nomenclatura} — ${evidencia.descripcion}`}
                  >
                    <span className="font-medium text-negro-una">{evidencia.nomenclatura}</span>
                    <span className="text-gris-una"> — {evidencia.descripcion}</span>
                  </p>
                ),
                action,
              }}
            />
          );
        })}
      </div>

      <EvidenceFilesModal
        isOpen={noFilesModal.open}
        onClose={() => setNoFilesModal({ open: false, evidencia: null })}
        evidencia={noFilesModal.evidencia}
      />
    </>
  );
};

// ---------- FinalReportsTable ----------

interface FinalReportsTableProps {
  criteria: Criterio[];
  evidences: Evidencia[];
  loadingFiles: Set<number>;
  onLoadFile: (id: number) => void;
  onOpenLink: (evidencia: Evidencia) => void;
  onViewDetail: (criterio: Criterio) => void;
}

export const FinalReportsTable: React.FC<FinalReportsTableProps> = ({
  criteria,
  evidences,
  loadingFiles,
  onLoadFile,
  onOpenLink,
  onViewDetail,
}) => {
  const columns: DataTableColumn<Criterio>[] = [
    {
      key: 'nomenclatura',
      header: 'Criterio',
      render: (_, item) => (
        <p className={`truncate ${TYPOGRAPHY.table.cell}`} title={`${item.nomenclatura} — ${item.descripcion}`}>
          <span className="font-bold text-negro-una-2">{item.nomenclatura}</span>
          <span className="text-gris-una"> — {item.descripcion}</span>
        </p>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      width: '90px',
      render: (_, item) => (
        <div className="flex gap-1 justify-center" onClick={e => e.stopPropagation()}>
          <ButtonWithTooltip
            variant="tableView"
            size="sm"
            tooltip="Ver detalles"
            onClick={() => onViewDetail(item)}
            className={TABLE_ACTION_BUTTON.button}
          >
            <SystemIcons.actions.view className={TABLE_ACTION_BUTTON.icon} />
          </ButtonWithTooltip>
        </div>
      ),
    },
  ];

    return (
        <DataTable<Criterio>
            data={criteria}
            columns={columns}
            getRowKey={item => String(item.id)}
            searchable={false}
            expandableRow={item => [{
                key: String(item.id),
                noBorder: true,
                content: (
                <EvidenceExpansionRow
                    criterio={item}
                    evidences={evidences}
                    loadingFiles={loadingFiles}
                    onLoadFile={onLoadFile}
                    onOpenLink={onOpenLink}
                />
                ),
            }]}
            />
    );
};
