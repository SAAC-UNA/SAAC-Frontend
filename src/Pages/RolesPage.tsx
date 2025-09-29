/**
 * RolesCreatePage - Página para crear nuevos roles en el sistema
 * 
 * Funcionalidades:
 * - Creación de roles con integración completa a la API
 * - Manejo de errores y respuestas del backend
 * - Interfaz centrada y responsiva
 * - TODO Pendiente: Notificaciones toast y redirección
 * 
 * Integración:
 * - Usa RoleService para conectar con Laravel backend
 * - Consume CreateRoleForm para la interfaz
 */
import React, { useState } from 'react';
import { CreateRoleForm } from '../Components/Features/Roles/Index';
import { Modal } from '../Components/Ui/Modal';
import { roleService } from '../Services/RoleService';

const RolesCreatePage: React.FC = () => {
  // Estado para el modal de confirmación de creación
  const [createModalState, setCreateModalState] = useState<{
    isOpen: boolean;
    roleData: any;
  }>({
    isOpen: false,
    roleData: null
  });

  /**
   * Maneja el intento de crear un nuevo rol (abre modal de confirmación)
   */
  const handleCreateRole = async (roleData: any) => {
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
      // Llamada a la API Laravel mediante RoleService
      const response = await roleService.crearRol(createModalState.roleData);
      
      if (response.data) {
        console.log('Rol creado exitosamente:', response.data);
        // TODO: Integrar notificaciones toast
        // TODO: Redirigir a lista de roles
        
        // Limpiar formulario después de crear exitosamente
        // Esto se puede hacer recargando la página o usando un ref al formulario
        window.location.reload(); // Temporal - mejor sería usar state management
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