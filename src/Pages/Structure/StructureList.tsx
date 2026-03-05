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
import { SuccessModal } from '@/Components/Ui/SuccessModal';
import { SearchInput } from '@/Components/Ui/SearchInput';
import { Button } from '@/Components/Ui/Button';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';

/**
 * Función auxiliar para truncar texto largo
 */
const truncateText = (text: string, maxLength: number = 25): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
};

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
          const elementName = deleteModalState.element.name || deleteModalState.element.nomenclature || 'Elemento';
          setDeleteModalState({ isOpen: false, element: null });
          
          // Mostrar modal de éxito
          setSuccessModalState({
            isOpen: true,
            elementName: elementName,
            action: 'delete'
          });
          
          setRefreshKey(prev => prev + 1);
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
      console.log('🔍 DEBUG - Elemento seleccionado:', {
        id: element.id,
        type: element.type,
        name: element.name || element.nomenclature,
        active: element.active
      });
      
      // Cambiar el estado del elemento
      if (element.active) {
        console.log('⚡ DESACTIVANDO elemento');
        await deactivateElementWithoutReload(element.type, element.id);
      } else {
        console.log('✅ ACTIVANDO elemento');
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
      
      // Recargar después de mostrar el éxito
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 1500);
      
    } catch (error) {
      console.error('Error al cambiar estado del elemento:', error);
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

  const closeSuccessModal = () => {
    setSuccessModalState({ isOpen: false, elementName: '', action: 'activate' });
  };

 return (
    <>
      <ScreenContainer
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
      >
        <StructureTable
          key={refreshKey}
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
              ¿Está seguro de que desea activar "<span className="font-bold">{truncateText(toggleActiveModalState.element?.name || toggleActiveModalState.element?.nomenclature || '')}</span>"?            </>
          }
          confirmLabel="Activar"
          cancelLabel="Cancelar"
          confirmLoading={isLoading}
          showCancel={true}
          showConfirm={true}
        >
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
        </Modal>
      )}

      {/* Modal de confirmación para INACTIVAR */}
      {toggleActiveModalState.isOpen && toggleActiveModalState.element && toggleActiveModalState.element.active && (
        <Modal
          isOpen={true}
          onClose={cancelToggleActive}
          onConfirm={confirmToggleActive}
          variant="warning"
          hideDefaultDangerMessage={false}
          title="Confirmar inactivación"
          message={
            <>
              ¿Está seguro de que desea inactivar "<span className="font-bold">{truncateText(toggleActiveModalState.element?.name || toggleActiveModalState.element?.nomenclature || '')}</span>"?            </>
          }
          confirmLabel="Inactivar"
          cancelLabel="Cancelar"
          confirmLoading={isLoading}
          showCancel={true}
          showConfirm={true}
        >
          <div className="mt-4 p-3 bg-[var(--color-warning-light)] border border-[var(--color-warning-ring)] rounded-corner">
            <p className="text-sm text-warning-dark">
              Al inactivar este elemento, dejará de estar disponible en el sistema. Esta acción es reversible.
            </p>
            {hasChildren(toggleActiveModalState.element) && (
              <p className="text-xs text-warning-dark mt-2">
                <strong>⚠️ Importante:</strong> Todos los elementos dependientes (hijos) se inactivarán automáticamente en cascada.
              </p>
            )}
          </div>
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
        message={`El elemento "${
          successModalState.elementName.length > 25 
            ? successModalState.elementName.substring(0, 25).trim() + '...' 
            : successModalState.elementName
        }" ha sido ${
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