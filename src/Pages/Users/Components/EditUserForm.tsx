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
import type { SelectOption } from '@/Components/Ui/Forms/SingleSelect';
import { TYPOGRAPHY } from '@/Constants/Typography';

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
  const [rolesState, setRolesState] = useState<{ roles: Role[]; isLoadingRoles: boolean; error: string | null }>({ roles: [], isLoadingRoles: true, error: null });
  const roles = rolesState.roles;
  const isLoadingRoles = rolesState.isLoadingRoles;
  const error = rolesState.error;
  // Estado del formulario
  const [formState, setFormState] = useState<{ selectedRole: string; previewPermissions: string[] | BackendPermission[]; hasChanges: boolean }>({ selectedRole: '', previewPermissions: [], hasChanges: false });
  const selectedRole = formState.selectedRole;
  const previewPermissions = formState.previewPermissions;
  const hasChanges = formState.hasChanges;
  const isSaving = false;

  // Cargar roles al montar el componente
  useEffect(() => {
    loadRoles();
  }, []);

  // Establecer rol actual del usuario
  useEffect(() => {
    if (roles.length > 0 && user.role) {
      const currentRole = roles.find(role => role.name === user.role);
      if (currentRole) {
        setFormState(prev => ({...prev, selectedRole: currentRole.name}));
        updatePermissionsPreview(currentRole.name);
      }
    }
  }, [roles, user.role]);

  // Detectar cambios en el rol seleccionado
  useEffect(() => {
    const roleHasChanged = selectedRole !== '' && selectedRole !== user.role;
    setFormState(prev => ({...prev, hasChanges: roleHasChanged}));
  }, [selectedRole, user.role]);

  /**
   * Cargar roles disponibles
   */
  const loadRoles = async () => {
    setRolesState(prev => ({ ...prev, isLoadingRoles: true, error: null }));

    try {
      const response = await roleService.listarRoles();
      if (response.data) {
        setRolesState({ roles: response.data, isLoadingRoles: false, error: null });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando roles';
      setRolesState(prev => ({ ...prev, isLoadingRoles: false, error: errorMessage }));
    }
  };

  /**
   * Actualizar vista previa de permisos basado en rol seleccionado
   */
  const updatePermissionsPreview = (roleName: string) => {
    if (!roleName) {
      setFormState(prev => ({...prev, previewPermissions: []}));
      return;
    }

    const role = roles.find(r => r.name === roleName);
    if (role) {
      setFormState(prev => ({...prev, previewPermissions: role.permissions}));
    } else {
      setFormState(prev => ({...prev, previewPermissions: []}));
    }
  };

  /**
   * Manejar cambio en la selección de rol
   */
  const handleRoleChange = (newRole: string) => {
    setFormState(prev => ({...prev, selectedRole: newRole}));
    updatePermissionsPreview(newRole);
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async () => {
    if (!selectedRole) {
      setRolesState(prev => ({ ...prev, error: 'Debe seleccionar un rol' }));
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

  return (
    <div className="w-full">
      {/* Header con información del usuario */}
      <div className="mb-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <BackendErrorAlert
              error={error}
              onRetry={async () => {
                setRolesState(prev => ({ ...prev, error: null }));
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
            <h3 className={`${TYPOGRAPHY.pageSubtitle} font-semibold text-negro-una-2 mb-6`}>
              Gestión de Roles
            </h3>

            <div className="space-y-6">
              {/* Selector de Rol - alineado con Nombre */}
              <div>
                <div className="mb-3">
                  <span className={`${TYPOGRAPHY.form.helper} text-gris-una-2`}>
                    (Solo se permite un rol por usuario)
                  </span>
                </div>
                
                {isLoadingRoles ? (
                  <div className="relative py-8 min-h-[200px]">
                    <LoadingSpinner variant="loader" />
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
                      label: typeof permission === 'string' ? permission : permission.label,
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
            <h3 className={`${TYPOGRAPHY.pageSubtitle} font-semibold text-negro-una-2 mb-6`}>
              Información Personal
            </h3>

            <div className="space-y-6">
              {/* Nombre - alineado con Rol del Usuario */}
              <div>
                {/* Espaciado equivalente al texto de ayuda del rol */}
                <div className="mb-3">
                  <span className={`${TYPOGRAPHY.body} text-gris-una-2`}>
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
      <hr className="border-0 border-t border-gris-light mx-6 mt-6 mb-6" />

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