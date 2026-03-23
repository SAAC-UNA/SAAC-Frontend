/**
 * StructureList - Página principal de listado de elementos de estructura
 * 
 * Esta página coordina el componente StructureTable y maneja la navegación
 * entre las diferentes acciones (crear, editar, eliminar).
 */

import React, { useState, useEffect } from 'react';
import { StructureTable } from './Components/StructureTable';
import { StructureEditModal } from './Components/StructureEditModal';
import { StructureCreateModal } from './Components/StructureCreateModal';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { PageHeader } from '@/Components/Ui/Index';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { getModuleInfo } from '@/Constants/ModuleInfo';
import type { StructureElement } from '@/Types/StructureTypes';
import { useStructure } from '@/Hooks/UseStructure';
import { DeleteConfirmationModal } from '@/Components/Ui/Modals/DeleteConfirmationModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import { Button } from '@/Components/Ui/Buttons/Button';
import { truncateText } from '@/Utils';

const StructureList: React.FC = () => {
  
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = getModuleInfo('structure_list');

  const { 
  isLoading, 
  deleteElement,
  activateElement,
  deactivateElement,
  loadTree,
  treeData 
} = useStructure();

  // Cargar árbol al montar la página
  useEffect(() => {
    loadTree();
  }, [loadTree]);

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

  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    elementName: string;
    action: 'activate' | 'deactivate' | 'delete';
  }>({
    isOpen: false,
    elementName: '',
    action: 'activate'
  });

  // Estado para el modal de creación
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Estado para el modal de edición
  const [editModalState, setEditModalState] = useState<{
    isOpen: boolean;
    element: StructureElement | null;
  }>({ isOpen: false, element: null });

  // Estado para búsqueda
  const [searchQuery, setSearchQuery] = useState('');

  const handleEditElement = (element: StructureElement) => {
    setEditModalState({ isOpen: true, element });
  };

  const handleDeleteElement = (element: StructureElement) => {
    setDeleteModalState({
      isOpen: true,
      element
    });
  };

  const handleToggleActive = async (element: StructureElement) => {
    // Cargar los datos si están vacíos
    if (treeData.length === 0) {
      await loadTree();
    }
    
    setToggleActiveModalState({
      isOpen: true,
      element
    });
  };

  // Verificar si un elemento tiene hijos buscando en todos los elementos
  const hasChildren = (element: StructureElement): boolean => {
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
    return allElements.some(el => el.parentElementId === element.id);
  };

  const confirmDeleteElement = async () => {
    if (deleteModalState.element) {
      try {
        const result = await deleteElement(deleteModalState.element.type, deleteModalState.element.id);
        
        if (result) {
          const elementName = deleteModalState.element.name || deleteModalState.element.nomenclature || 'Elemento';
          setDeleteModalState({ isOpen: false, element: null });
          
          // Mostrar modal de éxito
          setSuccessModalState({
            isOpen: true,
            elementName: elementName,
            action: 'delete'
          });
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
    const action = element.active ? 'deactivate' : 'activate';
    
    try {
        let changed = false;
      if (element.active) {
          changed = await deactivateElement(element.type, element.id);
      } else {
          changed = await activateElement(element.type, element.id);
      }

        if (!changed) {
          setToggleActiveModalState({ isOpen: false, element: null });
          return;
        }

      const elementName = element.name || element.nomenclature || 'Elemento';
      
      // Cerrar modal de confirmación
      setToggleActiveModalState({ isOpen: false, element: null });

      // Mostrar modal de éxito
      setSuccessModalState({
        isOpen: true,
        elementName: elementName,
        action: action
      });
      
    } catch (error) {
      console.error('Error al cambiar estado del elemento:', error);
      setToggleActiveModalState({ isOpen: false, element: null });
    }
  };

  const cancelToggleActive = () => {
    setToggleActiveModalState({ isOpen: false, element: null });
  };

  const handleCreateElement = () => {
    setCreateModalOpen(true);
  };

  const closeSuccessModal = () => {
    setSuccessModalState({ isOpen: false, elementName: '', action: 'activate' });
  };

 return (
    <>
      <ScreenContainer>
        <PageHeader
          title={moduleInfo.title}
          description={moduleInfo.description}
          headerExtra={
            <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto">
              <SearchInput
                placeholder="Buscar elementos..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-full sm:w-72"
              />
              <Button
                onClick={handleCreateElement}
                variant="secondary"
              >
                Crear
              </Button>
            </div>
          }
        />
        <StructureTable
          treeData={treeData}
          isLoading={isLoading}
          onEdit={handleEditElement}
          onDelete={handleDeleteElement}
          onToggleActive={handleToggleActive}
          searchQuery={searchQuery}
        />
      </ScreenContainer>

    {/* Modal de confirmación de eliminación*/}
    <DeleteConfirmationModal
      isOpen={deleteModalState.isOpen}
      onClose={cancelDeleteElement}
      onConfirm={confirmDeleteElement}
      title="Confirmar Eliminación"
      itemName={truncateText(deleteModalState.element?.name || deleteModalState.element?.nomenclature || '')}      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      variant="danger"
      isLoading={isLoading}
    />

      {/* Modal de confirmación para activar */}
      {toggleActiveModalState.element && !toggleActiveModalState.element.active && (
        <Modal
          isOpen={toggleActiveModalState.isOpen}
          onClose={cancelToggleActive}
          onConfirm={confirmToggleActive}
          variant="success"
          title="Confirmar activación"
          confirmLabel="Sí, activar"
          cancelLabel="Cancelar"
          confirmLoading={isLoading}
          showCancel
          showConfirm
        >
          <p className="text-sm text-gris-una-2 leading-relaxed">
            ¿Está seguro de que desea activar "<strong>{truncateText(toggleActiveModalState.element.name || toggleActiveModalState.element.nomenclature || '')}</strong>"?
          </p>
          <p className="mt-2 text-sm text-gris-una-2">
            Al activar este elemento, volverá a estar disponible para su uso en el sistema.
          </p>
          {hasChildren(toggleActiveModalState.element) && (
            <div className="mt-3 p-3 bg-[var(--color-info-light)] border border-[var(--color-info-ring)] rounded-corner">
              <p className="text-sm text-info-dark">
                <strong>Cascada automática:</strong> Todos los elementos dependientes (hijos) se activarán automáticamente.
              </p>
            </div>
          )}
        </Modal>
      )}

      {/* Modal de confirmación para inactivar */}
      {toggleActiveModalState.element && toggleActiveModalState.element.active && (
        <Modal
          isOpen={toggleActiveModalState.isOpen}
          onClose={cancelToggleActive}
          onConfirm={confirmToggleActive}
          variant="info"
          title="Confirmar inactivación"
          confirmLabel="Sí, inactivar"
          cancelLabel="Cancelar"
          confirmLoading={isLoading}
          showCancel
          showConfirm
          footerMeta="Esta acción puede ser revertida en el futuro"
        >
          <p className="text-sm text-gris-una-2 leading-relaxed">
            ¿Está seguro de que desea inactivar "<strong>{truncateText(toggleActiveModalState.element.name || toggleActiveModalState.element.nomenclature || '')}</strong>"?
          </p>
          <p className="mt-2 text-sm text-gris-una-2">
            Al inactivar este elemento, dejará de estar disponible en el sistema.
          </p>
          {hasChildren(toggleActiveModalState.element) && (
            <div className="mt-3 p-3 bg-[var(--color-warning-light)] border border-[var(--color-warning-ring)] rounded-corner">
              <p className="text-sm text-warning-dark">
                <strong>Importante:</strong> Todos los elementos dependientes (hijos) se inactivarán automáticamente en cascada.
              </p>
            </div>
          )}
        </Modal>
      )}
      {/* Modal de creación */}
      <StructureCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => { loadTree(); setCreateModalOpen(false); }}
      />

      {/* Modal de edición */}
      <StructureEditModal
        isOpen={editModalState.isOpen}
        onClose={() => setEditModalState({ isOpen: false, element: null })}
        element={editModalState.element}
        onSuccess={() => { loadTree(); setEditModalState({ isOpen: false, element: null }); }}
      />

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModalState.isOpen}
        onClose={closeSuccessModal}
        title={
          successModalState.action === 'activate' 
            ? 'Elemento activado' 
            : successModalState.action === 'deactivate'
            ? 'Elemento inactivado'
            : 'Elemento eliminado'
        }
        message={`El elemento "${truncateText(successModalState.elementName)}" ha sido ${
          successModalState.action === 'activate' 
            ? 'activado' 
            : successModalState.action === 'deactivate'
            ? 'inactivado'
            : 'eliminado'
        } correctamente.`}
      />
    </>
  );
};

export default StructureList;