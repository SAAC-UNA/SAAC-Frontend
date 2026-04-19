/**
 * RoleFormPage - Componente unificado para crear y editar roles
 *
 * Funcionalidades:
 * - Detección automática del modo (crear/editar) por URL
 * - Carga automática de datos del rol si está editando
 * - Interfaz unificada con título y botones dinámicos
 * - Manejo de estados de carga y errores
 * - Redirección después de operaciones exitosas
 *
 * Rutas compatibles:
 * - /roles/crear -> Modo crear
 * - /roles/editar/:id -> Modo editar
 */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RoleForm as RoleFormComponent } from "./Components/RoleForm";
import { Button, ScreenContainer, PageHeader } from "@/components/Ui/Index";
import { CreateConfirmationModal } from "@/Components/Ui/Modals/CreateConfirmationModal";
import { EditConfirmationModal } from "@/Components/Ui/Modals/EditConfirmationModal";
import { SuccessModal } from "@/Components/Ui/Modals/SuccessModal";
import { useRoles } from "@/hooks/UseRoles";
import { getModuleInfoWithDynamicTitle } from "@/Constants/ModuleInfo";
import { LAYOUT } from "@/Constants/Layout";
import type { CreateRoleData, Role } from "@/Services/RoleService";
import { useToast } from "@/Context/ToastContext";

/**
 * Función auxiliar para truncar texto y agregar puntos suspensivos
 */
const truncateText = (text: string, maxLength: number = 25): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + "...";
};

const RoleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { createRole, getRoleById, editRole } = useRoles();

  // Determinar el modo basado en la presencia del ID
  const isEditing = !!id;

  // Estados para el rol (solo en modo edición)
  const [roleState, setRoleState] = useState<{
    role: Role | null;
    loading: boolean;
    error: string | null;
  }>({ role: null, loading: isEditing, error: null });
  const role = roleState.role;

  // Estado para detectar cambios en el formulario
  const [hasChanges, setHasChanges] = useState(false);

  // Estado para el modal de confirmación
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    roleData: CreateRoleData | null;
  }>({
    isOpen: false,
    roleData: null,
  });

  // Estado para el modal de éxito
  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    roleName: string;
    isEditing: boolean;
  }>({
    isOpen: false,
    roleName: "",
    isEditing: false,
  });

  /**
   * Cargar datos del rol en modo edición
   */
  useEffect(() => {
    if (isEditing && id) {
      const loadRole = async () => {
        try {
          const roleData = await getRoleById(parseInt(id));
          setRoleState({
            role: roleData || null,
            loading: false,
            error: roleData ? null : "Rol no encontrado",
          });
        } catch (err) {
          console.error("Error al cargar rol:", err);
          setRoleState({
            role: null,
            loading: false,
            error: "Error al cargar los datos del rol",
          });
        }
      };

      loadRole();
    }
  }, [id, isEditing, getRoleById]);

  const moduleInfo = (() => {
    const action = isEditing ? "edit" : "create";
    const itemName = role?.name;
    return getModuleInfoWithDynamicTitle("roles", action, itemName);
  })();

  /**
   * Maneja el envío del formulario (crear o editar)
   */
  const handleFormSubmit = (roleData: CreateRoleData) => {
    setConfirmModalState({
      isOpen: true,
      roleData,
    });
  };

  /**
   * Confirma la operación (crear o editar)
   */
  const confirmOperation = async () => {
    if (confirmModalState.roleData) {
      try {
        let result;

        if (isEditing && role) {
          // Modo edición
          result = await editRole(role.id, confirmModalState.roleData);
        } else {
          // Modo creación
          result = await createRole(confirmModalState.roleData);
        }

        if (result) {
          // Cerrar modal de confirmación
          setConfirmModalState({ isOpen: false, roleData: null });

          // Mostrar modal de éxito
          setSuccessModalState({
            isOpen: true,
            roleName: confirmModalState.roleData.name,
            isEditing: isEditing,
          });
        }
      } catch (error) {
        showToast({
          type: "error",
          title: `Error al ${isEditing ? "editar" : "crear"} rol`,
          message:
            error instanceof Error
              ? error.message
              : "Ocurrió un error inesperado",
        });
        // Cerrar modal de confirmación incluso si hay error
        setConfirmModalState({ isOpen: false, roleData: null });
      }
    }
  };

  /**
   * Maneja el cierre del modal de éxito y redirecciona
   */
  const handleSuccessModalClose = () => {
    setSuccessModalState({ isOpen: false, roleName: "", isEditing: false });
    navigate("/roles/listar");
  };

  /**
   * Cancela la operación
   */
  const cancelOperation = () => {
    setConfirmModalState({ isOpen: false, roleData: null });
  };

  /**
   * Maneja la cancelación del formulario
   */
  const handleCancel = () => {
    navigate("/roles/listar");
  };

  /**
   * Obtiene el texto del botón según el modo
   */
  const getButtonText = () => {
    return isEditing ? "Guardar" : "Crear";
  };

  return (
    <>
      <ScreenContainer>
        <PageHeader
          title={moduleInfo.title}
          description={moduleInfo.description}
          breadcrumbMode="none"
        />
        <div className={LAYOUT.FORM_CONTAINER}>
          <div className={LAYOUT.FLEX_GROW}>
            <RoleFormComponent
              initialData={isEditing && role ? role : undefined}
              onSubmit={handleFormSubmit}
              hideButtons={true}
              onHasChangesChange={setHasChanges}
            />
          </div>
          <hr className="border-0 border-t border-gris-una/20 mx-6 mt-6 mb-6" />
          <div className="px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5 lg:pb-6">
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                standardWidth={true}
                size="sm"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  const form = document.querySelector("form");
                  if (form) {
                    form.requestSubmit();
                  }
                }}
                disabled={!hasChanges}
                standardWidth={true}
                size="sm"
              >
                {getButtonText()}
              </Button>
            </div>
          </div>
        </div>
      </ScreenContainer>

      {!isEditing && (
        <CreateConfirmationModal
          isOpen={confirmModalState.isOpen}
          onClose={cancelOperation}
          onConfirm={confirmOperation}
          title="Confirmar Creación de Rol"
          itemName={confirmModalState.roleData?.name}
          itemType="rol"
          confirmLabel="Crear"
          variant="success"
        />
      )}

      {isEditing && (
        <EditConfirmationModal
          isOpen={confirmModalState.isOpen}
          onClose={cancelOperation}
          onConfirm={confirmOperation}
          title="Confirmar Edición de Rol"
          itemName={confirmModalState.roleData?.name}
          itemType="rol"
          confirmLabel="Guardar"
          variant="warning"
        />
      )}

      <SuccessModal
        isOpen={successModalState.isOpen}
        title={
          successModalState.isEditing
            ? "¡Rol editado exitosamente!"
            : "¡Rol creado exitosamente!"
        }
        message={
          successModalState.isEditing
            ? `El rol "${truncateText(successModalState.roleName)}" ha sido modificado correctamente`
            : `El rol "${truncateText(successModalState.roleName)}" ha sido agregado correctamente`
        }
        onClose={handleSuccessModalClose}
        autoClose={true}
      />
    </>
  );
};

export default RoleFormPage;
