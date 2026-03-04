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

let _st: StoreState = { data: [], loading: false, error: null };
let _loaded = false;
let _inflight: Promise<void> | null = null;
const _subs = new Set<() => void>();

function _set(patch: Partial<StoreState>): void {
  _st = { ..._st, ...patch };
  _subs.forEach(fn => fn());
}

async function _load(): Promise<void> {
  if (_loaded) return;
  if (_inflight) return _inflight;

  _set({ loading: true, error: null });

  _inflight = (async () => {
    try {
      const res = await structureService.getFullTree();
      _loaded = true;
      _set({ data: res.data ?? [], loading: false });
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
  activateElementWithoutReload: (elementType: ElementType, elementId: string) => Promise<boolean>;
  deactivateElementWithoutReload: (elementType: ElementType, elementId: string) => Promise<boolean>;
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
      try {
        await structureService.setActive(elementType, elementId, true);
        _invalidate();
        await _load();
        return true;
      } catch (err) {
        _set({ error: err instanceof Error ? err.message : 'Error al activar elemento' });
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
      try {
        await structureService.setActive(elementType, elementId, false);
        _invalidate();
        await _load();
        return true;
      } catch (err) {
        _set({ error: err instanceof Error ? err.message : 'Error al desactivar elemento' });
        return false;
      } finally {
        setMutating(false);
      }
    },
    []
  );

  const activateElementWithoutReload = useCallback(
    async (elementType: ElementType, elementId: string): Promise<boolean> => {
      try {
        await structureService.setActive(elementType, elementId, true);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const deactivateElementWithoutReload = useCallback(
    async (elementType: ElementType, elementId: string): Promise<boolean> => {
      try {
        await structureService.setActive(elementType, elementId, false);
        return true;
      } catch {
        return false;
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
    activateElementWithoutReload,
    deactivateElementWithoutReload,
    clearError,
  };
};
