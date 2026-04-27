/**
 * UniversityService - CRUD de Universidades
 *
 * Endpoints:
 *   GET    /estructura/universidades           → University[]
 *   GET    /estructura/universidades/{id}      → University
 *   POST   /estructura/universidades           → { message, data: University }
 *   PUT    /estructura/universidades/{id}      → { message, data: University }
 *   DELETE /estructura/universidades/{id}      → 204 | 409 (FK)
 *   PATCH  /estructura/universidades/{id}/active → { message, data: University }
 *
 * Permisos: universidades.view | universidades.create | universidades.edit | universidades.delete
 */

import { axiosInstance } from '@/Config/axios';
import type {
  University,
  CreateUniversityForm,
  UpdateUniversityForm,
} from '@/Types/InstitutionalStructureTypes';

export async function getAllUniversities(): Promise<University[]> {
  const { data } = await axiosInstance.get('/estructura/universidades');
  return Array.isArray(data) ? data : (data.data ?? []);
}

export async function getUniversityById(id: number): Promise<University> {
  const { data } = await axiosInstance.get(`/estructura/universidades/${id}`);
  return data.data ?? data;
}

export async function createUniversity(payload: CreateUniversityForm): Promise<University> {
  const { data } = await axiosInstance.post('/estructura/universidades', payload);
  return data.data ?? data;
}

export async function updateUniversity(id: number, payload: UpdateUniversityForm): Promise<University> {
  const { data } = await axiosInstance.put(`/estructura/universidades/${id}`, payload);
  return data.data ?? data;
}

export async function deleteUniversity(id: number): Promise<void> {
  await axiosInstance.delete(`/estructura/universidades/${id}`);
}

export async function setUniversityActive(id: number, active: boolean): Promise<University> {
  const { data } = await axiosInstance.patch(`/estructura/universidades/${id}/active`, { active });
  return data.data ?? data;
}
