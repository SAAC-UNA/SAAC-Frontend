import { useState, useCallback } from 'react';
import { structureService } from '@/Services/StructureService';
import type { 
  StructureElement,
  CreateElementForm,
  EditElementForm,
  ElementType,
  StructureSearchCriteria
} from '@/types/StructureTypes';
import type { ApiResponse } from '@/Services/StructureService';

/**
 * HOOK DE GESTIÓN DE ESTRUCTURA ORGANIZACIONAL
 * 
 * Hook completo para manejar la estructura jerárquica de la universidad
 * (universidades, campus, facultades, carreras, dimensiones, etc.).
 * Incluye operaciones CRUD, búsquedas, activación/desactivación y
 * operaciones batch con datos mock para desarrollo.
 * 
 * CAPACIDADES:
 * - CRUD completo de elementos estructurales
 * - Visualización en árbol jerárquico
 * - Búsquedas con criterios múltiples
 * - Operaciones batch (activar/desactivar/eliminar múltiples)
 * - Activación/desactivación individual
 */

interface UseStructureReturn {
  // Estados
  isLoading: boolean;
  error: string | null;
  treeData: StructureElement[];
  
  // Acciones
  loadTree: () => Promise<void>;
  createElement: (elementData: CreateElementForm) => Promise<StructureElement | null>;
  editElement: (elementType: ElementType, elementId: string, elementData: EditElementForm) => Promise<StructureElement | null>;
  deleteElement: (elementType: ElementType, elementId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useStructure = (): UseStructureReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<StructureElement[]>([]);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Crear un nuevo elemento
   */
  const createElement = async (elementData: CreateElementForm): Promise<StructureElement | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Pasar treeData actual para que el mapper pueda obtener la universidad del campus
      const response: ApiResponse<StructureElement> = await structureService.create(elementData, treeData);
      
      if (response.data) {
        // Recargar el árbol completo después de crear
        const treeResponse = await structureService.getFullTree();
        if (treeResponse.data) {
          setTreeData(treeResponse.data);
        }
        
        return response.data;
      }
      
      throw new Error('No se recibieron datos del servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al crear elemento: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Editar un elemento existente
   */
  const editElement = async (elementType: ElementType, elementId: string, elementData: EditElementForm): Promise<StructureElement | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<StructureElement> = await structureService.update(elementType, elementId, elementData);
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('No se recibieron datos del servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al editar elemento: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
 * Eliminar un elemento
 */
const deleteElement = useCallback(async (elementType: ElementType, elementId: string): Promise<boolean> => {
  setIsLoading(true);
  setError(null);

  try {
    await structureService.delete(elementType, elementId);
  
    // Recargar el árbol después de eliminar - llamada directa al servicio
    const response = await structureService.getFullTree();
    if (response.data) {
      setTreeData(response.data);
    }
    
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    setError(`Error al eliminar elemento: ${errorMessage}`);
    return false;
  } finally {
    setIsLoading(false);
  }
}, []);

  /**
   * Cargar estructura en forma de árbol
   */
  const loadTree = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const response = await structureService.getFullTree();
    
    if (response.data) {
      setTreeData(response.data);
    } else {
      throw new Error('No se recibieron datos del servidor');
    }
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    setError(`Error al cargar estructura: ${errorMessage}`);
    console.error('Error loading structure tree:', err);
  } finally {
    setIsLoading(false);
  }
}, []);

  return {
  // Estado
  treeData,
  isLoading,
  error,

  // Acciones
  loadTree,
  createElement,
  editElement,
  deleteElement,
  clearError,
};
};