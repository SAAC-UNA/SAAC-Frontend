import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/Context/AuthContext";
import { LoadingSpinner } from "@/Components/Ui/Feedback/Loading";
import { globalFilterContextService } from "@/Services/GlobalFilterContextService";

interface RequireOperationalContextProps {
  children: ReactNode;
}

const isProfessorRole = (roles: string[]): boolean =>
  roles.some((role) => role.toLowerCase() === "profesor");

export const RequireOperationalContext = ({
  children,
}: RequireOperationalContextProps) => {
  const { userRoleNames, isAuthenticated } = useAuth();
  const location = useLocation();
  const [checkingContext, setCheckingContext] = useState(true);
  const [hasCompleteContext, setHasCompleteContext] = useState(false);

  const isProfessor = useMemo(
    () => isProfessorRole(userRoleNames),
    [userRoleNames],
  );

  useEffect(() => {
    let isMounted = true;

    const checkContext = async () => {
      const isHomeRoute = location.pathname === "/";
      const isGeneralAccreditationRoute =
        location.pathname.startsWith("/procesos-acreditacion") ||
        location.pathname.startsWith("/estructura") ||
        location.pathname.startsWith("/ciclos-acreditacion");

      if (
        !isAuthenticated ||
        isProfessor ||
        isHomeRoute ||
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
  }, [isAuthenticated, isProfessor, location.pathname]);

  if (checkingContext) {
    return (
      <div className="relative flex items-center justify-center min-h-screen">
        <LoadingSpinner variant="loader" />
      </div>
    );
  }

  if (!hasCompleteContext) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};
