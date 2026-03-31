/**
 * UseCareerCampuses - Hook para obtener la lista de Carrera-Sede.
 *
 * Usa módulo-level store para que múltiples componentes compartan el mismo
 * estado sin peticiones duplicadas.
 */

import { useEffect, useReducer } from 'react';
import type { CareerCampus } from '@/Types/AccreditationCycleTypes';
import { getAllCareerCampuses } from '@/Services/AccreditationCycleService';

// ── Module-level store ────────────────────────────────────────────────────────

interface StoreState {
  data: CareerCampus[];
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

export function invalidateCareerCampuses(): void {
  _loaded = false;
}

async function _load(): Promise<void> {
  if (_loaded && _st.data.length > 0) return;
  if (_inflight) return _inflight;

  _set({ loading: true, error: null });

  _inflight = (async () => {
    try {
      const data = await getAllCareerCampuses();
      _loaded = true;
      _set({ data, loading: false });
    } catch (err) {
      _set({
        loading: false,
        error: err instanceof Error ? err.message : 'Error al cargar carrera-sede',
      });
    } finally {
      _inflight = null;
    }
  })();

  return _inflight;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface UseCareerCampusesReturn {
  careerCampuses: CareerCampus[];
  isLoading: boolean;
  error: string | null;
}

export function useCareerCampuses(): UseCareerCampusesReturn {
  const [, rerender] = useReducer(x => x + 1, 0);

  useEffect(() => {
    _subs.add(rerender);
    return () => { _subs.delete(rerender); };
  }, []);

  useEffect(() => {
    _load();
  }, []);

  return {
    careerCampuses: _st.data,
    isLoading: _st.loading,
    error: _st.error,
  };
}
