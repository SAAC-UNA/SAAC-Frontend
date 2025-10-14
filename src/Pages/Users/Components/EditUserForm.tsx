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
import React, { useState, useEffect, useRef } from 'react';
import { Input, CustomSelect, Button, LoadingSpinner, BackendErrorAlert } from '@/components/Ui/Index';
import { cn } from '@/Utils/ClassNames';
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
  const [previewPermissions, setPreviewPermissions] = useState<BackendPermission[]>([]);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const permissionsRef = useRef<HTMLDivElement>(null);

  // Cargar roles al montar el componente
  useEffect(() => {
    loadRoles();
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (permissionsRef.current && !permissionsRef.current.contains(event.target as Node)) {
        setIsPermissionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
          <div>
            {/* Título de sección */}
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Gestión de Roles
            </h3>

            <div className="space-y-8">
              {/* Selector de Rol - alineado con Nombre */}
              <div>
                {isLoadingRoles ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : (
                  <div>
                    <div className="mb-3">
                      <span className="text-xs text-gray-500">
                        (Solo se permite un rol por usuario)
                      </span>
                    </div>
                    <CustomSelect
                      label="Rol del Usuario"
                      options={roleOptions}
                      value={selectedRole}
                      onChange={handleRoleChange}
                      placeholder="Seleccionar rol..."
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Vista previa de permisos - alineado con Email */}
              {previewPermissions.length > 0 && (
                <div className="relative w-full" ref={permissionsRef}>
                  <div>
                    <h4 className="block text-sm font-medium text-negro-una mb-1">
                      Permisos que tendrá el usuario
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        ({previewPermissions.length} permisos)
                      </span>
                    </h4>

                    {/* Botón para mostrar/ocultar permisos */}
                    <button
                      type="button"
                      className={cn(
                        'relative w-full h-10 border rounded-lg text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-gris-una/20 focus:border-transparent transition-all duration-200',
                        'placeholder-gris-una/60 px-3 py-2 text-sm',
                        'border-gris-una/5 bg-gris-una/10 hover:border-gris-una/10',
                        isPermissionsOpen && 'border-gris-una/20'
                      )}
                      onClick={() => setIsPermissionsOpen(!isPermissionsOpen)}
                    >
                      <span className="block truncate text-gris-una/80">
                        {isPermissionsOpen ? 'Ocultar permisos' : 'Ver permisos del rol'}
                      </span>
                      
                      {/* Arrow Icon */}
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className={cn(
                            'w-5 h-5 text-gris-una transition-transform duration-200',
                            isPermissionsOpen && 'rotate-180'
                          )}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </button>

                    {/* Dropdown de permisos */}
                    {isPermissionsOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-[120px] overflow-auto custom-scrollbar">
                        <div className="py-1 text-sm">
                          {previewPermissions.map((permission) => (
                            <div 
                              key={permission.id}
                              className="relative w-full text-left px-4 py-2 text-gray-900"
                            >
                              <span className="text-sm text-gray-700">
                                {permission.label || permission.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha: Estado/Rol y Datos del usuario */}
          <div>
            {/* Estado y Rol Actual - arriba del subtítulo */}
            <div className="grid grid-cols-2 gap-4 mb-6">
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

            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Información Personal
            </h3>

            <div className="space-y-8">
              {/* Nombre - alineado con Rol del Usuario */}
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

              {/* Email - alineado con Permisos */}
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
          standardWidth={true}
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  );
};