/**
 * ChainedSingleSelect — CustomSelects encadenados dinámicamente para
 * estructuras jerárquicas de profundidad variable (N niveles).
 *
 * Igual que ChainedMultiSelect pero con selección única por nivel.
 * Emite el ID del último nodo seleccionado (puede ser rama o hoja).
 * Útil para filtros de búsqueda donde solo se necesita un valor activo.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { CustomSelect } from './SingleSelect';
import type { SelectOption } from '@/Components/Ui/Index';
import { TYPOGRAPHY } from '@/Constants/Typography';
import type { FlexibleElement } from '@/Types/StructureModelTypes';
import {
  buildElementTree,
  type ElementTreeNode,
} from '@/Utils/elementTreeUtils';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

export interface ChainedSingleSelectProps {
  elements: FlexibleElement[];
  /** ID del nodo actualmente seleccionado (null = sin selección) */
  value: number | null;
  onChange: (id: number | null) => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface Level {
  nodes: ElementTreeNode[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<string, string> = {
  dimension:   'Dimensión',
  area:        'Área',
  criterio:    'Criterio',
  subcriterio: 'Subcriterio',
  pauta:       'Pauta',
  indicador:   'Indicador',
  elemento:    'Elemento',
};

function tipoLabel(tipo: string): string {
  const key = tipo.toLowerCase();
  return TIPO_LABELS[key] ?? (tipo.charAt(0).toUpperCase() + tipo.slice(1));
}

function getLevelLabel(nodes: ElementTreeNode[]): string {
  if (nodes.length === 0) return 'Elemento';
  return tipoLabel(nodes[0].tipo);
}

function nodeToOption(node: ElementTreeNode): SelectOption {
  let label: string;
  if (node.nomenclatura && node.nombre) {
    label = `${node.nomenclatura} — ${node.nombre}`;
  } else {
    label = node.nombre ?? node.nomenclatura ?? node.tipo ?? `Elemento ${node.elemento_id}`;
  }
  return { value: String(node.elemento_id), label };
}

/** Busca un nodo en el árbol por ID. */
function findNode(id: number, nodes: ElementTreeNode[]): ElementTreeNode | null {
  for (const n of nodes) {
    if (n.elemento_id === id) return n;
    const found = findNode(id, n.children);
    if (found) return found;
  }
  return null;
}

/**
 * Reconstruye la cadena de ancestros de un nodo como array de IDs,
 * desde la raíz hasta el nodo (inclusive).
 */
function buildAncestorChain(id: number, elements: FlexibleElement[]): number[] {
  const map = new Map(elements.map((e) => [e.elemento_id, e]));
  const chain: number[] = [];
  let current = map.get(id);
  while (current) {
    chain.unshift(current.elemento_id);
    current = current.padre_id !== null ? map.get(current.padre_id) : undefined;
  }
  return chain;
}

/**
 * Construye los niveles visibles dado el path de selecciones.
 * path[i] = ID seleccionado en el nivel i.
 */
function buildLevels(tree: ElementTreeNode[], path: (number | null)[]): Level[] {
  if (tree.length === 0) return [];

  const levels: Level[] = [{ nodes: tree }];

  for (let i = 0; i < path.length; i++) {
    const selectedId = path[i];
    if (selectedId === null) break;

    const node = findNode(selectedId, levels[i].nodes);
    if (!node || node.children.length === 0) break;

    levels.push({ nodes: node.children.filter((n) => n.activo) });
  }

  return levels;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export const ChainedSingleSelect: React.FC<ChainedSingleSelectProps> = ({
  elements,
  value,
  onChange,
  disabled = false,
  loading = false,
  label,
  size = 'sm',
}) => {
  const tree = useMemo(() => buildElementTree(elements), [elements]);

  /**
   * path[i] = ID del nodo seleccionado en el nivel i.
   * Se deriva del `value` externo reconstruyendo la cadena de ancestros,
   * pero se mantiene como estado interno para que los niveles intermedios
   * persistan aunque el nodo final no sea hoja.
   */
  const [path, setPath] = useState<(number | null)[]>([]);

  // Sincronizar path desde value externo (ej: reset desde fuera)
  useEffect(() => {
    if (value === null) {
      setPath([]);
    } else {
      const chain = buildAncestorChain(value, elements);
      setPath(chain.map((id) => id));
    }
  }, [value, elements]);

  // Resetear al cambiar los elementos (nuevo proceso)
  useEffect(() => {
    setPath([]);
  }, [elements]);

  const levels = useMemo(() => buildLevels(tree, path), [tree, path]);

  const handleChange = (levelIdx: number, newStrId: string) => {
    if (newStrId === '' || newStrId === '__clear__') {
      // Limpiar desde este nivel en adelante
      const newPath = path.slice(0, levelIdx);
      setPath(newPath);
      // El valor emitido es el último seleccionado antes de este nivel
      const lastSelected = newPath[newPath.length - 1] ?? null;
      onChange(lastSelected);
      return;
    }

    const newId = Number(newStrId);
    const newPath = path.slice(0, levelIdx);
    newPath[levelIdx] = newId;
    setPath(newPath);

    // Emitir el nodo seleccionado (puede ser rama o hoja)
    onChange(newId);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-gris-una">
        <span className="inline-block w-4 h-4 border-2 border-gris-una/40 border-t-azul-una rounded-full animate-spin" />
        <span className={TYPOGRAPHY.form.helper}>Cargando estructura...</span>
      </div>
    );
  }

  if (elements.length === 0) return null;

  const ALL_LABEL_PREFIX = 'Todos/as las';

  return (
    <div className="flex flex-col gap-4">
      {label && (
        <p className={`${TYPOGRAPHY.form.label} font-medium text-negro-una`}>{label}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {levels.map((level, levelIdx) => {
          const levelLabel = getLevelLabel(level.nodes);
          const selectedId = path[levelIdx] ?? null;
          const options: SelectOption[] = [
            { value: '__clear__', label: `${ALL_LABEL_PREFIX} ${levelLabel.toLowerCase()}s` },
            ...level.nodes.map(nodeToOption),
          ];

          return (
            <CustomSelect
              key={levelIdx}
              label={levelLabel}
              value={selectedId !== null ? String(selectedId) : '__clear__'}
              options={options}
              onChange={(val) => handleChange(levelIdx, val)}
              disabled={disabled || (levelIdx > 0 && path[levelIdx - 1] === null)}
              searchable
              minItemsForSearch={5}
              size={size}
            />
          );
        })}
      </div>
    </div>
  );
};
