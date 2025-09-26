import React, { useState, useEffect } from 'react';
import { Input, Textarea, MultiSelect, Button, PageHeader } from '@/components/Ui/Index';
import { useSidebar } from '@/context/SidebarContext';
import { useBreakpoint } from '@/hooks/UseBreakpoint';
import { useRoles } from '@/hooks/UseRoles';
import type { CreateRoleData } from '@/Services/RoleService';
import type { PermissionOption } from '@/Types/RoleTypes';

interface CreateRoleFormProps {
  onSubmit?: (roleData: CreateRoleData) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  showHeader?: boolean;
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

export const CreateRoleForm: React.FC<CreateRoleFormProps> = ({
  onSubmit,
  onCancel,
  title = "Gestión de Roles",
  description = "Crea roles del sistema SAAC-UNA",
  showHeader = true
}) => {
  const { isCollapsed } = useSidebar();
  const { isMobile, isTablet, isDesktop, isLargeScreen } = useBreakpoint();
  const { createRole, loadPermissions, isLoading, error, availablePermissions, clearError } = useRoles();
  
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: []
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RoleFormData, string>>>({});

  // Cargar permisos disponibles al montar el componente
  useEffect(() => {
    loadPermissions();
  }, []);

  const handleInputChange = (field: keyof RoleFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // También limpiar error de la API cuando el usuario haga cambios
    if (error) {
      clearError();
    }
  };

  const validateForm = (): boolean => {
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

  // Transformar permisos de backend a formato esperado por MultiSelect
  const transformPermissionsToOptions = (permissions: PermissionOption[]) => {
    return permissions.map(permission => ({
      id: permission.value,      // usar el nombre técnico como ID
      label: permission.label,   // mostrar la descripción legible
      description: permission.label  // descripción también legible
    }));
  };

  // Estado de permisos para mostrar loading o mensaje vacío
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

  // Calcular ancho dinámico basado en pantalla y sidebar
  const getFormWidth = () => {
    if (isMobile) {
      return 'w-full max-w-none'; // Ancho completo en móvil
    }
    
    if (isTablet) {
      return isCollapsed ? 'w-full max-w-4xl' : 'w-full max-w-2xl';
    }
    
    if (isLargeScreen) {
        return isCollapsed ? 'w-full max-w-7xl' : 'w-full max-w-4xl';
    } else {
      return isCollapsed ? 'w-full max-w-6xl' : 'w-full max-w-3xl';
    }
    
    return 'w-full max-w-2xl'; // fallback
  };

  // Calcular padding interno responsive
  const getFormPadding = () => {
    if (isMobile) return 'p-4';
    if (isTablet) return 'p-5';
    return 'p-6'; // Desktop
  };

  return (
    <div className={`bg-blanco-una-2 rounded-lg shadow-lg border border-gris-una/20 transition-all duration-300 ${getFormWidth()}`}>

      {/* Título dentro del contenedor - Siempre alineado a la izquierda */}
      {showHeader && (
        <div className={` ${getFormPadding()}`}>
          <PageHeader 
            title={title}
            description={description}
            className="mb-0" // Sin margin bottom porque ya está en un contenedor
            forceLeftAlign={true} // Forzar alineación a la izquierda
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${getFormPadding()}`}>
        {isDesktop ? (
          // Layout de Desktop: Estructura compleja
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
                  error={formErrors.name}
                  required
                  size="sm"
                />

                {/* Privilegios */}
                <MultiSelect
                  label="Permisos del Rol"
                  options={getPermissionsState().options}
                  selectedValues={formData.permissions}
                  onChange={(values) => handleInputChange('permissions', values)}
                  error={formErrors.permissions}
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
                    error={formErrors.description}
                    rows={8}
                    resize="vertical"
                    size="sm"
                  />
                </div>

                {/* Mostrar error de la API si existe */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Botones en la esquina inferior derecha */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isLoading}
                    responsive
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    responsive
                  >
                    {isLoading ? 'Creando...' : 'Crear Rol'}
                  </Button>
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
              error={formErrors.name}
              required
              size="sm"
            />

            {/* Campo: Descripción */}
            <Textarea
              label="Descripción"
              placeholder="Descripción del rol..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={formErrors.description}
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
              error={formErrors.permissions}
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
                responsive
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                responsive
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