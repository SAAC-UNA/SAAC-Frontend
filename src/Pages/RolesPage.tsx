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
import React from 'react';
import { CreateRoleForm } from '../Components/Features/Roles/Index';
import { roleService } from '../Services/RoleService';

const RolesCreatePage: React.FC = () => {
  /**
   * Maneja la creación de un nuevo rol
   * Integra con la API mediante RoleService
   */
  const handleCreateRole = async (roleData: any) => {
    console.log('Nuevo rol creado:', roleData);
    
    try {
      // Llamada a la API Laravel mediante RoleService
      const response = await roleService.crearRol(roleData);
      
      if (response.datos) {
        console.log('Rol creado exitosamente:', response.datos);
        // TODO: Integrar notificaciones toast
        // TODO: Redirigir a lista de roles
      }
    } catch (error) {
      console.error('Error al crear el rol:', error);
      // TODO: Mostrar error al usuario
    }
  };

  /**
   * Maneja la cancelación del formulario
   */
  const handleCancel = () => {
    console.log('Creación cancelada');
    // TODO: Implementar navegación de regreso
  };

  return (
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
  );
};

export default RolesCreatePage;