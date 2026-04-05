/**
 * StructureList - Página principal de listado de elementos de estructura
 * 
 * Esta página coordina el componente StructureTable y maneja la navegación
 * entre las diferentes acciones (crear, editar, eliminar).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { useToast } from '@/Context/ToastContext';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { FlexibleElementTable } from './Components/FlexibleElementTable';
import { StructureElementFormModal } from '@/Pages/StructureModels/Components/StructureElementFormModal';
import { useStructureModels } from '@/Hooks/UseStructureModels';
import { useStructureElements } from '@/Hooks/UseStructureElements';
import type { FlexibleElement, CreateFlexibleElementForm, EditFlexibleElementForm } from '@/Types/StructureModelTypes';
import { Card } from '@/Components/Ui/Layout/Card';

const StructureList: React.FC = () => {
  
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = getModuleInfo('structure_list');

  const { showToast } = useToast();

  const { 
  isLoading, 
  deleteElement,
  activateElement,
  deactivateElement,
  loadTree,
  treeData 
} = useStructure();

  // ── Selector de modelo ─────────────────────────────────────────────────────
  const { models } = useStructureModels();
  const [searchParams, setSearchParams] = useSearchParams();

  const SESSION_KEY = 'saac.structure.lastModel';

  const initialModelId = (): number | null => {
    // Prioridad 1: parámetro URL (viene de una tarjeta de modelo)
    const urlRaw = searchParams.get('modelo');
    if (urlRaw && urlRaw !== '0') {
      const parsed = Number(urlRaw);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    // Prioridad 2: último modelo usado en esta sesión
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored && stored !== '0') {
      const parsed = Number(stored);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    // Por defecto: Modelo Tradicional
    return null;
  };

  const [selectedModelId, setSelectedModelId] = useState<number | null>(initialModelId);
  const isFlexible = selectedModelId !== null;

  // Sincronizar selección con sessionStorage
  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, selectedModelId !== null ? String(selectedModelId) : '0');
  }, [selectedModelId]);

  const {
    elements,
    isLoading: elemLoading,
    createElement,
    updateElement: updateFlexElement,
    deleteElement: deleteFlexElement,
    toggleActive: toggleFlexActive,
  } = useStructureElements(selectedModelId);

  const modelOptions = useMemo(() => [
    { value: '0', label: 'Modelo Tradicional' },
    ...models
      .filter(m => m.tipo === 'elemento_flexible')
      .map(m => ({ value: String(m.modelo_estructura_id), label: m.nombre })),
  ], [models]);

  const selectedModel = useMemo(
    () => models.find(m => m.modelo_estructura_id === selectedModelId) ?? null,
    [models, selectedModelId]
  );

  const handleModelChange = (val: string) => {
    const newId = val === '0' ? null : Number(val);
    setSelectedModelId(newId);
    setSearchQuery('');
    // Actualizar URL para que el botón "atrás" refleje el estado correcto
    setSearchParams(newId ? { modelo: String(newId) } : {}, { replace: true });
  };

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

  // ── Estados modales para modo flexible ────────────────────────────────────
  const [flexFormModal, setFlexFormModal] = useState<{
    isOpen: boolean;
    element: FlexibleElement | null;
  }>({ isOpen: false, element: null });

  const [flexDeleteModal, setFlexDeleteModal] = useState<{
    isOpen: boolean;
    element: FlexibleElement | null;
    loading: boolean;
  }>({ isOpen: false, element: null, loading: false });

  const [flexToggleModal, setFlexToggleModal] = useState<{
    isOpen: boolean;
    element: FlexibleElement | null;
  }>({ isOpen: false, element: null });

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
        showToast({
          type: 'error',
          title: 'Error al eliminar elemento',
          message: error instanceof Error ? error.message : 'No se pudo eliminar el elemento'
        });
        setDeleteModalState({ isOpen: false, element: null });
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
      showToast({
        type: 'error',
        title: 'Error al cambiar estado',
        message: error instanceof Error ? error.message : 'No se pudo cambiar el estado del elemento'
      });
      setToggleActiveModalState({ isOpen: false, element: null });
    }
  };

  const cancelToggleActive = () => {
    setToggleActiveModalState({ isOpen: false, element: null });
  };

  const handleCreateElement = () => {
    setCreateModalOpen(true);
  };

  // ── Handlers modo flexible ─────────────────────────────────────────────────
  const handleFlexEdit = (el: FlexibleElement) => setFlexFormModal({ isOpen: true, element: el });
  const handleFlexDelete = (el: FlexibleElement) => setFlexDeleteModal({ isOpen: true, element: el, loading: false });
  const handleFlexToggleActive = (el: FlexibleElement) => setFlexToggleModal({ isOpen: true, element: el });

  const handleFlexFormConfirm = async (
    form: CreateFlexibleElementForm | EditFlexibleElementForm,
    id?: number
  ) => {
    if (id !== undefined) return updateFlexElement(id, form as EditFlexibleElementForm);
    return createElement(form as CreateFlexibleElementForm);
  };

  const confirmFlexDelete = async () => {
    if (!flexDeleteModal.element) return;
    const elName = flexDeleteModal.element.tipo;
    setFlexDeleteModal(p => ({ ...p, loading: true }));
    const result = await deleteFlexElement(flexDeleteModal.element.elemento_id);
    setFlexDeleteModal({ isOpen: false, element: null, loading: false });
    if (result.success) {
      setSuccessModalState({ isOpen: true, elementName: elName, action: 'delete' });
    } else {
      showToast({ type: 'error', title: result.error ?? 'Error al eliminar el elemento' });
    }
  };

  const confirmFlexToggle = async () => {
    if (!flexToggleModal.element) return;
    const el = flexToggleModal.element;
    const action: 'activate' | 'deactivate' = el.activo ? 'deactivate' : 'activate';
    const result = await toggleFlexActive(el.elemento_id, !el.activo);
    setFlexToggleModal({ isOpen: false, element: null });
    if (result.success) {
      setSuccessModalState({ isOpen: true, elementName: el.tipo, action });
    } else {
      showToast({ type: 'error', title: result.error ?? 'Error al cambiar el estado' });
    }
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
            <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto items-end">
              <Card>
                <CustomSelect
                  label="Modelo"
                  value={selectedModelId === null ? '0' : String(selectedModelId)}
                  onChange={handleModelChange}
                  options={modelOptions}
                  className="w-52"
                />
              </Card>
              <SearchInput
                placeholder="Buscar elementos..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-full sm:w-72"
              />
              <Button
                onClick={isFlexible ? () => setFlexFormModal({ isOpen: true, element: null }) : handleCreateElement}
                variant="secondary"
              >
                Crear
              </Button>
            </div>
          }
        />
        {isFlexible ? (
          <FlexibleElementTable
            elements={elements}
            isLoading={elemLoading}
            searchQuery={searchQuery}
            onEdit={handleFlexEdit}
            onDelete={handleFlexDelete}
            onToggleActive={handleFlexToggleActive}
          />
        ) : (
          <StructureTable
            treeData={treeData}
            isLoading={isLoading}
            onEdit={handleEditElement}
            onDelete={handleDeleteElement}
            onToggleActive={handleToggleActive}
            searchQuery={searchQuery}
          />
        )}
      </ScreenContainer>

    {/* Modal de confirmación de eliminación*/}
    <DeleteConfirmationModal
      isOpen={deleteModalState.isOpen}
      onClose={cancelDeleteElement}
      onConfirm={confirmDeleteElement}
      title="Confirmar Eliminación"
      itemName={truncateText(deleteModalState.element?.name || deleteModalState.element?.nomenclature || '')}      
      confirmLabel="Sí, eliminar"
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
            Al activar este elemento, volverá a estar disponible para su uso en el sistema
            {hasChildren(toggleActiveModalState.element) && ' y se activarán los elementos conectados a este'}.
          </p>
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
            Al inactivar este elemento, dejará de estar disponible en el sistema
            {hasChildren(toggleActiveModalState.element) && ' y se inactivarán los elementos conectados a este'}.
          </p>
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

      {/* Modal de éxito (compartido entre modo tradicional y flexible) */}
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

      {/* ── Modales modo flexible ───────────────────────────────────────────── */}

      {/* Modal crear/editar elemento flexible */}
      {isFlexible && selectedModelId && (
        <StructureElementFormModal
          isOpen={flexFormModal.isOpen}
          onClose={() => setFlexFormModal({ isOpen: false, element: null })}
          modelId={selectedModelId}
          tiposJerarquia={selectedModel?.tipos_jerarquia}
          element={flexFormModal.element}
          allElements={elements}
          isLoadingElements={elemLoading}
          onConfirm={handleFlexFormConfirm}
        />
      )}

      {/* Modal eliminar elemento flexible */}
      <DeleteConfirmationModal
        isOpen={flexDeleteModal.isOpen}
        onClose={() => setFlexDeleteModal({ isOpen: false, element: null, loading: false })}
        onConfirm={confirmFlexDelete}
        title="Confirmar Eliminación"
        itemName={truncateText(flexDeleteModal.element?.tipo || '')}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={flexDeleteModal.loading}
      />

      {/* Modal activar elemento flexible */}
      {flexToggleModal.element && !flexToggleModal.element.activo && (
        <Modal
          isOpen={flexToggleModal.isOpen}
          onClose={() => setFlexToggleModal({ isOpen: false, element: null })}
          onConfirm={confirmFlexToggle}
          variant="success"
          title="Confirmar activación"
          confirmLabel="Sí, activar"
          cancelLabel="Cancelar"
          showCancel
          showConfirm
        >
          <p className="text-sm text-gris-una-2 leading-relaxed">
            ¿Está seguro de que desea activar{' '}
            <strong>"{truncateText(flexToggleModal.element.tipo)}"</strong>?
          </p>
        </Modal>
      )}

      {/* Modal inactivar elemento flexible */}
      {flexToggleModal.element && flexToggleModal.element.activo && (
        <Modal
          isOpen={flexToggleModal.isOpen}
          onClose={() => setFlexToggleModal({ isOpen: false, element: null })}
          onConfirm={confirmFlexToggle}
          variant="info"
          title="Confirmar inactivación"
          confirmLabel="Sí, inactivar"
          cancelLabel="Cancelar"
          showCancel
          showConfirm
          footerMeta="Esta acción puede ser revertida en el futuro"
        >
          <p className="text-sm text-gris-una-2 leading-relaxed">
            ¿Está seguro de que desea inactivar{' '}
            <strong>"{truncateText(flexToggleModal.element.tipo)}"</strong>?
          </p>
        </Modal>
      )}
    </>
  );
};

export default StructureList;