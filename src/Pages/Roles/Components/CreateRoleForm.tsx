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
import { Input, Textarea, Button } from '@/components/Ui/Index';
import { useBreakpoint } from '@/hooks/UseBreakpoint';
import { useRoles } from '@/hooks/UseRoles';
import { validationRules, useValidation } from '@/utils/Validation';
import type { CreateRoleData, Role } from '@/Services/RoleService';
import { PermissionMatrixField } from './PermissionMatrixField';

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
  /** Callback para notificar cambios en el formulario */
  onHasChangesChange?: (hasChanges: boolean) => void;
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
    validationRules.maxLength(50, 'El nombre no puede exceder 50 caracteres'),
    validationRules.roleName('Solo se permiten letras, espacios y acentos')
  ],
  description: [
    validationRules.minLength(10, 'La descripción debe tener al menos 10 caracteres'),
    validationRules.maxLength(255, 'La descripción no puede exceder 255 caracteres'),
    validationRules.comment('Solo se permiten letras, números, espacios y signos de puntuación básicos')
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
  hideButtons = false,
  onHasChangesChange
}) => {
  const { isDesktop } = useBreakpoint();
  const { editRole, loadPermissions, isLoading, error, availablePermissionGroups, clearError } = useRoles();
  
  // Determinar si estamos en modo edición
  const isEditing = !!initialData;

  const [formData, setFormData] = useState<RoleFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    permissions: initialData?.permissions.map(p => p.name) || []
  });

  // Estado para detectar cambios en el formulario
  const [hasChanges, setHasChanges] = useState(false);

  // Sistema de validación avanzado
  const advancedValidation = useValidation({
    schema: validationSchema,
    validateOnChange: false // Cambiado a false para evitar ciclos infinitos
  });

  // Sistema de validación simple (fallback)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RoleFormData, string>>>({});

  // Cargar permisos disponibles al montar el componente
  useEffect(() => {
    loadPermissions();
  }, []);

  // Detectar cambios en el formulario comparando con initialData
  useEffect(() => {
    // En modo creación, el botón siempre está habilitado (no aplicar detección de cambios)
    if (!isEditing) {
      setHasChanges(true);
      onHasChangesChange?.(true);
      return;
    }

    // En modo edición, comparar con datos iniciales
    const nameChanged = formData.name.trim() !== (initialData?.name || '');
    const descriptionChanged = formData.description.trim() !== (initialData?.description || '');
    
    // Comparar arrays de permisos
    const initialPermissions = initialData?.permissions.map(p => p.name).sort() || [];
    const currentPermissions = [...formData.permissions].sort();
    const permissionsChanged = JSON.stringify(initialPermissions) !== JSON.stringify(currentPermissions);

    const hasFormChanges = nameChanged || descriptionChanged || permissionsChanged;
    setHasChanges(hasFormChanges);
    onHasChangesChange?.(hasFormChanges);
  }, [formData, initialData, isEditing, onHasChangesChange]);

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
      
      // Para modo simple, la validación en tiempo real se maneja en handleRealTimeValidation
    } else {
      // Para modo avanzado, la validación en tiempo real se maneja en handleRealTimeValidation
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

      // Validar campo nombre usando reglas centralizadas
      const nameRules = validationSchema.name;
      for (const rule of nameRules) {
        if (!rule.validate(formData.name)) {
          newErrors.name = rule.message;
          break;
        }
      }

      // Validar campo descripción usando reglas centralizadas
      if (formData.description.trim()) {
        const descRules = validationSchema.description;
        for (const rule of descRules) {
          if (!rule.validate(formData.description)) {
            newErrors.description = rule.message;
            break;
          }
        }
      }

      // Validar permisos usando reglas centralizadas
      const permRules = validationSchema.permissions;
      for (const rule of permRules) {
        if (!rule.validate(formData.permissions)) {
          newErrors.permissions = rule.message;
          break;
        }
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

  // Función para validación en tiempo real usando el sistema centralizado
  const handleRealTimeValidation = (field: keyof RoleFormData, value: string) => {
    if (simplified) {
      // En modo simple, usar validación básica con las reglas centralizadas
      if (field === 'name') {
        const validation = validationRules.roleNameImmediate();
        if (!validation.validate(value)) {
          setFormErrors(prev => ({
            ...prev,
            [field]: validation.message
          }));
        } else if (formErrors[field]) {
          setFormErrors(prev => ({
            ...prev,
            [field]: undefined
          }));
        }
      } else if (field === 'description') {
        const validation = validationRules.commentImmediate();
        if (!validation.validate(value)) {
          setFormErrors(prev => ({
            ...prev,
            [field]: validation.message
          }));
        } else if (formErrors[field]) {
          setFormErrors(prev => ({
            ...prev,
            [field]: undefined
          }));
        }
      }
    } else {
      // En modo avanzado, usar el sistema de validación avanzado
      if (field === 'name') {
        const validation = validationRules.roleNameImmediate();
        if (!validation.validate(value)) {
          // Mostrar error inmediato para caracteres no permitidos
          advancedValidation.errors[field] = validation.message;
        } else {
          // Si no hay caracteres inválidos, limpiar errores
          advancedValidation.clearFieldError(field);
        }
      } else if (field === 'description') {
        const validation = validationRules.commentImmediate();
        if (!validation.validate(value)) {
          // Mostrar error inmediato para caracteres no permitidos
          advancedValidation.errors[field] = validation.message;
        } else {
          // Si no hay caracteres inválidos, limpiar errores
          advancedValidation.clearFieldError(field);
        }
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
                onValidateChange={(value) => handleRealTimeValidation('name', value)}
                error={getFieldError('name')}
                required
                maxLength={50}
                characterCount={true}
                validateOnChange={true}
                size="sm"
              />

              {/* Privilegios */}
              <PermissionMatrixField
                value={formData.permissions}
                onChange={(values) => handleInputChange('permissions', values)}
                groups={availablePermissionGroups}
                loading={isLoading}
                error={getFieldError('permissions')}
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
                  maxLength={255}
                  characterCount={true}
                  helperText="Descripción opcional del rol y sus responsabilidades"
                  resize="vertical"
                  size="sm"
                  validateOnChange={true}
                  onValidateChange={(value) => handleRealTimeValidation('description', value)}
                />
                {/* Mostrar error de la API si existe */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-corner">
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
                      isLoading={isLoading}
                      loadingText={isEditing ? 'Guardando' : 'Creando'}
                      disabled={isLoading || !hasChanges}
                      standardWidth={true}
                      size="sm"
                    >
                      {isEditing ? 'Guardar' : 'Crear'}
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
            onValidateChange={(value) => handleRealTimeValidation('name', value)}
            error={getFieldError('name')}
            required
            maxLength={50}
            characterCount={true}
            validateOnChange={true}
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
            maxLength={255}
            characterCount={true}
            helperText="Descripción opcional del rol y sus responsabilidades"
            validateOnChange={true}
            onValidateChange={(value) => handleRealTimeValidation('description', value)}
          />

          {/* Campo: Privilegios */}
          <PermissionMatrixField
            groups={availablePermissionGroups}
            value={formData.permissions}
            onChange={(values) => handleInputChange('permissions', values)}
            loading={isLoading}
            error={getFieldError('permissions')}
          />

          {/* Mostrar error de la API si existe */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-corner">
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
                  isLoading={isLoading}
                  loadingText={isEditing ? 'Guardando' : 'Creando'}
                  disabled={isLoading || !hasChanges}
                  standardWidth={true}
                  size="sm"
                >
                  {isEditing ? 'Guardar' : 'Crear'}
                </Button>
            </div>
          )}
        </div>
      )}
    </form>
  );
};