/**
 * InstitutionalCreateModal - Modal unificado para crear o editar Universidad, Sede o Carrera.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { EntityFormModal } from '@/Components/Ui/Modals/EntityFormModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { Input, CustomSelect } from '@/Components/Ui/Index';
import { useAuth } from '@/Context/AuthContext';
import { useCampuses } from '@/Hooks/UseCampuses';
import { useCareers } from '@/Hooks/UseCareers';
import { useUniversities } from '@/Hooks/UseUniversities';
import { TYPOGRAPHY } from '@/Constants/Typography';
import { cn } from '@/Utils/ClassNames';
import type { Campus, Career, University } from '@/Types/InstitutionalStructureTypes';

type InstitutionalEntityType = 'universidad' | 'sede' | 'carrera';

export type InstitutionalEditTarget =
  | { type: 'universidad'; item: University }
  | { type: 'sede'; item: Campus }
  | { type: 'carrera'; item: Career };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  editTarget?: InstitutionalEditTarget | null;
}

interface FormData {
  entityType: InstitutionalEntityType;
  universidadId: string;
  nombre: string;
}

interface FormErrors {
  entityType?: string;
  universidadId?: string;
  nombre?: string;
}

const EMPTY_FORM: FormData = {
  entityType: 'universidad',
  universidadId: '',
  nombre: '',
};

export const InstitutionalCreateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCreated,
  editTarget = null,
}) => {
  const isEditing = !!editTarget;
  const { canAccess } = useAuth();
  const {
    universities,
    isLoading: loadingUniversities,
    createUniversity,
    updateUniversity,
  } = useUniversities();
  const {
    createCampus,
    updateCampus,
  } = useCampuses();
  const {
    createCareer,
    updateCareer,
  } = useCareers();

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState<{
    isOpen: boolean;
    type: InstitutionalEntityType;
    name: string;
    isEditing: boolean;
  }>({
    isOpen: false,
    type: 'universidad',
    name: '',
    isEditing: false,
  });

  const canCreateUniversidad = canAccess({ requireAnyPermissions: ['universidades.create'] });
  const canCreateSede = canAccess({ requireAnyPermissions: ['campuses.create'] });
  const canCreateCarrera = canAccess({ requireAnyPermissions: ['carreras.create'] });

  const hasUniversidades = universities.length > 0;

  const activeUniversities = useMemo(
    () => universities.filter((u) => u.activo),
    [universities],
  );

  const universityOptions = useMemo(
    () => activeUniversities.map((u) => ({ value: String(u.universidad_id), label: u.nombre })),
    [activeUniversities],
  );

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
      disabled: !canCreateCarrera || !hasUniversidades,
    },
  ]), [canCreateCarrera, canCreateSede, canCreateUniversidad, hasUniversidades]);

  useEffect(() => {
    if (!isOpen) return;

    if (editTarget) {
      setForm({
        entityType: editTarget.type,
        nombre: editTarget.item.nombre,
        universidadId: editTarget.type === 'universidad'
          ? ''
          : String(editTarget.item.universidad_id ?? ''),
      });
      setErrors({});
      setServerError('');
      setSuccess((prev) => ({ ...prev, isOpen: false }));
      return;
    }

    const defaultType = (
      canCreateUniversidad
        ? 'universidad'
        : canCreateSede && hasUniversidades
          ? 'sede'
          : 'carrera'
    ) as InstitutionalEntityType;

    setForm({ ...EMPTY_FORM, entityType: defaultType });
    setErrors({});
    setServerError('');
    setSuccess((prev) => ({ ...prev, isOpen: false }));
  }, [canCreateCarrera, canCreateSede, canCreateUniversidad, editTarget, hasUniversidades, isOpen]);

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

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');

    let result: { success: boolean; error?: string };

    const nombre = form.nombre.trim();

    if (isEditing && editTarget) {
      if (editTarget.type === 'universidad') {
        result = await updateUniversity(editTarget.item.universidad_id, { nombre });
      } else if (editTarget.type === 'sede') {
        result = await updateCampus(editTarget.item.sede_id, {
          nombre,
          universidad_id: Number(form.universidadId),
        });
      } else {
        result = await updateCareer(editTarget.item.carrera_id, {
          nombre,
          universidad_id: Number(form.universidadId),
        });
      }
    } else if (form.entityType === 'universidad') {
      result = await createUniversity({ nombre });
    } else if (form.entityType === 'sede') {
      result = await createCampus({
        nombre,
        universidad_id: Number(form.universidadId),
      });
    } else {
      result = await createCareer({
        nombre,
        universidad_id: Number(form.universidadId),
      });
    }

    setIsSubmitting(false);

    if (result.success) {
      onCreated();
      setSuccess({
        isOpen: true,
        type: isEditing && editTarget ? editTarget.type : form.entityType,
        name: nombre,
        isEditing,
      });
      return;
    }

    setServerError(result.error ?? 'No se pudo guardar el registro.');
  };

  const handleSuccessClose = () => {
    setSuccess((prev) => ({ ...prev, isOpen: false }));
    onClose();
  };

  const successEntityLabel = success.type === 'universidad'
    ? 'universidad'
    : success.type === 'sede'
      ? 'sede'
      : 'carrera';

  const noCreateOptions = entityTypeOptions.every((opt) => opt.disabled);

  return (
    <>
      <EntityFormModal
        isOpen={isOpen && !success.isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        title={
          isEditing
            ? editTarget.type === 'universidad'
              ? 'Editar universidad'
              : editTarget.type === 'sede'
                ? 'Editar sede'
                : 'Editar carrera'
            : 'Crear registro'
        }
        subtitle={isEditing ? editTarget.item.nombre : 'Universidad, sede o carrera'}
        isEditing={isEditing}
        confirmLabel={isEditing ? 'Guardar' : 'Crear'}
        confirmLoading={isSubmitting}
        confirmDisabled={!isEditing && noCreateOptions}
        size="md"
      >
        <div className="flex flex-col gap-4">
          {!isEditing && (
            <div className="flex flex-col gap-1">
              <CustomSelect
                label="Tipo de registro"
                required
                options={entityTypeOptions}
                value={form.entityType}
                placeholder="Seleccione el tipo"
                onChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    entityType: value as InstitutionalEntityType,
                    universidadId: '',
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
              {!hasUniversidades && canCreateCarrera && (
                <span className={cn(TYPOGRAPHY.form.helper, 'text-warning')}>
                  Primero debe existir al menos una universidad para crear una carrera.
                </span>
              )}
            </div>
          )}

          {(form.entityType === 'sede' || form.entityType === 'carrera') && (
            <CustomSelect
              label="Universidad padre"
              required
              options={universityOptions}
              value={form.universidadId}
              placeholder={loadingUniversities ? 'Cargando universidades...' : 'Seleccione una universidad'}
              disabled={loadingUniversities || universityOptions.length === 0}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, universidadId: value }));
                setErrors((prev) => ({ ...prev, universidadId: undefined }));
                setServerError('');
              }}
              error={errors.universidadId}
            />
          )}

          <Input
            label="Nombre"
            required
            value={form.nombre}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, nombre: e.target.value }));
              setErrors((prev) => ({ ...prev, nombre: undefined }));
              setServerError('');
            }}
            placeholder="Ingrese el nombre"
            maxLength={250}
            error={errors.nombre}
          />

          {serverError && (
            <p className={cn(TYPOGRAPHY.form.helper, 'text-error')}>{serverError}</p>
          )}
        </div>
      </EntityFormModal>

      <SuccessModal
        isOpen={success.isOpen}
        title={
          success.isEditing
            ? `${successEntityLabel[0].toUpperCase()}${successEntityLabel.slice(1)} actualizada`
            : `${successEntityLabel[0].toUpperCase()}${successEntityLabel.slice(1)} creada`
        }
        message={
          success.isEditing
            ? `La ${successEntityLabel} "${success.name}" fue actualizada correctamente.`
            : `La ${successEntityLabel} "${success.name}" fue creada correctamente.`
        }
        onClose={handleSuccessClose}
      />
    </>
  );
};
