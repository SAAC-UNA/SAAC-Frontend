/**
 * DestinatariosStep - Segundo paso del wizard
 */

import React, { useState, useEffect } from 'react';
import { MultiSelect } from '@/Components/Ui/MultiSelect';
import { BackendErrorAlert } from '@/Components/Ui/BackendErrorAlert';
import { LoadingSpinner } from '@/Components/Ui/Loading';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { userService, type User } from '@/Services/UserService';
import { roleService, type Role } from '@/Services/RoleService';
import type { 
  EvidenceAssignmentFormData,
  ValidationErrors
} from '@/Types/EvidenceAssignment';

interface AddresseeStepProps {
  formData: EvidenceAssignmentFormData;
  updateFormData: (updates: Partial<EvidenceAssignmentFormData>) => void;
  errors: ValidationErrors;
}

export const AddresseeStep: React.FC<AddresseeStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setUserError(null);
    setRoleError(null);
    
    await Promise.all([
      loadUsers(),
      loadRoles()
    ]);
    
    setLoading(false);
  };

  const loadUsers = async () => {
    try {
      const users = await userService.listUsers();
      // Transformar BackendUser a User para compatibilidad
      const transformedUsers: User[] = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status === 'active' ? 'active' : 'inactive',
        role: user.roles?.[0]?.name
      }));
      setAvailableUsers(transformedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setUserError('Error al cargar la lista de usuarios');
    }
  };

  const loadRoles = async () => {
    try {
      const response = await roleService.listarRoles();
      setAvailableRoles(response.data || []);
    } catch (error) {
      console.error('Error loading roles:', error);
      setRoleError('Error al cargar la lista de roles');
    }
  };

  const handleUserSelectionChange = (selectedUserIds: (string | number)[]) => {
    const numericIds = selectedUserIds.map(id => Number(id));
    updateFormData({ selectedUsers: numericIds });
  };

  const handleRoleSelectionChange = (selectedRoleIds: (string | number)[]) => {
    const numericIds = selectedRoleIds.map(id => Number(id));
    updateFormData({ selectedRoles: numericIds });
  };

  const userOptions = availableUsers.map(user => ({
    id: user.id,
    label: `${user.name} (${user.email})`,
    value: user.id.toString()
  }));

  const roleOptions = availableRoles.map(role => ({
    id: role.id,
    label: role.name,
    value: role.id.toString()
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-negro-una mb-3">
          Seleccione los destinatarios
        </h2>
        <p className="text-gris-una">
          Asigne las evidencias a usuarios específicos y/o roles del sistema
        </p>
      </div>

      {/* Error de validación - Debe seleccionar al menos un usuario o rol */}
      {errors.destinatarios && (
        <div className="p-4 bg-rojo-una-2/10 border border-rojo-una-2/20 rounded-lg flex items-center gap-3">
          <SystemIcons.interface.alert size="md" className="text-rojo-una-2" />
          <span className="text-rojo-una-2">{errors.destinatarios}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" className="mb-4" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selección de Usuarios */}
          <div>
            {userError ? (
              <div className="mb-4">
                <BackendErrorAlert
                  error={userError}
                  onRetry={async () => {
                    setUserError(null);
                    await loadUsers();
                  }}
                />
              </div>
            ) : (
              <MultiSelect
                label="Usuarios Individuales"
                options={userOptions}
                value={formData.selectedUsers.map(id => id.toString())}
                onChange={handleUserSelectionChange}
                placeholder="Seleccione usuarios..."
                selectAllText="Seleccionar todos"
                deselectAllText="Deseleccionar todos"
                showSelectAll={true}
              />
            )}
          </div>

          {/* Selección de Roles */}
          <div>
            {roleError ? (
              <div className="mb-4">
                <BackendErrorAlert
                  error={roleError}
                  onRetry={async () => {
                    setRoleError(null);
                    await loadRoles();
                  }}
                />
              </div>
            ) : (
              <MultiSelect
                label="Roles"
                options={roleOptions}
                value={formData.selectedRoles.map(id => id.toString())}
                onChange={handleRoleSelectionChange}
                placeholder="Seleccione roles..."
                selectAllText="Seleccionar todos"
                deselectAllText="Deseleccionar todos"
                showSelectAll={true}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};