/**
 * CareerService - CRUD de Carreras
 *
 * Endpoints:
 *   GET    /estructura/carreras           → Career[] (con campuses.university eager-loaded)
 *   GET    /estructura/carreras/{id}      → Career (con campuses.university)
 *   POST   /estructura/carreras           → { message, data: Career }
 *   PUT    /estructura/carreras/{id}      → { message, data: Career }
 *   DELETE /estructura/carreras/{id}      → 204 | 409 (FK)
 *   PATCH  /estructura/carreras/{id}/active → { message, data: Career }
 *
 * Permisos: carreras.view | carreras.create | carreras.edit | carreras.delete
 */

import { axiosInstance } from '@/Config/axios';
import type {
  Career,
  CreateCareerForm,
  UpdateCareerForm,
} from '@/Types/InstitutionalStructureTypes';

export async function getAllCareers(): Promise<Career[]> {
  const { data } = await axiosInstance.get('/estructura/carreras');
  return Array.isArray(data) ? data : (data.data ?? []);
}

export async function getCareerById(id: number): Promise<Career> {
  const { data } = await axiosInstance.get(`/estructura/carreras/${id}`);
  return data.data ?? data;
}

export async function createCareer(payload: CreateCareerForm): Promise<Career> {
  const { data } = await axiosInstance.post('/estructura/carreras', payload);
  return data.data ?? data;
}

export async function updateCareer(id: number, payload: UpdateCareerForm): Promise<Career> {
  const { data } = await axiosInstance.put(`/estructura/carreras/${id}`, payload);
  return data.data ?? data;
}

export async function deleteCareer(id: number): Promise<void> {
  await axiosInstance.delete(`/estructura/carreras/${id}`);
}

export async function setCareerActive(id: number, active: boolean): Promise<Career> {
  const { data } = await axiosInstance.patch(`/estructura/carreras/${id}/active`, { active });
  return data.data ?? data;
}

/**
 * Busca una entrada en CARRERA_SEDE con los IDs dados o la crea si no existe.
 * Devuelve el carrera_sede_id resultante.
 */
export async function resolveOrCreateCareerCampus(carrera_id: number, sede_id: number): Promise<number> {
  const { data } = await axiosInstance.post('/estructura/carrera-sede', { carrera_id, sede_id });
  return data.carrera_sede_id as number;
}
