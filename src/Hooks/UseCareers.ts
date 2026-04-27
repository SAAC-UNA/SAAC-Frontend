/**
 * UseCareers - Hook para gestión de Carreras.
 */

import { useState, useCallback, useEffect } from 'react';
import type { Career, CreateCareerForm, UpdateCareerForm } from '@/Types/InstitutionalStructureTypes';
import * as service from '@/Services/CareerService';

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

export interface UseCareersReturn {
  careers: Career[];
  isLoading: boolean;
  error: string | null;
  loadCareers: () => Promise<void>;
  createCareer: (form: CreateCareerForm) => Promise<{ success: boolean; error?: string }>;
  updateCareer: (id: number, form: UpdateCareerForm) => Promise<{ success: boolean; error?: string }>;
  deleteCareer: (id: number) => Promise<{ success: boolean; error?: string }>;
  setCareerActive: (id: number, active: boolean) => Promise<{ success: boolean; error?: string }>;
}

export function useCareers(): UseCareersReturn {
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCareers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await service.getAllCareers();
      setCareers(data);
    } catch (err) {
      setError(extractBackendError(err, 'No se pudieron cargar las carreras.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCareers();
  }, [loadCareers]);

  const createCareer = useCallback(async (form: CreateCareerForm) => {
    try {
      await service.createCareer(form);
      await loadCareers();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo crear la carrera.') };
    }
  }, [loadCareers]);

  const updateCareer = useCallback(async (id: number, form: UpdateCareerForm) => {
    try {
      await service.updateCareer(id, form);
      await loadCareers();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo actualizar la carrera.') };
    }
  }, [loadCareers]);

  const deleteCareer = useCallback(async (id: number) => {
    try {
      await service.deleteCareer(id);
      await loadCareers();
      return { success: true };
    } catch (err) {
      const msg = extractBackendError(err, 'No se pudo eliminar la carrera.');
      if (msg.toLowerCase().includes('relacionados') || msg.toLowerCase().includes('fk_constraint')) {
        return { success: false, error: 'No se puede eliminar: la carrera tiene registros relacionados.' };
      }
      return { success: false, error: msg };
    }
  }, [loadCareers]);

  const setCareerActive = useCallback(async (id: number, active: boolean) => {
    try {
      await service.setCareerActive(id, active);
      await loadCareers();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo actualizar el estado.') };
    }
  }, [loadCareers]);

  return { careers, isLoading, error, loadCareers, createCareer, updateCareer, deleteCareer, setCareerActive };
}
