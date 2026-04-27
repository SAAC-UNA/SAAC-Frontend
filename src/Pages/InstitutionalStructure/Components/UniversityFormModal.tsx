/**
 * UniversityFormModal - Modal para crear o editar una Universidad.
 * Campos: nombre (único, solo letras/espacios)
 */

import React, { useState, useEffect } from 'react';
import { EntityFormModal } from '@/Components/Ui/Modals/EntityFormModal';
import { Input } from '@/Components/Ui/Index';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';
import type { University, CreateUniversityForm } from '@/Types/InstitutionalStructureTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  university?: University | null;
  onConfirm: (form: CreateUniversityForm) => Promise<{ success: boolean; error?: string }>;
}

interface FormData { nombre: string }
interface FormErrors { nombre?: string }

const EMPTY: FormData = { nombre: '' };

export const UniversityFormModal: React.FC<Props> = ({ isOpen, onClose, university, onConfirm }) => {
  const isEditing = !!university;
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(university ? { nombre: university.nombre } : EMPTY);
      setErrors({});
      setServerError('');
    }
  }, [isOpen, university]);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.nombre.trim()) {
      next.nombre = 'El nombre es obligatorio.';
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(form.nombre.trim())) {
      next.nombre = 'Solo puede contener letras y espacios.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    const result = await onConfirm({ nombre: form.nombre.trim() });
    setLoading(false);
    if (result.success) {
      onClose();
    } else {
      setServerError(result.error ?? 'No se pudo guardar la universidad.');
    }
  };

  return (
    <EntityFormModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={isEditing ? 'Editar universidad' : 'Nueva universidad'}
      subtitle={isEditing ? university?.nombre : undefined}
      isEditing={isEditing}
      confirmLoading={loading}
      size="md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className={cn(TYPOGRAPHY.label, 'font-medium')}>
            Nombre <span className="text-error">*</span>
          </label>
          <Input
            value={form.nombre}
            onChange={(e) => {
              setForm((p) => ({ ...p, nombre: e.target.value }));
              if (errors.nombre) setErrors((p) => ({ ...p, nombre: undefined }));
              setServerError('');
            }}
            placeholder="Ej: Universidad Nacional"
            maxLength={250}
          />
          {errors.nombre && (
            <span className={cn(TYPOGRAPHY.helper, 'text-error')}>{errors.nombre}</span>
          )}
        </div>

        {serverError && (
          <p className={cn(TYPOGRAPHY.helper, 'text-error')}>{serverError}</p>
        )}
      </div>
    </EntityFormModal>
  );
};
