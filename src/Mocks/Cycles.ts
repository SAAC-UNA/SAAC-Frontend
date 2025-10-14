/**
 * Ciclos de acreditación mock
 * Basados en la estructura del backend
 */

export interface MockCycle {
  ciclo_acreditacion_id: number;
  nombre: string;
  carrera_sede_id: number;
  career_campus: {
    carrera_sede_id: number;
    carrera_id: number;
    sede_id: number;
    career: {
      carrera_id: number;
      nombre: string;
      facultad_id: number;
      activo: boolean;
    };
    campus: {
      sede_id: number;
      nombre: string;
      universidad_id: number;
      activo: boolean;
    };
  };
}

export const MOCK_CYCLES: MockCycle[] = [
  {
    ciclo_acreditacion_id: 1,
    nombre: 'Ciclo Ingeniería 2025-2030',
    carrera_sede_id: 1,
    career_campus: {
      carrera_sede_id: 1,
      carrera_id: 1,
      sede_id: 1,
      career: {
        carrera_id: 1,
        nombre: 'Ingeniería en Sistemas',
        facultad_id: 1,
        activo: true
      },
      campus: {
        sede_id: 1,
        nombre: 'Campus Central',
        universidad_id: 1,
        activo: true
      }
    }
  },
  {
    ciclo_acreditacion_id: 2,
    nombre: 'Ciclo Educación 2025-2030',
    carrera_sede_id: 2,
    career_campus: {
      carrera_sede_id: 2,
      carrera_id: 2,
      sede_id: 1,
      career: {
        carrera_id: 2,
        nombre: 'Educación',
        facultad_id: 2,
        activo: true
      },
      campus: {
        sede_id: 1,
        nombre: 'Campus Central',
        universidad_id: 1,
        activo: true
      }
    }
  }
];