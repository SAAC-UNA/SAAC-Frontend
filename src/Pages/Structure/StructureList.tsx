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
import { SuccessModal } from '@/Components/Ui/SuccessModal';
import { LoadingSpinner } from '@/Components/Ui/Loading';

const StructureList: React.FC = () => {
  
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = MODULE_INFO.structure;
  
  const { 
  isLoading, 
  deleteElement, 
  activateElement, 
  deactivateElement, 
  activateElementWithoutReload,
  deactivateElementWithoutReload,
  loadTree,
  treeData 
} = useStructure();
  console.log('🗑️ Total elementos en treeData:', treeData.length);

  // Estado para el modal de confirmación de eliminación
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    element: StructureElement | null;
  }>({
    isOpen: false,
    element: null
  });

  // Estado para el modal de éxito después de eliminar
  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    elementName: string;
  }>({
    isOpen: false,
    elementName: ''
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
    console.log('🗑️ handleDeleteElement llamado con:', element);
    setDeleteModalState({
      isOpen: true,
      element
    });
    console.log('🗑️ deleteModalState actualizado:', { isOpen: true, element });
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
      const flatten = (elements: StructureElement[]) => {
        for (const element of elements) {
          result.push(element);
          if (element.childElements && element.childElements.length > 0) {
            flatten(element.childElements);
          }
        }
      };
  
      flatten(nodes);
      return result;
    };
    
    const allElements = flattenTree(treeData);
    
    console.log('🔍 DEBUG - Elemento seleccionado:', {
      id: element.id,
      type: element.type,
      name: element.name || element.nomenclature,
      active: element.active
    });
    
    console.log('🔍 DEBUG - Total elementos disponibles:', allElements.length);
    
    // Definir las dos jerarquías del sistema
const ORGANIZATIONAL_HIERARCHY = ['university', 'campus', 'faculty', 'career'];
const SINAES_HIERARCHY = ['dimension', 'component', 'criteria', 'standard', 'evidence'];

// Función para encontrar descendientes SOLO de este elemento dentro de su jerarquía
const getAllDescendants = (parentId: string): StructureElement[] => {
  const descendants: StructureElement[] = [];
  const toProcess = [parentId];
  const processed = new Set<string>();
  
  // Encontrar el elemento padre para determinar su jerarquía
  // Buscar TODOS los elementos con este ID (puede haber duplicados)
const elementsWithSameId = allElements.filter(el => String(el.id) === String(parentId));

console.log(`🔍 Elementos encontrados con ID ${parentId}:`, elementsWithSameId.map(e => ({
  id: e.id,
  type: e.type,
  name: e.name || e.nomenclature,
  parentId: e.parentElementId
})));

// Usar el elemento original que se está activando/desactivando (element)
// en lugar de buscarlo en allElements
const parentElement = element.id === parentId ? element : allElements.find(el => String(el.id) === String(parentId));
  if (!parentElement) {
    console.log(`⚠️ No se encontró el elemento padre con ID: ${parentId}`);
    return descendants;
  }
  
  // Determinar a qué jerarquía pertenece el elemento
  const isOrganizational = ORGANIZATIONAL_HIERARCHY.includes(parentElement.type);
  const validHierarchy = isOrganizational ? ORGANIZATIONAL_HIERARCHY : SINAES_HIERARCHY;
  
  console.log(`🔍 Iniciando búsqueda de descendientes para: ${parentId}`);
  console.log(`📊 Tipo: ${parentElement.type}, Jerarquía: ${isOrganizational ? 'ORGANIZACIONAL' : 'SINAES'}`);
  
  while (toProcess.length > 0) {
    const currentId = String(toProcess.shift()!);
    
    if (processed.has(currentId)) continue;
    processed.add(currentId);
    
    // Filtrar hijos que:
    // 1. Tengan este elemento como padre
    // 2. Pertenezcan a la misma jerarquía
    const children = allElements.filter(el => 
      String(el.parentElementId) === String(currentId) &&
      validHierarchy.includes(el.type)
    );
    
    console.log(`  🔍 Hijos directos de ${currentId}:`, children.map(c => ({
      id: c.id,
      type: c.type,
      name: c.name || c.nomenclature,
      parentId: c.parentElementId
    })));
    
    for (const child of children) {
      if (!descendants.some(d => d.id === child.id)) {
        descendants.push(child);
        toProcess.push(String(child.id));
      }
    }
  }
  
  console.log(`✅ Total descendientes encontrados: ${descendants.length}`);
  console.log(`📋 Tipos encontrados:`, [...new Set(descendants.map(d => d.type))]);
  return descendants;
};
    
    if (element.active) {
      // ========== DESACTIVAR elemento ==========
      console.log('⚡ DESACTIVANDO elemento principal');
      await deactivateElementWithoutReload(element.type, element.id);
      
      // Si está marcado el checkbox, desactivar hijos en cascada
      if (cascadeChildren) {
        const descendants = getAllDescendants(element.id);
        
        console.log('📋 Descendientes a desactivar:', descendants.map(d => ({
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
            await deactivateElementWithoutReload(descendant.type, descendant.id);
          }
        }
      }
      
    } else {
      // ========== ACTIVAR elemento ==========
      console.log('✅ ACTIVANDO elemento principal');
      await activateElementWithoutReload(element.type, element.id);
      
      // Si está marcado el checkbox, activar hijos inactivos en cascada
      if (cascadeChildren) {
        const descendants = getAllDescendants(element.id);
        
        console.log('📋 Descendientes a activar:', descendants.map(d => ({
          id: d.id,
          type: d.type,
          name: d.name || d.nomenclature,
          parentId: d.parentElementId,
          active: d.active
        })));
        
        // Activar todos los descendientes inactivos
        for (const descendant of descendants) {
          if (!descendant.active) {
            console.log(`  ✅ Activando: ${descendant.type} - ${descendant.name || descendant.nomenclature}`);
            await activateElementWithoutReload(descendant.type, descendant.id);
          } else {
            console.log(`  ⏭️ Saltando (ya activo): ${descendant.type} - ${descendant.name || descendant.nomenclature}`);
          }
        }
      }
    }
    
    /// Recargar el árbol
    await loadTree();

    console.log('🔄 Recargando página para reflejar cambios...');

    // Cerrar modal
    setToggleActiveModalState({ isOpen: false, element: null });
    setCascadeChildren(false);

    // Recargar página completa después de un delay mínimo
    setTimeout(() => {
      window.location.reload();
    }, 300);
    
  } catch (error) {
    console.error('Error al cambiar estado del elemento:', error);
    // Cerrar modal incluso si hay error
    setToggleActiveModalState({ isOpen: false, element: null });
    setCascadeChildren(false);
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
  <>
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
    </div>

    {/* Modal de confirmación de eliminación*/}
    <DeleteConfirmationModal
      isOpen={deleteModalState.isOpen}
      onClose={cancelDeleteElement}
      onConfirm={confirmDeleteElement}
      title="Confirmar Eliminación"
      itemName={deleteModalState.element?.name || deleteModalState.element?.nomenclature}
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      variant="danger"
      isLoading={isLoading}
    />

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
    </>
  );
};

export default StructureList;