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

// Datos mock temporales para desarrollo (hasta que esté el backend)
const mockTreeData: StructureElement[] = [
  {
    id: '1',
    code: 'UNA',
    name: 'Universidad Nacional',
    description: 'Universidad Nacional de Costa Rica',
    type: 'university' as ElementType,
    active: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  },
  {
    id: '2',
    code: 'UNA-ALAJUELA',
    name: 'Sede Regional Central Occidente',
    description: 'Campus Alajuela',
    type: 'campus' as ElementType,
    parentElementId: '1',
    active: true,
    createdAt: new Date('2024-01-02'),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  },
  {
    id: '3',
    code: 'FAC-EXACTAS',
    name: 'Facultad de Ciencias Exactas y Naturales',
    description: 'Facultad de Ciencias Exactas y Naturales',
    type: 'faculty' as ElementType,
    parentElementId: '2',
    active: true,
    createdAt: new Date('2024-01-03'),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  },
  {
    id: '4',
    code: 'ING-SIS',
    name: 'Ingeniería en Sistemas de Información',
    description: 'Carrera de Ingeniería en Sistemas',
    type: 'career' as ElementType,
    parentElementId: '3',
    active: true,
    createdAt: new Date('2024-01-04'),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  },
  {
    id: '5',
    code: 'DIM-01',
    name: 'Gestión del Programa',
    description: 'Primera dimensión de evaluación',
    type: 'dimension' as ElementType,
    parentElementId: '4',
    active: true,
    createdAt: new Date('2024-01-05'),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  },
  {
    id: '6',
    code: 'COMP-01',
    name: 'Propósitos del Programa',
    description: 'Primer componente de gestión',
    type: 'component' as ElementType,
    parentElementId: '5',
    active: true,
    createdAt: new Date('2024-01-06'),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  },
  {
    id: '7',
    code: 'CRIT-01',
    name: 'Correspondencia con la Misión',
    description: 'Criterio sobre alineación con misión institucional',
    type: 'criteria' as ElementType,
    parentElementId: '6',
    active: true,
    createdAt: new Date('2024-01-07'),
    createdBy: 'admin',
    hasChildren: true,
    canDelete: false
  },
  {
    id: '8',
    code: 'EVD-01',
    name: 'Plan de Estudios Vigente',
    description: 'Documento oficial del plan de estudios',
    type: 'evidence' as ElementType,
    parentElementId: '7',
    active: true,
    createdAt: new Date('2024-01-08'),
    createdBy: 'admin',
    hasChildren: false,
    canDelete: true
  }
];

// Flag para activar/desactivar el modo mock
const USE_MOCK_DATA = true;

interface UseStructureReturn {
  // Estados
  isLoading: boolean;
  error: string | null;
  elements: StructureElement[];
  treeData: StructureElement[];
  
  // Acciones CRUD
  createElement: (elementData: CreateElementForm) => Promise<StructureElement | null>;
  editElement: (elementType: ElementType, elementId: string, elementData: EditElementForm) => Promise<StructureElement | null>;
  deleteElement: (elementType: ElementType, elementId: string) => Promise<boolean>;
  activateElement: (elementType: ElementType, elementId: string) => Promise<boolean>;
  deactivateElement: (elementType: ElementType, elementId: string) => Promise<boolean>;
  
  // Acciones de consulta
  getElementById: (elementType: ElementType, elementId: string) => Promise<StructureElement | null>;
  loadElements: (elementType: ElementType, criteria?: StructureSearchCriteria) => Promise<StructureElement[] | null>;
  loadTree: (rootType?: ElementType, rootId?: string) => Promise<StructureElement[] | null>;
  searchElements: (criteria: StructureSearchCriteria) => Promise<{ elements: StructureElement[]; total: number } | null>;
  
  // Acciones batch
  batchActivate: (elementIds: string[]) => Promise<boolean>;
  batchDeactivate: (elementIds: string[]) => Promise<boolean>;
  batchDelete: (elementIds: string[]) => Promise<boolean>;
  
  // Utilidades
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export const useStructure = (): UseStructureReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elements, setElements] = useState<StructureElement[]>([]);
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
      const response: ApiResponse<StructureElement> = await structureService.create(elementData);
      
      if (response.data) {
        // Agregar el nuevo elemento a la lista local (optimistic update)
        setElements(prevElements => [...prevElements, response.data!]);
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
        // Actualizar el elemento en la lista local (optimistic update)
        setElements(prevElements => 
          prevElements.map(element => 
            element.id === elementId ? response.data! : element
          )
        );
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
  const deleteElement = async (elementType: ElementType, elementId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await structureService.remove(elementType, elementId);
      
      // Remover el elemento de la lista local (optimistic update)
      setElements(prevElements => prevElements.filter(element => element.id !== elementId));
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al eliminar elemento: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Activar un elemento
   */
  const activateElement = async (elementType: ElementType, elementId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await structureService.activate(elementType, elementId);
      
      // Actualizar el elemento en la lista local
      setElements(prevElements => 
        prevElements.map(element => 
          element.id === elementId ? { ...element, active: true } : element
        )
      );
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al activar elemento: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Desactivar un elemento
   */
  const deactivateElement = async (elementType: ElementType, elementId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await structureService.deactivate(elementType, elementId);
      
      // Actualizar el elemento en la lista local
      setElements(prevElements => 
        prevElements.map(element => 
          element.id === elementId ? { ...element, active: false } : element
        )
      );
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al desactivar elemento: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtener un elemento por ID
   */
  const getElementById = async (elementType: ElementType, elementId: string): Promise<StructureElement | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<StructureElement> = await structureService.getById(elementType, elementId);
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('Elemento no encontrado');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al obtener elemento: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cargar elementos de un tipo específico con criterios opcionales
   */
  const loadElements = async (elementType: ElementType, criteria?: StructureSearchCriteria): Promise<StructureElement[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = criteria 
        ? await structureService.search({ ...criteria, type: elementType })
        : await structureService.list(elementType);
      
      if (response.data) {
        // Si es resultado de búsqueda, extraer los elementos
        const elements = 'elements' in response.data ? response.data.elements : response.data;
        setElements(elements);
        return elements;
      }
      
      throw new Error('No se recibieron datos del servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar elementos: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cargar estructura en forma de árbol
   */
  const loadTree = async (rootType?: ElementType, rootId?: string): Promise<StructureElement[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Usar datos mock mientras no esté disponible el backend
      if (USE_MOCK_DATA) {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTreeData(mockTreeData);
        return mockTreeData;
      }

      // Código para cuando esté el backend real
      const response: ApiResponse<StructureElement[]> = await structureService.tree(rootType, rootId);
      
      if (response.data) {
        setTreeData(response.data);
        return response.data;
      }
      
      throw new Error('No se recibieron datos del servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar árbol de estructura: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Buscar elementos con criterios específicos
   */
  const searchElements = async (criteria: StructureSearchCriteria): Promise<{ elements: StructureElement[]; total: number } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<{ elements: StructureElement[]; total: number }> = await structureService.search(criteria);
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('No se recibieron datos del servidor');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al buscar elementos: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Activar múltiples elementos
   */
  const batchActivate = async (elementIds: string[]): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await structureService.batch('activate', elementIds);
      
      // Actualizar elementos en la lista local
      setElements(prevElements => 
        prevElements.map(element => 
          elementIds.includes(element.id) ? { ...element, active: true } : element
        )
      );
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al activar elementos: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Desactivar múltiples elementos
   */
  const batchDeactivate = async (elementIds: string[]): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await structureService.batch('deactivate', elementIds);
      
      // Actualizar elementos en la lista local
      setElements(prevElements => 
        prevElements.map(element => 
          elementIds.includes(element.id) ? { ...element, active: false } : element
        )
      );
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al desactivar elementos: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Eliminar múltiples elementos
   */
  const batchDelete = async (elementIds: string[]): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await structureService.batch('delete', elementIds);
      
      // Remover elementos de la lista local
      setElements(prevElements => 
        prevElements.filter(element => !elementIds.includes(element.id))
      );
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al eliminar elementos: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refrescar todos los datos
   */
  const refreshData = async (): Promise<void> => {
    // Refrescar árbol de estructura
    await loadTree();
  };

  return {
    // Estados
    isLoading,
    error,
    elements,
    treeData,
    
    // Acciones CRUD
    createElement,
    editElement,
    deleteElement,
    activateElement,
    deactivateElement,
    
    // Acciones de consulta
    getElementById,
    loadElements,
    loadTree,
    searchElements,
    
    // Acciones batch
    batchActivate,
    batchDeactivate,
    batchDelete,
    
    // Utilidades
    clearError,
    refreshData,
  };
};