/**
 * RolesCreatePage - Página para crear nuevos roles en el sistema
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
import { CreateRoleForm } from '../Components/Features/Roles/Index';
import { Modal } from '../Components/Ui/Modal';
import { useRoles } from '../Hooks/UseRoles';
import type { CreateRoleData } from '../Services/RoleService';

const RolesCreatePage: React.FC = () => {
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

  // Estado para controlar el reset del formulario (cambiar key para reset)
  const [formKey, setFormKey] = useState(0);

  /**
   * Maneja el intento de crear un nuevo rol (abre modal de confirmación)
   */
  const handleCreateRole = async (roleData: CreateRoleData) => {
    console.log('Intentando crear nuevo rol:', roleData);
    // En lugar de crear directamente, abrir modal de confirmación
    setCreateModalState({
      isOpen: true,
      roleData: roleData
    });
  };

  /**
   * Confirma y ejecuta la creación del rol
   */
  const handleConfirmCreate = async () => {
    if (!createModalState.roleData) return;
    
    try {
      // Usar el hook useRoles para crear el rol (con state management automático)
      const result = await createRole(createModalState.roleData);
      
      if (result) {
        console.log('Rol creado exitosamente:', result);
        // TODO: Integrar notificaciones toast
        
        // Limpiar formulario después de crear exitosamente
        setFormKey(prev => prev + 1); // Esto fuerza un reset del componente
      }
      
      // Cerrar modal
      setCreateModalState({ isOpen: false, roleData: null });
    } catch (error) {
      console.error('Error al crear el rol:', error);
      // TODO: Mostrar error al usuario
      // Cerrar modal incluso si hay error
      setCreateModalState({ isOpen: false, roleData: null });
    }
  };

  /**
   * Cancela la creación del rol
   */
  const handleCancelCreate = () => {
    setCreateModalState({ isOpen: false, roleData: null });
  };

  /**
   * Maneja la cancelación del formulario
   */
  const handleCancel = () => {
    console.log('Creación cancelada');
    // TODO: Implementar navegación de regreso
  };

  return (
    <>
      <div className="w-full flex justify-center py-6 px-4">
        <div className="w-full max-w-6xl">
          <CreateRoleForm 
            key={formKey} // Cambia para resetear el formulario
            onSubmit={handleCreateRole}
            onCancel={handleCancel}
            title="Crear Nuevo Rol"
            description="Crea roles del sistema SAAC-UNA"
            showHeader={true}
          />
        </div>
      </div>

      {/* Modal de confirmación de creación */}
      <Modal
        isOpen={createModalState.isOpen}
        onClose={handleCancelCreate}
        onConfirm={handleConfirmCreate}
        variant="info"
        title="Confirmar Creación de Rol"
        message={`¿Está seguro de que desea crear el rol "${createModalState.roleData?.name}"? Esta acción guardará el rol en el sistema.`}
        confirmLabel="Crear Rol"
        cancelLabel="Cancelar"
        size="md"
      />
    </>
  );
};

export default RolesCreatePage;