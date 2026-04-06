/**
 * ChainedMultiSelect � MultiSelects encadenados dinamicamente para estructuras
 * jerarquicas de profundidad variable (N niveles).
 *
 * Genera un MultiSelect por cada nivel del arbol. Al seleccionar elementos en
 * el nivel N, el nivel N+1 muestra unicamente los hijos de los nodos activos.
 * La seleccion final (emitida por onChange) son los IDs de los nodos hoja del
 * ultimo nivel visible que el usuario marco.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { MultiSelect } from './MultiSelect';
import type { MultiSelectOption } from './MultiSelect';
import { TYPOGRAPHY } from '@/Constants/Typography';
import type { FlexibleElement } from '@/Types/StructureModelTypes';
import {
  buildElementTree,
  type ElementTreeNode,
} from '@/Utils/elementTreeUtils';

export interface ChainedMultiSelectProps {
  elements: FlexibleElement[];
  value: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  error?: string;
}

interface Level {
  nodes: ElementTreeNode[];
  isLeafLevel: boolean;
}

const TIPO_LABELS: Record<string, { singular: string; plural: string }> = {
  dimension:   { singular: 'Dimensión',   plural: 'Dimensiones'   },
  area:        { singular: 'Área',         plural: 'Áreas'         },
  criterio:    { singular: 'Criterio',    plural: 'Criterios'    },
  subcriterio: { singular: 'Subcriterio', plural: 'Subcriterios' },
  pauta:       { singular: 'Pauta',       plural: 'Pautas'       },
  indicador:   { singular: 'Indicador',   plural: 'Indicadores'  },
  elemento:    { singular: 'Elemento',    plural: 'Elementos'    },
};

function tipoLabel(tipo: string, plural = false): string {
  const key = tipo.toLowerCase();
  const entry = TIPO_LABELS[key];
  if (entry) return plural ? entry.plural : entry.singular;
  const cap = tipo.charAt(0).toUpperCase() + tipo.slice(1);
  return plural ? `${cap}s` : cap;
}

function getLevelLabel(nodes: ElementTreeNode[], plural = false): string {
  if (nodes.length === 0) return plural ? 'Elementos' : 'Elemento';
  return tipoLabel(nodes[0].tipo, plural);
}

function nodeToOption(node: ElementTreeNode): MultiSelectOption {
  let label: string;
  if (node.nomenclatura && node.nombre) {
    label = `${node.nomenclatura} — ${node.nombre}`;
  } else {
    label = node.nombre ?? node.nomenclatura ?? node.tipo ?? `Elemento ${node.elemento_id}`;
  }
  return { value: String(node.elemento_id), label };
}

function allLeaf(nodes: ElementTreeNode[]): boolean {
  return nodes.every((n) => n.children.length === 0);
}

function buildLevels(tree: ElementTreeNode[], branchSels: number[][]): Level[] {
  if (tree.length === 0) return [];

  const levels: Level[] = [{ nodes: tree, isLeafLevel: allLeaf(tree) }];

  for (let i = 0; i < branchSels.length; i++) {
    const prev = levels[i];
    if (prev.isLeafLevel) break;

    const selectedIds = branchSels[i] ?? [];
    if (selectedIds.length === 0) break;

    const children = prev.nodes
      .filter((n) => selectedIds.includes(n.elemento_id))
      .flatMap((n) => n.children)
      .filter((n) => n.activo);

    if (children.length === 0) break;
    levels.push({ nodes: children, isLeafLevel: allLeaf(children) });
  }

  return levels;
}

function collectLeafIds(node: ElementTreeNode): number[] {
  if (node.children.length === 0) return [node.elemento_id];
  return node.children.flatMap(collectLeafIds);
}

export const ChainedMultiSelect: React.FC<ChainedMultiSelectProps> = ({
  elements,
  value,
  onChange,
  disabled = false,
  loading = false,
  required = false,
  error,
}) => {
  const tree = useMemo(() => buildElementTree(elements), [elements]);

  const [branchSels, setBranchSels] = useState<number[][]>([]);

  // Resetear ramas cuando cambian los elementos (nuevo proceso)
  useEffect(() => {
    setBranchSels([]);
  }, [elements]);

  // Resetear ramas cuando value se limpia externamente (ej: cambio de proceso)
  const prevValueLengthRef = React.useRef(value.length);
  useEffect(() => {
    if (prevValueLengthRef.current > 0 && value.length === 0) {
      setBranchSels([]);
    }
    prevValueLengthRef.current = value.length;
  }, [value.length]);

  const levels = useMemo(() => buildLevels(tree, branchSels), [tree, branchSels]);

  const getSelectionForLevel = (levelIdx: number, level: Level): number[] => {
    if (level.isLeafLevel) {
      return value.filter((id) => level.nodes.some((n) => n.elemento_id === id));
    }
    return branchSels[levelIdx] ?? [];
  };

  const handleChange = (levelIdx: number, level: Level, newStrIds: string[]) => {
    const newIds = newStrIds.map(Number);

    if (level.isLeafLevel) {
      onChange(newIds);
      return;
    }

    setBranchSels((prev) => {
      const next = prev.slice(0, levelIdx);
      next[levelIdx] = newIds;
      return next;
    });

    if (newIds.length === 0) {
      onChange([]);
    } else {
      const validLeafIds = new Set(
        level.nodes
          .filter((n) => newIds.includes(n.elemento_id))
          .flatMap(collectLeafIds),
      );
      onChange(value.filter((id) => validLeafIds.has(id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-gris-una">
        <span className="inline-block w-4 h-4 border-2 border-gris-una/40 border-t-azul-una rounded-full animate-spin" />
        <span className={TYPOGRAPHY.form.helper}>Cargando estructura...</span>
      </div>
    );
  }

  if (elements.length === 0) {
    return (
      <p className={`${TYPOGRAPHY.form.helper} text-gris-una py-2`}>
        No hay elementos disponibles para este proceso.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {levels.map((level, levelIdx) => {
        const isLastVisible = levelIdx === levels.length - 1;
        const isLeaf = level.isLeafLevel;
        const selectedInLevel = getSelectionForLevel(levelIdx, level);
        const options = level.nodes.filter((n) => n.activo).map(nodeToOption);

        const label = getLevelLabel(level.nodes);
        const labelPlural = getLevelLabel(level.nodes, true);
        const prevLabel = levelIdx > 0 ? getLevelLabel(levels[levelIdx - 1].nodes) : '';
        const placeholder =
          levelIdx === 0
            ? `Seleccione ${labelPlural.toLowerCase()}...`
            : `Seleccione ${labelPlural.toLowerCase()} de la ${prevLabel.toLowerCase()} elegida`;

        return (
          <div key={levelIdx}>
            <MultiSelect
              label={label}
              required={isLeaf && required}
              options={options}
              value={selectedInLevel.map(String)}
              onChange={(vals) => handleChange(levelIdx, level, vals)}
              placeholder={placeholder}
              disabled={
                disabled ||
                (levelIdx > 0 && (branchSels[levelIdx - 1] ?? []).length === 0)
              }
              showSelectAll
              selectAllText={`Seleccionar todos las ${labelPlural.toLowerCase()}`}
              deselectAllText="Deseleccionar todos"
              searchable
            />
            {(!isLastVisible || !isLeaf) && (
              <p className={`mt-1 ${TYPOGRAPHY.form.helper} text-gris-una`}>
                {selectedInLevel.length > 0
                  ? `${selectedInLevel.length} ${(selectedInLevel.length === 1 ? label : labelPlural).toLowerCase()} seleccionado${selectedInLevel.length !== 1 ? 's' : ''}`
                  : `Seleccione al menos una ${label.toLowerCase()} para continuar`}
              </p>
            )}
          </div>
        );
      })}

      {error && (
        <p className={`${TYPOGRAPHY.form.helper} text-rojo-una-2`}>{error}</p>
      )}
    </div>
  );
};
