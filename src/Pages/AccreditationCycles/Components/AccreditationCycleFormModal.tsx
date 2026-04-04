/**
 * AccreditationCycleFormModal - Modal para crear o editar un Ciclo de Acreditación.
 *
 * Flujo: EntityFormModal → CreateConfirmationModal / EditConfirmationModal → SuccessModal
 */

import React, { useState, useEffect } from 'react';
import { EntityFormModal } from '@/Components/Ui/Modals/EntityFormModal';
import { CreateConfirmationModal } from '@/Components/Ui/Modals/CreateConfirmationModal';
import { EditConfirmationModal } from '@/Components/Ui/Modals/EditConfirmationModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { Input } from '@/Components/Ui/Forms/Input';
import { CustomSelect } from '@/Components/Ui/Index';
import { useToast } from '@/Context/ToastContext';
import { useCareerCampuses } from '@/Hooks/UseCareerCampuses';
import { useStructureModels } from '@/Hooks/UseStructureModels';
import type {
  AccreditationCycle,
  AccreditationCycleStatus,
  CreateAccreditationCycleForm,
  EditAccreditationCycleForm,
} from '@/Types/AccreditationCycleTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cycle?: AccreditationCycle | null;
  onConfirm: (
    form: CreateAccreditationCycleForm | EditAccreditationCycleForm,
  ) => Promise<{ success: boolean; error?: string }>;
}

interface FormData {
  nombre: string;
  carrera_sede_id: string;
  modelo_estructura_id: string;
  estado: AccreditationCycleStatus;
}

interface FormErrors {
  nombre?: string;
  carrera_sede_id?: string;
  modelo_estructura_id?: string;
}

const EMPTY: FormData = {
  nombre: '',
  carrera_sede_id: '',
  modelo_estructura_id: '',
  estado: 'activo',
};

const STATUS_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'completado', label: 'Completado' },
];

export const AccreditationCycleFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  cycle,
  onConfirm,
}) => {
  const isEditing = !!cycle;
  const { showToast } = useToast();
  const { careerCampuses, isLoading: loadingCareers } = useCareerCampuses();
  const { models, isLoading: loadingModels } = useStructureModels();

  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [success, setSuccess] = useState({ isOpen: false, name: '' });

  useEffect(() => {
    if (isOpen) {
      setForm(
        cycle
          ? {
              nombre: cycle.nombre,
              carrera_sede_id: String(cycle.carrera_sede_id),
              modelo_estructura_id: String(cycle.modelo_estructura_id),
              estado: cycle.estado,
            }
          : EMPTY,
      );
      setErrors({});
      setConfirmOpen(false);
    }
  }, [isOpen, cycle]);

  const careerOptions = careerCampuses.map(cs => ({
    value: String(cs.carrera_sede_id),
    label: `${cs.carrera_nombre} – ${cs.sede_nombre}`,
  }));

  const modelOptions = models
    .filter(m => m.activo)
    .map(m => ({ value: String(m.modelo_estructura_id), label: m.nombre }));

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.nombre.trim()) {
      next.nombre = 'El nombre es obligatorio.';
    } else if (form.nombre.trim().length > 100) {
      next.nombre = 'Máximo 100 caracteres.';
    }
    if (!form.carrera_sede_id) {
      next.carrera_sede_id = 'Debe seleccionar una carrera-sede.';
    }
    if (!form.modelo_estructura_id) {
      next.modelo_estructura_id = 'Debe seleccionar un modelo de estructura.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmitRequest = () => {
    if (validate()) setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setOpLoading(true);
    const payload: CreateAccreditationCycleForm | EditAccreditationCycleForm = isEditing
      ? {
          nombre: form.nombre.trim(),
          carrera_sede_id: Number(form.carrera_sede_id),
          modelo_estructura_id: Number(form.modelo_estructura_id),
          estado: form.estado,
        }
      : {
          nombre: form.nombre.trim(),
          carrera_sede_id: Number(form.carrera_sede_id),
          modelo_estructura_id: Number(form.modelo_estructura_id),
        };

    const result = await onConfirm(payload);
    setOpLoading(false);
    setConfirmOpen(false);
    if (result.success) {
      setSuccess({ isOpen: true, name: form.nombre.trim() });
    } else {
      showToast({ type: 'error', title: result.error ?? 'Error al guardar el ciclo' });
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
        title={isEditing ? 'Editar Ciclo' : 'Crear Ciclo de Acreditación'}
        subtitle={isEditing ? cycle?.nombre : undefined}
        confirmLabel={isEditing ? 'Guardar' : 'Crear'}
        isEditing={isEditing}
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nombre del ciclo"
            required
            value={form.nombre}
            onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            error={errors.nombre}
            maxLength={100}
            characterCount
          />

          <CustomSelect
            label="Carrera – Sede"
            required
            value={form.carrera_sede_id}
            options={careerOptions}
            onChange={v => setForm(p => ({ ...p, carrera_sede_id: v }))}
            error={errors.carrera_sede_id}
            disabled={loadingCareers}
            searchable
            searchPlaceholder="Buscar carrera-sede..."
            placeholder="Seleccione una carrera-sede"
          />

          <CustomSelect
            label="Modelo de Estructura"
            required
            value={form.modelo_estructura_id}
            options={modelOptions}
            onChange={v => setForm(p => ({ ...p, modelo_estructura_id: v }))}
            error={errors.modelo_estructura_id}
            disabled={loadingModels}
            searchable
            searchPlaceholder="Buscar modelo..."
            placeholder="Seleccione un modelo"
          />

          {isEditing && (
            <CustomSelect
              label="Estado"
              value={form.estado}
              options={STATUS_OPTIONS}
              onChange={v => setForm(p => ({ ...p, estado: v as AccreditationCycleStatus }))}
            />
          )}
        </div>
      </EntityFormModal>

      {isEditing ? (
        <EditConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
          isLoading={opLoading}
          itemName={form.nombre.trim()}
        />
      ) : (
        <CreateConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
          isLoading={opLoading}
          itemName={form.nombre.trim()}
        />
      )}

      <SuccessModal
        isOpen={success.isOpen}
        title={isEditing ? 'Ciclo actualizado' : 'Ciclo creado'}
        message={
          isEditing
            ? `El ciclo "${success.name}" fue actualizado correctamente.`
            : `El ciclo "${success.name}" fue creado correctamente.`
        }
        onClose={handleSuccessClose}
      />
    </>
  );
};
