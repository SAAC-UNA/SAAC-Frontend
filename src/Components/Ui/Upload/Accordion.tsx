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

export const Accordion: React.FC<AccordionProps> = ({
  entries,
  evidencia,
  groups = [],
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

  // Fila de evidencia (nivel 1) 
  const renderEvidenciaRow = (ev: EvidenciaInfo, isExpanded: boolean) => (
    <button
      type="button"
      onClick={() => toggleEvidencia(ev.id)}
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

  // Fila de responsable (nivel 2, indentada) 
  const renderUserRow = (evId: number, group: ResponsableGroup) => {
    const key = `${evId}:${group.usuario_id}`;
    const isExpanded = expandedUsers.has(key);
    return (
      <React.Fragment key={key}>
        <div className="flex items-center">
          {/* Área de toggle: info del responsable */}
          <button
            type="button"
            onClick={() => toggleUser(evId, group.usuario_id)}
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
            onClick={() => toggleUser(evId, group.usuario_id)}
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
              {renderEvidenciaRow(entry.evidencia, isEvExpanded)}
              {isEvExpanded && (
                entry.groups.length === 0
                  ? (
                    <p className={`pl-12 py-3 text-gris-una ${TYPOGRAPHY.table.cell}`}>
                      Sin recursos adjuntos
                    </p>
                  )
                  : entry.groups.map(group => renderUserRow(entry.evidencia.id, group))
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
    : groups.map(group => renderUserRow(singleId, group));

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
      {renderEvidenciaRow({ id: singleId, ...evidencia }, isEvExpanded)}
      {isEvExpanded && (
        loading
          ? <p className={`text-gris-una text-center py-4 ${TYPOGRAPHY.table.cell}`}>Cargando archivos...</p>
          : <div className="divide-y divide-gray-100">{userRows}</div>
      )}
    </div>
  );
};

export default Accordion;
