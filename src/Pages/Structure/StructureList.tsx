/**
 * StructureList - Página principal de listado de elementos de estructura
 * 
 * Esta página coordina el componente StructureTable y maneja la navegación
 * entre las diferentes acciones (crear, editar, eliminar).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StructureTable } from './Components/StructureTable';
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
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { truncateText } from '@/Utils';

const StructureList: React.FC = () => {
  
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = getModuleInfo('structure_list');
  const navigate = useNavigate();

  const { 
  isLoading, 
  deleteElement,
  activateElementWithoutReload,
  deactivateElementWithoutReload,
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

  // Estado para búsqueda
  const [searchQuery, setSearchQuery] = useState('');

  const handleEditElement = (element: StructureElement) => {
    navigate(`/estructura/editar/formulario?id=${element.id}&type=${element.type}`);
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
      if (element.active) {
        await deactivateElementWithoutReload(element.type, element.id);
      } else {
        await activateElementWithoutReload(element.type, element.id);
      }
      
      // Recargar el árbol
      await loadTree();

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
    navigate('/estructura/crear');
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
                className="gap-2"
              >
                <SystemIcons.actions.add className="w-4 h-4" size="sm" />
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

      {/* Modal de confirmación para activar/inactivar */}
      {toggleActiveModalState.isOpen && toggleActiveModalState.element && (
        <Modal
          isOpen={true}
          onClose={cancelToggleActive}
          onConfirm={confirmToggleActive}
          variant={toggleActiveModalState.element.active ? 'warning' : 'info'}
          hideDefaultDangerMessage={!toggleActiveModalState.element.active}
          title={toggleActiveModalState.element.active ? 'Confirmar inactivación' : 'Confirmar activación'}
          message={
            <>
              ¿Está seguro de que desea {toggleActiveModalState.element.active ? 'inactivar' : 'activar'} "<span className="font-bold">{truncateText(toggleActiveModalState.element.name || toggleActiveModalState.element.nomenclature || '')}</span>"?
            </>
          }
          confirmLabel={toggleActiveModalState.element.active ? 'Inactivar' : 'Activar'}
          cancelLabel="Cancelar"
          confirmLoading={isLoading}
          showCancel={true}
          showConfirm={true}
        >
          {toggleActiveModalState.element.active ? (
            <div className="mt-4 p-3 bg-[var(--color-warning-light)] border border-[var(--color-warning-ring)] rounded-corner">
              <p className="text-sm text-warning-dark">
                Al inactivar este elemento, dejará de estar disponible en el sistema. Esta acción es reversible.
              </p>
              {hasChildren(toggleActiveModalState.element) && (
                <p className="text-xs text-warning-dark mt-2">
                  <strong>Importante:</strong> Todos los elementos dependientes (hijos) se inactivarán automáticamente en cascada.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4 p-3 bg-[var(--color-info-light)] border border-[var(--color-info-ring)] rounded-corner">
              <p className="text-sm text-info-dark">
                Al activar este elemento, volverá a estar disponible para su uso en el sistema.
              </p>
              {hasChildren(toggleActiveModalState.element) && (
                <p className="text-xs text-info-dark mt-2">
                  <strong>Cascada automática:</strong> Todos los elementos dependientes (hijos) se activarán automáticamente en cascada.
                </p>
              )}
            </div>
          )}
        </Modal>
      )}
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