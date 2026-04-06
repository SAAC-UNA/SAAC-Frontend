/**
 * EditUserPage - Página para editar roles y permisos de usuarios
 *
 * Funcionalidades:
 * - Detección automática del usuario por URL
 * - Carga automática de datos del usuario
 * - Interfaz similar a la edición de roles
 * - Manejo de estados de carga y errores
 * - Redirección después de operaciones exitosas
 *
 * Rutas compatibles:
 * - /usuarios/editar/:id -> Editar usuario
 */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EditUserForm } from "./Components/EditUserForm";
import {
  LoadingSpinner,
  BackendErrorAlert,
  ScreenContainer,
  PageHeader,
} from "@/components/Ui/Index";
import { EditConfirmationModal } from "@/Components/Ui/Modals/EditConfirmationModal";
import { SuccessModal } from "@/Components/Ui/Modals/SuccessModal";
import { userService } from "@/Services/UserService";
import type { User } from "@/Services/UserService";
import { getModuleInfoWithDynamicTitle } from "@/Constants/ModuleInfo";
import { LAYOUT } from "@/Constants/Layout";
import { useToast } from "@/Context/ToastContext";

const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Estados para el usuario
  const [userState, setUserState] = useState<{
    user: User | null;
    isLoadingUser: boolean;
    loadError: string | null;
  }>({ user: null, isLoadingUser: true, loadError: null });
  const user = userState.user;
  const isLoadingUser = userState.isLoadingUser;
  const loadError = userState.loadError;

  // Estado para el modal de confirmación
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    userData: { userId: number; roleName: string; userName: string } | null;
  }>({
    isOpen: false,
    userData: null,
  });

  // Estado para el modal de éxito
  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    userName: string;
  }>({
    isOpen: false,
    userName: "",
  });

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    loadUserData(id ? parseInt(id) : 0);
  }, [id]);

  /**
   * Cargar los datos del usuario
   */
  const loadUserData = async (userId: number) => {
    if (!userId) {
      setUserState({
        user: null,
        isLoadingUser: false,
        loadError: "ID de usuario no válido",
      });
      return;
    }
    setUserState((prev) => ({ ...prev, isLoadingUser: true, loadError: null }));

    try {
      // Aquí necesitaríamos un método getUserById en el UserService
      // Por ahora usaremos listUsers y filtraremos
      const users = await userService.listUsers();
      const userData = users.find((u) => u.id === userId);

      if (userData) {
        // Transformar de BackendUser a User si es necesario
        const transformedUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          status: userData.status,
          role: userData.roles[0]?.name,
          directPermissions:
            userData.direct_permissions?.map((p) => p.name) || [],
          allPermissions: userData.all_permissions || [],
          createdAt: new Date(userData.created_at),
          updatedAt: new Date(userData.updated_at),
        };

        setUserState((prev) => ({ ...prev, user: transformedUser }));
      } else {
        setUserState((prev) => ({
          ...prev,
          loadError: "Usuario no encontrado",
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error cargando usuario";
      setUserState((prev) => ({ ...prev, loadError: errorMessage }));
    } finally {
      setUserState((prev) => ({ ...prev, isLoadingUser: false }));
    }
  };

  /**
   * Manejar el envío del formulario - abrir modal de confirmación
   */
  const handleFormSubmit = (userData: {
    userId: number;
    roleName: string;
    userName: string;
  }) => {
    setConfirmModalState({
      isOpen: true,
      userData,
    });
  };

  /**
   * Confirmar la actualización del usuario
   */
  const confirmUpdate = async () => {
    if (confirmModalState.userData) {
      try {
        const { userId, roleName, userName } = confirmModalState.userData;
        await userService.assignUserRole(userId, roleName);

        // Cerrar modal de confirmación
        setConfirmModalState({ isOpen: false, userData: null });

        // Mostrar modal de éxito
        setSuccessModalState({
          isOpen: true,
          userName,
        });
      } catch (error) {
        console.error("Error al actualizar usuario:", error);
        showToast({
          type: "error",
          title: "Error al actualizar usuario",
          message:
            error instanceof Error
              ? error.message
              : "No se pudo asignar el rol al usuario",
        });
        // Cerrar modal de confirmación incluso si hay error
        setConfirmModalState({ isOpen: false, userData: null });
      }
    }
  };

  /**
   * Cancelar la confirmación
   */
  const cancelConfirmation = () => {
    setConfirmModalState({ isOpen: false, userData: null });
  };

  /**
   * Cerrar modal de éxito y volver a la lista
   */
  const handleSuccessModalClose = () => {
    setSuccessModalState({ isOpen: false, userName: "" });
    navigate("/usuarios/listar");
  };

  /**
   * Volver a la lista de usuarios
   */
  const handleCancel = () => {
    navigate("/usuarios/listar");
  };

  /**
   * Reintentar carga del usuario
   */
  const handleRetry = () => {
    if (id) {
      loadUserData(parseInt(id));
    }
  };

  // Estado de carga
  if (isLoadingUser) {
    return (
      <ScreenContainer>
        <div className="relative min-h-screen">
          <LoadingSpinner variant="loader" />
        </div>
      </ScreenContainer>
    );
  }

  // Estado de error
  if (loadError || !user) {
    return (
      <ScreenContainer>
        <BackendErrorAlert
          error={loadError || "Usuario no encontrado"}
          onRetry={handleRetry}
        />
      </ScreenContainer>
    );
  }

  // Obtener información del módulo dinámicamente
  const moduleInfo = getModuleInfoWithDynamicTitle("users", "edit", user.name);

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        breadcrumbMode="none"
        headerExtra={
          <div className="flex gap-4">
            <div className="text-right">
              <span className="block text-sm font-medium text-negro-una mb-2">
                Estado
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {user.status === "active" ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-sm font-medium text-negro-una mb-2">
                {user.role ? "Rol Actual" : "Roles Actuales"}
              </span>
              <div className="flex flex-wrap gap-2 justify-end">
                {user.role ? (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {user.role}
                  </div>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                    Sin rol asignado
                  </span>
                )}
              </div>
            </div>
          </div>
        }
      />

      {/* Layout que empuja botones al fondo cuando hay poco contenido */}
      <div className={LAYOUT.FORM_CONTAINER}>
        {/* Formulario de edición - crece para empujar botones */}
        <div className={LAYOUT.FLEX_GROW}>
          <EditUserForm
            user={user}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>

      {/* Modal de confirmación de edición */}
      <EditConfirmationModal
        isOpen={confirmModalState.isOpen}
        onClose={cancelConfirmation}
        onConfirm={confirmUpdate}
        itemName={confirmModalState.userData?.userName || ""}
        itemType="usuario"
      />

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModalState.isOpen}
        onClose={handleSuccessModalClose}
        title="Usuario Actualizado"
        message={`El usuario "${successModalState.userName}" ha sido actualizado correctamente.`}
      />
    </ScreenContainer>
  );
};

export default EditUserPage;
