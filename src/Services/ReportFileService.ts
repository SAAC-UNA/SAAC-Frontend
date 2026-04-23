import { axiosInstance } from "@/Config/axios";
import type {
  ReportFileApi,
  ReportFileListResponse,
  ReportFileSingleResponse,
} from "@/Types/ReportFileTypes";

const BASE_URL = "/informes-archivos";

const absoluteApiUrl = (path: string): string => {
  const base = (axiosInstance.defaults.baseURL ?? "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};

export const reportFileService = {
  async list(procesoId: number): Promise<ReportFileApi[]> {
    const { data } = await axiosInstance.get<ReportFileListResponse>(BASE_URL, {
      params: { proceso_id: procesoId },
    });

    return data.data ?? [];
  },

  async show(informeArchivoId: number): Promise<ReportFileApi> {
    const { data } = await axiosInstance.get<ReportFileSingleResponse>(
      `${BASE_URL}/${informeArchivoId}`,
    );

    return data.data;
  },

  async uploadFiles(procesoId: number, files: File[], tipo: string): Promise<ReportFileApi[]> {
    const formData = new FormData();
    formData.append("proceso_id", String(procesoId));
    formData.append("tipo", tipo);
    files.forEach((file) => formData.append("archivos[]", file));

    const { data } = await axiosInstance.post<{ data: ReportFileApi[] }>(
      BASE_URL,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    return data.data ?? [];
  },

  async makePublic(id: number, expiresAt?: string): Promise<ReportFileApi> {
    const { data } = await axiosInstance.post<ReportFileSingleResponse>(
      `${BASE_URL}/${id}/make-public`,
      expiresAt ? { expires_at: expiresAt } : {},
    );

    return data.data;
  },

  async revokePublic(id: number): Promise<ReportFileApi> {
    const { data } = await axiosInstance.post<ReportFileSingleResponse>(
      `${BASE_URL}/${id}/revoke-public`,
    );

    return data.data;
  },

  async remove(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  /** URL absoluta para abrir en nueva pestaña (cookies de sesión con mismo sitio). */
  getDownloadUrl(id: number): string {
    return absoluteApiUrl(`${BASE_URL}/${id}/download`);
  },
};
