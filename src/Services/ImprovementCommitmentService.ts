/**
 * Servicio para gestión de Compromisos de Mejora
 * Maneja todas las operaciones CRUD y consultas relacionadas
 */

import { axiosInstance } from '@/Config/axios';
import type {
  CompromisoMejora,
  CompromisoListResponse,
  CompromisoResponse,
  CrearCompromisoPayload,
  ActualizarCompromisoPayload,
  CicloAcreditacion,
  Criterio,
  Evidencia,
} from '@/Types/ImprovementCommitmentTypes';

const BASE_URL = '/compromisos-de-mejora';

/**
 * Servicio de Compromisos de Mejora
 */
class ImprovementCommitmentService {
  
  // ============================================
  // Operaciones CRUD
  // ============================================

  /**
   * Obtener lista paginada de compromisos de mejora
   */
  async listarCompromisos(params?: {
    page?: number;
    per_page?: number;
    estado?: string;
    ciclo_acreditacion_id?: number;
  }): Promise<CompromisoListResponse> {
    const response = await axiosInstance.get<CompromisoListResponse>(BASE_URL, { params });
    return response.data;
  }

  /**
   * Obtener un compromiso específico por ID
   */
  async obtenerCompromiso(id: number): Promise<CompromisoMejora> {
    const response = await axiosInstance.get<CompromisoResponse>(`${BASE_URL}/${id}`);
    return response.data.data;
  }

  /**
   * Crear un nuevo compromiso de mejora
   */
  async crearCompromiso(payload: CrearCompromisoPayload): Promise<CompromisoMejora> {
    const response = await axiosInstance.post<CompromisoResponse>(BASE_URL, payload);
    return response.data.data;
  }

  /**
   * Actualizar un compromiso existente
   */
  async actualizarCompromiso(
    id: number,
    payload: ActualizarCompromisoPayload
  ): Promise<CompromisoMejora> {
    const response = await axiosInstance.put<CompromisoResponse>(`${BASE_URL}/${id}`, payload);
    return response.data.data;
  }

  /**
   * Activar o desactivar un compromiso
   */
  async cambiarEstadoActivo(id: number, activo: boolean): Promise<CompromisoMejora> {
    const response = await axiosInstance.patch<CompromisoResponse>(
      `${BASE_URL}/${id}/active`,
      { activo }
    );
    return response.data.data;
  }

  // ============================================
  // Consultas Específicas
  // ============================================

  /**
   * Obtener compromisos por usuario
   */
  async obtenerCompromisosPorUsuario(usuarioId: number): Promise<CompromisoMejora[]> {
    const response = await axiosInstance.get<CompromisoResponse>(
      `${BASE_URL}/usuario/${usuarioId}`
    );
    return response.data.data as any;
  }

  /**
   * Obtener compromisos por evidencia
   */
  async obtenerCompromisosPorEvidencia(evidenciaId: number): Promise<CompromisoMejora[]> {
    const response = await axiosInstance.get<CompromisoResponse>(
      `${BASE_URL}/evidencia/${evidenciaId}`
    );
    return response.data.data as any;
  }

  // ============================================
  // Datos para Formularios
  // ============================================

  /**
   * Obtener todos los ciclos de acreditación activos
   */
  async obtenerCiclosAcreditacion(): Promise<CicloAcreditacion[]> {
    const response = await axiosInstance.get<{ data: CicloAcreditacion[] } | CicloAcreditacion[]>(
      '/estructura/ciclos-acreditacion'
    );
    const raw = (response.data as any)?.data ?? response.data;
    return Array.isArray(raw) ? raw : [];
  }

  /**
   * Obtener todos los criterios activos
   */
  async obtenerCriterios(params?: { activo?: boolean }): Promise<Criterio[]> {
    const response = await axiosInstance.get<{ data: any[] }>('/estructura/criterios', {
      params,
    });
    const raw = response.data.data || (response.data as any);
    const criterios = (raw || []).map((item: any) => ({
      criterio_id: item.criterio_id ?? item.id,
      nomenclatura: item.nomenclatura,
      descripcion: item.descripcion,
      componente_id: item.componente_id,
      activo: item.activo ?? true,
      component: item.component
    }));
    return criterios;
  }

  /**
   * Obtener evidencias por criterio
   */
  async obtenerEvidenciasPorCriterio(criterioId: number): Promise<Evidencia[]> {
    const response = await axiosInstance.get<{ data: Evidencia[] }>('/estructura/evidencias', {
      params: { criterio_id: criterioId },
    });
    const evidencias = (response.data.data || response.data) as Evidencia[];
    return (evidencias || []).filter(e => e.criterio_id === criterioId);
  }

  /**
   * Obtener evidencia por ID
   */
  async obtenerEvidencia(id: number): Promise<Evidencia | null> {
    const response = await axiosInstance.get<{ data: Evidencia }>(`/estructura/evidencias/${id}`);
    return (response.data.data || response.data) as Evidencia;
  }

  /**
   * Obtener todas las evidencias activas
   */
  async obtenerTodasEvidencias(params?: { activo?: boolean }): Promise<Evidencia[]> {
    const response = await axiosInstance.get<{ data: Evidencia[] }>('/estructura/evidencias', {
      params,
    });
    return response.data.data || response.data as any;
  }

  // ============================================
  // Utilidades
  // ============================================

  /**
   * Convertir los criterios seleccionados del formulario al formato del backend
   */
  transformarCriteriosParaBackend(criterios: any[]): CrearCompromisoPayload['selecciones'] {
    return criterios.map(criterio => ({
      entidad_tipo: 'CRITERIO' as const,
      entidad_id: criterio.criterio_id,
    }));
  }

  /**
   * Convertir las evidencias asignadas del formulario al formato del backend
   */
  transformarEvidenciasParaBackend(criterios: any[]): CrearCompromisoPayload['evidencias_asignar'] {
    const evidenciasAsignar: CrearCompromisoPayload['evidencias_asignar'] = [];

    criterios.forEach(criterio => {
      criterio.evidencias_seleccionadas.forEach((evidenciaId: number) => {
        evidenciasAsignar.push({
          evidencia_id: evidenciaId,
          usuarios: criterio.encargados_usuarios || [],
          roles: criterio.encargados_roles || [],
          fecha_limite: criterio.fecha_limite,
          comentario: criterio.comentario,
        });
      });
    });

    return evidenciasAsignar;
  }
}

// Exportar instancia única del servicio
export const improvementCommitmentService = new ImprovementCommitmentService();

