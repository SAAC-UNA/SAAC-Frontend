/**
 * AccreditationReportService — Comunicación con la API de Informes de Acreditación (HU-027)
 *
 * Rutas del backend:
 *   GET    /api/informes-acreditacion                              → fetchReports()
 *   GET    /api/estructura/ciclos-acreditacion/{cycle}/informe     → fetchReportByCycle()
 *   POST   /api/estructura/ciclos-acreditacion/{cycle}/informe     → publishReport()
 *   PATCH  /api/informes-acreditacion/{report}/despublicar         → unpublishReport()
 */

import { axiosInstance } from '@/Config/axios';
import type {
  AccreditationReportApi,
  PaginatedAccreditationReports,
  PublishReportPayload,
  ListReportsParams,
} from '@/Types/AccreditationReportTypes';

// ─── Listado público ─────────────────────────────────────────────────────────

export async function fetchReports(
  params: ListReportsParams = {}
): Promise<PaginatedAccreditationReports> {
  const { data } = await axiosInstance.get('/informes-acreditacion', { params });
  if (data && Array.isArray(data.data)) return data as PaginatedAccreditationReports;
  const items: AccreditationReportApi[] = Array.isArray(data) ? data : (data.data ?? []);
  return { data: items, current_page: 1, last_page: 1, total: items.length };
}

// ─── Informe de un ciclo específico ──────────────────────────────────────────

export async function fetchReportByCycle(
  cycleId: number
): Promise<AccreditationReportApi | null> {
  try {
    const { data } = await axiosInstance.get(
      `/estructura/ciclos-acreditacion/${cycleId}/informe`
    );
    return data.data ?? data;
  } catch (err: unknown) {
    if ((err as { response?: { status?: number } })?.response?.status === 404) return null;
    throw err;
  }
}

// ─── Publicar resolución ─────────────────────────────────────────────────────

export async function publishReport(
  cycleId: number,
  payload: PublishReportPayload
): Promise<AccreditationReportApi> {
  const formData = new FormData();
  formData.append('archivo', payload.archivo);
  formData.append('numero_resolucion', payload.numero_resolucion);
  formData.append('vigencia_desde', payload.vigencia_desde);
  formData.append('vigencia_hasta', payload.vigencia_hasta);
  formData.append('esta_acreditada', payload.esta_acreditada ? '1' : '0');
  if (payload.observaciones) {
    formData.append('observaciones', payload.observaciones);
  }

  const { data } = await axiosInstance.post(
    `/estructura/ciclos-acreditacion/${cycleId}/informe`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data.data ?? data;
}

// ─── Despublicar resolución ──────────────────────────────────────────────────

export async function unpublishReport(
  reportId: number,
  motivo?: string
): Promise<AccreditationReportApi> {
  const { data } = await axiosInstance.patch(
    `/informes-acreditacion/${reportId}/despublicar`,
    motivo ? { motivo } : {}
  );
  return data.data ?? data;
}
