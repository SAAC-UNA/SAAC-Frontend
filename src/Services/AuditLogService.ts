/**
 * AuditLogService - Servicio para gestión de la Bitácora del Sistema (HU-005)
 * 
 * Funcionalidades:
 * - Consultar registros con filtros
 * - Ver detalle de un registro
 * - Exportar a PDF/Excel (preparado para cuando backend lo implemente)
 */

import { axiosInstance } from '../Config/axios';
import type {
  AuditLog,
  AuditLogFilters,
  AuditLogPaginatedResponse,
  ExportFormat,
  ActionType,
} from '../Types/AuditLogTypes';

class AuditLogService {
  private baseURL = '/bitacora';

  /**
   * Obtener listado de registros de bitácora con filtros opcionales
   * 
   * Endpoint: GET /api/bitacora
   * Requiere: Rol Superusuario
   * 
   * @param filters - Filtros opcionales (usuario_id, tipo_accion_id, modulo, fechas, paginación)
   * @returns Respuesta paginada con registros de bitácora
   */
  async getAuditLogs(filters?: AuditLogFilters): Promise<AuditLogPaginatedResponse> {
    try {
      const params = new URLSearchParams();

      // Agregar filtros si existen
      if (filters) {
        if (filters.usuario_id) params.append('usuario_id', filters.usuario_id.toString());
        if (filters.tipo_accion_id) params.append('tipo_accion_id', filters.tipo_accion_id.toString());
        if (filters.tipo_accion) params.append('tipo_accion', filters.tipo_accion);
        if (filters.modulo) params.append('modulo', filters.modulo);
        if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
        if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.per_page) params.append('per_page', filters.per_page.toString());
        if (filters.search) params.append('search', filters.search);
      }

      const queryString = params.toString();
      const url = queryString ? `${this.baseURL}?${queryString}` : this.baseURL;

      const response = await axiosInstance.get<{
        data: AuditLog[];
        meta: {
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
          from: number;
          to: number;
        };
      }>(url);

      // El backend devuelve la paginación dentro de "meta"
      return {
        data: response.data.data,
        current_page: response.data.meta.current_page,
        last_page: response.data.meta.last_page,
        per_page: response.data.meta.per_page,
        total: response.data.meta.total,
        from: response.data.meta.from,
        to: response.data.meta.to,
      };
    } catch (error: any) {
      console.error('Error obteniendo registros de bitácora:', error);
      
      // Manejo de errores específicos
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado. Solo usuarios con rol Superusuario pueden consultar la bitácora.');
      }
      
      throw new Error(error.response?.data?.message || 'Error al obtener registros de bitácora');
    }
  }

  /**
   * Obtener detalle de un registro específico de bitácora
   * 
   * Endpoint: GET /api/bitacora/{id}
   * Requiere: Rol Superusuario
   * 
   * @param id - ID del registro de bitácora
   * @returns Registro de bitácora con detalles completos
   */
  async getAuditLogById(id: number): Promise<AuditLog> {
    try {
      const response = await axiosInstance.get<{ data: AuditLog }>(`${this.baseURL}/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Error obteniendo registro de bitácora ${id}:`, error);
      
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado. Solo usuarios con rol Superusuario pueden consultar la bitácora.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Registro de bitácora no encontrado.');
      }
      
      throw new Error(error.response?.data?.message || 'Error al obtener detalle del registro');
    }
  }

  /**
   * Exportar registros de bitácora a PDF o Excel
   * 
   * Endpoint: GET /api/bitacora/export
   * Requiere: Rol Superusuario
   * ⚠️ IMPORTANTE: Las fechas son OBLIGATORIAS para exportar
   * 
   * @param format - Formato de exportación ('pdf' | 'excel')
   * @param fechaDesde - Fecha desde (OBLIGATORIA) formato YYYY-MM-DD
   * @param fechaHasta - Fecha hasta (OBLIGATORIA) formato YYYY-MM-DD
   * @param filters - Filtros adicionales opcionales
   * @returns Blob con el archivo generado
   */
  async exportAuditLogs(
    format: ExportFormat,
    fechaDesde: string,
    fechaHasta: string,
    filters?: Omit<AuditLogFilters, 'fecha_desde' | 'fecha_hasta'>
  ): Promise<Blob> {
    try {
      // Validación de fechas obligatorias
      if (!fechaDesde || !fechaHasta) {
        throw new Error('Las fechas desde y hasta son obligatorias para exportar');
      }

      const params = new URLSearchParams();
      params.append('format', format);
      params.append('fecha_desde', fechaDesde);
      params.append('fecha_hasta', fechaHasta);

      // Agregar filtros adicionales si existen
      if (filters) {
        if (filters.usuario_id) params.append('usuario_id', filters.usuario_id.toString());
        if (filters.tipo_accion_id) params.append('tipo_accion_id', filters.tipo_accion_id.toString());
        if (filters.tipo_accion) params.append('tipo_accion', filters.tipo_accion);
        if (filters.modulo) params.append('modulo', filters.modulo);
      }

      const response = await axiosInstance.get(`${this.baseURL}/export?${params.toString()}`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error: any) {
      console.error('Error exportando bitácora:', error);
      
      if (error.response?.status === 403) {
        throw new Error('Acceso denegado. Solo usuarios con rol Superusuario pueden exportar la bitácora.');
      }
      
      if (error.response?.status === 422) {
        // Error de validación del backend (fechas inválidas o límite excedido)
        const message = error.response?.data?.message || 'Error de validación en la exportación';
        throw new Error(message);
      }
      
      throw new Error(error.response?.data?.message || 'Error al exportar registros de bitácora');
    }
  }

  /**
   * Descargar archivo exportado
   * 
   * @param blob - Blob con el archivo
   * @param format - Formato del archivo
   * @param filename - Nombre del archivo (opcional)
   */
  downloadExportedFile(blob: Blob, format: ExportFormat, filename?: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const extension = format === 'excel' ? 'xlsx' : 'pdf';
    link.download = filename || `bitacora_${timestamp}.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Obtener catálogo de módulos disponibles
   * 
   * Endpoint: GET /api/bitacora/modulos
   * Requiere: Rol Superusuario
   * 
   * @returns Lista de módulos registrados en la bitácora
   */
  async getModules(): Promise<string[]> {
    try {
      const response = await axiosInstance.get<string[]>(`${this.baseURL}/modulos`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo módulos:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener módulos');
    }
  }

  /**
   * Obtener catálogo de tipos de acción disponibles
   * 
   * Endpoint: GET /api/bitacora/tipos-accion
   * Requiere: Rol Superusuario
   * 
   * @returns Lista de tipos de acción con ID y descripción
   */
  async getActionTypes(): Promise<ActionType[]> {
    try {
      const response = await axiosInstance.get<ActionType[]>(`${this.baseURL}/tipos-accion`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo tipos de acción:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener tipos de acción');
    }
  }
}

// Exportar instancia única del servicio
export default new AuditLogService();
