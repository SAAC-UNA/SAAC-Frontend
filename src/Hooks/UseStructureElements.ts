/**
 * UseStructureElements - Hook para gestión de elementos flexibles de un modelo.
 *
 * A diferencia de UseStructureModels, el estado es por-modelo (no global),
 * ya que cada instancia carga elementos de un modelo diferente.
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  FlexibleElement,
  CreateFlexibleElementForm,
  EditFlexibleElementForm,
} from '@/Types/StructureModelTypes';
import * as structureModelService from '@/Services/StructureModelService';

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

export interface UseStructureElementsReturn {
  elements: FlexibleElement[];
  isLoading: boolean;
  error: string | null;
  loadElements: () => Promise<void>;
  createElement: (form: CreateFlexibleElementForm) => Promise<{ success: boolean; error?: string }>;
  updateElement: (id: number, form: EditFlexibleElementForm) => Promise<{ success: boolean; error?: string }>;
  deleteElement: (id: number) => Promise<{ success: boolean; error?: string }>;
  toggleActive: (id: number, active: boolean) => Promise<{ success: boolean; error?: string }>;
}

export function useStructureElements(modelId: number | null): UseStructureElementsReturn {
  const [elements, setElements] = useState<FlexibleElement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadElements = useCallback(async () => {
    if (!modelId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await structureModelService.getElementsByModel(modelId);
      setElements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar elementos');
    } finally {
      setIsLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    if (modelId) {
      loadElements();
    } else {
      setElements([]);
    }
  }, [modelId, loadElements]);

  const createElement = useCallback(async (form: CreateFlexibleElementForm) => {
    try {
      await structureModelService.createElement(form);
      await loadElements();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo crear el elemento') };
    }
  }, [loadElements]);

  const updateElement = useCallback(async (id: number, form: EditFlexibleElementForm) => {
    try {
      await structureModelService.updateElement(id, form);
      await loadElements();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo actualizar el elemento') };
    }
  }, [loadElements]);

  const deleteElement = useCallback(async (id: number) => {
    try {
      await structureModelService.deleteElement(id);
      await loadElements();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo eliminar el elemento') };
    }
  }, [loadElements]);

  const toggleActive = useCallback(async (id: number, active: boolean) => {
    try {
      await structureModelService.toggleElementActive(id, active);
      await loadElements();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractBackendError(err, 'No se pudo cambiar el estado del elemento') };
    }
  }, [loadElements]);

  return {
    elements,
    isLoading,
    error,
    loadElements,
    createElement,
    updateElement,
    deleteElement,
    toggleActive,
  };
}
