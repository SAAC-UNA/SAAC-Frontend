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
import { DeleteConfirmationModal } from '@/Components/Ui/DeleteConfirmationModal';

const StructureList: React.FC = () => {
  
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = MODULE_INFO.structure;
  
  const { 
  isLoading, 
  deleteElement,
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

  // Estado para el modal de confirmación de activar/desactivar
  const [toggleActiveModalState, setToggleActiveModalState] = useState<{
    isOpen: boolean;
    element: StructureElement | null;
  }>({
    isOpen: false,
    element: null
  });

  const [refreshKey, setRefreshKey] = useState(0);

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
      console.log('🔍 DEBUG - Elemento seleccionado:', {
        id: element.id,
        type: element.type,
        name: element.name || element.nomenclature,
        active: element.active
      });
      
      // El backend ahora maneja la desactivación en cascada automáticamente
      // Solo necesitamos cambiar el estado del elemento padre
      if (element.active) {
        console.log('⚡ DESACTIVANDO elemento (backend desactivará hijos automáticamente)');
        await deactivateElementWithoutReload(element.type, element.id);
      } else {
        console.log('✅ ACTIVANDO elemento');
        await activateElementWithoutReload(element.type, element.id);
      }
      
      // Recargar el árbol
      await loadTree();

      console.log('🔄 Recargando página para reflejar cambios...');

      // Cerrar modal
      setToggleActiveModalState({ isOpen: false, element: null });

      // Recargar página completa después de un delay mínimo
      setTimeout(() => {
        window.location.reload();
      }, 300);
      
    } catch (error) {
      console.error('Error al cambiar estado del elemento:', error);
      // Cerrar modal incluso si hay error
      setToggleActiveModalState({ isOpen: false, element: null });
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
            {hasChildren(toggleActiveModalState.element) && (
              <p className="text-xs text-[var(--text-info)] mt-2">
                <strong>Cascada automática:</strong> Todos los elementos dependientes (hijos) se activarán automáticamente en cascada.
              </p>
            )}
          </div>
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
            {hasChildren(toggleActiveModalState.element) && (
              <p className="text-xs text-[var(--text-warning)] mt-2">
                <strong>⚠️ Importante:</strong> Todos los elementos dependientes (hijos) se desactivarán automáticamente en cascada.
              </p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default StructureList;