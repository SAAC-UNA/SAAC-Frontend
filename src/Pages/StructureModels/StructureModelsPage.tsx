/**
 * StructureModelsPage - Página de gestión de modelos de acreditación.
 *
 * Vista "modelos": tarjetas de cada modelo (tradicional + flexibles).
 * Vista "elementos": árbol de elementos del modelo flexible seleccionado.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { PageHeader, Button, LoadingSpinner, StatusBadge, TableActionButton, Tooltip, TooltipContent, TooltipTrigger } from '@/Components/Ui/Index';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { StructureModelFormModal } from './Components/StructureModelFormModal';
import { StructureModelDeleteModal } from './Components/StructureModelDeleteModal';
import { StructureElementsView } from './Components/StructureElementsView';
import { useStructureModels } from '@/Hooks/UseStructureModels';
import { useToast } from '@/Context/ToastContext';
import type { StructureModel, CreateModelForm, EditModelForm } from '@/Types/StructureModelTypes';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';

type View = 'models' | 'elements';

const StructureModelsPage: React.FC = () => {
  const { showToast } = useToast();
  const { models, isLoading, createModel, updateModel, toggleActive, deleteModel } =
    useStructureModels();

  const [view, setView] = useState<View>('models');
  const [selectedModel, setSelectedModel] = useState<StructureModel | null>(null);

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    model: StructureModel | null;
  }>({ isOpen: false, model: null });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    model: StructureModel | null;
    loading: boolean;
    hasCiclos: boolean;
  }>({ isOpen: false, model: null, loading: false, hasCiclos: false });

  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  const [toggleModal, setToggleModal] = useState<{
    isOpen: boolean;
    model: StructureModel | null;
    loading: boolean;
  }>({ isOpen: false, model: null, loading: false });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateConfirm = async (form: CreateModelForm | EditModelForm) => {
    return createModel(form as CreateModelForm);
  };

  const handleEditConfirm = async (form: CreateModelForm | EditModelForm) => {
    if (!formModal.model) return { success: false, error: 'Sin modelo seleccionado' };
    return updateModel(formModal.model.modelo_estructura_id, form as EditModelForm);
  };

  const handleToggleActive = (model: StructureModel) => {
    setToggleModal({ isOpen: true, model, loading: false });
  };

  const confirmToggleActive = async () => {
    if (!toggleModal.model) return;
    setToggleModal(p => ({ ...p, loading: true }));
    const m = toggleModal.model;
    const result = await toggleActive(m.modelo_estructura_id, !m.activo);
    setToggleModal({ isOpen: false, model: null, loading: false });
    if (result.success) {
      const action = m.activo ? 'inactivado' : 'activado';
      setSuccessModal({
        isOpen: true,
        title: m.activo ? 'Modelo inactivado' : 'Modelo activado',
        message: `El modelo "${m.nombre}" ha sido ${action} correctamente.`,
      });
    } else {
      showToast({ type: 'error', title: result.error ?? 'Error al cambiar el estado' });
    }
  };

  const handleDeleteConfirm = async (confirmacion: string) => {
    if (!deleteModal.model) return;
    setDeleteModal(p => ({ ...p, loading: true }));
    const result = await deleteModel(deleteModal.model!.modelo_estructura_id, confirmacion);
    setDeleteModal({ isOpen: false, model: null, loading: false, hasCiclos: false });
    if (result.success) {
      setSuccessModal({ isOpen: true, title: 'Modelo eliminado', message: 'El modelo fue eliminado exitosamente.' });
    } else {
      showToast({ type: 'error', title: result.error ?? 'Error al eliminar el modelo' });
    }
  };

  // ── Render – Elementos View ───────────────────────────────────────────────

  if (view === 'elements' && selectedModel) {
    return (
      <ScreenContainer>
        <StructureElementsView
          model={selectedModel}
          onBack={() => {
            setView('models');
            setSelectedModel(null);
          }}
        />
      </ScreenContainer>
    );
  }

  // ── Render – Models View ──────────────────────────────────────────────────

  return (
    <ScreenContainer>
      <PageHeader
        title="Modelos de Acreditación"
        description="Gestiona los modelos de estructura que definen cómo se organiza el proceso de acreditación."
        headerExtra={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFormModal({ isOpen: true, model: null })}
              >
                Crear
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Crear nuevo modelo</TooltipContent>
          </Tooltip>
        }
      />

      {isLoading ? (
        <LoadingSpinner variant="loader" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {models.map(model => (
            <ModelCard
              key={model.modelo_estructura_id}
              model={model}
              onViewElements={() => {
                setSelectedModel(model);
                setView('elements');
              }}
              onEdit={() => setFormModal({ isOpen: true, model })}
              onToggleActive={() => handleToggleActive(model)}
              onDelete={() => setDeleteModal({ isOpen: true, model, loading: false, hasCiclos: false })}
            />
          ))}

          {models.length === 0 && (
            <p className={cn(TYPOGRAPHY.body, 'text-gris-una col-span-full text-center py-12')}>
              No hay modelos configurados.
            </p>
          )}
        </div>
      )}

      {/* Modal crear */}
      <StructureModelFormModal
        isOpen={formModal.isOpen && !formModal.model}
        onClose={() => setFormModal({ isOpen: false, model: null })}
        onConfirm={handleCreateConfirm}
      />

      {/* Modal editar */}
      <StructureModelFormModal
        isOpen={formModal.isOpen && !!formModal.model}
        onClose={() => setFormModal({ isOpen: false, model: null })}
        model={formModal.model}
        onConfirm={handleEditConfirm}
      />

      {/* Modal eliminar */}
      <StructureModelDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, model: null, loading: false, hasCiclos: false })}
        model={deleteModal.model}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.loading}
        hasCiclos={deleteModal.hasCiclos}
      />

      {/* Modal confirmar activar/desactivar */}
      {toggleModal.model && (
        <Modal
          isOpen={toggleModal.isOpen}
          onClose={() => setToggleModal({ isOpen: false, model: null, loading: false })}
          onConfirm={confirmToggleActive}
          variant={toggleModal.model.activo ? 'info' : 'success'}
          title={toggleModal.model.activo ? 'Confirmar inactivación' : 'Confirmar activación'}
          confirmLabel={toggleModal.model.activo ? 'Sí, inactivar' : 'Sí, activar'}
          cancelLabel="Cancelar"
          confirmLoading={toggleModal.loading}
          showCancel
          showConfirm
          footerMeta={toggleModal.model.activo ? 'Esta acción puede ser revertida' : undefined}
        >
          <p className={cn(TYPOGRAPHY.modal.body, 'text-gris-una-2 leading-relaxed')}>
            ¿Está seguro de que desea {toggleModal.model.activo ? 'inactivar' : 'activar'} el modelo{' '}
            <strong className="text-negro-una">"{toggleModal.model.nombre}"</strong>?
          </p>
        </Modal>
      )}

      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
      />
    </ScreenContainer>
  );
};

// ── ModelCard ─────────────────────────────────────────────────────────────────

/** Tamaño ligeramente mayor al estándar de tabla (32px → 36px) */
const CARD_ACTION_BTN = '!size-9 !p-1.5';

interface ModelCardProps {
  model: StructureModel;
  onViewElements: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  hasCiclos?: boolean;
}

const ModelCard: React.FC<ModelCardProps> = ({
  model,
  onViewElements,
  onEdit,
  onToggleActive,
  onDelete,
  hasCiclos = false,
}) => {
  const navigate = useNavigate();
  const isTradicional = model.tipo === 'tradicional';

  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-4 rounded-corner bg-blanco-una border border-blanco-una shadow-md',
        'transition-shadow hover:shadow-lg',
        !model.activo && 'opacity-60'
      )}
    >
      {/* Header: nombre + badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className={cn(TYPOGRAPHY.pageSubtitle, 'font-bold text-negro-una truncate')}
            title={model.nombre}
          >
            {model.nombre}
          </h3>
          {model.version && (
            <span className={cn(TYPOGRAPHY.form.helper, 'text-gris-una')}>v{model.version}</span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <StatusBadge
            label={isTradicional ? 'Tradicional' : 'Flexible'}
            colorClasses={
              isTradicional
                ? 'bg-azul-una/10 text-azul-una'
                : 'bg-purple-100 text-purple-700'
            }
            size="sm"
          />
          <StatusBadge
            label={model.activo ? 'Activo' : 'Inactivo'}
            colorClasses={
              model.activo ? 'text-verde-dark bg-verde-ring' : 'text-error-dark bg-error-ring'
            }
            size="sm"
          />
        </div>
      </div>

      {/* Descripción */}
      {model.descripcion && (
        <p className={cn(TYPOGRAPHY.form.helper, 'text-gris-una line-clamp-2')}>
          {model.descripcion}
        </p>
      )}

      {/* Acciones */}
      <div className="flex items-center justify-end gap-1 pt-1">
        <TableActionButton
          action="view"
          tooltip={isTradicional ? 'Ver estructura' : 'Ver elementos'}
          className={CARD_ACTION_BTN}
          onClick={isTradicional ? () => navigate('/estructura/listar') : onViewElements}
        />
        <TableActionButton
          action="edit"
          tooltip={isTradicional ? 'Este modelo no se puede editar' : 'Editar modelo'}
          className={CARD_ACTION_BTN}
          onClick={onEdit}
          disabled={isTradicional}
        />
        <TableActionButton
          action="power"
          isActive={model.activo}
          tooltip={
            isTradicional
              ? 'Este modelo no se puede desactivar'
              : model.activo
              ? 'Desactivar modelo'
              : 'Activar modelo'
          }
          className={CARD_ACTION_BTN}
          onClick={onToggleActive}
          disabled={isTradicional}
        />
        <TableActionButton
          action="delete"
          tooltip={
            isTradicional
              ? 'Este modelo no se puede eliminar'
              : hasCiclos
              ? 'Eliminar bloqueado, tiene ciclos asociados'
              : 'Eliminar modelo'
          }
          className={CARD_ACTION_BTN}
          onClick={onDelete}
          disabled={isTradicional || hasCiclos}
        />
      </div>
    </div>
  );
};

export default StructureModelsPage;
