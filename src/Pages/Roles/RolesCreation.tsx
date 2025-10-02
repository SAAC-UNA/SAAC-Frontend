/**
 * RolesCreation - Página para crear nuevos roles en el sistema
 * 
 * Funcionalidades:
 * - Creación de roles con integración completa a la API
 * - Manejo de errores y respuestas del backend
 * - Interfaz centrada y responsiva
 * - State management con actualizaciones automáticas
 * 
 * Integración:
 * - Usa useRoles hook para state management
 * - Consume CreateRoleForm para la interfaz
 */
import React, { useState } from 'react';
import { CreateRoleForm } from './Components/CreateRoleForm';
import { Modal } from '@/components/Ui/Modal';
import { useRoles } from '@/hooks/UseRoles';
import type { CreateRoleData } from '@/Services/RoleService';

const RolesCreation: React.FC = () => {
  // Hook de roles para state management
  const { createRole } = useRoles();

  // Estado para el modal de confirmación de creación
  const [createModalState, setCreateModalState] = useState<{
    isOpen: boolean;
    roleData: CreateRoleData | null;
  }>({
    isOpen: false,
    roleData: null
  });

  /**
   * Maneja la confirmación de creación antes de enviar al backend
   */
  const handleRoleSubmit = (roleData: CreateRoleData) => {
    setCreateModalState({
      isOpen: true,
      roleData
    });
  };

  /**
   * Confirma la creación del rol y envía al backend
   */
  const confirmCreateRole = async () => {
    if (createModalState.roleData) {
      try {
        const result = await createRole(createModalState.roleData);
        
        if (result) {
          // Cerrar modal
          setCreateModalState({ isOpen: false, roleData: null });
          
          // TODO: Agregar notificación toast
          
          // TODO: Redireccionar a la lista de roles
          window.location.href = '/roles/listar';
        }
      } catch (error) {
        // TODO: Mostrar error al usuario
        console.error('Error al crear rol:', error);
      }
    }
  };

  /**
   * Cancela la creación del rol
   */
  const cancelCreateRole = () => {
    setCreateModalState({ isOpen: false, roleData: null });
  };

  /**
   * Cancela todo el proceso y regresa
   */
  const handleCancel = () => {
    // TODO: Implementar navegación de regreso
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <CreateRoleForm
          onSubmit={handleRoleSubmit}
          onCancel={handleCancel}
        />
      </div>

      {/* Modal de confirmación de creación */}
      <Modal
        isOpen={createModalState.isOpen}
        onClose={cancelCreateRole}
        title="Confirmar Creación de Rol"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Está seguro de que desea crear el rol <strong>"{createModalState.roleData?.name}"</strong>?
          </p>
          
          {createModalState.roleData?.description && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Descripción:</strong> {createModalState.roleData.description}
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={cancelCreateRole}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmCreateRole}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Rol
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RolesCreation;