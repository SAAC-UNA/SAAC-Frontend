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
  UserCycle,
  DuplicateValidationRequest,
  DuplicateValidationResponse,
  FlexibleAssignmentItem
} from '@/Types/EvidenceAssignment';
import type { FlexibleElement } from '@/Types/StructureModelTypes';
import type { FileModel } from '@/Types/FileTypes';
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
   * Obtener todos los procesos desde el backend.
   * Incluye tipo de modelo del ciclo para bifurcar tradicional / elemento_flexible.
   */
  async getAllProcesses(): Promise<Process[]> {
    try {
      const response = await axiosInstance.get<{ data: any[] }>('/estructura/procesos');
      
      const rawProcesses = response.data.data || response.data || [];

      return rawProcesses.map((item: any) => {
        const cycle =
          item.accreditation_cycle ||
          item.accreditationCycle ||
          {};
        const modelo = cycle.modelo_estructura || {};

        return {
          proceso_id: item.id || item.proceso_id,
          nombre: item.nombre
            ?? (cycle.nombre && item.tipo_proceso
              ? `${cycle.nombre} — ${item.tipo_proceso}`
              : cycle.nombre ?? `Proceso ${item.id || item.proceso_id}`),
          ciclo_acreditacion_id: item.ciclo_acreditacion_id ?? cycle.ciclo_acreditacion_id,
          ciclo_nombre: cycle.nombre ?? undefined,
          modelo_estructura_id: modelo.modelo_estructura_id ?? cycle.modelo_estructura_id ?? undefined,
          modelo_estructura_tipo: modelo.tipo ?? undefined,
          created_at: item.created_at,
          updated_at: item.updated_at,
        };
      });
    } catch (error) {
      devLog.error('Error al obtener procesos:', error);
      throw error;
    }
  }

  /**
   * Obtener elementos de estructura para un modelo flexible.
   * GET /api/estructura/elementos?modelo_estructura_id={id}
   */
  async getElementsByModel(modeloId: number): Promise<FlexibleElement[]> {
    try {
      const response = await axiosInstance.get<any[]>('/estructura/elementos', {
        params: { modelo_estructura_id: modeloId },
      });
      const raw: any[] = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data ?? [];
      return raw.map((item: any) => ({
        elemento_id:          item.elemento_id ?? item.id,
        modelo_estructura_id: item.modelo_estructura_id,
        padre_id:             item.padre_id || null,
        tipo:                 item.tipo ?? '',
        nombre:               item.nombre ?? null,
        categoria:            item.categoria ?? null,
        nomenclatura:         item.nomenclatura ?? null,
        descripcion:          item.descripcion ?? null,
        activo:               item.activo ?? true,
        created_at:           item.created_at ?? '',
        updated_at:           item.updated_at ?? '',
      }));
    } catch (error) {
      devLog.error('Error al obtener elementos:', error);
      throw error;
    }
  }

  /**
   * Crear asignación de elemento (modelo flexible).
   * POST /api/elementos-asignaciones
   */
  async createElementAssignment(data: {
    elemento_id: number;
    proceso_id: number;
    usuarios?: number[];
    roles?: number[];
    fecha_limite?: string;
    comentario?: string;
  }): Promise<void> {
    try {
      await axiosInstance.post('/elementos-asignaciones', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al asignar elemento.');
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

  /**
   * Obtiene los elementos asignados al usuario (modelo flexible).
   * GET /api/usuarios/{userId}/elementos-asignados
   */
  async getMyElementAssignments(userId: number): Promise<FlexibleAssignmentItem[]> {
    try {
      const response = await axiosInstance.get<{ data: FlexibleAssignmentItem[] }>(
        `/usuarios/${userId}/elementos-asignados`
      );
      return response.data.data || [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Error al obtener las pautas asignadas'
      );
    }
  }

  /**
   * Actualiza el estado de una asignación de elemento (modelo flexible).
   * PATCH /api/elementos-asignaciones/{id}
   */
  async updateElementStatus(
    id: number,
    estado: 'En Progreso' | 'Completado'
  ): Promise<FlexibleAssignmentItem> {
    try {
      const response = await axiosInstance.patch<{ data: FlexibleAssignmentItem }>(
        `/elementos-asignaciones/${id}`,
        { estado }
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Error al actualizar el estado'
      );
    }
  }

  /**
   * Solicita ampliación de plazo para una asignación de elemento (modelo flexible).
   * POST /api/elementos-asignaciones/{id}/solicitud-ampliacion
   */
  async requestElementExtension(
    id: number,
    data: { motivo: string; fecha_sugerida: string }
  ): Promise<void> {
    try {
      await axiosInstance.post(`/elementos-asignaciones/${id}/solicitud-ampliacion`, data);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Error al enviar la solicitud de ampliación'
      );
    }
  }

  /**
   * Obtiene el detalle completo de una asignación de elemento (con comentarios).
   * GET /api/elementos-asignaciones/{id}
   */
  async getElementAssignmentById(id: number): Promise<FlexibleAssignmentItem> {
    try {
      const response = await axiosInstance.get<{ data: FlexibleAssignmentItem }>(
        `/elementos-asignaciones/${id}`
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Error al obtener el detalle de la asignación'
      );
    }
  }

  /**
   * Lista los archivos de un elemento para un proceso.
   * GET /api/elementos-archivos?elemento_id={id}&proceso_id={id}
   */
  async getElementFiles(elementoId: number, procesoId: number, usuarioId?: number): Promise<FileModel[]> {
    try {
      const response = await axiosInstance.get<{ data: FileModel[]; count: number }>(
        `/elementos-archivos`,
        {
          params: {
            elemento_id: elementoId,
            proceso_id: procesoId,
            ...(usuarioId ? { usuario_id: usuarioId } : {}),
          },
        }
      );
      return response.data.data || [];
    } catch (error: any) {
      if (error.response?.status === 404) return [];
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener archivos');
    }
  }

  /**
   * Lista asignaciones de un elemento (modelo flexible).
   * GET /api/elementos/{elementoId}/asignaciones
   */
  async getElementAssignmentsByElement(
    elementoId: number,
    procesoId?: number,
  ): Promise<FlexibleAssignmentItem[]> {
    try {
      const response = await axiosInstance.get<{ data: FlexibleAssignmentItem[] }>(
        `/elementos/${elementoId}/asignaciones`,
        {
          params: procesoId ? { proceso_id: procesoId } : undefined,
        },
      );
      return response.data.data || [];
    } catch (error: any) {
      if (error.response?.status === 404) return [];
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Error al obtener asignaciones del elemento',
      );
    }
  }

  /**
   * Sube archivos a un elemento (modelo flexible).
   * POST /api/elementos-archivos
   */
  async uploadElementFiles(
    files: File[],
    elementoId: number,
    procesoId: number
  ): Promise<{ successful: FileModel[]; failed: Array<{ file: File; error: string }> }> {
    const buildFormData = (batch: File[]) => {
      const formData = new FormData();
      formData.append('tipo', 'archivo');
      batch.forEach(f => formData.append('archivos[]', f));
      formData.append('elemento_id', elementoId.toString());
      formData.append('proceso_id', procesoId.toString());
      return formData;
    };

    const sendBatch = (batch: File[]) =>
      axiosInstance.post<{ data: FileModel[]; errores?: Array<{ indice: number; error: string }> }>(
        '/elementos-archivos', buildFormData(batch),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

    try {
      const response = await sendBatch(files);
      const successful = response.data.data || [];
      const failed: Array<{ file: File; error: string }> = (response.data.errores || []).map(e => ({
        file: files[e.indice],
        error: e.error,
      }));
      return { successful, failed };
    } catch (error: any) {
      // Si el backend rechaza archivos específicos con 422, excluirlos y reintentar los válidos
      if (error.response?.status === 422) {
        const validationErrors: Record<string, unknown> = error.response.data?.errors || {};
        const indexedErrors = new Map<number, string>();

        Object.entries(validationErrors).forEach(([key, value]) => {
          const match = key.match(/^archivos\.(\d+)$/);
          if (!match) return;
          const index = Number(match[1]);
          const message = Array.isArray(value) ? String(value[0]) : String(value);
          if (!Number.isNaN(index)) indexedErrors.set(index, message);
        });

        if (indexedErrors.size > 0) {
          const failed: Array<{ file: File; error: string }> = [];
          const retryBatch = files.filter((file, index) => {
            if (indexedErrors.has(index)) {
              failed.push({ file, error: indexedErrors.get(index) || 'Archivo inválido.' });
              return false;
            }
            return true;
          });

          if (retryBatch.length === 0) return { successful: [], failed };

          try {
            const retryResponse = await sendBatch(retryBatch);
            const successful = retryResponse.data.data || [];
            (retryResponse.data.errores || []).forEach(e => {
              const f = retryBatch[e.indice];
              if (f) failed.push({ file: f, error: e.error });
            });
            return { successful, failed };
          } catch (retryError: any) {
            const msg = retryError.response?.data?.message || retryError.message || 'Error al reintentar subida';
            retryBatch.forEach(f => failed.push({ file: f, error: msg }));
            return { successful: [], failed };
          }
        }
      }

      const msg = error.response?.data?.message || error.message || 'Error al subir archivos';
      return { successful: [], failed: files.map(f => ({ file: f, error: msg })) };
    }
  }

  /**
   * Guarda enlaces asociados a un elemento (modelo flexible).
   * POST /api/elementos-archivos
   */
  async uploadElementLinks(
    links: string[],
    elementoId: number,
    procesoId: number
  ): Promise<{ successful: FileModel[]; failed: Array<{ url: string; error: string }> }> {
    const formData = new FormData();
    formData.append('tipo', 'enlace');
    links.forEach(l => formData.append('enlaces[]', l.trim()));
    formData.append('elemento_id', elementoId.toString());
    formData.append('proceso_id', procesoId.toString());
    try {
      const response = await axiosInstance.post<{ data: FileModel[]; errores?: Array<{ indice: number; error: string }> }>(
        '/elementos-archivos', formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const successful = response.data.data || [];
      const failed: Array<{ url: string; error: string }> = (response.data.errores || []).map(e => ({
        url: links[e.indice],
        error: e.error,
      }));
      return { successful, failed };
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error al guardar enlaces';
      return { successful: [], failed: links.map(url => ({ url, error: msg })) };
    }
  }

  /**
   * Elimina un archivo de un elemento (modelo flexible).
   * DELETE /api/elementos-archivos/{id}
   */
  async deleteElementFile(archivoId: number): Promise<void> {
    try {
      await axiosInstance.delete(`/elementos-archivos/${archivoId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Error al eliminar el archivo');
    }
  }

  /**
   * Obtener los ciclos de acreditación donde el usuario tiene asignaciones.
   * GET /api/usuarios/{id}/mis-ciclos
   */
  async getUserCycles(userId: number): Promise<UserCycle[]> {
    try {
      const response = await axiosInstance.get<{ data: UserCycle[] }>(
        `/usuarios/${userId}/mis-ciclos`
      );
      return response.data.data || [];
    } catch (error) {
      devLog.error('Error al obtener ciclos del usuario:', error);
      throw error;
    }
  }
}

export const evidenceAssignmentService = new EvidenceAssignmentService();