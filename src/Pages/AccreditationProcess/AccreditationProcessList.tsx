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

      setCycles(loadedCycles);
      setProcesses(loadedProcesses);
    } catch (error) {
      console.error("No se pudo cargar procesos/ciclos desde backend:", error);
      setCycles([]);
      setProcesses([]);
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
      const created = await accreditationProcessService.createProcess({
        ciclo_acreditacion_id: Number(formData.accreditationCycleId),
        tipo_proceso: formData.type,
        fecha_inicio: formData.startDate,
        fecha_finalizacion: formData.estimatedEndDate,
        activo: formData.status === "activo",
      });

      const normalizedCreated: AccreditationProcess = {
        ...created,
        type: created.type || formData.type,
        status: created.status || formData.status,
        startDate: created.startDate || formData.startDate,
        estimatedEndDate: created.estimatedEndDate || formData.estimatedEndDate,
        accreditationCycleId:
          created.accreditationCycleId || formData.accreditationCycleId,
        accreditationCycleName: created.accreditationCycleName || cycleName,
        careerName: created.careerName ?? careerName,
        campusName: created.campusName ?? campusName,
      };

      setProcesses((prev) => [normalizedCreated, ...prev]);
      return normalizedCreated;
    }

    const updated = await accreditationProcessService.updateProcess(processId, {
      ciclo_acreditacion_id: Number(formData.accreditationCycleId),
      tipo_proceso: formData.type,
      fecha_inicio: formData.startDate,
      fecha_finalizacion: formData.estimatedEndDate,
      activo: formData.status === "activo",
    });

    const normalizedUpdated: AccreditationProcess = {
      ...updated,
      id: processId,
      type: updated.type || formData.type,
      status: updated.status || formData.status,
      startDate: updated.startDate || formData.startDate,
      estimatedEndDate: updated.estimatedEndDate || formData.estimatedEndDate,
      accreditationCycleId:
        updated.accreditationCycleId || formData.accreditationCycleId,
      accreditationCycleName: updated.accreditationCycleName || cycleName,
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

    await accreditationProcessService.deleteProcess(processToDelete.id, {
      confirmacion: processToDelete.type,
    });

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
              className="gap-2 text-[13px] font-semibold"
            >
              Crear
            </Button>
          </div>
        }
      />

      <AccreditationProcessTable
          processes={processes}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onView={handleViewProcess}
          onEdit={handleEditProcess}
          onDelete={handleDeleteProcess}
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

      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, process: null })}
        onConfirm={confirmDeleteProcess}
        title="Confirmar eliminación de proceso"
        itemName={deleteModalState.process?.type}
        confirmLabel="Sí, eliminar"
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
