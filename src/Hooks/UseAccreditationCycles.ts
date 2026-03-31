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
import { TABLE_PAGE_SIZE } from '@/Constants/TablePagination';

// ── Helpers ────────────────────────────────────────────────────────────────────

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

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UseAccreditationCyclesReturn {
  cycles: AccreditationCycle[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  loadCycles: (page?: number) => Promise<void>;
  createCycle: (form: CreateAccreditationCycleForm) => Promise<{ success: boolean; error?: string }>;
  updateCycle: (id: number, form: EditAccreditationCycleForm) => Promise<{ success: boolean; error?: string }>;
  deleteCycle: (id: number, confirmacion: string) => Promise<{ success: boolean; error?: string }>;
  reactivateCycle: (id: number) => Promise<{ success: boolean; error?: string }>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAccreditationCycles(): UseAccreditationCyclesReturn {
  const perPage = TABLE_PAGE_SIZE.standard;

  const [cycles, setCycles] = useState<AccreditationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadCycles = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await cycleService.getAllCycles({ page, per_page: perPage });
      setCycles(result.data);
      setCurrentPage(result.current_page);
      setTotalPages(result.last_page);
    } catch (err) {
      setError(extractBackendError(err, 'Error al cargar los ciclos de acreditación'));
    } finally {
      setIsLoading(false);
    }
  }, [perPage]);

  useEffect(() => {
    loadCycles(1);
  }, [loadCycles]);

  const createCycle = useCallback(async (form: CreateAccreditationCycleForm) => {
    try {
      await cycleService.createCycle(form);
      await loadCycles(1);
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo crear el ciclo') };
    }
  }, [loadCycles]);

  const updateCycle = useCallback(async (id: number, form: EditAccreditationCycleForm) => {
    try {
      await cycleService.updateCycle(id, form);
      await loadCycles(currentPage);
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo actualizar el ciclo') };
    }
  }, [loadCycles, currentPage]);

  const deleteCycle = useCallback(async (id: number, confirmacion: string) => {
    try {
      await cycleService.deleteCycle(id, confirmacion);
      // If last item on page, go to previous page
      const nextPage = cycles.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      await loadCycles(nextPage);
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo eliminar el ciclo') };
    }
  }, [loadCycles, currentPage, cycles.length]);

  const reactivateCycle = useCallback(async (id: number) => {
    try {
      await cycleService.reactivateCycle(id);
      await loadCycles(currentPage);
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo reactivar el ciclo') };
    }
  }, [loadCycles, currentPage]);

  return {
    cycles,
    isLoading,
    error,
    currentPage,
    totalPages,
    loadCycles,
    createCycle,
    updateCycle,
    deleteCycle,
    reactivateCycle,
  };
}
