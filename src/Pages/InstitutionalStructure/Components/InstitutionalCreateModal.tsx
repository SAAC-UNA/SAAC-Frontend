/**
 * InstitutionalCreateModal - Modal unificado para crear Universidad, Sede o Carrera.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { EntityFormModal } from '@/Components/Ui/Modals/EntityFormModal';
import { Input, CustomSelect } from '@/Components/Ui/Index';
import { useAuth } from '@/Context/AuthContext';
import { useCampuses } from '@/Hooks/UseCampuses';
import { useCareers } from '@/Hooks/UseCareers';
import { useUniversities } from '@/Hooks/UseUniversities';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';

type CreateEntityType = 'universidad' | 'sede' | 'carrera';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface FormData {
  entityType: CreateEntityType;
  universidadId: string;
  sedeId: string;
  nombre: string;
}

interface FormErrors {
  entityType?: string;
  universidadId?: string;
  sedeId?: string;
  nombre?: string;
}

const EMPTY_FORM: FormData = {
  entityType: 'universidad',
  universidadId: '',
  sedeId: '',
  nombre: '',
};

export const InstitutionalCreateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { canAccess } = useAuth();
  const {
    universities,
    isLoading: loadingUniversities,
    createUniversity,
  } = useUniversities();
  const {
    campuses,
    isLoading: loadingCampuses,
    createCampus,
  } = useCampuses();
  const {
    createCareer,
  } = useCareers();

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const canCreateUniversidad = canAccess({ requireAnyPermissions: ['universidades.create'] });
  const canCreateSede = canAccess({ requireAnyPermissions: ['campuses.create'] });
  const canCreateCarrera = canAccess({ requireAnyPermissions: ['carreras.create'] });

  const hasUniversidades = universities.length > 0;
  const hasSedes = campuses.length > 0;

  const activeUniversities = useMemo(
    () => universities.filter((u) => u.activo),
    [universities],
  );

  const universityOptions = useMemo(
    () => activeUniversities.map((u) => ({ value: String(u.universidad_id), label: u.nombre })),
    [activeUniversities],
  );

  const campusOptions = useMemo(() => {
    const source = form.universidadId
      ? campuses.filter((c) => String(c.universidad_id) === form.universidadId)
      : campuses;

    return source
      .filter((c) => c.activo)
      .map((c) => ({ value: String(c.sede_id), label: c.nombre }));
  }, [campuses, form.universidadId]);

  const entityTypeOptions = useMemo(() => ([
    {
      value: 'universidad',
      label: 'Universidad',
      disabled: !canCreateUniversidad,
    },
    {
      value: 'sede',
      label: 'Sede',
      disabled: !canCreateSede || !hasUniversidades,
    },
    {
      value: 'carrera',
      label: 'Carrera',
      disabled: !canCreateCarrera || !hasSedes,
    },
  ]), [canCreateCarrera, canCreateSede, canCreateUniversidad, hasSedes, hasUniversidades]);

  useEffect(() => {
    if (!isOpen) return;

    const defaultType = (
      canCreateUniversidad
        ? 'universidad'
        : canCreateSede && hasUniversidades
          ? 'sede'
          : 'carrera'
    ) as CreateEntityType;

    setForm({ ...EMPTY_FORM, entityType: defaultType });
    setErrors({});
    setServerError('');
  }, [canCreateSede, canCreateUniversidad, hasUniversidades, isOpen]);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!form.nombre.trim()) {
      nextErrors.nombre = 'El nombre es obligatorio.';
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(form.nombre.trim())) {
      nextErrors.nombre = 'Solo puede contener letras y espacios.';
    }

    if (form.entityType === 'sede' || form.entityType === 'carrera') {
      if (!form.universidadId) {
        nextErrors.universidadId = 'Debe seleccionar una universidad.';
      }
    }

    if (form.entityType === 'carrera' && !form.sedeId) {
      nextErrors.sedeId = 'Debe seleccionar una sede.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');

    let result: { success: boolean; error?: string };

    if (form.entityType === 'universidad') {
      result = await createUniversity({ nombre: form.nombre.trim() });
    } else if (form.entityType === 'sede') {
      result = await createCampus({
        nombre: form.nombre.trim(),
        universidad_id: Number(form.universidadId),
      });
    } else {
      result = await createCareer({ nombre: form.nombre.trim() });
    }

    setIsSubmitting(false);

    if (result.success) {
      onCreated();
      onClose();
      return;
    }

    setServerError(result.error ?? 'No se pudo crear el registro.');
  };

  const noCreateOptions = entityTypeOptions.every((opt) => opt.disabled);

  return (
    <EntityFormModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Crear registro"
      subtitle="Universidad, sede o carrera"
      confirmLabel="Crear"
      confirmLoading={isSubmitting}
      confirmDisabled={noCreateOptions}
      size="md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className={cn(TYPOGRAPHY.form.label, 'font-medium')}>
            Tipo de registro <span className="text-error">*</span>
          </label>
          <CustomSelect
            label="Tipo de registro"
            options={entityTypeOptions}
            value={form.entityType}
            placeholder="Seleccione el tipo"
            onChange={(value) => {
              setForm((prev) => ({
                ...prev,
                entityType: value as CreateEntityType,
                universidadId: '',
                sedeId: '',
              }));
              setErrors({});
              setServerError('');
            }}
          />
          {!hasUniversidades && canCreateSede && (
            <span className={cn(TYPOGRAPHY.form.helper, 'text-warning')}>
              Primero debe existir al menos una universidad para crear una sede.
            </span>
          )}
          {!hasSedes && canCreateCarrera && (
            <span className={cn(TYPOGRAPHY.form.helper, 'text-warning')}>
              Primero debe existir al menos una sede para crear una carrera.
            </span>
          )}
        </div>

        {(form.entityType === 'sede' || form.entityType === 'carrera') && (
          <div className="flex flex-col gap-1">
            <label className={cn(TYPOGRAPHY.form.label, 'font-medium')}>
              Universidad padre <span className="text-error">*</span>
            </label>
            <CustomSelect
              label="Universidad padre"
              options={universityOptions}
              value={form.universidadId}
              placeholder={loadingUniversities ? 'Cargando universidades...' : 'Seleccione una universidad'}
              disabled={loadingUniversities || universityOptions.length === 0}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, universidadId: value, sedeId: '' }));
                setErrors((prev) => ({ ...prev, universidadId: undefined, sedeId: undefined }));
                setServerError('');
              }}
            />
            {errors.universidadId && (
              <span className={cn(TYPOGRAPHY.form.helper, 'text-error')}>{errors.universidadId}</span>
            )}
          </div>
        )}

        {form.entityType === 'carrera' && (
          <div className="flex flex-col gap-1">
            <label className={cn(TYPOGRAPHY.form.label, 'font-medium')}>
              Sede padre <span className="text-error">*</span>
            </label>
            <CustomSelect
              label="Sede padre"
              options={campusOptions}
              value={form.sedeId}
              placeholder={loadingCampuses ? 'Cargando sedes...' : 'Seleccione una sede'}
              disabled={loadingCampuses || campusOptions.length === 0 || !form.universidadId}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, sedeId: value }));
                setErrors((prev) => ({ ...prev, sedeId: undefined }));
                setServerError('');
              }}
            />
            {errors.sedeId && (
              <span className={cn(TYPOGRAPHY.form.helper, 'text-error')}>{errors.sedeId}</span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className={cn(TYPOGRAPHY.form.label, 'font-medium')}>
            Nombre <span className="text-error">*</span>
          </label>
          <Input
            value={form.nombre}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, nombre: e.target.value }));
              setErrors((prev) => ({ ...prev, nombre: undefined }));
              setServerError('');
            }}
            placeholder="Ingrese el nombre"
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
