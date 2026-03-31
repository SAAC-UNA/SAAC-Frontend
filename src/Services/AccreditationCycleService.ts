/**
 * AccreditationCycleService - Servicio para Ciclos de Acreditación (HU-030)
 */

import { axiosInstance } from '@/Config/axios';
import type {
  AccreditationCycle,
  CareerCampus,
  CreateAccreditationCycleForm,
  EditAccreditationCycleForm,
} from '@/Types/AccreditationCycleTypes';

export interface PaginatedCycles {
  data: AccreditationCycle[];
  current_page: number;
  last_page: number;
  total: number;
}

export async function getAllCycles(params: { page?: number; per_page?: number } = {}): Promise<PaginatedCycles> {
  const { data } = await axiosInstance.get('/estructura/ciclos-acreditacion', { params });
  // Backend returns Laravel paginator shape
  if (data && Array.isArray(data.data)) return data as PaginatedCycles;
  // Fallback for non-paginated response
  const items: AccreditationCycle[] = Array.isArray(data) ? data : (data.data ?? []);
  return { data: items, current_page: 1, last_page: 1, total: items.length };
}

export async function getCycleById(id: number): Promise<AccreditationCycle> {
  const { data } = await axiosInstance.get(`/estructura/ciclos-acreditacion/${id}`);
  return data.data ?? data;
}

export async function createCycle(payload: CreateAccreditationCycleForm): Promise<AccreditationCycle> {
  const { data } = await axiosInstance.post('/estructura/ciclos-acreditacion', payload);
  return data.data ?? data;
}

export async function updateCycle(id: number, payload: EditAccreditationCycleForm): Promise<AccreditationCycle> {
  const { data } = await axiosInstance.patch(`/estructura/ciclos-acreditacion/${id}`, payload);
  return data.data ?? data;
}

export async function deleteCycle(id: number, confirmacion: string): Promise<void> {
  await axiosInstance.delete(`/estructura/ciclos-acreditacion/${id}`, {
    data: { confirmacion },
  });
}

export async function reactivateCycle(id: number): Promise<AccreditationCycle> {
  const { data } = await axiosInstance.patch(`/estructura/ciclos-acreditacion/${id}/reactivar`);
  return data.data ?? data;
}

// ── Career Campuses ───────────────────────────────────────────────────────────

export async function getAllCareerCampuses(): Promise<CareerCampus[]> {
  const { data } = await axiosInstance.get('/estructura/carrera-sede');
  return Array.isArray(data) ? data : (data.data ?? []);
}
