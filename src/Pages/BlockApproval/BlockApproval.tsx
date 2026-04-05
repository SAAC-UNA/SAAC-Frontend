import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScreenContainer, PageHeader } from "@/Components/Ui/Index";
import { useToast } from "@/Context/ToastContext";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { axiosInstance } from "@/Config/axios";
import { ApprovalModal } from "./Components/ApprovalModal";
import { EvidenceFilesModal } from "./Components/EvidenceFilesModal";
import { SuccessModal } from "@/Components/Ui/Modals/SuccessModal";
import { CustomSelect } from "@/Components/Ui/Forms/SingleSelect";
import {
  FilterButton,
  type FilterOption,
} from "@/Components/Ui/Buttons/FilterButton";
import { TABLE_PAGE_SIZE } from "@/Constants/TablePagination";
import { BlockApprovalTable } from "./Components/BlockApprovalTable";
import type { Criterio, Evidencia } from "./Components/BlockApprovalTable";
import { Card } from "@/Components/Ui/Layout/Card";

type ApprovalStatus = "pendiente" | "aprobado" | "rechazado";

interface Proceso {
  proceso_id: number;
  tipo_proceso: string;
  accreditation_cycle: {
    ciclo_acreditacion_id: number;
    nombre: string;
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

const BlockApproval: React.FC = () => {
  const moduleInfo = getModuleInfo("block_approval");
  const { showToast } = useToast();
  const [dataState, setDataState] = useState<{
    isLoading: boolean;
    criteria: Criterio[];
    evidences: Evidencia[];
    processes: Proceso[];
  }>({ isLoading: true, criteria: [], evidences: [], processes: [] });
  const isLoading = dataState.isLoading;
  const criteria = dataState.criteria;
  const evidences = dataState.evidences;
  const processes = dataState.processes;
  // Estado para filtros y UI
  const [filterState, setFilterState] = useState<{
    selectedProcesoId: number | null;
    currentPage: number;
    approvalFilter: ApprovalStatus | "todos";
  }>({ selectedProcesoId: null, currentPage: 1, approvalFilter: "pendiente" });
  const selectedProcesoId = filterState.selectedProcesoId;
  const currentPage = filterState.currentPage;
  const approvalFilter = filterState.approvalFilter;
  const itemsPerPage = TABLE_PAGE_SIZE.standard;

  // Estado para modales de aprobación y éxito
  const [approvalState, setApprovalState] = useState<{
    isOpen: boolean;
    action: "aprobar" | "rechazar";
    criterion: Criterio | null;
    successOpen: boolean;
  }>({ isOpen: false, action: "aprobar", criterion: null, successOpen: false });
  const isModalOpen = approvalState.isOpen;
  const modalAction = approvalState.action;
  const selectedCriterion = approvalState.criterion;
  const successModalState = {
    isOpen: approvalState.successOpen,
    action: approvalState.action,
  };

  // Estado para modal de archivos
  const [filesModal, setFilesModal] = useState<{
    open: boolean;
    evidencia: Evidencia | null;
  }>({ open: false, evidencia: null });
  const filesModalOpen = filesModal.open;
  const selectedEvidencia = filesModal.evidencia;

  // Opciones para el filtro de aprobación
  const filtroOptions: FilterOption<ApprovalStatus | "todos">[] = [
    { value: "pendiente", label: "Pendientes" },
    { value: "aprobado", label: "Aprobados" },
    { value: "rechazado", label: "Rechazados" },
    { value: "todos", label: "Todos" },
  ];

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProcesoId]); // Recargar cuando cambie el proceso seleccionado

  const fetchData = async () => {
    try {
      // Load criteria, evidences, processes and approvals in parallel
      const [
        criteriaResponse,
        evidencesResponse,
        processesResponse,
        approvalsResponse,
      ] = await Promise.all([
        axiosInstance.get("/estructura/criterios"),
        axiosInstance.get("/estructura/evidencias"),
        axiosInstance.get("/estructura/procesos"),
        axiosInstance.get("/aprobaciones-criterios"),
      ]);

      const criteriaArray = criteriaResponse.data.data || criteriaResponse.data;
      const evidencesArray =
        evidencesResponse.data.data || evidencesResponse.data;
      const processesArray =
        processesResponse.data.data || processesResponse.data;
      const approvalsArray =
        approvalsResponse.data.data || approvalsResponse.data;

      // Create approvals map by criterio_id + proceso_id
      const approvalsMap = new Map<string, ApprovalStatus>();
      approvalsArray.forEach((aprobacion: any) => {
        const key = `${aprobacion.criterio_id}-${aprobacion.proceso_id}`;
        approvalsMap.set(key, aprobacion.estado as ApprovalStatus);
      });

      // Assign approval status according to selected process
      const criteriaWithStatus = criteriaArray.map((c: any) => {
        const key = selectedProcesoId ? `${c.id}-${selectedProcesoId}` : "";
        const approvalStatus = approvalsMap.get(key) || "pendiente";

        return {
          ...c,
          estado_aprobacion: approvalStatus as ApprovalStatus,
        };
      });

      setDataState((prev) => ({
        ...prev,
        criteria: criteriaWithStatus,
        evidences: evidencesArray,
        processes: processesArray,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error("Error:", error);
      showToast({
        type: "error",
        title: "Error al cargar datos",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "No se pudieron cargar los criterios",
      });
      setDataState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const getEvidencesByCriterion = useCallback(
    (criterionId: number) =>
      evidences.filter((ev) => ev.criterio_id === criterionId),
    [evidences],
  );

  const handleViewFiles = useCallback((evidencia: Evidencia) => {
    setFilesModal({ open: true, evidencia });
  }, []);

  const filteredCriteria = useMemo(
    () =>
      criteria.filter((criterio) => {
        if (approvalFilter === "todos") return true;
        return criterio.estado_aprobacion === approvalFilter;
      }),
    [criteria, approvalFilter],
  );

  const totalPages = Math.ceil(filteredCriteria.length / itemsPerPage);
  const paginatedCriteria = useMemo(
    () =>
      filteredCriteria.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      ),
    [filteredCriteria, currentPage, itemsPerPage],
  );

  // Reset page when filtered criteria changes
  useEffect(() => {
    setFilterState((prev) => ({ ...prev, currentPage: 1 }));
  }, [filteredCriteria.length]);

  const handleAprobar = useCallback((criterio: Criterio) => {
    setApprovalState((prev) => ({
      ...prev,
      isOpen: true,
      action: "aprobar",
      criterion: criterio,
    }));
  }, []);

  const handleRechazar = useCallback((criterio: Criterio) => {
    setApprovalState((prev) => ({
      ...prev,
      isOpen: true,
      action: "rechazar",
      criterion: criterio,
    }));
  }, []);

  const handleConfirmAction = async (comentario: string) => {
    if (!selectedCriterion || !selectedProcesoId) return;

    try {
      const endpoint =
        modalAction === "aprobar"
          ? `/criterios/${selectedCriterion.id}/aprobar`
          : `/criterios/${selectedCriterion.id}/rechazar`;

      const response = await axiosInstance.post(endpoint, {
        proceso_id: selectedProcesoId,
        comentario: comentario || null,
      });

      console.log("Respuesta del backend:", response.data);

      // Cerrar modal de confirmación y mostrar modal de éxito
      setApprovalState((prev) => ({
        ...prev,
        isOpen: false,
        criterion: null,
        successOpen: true,
      }));

      // Recargar datos para actualizar el estado
      await fetchData();
    } catch (error: any) {
      console.error("Error completo:", error);

      showToast({
        type: "error",
        title: "Error al procesar la solicitud",
        message: error.response?.data?.message || "Ocurrió un error inesperado",
      });

      // Cerrar modal de confirmación
      setApprovalState((prev) => ({ ...prev, isOpen: false, criterion: null }));
    }
  };

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        breadcrumbMode="contextual"
        headerExtra={
          <div className="flex gap-4 items-end">
            <Card className="w-80">
              <CustomSelect
                label="Seleccionar Proceso"
                value={selectedProcesoId?.toString() || ""}
                placeholder="Seleccione un proceso"
                size="sm"
                onChange={(value) =>
                  setFilterState((prev) => ({
                    ...prev,
                    selectedProcesoId: value ? Number(value) : null,
                  }))
                }
                options={processes
                  .filter(
                    (proceso) =>
                      proceso.accreditation_cycle?.career_campus?.career
                        ?.nombre &&
                      proceso.accreditation_cycle?.career_campus?.campus
                        ?.nombre,
                  )
                  .map((proceso) => ({
                    value: proceso.proceso_id.toString(),
                    label: `${proceso.accreditation_cycle.career_campus.career.nombre} - ${proceso.accreditation_cycle.career_campus.campus.nombre} (${proceso.tipo_proceso})`,
                  }))}
                maxVisibleItems={5}
              />
            </Card>
            <FilterButton
              tooltipText="Filtrar por estado"
              options={filtroOptions}
              value={approvalFilter}
              onChange={(value) =>
                setFilterState((prev) => ({ ...prev, approvalFilter: value }))
              }
            />
          </div>
        }
      />

      <BlockApprovalTable
        criteria={paginatedCriteria}
        evidences={evidences}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        selectedProcesoId={selectedProcesoId}
        onPageChange={(value) =>
          setFilterState((prev) => ({ ...prev, currentPage: value }))
        }
        onAprobar={handleAprobar}
        onRechazar={handleRechazar}
        onViewFiles={handleViewFiles}
      />

      {/* Modal de confirmación */}
      {selectedCriterion && (
        <ApprovalModal
          isOpen={isModalOpen}
          onClose={() =>
            setApprovalState((prev) => ({
              ...prev,
              isOpen: false,
              criterion: null,
            }))
          }
          onConfirm={handleConfirmAction}
          action={modalAction}
          criterio={selectedCriterion}
          evidencias={getEvidencesByCriterion(selectedCriterion.id)}
        />
      )}

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModalState.isOpen}
        onClose={() =>
          setApprovalState((prev) => ({ ...prev, successOpen: false }))
        }
        title={
          successModalState.action === "aprobar"
            ? "Criterio Aprobado"
            : "Criterio Rechazado"
        }
        message={`El criterio ha sido ${successModalState.action === "aprobar" ? "aprobado" : "rechazado"} exitosamente.`}
      />

      {/* Modal de archivos asociados */}
      <EvidenceFilesModal
        isOpen={filesModalOpen}
        onClose={() => setFilesModal({ open: false, evidencia: null })}
        evidencia={selectedEvidencia}
      />
    </ScreenContainer>
  );
};

export default BlockApproval;
