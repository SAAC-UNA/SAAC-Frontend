/**
 * UseAccreditationCycles - Hook para gestión de Ciclos de Acreditación.
 *
 * Maneja estado local de la página (no store global porque la paginación
 * y los filtros son propios de cada instancia de la página).
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  AccreditationCycle,
  CreateAccreditationCycleForm,
  EditAccreditationCycleForm,
} from '@/Types/AccreditationCycleTypes';
import * as cycleService from '@/Services/AccreditationCycleService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function extractBackendError(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    if (e.response && typeof e.response === 'object') {
      const resp = e.response as Record<string, unknown>;
      if (resp.data && typeof resp.data === 'object') {
        const d = resp.data as Record<string, unknown>;
        // Laravel 422: errors object has field-level messages
        if (d.errors && typeof d.errors === 'object') {
          const firstMsg = Object.values(d.errors as Record<string, string[]>).flat()[0];
          if (firstMsg) return firstMsg;
        }
        if (typeof d.message === 'string' && d.message) return d.message;
      }
    }
    if (typeof e.message === 'string') return e.message;
  }
  return fallback;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UseAccreditationCyclesReturn {
  cycles: AccreditationCycle[];
  isLoading: boolean;
  error: string | null;
  loadCycles: () => Promise<void>;
  createCycle: (form: CreateAccreditationCycleForm) => Promise<{ success: boolean; error?: string }>;
  updateCycle: (id: number, form: EditAccreditationCycleForm) => Promise<{ success: boolean; error?: string }>;
  deleteCycle: (id: number, confirmacion: string) => Promise<{ success: boolean; error?: string }>;
  reactivateCycle: (id: number) => Promise<{ success: boolean; error?: string }>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAccreditationCycles(): UseAccreditationCyclesReturn {
  const [cycles, setCycles] = useState<AccreditationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCycles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await cycleService.getAllCycles({ per_page: 50 });
      const sorted = [...result.data].sort((a, b) => b.ciclo_acreditacion_id - a.ciclo_acreditacion_id);
      setCycles(sorted);
    } catch (err) {
      setError(extractBackendError(err, 'Error al cargar los ciclos de acreditación'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCycles();
  }, [loadCycles]);

  const createCycle = useCallback(async (form: CreateAccreditationCycleForm) => {
    try {
      await cycleService.createCycle(form);
      await loadCycles();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo crear el ciclo') };
    }
  }, [loadCycles]);

  const updateCycle = useCallback(async (id: number, form: EditAccreditationCycleForm) => {
    try {
      await cycleService.updateCycle(id, form);
      await loadCycles();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo actualizar el ciclo') };
    }
  }, [loadCycles]);

  const deleteCycle = useCallback(async (id: number, confirmacion: string) => {
    try {
      await cycleService.deleteCycle(id, confirmacion);
      await loadCycles();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo eliminar el ciclo') };
    }
  }, [loadCycles]);

  const reactivateCycle = useCallback(async (id: number) => {
    try {
      await cycleService.reactivateCycle(id);
      await loadCycles();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo reactivar el ciclo') };
    }
  }, [loadCycles]);

  return {
    cycles,
    isLoading,
    error,
    loadCycles,
    createCycle,
    updateCycle,
    deleteCycle,
    reactivateCycle,
  };
}
