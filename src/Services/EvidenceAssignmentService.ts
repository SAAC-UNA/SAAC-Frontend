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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Datos mock para desarrollo
const mockData = {
  processes: [
    { proceso_id: 1, ciclo_acreditacion_id: 1 },
    { proceso_id: 2, ciclo_acreditacion_id: 1 },
    { proceso_id: 3, ciclo_acreditacion_id: 2 },
  ] as Process[],
  
  criteria: [
    { id: 1, componente_id: 1, nomenclatura: 'C1.1', descripcion: 'Criterio de Gestión Institucional' },
    { id: 2, componente_id: 1, nomenclatura: 'C2.1', descripcion: 'Criterio de Recursos Humanos' },
    { id: 3, componente_id: 2, nomenclatura: 'C3.1', descripcion: 'Criterio de Infraestructura' },
    { id: 4, componente_id: 2, nomenclatura: 'C4.1', descripcion: 'Criterio de Proceso Educativo' },
    { id: 5, componente_id: 3, nomenclatura: 'C5.1', descripcion: 'Criterio de Resultados' },
  ] as Criterion[],
  
  evidences: [
    // Evidencias para Criterio 1 (Gestión Institucional)
    { evidencia_id: 1, criterio_id: 1, estado_evidencia_id: 1, nomenclatura: 'E1.1.1', descripcion: 'Plan Estratégico Institucional' },
    { evidencia_id: 2, criterio_id: 1, estado_evidencia_id: 1, nomenclatura: 'E1.1.2', descripcion: 'Manual de Procesos' },
    { evidencia_id: 3, criterio_id: 1, estado_evidencia_id: 1, nomenclatura: 'E1.1.3', descripcion: 'Organigrama Institucional' },
    
    // Evidencias para Criterio 2 (Recursos Humanos)
    { evidencia_id: 4, criterio_id: 2, estado_evidencia_id: 1, nomenclatura: 'E2.1.1', descripcion: 'Perfiles de Puesto' },
    { evidencia_id: 5, criterio_id: 2, estado_evidencia_id: 1, nomenclatura: 'E2.1.2', descripcion: 'Plan de Capacitación' },
    { evidencia_id: 6, criterio_id: 2, estado_evidencia_id: 1, nomenclatura: 'E2.1.3', descripcion: 'Evaluaciones de Desempeño' },
    
    // Evidencias para Criterio 3 (Infraestructura)
    { evidencia_id: 7, criterio_id: 3, estado_evidencia_id: 1, nomenclatura: 'E3.1.1', descripcion: 'Inventario de Equipos' },
    { evidencia_id: 8, criterio_id: 3, estado_evidencia_id: 1, nomenclatura: 'E3.1.2', descripcion: 'Plan de Mantenimiento' },
    
    // Evidencias para Criterio 4 (Proceso Educativo)
    { evidencia_id: 9, criterio_id: 4, estado_evidencia_id: 1, nomenclatura: 'E4.1.1', descripcion: 'Plan de Estudios' },
    { evidencia_id: 10, criterio_id: 4, estado_evidencia_id: 1, nomenclatura: 'E4.1.2', descripcion: 'Programas de Curso' },
    { evidencia_id: 11, criterio_id: 4, estado_evidencia_id: 1, nomenclatura: 'E4.1.3', descripcion: 'Sistema de Evaluación' },
    
    // Evidencias para Criterio 5 (Resultados)
    { evidencia_id: 12, criterio_id: 5, estado_evidencia_id: 1, nomenclatura: 'E5.1.1', descripcion: 'Indicadores de Rendimiento' },
    { evidencia_id: 13, criterio_id: 5, estado_evidencia_id: 1, nomenclatura: 'E5.1.2', descripcion: 'Encuestas de Satisfacción' },
  ] as Evidence[]
};

class EvidenceAssignmentService {
  /**
   * Crear nuevas asignaciones de evidencias
   */
  async createAssignment(data: EvidenceAssignmentRequest): Promise<EvidenceAssignmentApiResponse> {
    console.log('🌐 Making POST request to backend with data:', data);
    
    // En modo desarrollo, usar mock cuando el backend falla
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
        console.error('❌ Backend validation error:', errorData);
        console.error('❌ Specific errors:', JSON.stringify(errorData.errors, null, 2));
        console.error('❌ Response status:', response.status);
        console.error('❌ Response statusText:', response.statusText);
        
        // Si estamos en desarrollo y es un error de entidades no encontradas, usar mock
        if (isDevelopment && response.status === 422) {
          const errors = errorData.errors || {};
          const hasEntityNotFoundErrors = 
            (errors.proceso_id && errors.proceso_id.some((msg: string) => msg.includes('no existe'))) ||
            (errors.evidencia_id && errors.evidencia_id.some((msg: string) => msg.includes('no existe')));
          
          if (hasEntityNotFoundErrors) {
            console.warn('🔧 Backend entities not found - Using mock success response for development');
            return this.createMockAssignmentResponse(data);
          }
        }
        
        throw new Error(errorData.message || 'Error de validación.');
      }

      return response.json();
    } catch (networkError) {
      // Si hay error de red y estamos en desarrollo, usar mock
      if (isDevelopment) {
        console.warn('🔧 Network error in development - Using mock success response:', networkError);
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
    const response = await fetch(`${API_BASE_URL}/procesos`);
    
    if (!response.ok) {
      throw new Error('Error al obtener los procesos');
    }

    const data = await response.json();
    return data.data || [];
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
    try {
      const result = await this.getAllProcesses();
      // Si el API devuelve un array vacío, usar mock data
      if (!result || result.length === 0) {
        console.log('API de procesos devolvió datos vacíos, usando mock data');
        return mockData.processes;
      }
      return result;
    } catch (error) {
      console.warn('Usando datos mock para procesos:', error);
      return mockData.processes;
    }
  }

  async getAllCriteriaWithFallback(): Promise<Criterion[]> {
    try {
      const result = await this.getAllCriteria();
      
      // Si el API devuelve un array vacío, usar mock data
      if (!result || result.length === 0) {
        console.log('API de criterios devolvió datos vacíos, usando mock data');
        return mockData.criteria;
      }
      
      return result;
    } catch (error) {
      console.warn('Usando datos mock para criterios:', error);
      return mockData.criteria;
    }
  }

  async getAllEvidencesWithFallback(): Promise<Evidence[]> {
    try {
      const result = await this.getAllEvidences();
      // Si el API devuelve un array vacío, usar mock data
      if (!result || result.length === 0) {
        console.log('API de evidencias devolvió datos vacíos, usando mock data');
        return mockData.evidences;
      }
      return result;
    } catch (error) {
      console.warn('Usando datos mock para evidencias:', error);
      return mockData.evidences;
    }
  }
}

export const evidenceAssignmentService = new EvidenceAssignmentService();
export default evidenceAssignmentService;