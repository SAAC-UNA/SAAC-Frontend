/**
 * AccreditationProcessList - Página de listado de procesos de acreditación
 *
 * Basada en el patron de Gestion de Estructura: header con acciones y tabla separada.
 */

import React, { useCallback, useEffect, useState } from "react";
import { ScreenContainer } from "@/Components/Ui/Layout/ScreenContainer";
import { PageHeader, Button } from "@/Components/Ui/Index";
import { DeleteConfirmationModal } from "@/Components/Ui/Modals/DeleteConfirmationModal";
import { SuccessModal } from "@/Components/Ui/Modals/SuccessModal";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { SearchInput } from "@/Components/Ui/Forms/SearchInput";
import { accreditationProcessService } from "@/Services/AccreditationProcessService";
import type {
  AccreditationCycle,
  AccreditationProcess,
  AccreditationProcessFormData,
} from "@/Types/AccreditationProcessTypes";
import { AccreditationProcessTable } from "./Components/AccreditationProcessTable";
import { AccreditationProcessDetailsModal } from "./Components/AccreditationProcessDetailsModal";
import { AccreditationProcessFormModal } from "./Components/AccreditationProcessFormModal";

interface ApiError extends Error {
  status?: number;
}

const FALLBACK_CYCLES: AccreditationCycle[] = [
  {
    id: "1",
    name: "Ciclo 2024-2025",
    careerName: "Ingeniería en Sistemas",
    campusName: "Sede Central",
  },
  {
    id: "2",
    name: "Ciclo 2023-2024",
    careerName: "Administración",
    campusName: "Sede Chorotega",
  },
  {
    id: "3",
    name: "Ciclo 2022-2023",
    careerName: "Contaduría",
    campusName: "Sede Brunca",
  },
];

const FALLBACK_PROCESSES: AccreditationProcess[] = [
  {
    id: "1",
    type: "Autoevaluación",
    accreditationCycleId: "1",
    accreditationCycleName: "Ciclo 2024-2025",
    careerName: "Ingeniería en Sistemas",
    campusName: "Sede Central",
    status: "activo",
    startDate: "2024-01-15",
    estimatedEndDate: "2024-06-30",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    type: "Compromiso de mejora",
    accreditationCycleId: "1",
    accreditationCycleName: "Ciclo 2024-2025",
    careerName: "Ingeniería en Sistemas",
    campusName: "Sede Central",
    status: "inactivo",
    startDate: "2024-07-01",
    estimatedEndDate: "2024-09-30",
    createdAt: "2024-06-28",
  },
];

export const AccreditationProcessList: React.FC = () => {
  const moduleInfo = getModuleInfo("accreditation_processes");

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");

  // Datos
  const [cycles, setCycles] = useState<AccreditationCycle[]>([]);
  const [processes, setProcesses] = useState<AccreditationProcess[]>([]);
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

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [loadedCycles, loadedProcesses] = await Promise.all([
        accreditationProcessService.getCycles(),
        accreditationProcessService.getProcesses(),
      ]);

      setCycles(loadedCycles.length ? loadedCycles : FALLBACK_CYCLES);
      setProcesses(
        loadedProcesses.length ? loadedProcesses : FALLBACK_PROCESSES,
      );
    } catch (error) {
      console.warn(
        "No se pudo cargar desde backend, usando datos de respaldo:",
        error,
      );
      setCycles(FALLBACK_CYCLES);
      setProcesses(FALLBACK_PROCESSES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

    const selectedCycle = cycles.find(
      (cycle) => cycle.id === formData.accreditationCycleId,
    );
    const cycleName = selectedCycle?.name || "Ciclo sin nombre";
    const careerName = selectedCycle?.careerName;
    const campusName = selectedCycle?.campusName;

    if (!processId) {
      try {
        const created = await accreditationProcessService.createProcess({
          ciclo_acreditacion_id: Number(formData.accreditationCycleId),
          tipo_proceso: formData.type,
        });

        const normalizedCreated: AccreditationProcess = {
          ...created,
          type: formData.type,
          status: formData.status,
          startDate: formData.startDate,
          estimatedEndDate: formData.estimatedEndDate,
          accreditationCycleId: formData.accreditationCycleId,
          accreditationCycleName: cycleName,
          careerName,
          campusName,
        };

        setProcesses((prev) => [normalizedCreated, ...prev]);
        return normalizedCreated;
      } catch (rawError: unknown) {
        const error = rawError as ApiError;
        if (error.status !== 404) {
          throw error;
        }

        // Fallback local mientras backend no publique endpoint de creación.
        const localCreated: AccreditationProcess = {
          id: String(Date.now()),
          type: formData.type,
          accreditationCycleId: formData.accreditationCycleId,
          accreditationCycleName: cycleName,
          careerName,
          campusName,
          status: formData.status,
          startDate: formData.startDate,
          estimatedEndDate: formData.estimatedEndDate,
          createdAt: new Date().toISOString(),
        };

        setProcesses((prev) => [localCreated, ...prev]);
        return localCreated;
      }
    }

    try {
      const updated = await accreditationProcessService.updateProcess(
        processId,
        {
          ciclo_acreditacion_id: Number(formData.accreditationCycleId),
          tipo_proceso: formData.type,
        },
      );

      const normalizedUpdated: AccreditationProcess = {
        ...updated,
        id: processId,
        type: formData.type,
        status: formData.status,
        startDate: formData.startDate,
        estimatedEndDate: formData.estimatedEndDate,
        accreditationCycleId: formData.accreditationCycleId,
        accreditationCycleName: cycleName,
        careerName,
        campusName,
      };

      setProcesses((prev) =>
        prev.map((process) =>
          process.id === processId ? normalizedUpdated : process,
        ),
      );

      return normalizedUpdated;
    } catch (rawError: unknown) {
      const error = rawError as ApiError;
      if (error.status !== 404) {
        throw error;
      }

      // Fallback local mientras backend no publique endpoint de edición.
      let localUpdated: AccreditationProcess | null = null;
      setProcesses((prev) =>
        prev.map((process) => {
          if (process.id !== processId) return process;

          localUpdated = {
            ...process,
            type: formData.type,
            status: formData.status,
            startDate: formData.startDate,
            estimatedEndDate: formData.estimatedEndDate,
            accreditationCycleId: formData.accreditationCycleId,
            accreditationCycleName: cycleName,
            careerName,
            campusName,
          };

          return localUpdated;
        }),
      );

      return localUpdated;
    }
  };

  const handleViewProcess = (process: AccreditationProcess) => {
    setDetailsModalState({ isOpen: true, process });
  };

  const handleEditProcess = (process: AccreditationProcess) => {
    setFormModalState({ isOpen: true, process });
  };

  const handleDeleteProcess = (process: AccreditationProcess) => {
    setDeleteModalState({ isOpen: true, process });
  };

  const handleCreateProcess = () => {
    setFormModalState({ isOpen: true, process: null });
  };

  const confirmDeleteProcess = async () => {
    if (!deleteModalState.process) return;

    const processToDelete = deleteModalState.process;

    try {
      await accreditationProcessService.deleteProcess(processToDelete.id);
    } catch (rawError: unknown) {
      const error = rawError as ApiError;
      if (error.status !== 404) {
        console.error("No se pudo eliminar el proceso:", error);
        return;
      }
      // Fallback local mientras backend no publique endpoint de eliminación.
    }

    setProcesses((prev) =>
      prev.filter((process) => process.id !== processToDelete.id),
    );
    setDeleteModalState({ isOpen: false, process: null });
    setDeleteSuccessState({ isOpen: true, processType: processToDelete.type });
  };

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        headerExtra={
          <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto">
            <SearchInput
              placeholder="Buscar procesos..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-full sm:w-72 text-[13px]"
            />
            <Button
              variant="secondary"
              onClick={handleCreateProcess}
              className="gap-2 text-[13px] font-normal"
            >
              <SystemIcons.actions.add className="w-4 h-4" size="sm" />
              Crear
            </Button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <AccreditationProcessTable
          processes={processes}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onView={handleViewProcess}
          onEdit={handleEditProcess}
          onDelete={handleDeleteProcess}
        />
      </div>

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

      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, process: null })}
        onConfirm={confirmDeleteProcess}
        title="Confirmar eliminación de proceso"
        itemName={deleteModalState.process?.type}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />

      <SuccessModal
        isOpen={deleteSuccessState.isOpen}
        onClose={() =>
          setDeleteSuccessState({ isOpen: false, processType: "" })
        }
        title="Proceso eliminado"
        message={`El proceso "${deleteSuccessState.processType}" ha sido eliminado correctamente.`}
      />
    </ScreenContainer>
  );
};
