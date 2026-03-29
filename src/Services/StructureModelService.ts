/**
 * StructureModelService - Servicio para modelos de estructura y elementos flexibles
 */

import { axiosInstance } from '@/Config/axios';
import type {
  StructureModel,
  FlexibleElement,
  CreateModelForm,
  EditModelForm,
  CreateFlexibleElementForm,
  EditFlexibleElementForm,
} from '@/Types/StructureModelTypes';

// ── Modelos ──────────────────────────────────────────────────────────────────

export async function getAllModels(): Promise<StructureModel[]> {
  const { data } = await axiosInstance.get('/estructura/modelos');
  return Array.isArray(data) ? data : (data.data ?? []);
}

export async function createModel(payload: CreateModelForm): Promise<StructureModel> {
  const { data } = await axiosInstance.post('/estructura/modelos', {
    ...payload,
    tipo: 'elemento_flexible',
  });
  return data.data ?? data;
}

export async function updateModel(id: number, payload: EditModelForm): Promise<void> {
  await axiosInstance.put(`/estructura/modelos/${id}`, payload);
}

export async function toggleModelActive(id: number, active: boolean): Promise<void> {
  await axiosInstance.patch(`/estructura/modelos/${id}/active`, { active });
}

export async function deleteModel(id: number, confirmacion: string): Promise<void> {
  await axiosInstance.delete(`/estructura/modelos/${id}`, {
    data: { confirmacion },
  });
}

// ── Elementos flexibles ───────────────────────────────────────────────────────

export async function getElementsByModel(modelId: number): Promise<FlexibleElement[]> {
  const { data } = await axiosInstance.get('/estructura/elementos', {
    params: { modelo_estructura_id: modelId },
  });
  return Array.isArray(data) ? data : (data.data ?? []);
}

export async function createElement(payload: CreateFlexibleElementForm): Promise<FlexibleElement> {
  const { data } = await axiosInstance.post('/estructura/elementos', payload);
  return data.data ?? data;
}

export async function updateElement(id: number, payload: EditFlexibleElementForm): Promise<FlexibleElement> {
  const { data } = await axiosInstance.put(`/estructura/elementos/${id}`, payload);
  return data.data ?? data;
}

export async function deleteElement(id: number): Promise<void> {
  await axiosInstance.delete(`/estructura/elementos/${id}`);
}

export async function toggleElementActive(id: number, active: boolean): Promise<void> {
  await axiosInstance.patch(`/estructura/elementos/${id}/active`, { active });
}
