import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CustomSelect,
  LoadingSpinner,
  PageHeader,
  ScreenContainer,
  type SelectOption,
} from "@/Components/Ui/Index";
import { useToast } from "@/Hooks/useToast";
import { useAuth } from "@/Context/AuthContext";
import {
  globalFilterContextService,
  type GlobalFilterCatalog,
} from "@/Services/GlobalFilterContextService";

type SelectionState = {
  careerCampusId: string;
  cycleId: string;
  processId: string;
};

type NavigationState = {
  from?: string;
};

const emptySelection: SelectionState = {
  careerCampusId: "",
  cycleId: "",
  processId: "",
};

const isProfessorRole = (roles: string[]): boolean =>
  roles.some((role) => role.toLowerCase() === "profesor");

const toOption = (value: number, label: string): SelectOption => ({
  value: String(value),
  label,
});

export const GlobalContextSelectionPage = () => {
  const { userRoleNames } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const toastRef = useRef(toast);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState<GlobalFilterCatalog | null>(null);
  const [selection, setSelection] = useState<SelectionState>(emptySelection);

  const isProfessor = useMemo(
    () => isProfessorRole(userRoleNames),
    [userRoleNames],
  );

  useEffect(() => {
    if (isProfessor) {
      navigate("/", { replace: true });
      return;
    }

    let isMounted = true;

    const loadCatalog = async () => {
      setLoading(true);
      try {
        const data = await globalFilterContextService.getCatalog();
        if (!isMounted) {
          return;
        }

        setCatalog(data);
        // Always start with empty selection - context should not be auto-selected on page reload
        setSelection(emptySelection);
      } catch {
        toastRef.current.error("No se pudo cargar el contexto inicial.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, [isProfessor, navigate]);

  const careerOptions = useMemo<SelectOption[]>(() => {
    if (!catalog) {
      return [];
    }

    return catalog.careers.map((item) =>
      toOption(
        item.carrera_sede_id,
        `${item.carrera_nombre} - ${item.sede_nombre}`,
      ),
    );
  }, [catalog]);

  const availableCycles = useMemo(() => {
    if (!catalog) {
      return [];
    }

    const selectedCareerId = selection.careerCampusId
      ? Number(selection.careerCampusId)
      : null;

    if (!selectedCareerId) {
      return catalog.cycles;
    }

    return catalog.cycles.filter(
      (item) => item.carrera_sede_id === selectedCareerId,
    );
  }, [catalog, selection.careerCampusId]);

  const cycleOptions = useMemo<SelectOption[]>(() => {
    return availableCycles.map((item) =>
      toOption(item.ciclo_acreditacion_id, item.nombre),
    );
  }, [availableCycles]);

  const availableProcesses = useMemo(() => {
    if (!catalog) {
      return [];
    }

    const selectedCycleId = selection.cycleId
      ? Number(selection.cycleId)
      : null;

    if (!selectedCycleId) {
      return catalog.processes;
    }

    return catalog.processes.filter(
      (item) => item.ciclo_acreditacion_id === selectedCycleId,
    );
  }, [catalog, selection.cycleId]);

  const processOptions = useMemo<SelectOption[]>(() => {
    return availableProcesses.map((item) =>
      toOption(item.proceso_id, `${item.tipo_proceso} (${item.proceso_id})`),
    );
  }, [availableProcesses]);

  useEffect(() => {
    if (!selection.careerCampusId) {
      return;
    }

    const cycleStillValid = availableCycles.some(
      (cycle) => String(cycle.ciclo_acreditacion_id) === selection.cycleId,
    );

    if (!cycleStillValid) {
      setSelection((prev) => ({ ...prev, cycleId: "", processId: "" }));
    }
  }, [availableCycles, selection.careerCampusId, selection.cycleId]);

  useEffect(() => {
    if (!selection.cycleId) {
      return;
    }

    const processStillValid = availableProcesses.some(
      (process) => String(process.proceso_id) === selection.processId,
    );

    if (!processStillValid) {
      setSelection((prev) => ({ ...prev, processId: "" }));
    }
  }, [availableProcesses, selection.cycleId, selection.processId]);

  const updateSelection = (key: keyof SelectionState, value: string) => {
    if (key === "careerCampusId") {
      setSelection({
        careerCampusId: value,
        cycleId: "",
        processId: "",
      });
      return;
    }

    if (key === "cycleId") {
      setSelection((prev) => ({ ...prev, cycleId: value, processId: "" }));
      return;
    }

    setSelection((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit =
    Boolean(selection.careerCampusId) &&
    Boolean(selection.cycleId) &&
    Boolean(selection.processId);

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error("Debe seleccionar carrera, ciclo y proceso.");
      return;
    }

    setSaving(true);

    try {
      const selectedCareer =
        catalog?.careers.find(
          (career) =>
            career.carrera_sede_id === Number(selection.careerCampusId),
        ) ?? null;
      const selectedCycle =
        catalog?.cycles.find(
          (cycle) => String(cycle.ciclo_acreditacion_id) === selection.cycleId,
        ) ?? null;
      const selectedProcess =
        catalog?.processes.find(
          (process) => String(process.proceso_id) === selection.processId,
        ) ?? null;

      await globalFilterContextService.updateContext({
        career_campus_id: Number(selection.careerCampusId),
        ciclo_acreditacion_id: Number(selection.cycleId),
        proceso_id: Number(selection.processId),
      });

      globalFilterContextService.syncContextSnapshot({
        careerCampusId: Number(selection.careerCampusId),
        cycleId: Number(selection.cycleId),
        processId: Number(selection.processId),
        careerLabel: selectedCareer
          ? `${selectedCareer.carrera_nombre} - ${selectedCareer.sede_nombre}`
          : null,
        campusLabel: selectedCareer?.sede_nombre ?? null,
        cycleLabel: selectedCycle?.nombre ?? null,
        processLabel: selectedProcess?.tipo_proceso ?? null,
      });

      const fromPath = (location.state as NavigationState | null)?.from;
      navigate(fromPath || "/", { replace: true });
    } catch {
      toast.error("No se pudo guardar el contexto seleccionado.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await globalFilterContextService.resetContext();
      setSelection(emptySelection);
      toast.success("Contexto reiniciado.");
    } catch {
      toast.error("No se pudo reiniciar el contexto.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen">
        <LoadingSpinner variant="loader" />
      </div>
    );
  }

  return (
    <ScreenContainer
      className="min-h-screen flex items-center justify-center"
      variant="full-width"
    >
      <Card className="w-full max-w-2xl p-6 sm:p-8 border border-gris-light/40">
        <PageHeader
          title="Seleccion de contexto de trabajo"
          description="Antes de continuar, seleccione la carrera, el ciclo y el proceso que desea trabajar en esta sesion."
          breadcrumbMode="none"
          className="mb-6"
        />

        <div className="space-y-5">
          <CustomSelect
            label="Carrera"
            placeholder="Seleccione una carrera"
            options={careerOptions}
            value={selection.careerCampusId}
            onChange={(value) => updateSelection("careerCampusId", value)}
          />

          <CustomSelect
            label="Ciclo"
            placeholder="Seleccione un ciclo"
            options={cycleOptions}
            value={selection.cycleId}
            disabled={!selection.careerCampusId}
            onChange={(value) => updateSelection("cycleId", value)}
          />

          <CustomSelect
            label="Proceso"
            placeholder="Seleccione un proceso"
            options={processOptions}
            value={selection.processId}
            disabled={!selection.cycleId}
            onChange={(value) => updateSelection("processId", value)}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
            className="sm:w-auto"
          >
            Limpiar seleccion
          </Button>
          <Button
            variant="secondary"
            onClick={handleSubmit}
            isLoading={saving}
            disabled={!canSubmit || saving}
            className="sm:w-auto"
          >
            Continuar
          </Button>
        </div>
      </Card>
    </ScreenContainer>
  );
};

export default GlobalContextSelectionPage;
