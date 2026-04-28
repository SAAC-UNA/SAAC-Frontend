/**
 * CampusFormModal - Modal para crear o editar una Sede.
 * Campos: nombre, universidad_id (select)
 */

import React, { useState, useEffect } from 'react';
import { EntityFormModal } from '@/Components/Ui/Modals/EntityFormModal';
import { Input, CustomSelect } from '@/Components/Ui/Index';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';
import { useUniversities } from '@/Hooks/UseUniversities';
import type { Campus, CreateCampusForm } from '@/Types/InstitutionalStructureTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  campus?: Campus | null;
  onConfirm: (form: CreateCampusForm) => Promise<{ success: boolean; error?: string }>;
}

interface FormData { nombre: string; universidad_id: string }
interface FormErrors { nombre?: string; universidad_id?: string }

const EMPTY: FormData = { nombre: '', universidad_id: '' };

export const CampusFormModal: React.FC<Props> = ({ isOpen, onClose, campus, onConfirm }) => {
  const isEditing = !!campus;
  const { universities, isLoading: loadingUniversities } = useUniversities();

  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(campus
        ? { nombre: campus.nombre, universidad_id: String(campus.universidad_id) }
        : EMPTY
      );
      setErrors({});
      setServerError('');
    }
  }, [isOpen, campus]);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.nombre.trim()) {
      next.nombre = 'El nombre es obligatorio.';
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(form.nombre.trim())) {
      next.nombre = 'Solo puede contener letras y espacios.';
    }
    if (!form.universidad_id) {
      next.universidad_id = 'Debe seleccionar una universidad.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    const result = await onConfirm({
      nombre: form.nombre.trim(),
      universidad_id: Number(form.universidad_id),
    });
    setLoading(false);
    if (result.success) {
      onClose();
    } else {
      setServerError(result.error ?? 'No se pudo guardar la sede.');
    }
  };

  const universityOptions = universities
    .filter((u) => u.activo)
    .map((u) => ({ value: String(u.universidad_id), label: u.nombre }));

  return (
    <EntityFormModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={isEditing ? 'Editar sede' : 'Nueva sede'}
      subtitle={isEditing ? campus?.nombre : undefined}
      isEditing={isEditing}
      confirmLoading={loading}
      size="md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className={cn(TYPOGRAPHY.form.label, 'font-medium')}>
            Universidad <span className="text-error">*</span>
          </label>
          <CustomSelect
            label="Universidad"
            options={universityOptions}
            value={form.universidad_id}
            onChange={(val) => {
              setForm((p) => ({ ...p, universidad_id: val as string }));
              if (errors.universidad_id) setErrors((p) => ({ ...p, universidad_id: undefined }));
              setServerError('');
            }}
            placeholder={loadingUniversities ? 'Cargando...' : 'Seleccione una universidad'}
            disabled={loadingUniversities}
          />
          {errors.universidad_id && (
            <span className={cn(TYPOGRAPHY.form.helper, 'text-error')}>{errors.universidad_id}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className={cn(TYPOGRAPHY.form.label, 'font-medium')}>
            Nombre <span className="text-error">*</span>
          </label>
          <Input
            value={form.nombre}
            onChange={(e) => {
              setForm((p) => ({ ...p, nombre: e.target.value }));
              if (errors.nombre) setErrors((p) => ({ ...p, nombre: undefined }));
              setServerError('');
            }}
            placeholder="Ej: Sede Occidente"
            maxLength={250}
          />
          {errors.nombre && (
            <span className={cn(TYPOGRAPHY.form.helper, 'text-error')}>{errors.nombre}</span>
          )}
        </div>

        {serverError && (
          <p className={cn(TYPOGRAPHY.form.helper, 'text-error')}>{serverError}</p>
        )}
      </div>
    </EntityFormModal>
  );
};
