/**
 * EditUserForm - Formulario para editar roles de usuarios
 * 
 * Características:
 * - Información del usuario (solo lectura)
 * - MultiSelect para seleccionar roles
 * - Vista previa de permisos por rol
 * - Layout responsivo similar a CreateRoleForm
 * - Integración con hooks de roles
 * 
 * Props:
 * @param user - Usuario a editar
 * @param onSubmit - Callback ejecutado al guardar exitosamente
 * @param onCancel - Callback ejecutado al cancelar la operación
 */
import React, { useState, useEffect } from 'react';
import { Input, CustomSelect, Button, LoadingSpinner, BackendErrorAlert } from '@/components/Ui/Index';
import { roleService } from '@/Services/RoleService';
import { userService } from '@/Services/UserService';
import type { User } from '@/Services/UserService';
import type { Role, BackendPermission } from '@/Services/RoleService';
import type { SelectOption } from '@/components/Ui/SingleSelect';

interface EditUserFormProps {
  user: User;
  onSubmit?: (userName: string) => void;
  onCancel?: () => void;
}

export const EditUserForm: React.FC<EditUserFormProps> = ({
  user,
  onSubmit,
  onCancel
}) => {
  
  // Estados para roles
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para vista previa de permisos
  const [previewPermissions, setPreviewPermissions] = useState<BackendPermission[]>([]);

  // Cargar roles al montar el componente
  useEffect(() => {
    loadRoles();
  }, []);

  // Establecer rol actual del usuario
  useEffect(() => {
    if (roles.length > 0 && user.role) {
      const currentRole = roles.find(role => role.name === user.role);
      if (currentRole) {
        setSelectedRole(currentRole.name);
        updatePermissionsPreview(currentRole.name);
      }
    }
  }, [roles, user.role]);

  /**
   * Cargar roles disponibles
   */
  const loadRoles = async () => {
    setIsLoadingRoles(true);
    setError(null);

    try {
      const response = await roleService.listarRoles();
      if (response.data) {
        setRoles(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando roles';
      setError(errorMessage);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  /**
   * Actualizar vista previa de permisos basado en rol seleccionado
   */
  const updatePermissionsPreview = (roleName: string) => {
    if (!roleName) {
      setPreviewPermissions([]);
      return;
    }

    const role = roles.find(r => r.name === roleName);
    if (role) {
      setPreviewPermissions(role.permissions);
    } else {
      setPreviewPermissions([]);
    }
  };

  /**
   * Manejar cambio en la selección de rol
   */
  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    updatePermissionsPreview(newRole);
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);

    try {
      if (selectedRole) {
        await userService.assignUserRole(user.id, selectedRole);
      }
      
      onSubmit?.(user.name);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error asignando rol';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Preparar opciones para el CustomSelect
   */
  const roleOptions: SelectOption[] = roles.map(role => ({
    value: role.name,
    label: role.description ? `${role.name} - ${role.description}` : role.name
  }));

  return (
    <div className="w-full">
      {/* Header con información del usuario */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-negro-una mb-6">
          Información del Usuario
        </h2>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <BackendErrorAlert
              error={error}
              onRetry={() => {
                setError(null);
                loadRoles();
              }}
            />
          </div>
        )}

        {/* Layout de dos columnas */}
        <div className="grid grid-cols-2 gap-6">
          {/* Columna izquierda: Gestión de Roles y Permisos */}
          <div className="space-y-8">
            {/* Gestión de Roles */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Gestión de Roles
              </h3>

              {/* Selector de Rol */}
              <div className="mb-6">
                <div className="mb-3">
                  <span className="text-xs text-gray-500">
                    (Solo se permite un rol por usuario)
                  </span>
                </div>
                
                {isLoadingRoles ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2 text-sm text-gray-600">Cargando roles...</span>
                  </div>
                ) : (
                  <CustomSelect
                    label="Rol del Usuario"
                    options={roleOptions}
                    value={selectedRole}
                    onChange={handleRoleChange}
                    placeholder="Seleccionar rol..."
                    className="w-full"
                  />
                )}
              </div>
            </div>

            {/* Vista previa de permisos */}
            {previewPermissions.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Permisos que tendrá el usuario
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({previewPermissions.length} permisos)
                  </span>
                </h4>
                {/** ScrollBar */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 gap-2">
                    {previewPermissions.map((permission) => (
                      <div 
                        key={permission.id}
                        className="flex items-center p-2"
                      >
                        <span className="text-sm text-gray-700">
                          {permission.label || permission.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha: Estado/Rol y Datos del usuario */}
          <div className="space-y-8">
            {/* Estado y Rol Actual */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-negro-una mb-1">
                  Estado
                </label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-negro-una mb-1">
                  Rol Actual
                </label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {user.role || 'Sin rol asignado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Nombre y Email */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-negro-una mb-1">
                  Nombre
                </label>
                <Input
                  value={user.name}
                  disabled
                  className="bg-white/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-negro-una mb-1">
                  Email
                </label>
                <Input
                  value={user.email}
                  disabled
                  className="bg-white/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSaving}
          standardWidth={true}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleSubmit}
          disabled={isSaving || !selectedRole}
          isLoading={isSaving}
          standardWidth={true}
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  );
};