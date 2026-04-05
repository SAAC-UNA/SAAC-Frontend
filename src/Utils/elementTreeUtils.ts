/**
 * elementTreeUtils — Utilidades para convertir la lista plana de FlexibleElement
 * en un árbol anidado y funciones auxiliares de navegación jerárquica.
 *
 * El sistema es agnóstico a la cantidad de niveles: soporta 1, 2, 7 o N niveles.
 */

import type { FlexibleElement } from '@/Types/StructureModelTypes';

export interface ElementTreeNode extends FlexibleElement {
  children: ElementTreeNode[];
  depth: number;
  path: string; // "Área > Sub-área > ... > Pauta"
}

/**
 * Convierte una lista plana de elementos en un árbol anidado.
 * Los nodos raíz son aquellos con `padre_id === null`.
 */
export function buildElementTree(elements: FlexibleElement[]): ElementTreeNode[] {
  const map = new Map<number, ElementTreeNode>();
  const roots: ElementTreeNode[] = [];

  // Crear nodos sin hijos ni profundidad aún
  for (const el of elements) {
    map.set(el.elemento_id, {
      ...el,
      children: [],
      depth: 0,
      path: '',
    });
  }

  // Conectar padres e hijos
  for (const node of map.values()) {
    if (node.padre_id !== null) {
      const parent = map.get(node.padre_id);
      if (parent) {
        parent.children.push(node);
      } else {
        // Padre no encontrado: tratar como raíz
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  // Calcular depth y path con recorrido BFS
  const queue: Array<{ node: ElementTreeNode; parentPath: string; depth: number }> = roots.map(
    (r) => ({ node: r, parentPath: '', depth: 0 }),
  );

  while (queue.length > 0) {
    const { node, parentPath, depth } = queue.shift()!;
    node.depth = depth;
    const label = getNodeLabel(node);
    node.path = parentPath ? `${parentPath} > ${label}` : label;
    for (const child of node.children) {
      queue.push({ node: child, parentPath: node.path, depth: depth + 1 });
    }
  }

  return roots;
}

/**
 * Obtiene la ruta completa de un elemento recorriendo padre_id hacia arriba.
 * Útil cuando no se ha construido el árbol completo.
 */
export function getElementPath(elementId: number, elements: FlexibleElement[]): string {
  const map = new Map<number, FlexibleElement>();
  for (const el of elements) {
    map.set(el.elemento_id, el);
  }

  const parts: string[] = [];
  let current = map.get(elementId);

  while (current) {
    parts.unshift(getNodeLabel(current));
    current = current.padre_id !== null ? map.get(current.padre_id) : undefined;
  }

  return parts.join(' > ');
}

/**
 * Obtiene todas las hojas descendientes de un nodo dado.
 * Si el nodo es una hoja, se retorna a sí mismo.
 */
export function getLeafDescendants(nodeId: number, tree: ElementTreeNode[]): ElementTreeNode[] {
  const node = findNode(nodeId, tree);
  if (!node) return [];
  return collectLeaves(node);
}

/**
 * Obtiene la lista de ancestros de un elemento (desde la raíz hasta el padre directo).
 */
export function getAncestors(elementId: number, elements: FlexibleElement[]): FlexibleElement[] {
  const map = new Map<number, FlexibleElement>();
  for (const el of elements) {
    map.set(el.elemento_id, el);
  }

  const ancestors: FlexibleElement[] = [];
  let current = map.get(elementId);

  if (!current) return ancestors;

  current = current.padre_id !== null ? map.get(current.padre_id) : undefined;
  while (current) {
    ancestors.unshift(current);
    current = current.padre_id !== null ? map.get(current.padre_id) : undefined;
  }

  return ancestors;
}

/**
 * Determina la profundidad máxima del árbol.
 */
export function getMaxDepth(tree: ElementTreeNode[]): number {
  let max = 0;
  const stack = [...tree];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.depth > max) max = node.depth;
    stack.push(...node.children);
  }
  return max;
}

/**
 * Verifica si un elemento es una hoja (no tiene hijos).
 * Versión para lista plana: un elemento es hoja si ningún otro lo referencia como padre.
 */
export function isLeaf(elementId: number, elements: FlexibleElement[]): boolean {
  return !elements.some((e) => e.padre_id === elementId);
}

/**
 * Obtiene solo las hojas de una lista plana de elementos.
 */
export function getLeafElements(elements: FlexibleElement[]): FlexibleElement[] {
  const parentIds = new Set(
    elements.filter((e) => e.padre_id !== null).map((e) => e.padre_id as number),
  );
  return elements.filter((e) => !parentIds.has(e.elemento_id));
}

/**
 * Devuelve los hijos directos de un nodo dado en el árbol.
 */
export function getChildrenOf(nodeId: number | null, tree: ElementTreeNode[]): ElementTreeNode[] {
  if (nodeId === null) return tree; // raíces
  const node = findNode(nodeId, tree);
  return node ? node.children : [];
}

/**
 * Obtiene los elementos de un nivel específico del árbol.
 */
export function getNodesAtDepth(depth: number, tree: ElementTreeNode[]): ElementTreeNode[] {
  const result: ElementTreeNode[] = [];
  const stack = [...tree];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.depth === depth) result.push(node);
    else if (node.depth < depth) stack.push(...node.children);
  }
  return result;
}

// ── Helpers internos ────────────────────────────────────────────────────────

function getNodeLabel(el: FlexibleElement): string {
  if (el.nomenclatura && el.nombre) return `${el.nomenclatura} - ${el.nombre}`;
  return el.nombre ?? el.nomenclatura ?? el.tipo ?? `Elemento ${el.elemento_id}`;
}

function findNode(nodeId: number, tree: ElementTreeNode[]): ElementTreeNode | undefined {
  const stack = [...tree];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.elemento_id === nodeId) return node;
    stack.push(...node.children);
  }
  return undefined;
}

function collectLeaves(node: ElementTreeNode): ElementTreeNode[] {
  if (node.children.length === 0) return [node];
  return node.children.flatMap(collectLeaves);
}
