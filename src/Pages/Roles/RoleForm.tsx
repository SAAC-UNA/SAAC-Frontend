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
import { LoadingSpinner, Button } from '@/components/Ui/Index';
import { Modal } from '@/Components/Ui/Modal';
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
          // Cerrar modal
          setConfirmModalState({ isOpen: false, roleData: null });
          
          // TODO: Agregar notificación toast
          
          // Redireccionar a la lista de roles
          navigate('/roles/listar');
        }
      } catch (error) {
        // TODO: Mostrar error al usuario
        console.error(`Error al ${isEditing ? 'editar' : 'crear'} rol:`, error);
      }
    }
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
    return isEditing ? 'Guardar Cambios' : 'Crear';
  };

  /**
   * Obtiene el título del modal según el modo
   */
  const getModalTitle = () => {
    return isEditing ? 'Confirmar Edición de Rol' : 'Confirmar Creación de Rol';
  };

  /**
   * Obtiene el mensaje del modal según el modo
   */
  const getModalMessage = () => {
    const action = isEditing ? 'guardar los cambios en' : 'crear';
    return `¿Está seguro de que desea ${action} el rol "${confirmModalState.roleData?.name}"?`;
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
        <div className="text-center py-12">
          <div className="text-[var(--text-error)] mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-negro-una mb-2">Error</h2>
          <p className="text-gris-una mb-6">{loadError}</p>
          <Button
            variant="primary"
            onClick={() => navigate('/roles/listar')}
            size="sm"
          >
            Volver a la lista
          </Button>
        </div>
      );
    }

    // Rol no encontrado (solo en modo edición)
    if (isEditing && !role) {
      return (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-negro-una mb-2">Rol no encontrado</h2>
          <p className="text-gris-una mb-6">El rol que está buscando no existe.</p>
          <Button
            variant="primary"
            onClick={() => navigate('/roles/listar')}
            size="sm"
          >
            Volver a la lista
          </Button>
        </div>
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

      {/* Modal de confirmación */}
      <Modal
        isOpen={confirmModalState.isOpen}
        onClose={cancelOperation}
        title={getModalTitle()}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {getModalMessage()}
          </p>
          
          {confirmModalState.roleData?.description && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Descripción:</strong> {confirmModalState.roleData.description}
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={cancelOperation}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmOperation}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoleForm;