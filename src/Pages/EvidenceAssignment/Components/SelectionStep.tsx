/**
 * SelectionStep - Primer paso del wizard (combina selección de criterio/evidencias y destinatarios)
 * Permite seleccionar criterio, evidencias, usuarios y roles en una sola pantalla
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CustomSelect } from '@/Components/Ui/Forms/SingleSelect';
import { LoadingSpinner, MultiSelect } from '@/Components/Ui/Index';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { BackendErrorAlert } from '@/Components/Ui/Feedback/BackendErrorAlert';
import type { 
  EvidenceAssignmentFormData, 
  ValidationErrors, 
  Criterion, 
  Evidence
} from '@/Types/EvidenceAssignment';
import { evidenceAssignmentService } from '@/Services/EvidenceAssignmentService';
import { userService, type User } from '@/Services/UserService';
import { roleService, type Role } from '@/Services/RoleService';
import type { MultiSelectOption } from '@/Components/Ui/Forms/MultiSelect';

interface SelectionStepProps {
  formData: EvidenceAssignmentFormData;
  updateFormData: (updates: Partial<EvidenceAssignmentFormData>) => void;
  errors: ValidationErrors;
}

export const SelectionStep: React.FC<SelectionStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  // Estados para criterios y evidencias
  const [criteriaState, setCriteriaState] = useState<{ criteria: Criterion[]; evidences: Evidence[]; criteriaLoading: boolean }>({ criteria: [], evidences: [], criteriaLoading: true });
  const criteria = criteriaState.criteria;
  const evidences = criteriaState.evidences;
  const criteriaLoading = criteriaState.criteriaLoading;
  
  // Estados para usuarios y roles
  const [catalogState, setCatalogState] = useState<{ availableUsers: User[]; availableRoles: Role[]; usersLoading: boolean; userError: string | null; roleError: string | null; userCountByRole: Record<number, number> }>({ availableUsers: [], availableRoles: [], usersLoading: true, userError: null, roleError: null, userCountByRole: {} });
  const availableUsers = catalogState.availableUsers;
  const availableRoles = catalogState.availableRoles;
  const usersLoading = catalogState.usersLoading;
  const userError = catalogState.userError;
  const roleError = catalogState.roleError;
  const userCountByRole = catalogState.userCountByRole;
  
  const [dataLoaded, setDataLoaded] = useState(false);

  // Cargar todos los datos al montar el componente
  useEffect(() => {
    if (dataLoaded) return;
    loadAllData();
  }, [dataLoaded]);

  const loadAllData = async () => {
    try {
      setCriteriaState(prev => ({...prev, criteriaLoading: true}));
      setCatalogState(prev => ({...prev, usersLoading: true}));
      
      // Cargar criterios, evidencias, usuarios y roles en paralelo
      const [criteriaData, evidencesData] = await Promise.all([
        evidenceAssignmentService.getAllCriteria(),
        evidenceAssignmentService.getAllEvidences()
      ]);
      
      setCriteriaState({ criteria: criteriaData, evidences: evidencesData, criteriaLoading: false });
      
      // Auto-seleccionar el primer proceso disponible
      const processesData = await evidenceAssignmentService.getAllProcesses();
      if (processesData.length > 0 && !formData.proceso_id) {
        updateFormData({
          proceso_id: processesData[0].proceso_id
        });
      }
      
      // Cargar usuarios y roles
      await Promise.all([
        loadUsers(),
        loadRoles()
      ]);
      
      setCatalogState(prev => ({...prev, usersLoading: false}));
      setDataLoaded(true);
    } catch (error) {
      console.error('Error crítico cargando datos:', error);
      setCriteriaState(prev => ({...prev, criteriaLoading: false}));
      setCatalogState(prev => ({...prev, usersLoading: false}));
    }
  };

  const loadUsers = async () => {
    try {
      const users = await userService.listUsers();
      const transformedUsers: User[] = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status === 'active' ? 'active' : 'inactive',
        role: user.roles?.[0]?.name
      }));
      setCatalogState(prev => ({...prev, availableUsers: transformedUsers}));
      calculateUserCountByRole(users);
    } catch (error) {
      console.error('Error loading users:', error);
      setCatalogState(prev => ({...prev, userError: 'Error al cargar la lista de usuarios'}));
    }
  };

  const calculateUserCountByRole = (users: any[]) => {
    const countMap: Record<number, number> = {};
    users.forEach(user => {
      if (user.roles && user.roles.length > 0) {
        user.roles.forEach((role: any) => {
          if (role.id) {
            countMap[role.id] = (countMap[role.id] || 0) + 1;
          }
        });
      }
    });
    setCatalogState(prev => ({...prev, userCountByRole: countMap}));
  };

  const loadRoles = async () => {
    try {
      const response = await roleService.listarRoles();
      setCatalogState(prev => ({...prev, availableRoles: response.data || []}));
    } catch (error) {
      console.error('Error loading roles:', error);
      setCatalogState(prev => ({...prev, roleError: 'Error al cargar la lista de roles'}));
    }
  };

  // Opciones para el selector de criterios
  const criterionOptions = useMemo(() => {
    return criteria.map(criterion => ({
      value: criterion.criterio_id.toString(),
      label: `${criterion.nomenclatura} - ${criterion.descripcion}`
    }));
  }, [criteria]);

  // Evidencias filtradas por criterio seleccionado
  const availableEvidences = useMemo(() => {
    if (!formData.criterio_id) return [];
    return evidences.filter(evidence => evidence.criterio_id === formData.criterio_id);
  }, [evidences, formData.criterio_id]);

  // Opciones para el MultiSelect de evidencias
  const evidenceOptions = useMemo((): MultiSelectOption[] => {
    return availableEvidences.map(evidence => ({
      value: evidence.evidencia_id.toString(),
      label: `${evidence.nomenclatura} - ${evidence.descripcion}`,
      disabled: false
    }));
  }, [availableEvidences]);

  // Opciones para usuarios
  const userOptions = useMemo(() => {
    return availableUsers.map(user => ({
      id: user.id,
      label: `${user.name} (${user.email})`,
      value: user.id.toString()
    }));
  }, [availableUsers]);

  // Opciones para roles
  const roleOptions = useMemo(() => {
    return availableRoles.map(role => ({
      id: role.id,
      label: role.name,
      value: role.id.toString(),
      metadata: `${userCountByRole[role.id] || 0} ${(userCountByRole[role.id] || 0) === 1 ? 'usuario' : 'usuarios'}`
    }));
  }, [availableRoles, userCountByRole]);

  // Handlers
  const handleCriterionChange = (value: string) => {
    updateFormData({
      criterio_id: parseInt(value),
      selectedEvidences: []
    });
  };

  const handleEvidenceChange = (selectedValues: string[]) => {
    const selectedIds = selectedValues.map(val => parseInt(val));
    updateFormData({ selectedEvidences: selectedIds });
  };

  const handleUserSelectionChange = (selectedUserIds: (string | number)[]) => {
    const numericIds = selectedUserIds.map(id => Number(id));
    updateFormData({ selectedUsers: numericIds });
  };

  const handleRoleSelectionChange = (selectedRoleIds: (string | number)[]) => {
    const numericIds = selectedRoleIds.map(id => Number(id));
    updateFormData({ selectedRoles: numericIds });
  };

  if (criteriaLoading || usersLoading) {
    return (
      <div className="relative py-12 min-h-[400px]">
        <LoadingSpinner variant="loader" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Error Messages */}
      {errors.proceso && (
        <div className="p-4 bg-rojo-una-2/10 border border-rojo-una-2/20 rounded-corner flex items-center gap-3">
          <SystemIcons.interface.alert size="md" className="text-rojo-una-2" />
          <span className="text-rojo-una-2">{errors.proceso}</span>
        </div>
      )}

      {errors.evidences && (
        <div className="p-4 bg-rojo-una-2/10 border border-rojo-una-2/20 rounded-corner flex items-center gap-3">
          <SystemIcons.interface.alert size="md" className="text-rojo-una-2" />
          <span className="text-rojo-una-2">{errors.evidences}</span>
        </div>
      )}

      {errors.destinatarios && (
        <div className="p-4 bg-rojo-una-2/10 border border-rojo-una-2/20 rounded-corner flex items-center gap-3">
          <SystemIcons.interface.alert size="md" className="text-rojo-una-2" />
          <span className="text-rojo-una-2">{errors.destinatarios}</span>
        </div>
      )}

      {/* Sección de Criterios y Evidencias */}
      {formData.proceso_id && (
        <>
          <div>
            <h3 className="text-base font-semibold text-negro-una mb-4">
              Criterios y Evidencias
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selector de Criterio */}
              <div>
                <CustomSelect
                  label="Criterio de Evaluación"
                  value={formData.criterio_id?.toString() || ''}
                  options={criterionOptions}
                  placeholder="Seleccione un criterio..."
                  onChange={handleCriterionChange}
                />
              </div>

              {/* Selección de Evidencias */}
              <div>
                <MultiSelect
                  label="Evidencias a asignar"
                  options={evidenceOptions}
                  value={formData.selectedEvidences.map(id => id.toString())}
                  onChange={handleEvidenceChange}
                  placeholder={formData.criterio_id ? "Seleccione evidencias..." : "Primero seleccione un criterio"}
                  required
                  selectAllText="Seleccionar todas"
                  deselectAllText="Deseleccionar todas"
                  showSelectAll={true}
                  disabled={!formData.criterio_id}
                />
              </div>
            </div>
          </div>

          {/* Sección de Destinatarios */}
          <div>
            <h3 className="text-base font-semibold text-negro-una mb-4">
              Destinatarios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selección de Usuarios */}
              <div>
                {userError ? (
                  <div className="mb-4">
                    <BackendErrorAlert
                      error={userError}
                      onRetry={async () => {
                        setCatalogState(prev => ({...prev, userError: null}));
                        await loadUsers();
                      }}
                    />
                  </div>
                ) : (
                  <MultiSelect
                    label="Usuarios"
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
                        setCatalogState(prev => ({...prev, roleError: null}));
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
          </div>
        </>
      )}
    </div>
  );
};
