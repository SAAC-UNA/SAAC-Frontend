/**
 * Procesos mock filtrados por carrera
 * Basados en la estructura del backend
 */

export interface MockProcess {
  proceso_id: number;
  ciclo_acreditacion_id: number;
  tipo_proceso: string;
  created_at: string;
  accreditation_cycle: {
    ciclo_acreditacion_id: number;
    nombre: string;
    carrera_sede_id: number;
    career_campus: {
      carrera_sede_id: number;
      carrera_id: number;
      career: {
        carrera_id: number;
        nombre: string;
      };
    };
  };
}

export const MOCK_PROCESSES: MockProcess[] = [
  {
    proceso_id: 1,
    ciclo_acreditacion_id: 1,
    tipo_proceso: 'Evaluación',
    created_at: '2025-01-15T10:00:00.000000Z',
    accreditation_cycle: {
      ciclo_acreditacion_id: 1,
      nombre: 'Ciclo Ingeniería 2025-2030',
      carrera_sede_id: 1,
      career_campus: {
        carrera_sede_id: 1,
        carrera_id: 1,
        career: {
          carrera_id: 1,
          nombre: 'Ingeniería en Sistemas'
        }
      }
    }
  },
  {
    proceso_id: 2,
    ciclo_acreditacion_id: 2,
    tipo_proceso: 'Autoevaluación',
    created_at: '2025-01-16T10:00:00.000000Z',
    accreditation_cycle: {
      ciclo_acreditacion_id: 2,
      nombre: 'Ciclo Educación 2025-2030',
      carrera_sede_id: 2,
      career_campus: {
        carrera_sede_id: 2,
        carrera_id: 2,
        career: {
          carrera_id: 2,
          nombre: 'Educación'
        }
      }
    }
  }
];