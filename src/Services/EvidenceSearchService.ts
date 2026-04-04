/**
 * EvidenceSearchService - Servicio para búsqueda avanzada de evidencias
 * HU-012: Filtrado Avanzado de Evidencias
 */

import { axiosInstance } from '../Config/axios';
import type {
  EvidenceSearchFilters,
  EvidencePublicationStatus
} from '@/Types/EvidenceSearchTypes';

interface SearchParams {
  // Filtros jerárquicos
  dimension_id?: number;
  componente_id?: number;
  criterio_id?: number;
  responsable_id?: number;
  fecha_desde?: string; // YYYY-MM-DD
  fecha_hasta?: string; // YYYY-MM-DD
  estado?: string; // PascalCase — valor del enum EVIDENCIA.estado
  rol_id?: number;
  
  // Ordenamiento
  sort_by?: 'nomenclatura' | 'descripcion' | 'fecha' | 'estado';
  sort_order?: 'asc' | 'desc';
  
  // Paginación
  per_page?: number;
  page?: number;
}

interface BackendResponsable {
  usuario_id: number;
  nombre: string;
  email: string;
}

interface BackendEvidenceResult {
  evidencia_id: number;
  criterio_id?: number;
  nomenclatura: string;
  descripcion: string;
  // El backend devuelve estado como string PascalCase (EVIDENCIA.estado enum)
  estado?: string;
  criterion?: {  // Backend usa 'criterion' no 'criterio'
    id: number;
    nomenclatura: string;
    descripcion: string;
    estado?: string; // Estado del criterio (Pendiente/En Proceso/Completado)
  };
  responsables?: BackendResponsable[];
  roles_acceso?: string[];
  fecha_publicacion: string;
  created_at: string;
  updated_at: string;
  archivos_count?: number;
  enlaces_count?: number;
}

interface PaginatedResponse {
  data: BackendEvidenceResult[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

// Valores válidos del enum EVIDENCIA.estado (PascalCase)
const ESTADOS_VALIDOS = new Set<string>([
  'Pendiente', 'En Proceso', 'Completado', 'Vencido',
  'Aprobado', 'Rechazado', 'Observada', 'Validada'
]);

export const evidenceSearchService = {
  /**
   * Buscar evidencias con filtros
   */
  async search(
    filters: EvidenceSearchFilters,
    page: number = 1,
    perPage: number = 10
  ): Promise<PaginatedResponse> {
    const params: SearchParams = {
      page,
      per_page: perPage,
    };

    // Mapear filtros del frontend a parámetros del backend
    if (filters.dimension_id) {
      params.dimension_id = filters.dimension_id;
    }

    if (filters.componente_id) {
      params.componente_id = filters.componente_id;
    }

    if (filters.criterio) {
      params.criterio_id = parseInt(filters.criterio);
    }

    if (filters.responsable_id) {
      params.responsable_id = filters.responsable_id;
    }

    if (filters.fecha_publicacion_desde) {
      params.fecha_desde = filters.fecha_publicacion_desde;
    }

    if (filters.fecha_publicacion_hasta) {
      params.fecha_hasta = filters.fecha_publicacion_hasta;
    }

    if (filters.estado && filters.estado !== 'todos') {
      params.estado = filters.estado;
    }

    if (filters.rol_id) {
      params.rol_id = filters.rol_id;
    }

    const response = await axiosInstance.get<PaginatedResponse>('/estructura/evidencias/filter', { 
      params,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
  },

  /**
   * Exportar evidencias a Excel
   */
  async exportExcel(filters: EvidenceSearchFilters): Promise<void> {
    const params: SearchParams = {};

    // Aplicar mismos filtros que en search
    if (filters.criterio) {
      params.criterio_id = parseInt(filters.criterio);
    }
    if (filters.responsable_id) {
      params.responsable_id = filters.responsable_id;
    }
    if (filters.fecha_publicacion_desde) {
      params.fecha_desde = filters.fecha_publicacion_desde;
    }
    if (filters.fecha_publicacion_hasta) {
      params.fecha_hasta = filters.fecha_publicacion_hasta;
    }
    if (filters.estado && filters.estado !== 'todos') {
      params.estado = filters.estado;
    }
    if (filters.rol_id) {
      params.rol_id = filters.rol_id;
    }

    // Descargar archivo
    const response = await axiosInstance.get('/estructura/evidencias/export/excel', {
      params,
      responseType: 'blob'
    });

    // Crear URL de descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `evidencias_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Exportar evidencias a PDF
   */
  async exportPDF(filters: EvidenceSearchFilters): Promise<void> {
    const params: SearchParams = {};

    // Aplicar mismos filtros
    if (filters.criterio) {
      params.criterio_id = parseInt(filters.criterio);
    }
    if (filters.responsable_id) {
      params.responsable_id = filters.responsable_id;
    }
    if (filters.fecha_publicacion_desde) {
      params.fecha_desde = filters.fecha_publicacion_desde;
    }
    if (filters.fecha_publicacion_hasta) {
      params.fecha_hasta = filters.fecha_publicacion_hasta;
    }
    if (filters.estado && filters.estado !== 'todos') {
      params.estado = filters.estado;
    }
    if (filters.rol_id) {
      params.rol_id = filters.rol_id;
    }

    const response = await axiosInstance.get('/estructura/evidencias/export/pdf', {
      params,
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `evidencias_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

/**
 * Mapear respuesta del backend a tipo del frontend
 */
export function mapBackendToFrontend(backendData: BackendEvidenceResult) {
  return {
    evidencia_id: backendData.evidencia_id,
    criterio_id: backendData.criterio_id ?? 0,
    nomenclatura: backendData.nomenclatura || '',
    criterio_nomenclatura: backendData.criterion?.nomenclatura || 'N/A',
    criterio_descripcion: backendData.criterion?.descripcion || 'Sin descripción',
    descripcion: backendData.descripcion,
    responsables: backendData.responsables || [], // Array completo de responsables
    fecha_publicacion: backendData.created_at || backendData.fecha_publicacion,
    // estado viene como string PascalCase del enum EVIDENCIA.estado
    estado: (backendData.estado && ESTADOS_VALIDOS.has(backendData.estado)
      ? backendData.estado
      : 'Pendiente') as EvidencePublicationStatus,
    archivos_count: backendData.archivos_count || 0,
    enlaces_count: backendData.enlaces_count || 0,
    roles_acceso: backendData.roles_acceso || [],
    created_at: backendData.created_at,
    updated_at: backendData.updated_at
  };
}

/**
 * Servicio para obtener opciones de filtros dinámicos
 */
export const evidenceSearchFiltersService = {
  /**
   * Obtener lista de criterios para el filtro
   */
  async getCriterios(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await axiosInstance.get('/estructura/criterios');
      const data = response.data.data || response.data || [];
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      return data
        .filter((criterio: any) => criterio && criterio.id)
        .map((criterio: any) => ({
          value: criterio.id.toString(),
          label: `${criterio.nomenclatura || 'Sin nomenclatura'} - ${criterio.descripcion || 'Sin descripción'}`,
        }));
    } catch (error) {
      console.error('❌ Error al cargar criterios:', error);
      return [];
    }
  },

  /**
   * Obtener lista de usuarios para el filtro de responsables
   */
  async getUsuarios(): Promise<Array<{ value: number; label: string }>> {
    try {
      const response = await axiosInstance.get('/admin/users');
      const data = response.data.data || response.data || [];
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      return data
        .filter((usuario: any) => usuario && usuario.id)
        .map((usuario: any) => ({
          value: usuario.id,
          label: usuario.name || usuario.email || 'Sin nombre',
        }));
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
      return [];
    }
  },

  /**
   * Obtener lista de roles para el filtro
   */
  async getRoles(): Promise<Array<{ value: number; label: string }>> {
    try {
      const response = await axiosInstance.get('/roles');
      const data = response.data.data || response.data || [];
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      return data
        .filter((role: any) => role && role.id)
        .map((role: any) => ({
          value: role.id,
          label: role.name || 'Sin nombre',
        }));
    } catch (error) {
      console.error('❌ Error al cargar roles:', error);
      return [];
    }
  },

  /**
   * Obtener lista de dimensiones para el filtro
   */
  async getDimensiones(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await axiosInstance.get('/estructura/dimensiones');
      const data = response.data.data || response.data || [];
      if (!Array.isArray(data)) return [];
      return data
        .filter((d: any) => d && d.dimension_id)
        .map((d: any) => ({
          value: d.dimension_id.toString(),
          label: `${d.nomenclatura} - ${d.nombre}`,
        }));
    } catch (error) {
      console.error('❌ Error al cargar dimensiones:', error);
      return [];
    }
  },

  /**
   * Obtener lista de componentes para el filtro
   */
  async getComponentes(): Promise<Array<{ value: string; label: string; dimension_id: number }>> {
    try {
      const response = await axiosInstance.get('/estructura/componentes');
      const data = response.data.data || response.data || [];
      if (!Array.isArray(data)) return [];
      return data
        .filter((c: any) => c && c.componente_id)
        .map((c: any) => ({
          value: c.componente_id.toString(),
          label: `${c.nomenclatura} - ${c.nombre}`,
          dimension_id: c.dimension_id,
        }));
    } catch (error) {
      console.error('❌ Error al cargar componentes:', error);
      return [];
    }
  },

  /**
   * Obtener lista de estados de evidencia — valores estáticos del enum EVIDENCIA.estado
   */
  getEstados(): Array<{ value: string; label: string }> {
    return [
      { value: 'Pendiente',   label: 'Pendiente' },
      { value: 'En Proceso',  label: 'En proceso' },
      { value: 'Completado',  label: 'Completado' },
      { value: 'Vencido',     label: 'Vencido' },
      { value: 'Aprobado',    label: 'Aprobado' },
      { value: 'Rechazado',   label: 'Rechazado' },
      { value: 'Observada',   label: 'Observada' },
      { value: 'Validada',    label: 'Validada' },
    ];
  }
};
