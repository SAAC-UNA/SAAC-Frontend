/**
 * TreeSelect — Selector jerárquico para elementos de modelo flexible.
 *
 * Dos modos:
 * - `select`: navegación cascada por niveles, solo hojas seleccionables (con checkbox).
 * - `filter`: dropdowns dinámicos encadenados por nivel para filtrar.
 *
 * Agnóstico a la cantidad de niveles: se adapta a la profundidad del árbol.
 */

import React, { useState, useMemo, useCallback, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/Utils/ClassNames';
import { SystemIcons } from '../Icons/SystemIcons';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { ICON_SIZES } from '@/Constants/Components';
import { DROPDOWN_VARIANTS, SPRING_HOVER, SPRING_CHEVRON } from '@/Constants/Animations';

// Alias de tipografía para legibilidad
const TXT_SM = TYPOGRAPHY.body;        // 14px
const TXT_XS = TYPOGRAPHY.form.helper; // 12px
import type { FlexibleElement } from '@/Types/StructureModelTypes';
import {
  buildElementTree,
  getElementPath,
  getMaxDepth,
  getLeafElements,
  type ElementTreeNode,
} from '@/Utils/elementTreeUtils';

// ── Tipos ───────────────────────────────────────────────────────────────────

export interface TreeSelectProps {
  elements: FlexibleElement[];
  value: number[];
  onChange: (ids: number[]) => void;
  mode: 'select' | 'filter';
  multiple?: boolean;
  showPath?: boolean;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  required?: boolean;
}

// ── Componente principal ────────────────────────────────────────────────────

export const TreeSelect: React.FC<TreeSelectProps> = ({
  elements,
  value,
  onChange,
  mode,
  multiple = true,
  showPath = true,
  placeholder,
  label,
  disabled = false,
  error,
  className,
  required = false,
}) => {
  if (mode === 'filter') {
    return (
      <TreeSelectFilter
        elements={elements}
        value={value}
        onChange={onChange}
        label={label}
        disabled={disabled}
        error={error}
        className={className}
      />
    );
  }

  return (
    <TreeSelectCascade
      elements={elements}
      value={value}
      onChange={onChange}
      multiple={multiple}
      showPath={showPath}
      placeholder={placeholder}
      label={label}
      disabled={disabled}
      error={error}
      className={className}
      required={required}
    />
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODO SELECT (Cascada con checkboxes en hojas)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface TreeSelectCascadeProps {
  elements: FlexibleElement[];
  value: number[];
  onChange: (ids: number[]) => void;
  multiple: boolean;
  showPath: boolean;
  placeholder?: string;
  label?: string;
  disabled: boolean;
  error?: string;
  className?: string;
  required: boolean;
}

const TreeSelectCascade: React.FC<TreeSelectCascadeProps> = ({
  elements,
  value,
  onChange,
  multiple,
  showPath,
  placeholder = 'Seleccionar elementos...',
  label,
  disabled,
  error,
  className,
  required,
}) => {
  const uniqueId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Breadcrumb de navegación: IDs de nodos seleccionados en cada nivel
  const [breadcrumb, setBreadcrumb] = useState<number[]>([]);

  const tree = useMemo(() => buildElementTree(elements), [elements]);
  const leaves = useMemo(() => getLeafElements(elements), [elements]);
  const valueSet = useMemo(() => new Set(value), [value]);

  // Nodos visibles según el breadcrumb actual
  const visibleNodes = useMemo<ElementTreeNode[]>(() => {
    let nodes = tree;
    for (const id of breadcrumb) {
      const found = nodes.find((n) => n.elemento_id === id);
      if (found) nodes = found.children;
      else break;
    }
    return nodes;
  }, [tree, breadcrumb]);

  // Filtrar por búsqueda si hay texto
  const filteredLeaves = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const term = searchTerm.toLowerCase();
    return leaves.filter(
      (l) =>
        l.activo &&
        ((l.nombre ?? '').toLowerCase().includes(term) ||
          (l.nomenclatura ?? '').toLowerCase().includes(term) ||
          (l.descripcion ?? '').toLowerCase().includes(term)),
    );
  }, [leaves, searchTerm]);

  // Chips seleccionados
  const selectedLabels = useMemo(() => {
    return value.map((id) => {
      if (showPath) return getElementPath(id, elements);
      const el = elements.find((e) => e.elemento_id === id);
      return el?.nombre ?? el?.nomenclatura ?? `Elemento ${id}`;
    });
  }, [value, elements, showPath]);

  // Portal position
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 420),
    });
  }, [isOpen]);

  // Cerrar al click fuera
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const toggleValue = useCallback(
    (id: number) => {
      if (multiple) {
        onChange(valueSet.has(id) ? value.filter((v) => v !== id) : [...value, id]);
      } else {
        onChange(valueSet.has(id) ? [] : [id]);
        setIsOpen(false);
      }
    },
    [multiple, value, valueSet, onChange],
  );

  const navigateInto = useCallback((nodeId: number) => {
    setBreadcrumb((prev) => [...prev, nodeId]);
    setSearchTerm('');
  }, []);

  const navigateBack = useCallback(
    (toIndex: number) => {
      setBreadcrumb((prev) => prev.slice(0, toIndex));
      setSearchTerm('');
    },
    [],
  );

  const selectAll = useCallback(() => {
    const currentLeafIds = (filteredLeaves ?? leaves.filter((l) => l.activo)).map(
      (l) => l.elemento_id,
    );
    const allSelected = currentLeafIds.every((id) => valueSet.has(id));
    if (allSelected) {
      onChange(value.filter((id) => !currentLeafIds.includes(id)));
    } else {
      const newIds = currentLeafIds.filter((id) => !valueSet.has(id));
      onChange([...value, ...newIds]);
    }
  }, [filteredLeaves, leaves, value, valueSet, onChange]);

  const removeChip = useCallback(
    (id: number) => {
      onChange(value.filter((v) => v !== id));
    },
    [value, onChange],
  );

  const hasValue = value.length > 0;

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label
          htmlFor={uniqueId}
          className={`block mb-1 ${TXT_SM} font-medium text-negro-una`}
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        id={uniqueId}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full min-h-10.5 px-3 py-2 border rounded-lg text-left flex items-center gap-2 transition-colors',
          TXT_SM,
          disabled
            ? 'bg-gray-100 cursor-not-allowed border-gray-200'
            : error
              ? 'border-red-400 bg-white hover:border-red-500'
              : 'border-gray-300 bg-white hover:border-azul-una',
        )}
      >
        <div className="flex-1 flex flex-wrap gap-1 min-w-0">
          {hasValue ? (
            selectedLabels.map((label, i) => (
              <span
                key={value[i]}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-azul-una/10 text-azul-una text-xs max-w-full"
              >
                <span className="truncate">{label}</span>
                <button
                  type="button"
                  className="hover:text-red-500 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChip(value[i]);
                  }}
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-gris-una/50">{placeholder}</span>
          )}
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={SPRING_CHEVRON}
          className="shrink-0"
          style={{ display: 'flex' }}
        >
          <SystemIcons.interface.chevronDown className={`${ICON_SIZES.sm} text-gris-una`} />
        </motion.span>
      </button>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {/* Dropdown Portal */}
      <AnimatePresence>
        {isOpen &&
          createPortal(
            <motion.div
              ref={dropdownRef}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={DROPDOWN_VARIANTS}
              className="fixed z-9999 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
              style={{
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
              }}
            >
              {/* Barra de búsqueda */}
              <div className="p-2 border-b border-gray-100">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar elementos..."
                  className={`w-full px-3 py-1.5 border border-gray-200 rounded-md ${TXT_SM} focus:outline-none focus:border-azul-una`}
                />
              </div>

              {/* Breadcrumb de navegación */}
              {breadcrumb.length > 0 && !filteredLeaves && (
                <div className="px-3 py-1.5 border-b border-gray-100 flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => navigateBack(0)}
                    className="text-azul-una hover:underline text-xs font-medium"
                  >
                    Inicio
                  </button>
                  {breadcrumb.map((id, idx) => {
                    const el = elements.find((e) => e.elemento_id === id);
                    const elLabel = el?.nombre ?? el?.nomenclatura ?? el?.tipo ?? '';
                    return (
                      <React.Fragment key={id}>
                        <span className="text-gris-una text-xs">›</span>
                        <button
                          type="button"
                          onClick={() => navigateBack(idx + 1)}
                          className={cn(
                            'text-xs font-medium',
                            idx === breadcrumb.length - 1
                              ? 'text-negro-una cursor-default'
                              : 'text-azul-una hover:underline',
                          )}
                        >
                          {elLabel}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {/* Contenido: nodos o resultados de búsqueda */}
              <div className="max-h-64 overflow-y-auto">
                {filteredLeaves ? (
                  // Modo búsqueda: mostrar hojas filtradas
                  <>
                    {multiple && filteredLeaves.length > 0 && (
                      <div className="px-3 py-1.5 border-b border-gray-100">
                        <button
                          type="button"
                          onClick={selectAll}
                          className="text-xs text-azul-una hover:underline"
                        >
                          {filteredLeaves.every((l) => valueSet.has(l.elemento_id))
                            ? 'Deseleccionar todos'
                            : 'Seleccionar todos'}
                        </button>
                      </div>
                    )}
                    {filteredLeaves.length === 0 ? (
                      <p className="p-3 text-center text-gris-una text-sm">
                        Sin resultados para "{searchTerm}"
                      </p>
                    ) : (
                      filteredLeaves.map((leaf) => (
                        <LeafItem
                          key={leaf.elemento_id}
                          element={leaf}
                          selected={valueSet.has(leaf.elemento_id)}
                          path={getElementPath(leaf.elemento_id, elements)}
                          showPath
                          onToggle={() => toggleValue(leaf.elemento_id)}
                        />
                      ))
                    )}
                  </>
                ) : (
                  // Modo navegación: nodos del nivel actual
                  <>
                    {multiple && visibleNodes.some((n) => n.children.length === 0) && (
                      <div className="px-3 py-1.5 border-b border-gray-100">
                        <button
                          type="button"
                          onClick={selectAll}
                          className="text-xs text-azul-una hover:underline"
                        >
                          {visibleNodes
                            .filter((n) => n.children.length === 0 && n.activo)
                            .every((n) => valueSet.has(n.elemento_id))
                            ? 'Deseleccionar hojas'
                            : 'Seleccionar todas las hojas'}
                        </button>
                      </div>
                    )}
                    {visibleNodes.map((node) =>
                      node.children.length > 0 ? (
                        <BranchItem
                          key={node.elemento_id}
                          node={node}
                          selectedCount={countSelectedLeaves(node, valueSet)}
                          totalLeaves={countLeaves(node)}
                          onClick={() => navigateInto(node.elemento_id)}
                        />
                      ) : (
                        <LeafItem
                          key={node.elemento_id}
                          element={node}
                          selected={valueSet.has(node.elemento_id)}
                          onToggle={() => toggleValue(node.elemento_id)}
                        />
                      ),
                    )}
                  </>
                )}
              </div>

              {/* Footer con conteo */}
              <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="text-xs text-gris-una">
                  {value.length} de {leaves.filter((l) => l.activo).length} seleccionados
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-azul-una hover:underline font-medium"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>,
            document.body,
          )}
      </AnimatePresence>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODO FILTER (Dropdowns encadenados por nivel)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface TreeSelectFilterProps {
  elements: FlexibleElement[];
  value: number[];
  onChange: (ids: number[]) => void;
  label?: string;
  disabled: boolean;
  error?: string;
  className?: string;
}

const TreeSelectFilter: React.FC<TreeSelectFilterProps> = ({
  elements,
  onChange,
  label,
  disabled,
  error,
  className,
}) => {
  const tree = useMemo(() => buildElementTree(elements), [elements]);
  const maxDepth = useMemo(() => getMaxDepth(tree), [tree]);

  // Array de IDs seleccionados en cada nivel del filtro
  const [levelSelections, setLevelSelections] = useState<(number | null)[]>([]);

  // Opciones disponibles para cada nivel
  const levelOptions = useMemo(() => {
    const levels: Array<{ label: string; nodes: ElementTreeNode[] }> = [];
    let currentNodes = tree;

    for (let depth = 0; depth <= maxDepth; depth++) {
      if (currentNodes.length === 0) break;

      // Detectar tipo del nivel (usando el primer nodo)
      const tipoLabel = currentNodes[0]?.tipo ?? `Nivel ${depth + 1}`;

      levels.push({ label: tipoLabel, nodes: currentNodes });

      // Avanzar al siguiente nivel si hay una selección
      const selectedId = levelSelections[depth];
      if (selectedId !== null && selectedId !== undefined) {
        const selected = currentNodes.find((n) => n.elemento_id === selectedId);
        if (selected && selected.children.length > 0) {
          currentNodes = selected.children;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return levels;
  }, [tree, maxDepth, levelSelections]);

  const handleLevelChange = useCallback(
    (depth: number, nodeId: number | null) => {
      setLevelSelections((prev) => {
        // Truncar selecciones de niveles posteriores
        const next = prev.slice(0, depth);
        next[depth] = nodeId;
        return next;
      });

      // Emitir cambio: el valor es el último nodo seleccionado, o vacío
      if (nodeId !== null) {
        onChange([nodeId]);
      } else {
        // buscar el último nodo seleccionado en niveles anteriores
        const previous = levelSelections.slice(0, depth);
        const lastSelected = previous.reverse().find((id) => id !== null);
        onChange(lastSelected !== undefined && lastSelected !== null ? [lastSelected] : []);
      }
    },
    [levelSelections, onChange],
  );

  // Reset cuando cambian los elementos
  useEffect(() => {
    setLevelSelections([]);
  }, [elements]);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label className={`${TXT_SM} font-medium text-negro-una`}>
          {label}
        </label>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {levelOptions.map((level, depth) => (
          <div key={`${depth}-${level.label}`}>
            <label className={`block mb-1 ${TXT_XS} text-gris-una`}>
              {level.label}
            </label>
            <select
              value={levelSelections[depth]?.toString() ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                handleLevelChange(depth, val ? parseInt(val, 10) : null);
              }}
              disabled={disabled || level.nodes.length === 0}
              className={cn(
                'w-full px-3 py-2 border rounded-lg text-sm transition-colors',
                disabled
                  ? 'bg-gray-100 cursor-not-allowed border-gray-200'
                  : 'border-gray-300 bg-white hover:border-azul-una focus:outline-none focus:border-azul-una',
              )}
            >
              <option value="">Todos</option>
              {level.nodes
                .filter((n) => n.activo)
                .map((node) => (
                  <option key={node.elemento_id} value={node.elemento_id.toString()}>
                    {node.nomenclatura
                      ? `${node.nomenclatura} - ${node.nombre ?? node.tipo}`
                      : node.nombre ?? node.tipo}
                  </option>
                ))}
            </select>
          </div>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Sub-componentes para items del dropdown
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface BranchItemProps {
  node: ElementTreeNode;
  selectedCount: number;
  totalLeaves: number;
  onClick: () => void;
}

const BranchItem: React.FC<BranchItemProps> = ({ node, selectedCount, totalLeaves, onClick }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
    transition={SPRING_HOVER}
    className="w-full px-3 py-2 flex items-center gap-2 text-left"
  >
    <SystemIcons.interface.chevronRight className={`${ICON_SIZES.sm} text-gris-una shrink-0`} />
    <div className="flex-1 min-w-0">
      <p className={`${TXT_SM} text-negro-una font-medium truncate`}>
        {node.nomenclatura ? `${node.nomenclatura} - ` : ''}
        {node.nombre ?? node.tipo}
      </p>
      <p className={`${TXT_XS} text-gris-una`}>
        {node.children.length} sub-elementos
        {selectedCount > 0 && (
          <span className="text-azul-una ml-1">
            ({selectedCount}/{totalLeaves} sel.)
          </span>
        )}
      </p>
    </div>
  </motion.button>
);

interface LeafItemProps {
  element: FlexibleElement;
  selected: boolean;
  path?: string;
  showPath?: boolean;
  onToggle: () => void;
}

const LeafItem: React.FC<LeafItemProps> = ({ element, selected, path, showPath, onToggle }) => (
  <motion.button
    type="button"
    onClick={onToggle}
    whileHover={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
    transition={SPRING_HOVER}
    className="w-full px-3 py-2 flex items-center gap-2 text-left"
  >
    <input
      type="checkbox"
      checked={selected}
      readOnly
      className="h-4 w-4 rounded border-gray-300 text-azul-una focus:ring-azul-una shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className={`${TXT_SM} text-negro-una truncate`}>
        {element.nomenclatura ? `${element.nomenclatura} - ` : ''}
        {element.nombre ?? element.descripcion ?? element.tipo}
      </p>
      {showPath && path && (
        <p className={`${TXT_XS} text-gris-una truncate`} title={path}>
          {path}
        </p>
      )}
    </div>
  </motion.button>
);

// ── Helpers ──────────────────────────────────────────────────────────────────

function countLeaves(node: ElementTreeNode): number {
  if (node.children.length === 0) return 1;
  return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
}

function countSelectedLeaves(node: ElementTreeNode, selected: Set<number>): number {
  if (node.children.length === 0) return selected.has(node.elemento_id) ? 1 : 0;
  return node.children.reduce((sum, child) => sum + countSelectedLeaves(child, selected), 0);
}
