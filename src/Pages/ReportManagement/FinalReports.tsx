import React, { useState, useEffect, useMemo } from "react";
import { ScreenContainer, PageHeader } from "@/Components/Ui/Index";
import { LoadingSpinner } from "@/Components/Ui/Index";
import { ButtonWithTooltip } from "@/Components/Ui/Buttons/ButtonWithTooltip";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { axiosInstance } from "@/Config/axios";
import { PublicLinkModal } from "./Components/PublicLinkModal";
import { CriterionDetailModal } from "./Components/CriterionDetailModal";
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
    () => processes.find((p: Proceso) => p.proceso_id === selectedProcesoId) ?? null,
    [processes, selectedProcesoId],
  );
  const isFlexible =
    selectedProcess?.accreditation_cycle?.modelo_estructura?.tipo === "elemento_flexible";

  // Modal de detalle de criterio
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    criterio: Criterio | null;
  }>({ open: false, criterio: null });

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
      setDataState({ isLoading: false, processes: [], criteria: [], evidences: [] });
      return;
    }

    try {
      setDataState((prev) => ({ ...prev, isLoading: true }));

      const processesResponse = await axiosInstance.get("/estructura/procesos");
      const processesArray = processesResponse.data.data || processesResponse.data;

      const selProc = processesArray.find(
        (p: any) => p.proceso_id === selectedProcesoId,
      );
      const flex =
        selProc?.accreditation_cycle?.modelo_estructura?.tipo === "elemento_flexible";

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
        const criteriaArray = criteriaResponse.data.data || criteriaResponse.data;
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
      const param = isFlexible
        ? `elemento_id=${nodeId}`
        : `evidencia_id=${nodeId}`;
      const response = await axiosInstance.get(`/archivos?${param}`);
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
      setDataState((prev) => ({
        ...prev,
        evidences: prev.evidences.map((ev) =>
          ev.id === nodeId ? { ...ev, archivos: [] } : ev,
        ),
      }));
    } finally {
      setUiState((prev) => {
        const newSet = new Set(prev.loadingFiles);
        newSet.delete(nodeId);
        return { ...prev, loadingFiles: newSet };
      });
    }
  };

  const getArchivoParaEnlace = (evidencia: Evidencia): Archivo | null => {
    const archivos = evidencia.archivos || [];
    if (archivos.length === 0) return null;

    const publico = archivos.find(
      (archivo) => archivo.is_publico && archivo.token_publico,
    );
    return publico || archivos[0];
  };

  const getPublicLinkForEvidence = (evidencia: Evidencia): string => {
    const archivoPublico = (evidencia.archivos || []).find(
      (archivo) => archivo.is_publico && archivo.token_publico,
    );

    return archivoPublico?.token_publico
      ? `${window.location.origin}/api/p/${archivoPublico.token_publico}`
      : "";
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
      // Collect all files from all evidences
      const todosLosArchivos: number[] = [];

      if (isFlexible) {
        for (const elemento of criteria) {
          (elemento.archivos ?? []).forEach((archivo) => {
            if (!archivo.is_publico) todosLosArchivos.push(archivo.archivo_id);
          });
        }
      } else {
        for (const criterio of criteria) {
          const evidenciasCriterio = getEvidenciasPorCriterio(criterio.id);
          for (const evidencia of evidenciasCriterio) {
            if (evidencia.archivos) {
              evidencia.archivos.forEach((archivo) => {
                if (!archivo.is_publico) {
                  todosLosArchivos.push(archivo.archivo_id);
                }
              });
            }
          }
        }
      }

      if (todosLosArchivos.length === 0) {
        showToast({
          type: "info",
          title: "No hay archivos sin enlace público",
        });
        return;
      }

      await axiosInstance.post("/archivos/bulk-make-public", {
        archivo_ids: todosLosArchivos,
      });

      showToast({
        type: "success",
        title: `Se generaron ${todosLosArchivos.length} enlaces públicos exitosamente`,
      });

      if (isFlexible) {
        const loadedElements = criteria.filter((c) => c.archivos !== undefined);
        await Promise.all(loadedElements.map((c) => loadFiles(c.id)));
      } else {
        const evidencesWithFiles = evidences.filter(
          (ev) => ev.archivos !== undefined,
        );
        await Promise.all(evidencesWithFiles.map((ev) => loadFiles(ev.id)));
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
      return criteria.flatMap((elemento) =>
        (elemento.archivos ?? []).map((archivo) => ({
          criterio: `${elemento.nomenclatura} — ${elemento.descripcion}`,
          evidencia: archivo.nombre_original,
          link:
            archivo.is_publico && archivo.token_publico
              ? `${window.location.origin}/api/p/${archivo.token_publico}`
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

  const downloadCsv = (
    rows: Array<{ criterio: string; evidencia: string; link: string }>,
  ) => {
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header = [isFlexible ? "Elemento" : "Criterio", isFlexible ? "Archivo" : "Evidencia", "Enlace"]
      .map(escapeCsv)
      .join(",");
    const lines = rows.map((row) =>
      [row.criterio, row.evidencia, row.link].map(escapeCsv).join(","),
    );
    const csvContent = `\ufeff${[header, ...lines].join("\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `informe_evidencias_${selectedProcesoId}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  const handleExportInforme = (format: ExportFormat) => {
    if (!selectedProcesoId) {
      showToast({ type: "error", title: "Seleccione un proceso primero" });
      return;
    }

    const rows = buildReportRows();
    if (rows.length === 0) {
      showToast({ type: "warning", title: "No hay evidencias para exportar" });
      return;
    }

    if (format === "excel") {
      downloadCsv(rows);
    } else {
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
                  onViewDetail={(criterio) =>
                    setDetailModal({ open: true, criterio })
                  }
                />
              )}
            </>
          )}
        </>
      )}

      {/* Modal de detalle de criterio */}
      <CriterionDetailModal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, criterio: null })}
        criterio={detailModal.criterio}
      />

      {/* Modal de confirmación para generar todos los enlaces */}
      <GenerateLinksConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setConfirmModal((prev) => ({ ...prev, show: false }))}
        onConfirm={confirmGenerateAllLinks}
        isLoading={isGeneratingLinks}
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
