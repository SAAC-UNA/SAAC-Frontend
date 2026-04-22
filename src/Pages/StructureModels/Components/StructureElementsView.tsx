/**
 * StructureElementsView - Vista de elementos de un modelo flexible.
 *
 * Usa FlexibleElementTable como implementación canónica de listado para evitar
 * divergencias visuales y de comportamiento entre pantallas.
 */

import React, { useState } from 'react';
import { Button } from '@/Components/Ui/Buttons/Button';
import { PageHeader } from '@/Components/Ui/Index';
import { DeleteConfirmationModal } from '@/Components/Ui/Modals/DeleteConfirmationModal';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { StructureElementFormModal } from './StructureElementFormModal';
import { FlexibleElementTable } from './FlexibleElementTable';
import { useStructureElements } from '@/Hooks/UseStructureElements';
import { useToast } from '@/Context/ToastContext';
import type {
  FlexibleElement,
  CreateFlexibleElementForm,
  EditFlexibleElementForm,
  StructureModel,
} from '@/Types/StructureModelTypes';
import { truncateText } from '@/Utils';

interface Props {
  model: StructureModel;
}

export const StructureElementsView: React.FC<Props> = ({ model }) => {
  const { showToast } = useToast();
  const {
    elements,
    isLoading,
    createElement,
    updateElement,
    deleteElement,
    toggleActive,
  } = useStructureElements(model.modelo_estructura_id);

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    element: FlexibleElement | null;
    defaultParentId: number | null;
  }>({ isOpen: false, element: null, defaultParentId: null });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    element: FlexibleElement | null;
    loading: boolean;
  }>({ isOpen: false, element: null, loading: false });

  const [toggleModal, setToggleModal] = useState<{
    isOpen: boolean;
    element: FlexibleElement | null;
    loading: boolean;
  }>({ isOpen: false, element: null, loading: false });

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: '',
  });

  const handleFormConfirm = async (
    form: CreateFlexibleElementForm | EditFlexibleElementForm,
    id?: number,
  ) => {
    if (id !== undefined) {
      return updateElement(id, form as EditFlexibleElementForm);
    }
    return createElement(form as CreateFlexibleElementForm);
  };

  const handleDelete = async () => {
    if (!deleteModal.element) return;

    const element = deleteModal.element;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    const result = await deleteElement(element.elemento_id);
    setDeleteModal({ isOpen: false, element: null, loading: false });

    if (result.success) {
      setSuccessModal({
        isOpen: true,
        title: 'Elemento eliminado',
        message: `El elemento "${truncateText(element.tipo)}" fue eliminado exitosamente.`,
      });
      return;
    }

    showToast({ type: 'error', title: result.error ?? 'Error al eliminar el elemento' });
  };

  const handleToggleRequest = (element: FlexibleElement) => {
    setToggleModal({ isOpen: true, element, loading: false });
  };

  const handleToggleConfirm = async () => {
    if (!toggleModal.element) return;

    const element = toggleModal.element;
    setToggleModal((prev) => ({ ...prev, loading: true }));
    const nextState = !element.activo;
    const result = await toggleActive(element.elemento_id, nextState);
    setToggleModal({ isOpen: false, element: null, loading: false });

    if (result.success) {
      const action = nextState ? 'activado' : 'inactivado';
      setSuccessModal({
        isOpen: true,
        title: nextState ? 'Elemento activado' : 'Elemento inactivado',
        message: `El elemento "${truncateText(element.tipo)}" fue ${action} exitosamente.`,
      });
      return;
    }

    showToast({ type: 'error', title: result.error ?? 'Error al cambiar el estado' });
  };

  return (
    <div>
      <PageHeader
        title="Gestión de Estructura"
        description={
          model.version ? `${model.nombre} · v${model.version}` : model.nombre
        }
        headerExtra={
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setFormModal({ isOpen: true, element: null, defaultParentId: null })
            }
          >
            Crear
          </Button>
        }
      />

      <FlexibleElementTable
        elements={elements}
        isLoading={isLoading}
        onEdit={(element) =>
          setFormModal({ isOpen: true, element, defaultParentId: null })
        }
        onDelete={(element) =>
          setDeleteModal({ isOpen: true, element, loading: false })
        }
        onToggleActive={handleToggleRequest}
      />

      <StructureElementFormModal
        isOpen={formModal.isOpen}
        onClose={() =>
          setFormModal({ isOpen: false, element: null, defaultParentId: null })
        }
        modelId={model.modelo_estructura_id}
        tiposJerarquia={model.tipos_jerarquia}
        element={formModal.element}
        defaultParentId={formModal.defaultParentId}
        allElements={elements}
        onConfirm={handleFormConfirm}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, element: null, loading: false })}
        onConfirm={handleDelete}
        itemName={deleteModal.element?.tipo}
        title="Eliminar elemento"
        description={
          deleteModal.element
            ? 'Solo se puede eliminar si no tiene elementos hijos.'
            : undefined
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={deleteModal.loading}
      />

      {toggleModal.element && (
        <Modal
          isOpen={toggleModal.isOpen}
          onClose={() => setToggleModal({ isOpen: false, element: null, loading: false })}
          onConfirm={handleToggleConfirm}
          variant={toggleModal.element.activo ? 'info' : 'success'}
          title={toggleModal.element.activo ? 'Confirmar inactivación' : 'Confirmar activación'}
          confirmLabel={toggleModal.element.activo ? 'Sí, inactivar' : 'Sí, activar'}
          cancelLabel="Cancelar"
          confirmLoading={toggleModal.loading}
          showCancel
          showConfirm
          footerMeta={
            toggleModal.element.activo
              ? 'Esta acción puede ser revertida en el futuro'
              : undefined
          }
        >
          <p className="text-sm text-gris-una-2 leading-relaxed">
            ¿Está seguro de que desea {toggleModal.element.activo ? 'inactivar' : 'activar'}{' '}
            <strong>"{truncateText(toggleModal.element.tipo)}"</strong>?
          </p>
        </Modal>
      )}

      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
      />
    </div>
  );
};
