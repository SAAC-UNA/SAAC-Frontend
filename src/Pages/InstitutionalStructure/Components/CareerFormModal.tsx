/**
 * CareerFormModal - Modal para crear o editar una Carrera.
 * Campos: nombre + universidad (la carrera depende directamente de la universidad)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { EntityFormModal } from '@/Components/Ui/Modals/EntityFormModal';
import { Input, CustomSelect } from '@/Components/Ui/Index';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';
import { useUniversities } from '@/Hooks/UseUniversities';
import type { Career, CreateCareerForm } from '@/Types/InstitutionalStructureTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  career?: Career | null;
  onConfirm: (form: CreateCareerForm) => Promise<{ success: boolean; error?: string }>;
}

interface FormData { nombre: string; universidad_id: string }
interface FormErrors { nombre?: string; universidad_id?: string }

const EMPTY: FormData = { nombre: '', universidad_id: '' };

export const CareerFormModal: React.FC<Props> = ({ isOpen, onClose, career, onConfirm }) => {
  const isEditing = !!career;
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { universities, isLoading: loadingUniversities } = useUniversities();

  const universityOptions = useMemo(
    () => universities
      .filter((u) => u.activo)
      .map((u) => ({ value: String(u.universidad_id), label: u.nombre })),
    [universities],
  );

  useEffect(() => {
    if (isOpen) {
      setForm(
        career
          ? { nombre: career.nombre, universidad_id: String(career.universidad_id ?? '') }
          : EMPTY,
      );
      setErrors({});
      setServerError('');
    }
  }, [isOpen, career]);

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
      setServerError(result.error ?? 'No se pudo guardar la carrera.');
    }
  };

  return (
    <EntityFormModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={isEditing ? 'Editar carrera' : 'Nueva carrera'}
      subtitle={isEditing ? career?.nombre : undefined}
      isEditing={isEditing}
      confirmLoading={loading}
      size="md"
    >
      <div className="flex flex-col gap-4">
        <CustomSelect
          label="Universidad"
          required
          options={universityOptions}
          value={form.universidad_id}
          placeholder={loadingUniversities ? 'Cargando universidades...' : 'Seleccione una universidad'}
          disabled={loadingUniversities || universityOptions.length === 0}
          onChange={(value) => {
            setForm((p) => ({ ...p, universidad_id: value }));
            if (errors.universidad_id) setErrors((p) => ({ ...p, universidad_id: undefined }));
          }}
          error={errors.universidad_id}
          searchable
          searchPlaceholder="Buscar universidad..."
        />

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
            placeholder="Ej: Ingeniería en Sistemas"
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
