/**
 * StructureModelsPage - Página de gestión de modelos de acreditación.
 *
 * Vista "modelos": tarjetas de cada modelo (tradicional + flexibles).
 * Vista "elementos": árbol de elementos del modelo flexible seleccionado.
 */

import React, { useState } from 'react';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { PageHeader } from '@/Components/Ui/Index';
import { Button } from '@/Components/Ui/Buttons/Button';
import { StatusBadge } from '@/Components/Ui/Feedback/StatusBadge';
import { LoadingSpinner } from '@/Components/Ui/Feedback/Loading';
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
  }>({ isOpen: false, model: null, loading: false });

  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateConfirm = async (form: CreateModelForm | EditModelForm) => {
    return createModel(form as CreateModelForm);
  };

  const handleEditConfirm = async (form: CreateModelForm | EditModelForm) => {
    if (!formModal.model) return { success: false, error: 'Sin modelo seleccionado' };
    return updateModel(formModal.model.modelo_estructura_id, form as EditModelForm);
  };

  const handleToggleActive = async (model: StructureModel) => {
    const result = await toggleActive(model.modelo_estructura_id, !model.activo);
    if (!result.success) {
      showToast({ type: 'error', title: result.error ?? 'Error al cambiar el estado' });
    }
  };

  const handleDeleteConfirm = async (confirmacion: string) => {
    if (!deleteModal.model) return;
    setDeleteModal(p => ({ ...p, loading: true }));
    const result = await deleteModel(deleteModal.model!.modelo_estructura_id, confirmacion);
    setDeleteModal({ isOpen: false, model: null, loading: false });
    if (result.success) {
      setSuccessModal({ isOpen: true, message: 'El modelo fue eliminado exitosamente.' });
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
      >
        <Button
          variant="primary"
          size="sm"
          onClick={() => setFormModal({ isOpen: true, model: null })}
        >
          + Crear modelo
        </Button>
      </PageHeader>

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
              onDelete={() => setDeleteModal({ isOpen: true, model, loading: false })}
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
        onClose={() => setDeleteModal({ isOpen: false, model: null, loading: false })}
        model={deleteModal.model}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.loading}
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        title="Operación exitosa"
        message={successModal.message}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
      />
    </ScreenContainer>
  );
};

// ── ModelCard ─────────────────────────────────────────────────────────────────

interface ModelCardProps {
  model: StructureModel;
  onViewElements: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({
  model,
  onViewElements,
  onEdit,
  onToggleActive,
  onDelete,
}) => {
  const isTradicional = model.tipo === 'tradicional';

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-5 rounded-corner-lg border bg-white shadow-sm',
        'transition-shadow hover:shadow-md',
        !model.activo && 'opacity-60'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className={cn(TYPOGRAPHY.pageSubtitle, 'font-bold text-negro-una truncate')}
            title={model.nombre}
          >
            {model.nombre}
          </h3>
          {model.version && (
            <span className="text-xs text-gris-una">v{model.version}</span>
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
          />
          <StatusBadge
            label={model.activo ? 'Activo' : 'Inactivo'}
            colorClasses={
              model.activo ? 'bg-verde/10 text-verde' : 'bg-gray-100 text-gris-una-2'
            }
          />
        </div>
      </div>

      {/* Descripción */}
      {model.descripcion && (
        <p className={cn(TYPOGRAPHY.form.helper, 'text-gris-una line-clamp-2')}>
          {model.descripcion}
        </p>
      )}

      {/* Separador */}
      <div className="border-t border-gray-100 mt-auto" />

      {/* Acciones */}
      <div className="flex flex-wrap gap-2">
        {isTradicional ? (
          <a
            href="/estructura/listar"
            className="text-sm font-medium text-azul-una hover:underline"
          >
            Ver estructura →
          </a>
        ) : (
          <>
            <Button variant="primary" size="sm" onClick={onViewElements}>
              Ver elementos
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleActive}
            >
              {model.activo ? 'Desactivar' : 'Activar'}
            </Button>
            <Button variant="error" size="sm" onClick={onDelete}>
              Eliminar
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default StructureModelsPage;
