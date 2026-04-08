import {
  buildElementTree,
  getElementPath,
  getLeafDescendants,
  getAncestors,
  getMaxDepth,
  isLeaf,
  getLeafElements,
  getNodesAtDepth,
} from './elementTreeUtils';
import type { FlexibleElement } from '@/Types/StructureModelTypes';

// Helper para crear elementos de prueba
const makeEl = (
  id: number,
  padreId: number | null,
  nombre: string,
  nomenclatura: string | null = null,
): FlexibleElement => ({
  elemento_id: id,
  modelo_estructura_id: 1,
  padre_id: padreId,
  tipo: 'tipo',
  nombre,
  categoria: null,
  nomenclatura,
  descripcion: null,
  activo: true,
  created_at: '',
  updated_at: '',
});

// Árbol de prueba:
//   1 (raíz A)
//     ├── 2 (hijo A1)
//     │     └── 4 (nieto A1a)
//     └── 3 (hijo A2)
//   5 (raíz B — aislada)
const flatList: FlexibleElement[] = [
  makeEl(1, null, 'Raíz A'),
  makeEl(2, 1, 'Hijo A1'),
  makeEl(3, 1, 'Hijo A2'),
  makeEl(4, 2, 'Nieto A1a'),
  makeEl(5, null, 'Raíz B'),
];

describe('buildElementTree', () => {
  it('construye correctamente las raíces', () => {
    const tree = buildElementTree(flatList);
    expect(tree).toHaveLength(2);
    expect(tree.map((n) => n.elemento_id)).toEqual(expect.arrayContaining([1, 5]));
  });

  it('anida correctamente los hijos del primer nivel', () => {
    const tree = buildElementTree(flatList);
    const raizA = tree.find((n) => n.elemento_id === 1)!;
    expect(raizA.children).toHaveLength(2);
    expect(raizA.children.map((c) => c.elemento_id)).toEqual(expect.arrayContaining([2, 3]));
  });

  it('anida correctamente al segundo nivel', () => {
    const tree = buildElementTree(flatList);
    const raizA = tree.find((n) => n.elemento_id === 1)!;
    const hijoA1 = raizA.children.find((c) => c.elemento_id === 2)!;
    expect(hijoA1.children).toHaveLength(1);
    expect(hijoA1.children[0].elemento_id).toBe(4);
  });

  it('asigna depth=0 a las raíces', () => {
    const tree = buildElementTree(flatList);
    tree.forEach((root) => expect(root.depth).toBe(0));
  });

  it('asigna depth incrementalmente', () => {
    const tree = buildElementTree(flatList);
    const raizA = tree.find((n) => n.elemento_id === 1)!;
    const hijoA1 = raizA.children.find((c) => c.elemento_id === 2)!;
    const nieto = hijoA1.children[0];
    expect(hijoA1.depth).toBe(1);
    expect(nieto.depth).toBe(2);
  });

  it('construye el path correctamente', () => {
    const tree = buildElementTree(flatList);
    const raizA = tree.find((n) => n.elemento_id === 1)!;
    const hijoA1 = raizA.children.find((c) => c.elemento_id === 2)!;
    const nieto = hijoA1.children[0];
    expect(raizA.path).toBe('Raíz A');
    expect(hijoA1.path).toBe('Raíz A > Hijo A1');
    expect(nieto.path).toBe('Raíz A > Hijo A1 > Nieto A1a');
  });

  it('usa nomenclatura en el path si está disponible', () => {
    const elements = [makeEl(1, null, 'Área', 'C1')];
    const tree = buildElementTree(elements);
    expect(tree[0].path).toBe('C1 - Área');
  });

  it('retorna array vacío para lista vacía', () => {
    expect(buildElementTree([])).toEqual([]);
  });
});

describe('getElementPath', () => {
  it('retorna el path completo desde la raíz', () => {
    const path = getElementPath(4, flatList);
    expect(path).toBe('Raíz A > Hijo A1 > Nieto A1a');
  });

  it('retorna solo el nombre para una raíz', () => {
    const path = getElementPath(1, flatList);
    expect(path).toBe('Raíz A');
  });

  it('retorna string vacío para elemento inexistente', () => {
    expect(getElementPath(999, flatList)).toBe('');
  });
});

describe('getLeafDescendants', () => {
  it('retorna las hojas de un subárbol', () => {
    const tree = buildElementTree(flatList);
    const leaves = getLeafDescendants(1, tree);
    const ids = leaves.map((l) => l.elemento_id);
    expect(ids).toContain(3);
    expect(ids).toContain(4);
    expect(ids).not.toContain(2); // nodo intermedio
  });

  it('retorna el propio nodo si es una hoja', () => {
    const tree = buildElementTree(flatList);
    const leaves = getLeafDescendants(4, tree);
    expect(leaves).toHaveLength(1);
    expect(leaves[0].elemento_id).toBe(4);
  });

  it('retorna array vacío para nodeId inexistente', () => {
    const tree = buildElementTree(flatList);
    expect(getLeafDescendants(999, tree)).toEqual([]);
  });
});

describe('getAncestors', () => {
  it('retorna los ancestros en orden de raíz a padre', () => {
    const ancestors = getAncestors(4, flatList);
    expect(ancestors.map((a) => a.elemento_id)).toEqual([1, 2]);
  });

  it('retorna array vacío para una raíz', () => {
    expect(getAncestors(1, flatList)).toEqual([]);
  });

  it('retorna array vacío para elemento inexistente', () => {
    expect(getAncestors(999, flatList)).toEqual([]);
  });
});

describe('getMaxDepth', () => {
  it('retorna la profundidad máxima del árbol', () => {
    const tree = buildElementTree(flatList);
    expect(getMaxDepth(tree)).toBe(2);
  });

  it('retorna 0 para árbol con solo raíces', () => {
    const tree = buildElementTree([makeEl(1, null, 'Solo raíz')]);
    expect(getMaxDepth(tree)).toBe(0);
  });

  it('retorna 0 para árbol vacío', () => {
    expect(getMaxDepth([])).toBe(0);
  });
});

describe('isLeaf', () => {
  it('retorna true para un elemento sin hijos', () => {
    expect(isLeaf(4, flatList)).toBe(true);
    expect(isLeaf(3, flatList)).toBe(true);
    expect(isLeaf(5, flatList)).toBe(true);
  });

  it('retorna false para un elemento con hijos', () => {
    expect(isLeaf(1, flatList)).toBe(false);
    expect(isLeaf(2, flatList)).toBe(false);
  });
});

describe('getLeafElements', () => {
  it('retorna solo los elementos hoja de la lista plana', () => {
    const leaves = getLeafElements(flatList);
    const ids = leaves.map((l) => l.elemento_id);
    expect(ids).toContain(3);
    expect(ids).toContain(4);
    expect(ids).toContain(5);
    expect(ids).not.toContain(1);
    expect(ids).not.toContain(2);
  });
});

describe('getNodesAtDepth', () => {
  it('retorna los nodos del nivel indicado', () => {
    const tree = buildElementTree(flatList);
    const depth1 = getNodesAtDepth(1, tree);
    expect(depth1.map((n) => n.elemento_id)).toEqual(expect.arrayContaining([2, 3]));
  });

  it('retorna las raíces para depth=0', () => {
    const tree = buildElementTree(flatList);
    const depth0 = getNodesAtDepth(0, tree);
    expect(depth0.map((n) => n.elemento_id)).toEqual(expect.arrayContaining([1, 5]));
  });

  it('retorna array vacío si no hay nodos en ese nivel', () => {
    const tree = buildElementTree(flatList);
    expect(getNodesAtDepth(99, tree)).toEqual([]);
  });
});
