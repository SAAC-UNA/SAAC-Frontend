import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CustomSelect,
  LoadingSpinner,
  PageHeader,
  ScreenContainer,
  type SelectOption,
} from "@/Components/Ui/Index";
import { useAuth } from "@/Context/AuthContext";
import { useToast } from "@/Hooks/useToast";
import {
  globalFilterContextService,
  type GlobalFilterCareer,
  type GlobalFilterCatalog,
} from "@/Services/GlobalFilterContextService";

const isProfessorRole = (roles: string[]): boolean =>
  roles.some((role) => role.toLowerCase() === "profesor");

const toOption = (value: number, label: string): SelectOption => ({
  value: String(value),
  label,
});

const HomePage: React.FC = () => {
  const { userRoleNames } = useAuth();
  const toast = useToast();
  const toastRef = useRef(toast);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const isProfessor = useMemo(
    () => isProfessorRole(userRoleNames),
    [userRoleNames],
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState<GlobalFilterCatalog | null>(null);
  const [fixedCareer, setFixedCareer] = useState<GlobalFilterCareer | null>(
    null,
  );
  const [cycleId, setCycleId] = useState("");
  const [processId, setProcessId] = useState("");

  useEffect(() => {
    if (isProfessor) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await globalFilterContextService.getCatalog();
        if (!mounted) {
          return;
        }

        setCatalog(data);

        const selectedCareerId =
          data.context.career_campus_id ??
          data.careers[0]?.carrera_sede_id ??
          null;

        const selectedCareer =
          data.careers.find(
            (career) => career.carrera_sede_id === selectedCareerId,
          ) ?? null;

        setFixedCareer(selectedCareer);
        setCycleId(
          data.context.ciclo_acreditacion_id
            ? String(data.context.ciclo_acreditacion_id)
            : "",
        );
        setProcessId(
          data.context.proceso_id ? String(data.context.proceso_id) : "",
        );
      } catch {
        if (mounted) {
          toastRef.current.error("No se pudo cargar el contexto de trabajo.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [isProfessor]);

  const availableCycles = useMemo(() => {
    if (!catalog || !fixedCareer) {
      return [];
    }

    return catalog.cycles.filter(
      (cycle) => cycle.carrera_sede_id === fixedCareer.carrera_sede_id,
    );
  }, [catalog, fixedCareer]);

  const cycleOptions = useMemo<SelectOption[]>(() => {
    return availableCycles.map((cycle) =>
      toOption(cycle.ciclo_acreditacion_id, cycle.nombre),
    );
  }, [availableCycles]);

  const availableProcesses = useMemo(() => {
    if (!catalog || !cycleId) {
      return [];
    }

    return catalog.processes.filter(
      (process) => process.ciclo_acreditacion_id === Number(cycleId),
    );
  }, [catalog, cycleId]);

  const processOptions = useMemo<SelectOption[]>(() => {
    return availableProcesses.map((process) =>
      toOption(
        process.proceso_id,
        `${process.tipo_proceso} (${process.proceso_id})`,
      ),
    );
  }, [availableProcesses]);

  const selectedCycleLabel = useMemo(() => {
    return (
      availableCycles.find(
        (cycle) => String(cycle.ciclo_acreditacion_id) === cycleId,
      )?.nombre ?? "No seleccionado"
    );
  }, [availableCycles, cycleId]);

  const selectedProcessLabel = useMemo(() => {
    return (
      availableProcesses.find(
        (process) => String(process.proceso_id) === processId,
      )?.tipo_proceso ?? "No seleccionado"
    );
  }, [availableProcesses, processId]);

  const cycleRequired = availableCycles.length > 0;
  const processRequired = Boolean(cycleId) && availableProcesses.length > 0;

  useEffect(() => {
    if (!cycleId) {
      return;
    }

    const isCycleValid = availableCycles.some(
      (cycle) => String(cycle.ciclo_acreditacion_id) === cycleId,
    );

    if (!isCycleValid) {
      setCycleId("");
      setProcessId("");
    }
  }, [availableCycles, cycleId]);

  useEffect(() => {
    if (!processId) {
      return;
    }

    const isProcessValid = availableProcesses.some(
      (process) => String(process.proceso_id) === processId,
    );

    if (!isProcessValid) {
      setProcessId("");
    }
  }, [availableProcesses, processId]);

  const persistContextSelection = async (
    nextCycleId: string,
    nextProcessId: string,
  ) => {
    if (!fixedCareer) {
      toastRef.current.error("No tiene una carrera asociada.");
      return;
    }

    setSaving(true);

    try {
      await globalFilterContextService.updateContext({
        career_campus_id: fixedCareer.carrera_sede_id,
        ciclo_acreditacion_id: nextCycleId ? Number(nextCycleId) : null,
        proceso_id: nextProcessId ? Number(nextProcessId) : null,
      });
    } catch {
      toastRef.current.error("No se pudo aplicar el contexto.");
    } finally {
      setSaving(false);
    }
  };

  if (isProfessor) {
    return (
      <ScreenContainer
        className="min-h-screen flex items-center justify-center"
        variant="full-width"
      >
        <Card className="w-full max-w-4xl p-6 sm:p-8">
          <PageHeader
            title="Bienvenido"
            description="Su perfil no requiere seleccion de contexto global."
            className="mb-0"
          />
        </Card>
      </ScreenContainer>
    );
  }

  if (loading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen">
        <LoadingSpinner variant="loader" />
      </div>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader
        title="Panel inicial"
        description="Seleccione el contexto de trabajo para navegar y consultar solo la informacion correspondiente."
        className="mb-4"
        breadcrumbMode="none"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-5 p-5 sm:p-6 border border-azul-una/20 bg-linear-to-br from-azul-una/10 via-blanco-una to-rojo-una/5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-azul-una mb-3">
            Resumen
          </p>
          <h2 className="text-2xl font-bold text-negro-una leading-tight mb-2">
            Bienvenido al panel de trabajo
          </h2>
          <p className="text-sm text-gris-una leading-relaxed mb-5">
            Desde aquí se define el contexto operativo y se accede a las vistas
            generales del sistema.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-corner border border-azul-una/15 bg-white/80 p-3">
              <p className="text-xs uppercase tracking-wide text-azul-una">
                Ciclos
              </p>
              <p className="mt-1 text-xl font-semibold text-negro-una">
                {availableCycles.length}
              </p>
            </div>
            <div className="rounded-corner border border-rojo-una/15 bg-white/80 p-3">
              <p className="text-xs uppercase tracking-wide text-rojo-una">
                Procesos
              </p>
              <p className="mt-1 text-xl font-semibold text-negro-una">
                {availableProcesses.length}
              </p>
            </div>
            <div className="rounded-corner border border-verde/15 bg-white/80 p-3">
              <p className="text-xs uppercase tracking-wide text-verde">
                Estado
              </p>
              <p className="mt-1 text-sm font-semibold text-negro-una">
                {saving
                  ? "Actualizando"
                  : cycleId || processId
                    ? "Activo"
                    : "Listo"}
              </p>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-7 space-y-4">
          {!fixedCareer ? (
            <Card className="p-5 border border-rojo-una/20 bg-rojo-una/5">
              <p className="text-sm font-semibold text-rojo-una-2">
                Su usuario no tiene una carrera asociada. Solicite la asignacion
                de carrera para continuar.
              </p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 border border-azul-una/20 bg-azul-una/5">
                  <p className="text-xs uppercase tracking-wide text-azul-una mb-2">
                    Carrera
                  </p>
                  <p className="text-base font-semibold text-negro-una">
                    {fixedCareer.carrera_nombre}
                  </p>
                </Card>

                <Card className="p-4 border border-rojo-una/20 bg-rojo-una/5">
                  <p className="text-xs uppercase tracking-wide text-rojo-una mb-2">
                    Sede
                  </p>
                  <p className="text-base font-semibold text-negro-una">
                    {fixedCareer.sede_nombre}
                  </p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 border border-gris-light/40 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gris-una">
                      Paso 1
                    </p>
                    <h3 className="text-sm font-semibold text-negro-una mt-1">
                      Seleccione ciclo
                    </h3>
                  </div>

                  <CustomSelect
                    label="Ciclo"
                    placeholder="Seleccione un ciclo"
                    options={cycleOptions}
                    value={cycleId}
                    disabled={cycleOptions.length === 0}
                    onChange={(value) => {
                      setCycleId(value);
                      setProcessId("");
                      void persistContextSelection(value, "");
                    }}
                  />

                  {!cycleRequired && (
                    <p className="text-xs text-gris-una">
                      No hay ciclos disponibles para esta carrera. Puede
                      continuar sin seleccionar ciclo.
                    </p>
                  )}
                </Card>

                <Card className="p-4 border border-gris-light/40 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gris-una">
                      Paso 2
                    </p>
                    <h3 className="text-sm font-semibold text-negro-una mt-1">
                      Seleccione proceso
                    </h3>
                  </div>

                  <CustomSelect
                    label="Proceso"
                    placeholder="Seleccione un proceso"
                    options={processOptions}
                    value={processId}
                    disabled={!cycleId || !processRequired}
                    onChange={(value) => {
                      setProcessId(value);
                      void persistContextSelection(cycleId, value);
                    }}
                  />

                  {Boolean(cycleId) && !processRequired && (
                    <p className="text-xs text-gris-una">
                      No hay procesos disponibles para el ciclo seleccionado.
                      Puede continuar sin seleccionar proceso.
                    </p>
                  )}
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border border-verde/20 bg-verde/5">
                  <p className="text-xs uppercase tracking-wide text-verde mb-2">
                    Estado del contexto
                  </p>
                  <p className="text-sm font-semibold text-negro-una">
                    {saving
                      ? "Actualizando..."
                      : cycleId || processId
                        ? "Configuracion en progreso"
                        : "Pendiente de seleccion"}
                  </p>
                  <p className="text-xs text-gris-una mt-2">
                    Los cambios se guardan automaticamente.
                  </p>
                </Card>

                <Card className="p-4 border border-azul-una/20 bg-azul-una/5">
                  <p className="text-xs uppercase tracking-wide text-azul-una mb-2">
                    Disponibilidad
                  </p>
                  <p className="text-sm text-negro-una">
                    Ciclos:{" "}
                    <span className="font-semibold">
                      {availableCycles.length}
                    </span>
                  </p>
                  <p className="text-sm text-negro-una mt-1">
                    Procesos del ciclo:{" "}
                    <span className="font-semibold">
                      {availableProcesses.length}
                    </span>
                  </p>
                </Card>

                <Card className="p-4 border border-rojo-una/20 bg-rojo-una/5">
                  <p className="text-xs uppercase tracking-wide text-rojo-una mb-2">
                    Seleccion actual
                  </p>
                  <p
                    className="text-sm text-negro-una truncate"
                    title={selectedCycleLabel}
                  >
                    Ciclo:{" "}
                    <span className="font-semibold">{selectedCycleLabel}</span>
                  </p>
                  <p
                    className="text-sm text-negro-una mt-1 truncate"
                    title={selectedProcessLabel}
                  >
                    Proceso:{" "}
                    <span className="font-semibold">
                      {selectedProcessLabel}
                    </span>
                  </p>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </ScreenContainer>
  );
};

export default HomePage;
