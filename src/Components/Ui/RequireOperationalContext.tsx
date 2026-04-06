import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/Context/AuthContext";
import { LoadingSpinner } from "@/Components/Ui/Feedback/Loading";
import { Modal } from "@/Components/Ui/Modals/Modal";
import { Button } from "@/Components/Ui/Buttons/Button";
import {
  CustomSelect,
  type SelectOption,
} from "@/Components/Ui/Forms/SingleSelect";
import { useToast } from "@/Hooks/useToast";
import {
  globalFilterContextService,
  emitManualContextApplied,
  type GlobalFilterCatalog,
} from "@/Services/GlobalFilterContextService";

interface RequireOperationalContextProps {
  children: ReactNode;
}

const isProfessorRole = (roles: string[]): boolean =>
  roles.some((role) => role.toLowerCase() === "profesor");

const isSuperUserRole = (roles: string[]): boolean =>
  roles.some((role) => {
    const normalizedRole = role.toLowerCase();
    return (
      normalizedRole === "superusuario" || normalizedRole === "super usuario"
    );
  });

const isGeneralRoute = (pathname: string): boolean => {
  return (
    pathname === "/" ||
    pathname.startsWith("/roles") ||
    pathname.startsWith("/usuarios") ||
    pathname.startsWith("/bitacora") ||
    pathname.startsWith("/estructura") ||
    pathname.startsWith("/ciclos-acreditacion") ||
    pathname.startsWith("/evidencias/subir") ||
    pathname.startsWith("/evidencias/busqueda-avanzada") ||
    pathname.startsWith("/mis-evidencias-asignadas") ||
    pathname.startsWith("/solicitudes-ampliacion/mis-solicitudes")
  );
};

const isActionableRoute = (pathname: string): boolean => {
  return (
    pathname.startsWith("/evidencias/asignar") ||
    pathname.startsWith("/solicitudes-ampliacion/gestionar") ||
    pathname.startsWith("/compromisos/crear") ||
    pathname.startsWith("/compromisos/editar") ||
    pathname.startsWith("/aprobacion-bloques")
  );
};

export const RequireOperationalContext = ({
  children,
}: RequireOperationalContextProps) => {
  const { userRoleNames, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();
  const [checkingContext, setCheckingContext] = useState(true);
  const [hasCompleteContext, setHasCompleteContext] = useState(false);
  const [catalog, setCatalog] = useState<GlobalFilterCatalog | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [careerId, setCareerId] = useState("");
  const [cycleId, setCycleId] = useState("");
  const [processId, setProcessId] = useState("");

  const isProfessor = useMemo(
    () => isProfessorRole(userRoleNames),
    [userRoleNames],
  );
  const isSuperUser = useMemo(
    () => isSuperUserRole(userRoleNames),
    [userRoleNames],
  );

  const requiresActionableContext = useMemo(
    () => isSuperUser && isActionableRoute(location.pathname),
    [isSuperUser, location.pathname],
  );

  const careerOptions = useMemo<SelectOption[]>(() => {
    if (!catalog) {
      return [];
    }

    const deduplicatedCareers = Array.from(
      new Map(
        catalog.careers.map((career) => [career.carrera_sede_id, career]),
      ).values(),
    );

    return deduplicatedCareers.map((career) => ({
      value: String(career.carrera_sede_id),
      label: `${career.carrera_nombre} - ${career.sede_nombre}`,
    }));
  }, [catalog]);

  const availableCycles = useMemo(() => {
    if (!catalog || !careerId) {
      return [];
    }

    return catalog.cycles.filter(
      (cycle) => cycle.carrera_sede_id === Number(careerId),
    );
  }, [catalog, careerId]);

  const cycleOptions = useMemo<SelectOption[]>(() => {
    return availableCycles.map((cycle) => ({
      value: String(cycle.ciclo_acreditacion_id),
      label: cycle.nombre,
    }));
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
    return availableProcesses.map((process) => ({
      value: String(process.proceso_id),
      label: process.tipo_proceso,
    }));
  }, [availableProcesses]);

  useEffect(() => {
    let isMounted = true;

    const checkContext = async () => {
      const isGeneralAccreditationRoute =
        location.pathname.startsWith("/procesos-acreditacion") ||
        location.pathname.startsWith("/estructura") ||
        location.pathname.startsWith("/ciclos-acreditacion");
      const isActionable = isActionableRoute(location.pathname);

      if (
        !isAuthenticated ||
        isProfessor ||
        (isSuperUser && !isActionable) ||
        isGeneralRoute(location.pathname) ||
        isGeneralAccreditationRoute
      ) {
        if (isMounted) {
          setHasCompleteContext(true);
          setCheckingContext(false);
        }
        return;
      }

      setCheckingContext(true);
      try {
        const catalog = await globalFilterContextService.getCatalog();

        const selectedCareerId = catalog.context.career_campus_id;

        if (selectedCareerId === null) {
          if (isMounted) {
            setHasCompleteContext(false);
          }
          return;
        }

        const availableCycles = catalog.cycles.filter(
          (cycle) => cycle.carrera_sede_id === selectedCareerId,
        );
        const cycleRequired = availableCycles.length > 0;

        const cycleIsValid = availableCycles.some(
          (cycle) =>
            cycle.ciclo_acreditacion_id ===
            catalog.context.ciclo_acreditacion_id,
        );
        const hasCycle =
          catalog.context.ciclo_acreditacion_id !== null && cycleIsValid;

        const availableProcesses = hasCycle
          ? catalog.processes.filter(
              (process) =>
                process.ciclo_acreditacion_id ===
                catalog.context.ciclo_acreditacion_id,
            )
          : [];
        const processRequired = hasCycle && availableProcesses.length > 0;

        const processIsValid = availableProcesses.some(
          (process) => process.proceso_id === catalog.context.proceso_id,
        );
        const hasProcess =
          catalog.context.proceso_id !== null && processIsValid;

        const complete =
          (!cycleRequired || hasCycle) && (!processRequired || hasProcess);

        if (isMounted) {
          setHasCompleteContext(complete);
        }
      } catch {
        if (isMounted) {
          setHasCompleteContext(false);
        }
      } finally {
        if (isMounted) {
          setCheckingContext(false);
        }
      }
    };

    checkContext();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isProfessor, isSuperUser, location.pathname]);

  useEffect(() => {
    if (!cycleId) {
      return;
    }

    const cycleIsStillValid = availableCycles.some(
      (cycle) => String(cycle.ciclo_acreditacion_id) === cycleId,
    );

    if (!cycleIsStillValid) {
      setCycleId("");
      setProcessId("");
    }
  }, [availableCycles, cycleId]);

  useEffect(() => {
    if (!processId) {
      return;
    }

    const processIsStillValid = availableProcesses.some(
      (process) => String(process.proceso_id) === processId,
    );

    if (!processIsStillValid) {
      setProcessId("");
    }
  }, [availableProcesses, processId]);

  useEffect(() => {
    if (!requiresActionableContext || checkingContext || hasCompleteContext) {
      return;
    }

    let isMounted = true;

    const loadModalCatalog = async () => {
      setModalLoading(true);
      try {
        const catalogData = await globalFilterContextService.getCatalog();
        if (!isMounted) {
          return;
        }

        setCatalog(catalogData);

        const nextCareerId =
          catalogData.context.career_campus_id ??
          catalogData.careers[0]?.carrera_sede_id ??
          null;

        const cyclesForCareer = catalogData.cycles.filter(
          (cycle) => cycle.carrera_sede_id === nextCareerId,
        );
        const nextCycleId = cyclesForCareer.some(
          (cycle) =>
            cycle.ciclo_acreditacion_id ===
            catalogData.context.ciclo_acreditacion_id,
        )
          ? catalogData.context.ciclo_acreditacion_id
          : null;

        const processesForCycle = catalogData.processes.filter(
          (process) => process.ciclo_acreditacion_id === nextCycleId,
        );
        const nextProcessId = processesForCycle.some(
          (process) => process.proceso_id === catalogData.context.proceso_id,
        )
          ? catalogData.context.proceso_id
          : null;

        setCareerId(nextCareerId ? String(nextCareerId) : "");
        setCycleId(nextCycleId ? String(nextCycleId) : "");
        setProcessId(nextProcessId ? String(nextProcessId) : "");
      } catch {
        if (isMounted) {
          toast.error("No se pudo cargar el contexto de trabajo.");
        }
      } finally {
        if (isMounted) {
          setModalLoading(false);
        }
      }
    };

    void loadModalCatalog();

    return () => {
      isMounted = false;
    };
  }, [requiresActionableContext, checkingContext, hasCompleteContext]);

  const applyRequiredContext = async () => {
    if (!catalog) {
      return;
    }

    const selectedCareerId = careerId ? Number(careerId) : null;
    const selectedCycleId = cycleId ? Number(cycleId) : null;
    const selectedProcessId = processId ? Number(processId) : null;

    if (selectedCareerId === null) {
      toast.error("Debe seleccionar una carrera para continuar.");
      return;
    }

    const filteredCycles = catalog.cycles.filter(
      (cycle) => cycle.carrera_sede_id === selectedCareerId,
    );
    if (filteredCycles.length > 0 && selectedCycleId === null) {
      toast.error("Debe seleccionar un ciclo para continuar.");
      return;
    }

    const filteredProcesses = selectedCycleId
      ? catalog.processes.filter(
          (process) => process.ciclo_acreditacion_id === selectedCycleId,
        )
      : [];
    if (filteredProcesses.length > 0 && selectedProcessId === null) {
      toast.error("Debe seleccionar un proceso para continuar.");
      return;
    }

    setModalSaving(true);

    try {
      await globalFilterContextService.updateContext({
        career_campus_id: selectedCareerId,
        ciclo_acreditacion_id: selectedCycleId,
        proceso_id: selectedProcessId,
      });

      const selectedCareer = catalog.careers.find(
        (career) => career.carrera_sede_id === selectedCareerId,
      );
      const selectedCycle = catalog.cycles.find(
        (cycle) => cycle.ciclo_acreditacion_id === selectedCycleId,
      );
      const selectedProcess = catalog.processes.find(
        (process) => process.proceso_id === selectedProcessId,
      );

      globalFilterContextService.syncContextSnapshot({
        careerCampusId: selectedCareerId,
        cycleId: selectedCycleId,
        processId: selectedProcessId,
        careerLabel: selectedCareer?.carrera_nombre ?? null,
        campusLabel: selectedCareer?.sede_nombre ?? null,
        cycleLabel: selectedCycle?.nombre ?? null,
        processLabel: selectedProcess?.tipo_proceso ?? null,
      });

      emitManualContextApplied();

      setHasCompleteContext(true);
      toast.success("Contexto aplicado. Ya puede continuar.");
    } catch {
      toast.error("No se pudo aplicar el contexto de trabajo.");
    } finally {
      setModalSaving(false);
    }
  };

  if (checkingContext) {
    return (
      <div className="relative flex items-center justify-center min-h-screen">
        <LoadingSpinner variant="loader" />
      </div>
    );
  }

  if (!hasCompleteContext) {
    if (requiresActionableContext) {
      return (
        <Modal
          isOpen={true}
          onClose={() => {}}
          closable={false}
          title="Contexto requerido"
          subtitle="Seleccione contexto para continuar"
          variant="warning"
          size="md"
          showConfirm={false}
          showCancel={false}
          footerButtons={
            <div className="flex w-full justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/")}
                disabled={modalSaving}
                className="w-auto! px-3"
              >
                Ir al inicio
              </Button>
              <Button
                type="button"
                variant="primary"
                isLoading={modalSaving}
                onClick={() => void applyRequiredContext()}
                className="w-auto! px-3"
              >
                Continuar
              </Button>
            </div>
          }
        >
          <div className="space-y-4 pt-1">
            {modalLoading ? (
              <p className="text-sm text-gris-una">
                Cargando opciones de contexto...
              </p>
            ) : (
              <>
                <CustomSelect
                  label="Carrera"
                  placeholder="Seleccione una carrera"
                  options={careerOptions}
                  value={careerId}
                  onChange={(value) => {
                    setCareerId(value);
                    setCycleId("");
                    setProcessId("");
                  }}
                  disabled={careerOptions.length === 0 || modalSaving}
                />

                <CustomSelect
                  label="Ciclo"
                  placeholder="Seleccione un ciclo"
                  options={cycleOptions}
                  value={cycleId}
                  onChange={(value) => {
                    setCycleId(value);
                    setProcessId("");
                  }}
                  disabled={cycleOptions.length === 0 || modalSaving}
                />

                <CustomSelect
                  label="Proceso"
                  placeholder="Seleccione un proceso"
                  options={processOptions}
                  value={processId}
                  onChange={setProcessId}
                  disabled={
                    !cycleId || processOptions.length === 0 || modalSaving
                  }
                />
              </>
            )}
          </div>
        </Modal>
      );
    }

    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};
