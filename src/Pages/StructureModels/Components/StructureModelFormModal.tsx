/**
 * StructureModelFormModal - Modal para crear o editar un modelo de acreditación flexible.
 *
 * Flujo: EntityFormModal → CreateConfirmationModal / EditConfirmationModal → SuccessModal
 */

import React, { useState, useEffect } from 'react';
import { EntityFormModal } from '@/Components/Ui/Modals/EntityFormModal';
import { CreateConfirmationModal } from '@/Components/Ui/Modals/CreateConfirmationModal';
import { EditConfirmationModal } from '@/Components/Ui/Modals/EditConfirmationModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { Input } from '@/Components/Ui/Forms/Input';
import { Textarea } from '@/Components/Ui/Forms/Textarea';
import { useToast } from '@/Context/ToastContext';
import type { StructureModel, CreateModelForm, EditModelForm } from '@/Types/StructureModelTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  model?: StructureModel | null;
  onConfirm: (form: CreateModelForm | EditModelForm) => Promise<{ success: boolean; error?: string }>;
}

interface FormData {
  nombre: string;
  descripcion: string;
  version: string;
}

interface FormErrors {
  nombre?: string;
  descripcion?: string;
  version?: string;
}

const EMPTY: FormData = { nombre: '', descripcion: '', version: '' };

export const StructureModelFormModal: React.FC<Props> = ({ isOpen, onClose, model, onConfirm }) => {
  const isEditing = !!model;
  const { showToast } = useToast();

  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [success, setSuccess] = useState({ isOpen: false, name: '' });

  useEffect(() => {
    if (isOpen) {
      setForm(
        model
          ? { nombre: model.nombre, descripcion: model.descripcion ?? '', version: model.version ?? '' }
          : EMPTY
      );
      setErrors({});
      setConfirmOpen(false);
    }
  }, [isOpen, model]);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.nombre.trim()) {
      next.nombre = 'El nombre es obligatorio.';
    } else if (form.nombre.trim().length > 100) {
      next.nombre = 'Máximo 100 caracteres.';
    }
    if (form.descripcion.length > 500) {
      next.descripcion = 'Máximo 500 caracteres.';
    }
    if (form.version.length > 20) {
      next.version = 'Máximo 20 caracteres.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmitRequest = () => {
    if (validate()) setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setOpLoading(true);
    const payload: CreateModelForm | EditModelForm = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      version: form.version.trim() || undefined,
    };
    const result = await onConfirm(payload);
    setOpLoading(false);
    setConfirmOpen(false);
    if (result.success) {
      setSuccess({ isOpen: true, name: form.nombre.trim() });
    } else {
      showToast({ type: 'error', title: result.error ?? 'Error al guardar el modelo' });
    }
  };

  const handleSuccessClose = () => {
    setSuccess({ isOpen: false, name: '' });
    onClose();
  };

  return (
    <>
      <EntityFormModal
        isOpen={isOpen && !confirmOpen && !success.isOpen}
        onClose={onClose}
        onConfirm={handleSubmitRequest}
        title={isEditing ? 'Editar Modelo' : 'Crear Modelo de Acreditación'}
        subtitle={isEditing ? model?.nombre : undefined}
        confirmLabel={isEditing ? 'Guardar' : 'Crear modelo'}
        isEditing={isEditing}
        size="md"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nombre del modelo"
            required
            value={form.nombre}
            onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            error={errors.nombre}
            maxLength={100}
            characterCount
          />
          <Input
            label="Versión"
            value={form.version}
            onChange={e => setForm(p => ({ ...p, version: e.target.value }))}
            error={errors.version}
            maxLength={20}
            placeholder="Ej: 2026, 1.0"
          />
          <Textarea
            label="Descripción"
            value={form.descripcion}
            onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
            error={errors.descripcion}
            maxLength={500}
            characterCount
            rows={3}
          />
        </div>
      </EntityFormModal>

      {isEditing ? (
        <EditConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
          itemName={form.nombre}
          itemType="modelo"
          isLoading={opLoading}
        />
      ) : (
        <CreateConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
          itemName={form.nombre}
          itemType="modelo"
          isLoading={opLoading}
        />
      )}

      <SuccessModal
        isOpen={success.isOpen}
        title={isEditing ? 'Modelo actualizado' : 'Modelo creado'}
        message={
          isEditing
            ? `El modelo "${success.name}" fue actualizado exitosamente.`
            : `El modelo "${success.name}" fue creado exitosamente.`
        }
        onClose={handleSuccessClose}
      />
    </>
  );
};
