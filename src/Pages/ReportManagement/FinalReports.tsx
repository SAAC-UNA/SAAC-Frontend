import React, { useState, useEffect, useMemo } from "react";
import { ScreenContainer, PageHeader } from "@/Components/Ui/Index";
import { LoadingSpinner } from "@/Components/Ui/Index";
import { ButtonWithTooltip } from "@/Components/Ui/Buttons/ButtonWithTooltip";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { axiosInstance } from "@/Config/axios";
import { config } from "@/Config/app.config";
import { PublicLinkModal } from "./Components/PublicLinkModal";
import { GenerateLinksConfirmModal } from "./Components/GenerateLinksConfirmModal";
import { DropdownButton } from "@/Components/Ui/Buttons/DropdownButton";
import type { DropdownOption } from "@/Components/Ui/Buttons/DropdownButton";
import { FinalReportsTable } from "./Components/FinalReportsTable";
import type {
  Criterio,
  Evidencia,
  Archivo,
} from "./Components/FinalReportsTable";
import { usePdfExport } from "@/Hooks/usePdfExport";
import { useToast } from "@/Context/ToastContext";
import { ICON_SIZES } from "@/Constants/Components";
import { globalFilterContextService } from "@/Services/GlobalFilterContextService";

type ApprovalStatus = "pendiente" | "aprobado" | "rechazado";

interface Proceso {
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

interface ContextInfo {
  careerLabel: string;
  cycleLabel: string;
  processLabel: string;
}

type ExportFormat = "pdf" | "excel";

const FinalReports: React.FC = () => {
  const moduleInfo = getModuleInfo("final_reports");
  const { exportToPdf: generatePdfReport } = usePdfExport();
  const { showToast } = useToast();

  const [dataState, setDataState] = useState<{
    isLoading: boolean;
    processes: Proceso[];
    criteria: Criterio[];
    evidences: Evidencia[];
  }>({ isLoading: true, processes: [], criteria: [], evidences: [] });
  const isLoading = dataState.isLoading;
  const processes = dataState.processes;
  const criteria = dataState.criteria;
  const evidences = dataState.evidences;
  const [selectedProcesoId, setSelectedProcesoId] = useState<number | null>(
    null,
  );
  const [contextInfo, setContextInfo] = useState<ContextInfo>({
    careerLabel: "",
    cycleLabel: "",
    processLabel: "",
  });
  const [contextLoading, setContextLoading] = useState<boolean>(true);
  const [uiState, setUiState] = useState<{
    loadingFiles: Set<number>;
  }>({ loadingFiles: new Set() });
  const loadingFiles = uiState.loadingFiles;

  const selectedProcess = useMemo(
    () =>
      processes.find((p: Proceso) => p.proceso_id === selectedProcesoId) ??
      null,
    [processes, selectedProcesoId],
  );
  const isFlexible =
    selectedProcess?.accreditation_cycle?.modelo_estructura?.tipo ===
    "elemento_flexible";

  const flexibleSourceElements = useMemo(() => {
    if (!isFlexible) return [] as Criterio[];

    const parentIds = new Set<number>();
    criteria.forEach((item) => {
      if (typeof item.padre_id === "number") {
        parentIds.add(item.padre_id);
      }
    });

    // En el modo flexible exportamos/generamos enlaces sobre fuentes (nodos hoja).
    return criteria.filter((item) => !parentIds.has(item.id));
  }, [criteria, isFlexible]);

  // Modal de enlaces públicos
  const [publicLinkModal, setPublicLinkModal] = useState<{
    open: boolean;
    archivo: Archivo | null;
    evidencia: Evidencia | null;
  }>({ open: false, archivo: null, evidencia: null });
  const publicLinkModalOpen = publicLinkModal.open;
  const selectedArchivo = publicLinkModal.archivo;
  const selectedEvidencia = publicLinkModal.evidencia;

  // Modal de confirmación para generar todos los enlaces
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    isGeneratingLinks: boolean;
  }>({ show: false, isGeneratingLinks: false });
  const showConfirmModal = confirmModal.show;
  const isGeneratingLinks = confirmModal.isGeneratingLinks;

  useEffect(() => {
    loadContext();
  }, []);

  useEffect(() => {
    if (contextLoading) {
      return;
    }

    fetchData();
  }, [selectedProcesoId, contextLoading]);

  const loadContext = async () => {
    setContextLoading(true);
    try {
      const catalog = await globalFilterContextService.getCatalog();
      const procesoId = catalog.context.proceso_id ?? null;
      const cicloId = catalog.context.ciclo_acreditacion_id ?? null;
      const carreraId = catalog.context.career_campus_id ?? null;

      setSelectedProcesoId(procesoId);

      const selectedProcess = catalog.processes.find(
        (process) => process.proceso_id === procesoId,
      );
      const selectedCycle = catalog.cycles.find(
        (cycle) => cycle.ciclo_acreditacion_id === cicloId,
      );
      const selectedCareer = catalog.careers.find(
        (career) => career.carrera_sede_id === carreraId,
      );

      const careerLabel = selectedCareer
        ? `${selectedCareer.carrera_nombre} - ${selectedCareer.sede_nombre}`
        : "";
      const cycleLabel = selectedCycle?.nombre ?? "";
      const processLabel = selectedProcess ? selectedProcess.tipo_proceso : "";

      // Sync context snapshot for breadcrumb and emit change event
      setContextInfo({ careerLabel, cycleLabel, processLabel });
      globalFilterContextService.syncContextSnapshot({
        careerCampusId: carreraId,
        cycleId: cicloId,
        processId: procesoId,
        careerLabel,
        cycleLabel,
        processLabel,
      });
    } catch {
      setSelectedProcesoId(null);
      setContextInfo({ careerLabel: "", cycleLabel: "", processLabel: "" });
    } finally {
      setContextLoading(false);
    }
  };

  const fetchData = async () => {
    if (!selectedProcesoId) {
      setDataState({
        isLoading: false,
        processes: [],
        criteria: [],
        evidences: [],
      });
      return;
    }

    try {
      setDataState((prev) => ({ ...prev, isLoading: true }));

      const processesResponse = await axiosInstance.get("/estructura/procesos");
      const processesArray =
        processesResponse.data.data || processesResponse.data;

      const selProc = processesArray.find(
        (p: any) => p.proceso_id === selectedProcesoId,
      );
      const flex =
        selProc?.accreditation_cycle?.modelo_estructura?.tipo ===
        "elemento_flexible";

      if (!selectedProcesoId || !selProc) {
        setDataState((prev) => ({
          ...prev,
          processes: processesArray,
          criteria: [],
          evidences: [],
        }));
        return;
      }

      if (flex) {
        const modeloId =
          selProc.accreditation_cycle.modelo_estructura!.modelo_estructura_id;
        const [elementosResponse, approvalsResponse] = await Promise.all([
          axiosInstance.get(
            `/estructura/elementos?modelo_estructura_id=${modeloId}`,
          ),
          axiosInstance.get("/aprobaciones-elementos"),
        ]);
        const elementosArray =
          elementosResponse.data.data || elementosResponse.data;
        const approvalsArray =
          approvalsResponse.data.data || approvalsResponse.data;

        const approvalsMap = new Map<string, ApprovalStatus>();
        approvalsArray.forEach((ap: any) => {
          approvalsMap.set(
            `${ap.elemento_id}-${ap.proceso_id}`,
            ap.estado as ApprovalStatus,
          );
        });

        const approvedElements = elementosArray
          .map((el: any) => ({
            id: el.elemento_id ?? el.id,
            padre_id: el.padre_id ?? null,
            tipo: el.tipo ?? null,
            nomenclatura: el.nomenclatura ?? "",
            descripcion: el.descripcion ?? el.nombre ?? "",
            estado_aprobacion:
              approvalsMap.get(
                `${el.elemento_id ?? el.id}-${selectedProcesoId}`,
              ) ?? "pendiente",
          }))
          .filter((el: any) => el.estado_aprobacion === "aprobado");

        setDataState((prev) => ({
          ...prev,
          processes: processesArray,
          criteria: approvedElements,
          evidences: [],
        }));
      } else {
        const [criteriaResponse, evidencesResponse, approvalsResponse] =
          await Promise.all([
            axiosInstance.get("/estructura/criterios"),
            axiosInstance.get("/estructura/evidencias"),
            axiosInstance.get("/aprobaciones-criterios"),
          ]);
        const criteriaArray =
          criteriaResponse.data.data || criteriaResponse.data;
        const evidencesArray =
          evidencesResponse.data.data || evidencesResponse.data;
        const approvalsArray =
          approvalsResponse.data.data || approvalsResponse.data;

        const approvalsMap = new Map<string, ApprovalStatus>();
        approvalsArray.forEach((aprobacion: any) => {
          const key = `${aprobacion.criterio_id}-${aprobacion.proceso_id}`;
          approvalsMap.set(key, aprobacion.estado as ApprovalStatus);
        });

        const criteriaWithStatus = criteriaArray.map((c: any) => {
          const key = `${c.id}-${selectedProcesoId}`;
          const approvalStatus = approvalsMap.get(key) ?? "pendiente";
          return { ...c, estado_aprobacion: approvalStatus as ApprovalStatus };
        });

        const approvedCriteria = criteriaWithStatus.filter(
          (c: Criterio) => c.estado_aprobacion === "aprobado",
        );

        setDataState((prev) => ({
          ...prev,
          processes: processesArray,
          criteria: approvedCriteria,
          evidences: evidencesArray,
        }));
      }
    } catch (error: any) {
      console.error("Error:", error);
      showToast({
        type: "error",
        title: "Error al cargar informe",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "No se pudieron cargar los datos del informe",
      });
    } finally {
      setDataState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const getEvidenciasPorCriterio = (criterioId: number) => {
    return evidences.filter((ev) => ev.criterio_id === criterioId);
  };

  const loadFiles = async (nodeId: number) => {
    if (loadingFiles.has(nodeId)) return;

    setUiState((prev) => ({
      ...prev,
      loadingFiles: new Set(prev.loadingFiles).add(nodeId),
    }));

    try {
      const response = isFlexible
        ? await axiosInstance.get("/elementos-archivos", {
            params: {
              elemento_id: nodeId,
              ...(selectedProcesoId ? { proceso_id: selectedProcesoId } : {}),
            },
          })
        : await axiosInstance.get("/archivos", {
            params: {
              evidencia_id: nodeId,
              ...(selectedProcesoId ? { proceso_id: selectedProcesoId } : {}),
            },
          });
      const archivos = response.data.data || response.data;

      if (isFlexible) {
        setDataState((prev) => ({
          ...prev,
          criteria: prev.criteria.map((c) =>
            c.id === nodeId ? { ...c, archivos } : c,
          ),
        }));
      } else {
        setDataState((prev) => ({
          ...prev,
          evidences: prev.evidences.map((ev) =>
            ev.id === nodeId ? { ...ev, archivos } : ev,
          ),
        }));
      }
    } catch (error) {
      console.error("Error cargando archivos:", error);

      // Evita reintentos automáticos infinitos al expandir filas con error
      if (isFlexible) {
        setDataState((prev) => ({
          ...prev,
          criteria: prev.criteria.map((c) =>
            c.id === nodeId ? { ...c, archivos: [] } : c,
          ),
        }));
      } else {
        setDataState((prev) => ({
          ...prev,
          evidences: prev.evidences.map((ev) =>
            ev.id === nodeId ? { ...ev, archivos: [] } : ev,
          ),
        }));
      }
    } finally {
      setUiState((prev) => {
        const newSet = new Set(prev.loadingFiles);
        newSet.delete(nodeId);
        return { ...prev, loadingFiles: newSet };
      });
    }
  };

  const resolvePublicLink = (archivo: Archivo): string => {
    if (archivo.token_publico) {
      return `${config.FRONTEND_BASE_URL}/p/${archivo.token_publico}`;
    }

    if (archivo.url_publica_carpeta) {
      return archivo.url_publica_carpeta;
    }

    if (archivo.url_publica) {
      return archivo.url_publica;
    }

    return "";
  };

  const getArchivoParaEnlace = (evidencia: Evidencia): Archivo | null => {
    const archivos = evidencia.archivos || [];
    if (archivos.length === 0) return null;

    const publico = archivos.find(
      (archivo) => archivo.is_publico && Boolean(resolvePublicLink(archivo)),
    );
    return publico || archivos[0];
  };

  const getPublicLinkForEvidence = (evidencia: Evidencia): string => {
    const archivoPublico = (evidencia.archivos || []).find(
      (archivo) => archivo.is_publico && Boolean(resolvePublicLink(archivo)),
    );

    return archivoPublico ? resolvePublicLink(archivoPublico) : "";
  };

  const handleGenerateLink = (archivo: Archivo, evidencia: Evidencia) => {
    setPublicLinkModal({ open: true, archivo, evidencia });
  };

  const handleAbrirEnlaceEvidencia = (evidencia: Evidencia) => {
    const archivo = getArchivoParaEnlace(evidencia);
    if (!archivo) {
      showToast({
        type: "warning",
        title: "No hay archivos adjuntos para esta evidencia",
      });
      return;
    }

    handleGenerateLink(archivo, evidencia);
  };

  const handleEnlaceGenerado = async () => {
    if (selectedEvidencia) {
      await loadFiles(selectedEvidencia.id);
    }
    setPublicLinkModal({ open: false, archivo: null, evidencia: null });
  };

  const handleGenerateAllLinks = async () => {
    if (!selectedProcesoId) {
      showToast({ type: "error", title: "Seleccione un proceso primero" });
      return;
    }

    setConfirmModal({ show: true, isGeneratingLinks: false });
  };

  const confirmGenerateAllLinks = async () => {
    setConfirmModal({ show: false, isGeneratingLinks: true });

    try {
      const todosLosArchivos = new Set<number>();

      const pushPendingFiles = (archivos: Archivo[]) => {
        archivos.forEach((archivo) => {
          if (!archivo.is_publico) {
            todosLosArchivos.add(archivo.archivo_id);
          }
        });
      };

      if (isFlexible) {
        const archivosPorFuente = await Promise.all(
          flexibleSourceElements.map(async (elemento) => {
            if (elemento.archivos !== undefined) {
              return elemento.archivos;
            }

            const response = await axiosInstance.get("/elementos-archivos", {
              params: {
                elemento_id: elemento.id,
                ...(selectedProcesoId ? { proceso_id: selectedProcesoId } : {}),
              },
            });

            return (response.data.data || response.data) as Archivo[];
          }),
        );

        archivosPorFuente.forEach(pushPendingFiles);
      } else {
        const approvedCriterionIds = new Set(
          criteria.map((criterio) => criterio.id),
        );
        const evidenciasAprobadas = evidences.filter((ev) =>
          approvedCriterionIds.has(ev.criterio_id),
        );

        const archivosPorEvidencia = await Promise.all(
          evidenciasAprobadas.map(async (evidencia) => {
            if (evidencia.archivos !== undefined) {
              return evidencia.archivos;
            }

            const response = await axiosInstance.get("/archivos", {
              params: {
                evidencia_id: evidencia.id,
                ...(selectedProcesoId ? { proceso_id: selectedProcesoId } : {}),
              },
            });

            return (response.data.data || response.data) as Archivo[];
          }),
        );

        archivosPorEvidencia.forEach(pushPendingFiles);
      }

      if (todosLosArchivos.size === 0) {
        showToast({
          type: "info",
          title: "No hay archivos sin enlace público",
        });
        return;
      }

      await axiosInstance.post("/archivos/bulk-make-public", {
        archivos_ids: Array.from(todosLosArchivos),
      });

      showToast({
        type: "success",
        title: `Se generaron ${todosLosArchivos.size} enlaces públicos exitosamente`,
      });

      if (isFlexible) {
        await Promise.all(
          flexibleSourceElements.map((elemento) => loadFiles(elemento.id)),
        );
      } else {
        const approvedCriterionIds = new Set(
          criteria.map((criterio) => criterio.id),
        );
        const evidenciasAprobadas = evidences.filter((ev) =>
          approvedCriterionIds.has(ev.criterio_id),
        );
        await Promise.all(evidenciasAprobadas.map((ev) => loadFiles(ev.id)));
      }
    } catch (error: any) {
      console.error("Error generando enlaces masivos:", error);
      showToast({
        type: "error",
        title:
          error.response?.data?.message || "Error al generar enlaces públicos",
      });
    } finally {
      setConfirmModal((prev) => ({ ...prev, isGeneratingLinks: false }));
    }
  };

  const buildReportRows = () => {
    if (isFlexible) {
      return flexibleSourceElements.flatMap((elemento) =>
        (elemento.archivos ?? []).map((archivo) => ({
          criterio: `${elemento.nomenclatura} — ${elemento.descripcion}`,
          evidencia: archivo.nombre_original,
          link:
            archivo.is_publico && resolvePublicLink(archivo)
              ? resolvePublicLink(archivo)
              : "Sin enlace",
        })),
      );
    }
    return criteria.flatMap((criterio) => {
      const evidenciasCriterio = getEvidenciasPorCriterio(criterio.id);
      return evidenciasCriterio.map((evidencia) => ({
        criterio: `${criterio.nomenclatura} - ${criterio.descripcion}`,
        evidencia: `${evidencia.nomenclatura} - ${evidencia.descripcion}`,
        link: getPublicLinkForEvidence(evidencia) || "Sin enlace",
      }));
    });
  };

  const downloadExcel = async () => {
    try {
      const response = await axiosInstance.get(
        "/estructura/evidencias/export/excel",
        { responseType: "blob" },
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `informe_evidencias_${selectedProcesoId}_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error exportando Excel:", error);
      showToast({
        type: "error",
        title: "Error al exportar",
        message:
          error?.response?.data?.message ||
          "No se pudo generar el informe en Excel",
      });
    }
  };

  const exportToPdf = (
    rows: Array<{ criterio: string; evidencia: string; link: string }>,
  ) => {
    if (!selectedProcesoId) return;

    generatePdfReport({
      title: "Informe de Evidencias con Enlaces",
      metadata: {
        Carrera: contextInfo.careerLabel || "No definida",
        Ciclo: contextInfo.cycleLabel || "No definido",
        Proceso: contextInfo.processLabel || "No definido",
        Generado: new Date().toLocaleString(),
      },
      columns: [
        { header: isFlexible ? "Elemento" : "Criterio", key: "criterio" },
        { header: isFlexible ? "Archivo" : "Evidencia", key: "evidencia" },
        { header: "Enlace", key: "link" },
      ],
      data: rows,
    });
  };

  const handleExportInforme = async (format: ExportFormat) => {
    if (!selectedProcesoId) {
      showToast({ type: "error", title: "Seleccione un proceso primero" });
      return;
    }

    if (format === "excel") {
      await downloadExcel();
    } else {
      const rows = buildReportRows();
      if (rows.length === 0) {
        showToast({ type: "warning", title: "No hay evidencias para exportar" });
        return;
      }
      exportToPdf(rows);
    }
  };

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        breadcrumbMode="contextual"
        headerExtra={
          <div className="flex items-center gap-2">
            {selectedProcesoId && criteria.length > 0 && (
              <>
                <ButtonWithTooltip
                  variant="outline"
                  size="sm"
                  tooltip="Generar enlaces"
                  onClick={handleGenerateAllLinks}
                  className="w-auto"
                >
                  <SystemIcons.actions.linkIcon className={ICON_SIZES.sm} />
                  Generar
                </ButtonWithTooltip>
                <DropdownButton
                  label="Exportar"
                  variant="outline"
                  size="sm"
                  icon={
                    <SystemIcons.actions.export className={ICON_SIZES.sm} />
                  }
                  options={
                    [
                      {
                        id: "pdf",
                        label: "Exportar a PDF",
                        icon: (
                          <SystemIcons.modal.pdf className={ICON_SIZES.sm} />
                        ),
                        onClick: () => handleExportInforme("pdf"),
                      },
                      {
                        id: "excel",
                        label: "Exportar a Excel",
                        icon: (
                          <SystemIcons.modal.excel className={ICON_SIZES.sm} />
                        ),
                        onClick: () => handleExportInforme("excel"),
                      },
                    ] as DropdownOption[]
                  }
                />
              </>
            )}
          </div>
        }
      />
      {contextLoading || isLoading ? (
        <div className="relative py-12 min-h-100">
          <LoadingSpinner variant="loader" />
        </div>
      ) : (
        <>
          {/* Lista de criterios aprobados */}
          {!selectedProcesoId ? (
            <div className="bg-white rounded-lg border border-gray-200 py-16">
              <div className="text-center">
                <SystemIcons.modal.document
                  size="lg"
                  className="mx-auto text-gray-400 mb-3"
                />
                <p className="text-sm font-medium text-negro-una mb-1">
                  No hay datos disponibles
                </p>
                <p className="text-sm text-gris-una">
                  Defina ciclo y proceso en Inicio para continuar
                </p>
              </div>
            </div>
          ) : (
            <>
              {criteria.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="flex flex-col items-center">
                    <SystemIcons.modal.document className="h-24 w-24 text-gris-una mb-4" />
                    <p className="text-sm font-medium text-negro-una mb-1">
                      {isFlexible
                        ? "No hay elementos aprobados"
                        : "No hay criterios aprobados"}
                    </p>
                    <p className="text-sm text-gris-una">
                      {isFlexible
                        ? "No se encontraron elementos aprobados para este proceso"
                        : "No se encontraron criterios aprobados para este proceso"}
                    </p>
                  </div>
                </div>
              ) : (
                <FinalReportsTable
                  criteria={criteria}
                  evidences={evidences}
                  isFlexible={isFlexible}
                  loadingFiles={loadingFiles}
                  onLoadFile={loadFiles}
                  onOpenLink={handleAbrirEnlaceEvidencia}
                />
              )}
            </>
          )}
        </>
      )}

      {/* Modal de confirmación para generar todos los enlaces */}
      <GenerateLinksConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setConfirmModal((prev) => ({ ...prev, show: false }))}
        onConfirm={confirmGenerateAllLinks}
        isLoading={isGeneratingLinks}
        isFlexible={isFlexible}
      />

      {/* Modal para gestionar enlaces públicos */}
      <PublicLinkModal
        isOpen={publicLinkModalOpen}
        onClose={() =>
          setPublicLinkModal({ open: false, archivo: null, evidencia: null })
        }
        archivo={selectedArchivo}
        evidencia={selectedEvidencia}
        onSuccess={handleEnlaceGenerado}
      />
    </ScreenContainer>
  );
};

export default FinalReports;
