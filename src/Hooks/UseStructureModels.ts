/**
 * UseStructureModels - Hook para gestión de modelos de estructura.
 *
 * Usa módulo-level store para que múltiples componentes compartan el mismo
 * estado sin peticiones duplicadas (mismo patrón que UseStructure).
 */

import { useState, useCallback, useEffect, useReducer } from 'react';
import type { StructureModel, CreateModelForm, EditModelForm } from '@/Types/StructureModelTypes';
import * as structureModelService from '@/Services/StructureModelService';

// ── Module-level store ────────────────────────────────────────────────────────

interface StoreState {
  data: StructureModel[];
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

function _invalidate(): void {
  _loaded = false;
}

async function _load(): Promise<void> {
  if (_loaded && _st.data.length > 0) return;
  if (_inflight) return _inflight;

  _set({ loading: true, error: null });

  _inflight = (async () => {
    try {
      const data = await structureModelService.getAllModels();
      _loaded = true;
      _set({ data, loading: false });
    } catch (err) {
      _set({
        loading: false,
        error: err instanceof Error ? err.message : 'Error al cargar modelos',
      });
    } finally {
      _inflight = null;
    }
  })();

  return _inflight;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractBackendError(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    if (e.response && typeof e.response === 'object') {
      const resp = e.response as Record<string, unknown>;
      if (resp.data && typeof resp.data === 'object') {
        const d = resp.data as Record<string, unknown>;
        if (typeof d.message === 'string' && d.message) return d.message;
      }
    }
    if (typeof e.message === 'string') return e.message;
  }
  return fallback;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface UseStructureModelsReturn {
  models: StructureModel[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  loadModels: () => Promise<void>;
  createModel: (form: CreateModelForm) => Promise<{ success: boolean; error?: string }>;
  updateModel: (id: number, form: EditModelForm) => Promise<{ success: boolean; error?: string }>;
  toggleActive: (id: number, active: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteModel: (id: number, confirmacion: string) => Promise<{ success: boolean; error?: string }>;
}

export function useStructureModels(): UseStructureModelsReturn {
  const [, rerender] = useReducer(x => x + 1, 0);
  const [opLoading, setOpLoading] = useState(false);

  useEffect(() => {
    _subs.add(rerender);
    return () => { _subs.delete(rerender); };
  }, []);

  const loadModels = useCallback(async () => {
    await _load();
  }, []);

  // Load on mount
  useEffect(() => {
    _load();
  }, []);

  const createModel = useCallback(async (form: CreateModelForm) => {
    setOpLoading(true);
    try {
      await structureModelService.createModel(form);
      _invalidate();
      await _load();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo crear el modelo') };
    } finally {
      setOpLoading(false);
    }
  }, []);

  const updateModel = useCallback(async (id: number, form: EditModelForm) => {
    setOpLoading(true);
    try {
      await structureModelService.updateModel(id, form);
      _invalidate();
      await _load();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo actualizar el modelo') };
    } finally {
      setOpLoading(false);
    }
  }, []);

  const toggleActive = useCallback(async (id: number, active: boolean) => {
    setOpLoading(true);
    try {
      await structureModelService.toggleModelActive(id, active);
      _invalidate();
      await _load();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo cambiar el estado del modelo') };
    } finally {
      setOpLoading(false);
    }
  }, []);

  const deleteModel = useCallback(async (id: number, confirmacion: string) => {
    setOpLoading(true);
    try {
      await structureModelService.deleteModel(id, confirmacion);
      _invalidate();
      await _load();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo eliminar el modelo') };
    } finally {
      setOpLoading(false);
    }
  }, []);

  return {
    models: _st.data,
    isLoading: _st.loading || opLoading,
    hasLoaded: _loaded,
    error: _st.error,
    loadModels,
    createModel,
    updateModel,
    toggleActive,
    deleteModel,
  };
}
