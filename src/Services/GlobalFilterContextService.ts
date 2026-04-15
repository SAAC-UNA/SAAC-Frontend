import { axiosInstance } from "@/Config/axios";
import {
  getOperationalContextSnapshot,
  setOperationalContextSnapshot,
  clearOperationalContextIds,
} from "@/Services/OperationalContextStore";

export interface GlobalFilterContext {
  career_campus_id: number | null;
  ciclo_acreditacion_id: number | null;
  proceso_id: number | null;
}

export interface GlobalFilterCareer {
  carrera_sede_id: number;
  carrera_nombre: string;
  sede_nombre: string;
}

export interface GlobalFilterCycle {
  ciclo_acreditacion_id: number;
  nombre: string;
  estado: string;
  carrera_sede_id: number;
  modelo_tipo: string | null;
}

export interface GlobalFilterProcess {
  proceso_id: number;
  tipo_proceso: string;
  activo: boolean;
  ciclo_acreditacion_id: number;
}

export interface GlobalFilterCatalog {
  context: GlobalFilterContext;
  careers: GlobalFilterCareer[];
  cycles: GlobalFilterCycle[];
  processes: GlobalFilterProcess[];
}

interface ApiData<T> {
  data: T;
}

export const GLOBAL_FILTER_CONTEXT_CHANGED_EVENT =
  "saac:global-filter-context-changed";

export const MANUAL_CONTEXT_APPLIED_EVENT = "saac:manual-context-applied";

const emitContextChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(GLOBAL_FILTER_CONTEXT_CHANGED_EVENT));
  }
};

export const emitManualContextApplied = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MANUAL_CONTEXT_APPLIED_EVENT));
  }
};

const syncContextAndNotify = (
  snapshot: Parameters<typeof setOperationalContextSnapshot>[0],
) => {
  setOperationalContextSnapshot(snapshot);
  emitContextChanged();
};

const toApiContext = (): GlobalFilterContext => {
  const snapshot = getOperationalContextSnapshot();

  return {
    career_campus_id: snapshot.careerCampusId,
    ciclo_acreditacion_id: snapshot.cycleId,
    proceso_id: snapshot.processId,
  };
};

const syncContextIds = (context: GlobalFilterContext) => {
  setOperationalContextSnapshot({
    careerCampusId: context.career_campus_id,
    cycleId: context.ciclo_acreditacion_id,
    processId: context.proceso_id,
  });
};

export const globalFilterContextService = {
  async getContext(): Promise<GlobalFilterContext> {
    return toApiContext();
  },

  async getCatalog(): Promise<GlobalFilterCatalog> {
    const response = await axiosInstance.get<ApiData<GlobalFilterCatalog>>(
      "/contexto/filtros-globales/catalogo",
    );

    return {
      ...response.data.data,
      // Frontend is source of truth for active context selections.
      context: toApiContext(),
    };
  },

  async updateContext(
    payload: Partial<GlobalFilterContext>,
  ): Promise<GlobalFilterContext> {
    const current = toApiContext();
    const next: GlobalFilterContext = {
      career_campus_id:
        payload.career_campus_id !== undefined
          ? payload.career_campus_id
          : current.career_campus_id,
      ciclo_acreditacion_id:
        payload.ciclo_acreditacion_id !== undefined
          ? payload.ciclo_acreditacion_id
          : current.ciclo_acreditacion_id,
      proceso_id:
        payload.proceso_id !== undefined
          ? payload.proceso_id
          : current.proceso_id,
    };

    syncContextIds(next);
    emitContextChanged();

    return next;
  },

  async resetContext(): Promise<GlobalFilterContext> {
    clearOperationalContextIds();
    emitContextChanged();

    return {
      career_campus_id: null,
      ciclo_acreditacion_id: null,
      proceso_id: null,
    };
  },

  /**
   * Sync context snapshot and emit change event.
   * Used when loading catalog data to update labels for breadcrumb.
   */
  syncContextSnapshot(
    snapshot: Parameters<typeof setOperationalContextSnapshot>[0],
  ): void {
    syncContextAndNotify(snapshot);
  },
};
