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
import React, { useState, useEffect, useMemo } from "react";
import {
  Input,
  CustomSelect,
  Button,
  LoadingSpinner,
  BackendErrorAlert,
} from "@/components/Ui/Index";
import { roleService } from "@/Services/RoleService";
import { useCareers } from "@/Hooks/UseCareers";
import { useCampuses } from "@/Hooks/UseCampuses";
import { resolveOrCreateCareerCampus } from "@/Services/CareerService";
import type { User } from "@/Services/UserService";
import type { Role, BackendPermission } from "@/Services/RoleService";
import type { SelectOption } from "@/Components/Ui/Forms/SingleSelect";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { useAuth } from "@/Context/AuthContext";

interface EditUserFormProps {
  user: User;
  onSubmit?: (userData: {
    userId: number;
    roleName: string;
    userName: string;
    careerSedeIds: number[];
    careersChanged: boolean;
  }) => void;
  onCancel?: () => void;
  /** Ref para que el padre dispare el submit externamente */
  submitRef?: React.MutableRefObject<(() => void) | null>;
  /** Ocultar los botones internos (cuando se usa dentro de un modal) */
  hideButtons?: boolean;
  /** Notifica al padre si hay cambios pendientes */
  onHasChangesChange?: (hasChanges: boolean) => void;
}

export const EditUserForm: React.FC<EditUserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  submitRef,
  hideButtons = false,
  onHasChangesChange,
}) => {
  const { canAccess } = useAuth();
  const canAssignCareers = canAccess({
    requireAnyPermissions: ["usuarios.assign", "usuarios.approve"],
  });

  // Estados para roles
  const [rolesState, setRolesState] = useState<{
    roles: Role[];
    isLoadingRoles: boolean;
    error: string | null;
  }>({ roles: [], isLoadingRoles: true, error: null });
  const roles = rolesState.roles;
  const isLoadingRoles = rolesState.isLoadingRoles;
  const error = rolesState.error;

  // Estado del formulario
  const [formState, setFormState] = useState<{
    selectedRole: string;
    previewPermissions: string[] | BackendPermission[];
    hasChanges: boolean;
  }>({ selectedRole: "", previewPermissions: [], hasChanges: false });
  const selectedRole = formState.selectedRole;
  const previewPermissions = formState.previewPermissions;
  const hasChanges = formState.hasChanges;
  const isSaving = false;

  // Par en construcción (antes de agregarlo a la lista)
  const [pendingCarrera, setPendingCarrera] = useState("");
  const [pendingSede, setPendingSede] = useState("");

  // Lista de pares { carrera_id, sede_id } asignados al usuario
  const [assignedPairs, setAssignedPairs] = useState<{ carrera_id: number; sede_id: number }[]>([]);
  const [initialPairs, setInitialPairs] = useState<{ carrera_id: number; sede_id: number }[]>([]);

  const { careers, isLoading: loadingCareers } = useCareers();
  const { campuses, isLoading: loadingCampuses } = useCampuses();

  // Cargar roles al montar el componente
  useEffect(() => {
    loadRoles();
  }, []);

  // Establecer rol actual del usuario
  useEffect(() => {
    if (roles.length > 0 && user.role) {
      const currentRole = roles.find((role) => role.name === user.role);
      if (currentRole) {
        setFormState((prev) => ({ ...prev, selectedRole: currentRole.name }));
        updatePermissionsPreview(currentRole.name);
      }
    }
  }, [roles, user.role]);

  // Pre-seleccionar pares actuales del usuario
  useEffect(() => {
    if (user.careers && user.careers.length > 0) {
      const pairs = user.careers.map((c) => ({ carrera_id: c.carrera_id, sede_id: c.sede_id }));
      setAssignedPairs(pairs);
      setInitialPairs(pairs);
    }
  }, [user.careers]);

  // Detectar cambios (rol o carreras)
  useEffect(() => {
    const roleHasChanged = selectedRole !== "" && selectedRole !== user.role;
    const pairsStr = (p: { carrera_id: number; sede_id: number }[]) =>
      JSON.stringify([...p].sort((a, b) => a.carrera_id - b.carrera_id || a.sede_id - b.sede_id));
    const careersHaveChanged = canAssignCareers && pairsStr(assignedPairs) !== pairsStr(initialPairs);
    const anyChange = roleHasChanged || careersHaveChanged;
    setFormState((prev) => ({ ...prev, hasChanges: anyChange }));
    onHasChangesChange?.(anyChange);
  }, [selectedRole, user.role, assignedPairs, initialPairs, canAssignCareers]);

  // Exponer handleSubmit via ref para que el padre lo dispare
  useEffect(() => {
    if (submitRef) {
      submitRef.current = () => handleSubmit();
    }
  });

  /**
   * Cargar roles disponibles
   */
  const loadRoles = async () => {
    setRolesState((prev) => ({ ...prev, isLoadingRoles: true, error: null }));

    try {
      const response = await roleService.listarRoles();
      if (response.data) {
        setRolesState({
          roles: response.data,
          isLoadingRoles: false,
          error: null,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error cargando roles";
      setRolesState((prev) => ({
        ...prev,
        isLoadingRoles: false,
        error: errorMessage,
      }));
    }
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async () => {
    if (!selectedRole) {
      setRolesState((prev) => ({ ...prev, error: "Debe seleccionar un rol" }));
      return;
    }

    // Resolver cada par carrera+sede a su carrera_sede_id
    const careerSedeIds: number[] = [];
    if (canAssignCareers && assignedPairs.length > 0) {
      for (const pair of assignedPairs) {
        const id = await resolveOrCreateCareerCampus(pair.carrera_id, pair.sede_id);
        careerSedeIds.push(id);
      }
    }

    const careersChanged =
      canAssignCareers &&
      (() => {
        const pairsStr = (p: { carrera_id: number; sede_id: number }[]) =>
          JSON.stringify([...p].sort((a, b) => a.carrera_id - b.carrera_id || a.sede_id - b.sede_id));
        return pairsStr(assignedPairs) !== pairsStr(initialPairs);
      })();

    onSubmit?.({
      userId: user.id,
      roleName: selectedRole,
      userName: user.name,
      careerSedeIds,
      careersChanged,
    });
  };

  /**
   * Actualizar vista previa de permisos basado en rol seleccionado
   */
  const updatePermissionsPreview = (roleName: string) => {
    if (!roleName) {
      setFormState((prev) => ({ ...prev, previewPermissions: [] }));
      return;
    }

    const role = roles.find((r) => r.name === roleName);
    if (role) {
      setFormState((prev) => ({
        ...prev,
        previewPermissions: role.permissions,
      }));
    } else {
      setFormState((prev) => ({ ...prev, previewPermissions: [] }));
    }
  };

  /**
   * Manejar cambio en la selección de rol
   */
  const handleRoleChange = (newRole: string) => {
    setFormState((prev) => ({ ...prev, selectedRole: newRole }));
    updatePermissionsPreview(newRole);
  };

  /**
   * Preparar opciones para el CustomSelect
   */
  const roleOptions: SelectOption[] = roles.map((role) => ({
    value: role.name,
    label: role.description ? `${role.name}` : role.name,
  }));

  // Opciones de carrera (activas)
  const careerOptions: SelectOption[] = useMemo(
    () =>
      careers
        .filter((c) => c.activo)
        .map((c) => ({ value: String(c.carrera_id), label: c.nombre })),
    [careers],
  );

  // Universidad de la carrera seleccionada en el par pendiente
  const selectedCareerUniversidadId = useMemo(() => {
    if (!pendingCarrera) return null;
    return careers.find((c) => c.carrera_id === Number(pendingCarrera))?.universidad_id ?? null;
  }, [pendingCarrera, careers]);

  // Sedes filtradas por universidad de la carrera pendiente
  const campusOptions: SelectOption[] = useMemo(
    () =>
      selectedCareerUniversidadId === null
        ? []
        : campuses
            .filter((s) => s.universidad_id === selectedCareerUniversidadId)
            .map((s) => ({ value: String(s.sede_id), label: s.nombre })),
    [selectedCareerUniversidadId, campuses],
  );

  // Label de un par para mostrarlo en la lista
  const pairLabel = (pair: { carrera_id: number; sede_id: number }) => {
    const c = careers.find((x) => x.carrera_id === pair.carrera_id);
    const s = campuses.find((x) => x.sede_id === pair.sede_id);
    return `${c?.nombre ?? pair.carrera_id} — ${s?.nombre ?? pair.sede_id}`;
  };

  const handleAddPair = () => {
    if (!pendingCarrera || !pendingSede) return;
    const newPair = { carrera_id: Number(pendingCarrera), sede_id: Number(pendingSede) };
    const duplicate = assignedPairs.some(
      (p) => p.carrera_id === newPair.carrera_id && p.sede_id === newPair.sede_id,
    );
    if (!duplicate) {
      setAssignedPairs((prev) => [...prev, newPair]);
    }
    setPendingCarrera("");
    setPendingSede("");
  };

  const handleRemovePair = (idx: number) => {
    setAssignedPairs((prev) => prev.filter((_, i) => i !== idx));
  };

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
                setRolesState((prev) => ({ ...prev, error: null }));
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
            <h3
              className={`${TYPOGRAPHY.pageSubtitle} font-semibold text-negro-una-2 mb-6`}
            >
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
                    <LoadingSpinner 
                    variant="loader"
                    size="sm"
                    />
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
                    label={`Permisos del rol (${previewPermissions.length})`}
                    options={previewPermissions.map((permission, index) => ({
                      value: index.toString(),
                      label:
                        typeof permission === "string"
                          ? permission
                          : permission.label,
                    }))}
                    value="" // Sin valor seleccionado
                    readonly={true}
                    className="w-full"
                  />
                  <p className={`mt-2 ${TYPOGRAPHY.form.helper} text-warning`}>
                    Los permisos son propios del rol y no pueden modificarse
                    desde aquí.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha: Estado/Rol y Datos del usuario */}
          <div>
            {/* Título de sección - alineado con subtítulo izquierdo */}
            <h3
              className={`${TYPOGRAPHY.pageSubtitle} font-semibold text-negro-una-2 mb-6`}
            >
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

        {/* Sección carrera-sede — ancho completo, solo si tiene permiso */}
        {canAssignCareers && (
          <div className="mt-6 pt-6 border-t border-gris-light">
            <h3
              className={`${TYPOGRAPHY.pageSubtitle} font-semibold text-negro-una-2 mb-6`}
            >
              Asignación de Sede-Carrera
            </h3>

            {/* Selector de par pendiente */}
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-45">
                <CustomSelect
                  label="Carrera"
                  options={careerOptions}
                  value={pendingCarrera}
                  onChange={(v) => { setPendingCarrera(v); setPendingSede(""); }}
                  placeholder="Seleccionar carrera..."
                  disabled={loadingCareers}
                />
              </div>
              <div className="flex-1 min-w-45">
                <CustomSelect
                  label="Sede"
                  options={campusOptions}
                  value={pendingSede}
                  onChange={setPendingSede}
                  placeholder={pendingCarrera ? "Seleccionar sede..." : "Primero seleccione carrera"}
                  disabled={!pendingCarrera || loadingCampuses}
                />
              </div>
              <div className="pb-0.5">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleAddPair}
                  disabled={!pendingCarrera || !pendingSede}
                >
                  Agregar
                </Button>
              </div>
            </div>

            {/* Lista de pares asignados */}
            {assignedPairs.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {assignedPairs.map((pair, idx) => (
                  <li
                    key={`${pair.carrera_id}-${pair.sede_id}`}
                    className="flex items-center justify-between rounded-lg border border-gris-light bg-blanco-una-2 px-4 py-2"
                  >
                    <span className={`${TYPOGRAPHY.body} text-negro-una-2`}>
                      {loadingCareers || loadingCampuses ? "Cargando..." : pairLabel(pair)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePair(idx)}
                      className="ml-3 text-error hover:text-error/70 transition-colors"
                      aria-label="Eliminar par"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`mt-3 ${TYPOGRAPHY.form.helper} text-gris-una-2`}>
                No hay sede-carreras asignadas.
              </p>
            )}

            <p className={`mt-2 ${TYPOGRAPHY.form.helper} text-warning`}>
              El usuario solo verá información de las sede-carreras asignadas.
            </p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      {!hideButtons && (
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
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
