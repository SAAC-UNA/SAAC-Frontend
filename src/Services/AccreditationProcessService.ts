import { axiosInstance } from "@/Config/axios";
import type {
  AccreditationCycle,
  AccreditationProcess,
  AccreditationProcessDeletePayload,
  AccreditationProcessApiPayload,
} from "@/Types/AccreditationProcessTypes";

interface ApiError extends Error {
  status?: number;
}

type RawRecord = Record<string, unknown>;

interface ApiListResponse {
  data?: unknown;
}

const PROCESS_ENDPOINT = "/estructura/procesos";
const CYCLE_ENDPOINT = "/estructura/ciclos-acreditacion";

const processTypeFromApi = (value: string | undefined): string => {
  if (!value) return "Autoevaluación";
  return value;
};

const mapProcess = (item: RawRecord): AccreditationProcess => {
  const cycleData =
    (item.accreditation_cycle as RawRecord) ||
    (item.accreditationCycle as RawRecord) ||
    {};
  const careerCampus =
    (cycleData.career_campus as RawRecord) ||
    (cycleData.careerCampus as RawRecord) ||
    {};
  const career = (careerCampus.career as RawRecord) || {};
  const campus = (careerCampus.campus as RawRecord) || {};
  const cycleName =
    (cycleData.nombre as string) ||
    `Ciclo ${String(item.ciclo_acreditacion_id ?? "")}`;

  return {
    id: String(item.proceso_id ?? item.id),
    type: processTypeFromApi(item.tipo_proceso as string | undefined),
    description: (item.descripcion as string | undefined) ?? undefined,
    accreditationCycleId: String(
      item.ciclo_acreditacion_id ?? cycleData.ciclo_acreditacion_id ?? "",
    ),
    accreditationCycleName: cycleName,
    careerName: career.nombre as string | undefined,
    campusName: campus.nombre as string | undefined,
    status: (item.activo as boolean) ? "activo" : "inactivo",
    startDate: item.fecha_inicio ? String(item.fecha_inicio).slice(0, 10) : "",
    estimatedEndDate: item.fecha_finalizacion
      ? String(item.fecha_finalizacion).slice(0, 10)
      : "",
    createdAt: item.created_at ? String(item.created_at) : "",
    updatedAt: item.updated_at ? String(item.updated_at) : "",
    modeloEstructuraId: String(
      (cycleData.modelo_estructura_id as number | undefined) ??
      ((cycleData.modelo_estructura as RawRecord)?.modelo_estructura_id as number | undefined) ??
      ""
    ) || undefined,
    modeloEstructuraTipo: ((cycleData.modelo_estructura as RawRecord)?.tipo as string | undefined),
  };
};

const mapCycle = (item: RawRecord): AccreditationCycle => {
  // Backend returns key `carrera_sede` (AccreditationCycleResource)
  const careerCampus =
    (item.career_campus as RawRecord) ||
    (item.careerCampus as RawRecord) ||
    (item.carrera_sede as RawRecord) ||
    {};
  const career = (careerCampus.career as RawRecord) || {};
  const campus = (careerCampus.campus as RawRecord) || {};

  return {
    id: String(item.ciclo_acreditacion_id ?? item.id),
    name:
      (item.nombre as string) ||
      `Ciclo ${String(item.ciclo_acreditacion_id ?? item.id)}`,
    careerName:
      (career.nombre as string | undefined) ||
      (careerCampus.carrera_nombre as string | undefined) ||
      (item.carrera_nombre as string | undefined),
    campusName:
      (campus.nombre as string | undefined) ||
      (careerCampus.sede_nombre as string | undefined) ||
      (item.sede_nombre as string | undefined),
    modeloEstructuraId: String(item.modelo_estructura_id ?? "") || undefined,
    modeloEstructuraTipo: ((item.modelo_estructura as RawRecord)?.tipo as string | undefined),
  };
};

const toApiError = (error: unknown, fallbackMessage: string): ApiError => {
  const response = (
    error as {
      response?: {
        status?: number;
        data?: { message?: string; errorMessage?: string };
      };
    }
  )?.response;

  const apiError = new Error(
    response?.data?.message || response?.data?.errorMessage || fallbackMessage,
  ) as ApiError;

  apiError.status = response?.status;
  return apiError;
};

const toArray = (raw: unknown): RawRecord[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is RawRecord => typeof item === "object" && item !== null,
  );
};

class AccreditationProcessService {
  async getProcesses(): Promise<AccreditationProcess[]> {
    try {
      const response =
        await axiosInstance.get<ApiListResponse>(PROCESS_ENDPOINT);
      const raw = response.data?.data ?? response.data ?? [];
      return toArray(raw).map(mapProcess);
    } catch (error: unknown) {
      throw toApiError(
        error,
        "No se pudieron cargar los procesos de acreditación.",
      );
    }
  }

  async getCycles(): Promise<AccreditationCycle[]> {
    try {
      const response = await axiosInstance.get<ApiListResponse>(CYCLE_ENDPOINT, {
        params: { per_page: 50 },
      });
      const raw = response.data?.data ?? response.data ?? [];
      return toArray(raw).map(mapCycle);
    } catch (error: unknown) {
      throw toApiError(
        error,
        "No se pudieron cargar los ciclos de acreditación.",
      );
    }
  }

  async createProcess(
    payload: AccreditationProcessApiPayload,
  ): Promise<AccreditationProcess> {
    try {
      const response = await axiosInstance.post<ApiListResponse>(
        PROCESS_ENDPOINT,
        payload,
      );
      const raw = (response.data?.data ?? response.data) as RawRecord;
      return mapProcess(raw);
    } catch (error: unknown) {
      throw toApiError(error, "No se pudo crear el proceso.");
    }
  }

  async updateProcess(
    processId: string,
    payload: AccreditationProcessApiPayload,
  ): Promise<AccreditationProcess> {
    try {
      const response = await axiosInstance.put<ApiListResponse>(
        `${PROCESS_ENDPOINT}/${processId}`,
        payload,
      );
      const raw = (response.data?.data ?? response.data) as RawRecord;
      return mapProcess(raw);
    } catch (error: unknown) {
      throw toApiError(error, "No se pudo actualizar el proceso.");
    }
  }

  async deleteProcess(
    processId: string,
    payload: AccreditationProcessDeletePayload,
  ): Promise<void> {
    try {
      await axiosInstance.delete(`${PROCESS_ENDPOINT}/${processId}`, {
        data: payload,
      });
    } catch (error: unknown) {
      throw toApiError(error, "No se pudo eliminar el proceso.");
    }
  }
}

export const accreditationProcessService = new AccreditationProcessService();
