/**
 * Ejemplo de formulario mejorado usando todas las nuevas utilidades
 */
import React, { useState } from 'react';
import { Input, Textarea, MultiSelect, Button, LoadingOverlay } from '@/components/Ui/Index';
import { useFormApi } from '@/hooks/UseApi';
import { useValidation, validationRules } from '@/utils/Validation';
import type { RoleFormData } from '@/types/RoleTypes';

interface ImprovedCreateRoleFormProps {
  onSubmit?: (roleData: RoleFormData) => void;
  onCancel?: () => void;
}

// Definir esquema de validación
const validationSchema = {
  name: [
    validationRules.required('El nombre del rol es obligatorio'),
    validationRules.minLength(3, 'El nombre debe tener al menos 3 caracteres'),
    validationRules.maxLength(50, 'El nombre no puede exceder 50 caracteres'),
    validationRules.alphabetic('Solo se permiten letras y espacios')
  ],
  description: [
    validationRules.minLength(10, 'La descripción debe tener al menos 10 caracteres'),
    validationRules.maxLength(500, 'La descripción no puede exceder 500 caracteres')
  ],
  privileges: [
    validationRules.minSelected(1, 'Debes seleccionar al menos un privilegio')
  ]
};

// Mock de función API
const createRole = async (roleData: RoleFormData) => {
  // Simular llamada API
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simular respuesta exitosa
  return {
    success: true,
    data: { id: '123', ...roleData },
    message: 'Rol creado exitosamente'
  };
};

export const ImprovedCreateRoleForm: React.FC<ImprovedCreateRoleFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    privileges: []
  });

  // Hook de validación
  const {
    errors,
    validateForm,
    validateSingleField,
    clearFieldError
  } = useValidation({
    schema: validationSchema,
    validateOnChange: true
  });

  // Hook de API con manejo automático de toast
  const {
    isLoading,
    execute: executeCreateRole
  } = useFormApi(createRole, 'Rol creado exitosamente');

  const handleInputChange = (field: keyof RoleFormData, value: string | string[]) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newFormData);
    
    // Validar campo individual si hay error previo
    if (field in errors && errors[field]) {
      validateSingleField(field, value, newFormData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario completo
    const isValid = validateForm(formData);
    
    if (isValid) {
      const result = await executeCreateRole(formData);
      
      if (result) {
        // Si la API fue exitosa, llamar callback externo
        onSubmit?.(result);
      }
    }
  };

  const handleFieldFocus = (field: keyof RoleFormData) => {
    // Limpiar error cuando el usuario comienza a editar
    if (field in errors && errors[field]) {
      clearFieldError(field);
    }
  };

  return (
    <LoadingOverlay isLoading={isLoading}>
      <div className="bg-blanco-una rounded-lg shadow-lg border border-gris-una/20 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre del rol */}
          <Input
            label="Nombre del Rol"
            placeholder="Ej: Administrador, Profesor..."
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onFocus={() => handleFieldFocus('name')}
            error={errors.name}
            required
            size="sm"
          />

          {/* Descripción */}
          <Textarea
            label="Descripción"
            placeholder="Descripción del rol..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            onFocus={() => handleFieldFocus('description')}
            error={errors.description}
            rows={4}
            size="sm"
          />

          {/* Privilegios */}
          <MultiSelect
            label="Privilegios del Rol"
            options={[
              { id: 'view_users', label: 'Ver usuarios', description: 'Permite ver lista de usuarios' },
              { id: 'create_roles', label: 'Crear roles', description: 'Permite crear nuevos roles' },
              { id: 'edit_roles', label: 'Editar roles', description: 'Permite modificar roles existentes' }
            ]}
            selectedValues={formData.privileges}
            onChange={(values) => handleInputChange('privileges', values)}
            error={errors.privileges}
            required
            maxHeight="lg"
            showCounter
          />

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {isLoading ? 'Creando...' : 'Crear Rol'}
            </Button>
          </div>
        </form>
      </div>
    </LoadingOverlay>
  );
};