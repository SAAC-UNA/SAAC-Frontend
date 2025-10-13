/**
 * StructureList - Página principal de listado de elementos de estructura
 * 
 * Esta página coordina el componente StructureTable y maneja la navegación
 * entre las diferentes acciones (crear, editar, eliminar).
 */

import React, { useState } from 'react';
import { StructureTable } from './Components/StructureTable';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { Modal } from '@/Components/Ui/Modal';
import { MODULE_INFO } from '@/Constants/ModuleInfo';
import type { StructureElement } from '@/Types/StructureTypes';
import { useStructure } from '@/Hooks/UseStructure';
import { EditConfirmationModal } from '@/Components/Ui/EditConfirmationModal';
import { DeleteConfirmationModal } from '@/Components/Ui/DeleteConfirmationModal';

const StructureList: React.FC = () => {
  
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = MODULE_INFO.structure;
  
  const { isLoading, deleteElement, activateElement, deactivateElement, loadTree, treeData } = useStructure();
  console.log('🗑️ Total elementos en treeData:', treeData.length);

  // Estado para el modal de confirmación de eliminación
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    element: StructureElement | null;
  }>({
    isOpen: false,
    element: null
  });

  // Estado para el modal de confirmación de activar/desactivar
  const [toggleActiveModalState, setToggleActiveModalState] = useState<{
    isOpen: boolean;
    element: StructureElement | null;
  }>({
    isOpen: false,
    element: null
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const [cascadeChildren, setCascadeChildren] = useState(false);

  const handleEditElement = (element: StructureElement) => {
    // Navegar directamente a la página de edición con el ID del elemento
    window.location.href = `/estructura/editar/formulario?id=${element.id}&type=${element.type}`;
  };

  const handleDeleteElement = (element: StructureElement) => {
    setDeleteModalState({
      isOpen: true,
      element
    });
  };

  const handleToggleActive = async (element: StructureElement) => {
    setCascadeChildren(false); // Resetear el checkbox
    
    // Cargar los datos si están vacíos
    if (treeData.length === 0) {
      console.log('⚠️ treeData vacío, recargando...');
      await loadTree();
    }
    
    setToggleActiveModalState({
      isOpen: true,
      element
    });
  };

  // Verificar si un elemento tiene hijos buscando en todos los elementos
  const hasChildren = (element: StructureElement): boolean => {
    console.log('🔍 hasChildren - Estado actual:', {
      elementId: element.id,
      elementName: element.name || element.nomenclature,
      treeDataLength: treeData.length,
    });
    
    // Aplanar el árbol para obtener todos los elementos
    const flattenTree = (nodes: StructureElement[]): StructureElement[] => {
      return nodes.reduce((acc, node) => {
        acc.push(node);
        if (node.childElements && node.childElements.length > 0) {
          acc.push(...flattenTree(node.childElements));
        }
        return acc;
      }, [] as StructureElement[]);
    };

    const allElements = flattenTree(treeData);
    
    // Buscar si hay elementos que tengan este elemento como padre
    const hasChildElements = allElements.some(el => el.parentElementId === element.id);
    
    console.log('🔍 hasChildren - Resultado:', {
      allElementsCount: allElements.length,
      hasChildElements,
      childrenFound: allElements.filter(el => el.parentElementId === element.id).map(c => c.name || c.nomenclature)
    });
    
    return hasChildElements;
  };

  const confirmDeleteElement = async () => {
  if (deleteModalState.element) {
    try {
      const result = await deleteElement(deleteModalState.element.type, deleteModalState.element.id);
      
      if (result) {
        setDeleteModalState({ isOpen: false, element: null });
        setRefreshKey(prev => prev + 1);
        // TODO: Mostrar notificación de éxito
      }
    } catch (error) {
      console.error('Error al eliminar elemento:', error);
    }
  }
};

  const cancelDeleteElement = () => {
    setDeleteModalState({ isOpen: false, element: null });
  };

  const confirmToggleActive = async () => {
  if (!toggleActiveModalState.element) return;

  const element = toggleActiveModalState.element;
  
  try {
    // Aplanar el árbol una sola vez al inicio
    const flattenTree = (nodes: StructureElement[]): StructureElement[] => {
      const result: StructureElement[] = [];
      const stack = [...nodes];
      
      while (stack.length > 0) {
        const node = stack.pop()!;
        result.push(node);
        
        if (node.childElements && node.childElements.length > 0) {
          stack.push(...node.childElements);
        }
      }
      
      return result;
    };
    
    const allElements = flattenTree(treeData);
    
    // Función para encontrar descendientes usando un enfoque iterativo (sin recursión)
    const getAllDescendants = (parentId: string): StructureElement[] => {
      const descendants: StructureElement[] = [];
      const toProcess = [parentId]; // Cola de IDs a procesar
      const processed = new Set<string>(); // IDs ya procesados
      
      while (toProcess.length > 0) {
        const currentId = toProcess.shift()!;
        
        // Evitar procesar el mismo elemento dos veces
        if (processed.has(currentId)) continue;
        processed.add(currentId);
        
        // Encontrar hijos directos de este elemento
        const children = allElements.filter(el => el.parentElementId === currentId);
        
        for (const child of children) {
          descendants.push(child);
          toProcess.push(child.id); // Agregar para procesar sus hijos
        }
      }
      
      return descendants;
    };
    
    if (element.active) {
  // ========== DESACTIVAR elemento ==========
  await deactivateElement(element.type, element.id);
  
  // Si está marcado el checkbox, desactivar hijos en cascada
  if (cascadeChildren) {
    const descendants = getAllDescendants(element.id);
    
    console.log('🔍 DESACTIVANDO EN CASCADA:');
    console.log('  📦 Total elementos en treeData:', allElements.length);
    console.log('  👶 Descendientes encontrados:', descendants.length);
    console.log('  📋 Lista de descendientes:', descendants.map(d => ({
      id: d.id,
      type: d.type,
      name: d.name || d.nomenclature,
      parentId: d.parentElementId,
      active: d.active
    })));
    
    // Desactivar todos los descendientes activos
    for (const descendant of descendants) {
      if (descendant.active) {
        console.log(`  ⚡ Desactivando: ${descendant.type} - ${descendant.name || descendant.nomenclature}`);
        await deactivateElement(descendant.type, descendant.id);
      }
    }
  }
  
} else {
      // ========== ACTIVAR elemento ==========
      await activateElement(element.type, element.id);
      
      // Si está marcado el checkbox, activar hijos inactivos en cascada
      if (cascadeChildren) {
        const descendants = getAllDescendants(element.id);
        
        // Activar todos los descendientes inactivos
        for (const descendant of descendants) {
          if (!descendant.active) {
            await activateElement(descendant.type, descendant.id);
          }
        }
      }
    }
    
    // Cerrar modal
    setToggleActiveModalState({ isOpen: false, element: null });
    setCascadeChildren(false);

    // Recargar el árbol completo desde el backend
    await loadTree();

    // Forzar re-render de la tabla
    setRefreshKey(prev => prev + 1);
    
  } catch (error) {
    console.error('Error al cambiar estado del elemento:', error);
  }
};

  const cancelToggleActive = () => {
    setToggleActiveModalState({ isOpen: false, element: null });
  };

  const handleCreateElement = () => {
    window.location.href = '/estructura/crear';
  };

  console.log('🎯 Estado toggleActiveModalState:', toggleActiveModalState);

 return (
    <div className="container mx-auto px-4 py-8">
      <ScreenContainer
        title={moduleInfo.title}
        description={moduleInfo.description}
      >
        <StructureTable
          key={refreshKey}
          onEdit={handleEditElement}
          onDelete={handleDeleteElement}
          onToggleActive={handleToggleActive}
          onCreate={handleCreateElement}
        />
      </ScreenContainer>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModalState.isOpen}
        onClose={cancelDeleteElement}
        title="Confirmar Eliminación"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Está seguro de que desea eliminar el elemento <strong>"{deleteModalState.element?.name || deleteModalState.element?.nomenclature}"</strong>?
          </p>
          <p className="text-sm text-[var(--text-error)]">
            Esta acción no se puede deshacer.
          </p>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={cancelDeleteElement}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDeleteElement}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmación para ACTIVAR */}
      {toggleActiveModalState.isOpen && toggleActiveModalState.element && !toggleActiveModalState.element.active && (
        <Modal
          isOpen={true}
          onClose={cancelToggleActive}
          onConfirm={confirmToggleActive}
          variant="info"
          hideDefaultDangerMessage={true}
          title="Confirmar activación"
          message={
            <>
              ¿Está seguro de que desea activar "<span className="font-bold">{toggleActiveModalState.element?.name || toggleActiveModalState.element?.nomenclature}</span>"?
            </>
          }
          confirmLabel="Activar"
          cancelLabel="Cancelar"
          confirmLoading={isLoading}
          showCancel={true}
          showConfirm={true}
        >
          <div className="mt-4 p-3 bg-[var(--bg-info)] border border-[var(--border-info)] rounded-lg">
            <p className="text-sm text-[var(--text-info)]">
              Al activar este elemento, volverá a estar disponible para su uso en el sistema.
            </p>
          </div>

          {/* Checkbox para activar hijos en cascada */}
          {(() => {
            const hasChildrenResult = hasChildren(toggleActiveModalState.element);
            console.log('🔍 Modal ACTIVAR - hasChildren:', hasChildrenResult);
            return hasChildrenResult;
          })() && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="cascadeChildrenActivate"
                  checked={cascadeChildren}
                  onChange={(e) => setCascadeChildren(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="cascadeChildrenActivate" className="text-sm font-medium text-blue-900 cursor-pointer">
                    Activar también todos los elementos dependientes inactivos
                  </label>
                  <p className="text-xs text-blue-700 mt-1">
                    Al marcar esta opción, se activarán automáticamente todos los elementos inactivos que dependen de este.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Modal de confirmación para DESACTIVAR */}
      {toggleActiveModalState.isOpen && toggleActiveModalState.element && toggleActiveModalState.element.active && (
        <Modal
          isOpen={true}
          onClose={cancelToggleActive}
          onConfirm={confirmToggleActive}
          variant="warning"
          hideDefaultDangerMessage={false}
          title="Confirmar desactivación"
          message={
            <>
              ¿Está seguro de que desea desactivar "<span className="font-bold">{toggleActiveModalState.element?.name || toggleActiveModalState.element?.nomenclature}</span>"?
            </>
          }
          confirmLabel="Desactivar"
          cancelLabel="Cancelar"
          confirmLoading={isLoading}
          showCancel={true}
          showConfirm={true}
        >
          <div className="mt-4 p-3 bg-[var(--bg-warning)] border border-[var(--border-warning)] rounded-lg">
            <p className="text-sm text-[var(--text-warning)]">
              Al desactivar este elemento, dejará de estar disponible en el sistema. Esta acción es reversible.
            </p>
          </div>

          {/* Checkbox para desactivar hijos en cascada */}
          {hasChildren(toggleActiveModalState.element) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="cascadeChildrenDeactivate"
                  checked={cascadeChildren}
                  onChange={(e) => setCascadeChildren(e.target.checked)}
                  className="mt-1 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="cascadeChildrenDeactivate" className="text-sm font-medium text-yellow-900 cursor-pointer">
                    Desactivar también todos los elementos dependientes
                  </label>
                  <p className="text-xs text-yellow-700 mt-1">
                    Al marcar esta opción, se desactivarán automáticamente todos los elementos que dependen de este.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>
)}
    </div>
  );
};

export default StructureList;