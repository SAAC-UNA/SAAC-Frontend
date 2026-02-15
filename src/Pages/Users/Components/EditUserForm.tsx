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
import type { User } from '@/Services/UserService';
import type { Role, BackendPermission } from '@/Services/RoleService';
import type { SelectOption } from '@/components/Ui/SingleSelect';

interface EditUserFormProps {
  user: User;
  onSubmit?: (userData: { userId: number; roleName: string; userName: string }) => void;
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
  const [isSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para vista previa de permisos
  const [previewPermissions, setPreviewPermissions] = useState<string[] | BackendPermission[]>([]);

  // Estado para detectar cambios
  const [hasChanges, setHasChanges] = useState<boolean>(false);

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

  // Detectar cambios en el rol seleccionado
  useEffect(() => {
    const roleHasChanged = selectedRole !== '' && selectedRole !== user.role;
    setHasChanges(roleHasChanged);
  }, [selectedRole, user.role]);

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
    if (!selectedRole) {
      setError('Debe seleccionar un rol');
      return;
    }

    // Pasar los datos al componente padre en lugar de hacer la llamada directamente
    onSubmit?.({
      userId: user.id,
      roleName: selectedRole,
      userName: user.name
    });
  };

  /**
   * Preparar opciones para el CustomSelect
   */
  const roleOptions: SelectOption[] = roles.map(role => ({
    value: role.name,
    label: role.description ? `${role.name}` : role.name
  }));

  /**
   * Obtener lista de roles para mostrar (soporta uno o múltiples)
   */
  const getUserRoles = (): string[] => {
    // Si en el futuro user.roles es un array, usarlo
    // Por ahora, convertir user.role (string) a array
    if (user.role) {
      return [user.role];
    }
    return [];
  };

  const userRoles = getUserRoles();

  return (
    <div className="w-full">
      {/* Header con información del usuario */}
      <div className="mb-8">
        {/* Título principal con Estado y Rol Actual alineados */}
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-negro-una">
            Información del Usuario
          </h2>
          
          {/* Estado y Rol Actual - alineados con el título */}
          <div className="flex gap-6">
            <div className="text-right">
              <label className="block text-sm font-medium text-negro-una mb-2">
                Estado
              </label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="text-right">
              <label className="block text-sm font-medium text-negro-una mb-2">
                Rol{userRoles.length !== 1 ? 'es' : ''} Actual{userRoles.length !== 1 ? 'es' : ''}
              </label>
              <div className="flex flex-wrap gap-2 justify-end">
                {userRoles.length > 0 ? (
                  userRoles.map((roleName, index) => (
                    <div 
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 max-w-[200px] break-all"
                    >
                      {roleName}
                    </div>
                  ))
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                    Sin rol asignado
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <BackendErrorAlert
              error={error}
              onRetry={async () => {
                setError(null);
                await loadRoles();
              }}
            />
          </div>
        )}

        {/* Layout de dos columnas */}
        <div className="grid grid-cols-2 gap-6">
          {/* Columna izquierda: Gestión de Roles y Permisos */}
          <div>
            {/* Título de sección - alineado con subtítulo derecho */}
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Gestión de Roles
            </h3>

            <div className="space-y-6">
              {/* Selector de Rol - alineado con Nombre */}
              <div>
                <div className="mb-3">
                  <span className="text-xs text-gray-500">
                    (Solo se permite un rol por usuario)
                  </span>
                </div>
                
                {isLoadingRoles ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="sm" />
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

              {/* Vista previa de permisos - alineado con Email */}
              {previewPermissions.length > 0 && (
                <div>
                  <CustomSelect
                    label={`Permisos que tendrá el usuario (${previewPermissions.length} permisos)`}
                    options={previewPermissions.map((permission, index) => ({
                      value: index.toString(),
                      label: typeof permission === 'string' ? permission : permission.label || permission.name
                    }))}
                    value="" // Sin valor seleccionado
                    readonly={true}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha: Estado/Rol y Datos del usuario */}
          <div>
            {/* Título de sección - alineado con subtítulo izquierdo */}
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Información Personal
            </h3>

            <div className="space-y-6">
              {/* Nombre - alineado con Rol del Usuario */}
              <div>
                {/* Espaciado equivalente al texto de ayuda del rol */}
                <div className="mb-3">
                  <span className="text-xs text-gray-500">
                    &nbsp; {/* Espaciado invisible para alineación */}
                  </span>
                </div>
                
                <Input
                  label="Nombre"
                  value={user.name}
                  disabled
                  className="!bg-blanco-una-2"
                />
              </div>

              {/* Email - alineado con Permisos */}
              <div>
                <Input
                  label="Email"
                  value={user.email}
                  disabled
                  className="!bg-blanco-una-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Línea divisoria inferior */}
      <hr className="border-0 border-t border-gris-una/20 mx-6 mt-6 mb-6" />

      {/* Botones de acción */}
      <div className="px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5 lg:pb-6">
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSaving}
            standardWidth={true}
            size="sm"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSaving || !selectedRole || !hasChanges}
            standardWidth={true}
            size="sm"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  );
};