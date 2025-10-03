/**
 * RolesEdit - Página para editar roles existentes en el sistema
 * 
 * Funcionalidades:
 * - Edición de roles con integración completa a la API
 * - Carga de datos del rol por ID desde la URL
 * - Manejo de errores y respuestas del backend
 * - Interfaz centrada y responsiva
 * - Redirección después de editar exitosamente
 * 
 * Integración:
 * - Usa RoleService para conectar con Laravel backend
 * - Reutiliza CreateRoleForm en modo edición
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreateRoleForm } from './Components/CreateRoleForm';
import { LoadingSpinner } from '@/components/Ui/Index';
import { ScreenContainer } from '@/Components/Ui/ScreenContainer';
import { useRoles } from '@/hooks/UseRoles';
import type { Role } from '@/Services/RoleService';

const RolesEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRoleById } = useRoles();
  
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del rol al montar el componente
  useEffect(() => {
    const loadRole = async () => {
      if (!id) {
        setError('ID de rol no válido');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const roleData = await getRoleById(parseInt(id));
        
        if (roleData) {
          setRole(roleData);
          setError(null);
        } else {
          setError('Rol no encontrado');
        }
      } catch (err) {
        console.error('Error al cargar rol:', err);
        setError('Error al cargar los datos del rol');
      } finally {
        setIsLoading(false);
      }
    };

    loadRole();
  }, [id, getRoleById]);

  /**
   * Maneja la actualización exitosa del rol
   */
  const handleEditRole = async (_roleData: any) => {
    // TODO: Agregar notificación toast
    // TODO: Redireccionar a la lista de roles
    navigate('/roles/listar');
  };

  /**
   * Maneja la cancelación de la edición
   */
  const handleCancel = () => {
    navigate('/roles/listar');
  };

  /**
   * Obtiene el título dinámico según el estado
   */
  const getPageTitle = (): string => {
    if (isLoading) return 'Cargando Rol...';
    if (error) return 'Error';
    if (!role) return 'Rol No Encontrado';
    return `Editar Rol: ${role.name}`;
  };

  /**
   * Obtiene la descripción dinámica según el estado
   */
  const getPageDescription = (): string => {
    if (isLoading) return 'Cargando la información del rol seleccionado';
    if (error) return 'Ha ocurrido un problema al cargar el rol';
    if (!role) return 'El rol solicitado no existe en el sistema';
    return 'Modifica la información del rol seleccionado y sus permisos asignados';
  };

  /**
   * Renderiza el contenido dinámico según el estado
   */
  const renderContent = () => {
    // Estado de carga
    if (isLoading) {
      return (
        <div className="text-center">
          <LoadingSpinner variant="bounce" size="lg" color="secondary" className="mx-auto mb-4 text-rojo-una" />
          <p className="text-rojo-una-2">Cargando datos del rol...</p>
        </div>
      );
    }

    // Estado de error
    if (error) {
      return (
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/roles/listar')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a la lista
          </button>
        </div>
      );
    }

    // Rol no encontrado
    if (!role) {
      return (
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Rol no encontrado</h2>
          <p className="text-gray-600 mb-6">El rol que está buscando no existe.</p>
          <button
            onClick={() => navigate('/roles/listar')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a la lista
          </button>
        </div>
      );
    }

    // Formulario de edición normal
    return (
      <CreateRoleForm
        initialData={role}
        onSubmit={handleEditRole}
        onCancel={handleCancel}
      />
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ScreenContainer
        title={getPageTitle()}
        description={getPageDescription()}
      >
        {renderContent()}
      </ScreenContainer>
    </div>
  );
};

export default RolesEdit;