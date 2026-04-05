/**
 * RoleFormContent - Contenido del formulario de rol (sin botones)
 *
 * Layout:
 * - Fila superior: [Nombre del Rol] [Permisos del Rol]  (grid 2 cols)
 * - Fila inferior: [Descripción]                        (full width)
 *
 * Diseñado para usarse dentro de un modal (RoleFormModal) o en página.
 * El ref del form se pasa externamente para que el padre pueda
 * disparar requestSubmit() desde un botón externo.
 */

import React, { useState, useEffect } from 'react';
import { Card, Input, Textarea } from '@/Components/Ui/Index';
import { useRoles } from '@/Hooks/UseRoles';
import { validationRules, useValidation } from '@/Utils/Validation';
import type { CreateRoleData, Role } from '@/Services/RoleService';
import { PermissionMatrixField } from './PermissionMatrixField';
import { TYPOGRAPHY } from '@/Constants/Typography';

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

const validationSchema = {
  name: [
    validationRules.required('El nombre del rol es obligatorio'),
    validationRules.minLength(3, 'El nombre debe tener al menos 3 caracteres'),
    validationRules.maxLength(50, 'El nombre no puede exceder 50 caracteres'),
    validationRules.roleName('Solo se permiten letras, espacios y acentos'),
  ],
  description: [
    validationRules.minLength(10, 'La descripción debe tener al menos 10 caracteres'),
    validationRules.maxLength(255, 'La descripción no puede exceder 255 caracteres'),
    validationRules.comment('Solo se permiten letras, números, espacios y signos de puntuación básicos'),
  ],
  permissions: [
    validationRules.minSelected(1, 'Debe seleccionar al menos un permiso'),
  ],
};

interface RoleFormContentProps {
  /** Ref del <form> para que el padre pueda llamar requestSubmit() */
  formRef?: React.RefObject<HTMLFormElement | null>;
  /** Datos iniciales → modo edición */
  initialData?: Role;
  /** Callback al pasar la validación */
  onSubmit: (data: CreateRoleData) => void;
  /** Notifica al padre si hay cambios pendientes */
  onHasChangesChange?: (hasChanges: boolean) => void;
}

export const RoleFormContent: React.FC<RoleFormContentProps> = ({
  formRef,
  initialData,
  onSubmit,
  onHasChangesChange,
}) => {
  const isEditing = !!initialData;
  const { loadPermissions, availablePermissionGroups, isLoading, error, clearError } = useRoles();

  const [formData, setFormData] = useState<RoleFormData>({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    permissions: initialData?.permissions.map(p => p.name) ?? [],
  });

  const advancedValidation = useValidation({ schema: validationSchema, validateOnChange: false });

  useEffect(() => { loadPermissions(); }, []);

  // Detectar cambios respecto a initialData
  useEffect(() => {
    if (!isEditing) {
      onHasChangesChange?.(true);
      return;
    }
    const nameChanged = formData.name.trim() !== (initialData?.name ?? '');
    const descChanged = formData.description.trim() !== (initialData?.description ?? '');
    const initPerms = [...(initialData?.permissions.map(p => p.name) ?? [])].sort();
    const currPerms = [...formData.permissions].sort();
    onHasChangesChange?.(nameChanged || descChanged || JSON.stringify(initPerms) !== JSON.stringify(currPerms));
  }, [formData, initialData, isEditing, onHasChangesChange]);

  const handleChange = (field: keyof RoleFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handleRealTime = (field: 'name' | 'description', value: string) => {
    const rule = field === 'name'
      ? validationRules.roleNameImmediate()
      : validationRules.commentImmediate();
    if (!rule.validate(value)) {
      advancedValidation.errors[field] = rule.message;
    } else {
      advancedValidation.clearFieldError(field);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (advancedValidation.validateForm(formData)) {
      onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissions: formData.permissions,
      });
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-5 items-start">
        <Card className="p-4 border border-gris-una/15 shadow-sm">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-negro-una">Datos del rol</h3>
              <p className={`${TYPOGRAPHY.form.helper} mt-1 text-gris-una`}>
                Define el nombre y una descripción corta antes de asignar permisos.
              </p>
            </div>

            <Input
              label="Nombre del Rol"
              placeholder="Ej: Administrador, Docente…"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              onFocus={() => advancedValidation.clearFieldError('name')}
              onValidateChange={v => handleRealTime('name', v)}
              error={advancedValidation.errors['name']}
              required
              maxLength={50}
              characterCount
              validateOnChange
              size="sm"
            />

            <Textarea
              label="Descripción"
              placeholder="Descripción del rol y sus responsabilidades…"
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              onFocus={() => advancedValidation.clearFieldError('description')}
              onValidateChange={v => handleRealTime('description', v)}
              error={advancedValidation.errors['description']}
              rows={6}
              maxLength={255}
              characterCount
              helperText="Descripción opcional"
              resize="vertical"
              size="sm"
              validateOnChange
            />
          </div>
        </Card>

        <PermissionMatrixField
          groups={availablePermissionGroups}
          value={formData.permissions}
          onChange={v => handleChange('permissions', v)}
          loading={isLoading}
          error={advancedValidation.errors['permissions']}
        />
      </div>

      {/* Error de API */}
      {error && (
        <div className={`${TYPOGRAPHY.form.helper} p-3 bg-rojo-una-2/5 border border-rojo-una-2/20 rounded-corner text-rojo-una-2`}>
          {error}
        </div>
      )}
    </form>
  );
};
