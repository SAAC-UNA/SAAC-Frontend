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
    usuario_id: 2,
    cedula: '101010101',
    nombre: 'Pablo Castillo Quesada',
    email: 'pablo.castillo.quesada@una.cr',
    password: 'password', // La contraseña real la maneja el backend
    roles: [
      {
        id: 4,
        name: 'SuperUsuario'
      }
    ],
    careers: [] // SuperUsuario NO tiene carreras asignadas (ve todas)
  },
  {
    usuario_id: 3,
    cedula: '203948609',
    nombre: 'Cristopher Montero Jimenez',
    email: 'cristopher.montero.jimenez@una.ac.cr',
    password: 'password', // La contraseña real la maneja el backend
    roles: [
      {
        id: 2,
        name: 'Administrador'
      }
    ],
    careers: [
      {
        carrera_id: 10,
        nombre: 'Ingeniería en Sistemas',
        facultad_id: 11
      }
    ]
  },
  {
    usuario_id: 4,
    cedula: '402290552',
    nombre: 'Alejandro Ugalde Villalobos',
    email: 'alejandro.ugalde.villalobos@est.una.ac.cr',
    password: 'password', // La contraseña real la maneja el backend
    roles: [
      {
        id: 2,
        name: 'Administrador'
      }
    ],
    careers: [
      {
        carrera_id: 12,
        nombre: 'Química',
        facultad_id: 11
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