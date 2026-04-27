/**
 * StructureElementsView - Vista de elementos de un modelo flexible.
 *
 * El título y la descripción del encabezado son inyectados por el contenedor
 * (StructureModelsPage) para mantener una sola fuente de verdad del layout.
 */

import React, { useState } from 'react';
import { Button } from '@/Components/Ui/Buttons/Button';
import { PageHeader } from '@/Components/Ui/Index';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { ROUTES } from '@/Constants/ROUTES';
import { StructureElementFormModal } from './StructureElementFormModal';
import { FlexibleElementTable } from './StructureElementTable';
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
  title?: string;
  description?: string;
  elements: FlexibleElement[];
  isLoadingElements: boolean;
  onCreateElement: (
    form: CreateFlexibleElementForm,
  ) => Promise<{ success: boolean; error?: string }>;
  onUpdateElement: (
    id: number,
    form: EditFlexibleElementForm,
  ) => Promise<{ success: boolean; error?: string }>;
  onToggleElement: (
    id: number,
    active: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  onDeleteRequest: (element: FlexibleElement) => void;
}

export const StructureElementsView: React.FC<Props> = ({
  model,
  title,
  description,
  elements,
  isLoadingElements,
  onCreateElement,
  onUpdateElement,
  onToggleElement,
  onDeleteRequest,
}) => {
  const { showToast } = useToast();

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    element: FlexibleElement | null;
    defaultParentId: number | null;
  }>({ isOpen: false, element: null, defaultParentId: null });

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
      return onUpdateElement(id, form as EditFlexibleElementForm);
    }
    return onCreateElement(form as CreateFlexibleElementForm);
  };

  const handleToggleRequest = (element: FlexibleElement) => {
    setToggleModal({ isOpen: true, element, loading: false });
  };

  const handleToggleConfirm = async () => {
    if (!toggleModal.element) return;

    const element = toggleModal.element;
    setToggleModal((prev) => ({ ...prev, loading: true }));
    const nextState = !element.activo;
    const result = await onToggleElement(element.elemento_id, nextState);
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
        title={title ?? "Gestión de Estructura"}
        description={
          description
          ?? (model.version ? `${model.nombre} · v${model.version}` : model.nombre)
        }
        breadcrumbMode="simple"
        breadcrumbParent={{
          label: "Modelos de Acreditación",
          href: ROUTES.STRUCTURE_MODELS,
        }}
        headerExtra={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setFormModal({ isOpen: true, element: null, defaultParentId: null })
              }
            >
              Crear
            </Button>
          </div>
        }
      />

      <FlexibleElementTable
        elements={elements}
        isLoading={isLoadingElements}
        onEdit={(element) =>
          setFormModal({ isOpen: true, element, defaultParentId: null })
        }
        onDelete={onDeleteRequest}
        onToggleActive={handleToggleRequest}
      />

      <StructureElementFormModal
        isOpen={formModal.isOpen}
        onClose={() =>
          setFormModal({ isOpen: false, element: null, defaultParentId: null })
        }
        modelId={model.modelo_estructura_id}
        tiposJerarquia={model.tipos_jerarquia}
        tiposAsignables={model.tipos_asignables}
        element={formModal.element}
        defaultParentId={formModal.defaultParentId}
        allElements={elements}
        isLoadingElements={isLoadingElements}
        onConfirm={handleFormConfirm}
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
