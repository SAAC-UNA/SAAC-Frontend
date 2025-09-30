// src/Services/StructureService.ts
import type {
  ElementType,
  StructureElement,
  CreateElementForm,
  EditElementForm,
  StructureSearchCriteria,
} from '@/Types/StructureTypes';

export interface ApiResponse<T = any> {
  message?: string;
  errorMessage?: string;
  data?: T;
}

const TYPE_TO_PATH: Record<ElementType, string> = {
  university: 'universidades',
  campus: 'campus',
  faculty: 'facultades',
  career: 'carreras',
  dimension: 'dimensiones',
  component: 'componentes',
  criteria: 'criterios',
  standard: 'estandares',
  evidence: 'evidencias',
};

class StructureService {
  private baseURL: string;

  constructor() {
    // Igual que RoleService
    this.baseURL = 'http://127.0.0.1:8000/api/estructura';
  }

  // --------- Utilidades ----------
  private getPath(type: ElementType) {
    return TYPE_TO_PATH[type];
  }

  private async handle<T>(req: Promise<Response>): Promise<ApiResponse<T>> {
    const res = await req;
    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        errorMessage = body?.errorMessage || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }
    return res.json();
  }

  // --------- CRUD por tipo ----------
  list(type: ElementType, params?: Record<string, string | number | boolean>) {
    const qs = params
      ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : '';
    return this.handle<StructureElement[]>(
      fetch(`${this.baseURL}/${this.getPath(type)}${qs}`, { method: 'GET', headers: { Accept: 'application/json' } })
    );
  }

  getById(type: ElementType, id: string) {
    return this.handle<StructureElement>(
      fetch(`${this.baseURL}/${this.getPath(type)}/${id}`, { method: 'GET', headers: { Accept: 'application/json' } })
    );
  }

  create(payload: CreateElementForm) {
    // Valida jerarquía en UI con tus reglas antes de llamar (getRequiredParentType, etc.)
    return this.handle<StructureElement>(
      fetch(`${this.baseURL}/${this.getPath(payload.type)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
    );
  }

  update(type: ElementType, id: string, payload: EditElementForm) {
    return this.handle<StructureElement>(
      fetch(`${this.baseURL}/${this.getPath(type)}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
    );
  }

  remove(type: ElementType, id: string) {
    return this.handle<null>(
      fetch(`${this.baseURL}/${this.getPath(type)}/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' } })
    );
  }

  // --------- Acciones y consultas globales ----------
  activate(type: ElementType, id: string) {
    return this.handle<StructureElement>(
      fetch(`${this.baseURL}/${this.getPath(type)}/${id}/activar`, { method: 'PATCH', headers: { Accept: 'application/json' } })
    );
  }

  deactivate(type: ElementType, id: string) {
    return this.handle<StructureElement>(
      fetch(`${this.baseURL}/${this.getPath(type)}/${id}/desactivar`, { method: 'PATCH', headers: { Accept: 'application/json' } })
    );
  }

  search(criteria: StructureSearchCriteria & { page?: number; pageSize?: number }) {
    const qs = new URLSearchParams();
    Object.entries(criteria).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
    });
    return this.handle<{ elements: StructureElement[]; total: number }>(
      fetch(`${this.baseURL}/search?` + qs.toString(), { method: 'GET', headers: { Accept: 'application/json' } })
    );
  }

  tree(rootType?: ElementType, rootId?: string) {
    const qs = new URLSearchParams();
    if (rootType) qs.append('rootType', rootType);
    if (rootId) qs.append('rootId', rootId);
    return this.handle<StructureElement[]>(
      fetch(`${this.baseURL}/tree?` + qs.toString(), { method: 'GET', headers: { Accept: 'application/json' } })
    );
  }

  batch(operation: 'activate'|'deactivate'|'delete', elementIds: string[]) {
    return this.handle<null>(
      fetch(`${this.baseURL}/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ operation, elementIds }),
      })
    );
  }
}

export const structureService = new StructureService();
