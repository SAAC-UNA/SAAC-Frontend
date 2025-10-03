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
import { Modal } from '@/Components/Ui/Modal';
import { Button } from '@/Components/Ui/Button';
import { useRoles } from '@/Hooks/UseRoles';
import { MODULE_INFO } from '@/Constants/ModuleInfo';
import type { CreateRoleData } from '@/Services/RoleService';

const RolesCreation: React.FC = () => {
  // Hook de roles para state management
  const { createRole } = useRoles();

  // Obtener información del módulo desde ModuleInfo
  const moduleInfo = MODULE_INFO.roles_create;

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
    <div className="container mx-auto px-4 py-8">
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
            onSubmit={handleRoleSubmit}
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
              Crear
            </Button>
          </div>
        </div>
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
              Crear
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RolesCreation;