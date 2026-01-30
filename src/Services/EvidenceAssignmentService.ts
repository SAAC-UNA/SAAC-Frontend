/**
 * Servicio para manejar las asignaciones de evidencias
 * Refactorizado para usar datos reales del backend en lugar de mocks
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

class EvidenceAssignmentService {
  /**
   * Crear nuevas asignaciones de evidencias
   */
  async createAssignment(data: EvidenceAssignmentRequest): Promise<EvidenceAssignmentApiResponse> {
    const response = await fetch(`${API_BASE_URL}/evidencias-asignaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error de validación.');
    }

    return response.json();
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
   * Obtener todas las evidencias desde el backend
   */
  async getAllEvidences(): Promise<Evidence[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/estructura/evidencias`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener las evidencias: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rawEvidences = data.data || data || [];
      
      // Mapear respuesta del backend: id -> evidencia_id
      return rawEvidences.map((item: any) => ({
        evidencia_id: item.id || item.evidencia_id,
        criterio_id: item.criterio_id,
        estado_evidencia_id: item.estado_evidencia_id,
        descripcion: item.descripcion,
        nomenclatura: item.nomenclatura,
        activo: item.activo,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    } catch (error) {
      devLog.error('Error al obtener evidencias:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los criterios desde el backend
   */
  async getAllCriteria(): Promise<Criterion[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/estructura/criterios`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener los criterios: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rawCriteria = data.data || data || [];
      
      // Mapear respuesta del backend: id -> criterio_id
      return rawCriteria.map((item: any) => ({
        criterio_id: item.id || item.criterio_id,
        componente_id: item.componente_id,
        comentario_id: item.comentario_id,
        descripcion: item.descripcion,
        nomenclatura: item.nomenclatura,
        activo: item.activo,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    } catch (error) {
      devLog.error('Error al obtener criterios:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los procesos desde el backend
   */
  async getAllProcesses(): Promise<Process[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/estructura/procesos`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener los procesos: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rawProcesses = data.data || data || [];
      
      // Mapear respuesta del backend: id -> proceso_id
      return rawProcesses.map((item: any) => ({
        proceso_id: item.id || item.proceso_id,
        ciclo_acreditacion_id: item.ciclo_acreditacion_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    } catch (error) {
      devLog.error('Error al obtener procesos:', error);
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
}

export const evidenceAssignmentService = new EvidenceAssignmentService();
export default evidenceAssignmentService;