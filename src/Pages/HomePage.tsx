import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  LoadingSpinner,
  PageHeader,
  ScreenContainer,
} from "@/Components/Ui/Index";
import { ButtonWithTooltip } from "@/Components/Ui/Buttons/ButtonWithTooltip";
import { useAuth } from "@/Context/AuthContext";
import { useToast } from "@/Hooks/useToast";
import { userService } from "@/Services/UserService";
import { roleService } from "@/Services/RoleService";
import auditLogService from "@/Services/AuditLogService";
import { evidenceAssignmentService } from "@/Services/EvidenceAssignmentService";
import { extensionRequestService } from "@/Services/ExtensionRequestService";
import { flexibleExtensionRequestService } from "@/Services/FlexibleExtensionRequestService";
import {
  globalFilterContextService,
  type GlobalFilterCareer,
  type GlobalFilterCatalog,
} from "@/Services/GlobalFilterContextService";
import type { AuditLog } from "@/Types/AuditLogTypes";
import type { ExtensionRequest } from "@/Types/ExtensionRequestTypes";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { ROUTES } from "@/Constants/ROUTES";
import { useOperationalContextSnapshot } from "@/Hooks/useOperationalContextSnapshot";
import {
  Breadcrumb,
  type BreadcrumbItem,
} from "@/Components/Ui/Feedback/Breadcrumb";
import { Link, useNavigate } from "react-router-dom";

const isProfessorRole = (roles: string[]): boolean =>
  roles.some((role) => role.toLowerCase() === "profesor");

const isSuperUserRole = (roles: string[]): boolean =>
  roles.some((role) => {
    const normalizedRole = role.toLowerCase();
    return (
      normalizedRole === "superusuario" || normalizedRole === "super usuario"
    );
  });

interface ProfessorDashboardMetrics {
  activeAssignments: number;
  totalRequests: number;
  reviewedRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

interface SuperUserDashboardMetrics {
  usersTotal: number;
  usersActive: number;
  usersInactive: number;
  rolesTotal: number;
  careersTotal: number;
  cyclesTotal: number;
  processesTotal: number;
  pendingRequests: number;
  rejectedRequests: number;
  auditTotal: number;
}

// Mini-header que muestra el contexto activo con navegación específica por paso
const ContextMiniHeader: React.FC = () => {
  const snapshot = useOperationalContextSnapshot();
  const { userRoleNames } = useAuth();
  const isSuper = isSuperUserRole(userRoleNames);

  const items: BreadcrumbItem[] = [];

  // Carrera: solo superusuario, va al paso career
  if (isSuper && snapshot.careerLabel) {
    items.push({
      label: snapshot.careerLabel,
      href: `${ROUTES.CONTEXT_SELECTOR}?step=career`,
      tooltip: "Cambiar carrera",
    });
  }

  // Ciclo: va al paso cycle (mantiene carrera en snapshot)
  if (snapshot.cycleLabel) {
    items.push({
      label: snapshot.cycleLabel,
      href: `${ROUTES.CONTEXT_SELECTOR}?step=cycle`,
      tooltip: snapshot.careerLabel ?? "Cambiar ciclo",
    });
  }

  // Proceso: va al paso process (mantiene carrera + ciclo en snapshot)
  if (snapshot.processLabel) {
    items.push({
      label: snapshot.processLabel,
      href: `${ROUTES.CONTEXT_SELECTOR}?step=process`,
      tooltip: snapshot.cycleLabel ?? "Cambiar proceso",
    });
  }

  if (items.length === 0) {
    return (
      <div className="mb-4">
        <Link
          to={ROUTES.CONTEXT_SELECTOR}
          className="inline-flex items-center gap-2 rounded-full border border-azul-claro/30 bg-white px-4 py-2 text-sm font-semibold text-azul-una shadow-sm transition hover:-translate-y-0.5 hover:border-azul-una/30 hover:bg-azul-50"
        >
          <span aria-hidden="true">*</span>
          Seleccionar contexto
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <Breadcrumb items={items} />
    </div>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { userRoleNames, user } = useAuth();
  const toast = useToast();
  const toastRef = useRef(toast);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const isProfessor = useMemo(
    () => isProfessorRole(userRoleNames),
    [userRoleNames],
  );
  const isSuperUser = useMemo(
    () => isSuperUserRole(userRoleNames),
    [userRoleNames],
  );

  const [loading, setLoading] = useState(true);
  const saving = false;
  const [catalog, setCatalog] = useState<GlobalFilterCatalog | null>(null);
  const superSnapshot = useOperationalContextSnapshot();
  const [fixedCareer, setFixedCareer] = useState<GlobalFilterCareer | null>(
    null,
  );
  const [cycleId, setCycleId] = useState("");
  const [processId, setProcessId] = useState("");
  const [professorMetrics, setProfessorMetrics] =
    useState<ProfessorDashboardMetrics>({
      activeAssignments: 0,
      totalRequests: 0,
      reviewedRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
    });
  const [superMetrics, setSuperMetrics] = useState<SuperUserDashboardMetrics>({
    usersTotal: 0,
    usersActive: 0,
    usersInactive: 0,
    rolesTotal: 0,
    careersTotal: 0,
    cyclesTotal: 0,
    processesTotal: 0,
    pendingRequests: 0,
    rejectedRequests: 0,
    auditTotal: 0,
  });
  const [superRecentLogs, setSuperRecentLogs] = useState<AuditLog[]>([]);
  const [professorNow, setProfessorNow] = useState<Date>(() => new Date());

  const professorDateTimeLabel = useMemo(() => {
    const timeLabel = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(professorNow);

    const dayLabel = new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(professorNow);

    return `Son las ${timeLabel} del ${dayLabel}`;
  }, [professorNow]);

  const loadSuperUserDashboard = async () => {
    try {
      const [
        users,
        rolesResponse,
        catalogData,
        pendingTrad,
        pendingFlex,
        rejectedTrad,
        rejectedFlex,
        auditResponse,
      ] = await Promise.all([
        userService.listUsers(),
        roleService.listarRoles(),
        globalFilterContextService.getCatalog(),
        extensionRequestService.getAllRequests({
          estado: "pendiente",
          page: 1,
          per_page: 1,
        }),
        flexibleExtensionRequestService.getAllRequests({
          estado: "pendiente",
          page: 1,
          per_page: 1,
        }),
        extensionRequestService.getAllRequests({
          estado: "rechazada",
          page: 1,
          per_page: 1,
        }),
        flexibleExtensionRequestService.getAllRequests({
          estado: "rechazada",
          page: 1,
          per_page: 1,
        }),
        auditLogService.getAuditLogs({ page: 1, per_page: 8 }),
      ]);

      const totalUsers = users.length;
      const activeUsers = users.filter(
        (backendUser) => backendUser.status === "active",
      ).length;
      const inactiveUsers = totalUsers - activeUsers;
      const totalRoles = rolesResponse.data?.length ?? 0;

      setSuperMetrics({
        usersTotal: totalUsers,
        usersActive: activeUsers,
        usersInactive: inactiveUsers,
        rolesTotal: totalRoles,
        careersTotal: catalogData.careers.length,
        cyclesTotal: catalogData.cycles.length,
        processesTotal: catalogData.processes.length,
        pendingRequests: pendingTrad.meta.total + pendingFlex.meta.total,
        rejectedRequests: rejectedTrad.meta.total + rejectedFlex.meta.total,
        auditTotal: auditResponse.total,
      });

      setSuperRecentLogs(auditResponse.data);
    } catch {
      toastRef.current.error(
        "No se pudo cargar el tablero TI con datos reales.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setProfessorNow(new Date());
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const getProfessorUserId = (): number | null => {
    const userWithOptionalId = user as {
      usuario_id?: number;
      id?: number;
    } | null;
    return userWithOptionalId?.usuario_id ?? userWithOptionalId?.id ?? null;
  };

  const calculateReviewedRequests = (requests: ExtensionRequest[]): number => {
    return requests.filter((request) => {
      const requestStatus = (request.estado ?? "").toLowerCase();
      return requestStatus === "aprobada" || requestStatus === "rechazada";
    }).length;
  };

  const countByStatus = (
    requests: ExtensionRequest[],
    status: "pendiente" | "aprobada" | "rechazada",
  ): number => {
    return requests.filter(
      (request) => (request.estado ?? "").toLowerCase() === status,
    ).length;
  };

  const loadProfessorDashboard = async () => {
    const userId = getProfessorUserId();
    if (!userId) {
      return;
    }

    try {
      const [
        traditionalAssignments,
        flexibleAssignments,
        traditionalRequests,
        flexibleRequests,
      ] = await Promise.all([
        evidenceAssignmentService.getMyAssignments(userId),
        evidenceAssignmentService.getMyElementAssignments(userId),
        extensionRequestService.getMyRequests({ per_page: 100 }),
        flexibleExtensionRequestService.getMyRequests({ per_page: 100 }),
      ]);

      const activeTraditionalAssignments = traditionalAssignments.filter(
        (assignment) => assignment.estado !== "completado",
      ).length;
      const activeFlexibleAssignments = flexibleAssignments.filter(
        (assignment) => assignment.estado.toLowerCase() !== "completado",
      ).length;

      const allRequests = [
        ...traditionalRequests.data,
        ...flexibleRequests.data,
      ];

      setProfessorMetrics({
        activeAssignments:
          activeTraditionalAssignments + activeFlexibleAssignments,
        totalRequests: allRequests.length,
        reviewedRequests: calculateReviewedRequests(allRequests),
        pendingRequests: countByStatus(allRequests, "pendiente"),
        approvedRequests: countByStatus(allRequests, "aprobada"),
        rejectedRequests: countByStatus(allRequests, "rechazada"),
      });
    } catch {
      toastRef.current.error("No se pudo cargar el resumen del profesor.");
    }
  };

  useEffect(() => {
    if (isProfessor) {
      void loadProfessorDashboard();
      setLoading(false);
      return;
    }

    if (isSuperUser) {
      void loadSuperUserDashboard();
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
  }, [isProfessor, isSuperUser]);

  useEffect(() => {
    if (!isSuperUser) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadSuperUserDashboard();
    }, 60000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isSuperUser]);

  const availableCycles = useMemo(() => {
    if (!catalog || !fixedCareer) {
      return [];
    }

    return catalog.cycles.filter(
      (cycle) => cycle.carrera_sede_id === fixedCareer.carrera_sede_id,
    );
  }, [catalog, fixedCareer]);

  const availableProcesses = useMemo(() => {
    if (!catalog || !cycleId) {
      return [];
    }

    return catalog.processes.filter(
      (process) => process.ciclo_acreditacion_id === Number(cycleId),
    );
  }, [catalog, cycleId]);

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

  if (isProfessor) {
    return (
      <ScreenContainer variant="full-width" className="space-y-6 pt-8 md:pt-12">
        <div className="text-center py-2">
          <h1 className="text-4xl font-bold text-negro-una leading-tight">
            Sistema de Acreditación y Autoevaluación de Carreras
          </h1>
          <p className="mt-2 text-base font-semibold text-gris-una">
            {professorDateTimeLabel}
          </p>
        </div>

        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 place-items-center">
            <Card className="w-full max-w-sm min-h-56 p-5 border border-azul-una/20 bg-azul-una/5 text-center flex flex-col items-center justify-center">
              <p className="text-xs uppercase tracking-wide text-azul-una mb-2">
                Asignaciones activas
              </p>
              <p className="text-5xl font-bold text-negro-una leading-none">
                {professorMetrics.activeAssignments}
              </p>
              <p className="text-sm text-gris-una mt-3">
                Entregables que aun requieren trabajo.
              </p>
            </Card>

            <Card className="w-full max-w-sm min-h-56 p-5 border border-rojo-una/20 bg-rojo-una/5 text-center flex flex-col items-center justify-center">
              <p className="text-xs uppercase tracking-wide text-rojo-una mb-2">
                Mis solicitudes
              </p>
              <p className="text-5xl font-bold text-negro-una leading-none">
                {professorMetrics.totalRequests}
              </p>
              <p className="text-sm text-gris-una mt-3">
                Solicitudes de ampliacion enviadas.
              </p>
            </Card>

            <Card className="w-full max-w-sm min-h-56 p-5 border border-verde/20 bg-verde/5 text-center flex flex-col items-center justify-center">
              <p className="text-xs uppercase tracking-wide text-verde mb-2">
                Retroalimentacion
              </p>
              <p className="text-5xl font-bold text-negro-una leading-none">
                {professorMetrics.reviewedRequests}
              </p>
              <p className="text-sm text-gris-una mt-3">
                Solicitudes ya revisadas por encargados.
              </p>
            </Card>

            <Card className="w-full max-w-sm min-h-56 p-5 border border-warning/20 bg-warning/10 text-center flex flex-col items-center justify-center">
              <p className="text-xs uppercase tracking-wide text-warning mb-2">
                Pendientes
              </p>
              <p className="text-5xl font-bold text-negro-una leading-none">
                {professorMetrics.pendingRequests}
              </p>
              <p className="text-sm text-gris-una mt-3">
                Solicitudes en espera de respuesta.
              </p>
            </Card>

            <Card className="w-full max-w-sm min-h-56 p-5 border border-info/20 bg-info/10 text-center flex flex-col items-center justify-center">
              <p className="text-xs uppercase tracking-wide text-info mb-2">
                Aprobadas
              </p>
              <p className="text-5xl font-bold text-negro-una leading-none">
                {professorMetrics.approvedRequests}
              </p>
              <p className="text-sm text-gris-una mt-3">
                Solicitudes autorizadas por encargado.
              </p>
            </Card>

            <Card className="w-full max-w-sm min-h-56 p-5 border border-rojo-una-2/25 bg-rojo-una-2/10 text-center flex flex-col items-center justify-center">
              <p className="text-xs uppercase tracking-wide text-rojo-una-2 mb-2">
                Rechazadas
              </p>
              <p className="text-5xl font-bold text-negro-una leading-none">
                {professorMetrics.rejectedRequests}
              </p>
              <p className="text-sm text-gris-una mt-3">
                Solicitudes rechazadas por encargado.
              </p>
            </Card>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  if (isSuperUser) {
    return (
      <ScreenContainer variant="full-width" className="space-y-6 pt-8 md:pt-12">
        <ContextMiniHeader />
        <div className="text-center py-2">
          <h1 className="text-4xl font-bold text-negro-una leading-tight">
            Sistema de Acreditación y Autoevaluación de Carreras
          </h1>
          <p className="mt-2 text-base font-semibold text-gris-una">
            {professorDateTimeLabel}
          </p>
          <p className="mt-1 text-sm text-gris-una">
            Tablero técnico TI (datos reales)
          </p>
        </div>

        {/* Card de contexto activo */}
        <div className="max-w-6xl mx-auto w-full">
          <Card className="relative w-full max-w-sm p-5 sm:p-6 border border-azul-una/20 bg-linear-to-br from-azul-una/10 via-blanco-una to-rojo-una/5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-azul-una mb-3">
              Espacio de Trabajo
            </p>
            <div className="space-y-2">
              {[
                { label: "Carrera / Sede", value: superSnapshot.careerLabel },
                { label: "Ciclo", value: superSnapshot.cycleLabel },
                { label: "Proceso", value: superSnapshot.processLabel },
              ].map((row) => (
                <div
                  key={row.label}
                  className="rounded-corner border border-blanco-una/40 p-2"
                >
                  <p className="text-xs uppercase tracking-wide text-gris-una">
                    {row.label}
                  </p>
                  <p className="mt-1 text-base font-semibold text-negro-una">
                    {row.value ?? "No seleccionado"}
                  </p>
                </div>
              ))}
            </div>
            <ButtonWithTooltip
              tooltip="Abre el selector para ajustar ciclo y proceso de trabajo."
              tooltipPosition="top"
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4 min-w-0 p-0"
              style={{ width: 48, height: 48, padding: 0 }}
              onClick={() => navigate(ROUTES.CONTEXT_SELECTOR)}
            >
              <SystemIcons.structure.hierarchy className="w-5 h-5" />
            </ButtonWithTooltip>
          </Card>
        </div>

        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <Card className="lg:col-span-8 p-5 border border-negro-una bg-negro-una text-blanco-una">
              <div className="flex items-center justify-between mb-4 font-mono">
                <p className="text-xs tracking-[0.25em] text-blanco-una/70 uppercase">
                  BITACORA_RECIENTE
                </p>
                <p className="text-xs text-blanco-una/70">
                  total registros: {superMetrics.auditTotal}
                </p>
              </div>

              <div className="rounded-corner border border-blanco-una/20 p-4 bg-negro-una-2/60 font-mono text-xs space-y-2 max-h-80 overflow-auto">
                {superRecentLogs.length === 0 ? (
                  <p className="text-blanco-una/70">
                    Sin eventos para mostrar.
                  </p>
                ) : (
                  superRecentLogs.map((auditLog) => (
                    <p
                      key={auditLog.bitacora_id}
                      className="text-blanco-una/85 wrap-break-word"
                    >
                      [{new Date(auditLog.fecha_hora).toLocaleString()}]{" "}
                      {auditLog.modulo ?? "sistema"} -{" "}
                      {auditLog.tipo_accion.descripcion} -{" "}
                      {auditLog.usuario?.email ?? "usuario-desconocido"}
                    </p>
                  ))
                )}
              </div>
            </Card>

            <Card className="lg:col-span-4 p-5 border border-azul-una/20 bg-azul-una/5">
              <p className="text-xs uppercase tracking-[0.2em] text-azul-una mb-3">
                SUPERVISION
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gris-una">Usuarios</span>
                  <span className="font-semibold text-negro-una">
                    {superMetrics.usersTotal}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gris-una">Usuarios activos</span>
                  <span className="font-semibold text-negro-una">
                    {superMetrics.usersActive}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gris-una">Usuarios inactivos</span>
                  <span className="font-semibold text-negro-una">
                    {superMetrics.usersInactive}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gris-una">Roles</span>
                  <span className="font-semibold text-negro-una">
                    {superMetrics.rolesTotal}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="lg:col-span-4 p-4 border border-verde/20 bg-verde/5">
              <p className="text-xs uppercase tracking-wide text-verde mb-2">
                Estructura
              </p>
              <p className="text-4xl font-bold text-negro-una">
                {superMetrics.careersTotal}
              </p>
              <p className="text-sm text-gris-una mt-2">
                carreras/sedes registradas
              </p>
              <p className="text-sm text-negro-una mt-2">
                Ciclos:{" "}
                <span className="font-semibold">
                  {superMetrics.cyclesTotal}
                </span>
              </p>
              <p className="text-sm text-negro-una">
                Procesos:{" "}
                <span className="font-semibold">
                  {superMetrics.processesTotal}
                </span>
              </p>
            </Card>

            <Card className="lg:col-span-4 p-4 border border-warning/20 bg-warning/10">
              <p className="text-xs uppercase tracking-wide text-warning mb-2">
                Solicitudes pendientes
              </p>
              <p className="text-4xl font-bold text-negro-una">
                {superMetrics.pendingRequests}
              </p>
              <p className="text-sm text-gris-una mt-2">
                requieren revisión de encargados
              </p>
            </Card>

            <Card className="lg:col-span-4 p-4 border border-rojo-una/20 bg-rojo-una/5">
              <p className="text-xs uppercase tracking-wide text-rojo-una mb-2">
                Solicitudes rechazadas
              </p>
              <p className="text-4xl font-bold text-negro-una">
                {superMetrics.rejectedRequests}
              </p>
              <p className="text-sm text-gris-una mt-2">
                trazabilidad para análisis técnico/funcional
              </p>
            </Card>
          </div>
        </div>
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
      <ContextMiniHeader />
      <PageHeader
        title="Panel inicial"
        description="Seleccione el contexto de trabajo para navegar y consultar solo la informacion correspondiente."
        className="mb-4"
        breadcrumbMode="none"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="relative lg:col-span-5 min-h-56 p-5 sm:p-6 border border-azul-una/20 bg-linear-to-br from-azul-una/10 via-blanco-una to-rojo-una/5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-azul-una mb-3">
            Espacio de Trabajo
          </p>

          <div className="space-y-2">
            <div className="rounded-corner border border-blanco-una/40 p-2">
              <p className="text-xs uppercase tracking-wide text-gris-una">
                Carrera / Sede
              </p>
              <p className="mt-1 text-base font-semibold text-negro-una">
                {fixedCareer
                  ? `${fixedCareer.carrera_nombre} - ${fixedCareer.sede_nombre}`
                  : "No seleccionado"}
              </p>
            </div>
            <div className="rounded-corner border border-blanco-una/40 p-2">
              <p className="text-xs uppercase tracking-wide text-gris-una">
                Ciclo
              </p>
              <p className="mt-1 text-base font-semibold text-negro-una">
                {selectedCycleLabel}
              </p>
            </div>
            <div className="rounded-corner border border-blanco-una/40 p-2">
              <p className="text-xs uppercase tracking-wide text-gris-una">
                Proceso
              </p>
              <p className="mt-1 text-base font-semibold text-negro-una">
                {selectedProcessLabel}
              </p>
            </div>
          </div>

          {(saving || !(cycleId || processId)) && (
            <p className="text-xs text-gris-una mt-3">
              {saving
                ? "Actualizando contexto..."
                : "Selecciona tu contexto para comenzar."}
            </p>
          )}

          <ButtonWithTooltip
            tooltip="Abre el selector para ajustar ciclo y proceso de trabajo."
            tooltipPosition="top"
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4 min-w-0 p-0"
            style={{ width: 48, height: 48, padding: 0 }}
            onClick={() => navigate(ROUTES.CONTEXT_SELECTOR)}
          >
            <SystemIcons.structure.hierarchy className="w-5 h-5" />
          </ButtonWithTooltip>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="min-h-56 cursor-pointer"
                onClick={() => navigate(ROUTES.EVIDENCE_MY)}
              >
                <Card className="min-h-56 p-5 border border-azul-una/20 bg-azul-una/5 hover:shadow-xl transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-azul-una">
                        Asignaciones
                      </p>
                      <p className="mt-3 text-xl font-bold text-negro-una">
                        {availableCycles.length} ciclos activos
                      </p>
                      <p className="text-sm text-gris-una mt-2">
                        Gestiona las evidencias y entregables disponibles en tu
                        ciclo actual.
                      </p>
                    </div>
                    <SystemIcons.work.myEvidences className="w-8 h-8 text-azul-una" />
                  </div>
                </Card>
              </div>

              <div
                className="min-h-56 cursor-pointer"
                onClick={() => navigate(ROUTES.EXTENSION_REQUESTS_MY)}
              >
                <Card className="min-h-56 p-5 border border-rojo-una/20 bg-rojo-una/5 hover:shadow-xl transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-rojo-una">
                        Solicitudes
                      </p>
                      <p className="mt-3 text-xl font-bold text-negro-una">
                        {availableProcesses.length} procesos activos
                      </p>
                      <p className="text-sm text-gris-una mt-2">
                        Revisa el estado y los detalles de tus solicitudes de
                        extensión.
                      </p>
                    </div>
                    <SystemIcons.interface.clock className="w-8 h-8 text-rojo-una" />
                  </div>
                </Card>
              </div>

              <div
                className="min-h-56 cursor-pointer"
                onClick={() => navigate(ROUTES.EVIDENCE_SEARCH)}
              >
                <Card className="min-h-56 p-5 border border-verde/20 bg-verde/5 hover:shadow-xl transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-verde">
                        Evidencias
                      </p>
                      <p className="mt-3 text-xl font-bold text-negro-una">
                        {selectedProcessLabel !== "No seleccionado"
                          ? "Activo"
                          : "N/A"}
                      </p>
                      <p className="text-sm text-gris-una mt-2">
                        Busca y gestiona evidencias dentro de tu contexto.
                      </p>
                    </div>
                    <SystemIcons.interface.search className="w-8 h-8 text-verde" />
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </ScreenContainer>
  );
};

export default HomePage;
