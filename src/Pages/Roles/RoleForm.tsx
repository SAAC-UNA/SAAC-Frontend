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
import { LoadingSpinner, Button, PageErrorState } from '@/components/Ui/Index';
import { CreateConfirmationModal } from '@/Components/Ui/CreateConfirmationModal';
import { EditConfirmationModal } from '@/Components/Ui/EditConfirmationModal';
import { SuccessModal } from '@/Components/Ui/SuccessModal';
import { useRoles } from '@/hooks/UseRoles';
import { MODULE_INFO } from '@/Constants/ModuleInfo';
import type { CreateRoleData, Role } from '@/Services/RoleService';

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
    if (isEditing) {
      return {
        title: role ? `Editar Rol: ${role.name}` : 'Editar Rol',
        description: 'Modifica la información del rol seleccionado y sus permisos asignados'
      };
    }
    return MODULE_INFO.roles_create;
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
      return (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gris-una">Cargando información del rol...</p>
        </div>
      );
    }

    // Estado de error al cargar rol (solo en modo edición)
    if (loadError) {
      return (
        <PageErrorState
          title="Error al cargar rol"
          description={loadError}
          primaryActionLabel="Volver a la lista"
          onPrimaryAction={() => navigate('/roles/listar')}
          secondaryActionLabel="Reintentar"
          onSecondaryAction={() => window.location.reload()}
        />
      );
    }

    // Rol no encontrado (solo en modo edición)
    if (isEditing && !role) {
      return (
        <PageErrorState
          title="Rol no encontrado"
          description="El rol que está buscando no existe o ha sido eliminado."
          primaryActionLabel="Volver a la lista"
          onPrimaryAction={() => navigate('/roles/listar')}
        />
      );
    }

    // Formulario normal
    const moduleInfo = getModuleInfo();
    
    return (
      <div className="w-full bg-blanco-una-2 rounded-lg shadow-lg border border-gris-una/20 transition-all duration-300 min-h-fit max-w-7xl mx-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 lg:p-6">
          <h1 className="font-bold text-negro-una mb-2 text-xl lg:text-2xl">
            {moduleInfo.title}
          </h1>
          <p className="text-gris-una text-sm lg:text-base">
            {moduleInfo.description}
          </p>
        </div>
        
        {/* Línea divisoria superior */}
        <hr className="border-0 border-t border-gris-una/20 mx-6" />
        
        {/* Contenido del formulario */}
        <div className="p-4 sm:p-5 lg:p-6">
          <CreateRoleForm
            initialData={isEditing && role ? role : undefined}
            onSubmit={handleFormSubmit}
            hideButtons={true}
          />
        </div>
        
        {/* Línea divisoria inferior */}
        <hr className="border-0 border-t border-gris-una/20 mx-6" />
        
        {/* Botones de acción */}
        <div className="p-4 sm:p-5 lg:p-6">
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              modalButton={true}
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
              modalButton={true}
              size="sm"
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
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
          description={confirmModalState.roleData?.description}
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
          description={confirmModalState.roleData?.description}
        />
      )}

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModalState.isOpen}
        title={successModalState.isEditing ? '¡Rol editado exitosamente!' : '¡Rol creado exitosamente!'}
        message={successModalState.isEditing 
          ? `El rol "${successModalState.roleName}" ha sido modificado correctamente` 
          : `El rol "${successModalState.roleName}" ha sido agregado correctamente`
        }
        onClose={handleSuccessModalClose}
        autoClose={true}
        autoCloseDelay={3000}
      />
    </div>
  );
};

export default RoleForm;