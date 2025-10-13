/**
 * Servicio para manejar las asignaciones de evidencias
 */

import type { 
  EvidenceAssignmentRequest, 
  EvidenceAssignmentApiResponse,
  EvidenceAssignmentResponse,
  Evidence,
  Criterion,
  Process
} from '@/Types/EvidenceAssignment';
import { devLog } from '@/Utils/devLogger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Datos mock para desarrollo - Basados en la estructura real del backend
const mockData = {
  processes: [
    { proceso_id: 1, ciclo_acreditacion_id: 1 },
    { proceso_id: 2, ciclo_acreditacion_id: 1 },
    { proceso_id: 3, ciclo_acreditacion_id: 2 },
  ] as Process[],

  criteria: [
    // DIMENSIÓN 1: Relación con el contexto
    { criterio_id: 1, componente_id: 1, nomenclatura: "1.1", descripcion: "Información y promoción de la carrera de Ingeniería en Sistemas" },
    { criterio_id: 2, componente_id: 1, nomenclatura: "1.2", descripcion: "Procesos de admisión e ingreso de estudiantes" },
    { criterio_id: 3, componente_id: 2, nomenclatura: "1.3", descripcion: "Correspondencia con el contexto tecnológico y laboral" },

    // DIMENSIÓN 2: Recursos
    { criterio_id: 4, componente_id: 3, nomenclatura: "2.1", descripcion: "Plan de estudios y pertinencia curricular" },
    { criterio_id: 5, componente_id: 3, nomenclatura: "2.2", descripcion: "Personal académico especializado en tecnologías de información" },
    { criterio_id: 6, componente_id: 3, nomenclatura: "2.3", descripcion: "Infraestructura tecnológica y laboratorios" },
    { criterio_id: 7, componente_id: 3, nomenclatura: "2.4", descripcion: "Centro de información y recursos digitales" },

    // DIMENSIÓN 3: Proceso educativo
    { criterio_id: 8, componente_id: 4, nomenclatura: "3.1", descripcion: "Desarrollo docente y metodologías de enseñanza" },
    { criterio_id: 9, componente_id: 4, nomenclatura: "3.2", descripcion: "Gestión académica y evaluación del aprendizaje" },
    { criterio_id: 10, componente_id: 4, nomenclatura: "3.3", descripcion: "Investigación, innovación y vinculación con el sector productivo" },

    // DIMENSIÓN 4: Resultados
    { criterio_id: 11, componente_id: 5, nomenclatura: "4.1", descripcion: "Desempeño estudiantil, graduación y empleabilidad" },
    { criterio_id: 12, componente_id: 5, nomenclatura: "4.2", descripcion: "Satisfacción de graduados y empleadores" },

    // DIMENSIÓN 5: Sostenibilidad
    { criterio_id: 13, componente_id: 6, nomenclatura: "S1", descripcion: "Gestión del mejoramiento continuo y sostenibilidad de la carrera" },
  ] as Criterion[],

  evidences: [
    // DIMENSIÓN 1: Relación con el contexto
    { evidencia_id: 1, criterio_id: 1, estado_evidencia_id: 1, nomenclatura: "E1.1.1", descripcion: "Página oficial de la carrera y materiales de divulgación (folletos, redes, ferias)" },
    { evidencia_id: 2, criterio_id: 2, estado_evidencia_id: 1, nomenclatura: "E1.2.1", descripcion: "Reglamento de admisión y registros de ingreso de estudiantes por cohorte" },
    { evidencia_id: 3, criterio_id: 3, estado_evidencia_id: 1, nomenclatura: "E1.3.1", descripcion: "Estudio de pertinencia y demanda laboral del profesional en sistemas" },

    // DIMENSIÓN 2: Recursos
    { evidencia_id: 4, criterio_id: 4, estado_evidencia_id: 1, nomenclatura: "E2.1.1", descripcion: "Plan de estudios vigente aprobado por CONARE y CONESUP" },
    { evidencia_id: 5, criterio_id: 4, estado_evidencia_id: 1, nomenclatura: "E2.1.2", descripcion: "Matriz de correspondencia entre resultados de aprendizaje y cursos" },
    { evidencia_id: 6, criterio_id: 5, estado_evidencia_id: 1, nomenclatura: "E2.2.1", descripcion: "Listado de docentes con grado académico, experiencia y publicaciones" },
    { evidencia_id: 7, criterio_id: 6, estado_evidencia_id: 1, nomenclatura: "E2.3.1", descripcion: "Inventario de laboratorios de programación, redes y hardware" },
    { evidencia_id: 8, criterio_id: 7, estado_evidencia_id: 1, nomenclatura: "E2.4.1", descripcion: "Sistema de bibliotecas, repositorios digitales y acceso a bases de datos" },

    // DIMENSIÓN 3: Proceso educativo
    { evidencia_id: 9, criterio_id: 8, estado_evidencia_id: 1, nomenclatura: "E3.1.1", descripcion: "Plan de capacitación docente en metodologías activas y TIC" },
    { evidencia_id: 10, criterio_id: 9, estado_evidencia_id: 1, nomenclatura: "E3.2.1", descripcion: "Actas de Consejo Académico y reportes de gestión académica" },
    { evidencia_id: 11, criterio_id: 10, estado_evidencia_id: 1, nomenclatura: "E3.3.1", descripcion: "Proyectos de investigación aplicada en colaboración con empresas tecnológicas" },

    // DIMENSIÓN 4: Resultados
    { evidencia_id: 12, criterio_id: 11, estado_evidencia_id: 1, nomenclatura: "E4.1.1", descripcion: "Indicadores de rendimiento académico, graduación y deserción" },
    { evidencia_id: 13, criterio_id: 12, estado_evidencia_id: 1, nomenclatura: "E4.2.1", descripcion: "Resultados de encuestas de empleadores y seguimiento a egresados" },

    // DIMENSIÓN 5: Sostenibilidad
    { evidencia_id: 14, criterio_id: 13, estado_evidencia_id: 1, nomenclatura: "ES.1.1", descripcion: "Plan de mejora continua 2025-2029 y compromisos de sostenibilidad" },
  ] as Evidence[],
};

class EvidenceAssignmentService {
  /**
   * Crear nuevas asignaciones de evidencias
   */
  async createAssignment(data: EvidenceAssignmentRequest): Promise<EvidenceAssignmentApiResponse> {
    const isDevelopment = import.meta.env.DEV;
    
    try {
      const response = await fetch(`${API_BASE_URL}/evidencias-asignaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Si estamos en desarrollo y es un error de entidades no encontradas, usar mock silenciosamente
        if (isDevelopment && response.status === 422) {
          const errors = errorData.errors || {};
          const hasEntityNotFoundErrors = 
            (errors.proceso_id && errors.proceso_id.some((msg: string) => msg.includes('no existe'))) ||
            (errors.evidencia_id && errors.evidencia_id.some((msg: string) => msg.includes('no existe')));
          
          if (hasEntityNotFoundErrors) {
            devLog.info('Using mock response - backend entities not ready', { once: true });
            return this.createMockAssignmentResponse(data);
          }
        }
        
        throw new Error(errorData.message || 'Error de validación.');
      }

      return response.json();
    } catch (networkError) {
      // Si hay error de red y estamos en desarrollo, usar mock silenciosamente
      if (isDevelopment) {
        devLog.info('Using mock response - network unavailable', { once: true });
        return this.createMockAssignmentResponse(data);
      }
      throw networkError;
    }
  }

  /**
   * Crear respuesta mock para desarrollo
   */
  private createMockAssignmentResponse(data: EvidenceAssignmentRequest): EvidenceAssignmentApiResponse {
    const mockId = Math.floor(Math.random() * 1000) + 100;
    const now = new Date().toISOString();
    
    return {
      message: 'Asignación creada exitosamente (modo desarrollo)',
      data: {
        total_asignaciones: 1,
        total_errores: 0,
        asignaciones: [{
          evidencia_asignacion_id: mockId,
          proceso_id: data.proceso_id,
          evidencia_id: data.evidencia_id,
          usuario_id: data.usuarios?.[0] || 0,
          estado: 'pendiente' as const,
          fecha_asignacion: now,
          fecha_limite: data.fecha_limite,
          created_at: now,
          updated_at: now
        }],
        errores: []
      }
    };
  }

  /**
   * Obtener todas las asignaciones
   */
  async getAllAssignments(): Promise<EvidenceAssignmentResponse[]> {
    const response = await fetch(`${API_BASE_URL}/evidencias-asignaciones`);
    
    if (!response.ok) {
      throw new Error('Error al obtener las asignaciones');
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Obtener asignaciones por usuario
   */
  async getAssignmentsByUser(userId: number): Promise<EvidenceAssignmentResponse[]> {
    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/evidencias-asignadas`);
    
    if (!response.ok) {
      throw new Error('Error al obtener las asignaciones del usuario');
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Obtener asignaciones por evidencia
   */
  async getAssignmentsByEvidence(evidenceId: number): Promise<EvidenceAssignmentResponse[]> {
    const response = await fetch(`${API_BASE_URL}/evidencias/${evidenceId}/asignaciones`);
    
    if (!response.ok) {
      throw new Error('Error al obtener las asignaciones de la evidencia');
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Obtener asignaciones por proceso
   */
  async getAssignmentsByProcess(processId: number): Promise<EvidenceAssignmentResponse[]> {
    const response = await fetch(`${API_BASE_URL}/procesos/${processId}/asignaciones`);
    
    if (!response.ok) {
      throw new Error('Error al obtener las asignaciones del proceso');
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Obtener todas las evidencias
   */
  async getAllEvidences(): Promise<Evidence[]> {
    const response = await fetch(`${API_BASE_URL}/estructura/evidencias`);
    
    if (!response.ok) {
      throw new Error('Error al obtener las evidencias');
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Obtener todos los criterios
   */
  async getAllCriteria(): Promise<Criterion[]> {
    const response = await fetch(`${API_BASE_URL}/estructura/criterios`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener los criterios: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Obtener todos los procesos
   */
  async getAllProcesses(): Promise<Process[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/procesos`);
      
      if (!response.ok) {
        throw new Error('Error al obtener los procesos');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      // En desarrollo, suprimir errores de red para evitar spam en consola
      if (import.meta.env.DEV) {
        // Solo logueamos si es un error diferente a 404
        const isNetworkError = error instanceof TypeError;
        if (isNetworkError) {
          devLog.info('Endpoint de procesos no disponible, usando fallback', { once: true });
        }
      }
      throw error;
    }
  }

  /**
   * Eliminar una asignación
   */
  async deleteAssignment(assignmentId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/evidencias-asignaciones/${assignmentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar la asignación');
    }
  }

  /**
   * Actualizar una asignación
   */
  async updateAssignment(
    assignmentId: number, 
    data: Partial<Pick<EvidenceAssignmentResponse, 'estado' | 'fecha_limite'>>
  ): Promise<EvidenceAssignmentResponse> {
    const response = await fetch(`${API_BASE_URL}/evidencias-asignaciones/${assignmentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar la asignación');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Métodos con fallback a datos mock para desarrollo
   */
  
  async getAllProcessesWithFallback(): Promise<Process[]> {
    const isDevelopment = import.meta.env.DEV;
    
    try {
      const result = await this.getAllProcesses();
      // Si el API devuelve un array vacío, usar mock data
      if (!result || result.length === 0) {
        if (isDevelopment) {
          devLog.info('API de procesos devolvió datos vacíos, usando mock data', { once: true });
        }
        return mockData.processes;
      }
      return result;
    } catch (error) {
      if (isDevelopment) {
        devLog.info('API de procesos no disponible, usando mock data', { once: true });
      }
      return mockData.processes;
    }
  }

  async getAllCriteriaWithFallback(): Promise<Criterion[]> {
    const isDevelopment = import.meta.env.DEV;
    
    try {
      const result = await this.getAllCriteria();
      
      // Si el API devuelve un array vacío, usar mock data
      if (!result || result.length === 0) {
        if (isDevelopment) {
          devLog.info('API de criterios devolvió datos vacíos, usando mock data', { once: true });
        }
        return mockData.criteria;
      }
      
      return result;
    } catch (error) {
      if (isDevelopment) {
        devLog.info('API de criterios no disponible, usando mock data', { once: true });
      }
      return mockData.criteria;
    }
  }

  async getAllEvidencesWithFallback(): Promise<Evidence[]> {
    const isDevelopment = import.meta.env.DEV;
    
    try {
      const result = await this.getAllEvidences();
      // Si el API devuelve un array vacío, usar mock data
      if (!result || result.length === 0) {
        if (isDevelopment) {
          devLog.info('API de evidencias devolvió datos vacíos, usando mock data', { once: true });
        }
        return mockData.evidences;
      }
      return result;
    } catch (error) {
      if (isDevelopment) {
        devLog.info('API de evidencias no disponible, usando mock data', { once: true });
      }
      return mockData.evidences;
    }
  }
}

export const evidenceAssignmentService = new EvidenceAssignmentService();
export default evidenceAssignmentService;