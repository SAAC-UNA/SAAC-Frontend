/**
 * FeedbackService — HU-013: Retroalimentación de Evidencias
 *
 * Servicio para que el encargado de acreditación marque una evidencia como
 * 'Observada' (requiere corrección) o 'Validada' (aprobada formalmente),
 * adjuntando obligatoriamente un comentario de 5–800 caracteres.
 *
 * Endpoint: POST /api/estructura/evidencias/{id}/retroalimentacion
 * Roles autorizados: Encargado de Acreditación, Administrador, Superusuario
 */

import { axiosInstance } from '@/Config/axios';
import type { EvidencePublicationStatus } from '@/Types/EvidenceSearchTypes';

/** Estados que puede asignar el evaluador mediante este endpoint */
export type FeedbackEstado = 'Observada' | 'Validada';

export interface FeedbackPayload {
  estado: FeedbackEstado;
  comentario: string;
}

export interface Comentario {
  id: number;
  texto: string;
  usuario_id: number;
  autor: string | null;
  fecha: string;
}

export interface EvidenciaRetroalimentada {
  evidencia_id: number;
  estado: EvidencePublicationStatus;
  nomenclatura: string;
  descripcion: string;
  activo: boolean;
  fecha_publicacion: string;
  updated_at: string;
  criterion: {
    id: number;
    nomenclatura: string;
    descripcion: string;
    estado?: string;
    activo: boolean;
  } | null;
  comentarios: Comentario[];
}

class FeedbackService {
  /**
   * Enviar retroalimentación sobre una evidencia.
   *
   * @param evidenciaId  ID de la evidencia a retroalimentar
   * @param payload      Estado ('Observada' | 'Validada') + comentario
   * @returns            La evidencia actualizada con sus comentarios
   *
   * @throws 403 si el usuario no tiene rol autorizado
   * @throws 404 si la evidencia no existe
   * @throws 422 si el estado es inválido o la evidencia está en estado no revisable
   */
  async retroalimentar(
    evidenciaId: number,
    payload: FeedbackPayload
  ): Promise<EvidenciaRetroalimentada> {
    const response = await axiosInstance.post<{ data: EvidenciaRetroalimentada }>(
      `/estructura/evidencias/${evidenciaId}/retroalimentacion`,
      payload
    );
    return response.data.data;
  }
}

export const feedbackService = new FeedbackService();
