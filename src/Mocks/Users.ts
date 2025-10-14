/**
 * Usuarios mock para pruebas de autenticación
 * Basados en el seeder del backend
 */

export interface MockRole {
  id: number;
  name: string;
}

export interface MockCareer {
  carrera_id: number;
  nombre: string;
  facultad_id: number;
}

export interface MockUser {
  usuario_id: number;
  cedula: string;
  nombre: string;
  email: string;
  password: string; // Solo para mock
  roles: MockRole[];
  careers: MockCareer[];
}

export const MOCK_USERS: MockUser[] = [
  {
    usuario_id: 1,
    cedula: '101010101',
    nombre: 'Pablo Castillo Quesada',
    email: 'pablo.castillo.quesada@una.cr',
    password: 'password', // La contraseña real la maneja el backend
    roles: [
      {
        id: 1,
        name: 'SuperUsuario'
      }
    ],
    careers: [] // SuperUsuario NO tiene carreras asignadas (ve todas)
  },
  {
    usuario_id: 2,
    cedula: '203948609',
    nombre: 'Cristopher Montero Jimenez',
    email: 'cristopher.montero.jimenez@una.cr',
    password: 'password', // La contraseña real la maneja el backend
    roles: [
      {
        id: 2,
        name: 'Administrador'
      }
    ],
    careers: [
      {
        carrera_id: 1,
        nombre: 'Ingeniería en Sistemas',
        facultad_id: 1
      }
    ]
  },
  {
    usuario_id: 3,
    cedula: '202038940',
    nombre: 'Ian Villegas Jimenez',
    email: 'ian.villegas.jimenez@una.cr',
    password: 'password', // La contraseña real la maneja el backend
    roles: [
      {
        id: 2,
        name: 'Administrador'
      }
    ],
    careers: [
      {
        carrera_id: 2,
        nombre: 'Educación',
        facultad_id: 2
      }
    ]
  }
];

// Helper para buscar usuario por credenciales
export const findUserByCredentials = (email: string, password: string): MockUser | undefined => {
  return MOCK_USERS.find(
    user => user.email === email && user.password === password
  );
};

// Helper para buscar usuario por ID
export const findUserById = (id: number): MockUser | undefined => {
  return MOCK_USERS.find(user => user.usuario_id === id);
};