/**
 * Accordion - Acordeón multinivel para recursos de evidencia
 *
 * Jerarquía:
 *   ┌─ ˅  Evidencia 1 ─────────────────────────┐
 *   │  ┌──────────┬──────────┬────────────────┐ │
 *   │  │ Nombre   │ Archivos │ Acciones       │ │
 *   │  ├──────────┼──────────┼────────────────┤ │
 *   │  │ ˅ Resp A │ 2        │ ✎              │ │
 *   │  │   archivo1.pdf  PDF  806 KB  ↓ 🗑    │ │
 *   │  └──────────┴──────────┴────────────────┘ │
 *   ├─ ˅  Evidencia 2 ─────────────────────────┤
 *   └───────────────────────────────────────────┘
 *
 * Modos:
 *  - Multi-entrada: prop `entries` — un solo contenedor con varias evidencias
 *  - Entrada única: props `evidencia` + `groups` — retrocompatible
 */

import React, { useState } from 'react';
import { cn } from '@/Utils/ClassNames';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { TableActionButton } from '@/Components/Ui/Buttons/TableActionButton';
import { DataTable, type DataTableColumn, type ExpandableChildItem } from '@/Components/Ui/Table/DataTable';
import { FileList } from './FileList';
import type { FileModel } from '@/Types/FileTypes';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';

export interface ResponsableGroup {
  usuario_id: number;
  nombre: string;
  email: string;
  archivos: FileModel[];
}

const EMPTY_GROUPS: ResponsableGroup[] = [];
type GroupRow = ResponsableGroup & Record<string, unknown>;

interface EvidenciaInfo {
  id: number;
  nomenclatura: string;
  descripcion?: string;
}

/** Entrada para el modo multi-evidencia */
export interface EvidenciaEntry {
  evidencia: EvidenciaInfo;
  groups: ResponsableGroup[];
}

interface AccordionProps {
  entries?: EvidenciaEntry[];
  evidencia?: Omit<EvidenciaInfo, 'id'>;
  groups?: ResponsableGroup[];
  loading?: boolean;
  onDelete?: (fileId: number) => Promise<void>;
  /** Opcional: permite navegar a la pantalla de subida para un responsable (superusuario) */
  onUpload?: (evidenciaId: number, group: ResponsableGroup) => void;
}

function countLabel(archivos: FileModel[]): string {
  const total = archivos.length;
  return total > 0 ? `${total} recurso${total !== 1 ? 's' : ''}` : 'Sin recursos';
}

interface EvidenciaRowProps {
  ev: EvidenciaInfo;
  isExpanded: boolean;
  onToggle: (id: number) => void;
}

const EvidenciaRow: React.FC<EvidenciaRowProps> = ({ ev, isExpanded, onToggle }) => (
  <button
    type="button"
    onClick={() => onToggle(ev.id)}
    className="w-full pl-4 pr-6 py-4 bg-blanco-una hover:bg-gray-50 transition-colors flex items-center gap-3"
  >
    <SystemIcons.interface.chevronDown
      className={cn(
        `text-gris-una transition-transform duration-200 shrink-0 ${ICON_SIZES.sm}`,
        isExpanded && 'rotate-180'
      )}
    />
    <p className={`text-left text-negro-una-2 flex-1 ${TYPOGRAPHY.table.cell}`}>
      <span className="font-semibold mr-1">{ev.nomenclatura}</span>
      <span className="text-gris-una"> - {ev.descripcion}</span>
    </p>
  </button>
);

interface GroupsTableProps {
  evId: number;
  groups: ResponsableGroup[];
  onUpload?: (evidenciaId: number, group: ResponsableGroup) => void;
  onDelete?: (fileId: number) => Promise<void>;
}

const GroupsTable: React.FC<GroupsTableProps> = ({ evId, groups, onUpload, onDelete }) => {
  const columns: DataTableColumn<GroupRow>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (_, item) => (
        <span className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
          {(item as unknown as ResponsableGroup).nombre}
        </span>
      ),
    },
    {
      key: 'archivos',
      header: 'Recursos',
      align: 'center',
      render: (_, item) => (
        <span className={`text-gris-una-2 ${TYPOGRAPHY.table.caption}`}>
          {countLabel((item as unknown as ResponsableGroup).archivos)}
        </span>
      ),
    },
    ...(onUpload ? [{
      key: 'acciones',
      header: 'Acciones',
      align: 'center' as const,
      render: (_: unknown, item: GroupRow) => (
        <TableActionButton
          action="edit"
          customVariant="tableEdit"
          tooltip="Editar recursos"
          onClick={() => onUpload(evId, item as unknown as ResponsableGroup)}
        />
      ),
    }] : []),
  ];

  return (
    <DataTable<GroupRow>
      title=""
      searchable={false}
      data={groups as GroupRow[]}
      getRowKey={(item) => String((item as unknown as ResponsableGroup).usuario_id)}
      columns={columns}
      expandableRow={(item): ExpandableChildItem[] => [{
        key: 'files',
        noBorder: true,
        content: (
          <FileList
            files={(item as unknown as ResponsableGroup).archivos}
            loading={false}
            onDelete={onDelete}
            showActions={!!onDelete}
            emptyMessage="Este responsable no ha subido archivos aún"
          />
        ),
      }]}
    />
  );
};

export const Accordion: React.FC<AccordionProps> = ({
  entries,
  evidencia,
  groups = EMPTY_GROUPS,
  loading = false,
  onDelete,
  onUpload,
}) => {
  const [expandedEvidencias, setExpandedEvidencias] = useState<Set<number>>(new Set());

  const toggleEvidencia = (id: number) =>
    setExpandedEvidencias(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // MODO MULTI-EVIDENCIA
  if (entries) {
    if (loading) {
      return (
        <div className="border border-gray-200 rounded-corner">
          <p className={`text-gris-una text-center py-6 ${TYPOGRAPHY.table.cell}`}>
            Cargando recursos...
          </p>
        </div>
      );
    }

    return (
      <div className="border border-gray-200 rounded-corner overflow-hidden divide-y divide-gray-200">
        {entries.map(entry => {
          const isEvExpanded = expandedEvidencias.has(entry.evidencia.id);
          return (
            <React.Fragment key={entry.evidencia.id}>
              <EvidenciaRow ev={entry.evidencia} isExpanded={isEvExpanded} onToggle={toggleEvidencia} />
              {isEvExpanded && (
                entry.groups.length === 0
                  ? (
                    <p className={`pl-8 py-3 text-gris-una ${TYPOGRAPHY.table.cell}`}>
                      Sin recursos adjuntos
                    </p>
                  )
                  : (
                    <GroupsTable
                      evId={entry.evidencia.id}
                      groups={entry.groups}
                      onUpload={onUpload}
                      onDelete={onDelete}
                    />
                  )
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // MODO ENTRADA ÚNICA (retrocompatible)
  const singleId = 0;
  const isEvExpanded = expandedEvidencias.has(singleId);

  const groupsContent = groups.length === 0
    ? (
      <p className={`text-gris-una text-center py-4 px-4 ${TYPOGRAPHY.table.cell}`}>
        No hay recursos adjuntos
      </p>
    )
    : (
      <GroupsTable
        evId={singleId}
        groups={groups}
        onUpload={onUpload}
        onDelete={onDelete}
      />
    );

  if (!evidencia) {
    if (loading) {
      return (
        <div className="border border-gray-200 rounded-corner">
          <p className={`text-gris-una text-center py-4 ${TYPOGRAPHY.table.cell}`}>Cargando recursos...</p>
        </div>
      );
    }
    return (
      <div className="border border-gray-200 rounded-corner overflow-hidden">
        {groupsContent}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-corner overflow-hidden divide-y divide-gray-200">
      <EvidenciaRow ev={{ id: singleId, ...evidencia }} isExpanded={isEvExpanded} onToggle={toggleEvidencia} />
      {isEvExpanded && (
        loading
          ? <p className={`text-gris-una text-center py-4 ${TYPOGRAPHY.table.cell}`}>Cargando recursos...</p>
          : groupsContent
      )}
    </div>
  );
};

