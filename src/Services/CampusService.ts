/**
 * CampusService - CRUD de Sedes (Campus)
 *
 * Endpoints:
 *   GET    /estructura/campuses                   → Campus[] (con university eager-loaded)
 *   GET    /estructura/campuses?universidad_id=#  → Campus[] filtrado por universidad
 *   GET    /estructura/campuses/{id}              → Campus (con university)
 *   POST   /estructura/campuses                   → { message, data: Campus }
 *   PUT    /estructura/campuses/{id}              → { message, data: Campus }
 *   DELETE /estructura/campuses/{id}              → 204 | 409 (FK)
 *
 * Permisos: campuses.view | campuses.create | campuses.edit | campuses.delete
 * Nota: setActive no está habilitado en el backend para sedes.
 */

import { axiosInstance } from '@/Config/axios';
import type {
  Campus,
  CreateCampusForm,
  UpdateCampusForm,
} from '@/Types/InstitutionalStructureTypes';

export async function getAllCampuses(universidadId?: number): Promise<Campus[]> {
  const params = universidadId !== undefined ? { universidad_id: universidadId } : undefined;
  const { data } = await axiosInstance.get('/estructura/campuses', { params });
  return Array.isArray(data) ? data : (data.data ?? []);
}

export async function getCampusById(id: number): Promise<Campus> {
  const { data } = await axiosInstance.get(`/estructura/campuses/${id}`);
  return data.data ?? data;
}

export async function createCampus(payload: CreateCampusForm): Promise<Campus> {
  const { data } = await axiosInstance.post('/estructura/campuses', payload);
  return data.data ?? data;
}

export async function updateCampus(id: number, payload: UpdateCampusForm): Promise<Campus> {
  const { data } = await axiosInstance.put(`/estructura/campuses/${id}`, payload);
  return data.data ?? data;
}

export async function deleteCampus(id: number): Promise<void> {
  await axiosInstance.delete(`/estructura/campuses/${id}`);
}
