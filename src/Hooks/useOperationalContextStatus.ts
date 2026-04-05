import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/Context/AuthContext";
import {
  globalFilterContextService,
  GLOBAL_FILTER_CONTEXT_CHANGED_EVENT,
  type GlobalFilterCatalog,
} from "@/Services/GlobalFilterContextService";

const isProfessorRole = (roles: string[]): boolean =>
  roles.some((role) => role.toLowerCase() === "profesor");

const evaluateOperationalContext = (catalog: GlobalFilterCatalog): boolean => {
  const selectedCareerId = catalog.context.career_campus_id;

  if (selectedCareerId === null) {
    return false;
  }

  const availableCycles = catalog.cycles.filter(
    (cycle) => cycle.carrera_sede_id === selectedCareerId,
  );
  const cycleRequired = availableCycles.length > 0;

  const hasCycle =
    !cycleRequired ||
    availableCycles.some(
      (cycle) =>
        cycle.ciclo_acreditacion_id === catalog.context.ciclo_acreditacion_id,
    );

  if (!hasCycle) {
    return false;
  }

  if (catalog.context.ciclo_acreditacion_id === null) {
    return !cycleRequired;
  }

  const availableProcesses = catalog.processes.filter(
    (process) =>
      process.ciclo_acreditacion_id === catalog.context.ciclo_acreditacion_id,
  );
  const processRequired = availableProcesses.length > 0;

  if (!processRequired) {
    return true;
  }

  return availableProcesses.some(
    (process) => process.proceso_id === catalog.context.proceso_id,
  );
};

export const useOperationalContextStatus = () => {
  const { isAuthenticated, userRoleNames } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasOperationalContext, setHasOperationalContext] = useState(true);

  const isProfessor = useMemo(
    () => isProfessorRole(userRoleNames),
    [userRoleNames],
  );

  const refreshContextStatus = useCallback(async () => {
    if (!isAuthenticated || isProfessor) {
      setHasOperationalContext(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const catalog = await globalFilterContextService.getCatalog();
      setHasOperationalContext(evaluateOperationalContext(catalog));
    } catch {
      setHasOperationalContext(false);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isProfessor]);

  useEffect(() => {
    refreshContextStatus();
  }, [refreshContextStatus]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleContextChanged = () => {
      refreshContextStatus();
    };

    window.addEventListener(
      GLOBAL_FILTER_CONTEXT_CHANGED_EVENT,
      handleContextChanged,
    );

    return () => {
      window.removeEventListener(
        GLOBAL_FILTER_CONTEXT_CHANGED_EVENT,
        handleContextChanged,
      );
    };
  }, [refreshContextStatus]);

  return {
    loading,
    hasOperationalContext,
    refreshContextStatus,
  };
};
