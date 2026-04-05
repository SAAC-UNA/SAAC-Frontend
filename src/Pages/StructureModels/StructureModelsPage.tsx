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
import { MODELO_TIPO_BADGE } from '@/Constants/StatusBadges';
import { Modal } from '@/Components/Ui/Modals/Modal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { StructureModelFormModal } from './Components/StructureModelFormModal';
import { StructureModelDeleteModal } from './Components/StructureModelDeleteModal';
import { useStructureModels } from '@/Hooks/UseStructureModels';
import { useToast } from '@/Context/ToastContext';
import type { StructureModel, CreateModelForm, EditModelForm } from '@/Types/StructureModelTypes';
import { cn } from '@/Utils/ClassNames';
import { TYPOGRAPHY } from '@/Constants/Typography';

const StructureModelsPage: React.FC = () => {
  const { showToast } = useToast();
  const { models, isLoading, createModel, updateModel, toggleActive, deleteModel } =
    useStructureModels();

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

  // ── Render ────────────────────────────────────────────────────────────────

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
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  hasCiclos?: boolean;
}

const ModelCard: React.FC<ModelCardProps> = ({
  model,
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
        'grid p-4 rounded-corner bg-blanco-una border border-blanco-una shadow-md gap-x-2',
        'grid-cols-5 grid-rows-4',
        'transition-shadow hover:shadow-lg',
        !model.activo && 'opacity-60'
      )}
      style={{ gridTemplateRows: 'auto auto 1fr auto' }}
    >
      {/* div1 — Nombre */}
      <div className="col-start-1 col-end-4 row-start-1 row-end-2 min-w-0">
        <h3
          className={cn(TYPOGRAPHY.pageSubtitle, 'font-bold text-negro-una truncate')}
          title={model.nombre}
        >
          {model.nombre}
        </h3>
      </div>

      {/* div2 — Versión */}
      <div className="col-start-1 col-end-4 row-start-2 row-end-3 min-w-0">
        {model.version ? (
          <span className={cn(TYPOGRAPHY.form.helper, 'text-gris-una')}>v{model.version}</span>
        ) : (
          <span className={cn(TYPOGRAPHY.form.helper, 'text-gris-una/40 italic')}>Sin versión</span>
        )}
      </div>

      {/* div3 — Descripción */}
      <div className="col-start-1 col-end-6 row-start-3 row-end-4 py-1">
        {model.descripcion ? (
          <p className={cn(TYPOGRAPHY.form.helper, 'text-gris-una line-clamp-2')}>
            {model.descripcion}
          </p>
        ) : (
          <p className={cn(TYPOGRAPHY.form.helper, 'text-gris-una/40 italic')}>Sin descripción</p>
        )}
      </div>

      {/* div4 — Acciones */}
      <div className="col-start-1 col-end-6 row-start-4 row-end-5 flex items-center justify-end gap-1 pt-2">
        <TableActionButton
          action="view"
          tooltip="Ver estructura"
          className={CARD_ACTION_BTN}
          onClick={() => navigate(
            isTradicional
              ? '/estructura/listar'
              : `/estructura/listar?modelo=${model.modelo_estructura_id}`
          )}
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

      {/* div5 — Badges */}
      <div className="col-start-4 col-end-6 row-start-1 row-end-3 flex flex-col items-end gap-1">
        <StatusBadge
          label={MODELO_TIPO_BADGE[model.tipo]?.label ?? model.tipo}
          colorClasses={MODELO_TIPO_BADGE[model.tipo]?.colorClasses ?? 'bg-gris-light text-gris-una'}
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
  );
};

export default StructureModelsPage;
