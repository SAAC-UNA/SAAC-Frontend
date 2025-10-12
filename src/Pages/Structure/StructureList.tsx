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
  
const { isLoading, deleteElement, activateElement, deactivateElement, loadTree } = useStructure();

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

  const handleToggleActive = (element: StructureElement) => {
    console.log('🔥 handleToggleActive llamado con:', element);
    setToggleActiveModalState({
      isOpen: true,
      element
    });
    console.log('📋 Estado del modal después de setear:', { isOpen: true, element });
  };

  const confirmDeleteElement = async () => {
  if (deleteModalState.element) {
    try {
      const result = await deleteElement(deleteModalState.element.type, deleteModalState.element.id);
      
      if (result) {
        setDeleteModalState({ isOpen: false, element: null });
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
      if (element.active) {
        // Desactivar elemento
        await deactivateElement(element.type, element.id);
      } else {
        // Activar elemento
        await activateElement(element.type, element.id);
      }
      
      setToggleActiveModalState({ isOpen: false, element: null });
      loadTree(); // Recargar datos
      
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
      <EditConfirmationModal
        isOpen={toggleActiveModalState.isOpen && toggleActiveModalState.element !== null && !toggleActiveModalState.element.active}
        onClose={cancelToggleActive}
        onConfirm={confirmToggleActive}
        title="Confirmar activación"
        message={`¿Está seguro de que desea activar el elemento "${toggleActiveModalState.element?.name || toggleActiveModalState.element?.nomenclature}"?`}
        confirmLabel="Activar"
        cancelLabel="Cancelar"
        variant="info"
        isLoading={isLoading}
        description="Al activar este elemento, volverá a estar disponible para su uso en el sistema."
      />

      {/* Modal de confirmación para DESACTIVAR */}
      <DeleteConfirmationModal
        isOpen={toggleActiveModalState.isOpen && toggleActiveModalState.element !== null && toggleActiveModalState.element.active}
        onClose={cancelToggleActive}
        onConfirm={confirmToggleActive}
        title="Confirmar desactivación"
        message={`¿Está seguro de que desea desactivar el elemento "${toggleActiveModalState.element?.name || toggleActiveModalState.element?.nomenclature}"?`}
        confirmLabel="Desactivar"
        cancelLabel="Cancelar"
        variant="warning"
        hideDefaultDangerMessage={true}
        isLoading={isLoading}
        description="Al desactivar este elemento, dejará de estar disponible en el sistema. Esta acción es reversible."
      />
    </div>
  );
};

export default StructureList;