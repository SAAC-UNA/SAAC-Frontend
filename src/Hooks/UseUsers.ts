/**
 * useUsers - Hook simplificado para gestión básica de usuarios
 *
 * Funcionalidades esenciales:
 * - Estado de usuarios, loading y errores
 * - Cargar usuarios
 * - Activar/desactivar usuarios
 */

import { useState, useCallback } from "react";
import {
  userService,
  type User,
  type BackendUser,
  type CreateUserFromLdapPayload,
} from "@/Services/UserService";

/**
 * Transforma los datos de usuario del backend al formato del frontend
 */
const transformBackendUser = (backendUser: BackendUser): User => {
  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    status: backendUser.status,
    role: backendUser.roles[0]?.name,
    careers: backendUser.careers || [],
    directPermissions: backendUser.direct_permissions?.map((p) => p.name) || [],
    allPermissions: backendUser.all_permissions || [],
    createdAt: new Date(backendUser.created_at),
    updatedAt: new Date(backendUser.updated_at),
  };
};

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
      // Usar el servicio real del backend
      const backendUsers = (await userService.listUsers()) as BackendUser[];
      const transformedUsers = backendUsers.map(transformBackendUser);
      setUsers(transformedUsers);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar usuarios";
      setError(errorMessage);
      console.error("Error en loadUsers:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Crear un usuario desde LDAP y asignarle un rol inicial
   */
  const crearUsuarioDesdeLdap = useCallback(
    async (payload: CreateUserFromLdapPayload): Promise<User> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await userService.createUserFromLdap(payload);
        if (!response.data) {
          throw new Error("No se recibieron datos del usuario creado");
        }

        const createdUser = transformBackendUser(response.data);
        setUsers((prevUsers) => [createdUser, ...prevUsers]);
        return createdUser;
      } catch (err) {
        console.error("Error en crearUsuarioDesdeLdap:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Activar un usuario
   */
  const activarUsuario = useCallback(async (userId: number) => {
    setIsLoading(true);
    setError(null);

    // Actualización optimista ANTES de la llamada
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: "active" as const } : user,
      ),
    );

    try {
      // Usar el servicio real del backend
      const response = await userService.activateUser(userId);
      console.log(`Usuario ${userId} activado exitosamente`);
      return response;
    } catch (err) {
      // Revertir cambio optimista en caso de error
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: "inactive" as const } : user,
        ),
      );

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al activar usuario";
      setError(errorMessage);
      console.error("Error en activarUsuario:", err);
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

    // Actualización optimista ANTES de la llamada
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: "inactive" as const } : user,
      ),
    );

    try {
      // Usar el servicio real del backend
      const response = await userService.deactivateUser(userId);
      console.log(`Usuario ${userId} desactivado exitosamente`);
      return response;
    } catch (err) {
      // Revertir cambio optimista en caso de error
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: "active" as const } : user,
        ),
      );

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al desactivar usuario";
      setError(errorMessage);
      console.error("Error en desactivarUsuario:", err);
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
    crearUsuarioDesdeLdap,
    activarUsuario,
    desactivarUsuario,
  };
};
