/**
 * Tipos para el sistema de notificaciones
 * HU-018 - Notificaciones automáticas
 */

export type TipoEvento = 
  | 'asignacion_evidencia'
  | 'carga_archivo'
  | 'vencimiento_plazo'
  | 'devolucion_observacion'
  | 'aprobacion_criterio'
  | 'aprobacion_evidencia'
  | 'rechazo_evidencia'
  | 'solicitud_ampliacion'
  | 'respuesta_ampliacion'
  | 'comentario_nuevo'
  | 'actualizacion_sistema'
  | 'asignacion_elemento'
  | 'aprobacion_elemento'
  | 'rechazo_elemento';

export type Canal = 'interno' | 'email' | 'ambos';

export type EstadoEmail = 'pendiente' | 'enviado' | 'fallido' | 'no_aplica';

export interface Notification {
  notificacion_id: number;
  tipo_evento: TipoEvento;
  canal: Canal;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_lectura: string | null;
  enlace: string | null;
  icono: string;
  color: string;
  es_critica: boolean;
  metadatos: Record<string, any> | null;
  created_at: string;
  relacionado: {
    tipo: string;
    id: number;
  } | null;
}

export interface NotificationFilters {
  leida?: boolean;
  tipo_evento?: TipoEvento;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface NotificationResponse {
  message: string;
  data: Notification[];
  total: number;
}

export interface UnreadCountResponse {
  message: string;
  data: {
    contador_no_leidas: number;
  };
}

/**
 * Etiquetas legibles para tipos de evento
 */
export const TIPO_EVENTO_LABELS: Record<TipoEvento, string> = {
  asignacion_evidencia: 'Asignación de Evidencia',
  carga_archivo: 'Carga de Archivo',
  vencimiento_plazo: 'Vencimiento de Plazo',
  devolucion_observacion: 'Devolución con Observación',
  aprobacion_criterio: 'Aprobación de Criterio',
  aprobacion_evidencia: 'Aprobación de Evidencia',
  rechazo_evidencia: 'Rechazo de Evidencia',
  solicitud_ampliacion: 'Solicitud de Ampliación',
  respuesta_ampliacion: 'Respuesta a Ampliación',
  comentario_nuevo: 'Nuevo Comentario',
  actualizacion_sistema: 'Actualización del Sistema',
  asignacion_elemento: 'Asignación de Elemento',
  aprobacion_elemento: 'Aprobación de Elemento',
  rechazo_elemento: 'Rechazo de Elemento',
};
