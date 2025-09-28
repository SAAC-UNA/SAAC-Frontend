/**
 * CreateRoleForm - Formulario consolidado para creación de roles
 * 
 * Características:
 * - Sistema de validación dual (simple/avanzado)
 * - Layout responsivo automático (mobile/desktop)
 * - Integración con hooks de roles y permisos
 * - Manejo de errores unificado
 * - Interfaz adaptativa según el dispositivo
 * 
 * Props:
 * @param onSubmit - Callback ejecutado al crear el rol exitosamente
 * @param onCancel - Callback ejecutado al cancelar la creación
 * @param title - Título del formulario (opcional)
 * @param description - Descripción del formulario (opcional)
 * @param showHeader - Mostrar/ocultar el header del formulario
 * @param simplified - Usar validación simple (true) o avanzada (false)
 */
import React, { useState, useEffect } from 'react';
import { Input, Textarea, MultiSelect, Button, PageHeader } from '@/components/Ui/Index';
import { useBreakpoint } from '@/hooks/UseBreakpoint';
import { useRoles } from '@/hooks/UseRoles';
import { useModuleInfo } from '@/hooks/UseModuleInfo';
import { usePermissionLabels } from '@/hooks/UsePermissionLabels';
import { validationRules, useValidation } from '@/utils/Validation';
import type { CreateRoleData } from '@/Services/RoleService';
import type { PermissionOption } from '@/Types/RoleTypes';

/**
 * Props del componente CreateRoleForm
 */
interface CreateRoleFormProps {
  onSubmit?: (roleData: CreateRoleData) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  showHeader?: boolean;
  /** Modo simplificado sin validaciones avanzadas para prototipado rápido */
  simplified?: boolean;
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
    validationRules.maxLength(255, 'El nombre no puede exceder 255 caracteres')
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
  title,
  description,
  showHeader = true,
  simplified = false
}) => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const { createRole, loadPermissions, isLoading, error, availablePermissions, clearError } = useRoles();
  const { getDescription } = usePermissionLabels();
  
  // Obtener información del módulo dinámicamente
  const moduleInfo = useModuleInfo('roles', 'create');
  
  // Usar los valores pasados como props, o los del módulo como fallback
  const finalTitle = title || moduleInfo.title;
  const finalDescription = description || moduleInfo.description;

  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: []
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
      // Validación en tiempo real
      if (field in advancedValidation.errors && advancedValidation.errors[field]) {
        advancedValidation.validateSingleField(field, value, newFormData);
      }
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

        const createdRole = await createRole(roleData);

        if (createdRole) {
          // Limpiar formulario después de éxito
          setFormData({
            name: '',
            description: '',
            permissions: []
          });

          // Llamar callback si existe
          onSubmit?.(roleData);
        }
      } catch (err) {
        // El error ya se maneja en el hook useRoles
        console.error('Error en handleSubmit:', err);
      }
    }
  };

  /**
   * Transformar permisos de backend a formato MultiSelect
   */
  const transformPermissionsToOptions = (permissions: PermissionOption[]) => {
    return permissions.map(permission => ({
      id: permission.value,
      label: permission.label,
      description: getDescription(permission.value) || `Permiso para ${permission.label.toLowerCase()}`
    }));
  };

  /**
   * Gestiona estados de permisos (loading, vacío, con datos)
   */
  const getPermissionsState = () => {
    if (isLoading && availablePermissions.length === 0) {
      return {
        options: [{ id: 'loading', label: 'Cargando permisos...', description: 'Por favor espere' }],
        placeholder: 'Cargando permisos disponibles...'
      };
    }

    if (availablePermissions.length === 0) {
      return {
        options: [{ id: 'empty', label: 'No hay permisos disponibles', description: 'Contacte al administrador' }],
        placeholder: 'No se encontraron permisos'
      };
    }

    return {
      options: transformPermissionsToOptions(availablePermissions),
      placeholder: 'Seleccione los permisos...'
    };
  };

  /**
   * Calcula padding interno responsivo
   */
  const getFormPadding = () => {
    if (isMobile) return 'p-4';
    if (isTablet) return 'p-5';
    return 'p-6'; // Desktop
  };

  return (
    <div className="w-full bg-blanco-una-2 rounded-lg shadow-lg border border-gris-una/20 transition-all duration-300 min-h-fit">

      {/* Título dentro del contenedor - Siempre alineado a la izquierda */}
      {showHeader && (
        <div className={` ${getFormPadding()}`}>
          <PageHeader
            title={finalTitle}
            description={finalDescription}
            className="mb-0" // Sin margin bottom porque ya está en un contenedor
            forceLeftAlign={true} // Forzar alineación a la izquierda
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${getFormPadding()}`}>
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
                  selectedValues={formData.permissions}
                  onChange={(values) => handleInputChange('permissions', values)}
                  error={getFieldError('permissions')}
                  required
                  maxHeight="lg"
                  showCounter
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
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onCancel}
                      disabled={isLoading}
                      size="sm"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                      size="sm"
                    >
                      {isLoading ? 'Creando...' : 'Crear Rol'}
                    </Button>
                  </div>
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
              selectedValues={formData.permissions}
              onChange={(values) => handleInputChange('permissions', values)}
              error={getFieldError('permissions')}
              required
              maxHeight="lg"
              showCounter
              placeholder={getPermissionsState().placeholder}
            />

            {/* Mostrar error de la API si existe */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Botones de acción - Ancho completo en móvil */}
            <div className="flex gap-4 pt-4 ">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isLoading}
                size="sm"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? 'Creando...' : 'Crear Rol'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};