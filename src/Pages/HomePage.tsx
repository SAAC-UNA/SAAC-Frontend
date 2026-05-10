import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  LoadingSpinner,
  ScreenContainer,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/Components/Ui/Index";
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
import type { ExtensionRequest } from "@/Types/ExtensionRequestTypes";
import { ROUTES } from "@/Constants/ROUTES";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { CARD_HOVER_SHADOWS } from "@/Constants/CardHoverShadows";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { useOperationalContextSnapshot } from "@/Hooks/useOperationalContextSnapshot";
import { getNavigationItems } from "@/Navigation";
import {
  Breadcrumb,
  type BreadcrumbItem,
} from "@/Components/Ui/Feedback/Breadcrumb";
import { getIconByName } from "@/Components/Ui/Icons/SystemIcons";
import { Link, useNavigate } from "react-router-dom";

const isTeacherRole = (roles: string[]): boolean =>
  roles.some((role) => {
    const normalizedRole = role.toLowerCase();
    return normalizedRole === "profesor" || normalizedRole === "docente";
  });

const isSuperUserRole = (roles: string[]): boolean =>
  roles.some((role) => {
    const normalizedRole = role.toLowerCase();
    return (
      normalizedRole === "superusuario" || normalizedRole === "super usuario"
    );
  });

const getModuleCardText = (moduleKey: string) => {
  const moduleInfo = getModuleInfo(moduleKey);

  return {
    title: moduleInfo.title,
    description: moduleInfo.description,
  };
};

interface TeacherDashboardMetrics {
  activeAssignments: number;
  completedAssignments: number;
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

interface DashboardQuickCard {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  cardClassName: string;
  titleClassName: string;
}

// Mini-header que muestra el contexto activo con navegación específica por paso
interface ContextMiniHeaderProps {
  className?: string;
}

const ContextMiniHeader: React.FC<ContextMiniHeaderProps> = ({ className }) => {
  const snapshot = useOperationalContextSnapshot();
  const { userRoleNames } = useAuth();
  const isSuper = isSuperUserRole(userRoleNames);

  const rawCareerLabel = snapshot.careerLabel ?? "";
  const resolvedCampusTooltip = snapshot.campusLabel
    ? snapshot.campusLabel
    : rawCareerLabel.includes(" - ")
      ? rawCareerLabel.split(" - ").slice(1).join(" - ").trim() || null
      : null;
  const resolvedCareerLabel = rawCareerLabel.includes(" - ")
    ? rawCareerLabel.split(" - ")[0].trim()
    : rawCareerLabel;

  const items: BreadcrumbItem[] = [];

  // Carrera: solo superusuario, va al paso career
  if (isSuper && resolvedCareerLabel) {
    items.push({
      label: resolvedCareerLabel,
      href: `${ROUTES.CONTEXT_SELECTOR}?step=career`,
      tooltip: resolvedCampusTooltip ?? "Cambiar carrera",
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
      <div className={className ?? "mb-4"}>
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
    <div className={className ?? "mb-4"}>
      <Breadcrumb items={items} />
    </div>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { userRoleNames, userPermissionNames, user } = useAuth();
  const toast = useToast();
  const toastRef = useRef(toast);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const isTeacher = useMemo(
    () => isTeacherRole(userRoleNames),
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
  const [, setTeacherMetrics] = useState<TeacherDashboardMetrics>({
    activeAssignments: 0,
    completedAssignments: 0,
    totalRequests: 0,
    reviewedRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });
  const [, setSuperMetrics] = useState<SuperUserDashboardMetrics>({
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
        auditLogService.getAuditLogs({ page: 1, per_page: 1 }),
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
    } catch {
      toastRef.current.error(
        "No se pudo cargar el tablero TI con datos reales.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getTeacherUserId = (): number | null => {
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

  const loadTeacherDashboard = async () => {
    const userId = getTeacherUserId();
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
        (assignment) =>
          (assignment.estado ?? "").toLowerCase() !== "completado",
      ).length;
      const activeFlexibleAssignments = flexibleAssignments.filter(
        (assignment) =>
          (assignment.estado ?? "").toLowerCase() !== "completado",
      ).length;
      const completedTraditionalAssignments = traditionalAssignments.filter(
        (assignment) =>
          (assignment.estado ?? "").toLowerCase() === "completado",
      ).length;
      const completedFlexibleAssignments = flexibleAssignments.filter(
        (assignment) =>
          (assignment.estado ?? "").toLowerCase() === "completado",
      ).length;

      const allRequests = [
        ...traditionalRequests.data,
        ...flexibleRequests.data,
      ];

      setTeacherMetrics({
        activeAssignments:
          activeTraditionalAssignments + activeFlexibleAssignments,
        completedAssignments:
          completedTraditionalAssignments + completedFlexibleAssignments,
        totalRequests: allRequests.length,
        reviewedRequests: calculateReviewedRequests(allRequests),
        pendingRequests: countByStatus(allRequests, "pendiente"),
        approvedRequests: countByStatus(allRequests, "aprobada"),
        rejectedRequests: countByStatus(allRequests, "rechazada"),
      });
    } catch {
      toastRef.current.error("No se pudo cargar el resumen del docente.");
    }
  };

  useEffect(() => {
    if (isTeacher) {
      void loadTeacherDashboard();
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
  }, [isTeacher, isSuperUser]);

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

  const dashboardQuickCards = useMemo(() => {
    const routeMeta: Record<string, Omit<DashboardQuickCard, "href">> = {
      [ROUTES.EVIDENCE_MY]: {
        ...getModuleCardText("my_evidence_assignments"),
        icon: (
          <span className="text-info">
            {getIconByName("myEvidences", "xl")}
          </span>
        ),
        cardClassName: CARD_HOVER_SHADOWS.info,
        titleClassName: "text-info",
      },
      [ROUTES.EVIDENCE_ASSIGN]: {
        ...getModuleCardText("evidence_assignment_wizard"),
        icon: (
          <span className="text-teal">
            {getIconByName("assignEvidence", "xl")}
          </span>
        ),
        cardClassName: CARD_HOVER_SHADOWS.teal,
        titleClassName: "text-teal",
      },
      [ROUTES.EVIDENCE_SEARCH]: {
        ...getModuleCardText("evidence_search"),
        icon: (
          <span className="text-verde">{getIconByName("search", "xl")}</span>
        ),
        cardClassName: CARD_HOVER_SHADOWS.verde,
        titleClassName: "text-verde",
      },
      [ROUTES.EXTENSION_REQUESTS_MY]: {
        ...getModuleCardText("extension_requests_my"),
        icon: (
          <span className="text-error">{getIconByName("clock", "xl")}</span>
        ),
        cardClassName: CARD_HOVER_SHADOWS.error,
        titleClassName: "text-error",
      },
      [ROUTES.EXTENSION_REQUESTS_MANAGE]: {
        ...getModuleCardText("extension_requests_manage"),
        icon: (
          <span className="text-error">{getIconByName("clock", "xl")}</span>
        ),
        cardClassName: CARD_HOVER_SHADOWS.error,
        titleClassName: "text-error",
      },
      [ROUTES.BLOCK_APPROVAL]: {
        ...getModuleCardText("block_approval"),
        icon: (
          <span className="text-verde">
            {getIconByName("check-circle", "xl")}
          </span>
        ),
        cardClassName: CARD_HOVER_SHADOWS.verde,
        titleClassName: "text-verde",
      },
      [ROUTES.ACCREDITATION_CYCLES]: {
        ...getModuleCardText("accreditation_cycles"),
        icon: (
          <span className="text-naranja">
            {getIconByName("calendar", "xl")}
          </span>
        ),
        cardClassName: CARD_HOVER_SHADOWS.naranja,
        titleClassName: "text-naranja",
      },
      [ROUTES.ACCREDITATION_PROCESSES]: {
        ...getModuleCardText("accreditation_processes"),
        icon: (
          <span className="text-verde">
            {getIconByName("box-archive", "xl")}
          </span>
        ),
        cardClassName: CARD_HOVER_SHADOWS.verde,
        titleClassName: "text-verde",
      },
      [ROUTES.STRUCTURE_MODELS]: {
        ...getModuleCardText("accreditation_models"),
        icon: (
          <span className="text-slate">{getIconByName("nut", "xl")}</span>
        ),
        cardClassName: CARD_HOVER_SHADOWS.slate,
        titleClassName: "text-slate",
      },
      [ROUTES.ACCREDITATION]: {
        ...getModuleCardText("accreditation"),
        icon: (
          <span className="text-slate">
            {getIconByName("box-archive", "xl")}
          </span>
        ),
        cardClassName: CARD_HOVER_SHADOWS.slate,
        titleClassName: "text-slate",
      },
      [ROUTES.USERS]: {
        ...getModuleCardText("users"),
        icon: (
          <span className="text-warning">{getIconByName("user", "xl")}</span>
        ),
        cardClassName: CARD_HOVER_SHADOWS.warning,
        titleClassName: "text-warning",
      },
      [ROUTES.ROLES]: {
        ...getModuleCardText("roles"),
        icon: (
          <span className="text-info">{getIconByName("shield", "xl")}</span>
        ),
        cardClassName: CARD_HOVER_SHADOWS.info,
        titleClassName: "text-info",
      },
      [ROUTES.AUDIT_LOG]: {
        ...getModuleCardText("auditlog"),
        icon: (
          <span className="text-error">
            {getIconByName("edit-element", "xl")}
          </span>
        ),
        cardClassName: CARD_HOVER_SHADOWS.error,
        titleClassName: "text-error",
      },
      [ROUTES.REPORTS]: {
        ...getModuleCardText("final_reports"),
        icon: (
          <span className="text-teal">{getIconByName("reports", "xl")}</span>
        ),
        cardClassName: CARD_HOVER_SHADOWS.teal,
        titleClassName: "text-teal",
      },
      [ROUTES.SINAES_ADMIN]: {
        ...getModuleCardText("accreditation_report_admin"),
        icon: (
          <span className="text-indigo">{getIconByName("medal", "xl")}</span>
        ),
        cardClassName: CARD_HOVER_SHADOWS.indigo,
        titleClassName: "text-indigo",
      },
    };

    const contextCycleId =
      superSnapshot.cycleId ?? (cycleId ? Number(cycleId) : null);
    const contextProcessId =
      superSnapshot.processId ?? (processId ? Number(processId) : null);

    const visibleItems = getNavigationItems({
      roles: userRoleNames,
      permissions: userPermissionNames,
      context: {
        hasOperationalContext: true,
        cycleId: contextCycleId,
        processId: contextProcessId,
      },
    });

    const visibleRoutes = new Set(
      visibleItems
        .flatMap((item) =>
          item.children && item.children.length > 0 ? item.children : [item],
        )
        .map((item) => item.href)
        .filter((href): href is string => Boolean(href && href !== "#")),
    );

    const priorities = isSuperUser
      ? [
          ROUTES.USERS,
          ROUTES.ROLES,
          ROUTES.AUDIT_LOG,
          ROUTES.ACCREDITATION,
          ROUTES.REPORTS,
          ROUTES.SINAES_ADMIN,
        ]
      : isTeacher
        ? [
            ROUTES.EVIDENCE_MY,
            ROUTES.EXTENSION_REQUESTS_MY,
            ROUTES.EVIDENCE_SEARCH,
          ]
        : [
            ROUTES.EVIDENCE_ASSIGN,
            ROUTES.EVIDENCE_MY,
            ROUTES.EXTENSION_REQUESTS_MANAGE,
            ROUTES.EXTENSION_REQUESTS_MY,
            ROUTES.EVIDENCE_SEARCH,
            ROUTES.BLOCK_APPROVAL,
            ROUTES.ACCREDITATION_PROCESSES,
            ROUTES.ACCREDITATION_CYCLES,
            ROUTES.REPORTS,
            ROUTES.SINAES_ADMIN,
          ];

    return priorities
      .filter((href) => visibleRoutes.has(href) && Boolean(routeMeta[href]))
      .slice(0, isSuperUser ? 6 : 4)
      .map((href) => ({ href, ...routeMeta[href] }));
  }, [
    cycleId,
    isTeacher,
    isSuperUser,
    processId,
    superSnapshot.cycleId,
    superSnapshot.processId,
    userPermissionNames,
    userRoleNames,
  ]);

  const superContextLabels = useMemo(() => {
    const careerFromSnapshot = superSnapshot.careerLabel ?? "No seleccionado";
    const campusFromSnapshot = superSnapshot.campusLabel ?? null;

    if (campusFromSnapshot) {
      return {
        career: careerFromSnapshot,
        campus: campusFromSnapshot,
      };
    }

    if (careerFromSnapshot.includes(" - ")) {
      const [careerPart, ...campusParts] = careerFromSnapshot.split(" - ");
      const parsedCampus = campusParts.join(" - ").trim();
      return {
        career: careerPart.trim() || "No seleccionado",
        campus: parsedCampus || "No seleccionado",
      };
    }

    return {
      career: careerFromSnapshot,
      campus: "No seleccionado",
    };
  }, [superSnapshot.careerLabel, superSnapshot.campusLabel]);

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

  if (isTeacher) {
    return (
      <ScreenContainer variant="full-width" className="space-y-6 pt-8 md:pt-12">
        <div className="w-full max-w-6xl mx-auto mt-10 md:mt-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-negro-una leading-tight">
            Panel de Inicio
          </h1>
        </div>

        <div className="max-w-6xl mx-auto w-full mt-10 md:mt-12 flex justify-center">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
            {dashboardQuickCards.map((card) => (
              <div
                key={card.href}
                className="w-full h-48 cursor-pointer"
                onClick={() => navigate(card.href)}
              >
                <Card
                  className={`h-48 p-5 transition-all duration-200 ${card.cardClassName}`}
                >
                  <div className="grid grid-cols-3 grid-rows-4 gap-0 h-full">
                    <div className="col-start-1 col-end-3 row-start-1 row-end-3 flex items-center">
                      <p
                        className={`${TYPOGRAPHY.pageTitle} font-bold text-negro-una`}
                      >
                        {card.title}
                      </p>
                    </div>
                    <div className="col-start-3 col-end-4 row-start-1 row-end-3 flex items-center justify-end">
                      {card.icon}
                    </div>
                    <div className="col-start-1 col-end-4 row-start-3 row-end-5">
                      <p className="text-sm text-gris-una">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </ScreenContainer>
    );
  }

  if (isSuperUser) {
    return (
      <ScreenContainer variant="full-width" className="space-y-6 pt-4 md:pt-6">
        <ContextMiniHeader className="mb-2" />
        <div className="w-full max-w-screen-2xl mx-auto px-1 md:px-2 mt-10 md:mt-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-negro-una leading-tight">
            Panel de Inicio
          </h1>
        </div>

        <div className="max-w-screen-2xl mx-auto w-full px-1 md:px-2 mt-10 md:mt-12 flex items-center justify-center">
          <div className="w-full max-w-screen-xl grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <Card className="relative lg:col-span-3 w-full h-full min-h-[24rem] p-5 pb-20">
              <p
                className={`${TYPOGRAPHY.pageTitle} font-bold text-negro-una mb-3`}
              >
                Espacio de Trabajo
              </p>
              <div className="space-y-2">
                {[
                  { label: "Carrera", value: superContextLabels.career },
                  { label: "Sede", value: superContextLabels.campus },
                  { label: "Ciclo", value: superSnapshot.cycleLabel },
                  { label: "Proceso", value: superSnapshot.processLabel },
                ].map((row) => (
                  <div key={row.label} className="pb-2">
                    <p
                      className={`${TYPOGRAPHY.form.label} font-bold text-negro-una`}
                    >
                      {row.label}
                    </p>
                    <p
                      className={`mt-0.5 ${TYPOGRAPHY.body} font-normal text-gris-una-3 leading-snug`}
                    >
                      {row.value ?? "No seleccionado"}
                    </p>
                  </div>
                ))}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5"
                    onClick={() => navigate(ROUTES.CONTEXT_SELECTOR)}
                  >
                    Cambiar
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Abra el selector para ajustar ciclo y proceso de trabajo.
                </TooltipContent>
              </Tooltip>
            </Card>

            <div className="lg:col-span-9 h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-[11.5rem]">
                {dashboardQuickCards.map((card) => (
                  <div
                    key={card.href}
                    className="h-[11.5rem] cursor-pointer"
                    onClick={() => navigate(card.href)}
                  >
                    <Card
                      className={`h-[11.5rem] p-4 transition-all duration-200 ${card.cardClassName}`}
                    >
                      <div className="grid grid-cols-3 grid-rows-4 gap-0 h-full">
                        <div className="col-start-1 col-end-3 row-start-1 row-end-3 flex items-center">
                          <p
                            className={`${TYPOGRAPHY.pageTitle} font-bold text-negro-una`}
                          >
                            {card.title}
                          </p>
                        </div>
                        <div className="col-start-3 col-end-4 row-start-1 row-end-3 flex items-center justify-end">
                          {card.icon}
                        </div>
                        <div className="col-start-1 col-end-4 row-start-3 row-end-5">
                          <p className="text-sm text-gris-una">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
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
      <div className="w-full mt-10 md:mt-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-negro-una leading-tight">
          Panel de Inicio
        </h1>
      </div>

      <div className="w-full max-w-screen-xl mx-auto mt-10 md:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <Card className="relative lg:col-span-4 min-h-72 p-5 pb-20 self-start">
          <p
            className={`${TYPOGRAPHY.body} font-semibold text-negro-una mb-3`}
          >
            Espacio de Trabajo
          </p>

          <div className="space-y-2">
            <div className="pb-2">
              <p
                className={`${TYPOGRAPHY.form.label} font-semibold text-negro-una`}
              >
                Carrera
              </p>
              <p
                className={`mt-0.5 ${TYPOGRAPHY.body} font-normal text-gris-una-3 leading-snug`}
              >
                {fixedCareer ? fixedCareer.carrera_nombre : "No seleccionado"}
              </p>
            </div>
            <div className="pb-2">
              <p
                className={`${TYPOGRAPHY.form.label} font-semibold text-negro-una`}
              >
                Sede
              </p>
              <p
                className={`mt-0.5 ${TYPOGRAPHY.body} font-normal text-gris-una-3 leading-snug`}
              >
                {fixedCareer ? fixedCareer.sede_nombre : "No seleccionado"}
              </p>
            </div>
            <div className="pb-2">
              <p
                className={`${TYPOGRAPHY.form.label} font-semibold text-negro-una`}
              >
                Ciclo
              </p>
              <p
                className={`mt-0.5 ${TYPOGRAPHY.body} font-normal text-gris-una-3 leading-snug`}
              >
                {selectedCycleLabel}
              </p>
            </div>
            <div>
              <p
                className={`${TYPOGRAPHY.form.label} font-semibold text-negro-una`}
              >
                Proceso
              </p>
              <p
                className={`mt-0.5 ${TYPOGRAPHY.body} font-normal text-gris-una-3 leading-snug`}
              >
                {selectedProcessLabel}
              </p>
            </div>
          </div>

          {(saving || !(cycleId || processId)) && (
            <p className="text-xs text-gris-una mt-3">
              {saving
                ? "Actualizando contexto..."
                : "Seleccione su contexto para comenzar."}
            </p>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5"
                onClick={() => navigate(ROUTES.CONTEXT_SELECTOR)}
              >
                Cambiar
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Abra el selector para ajustar ciclo y proceso de trabajo.
            </TooltipContent>
          </Tooltip>
        </Card>

        <div className="lg:col-span-8 space-y-4">
          {!fixedCareer ? (
            <Card className="p-5">
              <p className="text-sm font-semibold text-negro-una">
                Su usuario no tiene una carrera asociada. Solicite la asignacion
                de carrera para continuar.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
              {dashboardQuickCards.map((card) => (
                <div
                  key={card.href}
                  className="w-full h-72 cursor-pointer"
                  onClick={() => navigate(card.href)}
                >
                  <Card
                    className={`h-72 p-5 transition-all duration-200 ${card.cardClassName}`}
                  >
                    <div className="grid grid-cols-3 grid-rows-4 gap-0 h-full">
                      <div className="col-start-1 col-end-3 row-start-1 row-end-3 flex items-center">
                        <p
                          className={`${TYPOGRAPHY.pageTitle} font-bold text-negro-una`}
                        >
                          {card.title}
                        </p>
                      </div>
                      <div className="col-start-3 col-end-4 row-start-1 row-end-3 flex items-center justify-end">
                        {card.icon}
                      </div>
                      <div className="col-start-1 col-end-4 row-start-3 row-end-5">
                        <p className="text-sm text-gris-una">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ScreenContainer>
  );
};

export default HomePage;
