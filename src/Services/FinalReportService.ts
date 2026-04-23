import { axiosInstance } from "@/Config/axios";
import type {
  Archivo,
} from "@/Pages/ReportManagement/Components/FinalReportsTable";

export type ApprovalStatus = "pendiente" | "aprobado" | "rechazado";

export interface Proceso {
  proceso_id: number;
  tipo_proceso: string;
  accreditation_cycle: {
    ciclo_acreditacion_id: number;
    nombre: string;
    modelo_estructura?: {
      modelo_estructura_id: number;
      tipo: string;
    };
    career_campus: {
      career: {
        nombre: string;
      };
      campus: {
        nombre: string;
      };
    };
  };
}

class FinalReportService {
  async getProcesses(): Promise<Proceso[]> {
    const response = await axiosInstance.get("/estructura/procesos");
    return response.data.data || response.data;
  }

  async getFlexibleElements(modeloId: number) {
    const response = await axiosInstance.get(
      `/estructura/elementos?modelo_estructura_id=${modeloId}`,
    );
    return response.data.data || response.data;
  }

  async getElementApprovals() {
    const response = await axiosInstance.get("/aprobaciones-elementos");
    return response.data.data || response.data;
  }

  async getCriteria() {
    const response = await axiosInstance.get("/estructura/criterios");
    return response.data.data || response.data;
  }

  async getEvidences() {
    const response = await axiosInstance.get("/estructura/evidencias");
    return response.data.data || response.data;
  }

  async getCriteriaApprovals() {
    const response = await axiosInstance.get("/aprobaciones-criterios");
    return response.data.data || response.data;
  }

  async getFiles(nodeId: number, procesoId: number, isFlexible: boolean): Promise<Archivo[]> {
    const endpoint = isFlexible ? "/elementos-archivos" : "/archivos";
    const params = {
      [isFlexible ? "elemento_id" : "evidencia_id"]: nodeId,
      proceso_id: procesoId,
    };
    const response = await axiosInstance.get(endpoint, { params });
    return response.data.data || response.data;
  }

  async makeBulkPublic(archivosIds: number[]) {
    return await axiosInstance.post("/archivos/bulk-make-public", {
      archivos_ids: archivosIds,
    });
  }
}

export const finalReportService = new FinalReportService();
