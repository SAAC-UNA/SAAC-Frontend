/**
 * EvidenceAssignmentService - Servicio para operaciones con asignaciones de evidencias (HU-029)
 * Integración con backend Laravel endpoints de EvidenceAssignmentController
 * Refactorizado para usar axiosInstance y nuevos tipos TypeScript
 */

import { axiosInstance } from '@/Config/axios';
import type {
  EvidenceAssignment,
  UpdateAssignmentParams
} from '@/Types/EvidenceAssignmentTypes';
import type { 
  EvidenceAssignmentRequest, 
  EvidenceAssignmentApiResponse,
  Evidence,
  Criterion,
  Process,
  DuplicateValidationRequest,
  DuplicateValidationResponse
} from '@/Types/EvidenceAssignment';
import { devLog } from '@/Utils/devLogger';

export interface AssignmentCatalogRole {
  id: number;
  name: string;
}

export interface AssignmentCatalogUser {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  roles: AssignmentCatalogRole[];
}

export interface AssignmentCatalogRoleOption {
  id: number;
  name: string;
  description?: string;
  permissions: Array<{ id: number; name: string; label: string }>;
}

class EvidenceAssignmentService {
  /**
   * Catálogo de usuarios activos para asignaciones.
   */
  async getAssignmentUsersCatalog(): Promise<AssignmentCatalogUser[]> {
    try {
      const response = await axiosInstance.get<{ data: AssignmentCatalogUser[] }>('/evidencias-asignaciones/catalogo/usuarios');
      return response.data.data || [];
    } catch (error) {
      throw new Error('Error al obtener catálogo de usuarios para asignaciones');
    }
  }

  /**
   * Catálogo de roles para asignaciones.
   */
  async getAssignmentRolesCatalog(): Promise<AssignmentCatalogRoleOption[]> {
    try {
      const response = await axiosInstance.get<{ data: AssignmentCatalogRoleOption[] }>('/evidencias-asignaciones/catalogo/roles');
      return response.data.data || [];
    } catch (error) {
      throw new Error('Error al obtener catálogo de roles para asignaciones');
    }
  }

  /**
   * Validar asignaciones duplicadas antes de crear
   */
  async validateDuplicates(data: DuplicateValidationRequest): Promise<DuplicateValidationResponse> {
    try {
      const response = await axiosInstance.post<DuplicateValidationResponse>(
        '/evidencias-asignaciones/validar-duplicados',
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Error al validar asignaciones duplicadas'
      );
    }
  }

  /**
   * Crear nuevas asignaciones de evidencias
   */
  async createAssignment(data: EvidenceAssignmentRequest): Promise<EvidenceAssignmentApiResponse> {
    try {
      const response = await axiosInstance.post<EvidenceAssignmentApiResponse>(
        '/evidencias-asignaciones',
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error de validación.');
    }
  }

  /**
   * Obtener todas las asignaciones
   */
  async getAllAssignments(): Promise<EvidenceAssignment[]> {
    try {
      const response = await axiosInstance.get<{ data: EvidenceAssignment[] }>('/evidencias-asignaciones');
      return response.data.data || [];
    } catch (error) {
      throw new Error('Error al obtener las asignaciones');
    }
  }

  /**
   * Obtiene todas las evidencias asignadas a un usuario específico
   * GET /api/usuarios/{usuarioId}/evidencias-asignadas
   * 
   * Usa los nuevos tipos de HU-029 para mejor type-safety
   */
  async getMyAssignments(userId: number): Promise<EvidenceAssignment[]> {
    try {
      const response = await axiosInstance.get<{ data: EvidenceAssignment[] }>(
        `/usuarios/${userId}/evidencias-asignadas`
      );
      
      return response.data.data || [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener las asignaciones de evidencias'
      );
    }
  }

  /**
   * Obtener asignaciones por usuario (método legacy - usar getMyAssignments)
   * @deprecated Usar getMyAssignments en su lugar
   */
  async getAssignmentsByUser(userId: number): Promise<EvidenceAssignment[]> {
    const response = await axiosInstance.get(`/usuarios/${userId}/evidencias-asignadas`);
    return response.data.data || [];
  }

  /**
   * Obtener asignaciones por evidencia
   */
  async getAssignmentsByEvidence(evidenceId: number): Promise<EvidenceAssignment[]> {
    try {
      const response = await axiosInstance.get<{ data: EvidenceAssignment[] }>(`/evidencias/${evidenceId}/asignaciones`);
      return response.data.data || [];
    } catch (error) {
      throw new Error('Error al obtener las asignaciones de la evidencia');
    }
  }

  /**
   * Obtener asignaciones por proceso
   */
  async getAssignmentsByProcess(processId: number): Promise<EvidenceAssignment[]> {
    try {
      const response = await axiosInstance.get<{ data: EvidenceAssignment[] }>(`/procesos/${processId}/asignaciones`);
      return response.data.data || [];
    } catch (error) {
      throw new Error('Error al obtener las asignaciones del proceso');
    }
  }

  /**
   * Obtener todas las evidencias desde el backend
   */
  async getAllEvidences(): Promise<Evidence[]> {
    try {
      const response = await axiosInstance.get<{ data: any[] }>('/estructura/evidencias');
      
      const rawEvidences = response.data.data || response.data || [];
      
      // Mapear respuesta del backend: id -> evidencia_id
      return rawEvidences.map((item: any) => ({
        evidencia_id: item.id || item.evidencia_id,
        criterio_id: item.criterio_id,
        estado: item.estado,
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
      const response = await axiosInstance.get<{ data: any[] }>('/estructura/criterios');
      
      const rawCriteria = response.data.data || response.data || [];
      
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
      const response = await axiosInstance.get<{ data: any[] }>('/estructura/procesos');
      
      const rawProcesses = response.data.data || response.data || [];
      
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
    try {
      await axiosInstance.delete(`/evidencias-asignaciones/${assignmentId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar la asignación');
    }
  }

  /**
   * Actualiza el estado de una asignación
   * PUT /api/evidencias-asignaciones/{id}
   * 
   * Usa los nuevos tipos de HU-029
   */
  async updateStatus(
    assignmentId: number,
    params: UpdateAssignmentParams
  ): Promise<EvidenceAssignment> {
    try {
      const response = await axiosInstance.put<{ data: EvidenceAssignment }>(
        `/evidencias-asignaciones/${assignmentId}`,
        params
      );
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('La asignación no fue encontrada.');
      }
      
      if (error.response?.status === 403) {
        throw new Error('No tiene permisos para actualizar esta asignación.');
      }
      
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        const firstError = Object.values(validationErrors || {})[0];
        throw new Error(
          Array.isArray(firstError) ? firstError[0] : 'Error de validación'
        );
      }
      
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al actualizar la asignación'
      );
    }
  }

  /**
   * Obtiene una asignación específica por ID
   * GET /api/evidencias-asignaciones/{id}
   */
  async getById(assignmentId: number): Promise<EvidenceAssignment> {
    try {
      const response = await axiosInstance.get<{ data: EvidenceAssignment }>(
        `/evidencias-asignaciones/${assignmentId}`
      );
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('La asignación no fue encontrada.');
      }
      
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener la asignación'
      );
    }
  }

  /**
   * Actualizar una asignación (método legacy - usar updateStatus)
   * @deprecated Usar updateStatus en su lugar
   */
  async updateAssignment(
    assignmentId: number, 
    data: Partial<Pick<EvidenceAssignment, 'estado' | 'fecha_limite'>>
  ): Promise<EvidenceAssignment> {
    const response = await axiosInstance.patch(`/evidencias-asignaciones/${assignmentId}`, data);
    return response.data.data;
  }
}

export const evidenceAssignmentService = new EvidenceAssignmentService();