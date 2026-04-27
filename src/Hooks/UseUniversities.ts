/**
 * UseUniversities - Hook para gestión de Universidades.
 */

import { useState, useCallback, useEffect } from 'react';
import type { University, CreateUniversityForm, UpdateUniversityForm } from '@/Types/InstitutionalStructureTypes';
import * as service from '@/Services/UniversityService';

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

export interface UseUniversitiesReturn {
  universities: University[];
  isLoading: boolean;
  error: string | null;
  loadUniversities: () => Promise<void>;
  createUniversity: (form: CreateUniversityForm) => Promise<{ success: boolean; error?: string }>;
  updateUniversity: (id: number, form: UpdateUniversityForm) => Promise<{ success: boolean; error?: string }>;
  deleteUniversity: (id: number) => Promise<{ success: boolean; error?: string }>;
  setUniversityActive: (id: number, active: boolean) => Promise<{ success: boolean; error?: string }>;
}

export function useUniversities(): UseUniversitiesReturn {
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUniversities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await service.getAllUniversities();
      setUniversities(data);
    } catch (err) {
      setError(extractBackendError(err, 'No se pudieron cargar las universidades.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUniversities();
  }, [loadUniversities]);

  const createUniversity = useCallback(async (form: CreateUniversityForm) => {
    try {
      await service.createUniversity(form);
      await loadUniversities();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo crear la universidad.') };
    }
  }, [loadUniversities]);

  const updateUniversity = useCallback(async (id: number, form: UpdateUniversityForm) => {
    try {
      await service.updateUniversity(id, form);
      await loadUniversities();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo actualizar la universidad.') };
    }
  }, [loadUniversities]);

  const deleteUniversity = useCallback(async (id: number) => {
    try {
      await service.deleteUniversity(id);
      await loadUniversities();
      return { success: true };
    } catch (err) {
      const msg = extractBackendError(err, 'No se pudo eliminar la universidad.');
      // FK constraint 409
      if (msg.toLowerCase().includes('relacionados') || msg.toLowerCase().includes('fk_constraint')) {
        return { success: false, error: 'No se puede eliminar: la universidad tiene sedes o elementos relacionados.' };
      }
      return { success: false, error: msg };
    }
  }, [loadUniversities]);

  const setUniversityActive = useCallback(async (id: number, active: boolean) => {
    try {
      await service.setUniversityActive(id, active);
      await loadUniversities();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo actualizar el estado.') };
    }
  }, [loadUniversities]);

  return { universities, isLoading, error, loadUniversities, createUniversity, updateUniversity, deleteUniversity, setUniversityActive };
}
