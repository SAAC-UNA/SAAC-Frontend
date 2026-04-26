import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/Context/AuthContext";
import { LoadingSpinner } from "@/Components/Ui/Feedback/Loading";
import { globalFilterContextService } from "@/Services/GlobalFilterContextService";
import { getOperationalContextSnapshot } from "@/Services/OperationalContextStore";
import { ROUTES } from "@/Constants/ROUTES";

interface RequireOperationalContextProps {
  children: ReactNode;
}

export const RequireOperationalContext = ({
  children,
}: RequireOperationalContextProps) => {
  const { isAuthenticated, userRoleNames } = useAuth();
  const location = useLocation();
  const [checkingContext, setCheckingContext] = useState(true);
  const [hasCompleteContext, setHasCompleteContext] = useState(false);
  const isOnSelectorPage = location.pathname === ROUTES.CONTEXT_SELECTOR;
  const isTeacher = userRoleNames.some((role) => {
    const normalizedRole = role.toLowerCase();
    return normalizedRole === "profesor" || normalizedRole === "docente";
  });

  const snapshot = getOperationalContextSnapshot();
  const hasLocalContext = snapshot.cycleId !== null;

  const needsContextRedirect =
    isAuthenticated && !isTeacher && !isOnSelectorPage && !hasLocalContext;

  useEffect(() => {
    let isMounted = true;

    const checkContext = async () => {
      // Si no hay sesión o estamos en el selector, no bloqueamos la navegación.
      if (
        !isAuthenticated ||
        isTeacher ||
        location.pathname === ROUTES.CONTEXT_SELECTOR
      ) {
        if (isMounted) {
          setHasCompleteContext(true);
          setCheckingContext(false);
        }
        return;
      }

      // Si localStorage ya tiene ciclo (puesto por ContextSelector),
      // confiamos en eso sin necesidad de volver a llamar al backend.
      const snap = getOperationalContextSnapshot();
      if (snap.cycleId !== null) {
        if (isMounted) {
          setHasCompleteContext(true);
          setCheckingContext(false);
        }
        return;
      }

      // Sin contexto local: validar contra el backend
      setCheckingContext(true);
      try {
        const catalog = await globalFilterContextService.getCatalog();

        const cycleId = catalog.context.ciclo_acreditacion_id;

        if (cycleId === null) {
          if (isMounted) setHasCompleteContext(false);
          return;
        }

        const cycleValid = catalog.cycles.some(
          (cy) => cy.ciclo_acreditacion_id === cycleId,
        );

        if (isMounted) {
          setHasCompleteContext(cycleValid);
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
  }, [isAuthenticated, isTeacher, location.pathname]);

  if (needsContextRedirect) {
    return (
      <Navigate
        to={ROUTES.CONTEXT_SELECTOR}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (checkingContext) {
    return (
      <div className="relative flex items-center justify-center min-h-screen">
        <LoadingSpinner variant="loader" />
      </div>
    );
  }

  if (!isTeacher && !hasCompleteContext && !isOnSelectorPage) {
    return (
      <Navigate
        to={ROUTES.CONTEXT_SELECTOR}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
};
