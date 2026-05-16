import React, { useEffect, useMemo, useState } from "react";
import { EntityFormModal } from "@/Components/Ui/Modals/EntityFormModal";
import { Input, CustomSelect, LoadingSpinner } from "@/components/Ui/Index";
import { roleService } from "@/Services/RoleService";
import type { Role } from "@/Services/RoleService";
import type {
  CreateUserFromLdapPayload,
  User,
} from "@/Services/UserService";
import type { SelectOption } from "@/Components/Ui/Forms/SingleSelect";
import { TYPOGRAPHY } from "@/Constants/Typography";

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: CreateUserFromLdapPayload) => Promise<User>;
  onCreated: (user: User) => void;
}

export const UserCreateModal: React.FC<UserCreateModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  onCreated,
}) => {
  const [cedula, setCedula] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCedula("");
      setSelectedRole("");
      setError(null);
      return;
    }

    let isMounted = true;
    const loadRoles = async () => {
      setRolesLoading(true);
      setError(null);

      try {
        const response = await roleService.listarRoles();
        if (isMounted) {
          setRoles(response.data ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Error al cargar roles",
          );
        }
      } finally {
        if (isMounted) {
          setRolesLoading(false);
        }
      }
    };

    loadRoles();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const roleOptions = useMemo<SelectOption[]>(
    () =>
      roles
        .filter((role) => role.is_active)
        .map((role) => ({
          value: role.name,
          label: role.name,
        })),
    [roles],
  );

  const normalizedCedula = cedula.trim();
  const cedulaError =
    normalizedCedula && !/^\d{9}$/.test(normalizedCedula)
      ? "La cedula debe contener exactamente 9 digitos."
      : undefined;

  const confirmDisabled =
    rolesLoading ||
    isSubmitting ||
    !normalizedCedula ||
    !selectedRole ||
    Boolean(cedulaError);

  const handleConfirm = async () => {
    if (confirmDisabled) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const createdUser = await onCreate({
        cedula: normalizedCedula,
        role: selectedRole,
      });
      onCreated(createdUser);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear el usuario desde LDAP",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EntityFormModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Agregar Usuario"
      subtitle="Buscar en LDAP por cedula"
      confirmLabel="Agregar"
      confirmDisabled={confirmDisabled}
      confirmLoading={isSubmitting}
      size="md"
      maxHeight="auto"
    >
      <div className="space-y-5">
        {error && (
          <div
            className={`${TYPOGRAPHY.form.helper} rounded-lg border border-error/30 bg-error-light px-4 py-3 text-error`}
          >
            {error}
          </div>
        )}

        <Input
          label="Cedula"
          value={cedula}
          onChange={(event) => setCedula(event.target.value)}
          error={cedulaError}
          maxLength={9}
          required
        />

        {rolesLoading ? (
          <div className="relative min-h-24">
            <LoadingSpinner variant="loader" size="sm" />
          </div>
        ) : (
          <CustomSelect
            label="Rol"
            value={selectedRole}
            options={roleOptions}
            onChange={setSelectedRole}
            placeholder="Seleccionar rol..."
            required
            searchable
          />
        )}

        <p className={`${TYPOGRAPHY.form.helper} text-gris-una-2`}>
          El usuario se registrara con los datos de LDAP. Si el rol requiere
          contexto de carrera-sede, se abrira la edicion al finalizar.
        </p>
      </div>
    </EntityFormModal>
  );
};
