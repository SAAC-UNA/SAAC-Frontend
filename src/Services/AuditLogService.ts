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
} from '../Types/AuditLogTypes';

class AuditLogService {
  private baseURL = '/api/bitacora';

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
      }

      const queryString = params.toString();
      const url = queryString ? `${this.baseURL}?${queryString}` : this.baseURL;

      const response = await axiosInstance.get<{ data: AuditLog[] } & Omit<AuditLogPaginatedResponse, 'data'>>(url);

      // El backend usa Laravel Resource con paginación estándar
      return {
        data: response.data.data,
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
        from: response.data.from,
        to: response.data.to,
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
   * ⚠️ NOTA: Este endpoint AÚN NO ESTÁ IMPLEMENTADO en el backend
   * Se debe agregar: GET /api/bitacora/export?format=pdf|excel
   * 
   * Endpoint planeado: GET /api/bitacora/export
   * Requiere: Rol Superusuario
   * 
   * @param format - Formato de exportación ('pdf' | 'excel')
   * @param filters - Filtros opcionales (se aplican a la exportación)
   * @returns Blob con el archivo generado
   */
  async exportAuditLogs(format: ExportFormat, filters?: AuditLogFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);

      // Agregar filtros si existen
      if (filters) {
        if (filters.usuario_id) params.append('usuario_id', filters.usuario_id.toString());
        if (filters.tipo_accion_id) params.append('tipo_accion_id', filters.tipo_accion_id.toString());
        if (filters.tipo_accion) params.append('tipo_accion', filters.tipo_accion);
        if (filters.modulo) params.append('modulo', filters.modulo);
        if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
        if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
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
      
      if (error.response?.status === 404 || error.response?.status === 501) {
        throw new Error('La funcionalidad de exportación aún no está disponible. Por favor, contacte al equipo de backend.');
      }
      
      throw new Error('Error al exportar registros de bitácora');
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
}

// Exportar instancia única del servicio
export default new AuditLogService();
