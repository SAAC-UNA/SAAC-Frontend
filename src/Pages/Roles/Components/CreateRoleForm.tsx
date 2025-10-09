/**
 * CreateRoleForm - Formulario consolidado para creación y edición de roles
 * 
 * Características:
 * - Sistema de validación dual (simple/avanzado)
 * - Layout responsivo automático (mobile/desktop)
 * - Integración con hooks de roles y permisos
 * - Manejo de errores unificado
 * - Interfaz adaptativa según el dispositivo
 * - Soporte para crear y editar roles
 * 
 * Props:
 * @param onSubmit - Callback ejecutado al crear/editar el rol exitosamente
 * @param onCancel - Callback ejecutado al cancelar la operación
 * @param initialData - Datos iniciales para editar (opcional, si no se pasa es modo crear)
 * @param title - Título del formulario (opcional)
 * @param description - Descripción del formulario (opcional)
 * @param showHeader - Mostrar/ocultar el header del formulario
 * @param simplified - Usar validación simple (true) o avanzada (false)
 */
import React, { useState, useEffect } from 'react';
import { Input, Textarea, MultiSelect, Button } from '@/components/Ui/Index';
import { useBreakpoint } from '@/hooks/UseBreakpoint';
import { useRoles } from '@/hooks/UseRoles';
import { validationRules, useValidation } from '@/utils/Validation';
import type { CreateRoleData, Role } from '@/Services/RoleService';
import type { PermissionOption } from '@/types/RoleTypes';

/**
 * Props del componente CreateRoleForm
 */
interface CreateRoleFormProps {
  onSubmit?: (roleData: CreateRoleData) => void;
  onCancel?: () => void;
  initialData?: Role; // Para modo edición
  /** Modo simplificado sin validaciones avanzadas para prototipado rápido */
  simplified?: boolean;
  /** Ocultar botones internos (para manejarlos externamente) */
  hideButtons?: boolean;
}

/**
 * Estructura de datos del formulario de roles
 */
interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

// Esquema de validación avanzado con reglas declarativas
const validationSchema = {
  name: [
    validationRules.required('El nombre del rol es obligatorio'),
    validationRules.minLength(3, 'El nombre debe tener al menos 3 caracteres'),
    validationRules.maxLength(255, 'El nombre no puede exceder 255 caracteres'),
    validationRules.roleName('Solo se permiten letras, espacios y acentos')
  ],
  description: [
    validationRules.minLength(10, 'La descripción debe tener al menos 10 caracteres'),
    validationRules.maxLength(255, 'La descripción no puede exceder 255 caracteres')
  ],
  permissions: [
    validationRules.minSelected(1, 'Debe seleccionar al menos un permiso')
  ]
};

export const CreateRoleForm: React.FC<CreateRoleFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  simplified = false,
  hideButtons = false
}) => {
  const { isDesktop } = useBreakpoint();
  const { editRole, loadPermissions, isLoading, error, availablePermissions, clearError } = useRoles();
  
  // Determinar si estamos en modo edición
  const isEditing = !!initialData;

  const [formData, setFormData] = useState<RoleFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    permissions: initialData?.permissions.map(p => p.name) || []
  });

  // Sistema de validación avanzado
  const advancedValidation = useValidation({
    schema: validationSchema,
    validateOnChange: true
  });

  // Sistema de validación simple (fallback)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RoleFormData, string>>>({});

  // Cargar permisos disponibles al montar el componente
  useEffect(() => {
    loadPermissions();
  }, []);

  const handleInputChange = (field: keyof RoleFormData, value: string | string[]) => {
    const newFormData = {
      ...formData,
      [field]: value
    };

    setFormData(newFormData);

    // Sistema de limpieza de errores
    if (simplified) {
      // Limpiar errores básicos
      if (formErrors[field]) {
        setFormErrors(prev => ({
          ...prev,
          [field]: undefined
        }));
      }
    } else {
      // Validación en tiempo real - SIEMPRE ejecutar validación
      advancedValidation.validateSingleField(field, value, newFormData);
    }

    // Limpiar error de la API cuando el usuario haga cambios
    if (error) {
      clearError();
    }
  };

  const validateForm = (): boolean => {
    if (simplified) {
      // Validación simple para desarrollo rápido
      const newErrors: Partial<Record<keyof RoleFormData, string>> = {};

      if (!formData.name.trim()) {
        newErrors.name = 'El nombre del rol es requerido';
      } else if (formData.name.trim().length < 3) {
        newErrors.name = 'El nombre debe tener al menos 3 caracteres';
      }

      if (formData.description.trim() && formData.description.trim().length < 10) {
        newErrors.description = 'La descripción debe tener al menos 10 caracteres';
      }

      if (formData.permissions.length === 0) {
        newErrors.permissions = 'Debe seleccionar al menos un permiso';
      }

      setFormErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } else {
      // Validación con esquema declarativo
      return advancedValidation.validateForm(formData);
    }
  };

  // Función para obtener errores de forma unificada
  const getFieldError = (field: keyof RoleFormData): string | undefined => {
    if (simplified) {
      return formErrors[field];
    } else {
      return advancedValidation.errors[field];
    }
  };

  // Función para manejar focus en campos (limpia errores)
  const handleFieldFocus = (field: keyof RoleFormData) => {
    if (simplified) {
      if (formErrors[field]) {
        setFormErrors(prev => ({
          ...prev,
          [field]: undefined
        }));
      }
    } else {
      if (field in advancedValidation.errors && advancedValidation.errors[field]) {
        advancedValidation.clearFieldError(field);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Preparar datos para enviar al backend
        const roleData: CreateRoleData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          permissions: formData.permissions
        };

        if (isEditing && initialData) {
          // Modo edición - ejecutar directamente sin modal
          const result = await editRole(initialData.id, roleData);
          
          if (result) {
            // Llamar callback si existe
            onSubmit?.(roleData);
          }
        } else {
          // Modo creación - pasar datos al callback sin crear el rol aquí
          // El callback (RolesPage) se encargará del modal y la creación
          onSubmit?.(roleData);
        }
      } catch (err) {
        console.error('Error en handleSubmit:', err);
      }
    }
  };

  /**
   * Transformar permisos de backend a formato MultiSelect
   */
  const transformPermissionsToOptions = (permissions: PermissionOption[]) => {
    return permissions.map(permission => ({
      value: permission.value,
      label: permission.label,
      disabled: false
    }));
  };

  /**
   * Gestiona estados de permisos (loading, vacío, con datos)
   */
  const getPermissionsState = () => {
    if (isLoading && availablePermissions.length === 0) {
      return {
        options: [{ value: 'loading', label: 'Cargando permisos...', disabled: true }],
        placeholder: 'Cargando permisos disponibles...'
      };
    }

    if (availablePermissions.length === 0) {
      return {
        options: [{ value: 'empty', label: 'No hay permisos disponibles', disabled: true }],
        placeholder: 'No se encontraron permisos'
      };
    }

    return {
      options: transformPermissionsToOptions(availablePermissions),
      placeholder: 'Seleccione los permisos...'
    };
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {isDesktop ? (
        // Layout de Desktop
        <div className="space-y-6">
          {/* Grid principal: Columna izquierda (Nombre + Privilegios) y Columna derecha (Descripción) */}
          <div className="grid grid-cols-2 gap-6">
            {/* Columna izquierda: Nombre del rol + Privilegios */}
            <div className="space-y-6">
              {/* Nombre del rol */}
              <Input
                label="Nombre del Rol"
                placeholder="Ej: Administrador, Profesor..."
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onFocus={() => handleFieldFocus('name')}
                error={getFieldError('name')}
                required
                size="sm"
              />

              {/* Privilegios */}
              <MultiSelect
                label="Permisos del Rol"
                options={getPermissionsState().options}
                value={formData.permissions}
                onChange={(values) => handleInputChange('permissions', values)}
                error={getFieldError('permissions')}
                required
                placeholder={getPermissionsState().placeholder}
              />
            </div>

            {/* Columna derecha: Descripción */}
            <div className="space-y-6">
              <div className="min-h-full">
                <Textarea
                  label="Descripción"
                  placeholder="Descripción del rol..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  onFocus={() => handleFieldFocus('description')}
                  error={getFieldError('description')}
                  rows={8}
                  resize="vertical"
                  size="sm"
                />
                {/* Mostrar error de la API si existe */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-rojo-una">{error}</p>
                  </div>
                )}

                {/* Botones en la esquina inferior derecha */}
                {!hideButtons && (
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onCancel}
                      disabled={isLoading}
                      standardWidth={true}
                      size="sm"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                      standardWidth={true}
                      size="sm"
                    >
                      {isLoading 
                        ? (isEditing ? 'Guardando...' : 'Creando...') 
                        : (isEditing ? 'Guardar' : 'Crear')
                      }
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Layout de Mobile/Tablet: Columna única
        <div className="space-y-6">
          {/* Campo: Nombre del rol */}
          <Input
            label="Nombre del Rol"
            placeholder="Ej: Administrador, Profesor..."
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onFocus={() => handleFieldFocus('name')}
            error={getFieldError('name')}
            required
            size="sm"
          />

          {/* Campo: Descripción */}
          <Textarea
            label="Descripción"
            placeholder="Descripción del rol..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            onFocus={() => handleFieldFocus('description')}
            error={getFieldError('description')}
            rows={4}
            resize="vertical"
            size="sm"
          />

          {/* Campo: Privilegios */}
          <MultiSelect
            label="Permisos del Rol"
            options={getPermissionsState().options}
            value={formData.permissions}
            onChange={(values) => handleInputChange('permissions', values)}
            error={getFieldError('permissions')}
            required
            placeholder={getPermissionsState().placeholder}
          />

          {/* Mostrar error de la API si existe */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Botones de acción */}
          {!hideButtons && (
            <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isLoading}
                  standardWidth={true}
                  size="sm"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  standardWidth={true}
                  size="sm"
                >
                  {isLoading 
                    ? (isEditing ? 'Guardando...' : 'Creando...') 
                    : (isEditing ? 'Guardar' : 'Crear')
                  }
                </Button>
            </div>
          )}
        </div>
      )}
    </form>
  );
};