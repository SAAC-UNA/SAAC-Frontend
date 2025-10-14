/**
 * AuthMock - Mock temporal de autenticación
 * TODO: Reemplazar con LDAP cuando esté implementado
 */

export interface MockUser {
  usuario_id: number;
  cedula: string;
  nombre: string;
  email: string;
  roles: Array<{
    id: number;
    name: string;
  }>;
  careers: Array<{
    carrera_id: number;
    nombre: string;
    facultad_id: number;
  }>;
}

/**
 * Usuarios mock para desarrollo
 * Basados en el seeder del backend
 */
export const MOCK_USERS: Record<string, MockUser> = {
  '101010101': {
    usuario_id: 1,
    cedula: '101010101',
    nombre: 'Pablo Castillo Quesada',
    email: 'pablo.castillo.quesada@una.cr',
    roles: [{ id: 1, name: 'SuperUsuario' }],
    careers: [] // SuperUsuario ve todas las carreras
  },
  '203948609': {
    usuario_id: 2,
    cedula: '203948609',
    nombre: 'Cristopher Montero Jimenez',
    email: 'cristopher.montero.jimenez@una.ac.cr',
    roles: [{ id: 2, name: 'Administrador' }],
    careers: [
      {
        carrera_id: 1,
        nombre: 'Ingeniería',
        facultad_id: 1
      }
    ]
  },
  '202038940': {
    usuario_id: 3,
    cedula: '202038940',
    nombre: 'Ian Villegas Jimenez',
    email: 'ian.villegas.jimenez@est.una.ac.cr',
    roles: [{ id: 2, name: 'Administrador' }],
    careers: [
      {
        carrera_id: 2,
        nombre: 'Educación',
        facultad_id: 1
      }
    ]
  }
};

/**
 * Simular login con cédula y contraseña
 * Cualquier contraseña funciona (es mock)
 */
export const mockLogin = (cedula: string, password: string): MockUser | null => {
  // Buscar usuario por cédula
  const user = MOCK_USERS[cedula];
  
  if (!user) {
    return null; // Usuario no encontrado
  }
  
  // En mock, cualquier contraseña funciona
  // TODO: Cuando se integre LDAP, aquí se validará la contraseña real
  if (password.length === 0) {
    return null; // Contraseña vacía no válida
  }
  
  return user;
};

/**
 * Verificar si el usuario es SuperUsuario
 */
export const isSuperUser = (user: MockUser): boolean => {
  return user.roles.some(role => role.name === 'SuperUsuario');
};

/**
 * Verificar si el usuario es Administrador
 */
export const isAdmin = (user: MockUser): boolean => {
  return user.roles.some(role => role.name === 'Administrador');
};