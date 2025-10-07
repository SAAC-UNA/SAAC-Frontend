/**
 * useUsers - Hook simplificado para gestión básica de usuarios
 *
 * Funcionalidades esenciales:
 * - Estado de usuarios, loading y errores
 * - Cargar usuarios
 * - Activar/desactivar usuarios
 */

import { useState, useCallback } from 'react';
import type { User } from '@/Services/UserService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar lista de usuarios
   */
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Descomentar cuando el backend esté listo
      // const response = await userService.listarUsuarios();
      // if (response.data) {
      //   setUsers(response.data);
      // }

      // DATOS QUEMADOS PARA PRUEBAS - Remover cuando backend esté listo
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay de red

      const dummyUsers: User[] = [
        {
          id: 1,
          name: 'Ian Villegas',
          email: 'ian.villegas.jimenez@una.ac.cr',
          status: 'active',
          role: 'Administrador',
          directPermissions: ['usuarios.view', 'usuarios.edit', 'evidencias.view'],
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-10-01')
        },
        {
          id: 2,
          name: 'María García',
          email: 'maria.garcia@una.ac.cr',
          status: 'active',
          role: 'Profesor',
          directPermissions: ['evidencias.view', 'evidencias.create'],
          createdAt: new Date('2024-02-20'),
          updatedAt: new Date('2024-09-15')
        },
        {
          id: 3,
          name: 'Carlos López',
          email: 'carlos.lopez@una.ac.cr',
          status: 'inactive',
          role: 'Estudiante',
          directPermissions: ['evidencias.view'],
          createdAt: new Date('2024-03-10'),
          updatedAt: new Date('2024-08-30')
        },
        {
          id: 4,
          name: 'Ana Rodríguez',
          email: 'ana.rodriguez@una.ac.cr',
          status: 'active',
          role: 'Coordinador',
          directPermissions: ['evidencias.view', 'evidencias.edit', 'reportes.generate'],
          createdAt: new Date('2024-04-05'),
          updatedAt: new Date('2024-09-20')
        },
        {
          id: 5,
          name: 'José Martínez',
          email: 'jose.martinez@una.ac.cr',
          status: 'inactive',
          role: 'Profesor',
          directPermissions: ['evidencias.view'],
          createdAt: new Date('2024-05-12'),
          updatedAt: new Date('2024-07-18')
        }
      ];

      setUsers(dummyUsers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar usuarios';
      setError(errorMessage);
      console.error('Error en loadUsers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Activar un usuario
   */
  const activarUsuario = useCallback(async (userId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Descomentar cuando el backend esté listo
      // const response = await userService.activarUsuario(userId);
      // if (response.data) {
      //   setUsers(prevUsers =>
      //     prevUsers.map(user =>
      //       user.id === userId ? response.data! : user
      //     )
      //   );
      // }
      // return response;

      // SIMULACIÓN PARA PRUEBAS - Remover cuando backend esté listo
      await new Promise(resolve => setTimeout(resolve, 500));

      // Actualizar el estado del usuario en el estado local
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, status: 'active' as const } : user
        )
      );

      console.log(`Usuario ${userId} activado exitosamente (simulado)`);
      return { message: 'Usuario activado exitosamente' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al activar usuario';
      setError(errorMessage);
      console.error('Error en activarUsuario:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Desactivar un usuario
   */
  const desactivarUsuario = useCallback(async (userId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Descomentar cuando el backend esté listo
      // const response = await userService.desactivarUsuario(userId);
      // if (response.data) {
      //   setUsers(prevUsers =>
      //     prevUsers.map(user =>
      //       user.id === userId ? response.data! : user
      //     )
      //   );
      // }
      // return response;

      // SIMULACIÓN PARA PRUEBAS - Remover cuando backend esté listo
      await new Promise(resolve => setTimeout(resolve, 500));

      // Actualizar el estado del usuario en el estado local
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, status: 'inactive' as const } : user
        )
      );

      console.log(`Usuario ${userId} desactivado exitosamente (simulado)`);
      return { message: 'Usuario desactivado exitosamente' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al desactivar usuario';
      setError(errorMessage);
      console.error('Error en desactivarUsuario:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    isLoading,
    error,
    loadUsers,
    activarUsuario,
    desactivarUsuario,
  };
};