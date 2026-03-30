/**
 * SelectionStep - Primer paso del wizard
 * Permite seleccionar multiples criterios, evidencias, usuarios y roles en una sola pantalla.
 */

import React, { useState, useEffect, useMemo } from "react";
import { LoadingSpinner, MultiSelect } from "@/Components/Ui/Index";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { BackendErrorAlert } from "@/Components/Ui/Feedback/BackendErrorAlert";
import type {
  EvidenceAssignmentFormData,
  ValidationErrors,
  Criterion,
  Evidence,
} from "@/Types/EvidenceAssignment";
import { evidenceAssignmentService } from "@/Services/EvidenceAssignmentService";
import { userService, type User } from "@/Services/UserService";
import { roleService, type Role } from "@/Services/RoleService";
import type { MultiSelectOption } from "@/Components/Ui/Forms/MultiSelect";

interface SelectionStepProps {
  formData: EvidenceAssignmentFormData;
  updateFormData: (updates: Partial<EvidenceAssignmentFormData>) => void;
  errors: ValidationErrors;
}

export const SelectionStep: React.FC<SelectionStepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  // Estados para criterios y evidencias
  const [criteriaState, setCriteriaState] = useState<{
    criteria: Criterion[];
    evidences: Evidence[];
    criteriaLoading: boolean;
  }>({ criteria: [], evidences: [], criteriaLoading: true });
  const criteria = criteriaState.criteria;
  const evidences = criteriaState.evidences;
  const criteriaLoading = criteriaState.criteriaLoading;

  // Estados para usuarios y roles
  const [catalogState, setCatalogState] = useState<{
    availableUsers: User[];
    availableRoles: Role[];
    usersLoading: boolean;
    userError: string | null;
    roleError: string | null;
    userCountByRole: Record<number, number>;
  }>({
    availableUsers: [],
    availableRoles: [],
    usersLoading: true,
    userError: null,
    roleError: null,
    userCountByRole: {},
  });
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
      setCriteriaState((prev) => ({ ...prev, criteriaLoading: true }));
      setCatalogState((prev) => ({ ...prev, usersLoading: true }));

      // Cargar criterios, evidencias, usuarios y roles en paralelo
      const [criteriaData, evidencesData] = await Promise.all([
        evidenceAssignmentService.getAllCriteria(),
        evidenceAssignmentService.getAllEvidences(),
      ]);

      setCriteriaState({
        criteria: criteriaData,
        evidences: evidencesData,
        criteriaLoading: false,
      });

      // Auto-seleccionar el primer proceso disponible
      const processesData = await evidenceAssignmentService.getAllProcesses();
      if (processesData.length > 0 && !formData.proceso_id) {
        updateFormData({
          proceso_id: processesData[0].proceso_id,
        });
      }

      // Cargar usuarios y roles
      await Promise.all([loadUsers(), loadRoles()]);

      setCatalogState((prev) => ({ ...prev, usersLoading: false }));
      setDataLoaded(true);
    } catch (error) {
      console.error("Error crítico cargando datos:", error);
      setCriteriaState((prev) => ({ ...prev, criteriaLoading: false }));
      setCatalogState((prev) => ({ ...prev, usersLoading: false }));
    }
  };

  const loadUsers = async () => {
    try {
      const users = await userService.listUsers();
      const transformedUsers: User[] = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status === "active" ? "active" : "inactive",
        role: user.roles?.[0]?.name,
      }));
      setCatalogState((prev) => ({
        ...prev,
        availableUsers: transformedUsers,
      }));
      calculateUserCountByRole(users);
    } catch (error) {
      console.error("Error loading users:", error);
      setCatalogState((prev) => ({
        ...prev,
        userError: "Error al cargar la lista de usuarios",
      }));
    }
  };

  const calculateUserCountByRole = (users: any[]) => {
    const countMap: Record<number, number> = {};
    users.forEach((user) => {
      if (user.roles && user.roles.length > 0) {
        user.roles.forEach((role: any) => {
          if (role.id) {
            countMap[role.id] = (countMap[role.id] || 0) + 1;
          }
        });
      }
    });
    setCatalogState((prev) => ({ ...prev, userCountByRole: countMap }));
  };

  const loadRoles = async () => {
    try {
      const response = await roleService.listarRoles();
      setCatalogState((prev) => ({
        ...prev,
        availableRoles: response.data || [],
      }));
    } catch (error) {
      console.error("Error loading roles:", error);
      setCatalogState((prev) => ({
        ...prev,
        roleError: "Error al cargar la lista de roles",
      }));
    }
  };

  // Opciones para el selector de criterios
  const criterionOptions = useMemo(() => {
    return criteria.map((criterion) => ({
      value: criterion.criterio_id.toString(),
      label: `${criterion.nomenclatura} - ${criterion.descripcion}`,
    }));
  }, [criteria]);

  const criterionById = useMemo(() => {
    return criteria.reduce<Record<number, Criterion>>((acc, criterion) => {
      acc[criterion.criterio_id] = criterion;
      return acc;
    }, {});
  }, [criteria]);

  // Evidencias filtradas por criterios seleccionados
  const availableEvidences = useMemo(() => {
    if (!formData.selectedCriteria?.length) return [];
    const selectedCriteriaSet = new Set(formData.selectedCriteria);
    return evidences.filter((evidence) =>
      selectedCriteriaSet.has(evidence.criterio_id),
    );
  }, [evidences, formData.selectedCriteria]);

  // Opciones para el MultiSelect de evidencias
  const evidenceOptions = useMemo((): MultiSelectOption[] => {
    return availableEvidences.map((evidence) => ({
      value: evidence.evidencia_id.toString(),
      label: `${evidence.nomenclatura} - ${evidence.descripcion}`,
      metadata:
        criterionById[evidence.criterio_id]?.nomenclatura ||
        `Criterio ${evidence.criterio_id}`,
      disabled: false,
    }));
  }, [availableEvidences, criterionById]);

  // Opciones para usuarios
  const userOptions = useMemo(() => {
    return availableUsers.map((user) => ({
      id: user.id,
      label: `${user.name} (${user.email})`,
      value: user.id.toString(),
    }));
  }, [availableUsers]);

  // Opciones para roles
  const roleOptions = useMemo(() => {
    return availableRoles.map((role) => ({
      id: role.id,
      label: role.name,
      value: role.id.toString(),
      metadata: `${userCountByRole[role.id] || 0} ${(userCountByRole[role.id] || 0) === 1 ? "usuario" : "usuarios"}`,
    }));
  }, [availableRoles, userCountByRole]);

  // Handlers
  const handleCriteriaChange = (selectedValues: string[]) => {
    const selectedCriteria = selectedValues.map((val) => parseInt(val, 10));
    const selectedCriteriaSet = new Set(selectedCriteria);
    const filteredSelectedEvidences = formData.selectedEvidences.filter(
      (evidenceId) => {
        const evidence = evidences.find(
          (item) => item.evidencia_id === evidenceId,
        );
        return evidence ? selectedCriteriaSet.has(evidence.criterio_id) : false;
      },
    );

    updateFormData({
      criterio_id: selectedCriteria.length > 0 ? selectedCriteria[0] : null,
      selectedCriteria,
      selectedEvidences: filteredSelectedEvidences,
    });
  };

  const handleEvidenceChange = (selectedValues: string[]) => {
    const selectedIds = selectedValues.map((val) => parseInt(val));
    updateFormData({ selectedEvidences: selectedIds });
  };

  const handleUserSelectionChange = (selectedUserIds: (string | number)[]) => {
    const numericIds = selectedUserIds.map((id) => Number(id));
    updateFormData({ selectedUsers: numericIds });
  };

  const handleRoleSelectionChange = (selectedRoleIds: (string | number)[]) => {
    const numericIds = selectedRoleIds.map((id) => Number(id));
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
      <div className="relative overflow-hidden rounded-corner border border-azul-una/15 bg-gradient-to-r from-azul-una/5 via-blanco-una to-info/5 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-negro-una">
              Selección de criterios
            </h3>
            <p className="text-sm text-gris-una mt-1">
              Puede elegir varios criterios a la vez y asignar evidencias en
              bloque.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-corner bg-blanco-una px-3 py-2 border border-gris-una/15 text-center">
              <p className="text-xs text-gris-una">Criterios</p>
              <p className="text-lg font-semibold text-azul-una">
                {formData.selectedCriteria.length}
              </p>
            </div>
            <div className="rounded-corner bg-blanco-una px-3 py-2 border border-gris-una/15 text-center">
              <p className="text-xs text-gris-una">Evidencias</p>
              <p className="text-lg font-semibold text-info">
                {formData.selectedEvidences.length}
              </p>
            </div>
            <div className="rounded-corner bg-blanco-una px-3 py-2 border border-gris-una/15 text-center">
              <p className="text-xs text-gris-una">Destinatarios</p>
              <p className="text-lg font-semibold text-rojo-una-2">
                {formData.selectedUsers.length + formData.selectedRoles.length}
              </p>
            </div>
          </div>
        </div>
      </div>

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
          <div className="rounded-corner border border-gris-una/20 bg-blanco-una p-5 shadow-sm">
            <h3 className="text-base font-semibold text-negro-una mb-4 flex items-center gap-2">
              <SystemIcons.work.assignEvidence
                size="sm"
                className="text-azul-una"
              />
              Criterios y Evidencias
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selector multiple de Criterios */}
              <div>
                <MultiSelect
                  label="Criterios de Evaluación"
                  options={criterionOptions}
                  value={formData.selectedCriteria.map((id) => id.toString())}
                  onChange={handleCriteriaChange}
                  placeholder="Seleccione uno o varios criterios..."
                  required
                  selectAllText="Seleccionar todos"
                  deselectAllText="Deseleccionar todos"
                  showSelectAll={true}
                />
                <p className="mt-2 text-xs text-gris-una">
                  Seleccione multiples criterios para habilitar la asignacion
                  masiva de evidencias.
                </p>
              </div>

              {/* Selección de Evidencias */}
              <div>
                <MultiSelect
                  label="Evidencias a asignar"
                  options={evidenceOptions}
                  value={formData.selectedEvidences.map((id) => id.toString())}
                  onChange={handleEvidenceChange}
                  placeholder={
                    formData.selectedCriteria.length > 0
                      ? "Seleccione evidencias..."
                      : "Primero seleccione al menos un criterio"
                  }
                  required
                  selectAllText="Seleccionar todas"
                  deselectAllText="Deseleccionar todas"
                  showSelectAll={true}
                  disabled={formData.selectedCriteria.length === 0}
                />
                <p className="mt-2 text-xs text-gris-una">
                  Mostrando {availableEvidences.length} evidencias de{" "}
                  {formData.selectedCriteria.length}{" "}
                  {formData.selectedCriteria.length === 1
                    ? "criterio seleccionado"
                    : "criterios seleccionados"}
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Sección de Destinatarios */}
          <div className="rounded-corner border border-gris-una/20 bg-blanco-una p-5 shadow-sm">
            <h3 className="text-base font-semibold text-negro-una mb-4 flex items-center gap-2">
              <SystemIcons.users.user size="sm" className="text-rojo-una-2" />
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
                        setCatalogState((prev) => ({
                          ...prev,
                          userError: null,
                        }));
                        await loadUsers();
                      }}
                    />
                  </div>
                ) : (
                  <MultiSelect
                    label="Usuarios"
                    options={userOptions}
                    value={formData.selectedUsers.map((id) => id.toString())}
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
                        setCatalogState((prev) => ({
                          ...prev,
                          roleError: null,
                        }));
                        await loadRoles();
                      }}
                    />
                  </div>
                ) : (
                  <MultiSelect
                    label="Roles"
                    options={roleOptions}
                    value={formData.selectedRoles.map((id) => id.toString())}
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
