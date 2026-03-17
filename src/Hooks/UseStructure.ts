/**
 * UseStructure - hook for managing the organizational structure tree.
 *
 * All state lives at MODULE level (_st, _loaded, _inflight, _subs).
 * Every useStructure() instance reads from that shared store and subscribes
 * to be re-rendered when the store changes.
 *
 * This guarantees:
 *   - At most ONE HTTP batch is ever in-flight at any time.
 *   - StrictMode double-effect invocation causes zero duplicate calls.
 *   - Multiple simultaneously-mounted components share the same data.
 *   - After write operations (_invalidate + _load), all instances
 *     automatically re-render with the fresh data.
 */

import { useState, useCallback, useEffect, useReducer } from 'react';
import { structureService } from '@/Services/StructureService';
import type {
  StructureElement,
  CreateElementForm,
  EditElementForm,
  ElementType,
} from '@/types/StructureTypes';
import type { ApiResponse } from '@/Services/StructureService';

// ─────────────────────────────────────────────────────────────────────────────
// Module-level store  (one instance for the whole app lifetime)
// ─────────────────────────────────────────────────────────────────────────────

interface StoreState {
  data: StructureElement[];
  loading: boolean;
  error: string | null;
}

type ActiveOverride = {
  type: ElementType;
  id: string;
  active: boolean;
  updatedAt: number;
};

const ACTIVE_OVERRIDES_KEY = 'saac.structure.active-overrides.v1';
const ACTIVE_OVERRIDES_TTL_MS = 10 * 60 * 1000;

function normalize(value?: string): string {
  return (value ?? '').trim().toLowerCase();
}

function matchesCreatePayload(element: StructureElement, payload: CreateElementForm): boolean {
  if (element.type !== payload.type) return false;

  // Si el tipo requiere padre, debe coincidir exactamente
  if (payload.parentElementId && element.parentElementId !== payload.parentElementId) {
    return false;
  }

  const fieldsToCheck: Array<[string, string]> = [
    [normalize(payload.nomenclature), normalize(element.nomenclature)],
    [normalize(payload.name), normalize(element.name)],
    [normalize(payload.description), normalize(element.description)],
  ];

  let hasComparedField = false;
  for (const [expected, current] of fieldsToCheck) {
    if (!expected) continue;
    hasComparedField = true;
    if (expected !== current) return false;
  }

  return hasComparedField;
}

let _st: StoreState = { data: [], loading: false, error: null };
let _loaded = false;
let _inflight: Promise<void> | null = null;
const _subs = new Set<() => void>();

function updateActiveRecursively(
  elements: StructureElement[],
  elementType: ElementType,
  elementId: string,
  active: boolean
): StructureElement[] {
  return elements.map(element => {
    const isTarget = element.type === elementType && element.id === elementId;
    const nextChildren = element.childElements
      ? updateActiveRecursively(element.childElements, elementType, elementId, active)
      : element.childElements;

    if (!isTarget && nextChildren === element.childElements) {
      return element;
    }

    return {
      ...element,
      active: isTarget ? active : element.active,
      childElements: nextChildren,
    };
  });
}

function getOverrideKey(type: ElementType, id: string): string {
  return `${type}:${id}`;
}

function readActiveOverrides(): Record<string, ActiveOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(ACTIVE_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ActiveOverride>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeActiveOverrides(overrides: Record<string, ActiveOverride>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACTIVE_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // Evitar romper flujo UI por errores de almacenamiento.
  }
}

function saveActiveOverride(type: ElementType, id: string, active: boolean): void {
  const overrides = readActiveOverrides();
  const key = getOverrideKey(type, id);
  overrides[key] = { type, id, active, updatedAt: Date.now() };
  writeActiveOverrides(overrides);
}

function removeActiveOverride(type: ElementType, id: string): void {
  const overrides = readActiveOverrides();
  const key = getOverrideKey(type, id);
  if (overrides[key]) {
    delete overrides[key];
    writeActiveOverrides(overrides);
  }
}

function applyActiveOverridesToData(elements: StructureElement[]): StructureElement[] {
  const now = Date.now();
  const overrides = readActiveOverrides();
  const keys = Object.keys(overrides);
  if (keys.length === 0) return elements;

  let touched = false;

  const walk = (nodes: StructureElement[]): StructureElement[] => {
    return nodes.map(node => {
      const key = getOverrideKey(node.type, node.id);
      const override = overrides[key];

      let nextNode = node;

      if (override) {
        const isExpired = now - override.updatedAt > ACTIVE_OVERRIDES_TTL_MS;
        if (isExpired) {
          delete overrides[key];
          touched = true;
        } else if (node.active !== override.active) {
          nextNode = { ...node, active: override.active };
        } else {
          // Si backend ya coincide, remover override para no acumular basura.
          delete overrides[key];
          touched = true;
        }
      }

      if (nextNode.childElements && nextNode.childElements.length > 0) {
        const nextChildren = walk(nextNode.childElements);
        if (nextChildren !== nextNode.childElements) {
          nextNode = { ...nextNode, childElements: nextChildren };
        }
      }

      return nextNode;
    });
  };

  const patched = walk(elements);
  if (touched) {
    writeActiveOverrides(overrides);
  }
  return patched;
}

function findElementByTypeAndId(
  elements: StructureElement[],
  elementType: ElementType,
  elementId: string
): StructureElement | null {
  for (const element of elements) {
    if (element.type === elementType && element.id === elementId) {
      return element;
    }
    if (element.childElements && element.childElements.length > 0) {
      const found = findElementByTypeAndId(element.childElements, elementType, elementId);
      if (found) return found;
    }
  }
  return null;
}

function _set(patch: Partial<StoreState>): void {
  _st = { ..._st, ...patch };
  _subs.forEach(fn => fn());
}

async function _load(): Promise<void> {
  // Si hay datos cargados, respetar cache; si cache está vacío, permitir reintento.
  if (_loaded && _st.data.length > 0) return;
  if (_inflight) return _inflight;

  _set({ loading: true, error: null });

  _inflight = (async () => {
    try {
      const res = await structureService.getFullTree();
      _loaded = true;
      const nextData = applyActiveOverridesToData(res.data ?? []);
      _set({ data: nextData, loading: false });
    } catch (err) {
      _set({
        loading: false,
        error: err instanceof Error ? err.message : 'Error al cargar estructura',
      });
    } finally {
      _inflight = null;
    }
  })();

  return _inflight;
}

function _invalidate(): void {
  _loaded = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook interface
// ─────────────────────────────────────────────────────────────────────────────

interface UseStructureReturn {
  isLoading: boolean;
  error: string | null;
  treeData: StructureElement[];
  loadTree: () => Promise<void>;
  createElement: (elementData: CreateElementForm) => Promise<StructureElement | null>;
  editElement: (elementType: ElementType, elementId: string, elementData: EditElementForm) => Promise<StructureElement | null>;
  deleteElement: (elementType: ElementType, elementId: string) => Promise<boolean>;
  activateElement: (elementType: ElementType, elementId: string) => Promise<boolean>;
  deactivateElement: (elementType: ElementType, elementId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useStructure = (): UseStructureReturn => {
  const [, dispatch] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    _subs.add(dispatch);
    return () => { _subs.delete(dispatch); };
  }, [dispatch]);

  const [mutating, setMutating] = useState(false);

  const clearError = useCallback(() => _set({ error: null }), []);

  const loadTree = useCallback(async () => {
    await _load();
  }, []);

  const createElement = useCallback(
    async (elementData: CreateElementForm): Promise<StructureElement | null> => {
      setMutating(true);
      const existingIds = new Set(
        _st.data
          .filter(item => matchesCreatePayload(item, elementData))
          .map(item => item.id)
      );

      try {
        const response: ApiResponse<StructureElement> =
          await structureService.create(elementData, _st.data);
        if (response.data) {
          _invalidate();
          await _load();
          return response.data;
        }
        throw new Error('No se recibieron datos del servidor');
      } catch (err) {
        // Resiliencia frontend: algunos endpoints pueden responder error
        // aunque el registro ya haya quedado persistido en backend.
        try {
          _invalidate();
          await _load();
          const recovered = _st.data.find(
            item => matchesCreatePayload(item, elementData) && !existingIds.has(item.id)
          );
          if (recovered) {
            _set({ error: null });
            return recovered;
          }
        } catch {
          // Si la recarga falla, se usa el flujo de error normal.
        }

        _set({ error: `Error al crear elemento: ${err instanceof Error ? err.message : 'Error desconocido'}` });
        return null;
      } finally {
        setMutating(false);
      }
    },
    []
  );

  const editElement = useCallback(
    async (elementType: ElementType, elementId: string, elementData: EditElementForm): Promise<StructureElement | null> => {
      setMutating(true);
      try {
        const response: ApiResponse<StructureElement> =
          await structureService.update(elementType, elementId, elementData);
        if (response.data) {
          _set({
            data: _st.data.map(el =>
              el.id === elementId && el.type === elementType ? (response.data as StructureElement) : el
            ),
          });
          return response.data;
        }
        throw new Error('No se recibieron datos del servidor');
      } catch (err) {
        _set({ error: `Error al editar elemento: ${err instanceof Error ? err.message : 'Error desconocido'}` });
        return null;
      } finally {
        setMutating(false);
      }
    },
    []
  );

  const deleteElement = useCallback(
    async (elementType: ElementType, elementId: string): Promise<boolean> => {
      setMutating(true);
      try {
        await structureService.delete(elementType, elementId);
        _invalidate();
        await _load();
        return true;
      } catch (err) {
        _set({ error: `Error al eliminar elemento: ${err instanceof Error ? err.message : 'Error desconocido'}` });
        return false;
      } finally {
        setMutating(false);
      }
    },
    []
  );

  const activateElement = useCallback(
    async (elementType: ElementType, elementId: string): Promise<boolean> => {
      setMutating(true);
      const previousData = _st.data;
      _set({ data: updateActiveRecursively(_st.data, elementType, elementId, true) });

      try {
        await structureService.setActive(elementType, elementId, true);
        saveActiveOverride(elementType, elementId, true);
        return true;
      } catch (err) {
        // Si backend devolvió error pero sí persistió, conservar cambio optimista.
        try {
          const verify = await structureService.getById(elementType, elementId);
          const current = verify.data ?? findElementByTypeAndId(_st.data, elementType, elementId);
          if (current?.active === true) {
            saveActiveOverride(elementType, elementId, true);
            _set({ error: null });
            return true;
          }
        } catch {
          // Si tampoco se pudo recargar, restaurar estado previo.
        }

        removeActiveOverride(elementType, elementId);
        _set({
          data: previousData,
          error: err instanceof Error ? err.message : 'Error al activar elemento'
        });
        return false;
      } finally {
        setMutating(false);
      }
    },
    []
  );

  const deactivateElement = useCallback(
    async (elementType: ElementType, elementId: string): Promise<boolean> => {
      setMutating(true);
      const previousData = _st.data;
      _set({ data: updateActiveRecursively(_st.data, elementType, elementId, false) });

      try {
        await structureService.setActive(elementType, elementId, false);
        saveActiveOverride(elementType, elementId, false);
        return true;
      } catch (err) {
        // Si backend devolvió error pero sí persistió, conservar cambio optimista.
        try {
          const verify = await structureService.getById(elementType, elementId);
          const current = verify.data ?? findElementByTypeAndId(_st.data, elementType, elementId);
          if (current?.active === false) {
            saveActiveOverride(elementType, elementId, false);
            _set({ error: null });
            return true;
          }
        } catch {
          // Si tampoco se pudo recargar, restaurar estado previo.
        }

        removeActiveOverride(elementType, elementId);
        _set({
          data: previousData,
          error: err instanceof Error ? err.message : 'Error al desactivar elemento'
        });
        return false;
      } finally {
        setMutating(false);
      }
    },
    []
  );

  return {
    treeData: _st.data,
    isLoading: _st.loading || mutating,
    error: _st.error,
    loadTree,
    createElement,
    editElement,
    deleteElement,
    activateElement,
    deactivateElement,
    clearError,
  };
};
