/**
 * UseCampuses - Hook para gestión de Sedes.
 */

import { useState, useCallback, useEffect } from 'react';
import type { Campus, CreateCampusForm, UpdateCampusForm } from '@/Types/InstitutionalStructureTypes';
import * as service from '@/Services/CampusService';

function extractBackendError(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    if (e.response && typeof e.response === 'object') {
      const resp = e.response as Record<string, unknown>;
      if (resp.data && typeof resp.data === 'object') {
        const d = resp.data as Record<string, unknown>;
        if (d.errors && typeof d.errors === 'object') {
          const first = Object.values(d.errors as Record<string, string[]>).flat()[0];
          if (first) return first;
        }
        if (typeof d.message === 'string' && d.message) return d.message;
      }
    }
    if (typeof e.message === 'string' && e.message.trim()) return e.message;
  }
  return fallback;
}

export interface UseCampusesReturn {
  campuses: Campus[];
  isLoading: boolean;
  error: string | null;
  loadCampuses: () => Promise<void>;
  createCampus: (form: CreateCampusForm) => Promise<{ success: boolean; error?: string }>;
  updateCampus: (id: number, form: UpdateCampusForm) => Promise<{ success: boolean; error?: string }>;
  deleteCampus: (id: number) => Promise<{ success: boolean; error?: string }>;
}

export function useCampuses(): UseCampusesReturn {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCampuses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await service.getAllCampuses();
      setCampuses(data);
    } catch (err) {
      setError(extractBackendError(err, 'No se pudieron cargar las sedes.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampuses();
  }, [loadCampuses]);

  const createCampus = useCallback(async (form: CreateCampusForm) => {
    try {
      await service.createCampus(form);
      await loadCampuses();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo crear la sede.') };
    }
  }, [loadCampuses]);

  const updateCampus = useCallback(async (id: number, form: UpdateCampusForm) => {
    try {
      await service.updateCampus(id, form);
      await loadCampuses();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo actualizar la sede.') };
    }
  }, [loadCampuses]);

  const deleteCampus = useCallback(async (id: number) => {
    try {
      await service.deleteCampus(id);
      await loadCampuses();
      return { success: true };
    } catch (err) {
      const msg = extractBackendError(err, 'No se pudo eliminar la sede.');
      if (msg.toLowerCase().includes('relacionados') || msg.toLowerCase().includes('fk_constraint')) {
        return { success: false, error: 'No se puede eliminar: la sede tiene carreras u otros registros relacionados.' };
      }
      return { success: false, error: msg };
    }
  }, [loadCampuses]);

  return { campuses, isLoading, error, loadCampuses, createCampus, updateCampus, deleteCampus };
}
