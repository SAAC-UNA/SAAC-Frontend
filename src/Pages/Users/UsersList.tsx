/**
 * UsersRepository - Página principal de listado de usuarios
 *
 * Esta página coordina el componente UsersTable y maneja la navegación
 * entre las diferentes acciones (crear, editar, eliminar).
 */

import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { UsersTable } from "./Components/UsersTable";
import { Button, PageHeader, ScreenContainer } from "@/Components/Ui/Index";
import { SearchInput } from "@/Components/Ui/Forms/SearchInput";
import { UserEditModal } from "./Components/UserEditModal";
import { UserCreateModal } from "./Components/UserCreateModal";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { ICON_SIZES } from "@/Constants/Components";

// Lazy load de modales para mejor rendimiento
const UserDetailsModal = lazy(() =>
  import("./Components/UserDetailsModal").then((m) => ({
    default: m.UserDetailsModal,
  })),
);
const SuccessModal = lazy(() =>
  import("@/Components/Ui/Modals/SuccessModal").then((m) => ({
    default: m.SuccessModal,
  })),
);
import { Modal } from "@/Components/Ui/Modals/Modal";
import { getContextualInfo } from "@/Constants/ModuleInfo";
import { useUsers } from "@/Hooks/UseUsers";
import { useToast } from "@/Context/ToastContext";
import { useAuth } from "@/Context/AuthContext";
import type { User } from "@/Services/UserService";

const ROLES_WITHOUT_REQUIRED_CAREER_SCOPE = new Set([
  "profesor",
  "docente",
  "superusuario",
]);

const requiresCareerScopeAfterCreate = (roleName?: string) => {
  if (!roleName) return true;
  return !ROLES_WITHOUT_REQUIRED_CAREER_SCOPE.has(roleName.toLowerCase());
};

const UsersRepository: React.FC = () => {
  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = getContextualInfo("users", "list");
  const { showToast } = useToast();
  const { canAccess } = useAuth();
  const canCreateUsers = canAccess({
    requireAnyPermissions: ["usuarios.create"],
  });

  // Estado para búsqueda
  const [searchQuery, setSearchQuery] = useState("");

  // Usar el hook de usuarios
  const {
    activarUsuario,
    desactivarUsuario,
    isLoading,
    users,
    loadUsers,
    error,
    crearUsuarioDesdeLdap,
  } = useUsers();

  // Estado para el modal de detalles del usuario
  const [userDetailsModalState, setUserDetailsModalState] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null,
  });

  // Estado para el modal de confirmación de cambio de estado
  const [stateChangeModalState, setStateChangeModalState] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null,
  });

  // Estado para el modal de éxito
  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    userName: string;
    action: "activate" | "deactivate";
  }>({
    isOpen: false,
    userName: "",
    action: "activate",
  });

  // Estado para el modal de edición de usuario
  const [userEditModalState, setUserEditModalState] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({ isOpen: false, user: null });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleEditUser = useCallback((user: User) => {
    setUserEditModalState({ isOpen: true, user });
  }, []);

  const handleCreatedUser = useCallback(
    async (createdUser: User) => {
      setIsCreateModalOpen(false);
      await loadUsers();

      showToast({
        type: "success",
        title: "Usuario creado",
        message: `El usuario "${createdUser.name}" fue creado desde LDAP.`,
      });

      if (requiresCareerScopeAfterCreate(createdUser.role)) {
        setUserEditModalState({ isOpen: true, user: createdUser });
        showToast({
          type: "info",
          title: "Asignar carrera-sede",
          message:
            "Este rol necesita alcance institucional. Asigne la carrera-sede antes de finalizar.",
        });
      }
    },
    [loadUsers, showToast],
  );

  const handleViewUser = useCallback((user: User) => {
    setUserDetailsModalState({
      isOpen: true,
      user,
    });
  }, []);

  const closeUserDetailsModal = useCallback(() => {
    setUserDetailsModalState({ isOpen: false, user: null });
  }, []);

  const handleChangeState = useCallback((user: User) => {
    setStateChangeModalState({
      isOpen: true,
      user,
    });
  }, []);

  const confirmStateChange = async () => {
    if (!stateChangeModalState.user) return;

    const user = stateChangeModalState.user;
    const isActivating = user.status === "inactive";

    try {
      if (user.status === "active") {
        await desactivarUsuario(user.id);
      } else {
        await activarUsuario(user.id);
      }

      // Cerrar modal de confirmación
      setStateChangeModalState({ isOpen: false, user: null });

      // Mostrar modal de éxito
      setSuccessModalState({
        isOpen: true,
        userName: user.name,
        action: isActivating ? "activate" : "deactivate",
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Error al cambiar estado",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo cambiar el estado del usuario",
      });
      // En caso de error, solo cerrar el modal de confirmación
      setStateChangeModalState({ isOpen: false, user: null });
    }
  };

  const closeStateChangeModal = useCallback(() => {
    setStateChangeModalState({ isOpen: false, user: null });
  }, []);

  const closeSuccessModal = useCallback(() => {
    setSuccessModalState({ isOpen: false, userName: "", action: "activate" });
  }, []);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        breadcrumbMode="none"
        headerExtra={
          <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto">
            <SearchInput
              placeholder="Buscar usuarios..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-full sm:w-72"
            />
            {canCreateUsers && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Agregar
              </Button>
            )}
          </div>
        }
      ></PageHeader>

      <UsersTable
        onViewUser={handleViewUser}
        onEdit={handleEditUser}
        onState={handleChangeState}
        users={users}
        isLoading={isLoading}
        error={error}
        searchQuery={searchQuery}
      />

      {/* Modal de detalles del usuario */}
      <Suspense fallback={null}>
        <UserDetailsModal
          isOpen={userDetailsModalState.isOpen}
          onClose={closeUserDetailsModal}
          user={userDetailsModalState.user}
        />
      </Suspense>

      {/* Modal de confirmación para activación */}
      {stateChangeModalState.user?.status === "inactive" && (
        <Modal
          isOpen={stateChangeModalState.isOpen}
          onClose={closeStateChangeModal}
          onConfirm={confirmStateChange}
          title="Confirmar activación de usuario"
          variant="success"
          confirmLabel="Sí, activar"
          cancelLabel="Cancelar"
          confirmLoading={isLoading}
          showCancel
          showConfirm
        >
          <p className="text-sm text-gris-una-2 leading-relaxed">
            ¿Está seguro de que desea activar al usuario{" "}
            <strong>"{stateChangeModalState.user?.name}"</strong>?
          </p>
          <p className="mt-2 text-sm text-gris-una-2">
            Al activar este usuario, podrá acceder al sistema con sus
            credenciales.
          </p>
        </Modal>
      )}

      {/* Modal de confirmación para inactivación */}
      {stateChangeModalState.user?.status === "active" && (
        <Modal
          isOpen={stateChangeModalState.isOpen}
          onClose={closeStateChangeModal}
          onConfirm={confirmStateChange}
          title="Confirmar inactivación de usuario"
          variant="success"
          confirmLabel="Sí, inactivar"
          cancelLabel="Cancelar"
          confirmLoading={isLoading}
          showCancel
          showConfirm
          footerMeta="Esta acción puede ser revertida en el futuro"
        >
          <p className="text-sm text-gris-una-2 leading-relaxed">
            ¿Está seguro de que desea inactivar al usuario{" "}
            <strong>"{stateChangeModalState.user?.name}"</strong>?
          </p>
          <p className="mt-2 text-sm text-gris-una-2">
            Al inactivar este usuario, se revocará su acceso al sistema.
          </p>
        </Modal>
      )}

      {/* Modal de éxito */}
      <Suspense fallback={null}>
        <SuccessModal
          isOpen={successModalState.isOpen}
          onClose={closeSuccessModal}
          title={
            successModalState.action === "activate"
              ? "Usuario activado"
              : "Usuario inactivado"
          }
          message={
            successModalState.action === "activate"
              ? `El usuario "${successModalState.userName}" ha sido activado correctamente.`
              : `El usuario "${successModalState.userName}" ha sido inactivado correctamente.`
          }
        />
      </Suspense>

      {/* Modal de creacion de usuario */}
      <UserCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={crearUsuarioDesdeLdap}
        onCreated={handleCreatedUser}
      />

      {/* Modal de edicion de usuario */}
      <UserEditModal
        isOpen={userEditModalState.isOpen}
        onClose={() => setUserEditModalState({ isOpen: false, user: null })}
        user={userEditModalState.user}
        onSuccess={() => {
          loadUsers();
          setUserEditModalState({ isOpen: false, user: null });
        }}
      />
    </ScreenContainer>
  );
};

export default UsersRepository;
