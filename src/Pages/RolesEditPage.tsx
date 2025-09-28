/**
 * RolesEditPage - Página para editar roles existentes en el sistema
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
import { CreateRoleForm } from '../Components/Features/Roles/Index';
import { PageHeader, LoadingSpinner } from '../Components/Ui/Index';
import { useRoles } from '../Hooks/UseRoles';
import type { Role } from '../Services/RoleService';

const RolesEditPage: React.FC = () => {
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
        } else {
          setError('Rol no encontrado');
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(`Error al cargar rol: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadRole();
  }, [id, getRoleById]);

  /**
   * Maneja la actualización exitosa del rol
   */
  const handleEditRole = async (roleData: any) => {
    console.log('Rol editado:', roleData);
    
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

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-6 px-4">
        <div className="w-full max-w-6xl">
          <div className="w-full bg-blanco-una-2 rounded-lg shadow-lg border border-gris-una/20 transition-all duration-300 min-h-fit">
            <div className="flex flex-col justify-center items-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Cargando datos del rol...</p>
              <p className="mt-2 text-sm text-gray-400">ID: {id}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center py-6 px-4">
        <div className="w-full max-w-6xl">
          <div className="w-full bg-blanco-una-2 rounded-lg shadow-lg border border-gris-una/20 transition-all duration-300 min-h-fit">
            <div className="p-6">
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error al cargar el rol</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                      >
                        Volver a la lista
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="w-full flex justify-center py-6 px-4">
        <div className="w-full max-w-6xl">
          <div className="w-full bg-blanco-una-2 rounded-lg shadow-lg border border-gris-una/20 transition-all duration-300 min-h-fit">
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">Rol no encontrado</h3>
                <p className="mt-2 text-sm text-gray-500">
                  El rol que intenta editar no existe o ha sido eliminado.
                </p>
                <button
                  onClick={handleCancel}
                  className="mt-4 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                >
                  Volver a la lista
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-6 px-4">
      <div className="w-full max-w-6xl">
        <div className="w-full bg-blanco-una-2 rounded-lg shadow-lg border border-gris-una/20 transition-all duration-300 min-h-fit">
          
          {/* Header con PageHeader */}
          <div className="p-6">
            <PageHeader
              title={`Editar Rol: ${role.name}`}
              description="Edición de roles del sistema"
              className="mb-0"
              forceLeftAlign={true}
            />
          </div>

          {/* Formulario sin header interno y sin contenedor adicional */}
          <div className="p-6 pt-0">
            <CreateRoleForm
              initialData={role}
              onSubmit={handleEditRole}
              onCancel={handleCancel}
              showHeader={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesEditPage;