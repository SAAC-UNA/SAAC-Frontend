import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/Utils/ClassNames";
import { useBreakpoint } from "@/hooks/UseBreakpoint";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { GLOBAL_FILTER_CONTEXT_CHANGED_EVENT } from "@/Services/GlobalFilterContextService";
import {
  globalFilterContextService,
  emitManualContextApplied,
  type GlobalFilterCatalog,
} from "@/Services/GlobalFilterContextService";
import {
  Breadcrumb,
  type BreadcrumbItem,
} from "@/Components/Ui/Feedback/Breadcrumb";
import { Modal } from "@/Components/Ui/Modals/Modal";
import { Button } from "@/Components/Ui/Buttons/Button";
import {
  CustomSelect,
  type SelectOption,
} from "@/Components/Ui/Forms/SingleSelect";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { useToast } from "@/Hooks/useToast";
import { useAuth } from "@/Context/AuthContext";
import {
  getOperationalContextSnapshot,
  type OperationalContextSnapshot,
} from "@/Services/OperationalContextStore";

const isSuperUserRole = (roles: string[]): boolean =>
  roles.some((role) => {
    const normalizedRole = role.toLowerCase();
    return (
      normalizedRole === "superusuario" || normalizedRole === "super usuario"
    );
  });

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode; // Para botones de acción, breadcrumbs, etc.
  headerExtra?: React.ReactNode; // Para contenido adicional al lado del título
  breadcrumbMode?: "none" | "simple" | "cycle-only" | "contextual";
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  className,
  children,
  headerExtra,
  breadcrumbMode = "none",
}) => {
  const { isMobile } = useBreakpoint();
  const { userRoleNames } = useAuth();
  const toast = useToast();
  const [contextSnapshot, setContextSnapshot] =
    useState<OperationalContextSnapshot>(() => getOperationalContextSnapshot());
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [contextModalLoading, setContextModalLoading] = useState(false);
  const [contextModalSaving, setContextModalSaving] = useState(false);
  const [contextCatalog, setContextCatalog] =
    useState<GlobalFilterCatalog | null>(null);
  const [modalCareerId, setModalCareerId] = useState("");
  const [modalCycleId, setModalCycleId] = useState("");
  const [modalProcessId, setModalProcessId] = useState("");

  const isContextualBreadcrumb =
    breadcrumbMode === "contextual" || breadcrumbMode === "cycle-only";
  const isSuperUser = useMemo(
    () => isSuperUserRole(userRoleNames),
    [userRoleNames],
  );

  useEffect(() => {
    const handleContextChanged = () => {
      setContextSnapshot(getOperationalContextSnapshot());
    };

    if (typeof window === "undefined") {
      return undefined;
    }

    window.addEventListener(
      GLOBAL_FILTER_CONTEXT_CHANGED_EVENT,
      handleContextChanged,
    );
    handleContextChanged();

    return () => {
      window.removeEventListener(
        GLOBAL_FILTER_CONTEXT_CHANGED_EVENT,
        handleContextChanged,
      );
    };
  }, []);

  const breadcrumbLabel = useMemo(() => {
    const cycleBreadcrumbLabel = contextSnapshot.cycleLabel;
    const processBreadcrumbLabel = contextSnapshot.processLabel;

    if (breadcrumbMode === "none") {
      return [] as BreadcrumbItem[];
    }

    if (breadcrumbMode === "simple") {
      return subtitle
        ? ([
            { label: subtitle },
            { label: title, current: true },
          ] as BreadcrumbItem[])
        : ([{ label: title, current: true }] as BreadcrumbItem[]);
    }

    if (breadcrumbMode === "cycle-only") {
      const items: BreadcrumbItem[] = [];

      if (cycleBreadcrumbLabel) {
        items.push({
          label: cycleBreadcrumbLabel,
          href: "/",
          tooltip: [contextSnapshot.careerLabel, contextSnapshot.campusLabel]
            .filter((part): part is string => Boolean(part))
            .join(" - "),
          onClick: async () => {
            globalFilterContextService.syncContextSnapshot({
              careerCampusId: contextSnapshot.careerCampusId,
              cycleId: contextSnapshot.cycleId,
              processId: null,
              careerLabel: contextSnapshot.careerLabel,
              campusLabel: contextSnapshot.campusLabel,
              cycleLabel: contextSnapshot.cycleLabel,
              processLabel: null,
            });
          },
        });

        items.push({ label: title, current: true });
      }

      return items;
    }

    const items: BreadcrumbItem[] = [
      ...(cycleBreadcrumbLabel
        ? [
            {
              label: cycleBreadcrumbLabel,
              href: "/",
              tooltip: [
                contextSnapshot.careerLabel,
                contextSnapshot.campusLabel,
              ]
                .filter((part): part is string => Boolean(part))
                .join(" - "),
              onClick: async () => {
                globalFilterContextService.syncContextSnapshot({
                  careerCampusId: contextSnapshot.careerCampusId,
                  cycleId: contextSnapshot.cycleId,
                  processId: null,
                  careerLabel: contextSnapshot.careerLabel,
                  campusLabel: contextSnapshot.campusLabel,
                  cycleLabel: contextSnapshot.cycleLabel,
                  processLabel: null,
                });
              },
            },
          ]
        : []),
      ...(processBreadcrumbLabel
        ? [
            {
              label: processBreadcrumbLabel,
              href: "/",
              tooltip: cycleBreadcrumbLabel || undefined,
            },
          ]
        : []),
      ...(subtitle ? [{ label: subtitle }] : []),
      { label: title, current: true },
    ];

    return items;
  }, [breadcrumbMode, contextSnapshot, subtitle, title]);

  const careerOptions = useMemo<SelectOption[]>(() => {
    if (!contextCatalog) {
      return [];
    }

    const deduplicatedCareers = Array.from(
      new Map(
        contextCatalog.careers.map((career) => [
          career.carrera_sede_id,
          career,
        ]),
      ).values(),
    );

    return deduplicatedCareers.map((career) => ({
      value: String(career.carrera_sede_id),
      label: `${career.carrera_nombre} - ${career.sede_nombre}`,
    }));
  }, [contextCatalog]);

  const availableCycles = useMemo(() => {
    if (!contextCatalog || !modalCareerId) {
      return [];
    }

    return contextCatalog.cycles.filter(
      (cycle) => cycle.carrera_sede_id === Number(modalCareerId),
    );
  }, [contextCatalog, modalCareerId]);

  const cycleOptions = useMemo<SelectOption[]>(() => {
    return availableCycles.map((cycle) => ({
      value: String(cycle.ciclo_acreditacion_id),
      label: cycle.nombre,
    }));
  }, [availableCycles]);

  const availableProcesses = useMemo(() => {
    if (!contextCatalog || !modalCycleId) {
      return [];
    }

    return contextCatalog.processes.filter(
      (process) => process.ciclo_acreditacion_id === Number(modalCycleId),
    );
  }, [contextCatalog, modalCycleId]);

  const processOptions = useMemo<SelectOption[]>(() => {
    return availableProcesses.map((process) => ({
      value: String(process.proceso_id),
      label: process.tipo_proceso,
    }));
  }, [availableProcesses]);

  useEffect(() => {
    if (!modalCycleId) {
      return;
    }

    const isSelectedCycleValid = availableCycles.some(
      (cycle) => String(cycle.ciclo_acreditacion_id) === modalCycleId,
    );

    if (!isSelectedCycleValid) {
      setModalCycleId("");
      setModalProcessId("");
    }
  }, [availableCycles, modalCycleId]);

  useEffect(() => {
    if (!modalProcessId) {
      return;
    }

    const isSelectedProcessValid = availableProcesses.some(
      (process) => String(process.proceso_id) === modalProcessId,
    );

    if (!isSelectedProcessValid) {
      setModalProcessId("");
    }
  }, [availableProcesses, modalProcessId]);

  const openContextModal = async () => {
    setIsContextModalOpen(true);
    setContextModalLoading(true);

    try {
      const catalog = await globalFilterContextService.getCatalog();
      setContextCatalog(catalog);

      const defaultCareerId =
        contextSnapshot.careerCampusId ??
        catalog.context.career_campus_id ??
        catalog.careers[0]?.carrera_sede_id ??
        null;

      const selectedCareerId = isSuperUser
        ? defaultCareerId
        : (contextSnapshot.careerCampusId ??
          catalog.context.career_campus_id ??
          defaultCareerId);

      const cyclesForCareer = catalog.cycles.filter(
        (cycle) => cycle.carrera_sede_id === selectedCareerId,
      );

      const selectedCycleId = cyclesForCareer.some(
        (cycle) => cycle.ciclo_acreditacion_id === contextSnapshot.cycleId,
      )
        ? contextSnapshot.cycleId
        : cyclesForCareer.some(
              (cycle) =>
                cycle.ciclo_acreditacion_id ===
                catalog.context.ciclo_acreditacion_id,
            )
          ? catalog.context.ciclo_acreditacion_id
          : null;

      const processesForCycle = catalog.processes.filter(
        (process) => process.ciclo_acreditacion_id === selectedCycleId,
      );

      const selectedProcessId = processesForCycle.some(
        (process) => process.proceso_id === contextSnapshot.processId,
      )
        ? contextSnapshot.processId
        : processesForCycle.some(
              (process) => process.proceso_id === catalog.context.proceso_id,
            )
          ? catalog.context.proceso_id
          : null;

      setModalCareerId(selectedCareerId ? String(selectedCareerId) : "");
      setModalCycleId(selectedCycleId ? String(selectedCycleId) : "");
      setModalProcessId(selectedProcessId ? String(selectedProcessId) : "");
    } catch {
      toast.error("No se pudo cargar el contexto de trabajo.");
      setIsContextModalOpen(false);
    } finally {
      setContextModalLoading(false);
    }
  };

  const applyContextFromModal = async () => {
    if (!contextCatalog) {
      return;
    }

    const selectedCareerId = isSuperUser
      ? modalCareerId
        ? Number(modalCareerId)
        : null
      : (contextSnapshot.careerCampusId ??
        contextCatalog.context.career_campus_id ??
        contextCatalog.careers[0]?.carrera_sede_id ??
        null);
    const selectedCycleId = modalCycleId ? Number(modalCycleId) : null;
    const selectedProcessId = modalProcessId ? Number(modalProcessId) : null;

    if (selectedCareerId === null) {
      toast.error("Debe seleccionar una carrera para continuar.");
      return;
    }

    const filteredCycles = contextCatalog.cycles.filter(
      (cycle) => cycle.carrera_sede_id === selectedCareerId,
    );

    if (filteredCycles.length > 0 && selectedCycleId === null) {
      toast.error("Debe seleccionar un ciclo para continuar.");
      return;
    }

    const filteredProcesses = selectedCycleId
      ? contextCatalog.processes.filter(
          (process) => process.ciclo_acreditacion_id === selectedCycleId,
        )
      : [];

    if (filteredProcesses.length > 0 && selectedProcessId === null) {
      toast.error("Debe seleccionar un proceso para continuar.");
      return;
    }

    setContextModalSaving(true);

    try {
      await globalFilterContextService.updateContext({
        career_campus_id: selectedCareerId,
        ciclo_acreditacion_id: selectedCycleId,
        proceso_id: selectedProcessId,
      });

      const selectedCareer = contextCatalog.careers.find(
        (career) => career.carrera_sede_id === selectedCareerId,
      );
      const selectedCycle = contextCatalog.cycles.find(
        (cycle) => cycle.ciclo_acreditacion_id === selectedCycleId,
      );
      const selectedProcess = contextCatalog.processes.find(
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

      setIsContextModalOpen(false);
      toast.success("Contexto de trabajo actualizado.");
    } catch {
      toast.error("No se pudo actualizar el contexto de trabajo.");
    } finally {
      setContextModalSaving(false);
    }
  };

  return (
    <div
      className={cn(
        "mb-8 w-full text-left transition-all duration-300",
        className,
      )}
    >
      {breadcrumbLabel.length > 0 && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <Breadcrumb items={breadcrumbLabel} className="mb-0 min-w-0 flex-1" />

          {isContextualBreadcrumb && (
            <button
              type="button"
              onClick={() => void openContextModal()}
              className="inline-flex items-center justify-center rounded-corner border border-azul-una/30 bg-azul-una/5 p-2 text-azul-una transition-colors hover:bg-azul-una/15"
              title="Cambiar contexto de trabajo"
              aria-label="Cambiar contexto de trabajo"
            >
              <SystemIcons.structure.hierarchy className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Contenedor flex para título y headerExtra */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Título principal */}
          <h1
            className={cn(
              "font-poppins font-bold text-negro-una mb-2",
              TYPOGRAPHY.pageTitle,
            )}
          >
            {title}
          </h1>

          {/* Subtítulo opcional */}
          {subtitle && (
            <h2
              className={cn(
                "font-poppins font-medium text-azul-una mb-2",
                TYPOGRAPHY.pageSubtitle,
              )}
            >
              {subtitle}
            </h2>
          )}

          {/* Descripción */}
          {description && (
            <p
              className={cn(
                "font-poppins text-gris-una",
                TYPOGRAPHY.pageSubtitle,
              )}
            >
              {description}
            </p>
          )}
        </div>

        {/* Contenido adicional del header (lado derecho) */}
        {headerExtra && <div className="ml-4 shrink-0">{headerExtra}</div>}
      </div>

      {/* Contenido adicional (botones, breadcrumbs, etc.) */}
      {children && (
        <div
          className={cn(
            "flex items-center gap-4",
            "justify-start",
            description ? "mt-4" : "",
            isMobile ? "flex-col" : "flex-row",
          )}
        >
          {children}
        </div>
      )}

      <Modal
        isOpen={isContextModalOpen}
        onClose={() => {
          if (!contextModalSaving) {
            setIsContextModalOpen(false);
          }
        }}
        title="Cambiar contexto de trabajo"
        subtitle="Aplicar sin salir de la pantalla"
        variant="info"
        size="md"
        showConfirm={false}
        showCancel={false}
        footerButtons={
          <div className="flex w-full justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsContextModalOpen(false)}
              disabled={contextModalSaving}
              className="w-auto! px-3"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              isLoading={contextModalSaving}
              onClick={() => void applyContextFromModal()}
              className="w-auto! px-3"
            >
              Continuar
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          {contextModalLoading ? (
            <p className="text-sm text-gris-una">
              Cargando opciones de contexto...
            </p>
          ) : (
            <>
              {isSuperUser && (
                <CustomSelect
                  label="Carrera"
                  placeholder="Seleccione una carrera"
                  options={careerOptions}
                  value={modalCareerId}
                  onChange={(value) => {
                    setModalCareerId(value);
                    setModalCycleId("");
                    setModalProcessId("");
                  }}
                  disabled={careerOptions.length === 0 || contextModalSaving}
                />
              )}

              <CustomSelect
                label="Ciclo"
                placeholder="Seleccione un ciclo"
                options={cycleOptions}
                value={modalCycleId}
                onChange={(value) => {
                  setModalCycleId(value);
                  setModalProcessId("");
                }}
                disabled={cycleOptions.length === 0 || contextModalSaving}
              />

              <CustomSelect
                label="Proceso"
                placeholder="Seleccione un proceso"
                options={processOptions}
                value={modalProcessId}
                onChange={setModalProcessId}
                disabled={
                  !modalCycleId ||
                  processOptions.length === 0 ||
                  contextModalSaving
                }
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
