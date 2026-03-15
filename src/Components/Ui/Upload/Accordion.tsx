/**
 * Accordion - Acordeón multinivel para recursos de evidencia
 *
 * Jerarquía flat (un solo contenedor, todos los niveles inline):
 *   ┌─ Evidencia 1 ──────────────────────── ▾ ─┐
 *   │  ↳ Responsable A (2 archivos)     ▾      │
 *   │    ↳ archivo1.pdf                         │
 *   │    ↳ archivo2.docx                        │
 *   │  ↳ Responsable B (1 enlace)       ▾      │
 *   ├─ Evidencia 2 ──────────────────────── ▾ ─┤
 *   └───────────────────────────────────────────┘
 *
 * Modos:
 *  - Multi-entrada: prop `entries` (array de evidencias con sus grupos) — un solo contenedor
 *  - Entrada única: props `evidencia` + `groups` — retrocompatible
 */

import React, { useState } from 'react';
import { cn } from '@/Utils/ClassNames';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { Button } from '@/Components/Ui/Buttons/Button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/Components/Ui/Feedback/Tooltip';
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

// Helpers compartidos

function countLabel(archivos: FileModel[]): string {
  const n = archivos.filter(f => f.tipo === 'archivo').length;
  const e = archivos.filter(f => f.tipo === 'enlace').length;
  return [
    n > 0 && `${n} archivo${n !== 1 ? 's' : ''}`,
    e > 0 && `${e} enlace${e !== 1 ? 's' : ''}`,
  ].filter(Boolean).join(' • ') || 'Sin recursos';
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
    className="w-full px-4 py-3 bg-blanco-una hover:bg-info-light transition-colors flex items-center justify-between"
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-info-light rounded-corner flex items-center justify-center flex-shrink-0">
        <SystemIcons.modal.document className={`text-azul-una ${ICON_SIZES.sm}`} />
      </div>
      <div className="text-left">
        <p className={`text-gris-una-2 ${TYPOGRAPHY.table.caption}`}>
          <span className={`text-gris-una-2 ${TYPOGRAPHY.table.cell} mr-2`}>
            {ev.nomenclatura}
          </span>
          - {ev.descripcion}
        </p>
      </div>
    </div>
    <SystemIcons.interface.chevronDown
      className={cn(
        `text-gris-una transition-transform duration-200 ${ICON_SIZES.sm}`,
        isExpanded && 'rotate-180'
      )}
    />
  </button>
);

interface UserRowProps {
  evId: number;
  group: ResponsableGroup;
  isExpanded: boolean;
  onToggle: (evId: number, userId: number) => void;
  onUpload?: (evidenciaId: number, group: ResponsableGroup) => void;
  onDelete?: (fileId: number) => Promise<void>;
}

const UserRow: React.FC<UserRowProps> = ({ evId, group, isExpanded, onToggle, onUpload, onDelete }) => {
  const key = `${evId}:${group.usuario_id}`;
  return (
    <React.Fragment key={key}>
      <div className="flex items-center">
        {/* Área de toggle: info del responsable */}
        <button
          type="button"
          onClick={() => onToggle(evId, group.usuario_id)}
          className="flex-1 pl-12 pr-4 py-3 bg-blanco-una hover:bg-warning-light transition-colors flex items-center gap-3"
        >            
          <div className="w-7 h-7 bg-warning-light rounded-corner flex items-center justify-center flex-shrink-0">
            <SystemIcons.users.user className={`text-warning ${ICON_SIZES.sm}`} />
          </div>
          <div className="text-left">
            <p className={`font-semibold text-negro-una-2 ${TYPOGRAPHY.table.cell}`}>
              {group.nombre}
            </p>
            <p className={`text-gris-una-2 ${TYPOGRAPHY.table.caption}`}>
              {countLabel(group.archivos)}
            </p>
          </div>
        </button>
        {/* Botón de edición — a la izquierda del chevron */}
        {onUpload && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onUpload(evId, group); }}
                className="flex-shrink-0 hover:bg-warning-light rounded-none px-3 py-3 h-full"
              >
                <SystemIcons.actions.edit className={`text-warning ${ICON_SIZES.sm}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              Editar recursos
            </TooltipContent>
          </Tooltip>
        )}
        {/* Chevron — rightmost, también activa el toggle */}
        <button
          type="button"
          onClick={() => onToggle(evId, group.usuario_id)}
          className="flex-shrink-0 px-3 py-3 bg-blanco-una hover:bg-gris-una/10 transition-colors border-l border-gris-una/10"
        >
          <SystemIcons.interface.chevronDown
            className={cn(
              `text-gris-una transition-transform duration-200 ${ICON_SIZES.sm}`,
              isExpanded && 'rotate-180'
            )}
          />
        </button>
      </div>
      {isExpanded && (
        <div className="pl-12 pr-4 pb-3 pt-2 bg-white">
          <FileList
            files={group.archivos}
            loading={false}
            onDelete={onDelete}
            showActions={!!onDelete}
            emptyMessage="Este responsable no ha subido archivos aún"
          />
        </div>
      )}
    </React.Fragment>
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
  // Estado expandido para evidencias (por id) y responsables (por usuario_id)
  const [expandedEvidencias, setExpandedEvidencias] = useState<Set<number>>(new Set());
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const toggleEvidencia = (id: number) =>
    setExpandedEvidencias(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // Clave única combinando evidencia + usuario para evitar colisiones entre evidencias
  const toggleUser = (evId: number, userId: number) => {
    const key = `${evId}:${userId}`;
    setExpandedUsers(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // MODO MULTI-EVIDENCIA
  if (entries) {
    if (loading) {
      return (
        <div className="border border-gray-200 rounded-corner">
          <p className={`text-gris-una text-center py-6 ${TYPOGRAPHY.table.cell}`}>
            Cargando archivos...
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
                    <p className={`pl-12 py-3 text-gris-una ${TYPOGRAPHY.table.cell}`}>
                      Sin recursos adjuntos
                    </p>
                  )
                  : entry.groups.map(group => (
                    <UserRow
                      key={`${entry.evidencia.id}:${group.usuario_id}`}
                      evId={entry.evidencia.id}
                      group={group}
                      isExpanded={expandedUsers.has(`${entry.evidencia.id}:${group.usuario_id}`)}
                      onToggle={toggleUser}
                      onUpload={onUpload}
                      onDelete={onDelete}
                    />
                  ))
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // MODO ENTRADA ÚNICA (retrocompatible)
  const singleId = 0; // id ficticio para entrada única
  const isEvExpanded = expandedEvidencias.has(singleId);

  const userRows = groups.length === 0
    ? (
      <p className={`text-gris-una text-center py-4 px-4 ${TYPOGRAPHY.table.cell}`}>
        No hay recursos adjuntos
      </p>
    )
    : groups.map(group => (
      <UserRow
        key={`${singleId}:${group.usuario_id}`}
        evId={singleId}
        group={group}
        isExpanded={expandedUsers.has(`${singleId}:${group.usuario_id}`)}
        onToggle={toggleUser}
        onUpload={onUpload}
        onDelete={onDelete}
      />
    ));

  if (!evidencia) {
    if (loading) {
      return (
        <div className="border border-gray-200 rounded-corner">
          <p className={`text-gris-una text-center py-4 ${TYPOGRAPHY.table.cell}`}>Cargando archivos...</p>
        </div>
      );
    }
    return (
      <div className="border border-gray-200 rounded-corner overflow-hidden divide-y divide-gray-100">
        {userRows}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-corner overflow-hidden divide-y divide-gray-200">
      <EvidenciaRow ev={{ id: singleId, ...evidencia }} isExpanded={isEvExpanded} onToggle={toggleEvidencia} />
      {isEvExpanded && (
        loading
          ? <p className={`text-gris-una text-center py-4 ${TYPOGRAPHY.table.cell}`}>Cargando archivos...</p>
          : <div className="divide-y divide-gray-100">{userRows}</div>
      )}
    </div>
  );
};

