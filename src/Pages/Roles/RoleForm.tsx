/**
 * RoleForm - Componente unificado para crear y editar roles
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
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreateRoleForm } from './Components/CreateRoleForm';
import { LoadingSpinner, Button, BackendErrorAlert, ScreenContainer, PageHeader } from '@/components/Ui/Index';
import { CreateConfirmationModal } from '@/Components/Ui/Modals/CreateConfirmationModal';
import { EditConfirmationModal } from '@/Components/Ui/Modals/EditConfirmationModal';
import { SuccessModal } from '@/Components/Ui/Modals/SuccessModal';
import { useRoles } from '@/hooks/UseRoles';
import { getModuleInfoWithDynamicTitle } from '@/Constants/ModuleInfo';
import { LAYOUT } from '@/Constants/Layout';
import type { CreateRoleData, Role } from '@/Services/RoleService';

/**
 * Función auxiliar para truncar texto y agregar puntos suspensivos
 */
const truncateText = (text: string, maxLength: number = 25): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
};

const RoleForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createRole, getRoleById, editRole } = useRoles();
  
  // Determinar el modo basado en la presencia del ID
  const isEditing = !!id;
  
  // Estados para el rol (solo en modo edición)
  const [role, setRole] = useState<Role | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Estado para detectar cambios en el formulario
  const [hasChanges, setHasChanges] = useState(false);

  // Estado para el modal de confirmación
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    roleData: CreateRoleData | null;
  }>({
    isOpen: false,
    roleData: null
  });

  // Estado para el modal de éxito
  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    roleName: string;
    isEditing: boolean;
  }>({
    isOpen: false,
    roleName: '',
    isEditing: false
  });

  /**
   * Cargar datos del rol en modo edición
   */
  useEffect(() => {
    if (isEditing && id) {
      const loadRole = async () => {
        try {
          setIsLoadingRole(true);
          const roleData = await getRoleById(parseInt(id));
          
          if (roleData) {
            setRole(roleData);
            setLoadError(null);
          } else {
            setLoadError('Rol no encontrado');
          }
        } catch (err) {
          console.error('Error al cargar rol:', err);
          setLoadError('Error al cargar los datos del rol');
        } finally {
          setIsLoadingRole(false);
        }
      };

      loadRole();
    }
  }, [id, isEditing, getRoleById]);

  /**
   * Obtiene la información del módulo según el modo
   */
  const getModuleInfo = () => {
    const action = isEditing ? 'edit' : 'create';
    const itemName = role?.name;
    return getModuleInfoWithDynamicTitle('roles', action, itemName);
  };

  /**
   * Maneja el envío del formulario (crear o editar)
   */
  const handleFormSubmit = (roleData: CreateRoleData) => {
    setConfirmModalState({
      isOpen: true,
      roleData
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
            isEditing: isEditing
          });
        }
      } catch (error) {
        // TODO: Mostrar error al usuario
        console.error(`Error al ${isEditing ? 'editar' : 'crear'} rol:`, error);
        // Cerrar modal de confirmación incluso si hay error
        setConfirmModalState({ isOpen: false, roleData: null });
      }
    }
  };

  /**
   * Maneja el cierre del modal de éxito y redirecciona
   */
  const handleSuccessModalClose = () => {
    setSuccessModalState({ isOpen: false, roleName: '', isEditing: false });
    navigate('/roles/listar');
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
    navigate('/roles/listar');
  };

  /**
   * Obtiene el texto del botón según el modo
   */
  const getButtonText = () => {
    return isEditing ? 'Guardar' : 'Crear';
  };

  /**
   * Renderiza el contenido según el estado
   */
  const renderContent = () => {
    // Estado de carga del rol (solo en modo edición)
    if (isLoadingRole) {
      return <LoadingSpinner variant='loader' />;
    }

    // Estado de error al cargar rol (solo en modo edición)
    if (loadError) {
      return (
        <ScreenContainer>
          <BackendErrorAlert
            error={loadError}
            onRetry={() => window.location.reload()}
          />
        </ScreenContainer>
      );
    }

    // Rol no encontrado (solo en modo edición)
    if (isEditing && !role) {
      return (
        <BackendErrorAlert
          error="El rol que está buscando no existe o ha sido eliminado."
          onRetry={() => navigate('/roles/listar')}
        />
      );
    }

    // Formulario normal
    const moduleInfo = getModuleInfo();
    
    return (
      <ScreenContainer>
        <PageHeader
          title={moduleInfo.title}
          description={moduleInfo.description}
        />
        
        {/* Layout que empuja botones al fondo cuando hay poco contenido */}
        <div className={LAYOUT.FORM_CONTAINER}>
          <div className={LAYOUT.FLEX_GROW}>
            {/* Contenido del formulario */}
            <CreateRoleForm
              initialData={isEditing && role ? role : undefined}
              onSubmit={handleFormSubmit}
              hideButtons={true}
              onHasChangesChange={setHasChanges}
            />
          </div>  {/* Cierre de LAYOUT.FLEX_GROW */}
        
          {/* Línea divisoria inferior */}
          <hr className="border-0 border-t border-gris-una/20 mx-6 mt-6 mb-6" />
          
          {/* Botones de acción */}
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
                // Trigger form submission
                const form = document.querySelector('form');
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
        </div>  {/* Cierre de LAYOUT.FORM_CONTAINER */}
      </ScreenContainer>
    );
  };

  return (
    <>
      {renderContent()}

      {/* Modal de confirmación - Crear */}
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

      {/* Modal de confirmación - Editar */}
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

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModalState.isOpen}
        title={successModalState.isEditing ? '¡Rol editado exitosamente!' : '¡Rol creado exitosamente!'}
        message={successModalState.isEditing 
          ? `El rol "${truncateText(successModalState.roleName)}" ha sido modificado correctamente` 
          : `El rol "${truncateText(successModalState.roleName)}" ha sido agregado correctamente`
        }
        onClose={handleSuccessModalClose}
        autoClose={true}
      />
    </>
  );
};

export default RoleForm;