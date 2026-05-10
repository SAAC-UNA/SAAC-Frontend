/**
 * AccreditationProcessList - Página de listado de procesos de acreditación
 *
 * Basada en el patron de Gestion de Estructura: header con acciones y tabla separada.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/Constants/ROUTES";
import { ScreenContainer } from "@/Components/Ui/Layout/ScreenContainer";
import { PageHeader, Button } from "@/Components/Ui/Index";
import { AccreditationProcessDeleteModal } from "./Components/AccreditationProcessDeleteModal";
import { SuccessModal } from "@/Components/Ui/Modals/SuccessModal";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { SearchInput } from "@/Components/Ui/Forms/SearchInput";
import { accreditationProcessService } from "@/Services/AccreditationProcessService";
import {
  globalFilterContextService,
  GLOBAL_FILTER_CONTEXT_CHANGED_EVENT,
} from "@/Services/GlobalFilterContextService";
import { getOperationalContextSnapshot } from "@/Services/OperationalContextStore";
import type {
  AccreditationCycle,
  AccreditationProcess,
  AccreditationProcessFormData,
} from "@/Types/AccreditationProcessTypes";
import { AccreditationProcessTable } from "./Components/AccreditationProcessTable";
import { AccreditationProcessDetailsModal } from "./Components/AccreditationProcessDetailsModal";
import { AccreditationProcessFormModal } from "./Components/AccreditationProcessFormModal";

export interface CommitmentConfigurationState {
  procesoId?: string;
  cicloId?: string;
  startDate?: string;
  estimatedEndDate?: string;
  description?: string;
  modeloTipo?: string;
  modeloId?: number;
}

type AccreditationProcessListProps = {
  embedded?: boolean;
  onHeaderExtraChange?: (headerExtra: React.ReactNode) => void;
  onHeaderMetaChange?: (meta: {
    title: string;
    description?: string;
    breadcrumbMode?: "none" | "simple" | "cycle-only" | "contextual";
    breadcrumbParent?: { label: string; href?: string };
  } | null) => void;
  onConfigureCommitment?: (state: CommitmentConfigurationState) => void;
};

export const AccreditationProcessList: React.FC<AccreditationProcessListProps> = ({
  embedded = false,
  onHeaderExtraChange,
  onHeaderMetaChange,
  onConfigureCommitment,
}) => {
  const moduleInfo = getModuleInfo("accreditation_processes");
  const navigate = useNavigate();

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");

  // Datos
  const [cycles, setCycles] = useState<AccreditationCycle[]>([]);
  const [processes, setProcesses] = useState<AccreditationProcess[]>([]);
  const [selectedContextCycleId, setSelectedContextCycleId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modales
  const [formModalState, setFormModalState] = useState<{
    isOpen: boolean;
    process: AccreditationProcess | null;
  }>({ isOpen: false, process: null });

  const [detailsModalState, setDetailsModalState] = useState<{
    isOpen: boolean;
    process: AccreditationProcess | null;
  }>({ isOpen: false, process: null });

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    process: AccreditationProcess | null;
  }>({ isOpen: false, process: null });

  const [deleteSuccessState, setDeleteSuccessState] = useState<{
    isOpen: boolean;
    processType: string;
  }>({ isOpen: false, processType: "" });

  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [loadedCycles, loadedProcesses, catalog] = await Promise.all([
        accreditationProcessService.getCycles(),
        accreditationProcessService.getProcesses(),
        globalFilterContextService.getCatalog(),
      ]);
      const contextSnapshot = getOperationalContextSnapshot();

      setCycles(loadedCycles);
      setProcesses(loadedProcesses);
      setSelectedContextCycleId(
        contextSnapshot.cycleId ? String(contextSnapshot.cycleId) : null,
      );

      // Sync context snapshot with cycle label for breadcrumb and emit change event
      const selectedCycle = catalog.cycles.find(
        (cycle) => cycle.ciclo_acreditacion_id === contextSnapshot.cycleId,
      );
      globalFilterContextService.syncContextSnapshot({
        careerCampusId: contextSnapshot.careerCampusId,
        cycleId: contextSnapshot.cycleId,
        processId: contextSnapshot.processId,
        cycleLabel: selectedCycle?.nombre ?? null,
      });
    } catch (error) {
      console.error("No se pudo cargar procesos/ciclos desde backend:", error);
      setCycles([]);
      setProcesses([]);
      setSelectedContextCycleId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const refreshByContext = () => {
      void loadData();
    };

    window.addEventListener(
      GLOBAL_FILTER_CONTEXT_CHANGED_EVENT,
      refreshByContext,
    );

    return () => {
      window.removeEventListener(
        GLOBAL_FILTER_CONTEXT_CHANGED_EVENT,
        refreshByContext,
      );
    };
  }, [loadData]);

  const visibleProcesses = useMemo(() => {
    if (!selectedContextCycleId) {
      return processes;
    }

    return processes.filter(
      (process) =>
        String(process.accreditationCycleId) === String(selectedContextCycleId),
    );
  }, [processes, selectedContextCycleId]);

  const validateBusinessRules = (
    formData: AccreditationProcessFormData,
    editingProcessId?: string,
  ) => {
    if (!formData.type.trim()) {
      throw new Error("El tipo de proceso es obligatorio.");
    }

    if (!formData.accreditationCycleId) {
      throw new Error("Debe seleccionar un ciclo de acreditación.");
    }

    const duplicateActive = processes.some(
      (process) =>
        process.id !== editingProcessId &&
        process.accreditationCycleId === formData.accreditationCycleId &&
        process.type.toLowerCase() === formData.type.toLowerCase() &&
        process.status === "activo" &&
        formData.status === "activo",
    );

    if (duplicateActive) {
      throw new Error(
        "Ya existe un proceso activo de este tipo para el ciclo seleccionado.",
      );
    }
  };

  const handleSaveProcess = async (
    formData: AccreditationProcessFormData,
    processId?: string,
  ): Promise<AccreditationProcess | null> => {
    validateBusinessRules(formData, processId);
    const isImprovementProcess = formData.type === "Compromiso de mejora";
    const description = isImprovementProcess ? formData.description.trim() : "";

    const selectedCycle = cycles.find(
      (cycle) => cycle.id === formData.accreditationCycleId,
    );
    const cycleName = selectedCycle?.name || "Ciclo sin nombre";
    const careerName = selectedCycle?.careerName;
    const campusName = selectedCycle?.campusName;

    if (!processId) {
      const created = await accreditationProcessService.createProcess({
        ciclo_acreditacion_id: Number(formData.accreditationCycleId),
        tipo_proceso: formData.type,
        ...(isImprovementProcess && { descripcion: description }),
        fecha_inicio: formData.startDate,
        fecha_finalizacion: formData.estimatedEndDate,
        activo: formData.status === "activo",
      });

      const normalizedCreated: AccreditationProcess = {
        ...created,
        type: created.type || formData.type,
        description: created.description ?? description,
        status: created.status || formData.status,
        startDate: created.startDate || formData.startDate,
        estimatedEndDate: created.estimatedEndDate || formData.estimatedEndDate,
        accreditationCycleId:
          created.accreditationCycleId || formData.accreditationCycleId,
        accreditationCycleName: cycleName,
        careerName: created.careerName ?? careerName,
        campusName: created.campusName ?? campusName,
      };

      setProcesses((prev) => [normalizedCreated, ...prev]);
      return normalizedCreated;
    }

    const updated = await accreditationProcessService.updateProcess(processId, {
      ciclo_acreditacion_id: Number(formData.accreditationCycleId),
      tipo_proceso: formData.type,
      ...(isImprovementProcess && { descripcion: description }),
      fecha_inicio: formData.startDate,
      fecha_finalizacion: formData.estimatedEndDate,
      activo: formData.status === "activo",
    });

    const normalizedUpdated: AccreditationProcess = {
      ...updated,
      id: processId,
      type: updated.type || formData.type,
      description: updated.description ?? description,
      status: updated.status || formData.status,
      startDate: updated.startDate || formData.startDate,
      estimatedEndDate: updated.estimatedEndDate || formData.estimatedEndDate,
      accreditationCycleId:
        updated.accreditationCycleId || formData.accreditationCycleId,
      accreditationCycleName: cycleName,
      careerName: updated.careerName ?? careerName,
      campusName: updated.campusName ?? campusName,
    };

    setProcesses((prev) =>
      prev.map((process) =>
        process.id === processId ? normalizedUpdated : process,
      ),
    );

    return normalizedUpdated;
  };

  const handleViewProcess = (process: AccreditationProcess) => {
    setDetailsModalState({ isOpen: true, process });
  };

  const handleConfigureProcess = (process: AccreditationProcess) => {
    const matchedCycle = cycles.find(
      (c) => c.id === process.accreditationCycleId,
    );
    const modeloTipo =
      process.modeloEstructuraTipo ?? matchedCycle?.modeloEstructuraTipo;
    const modeloId =
      process.modeloEstructuraId ?? matchedCycle?.modeloEstructuraId;
    const configurationState: CommitmentConfigurationState = {
      procesoId: process.id,
      cicloId: process.accreditationCycleId,
      startDate: process.startDate,
      estimatedEndDate: process.estimatedEndDate,
      description: process.description,
      modeloTipo,
      modeloId: modeloId ? parseInt(modeloId) : undefined,
    };

    if (embedded && onConfigureCommitment) {
      onConfigureCommitment(configurationState);
      return;
    }

    navigate(ROUTES.COMMITMENTS_NEW, {
      state: configurationState,
    });
  };

  const handleEditProcess = (process: AccreditationProcess) => {
    setFormModalState({ isOpen: true, process });
  };

  const handleToggleProcessStatus = async (process: AccreditationProcess) => {
    const nextStatus = process.status === "activo" ? "inactivo" : "activo";
    const formData: AccreditationProcessFormData = {
      type: process.type,
      description: process.description || "",
      accreditationCycleId: process.accreditationCycleId,
      status: nextStatus,
      startDate: process.startDate,
      estimatedEndDate: process.estimatedEndDate,
    };

    validateBusinessRules(formData, process.id);

    const updated = await accreditationProcessService.updateProcess(process.id, {
      ciclo_acreditacion_id: Number(process.accreditationCycleId),
      tipo_proceso: process.type,
      ...(process.type === "Compromiso de mejora" && {
        descripcion: process.description?.trim() ?? "",
      }),
      fecha_inicio: process.startDate,
      fecha_finalizacion: process.estimatedEndDate,
      activo: nextStatus === "activo",
    });

    setProcesses((prev) =>
      prev.map((item) =>
        item.id === process.id
          ? {
              ...item,
              ...updated,
              id: process.id,
              accreditationCycleId:
                updated.accreditationCycleId || process.accreditationCycleId,
              accreditationCycleName:
                updated.accreditationCycleName || process.accreditationCycleName,
              type: updated.type || process.type,
              status: updated.status || nextStatus,
              startDate: updated.startDate || process.startDate,
              estimatedEndDate:
                updated.estimatedEndDate || process.estimatedEndDate,
            }
          : item,
      ),
    );
  };

  const handleDeleteProcess = (process: AccreditationProcess) => {
    setDeleteModalState({ isOpen: true, process });
  };

  const handleCreateProcess = useCallback(() => {
    setFormModalState({ isOpen: true, process: null });
  }, []);

  const headerExtra = useMemo(
    () => (
      <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto">
        <SearchInput
          placeholder="Buscar procesos..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:w-72 text-sidebar"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCreateProcess}
          className="gap-2"
        >
          Crear
        </Button>
      </div>
    ),
    [handleCreateProcess, searchQuery],
  );

  useEffect(() => {
    if (!embedded) return undefined;

    onHeaderExtraChange?.(headerExtra);
  }, [embedded, headerExtra, onHeaderExtraChange]);

  useEffect(() => {
    if (!embedded) return undefined;
    return () => onHeaderExtraChange?.(null);
  }, [embedded, onHeaderExtraChange]);

  useEffect(() => {
    if (!embedded) {
      return undefined;
    }

    onHeaderMetaChange?.({
      title: moduleInfo.title,
      description: moduleInfo.description,
      breadcrumbMode: "cycle-only",
    });

    return () => onHeaderMetaChange?.(null);
  }, [
    embedded,
    moduleInfo.description,
    moduleInfo.title,
    onHeaderMetaChange,
  ]);

  const confirmDeleteProcess = async (confirmacion: string) => {
    if (!deleteModalState.process) return;

    const processToDelete = deleteModalState.process;
    setIsDeleting(true);
    try {
      await accreditationProcessService.deleteProcess(processToDelete.id, {
        confirmacion,
      });
      setProcesses((prev) =>
        prev.filter((process) => process.id !== processToDelete.id),
      );
      setDeleteModalState({ isOpen: false, process: null });
      setDeleteSuccessState({
        isOpen: true,
        processType: processToDelete.type,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const content = (
    <>
      {!embedded && (
        <PageHeader
          title={moduleInfo.title}
          description={moduleInfo.description}
          breadcrumbMode="cycle-only"
          headerExtra={headerExtra}
        />
      )}
      <AccreditationProcessTable
        processes={visibleProcesses}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onView={handleViewProcess}
        onEdit={handleEditProcess}
        onDelete={handleDeleteProcess}
        onConfigure={handleConfigureProcess}
        onToggleStatus={handleToggleProcessStatus}
      />

      <AccreditationProcessFormModal
        isOpen={formModalState.isOpen}
        onClose={() => setFormModalState({ isOpen: false, process: null })}
        cycles={cycles}
        initialData={formModalState.process}
        onSave={handleSaveProcess}
      />

      <AccreditationProcessDetailsModal
        isOpen={detailsModalState.isOpen}
        onClose={() => setDetailsModalState({ isOpen: false, process: null })}
        process={detailsModalState.process}
      />

      <AccreditationProcessDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, process: null })}
        onConfirm={confirmDeleteProcess}
        process={deleteModalState.process}
        isLoading={isDeleting}
      />

      <SuccessModal
        isOpen={deleteSuccessState.isOpen}
        onClose={() =>
          setDeleteSuccessState({ isOpen: false, processType: "" })
        }
        title="Proceso eliminado"
        message={`El proceso "${deleteSuccessState.processType}" ha sido eliminado correctamente.`}
      />
    </>
  );

  if (embedded) return content;

  return <ScreenContainer>{content}</ScreenContainer>;
};
