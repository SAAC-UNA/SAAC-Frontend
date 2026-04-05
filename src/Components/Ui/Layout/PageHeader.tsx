import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/Utils/ClassNames";
import { useBreakpoint } from "@/hooks/UseBreakpoint";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { GLOBAL_FILTER_CONTEXT_CHANGED_EVENT } from "@/Services/GlobalFilterContextService";
import { globalFilterContextService } from "@/Services/GlobalFilterContextService";
import {
  Breadcrumb,
  type BreadcrumbItem,
} from "@/Components/Ui/Feedback/Breadcrumb";
import {
  getOperationalContextSnapshot,
  type OperationalContextSnapshot,
} from "@/Services/OperationalContextStore";

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
  const [contextSnapshot, setContextSnapshot] =
    useState<OperationalContextSnapshot>(() => getOperationalContextSnapshot());

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

      if (contextSnapshot.cycleLabel) {
        items.push({
          label: contextSnapshot.cycleLabel,
          href: "/",
          tooltip: [contextSnapshot.careerLabel, contextSnapshot.campusLabel]
            .filter((part): part is string => Boolean(part))
            .join(" - "),
          onClick: async () => {
            await globalFilterContextService.updateContext({
              career_campus_id: contextSnapshot.careerCampusId,
              ciclo_acreditacion_id: contextSnapshot.cycleId,
              proceso_id: null,
            });
          },
        });

        items.push({ label: title, current: true });
      }

      return items;
    }

    const items: BreadcrumbItem[] = [
      ...(contextSnapshot.cycleLabel
        ? [
            {
              label: contextSnapshot.cycleLabel,
              href: "/",
              tooltip: [
                contextSnapshot.careerLabel,
                contextSnapshot.campusLabel,
              ]
                .filter((part): part is string => Boolean(part))
                .join(" - "),
              onClick: async () => {
                await globalFilterContextService.updateContext({
                  career_campus_id: contextSnapshot.careerCampusId,
                  ciclo_acreditacion_id: contextSnapshot.cycleId,
                  proceso_id: null,
                });
              },
            },
          ]
        : []),
      ...(contextSnapshot.processLabel
        ? [
            {
              label: contextSnapshot.processLabel,
              href: "/",
              tooltip: contextSnapshot.cycleLabel || undefined,
            },
          ]
        : []),
      ...(subtitle ? [{ label: subtitle }] : []),
      { label: title, current: true },
    ];

    return items;
  }, [breadcrumbMode, contextSnapshot, subtitle, title]);

  return (
    <div
      className={cn(
        "mb-8 w-full text-left transition-all duration-300",
        className,
      )}
    >
      {breadcrumbLabel.length > 0 && (
        <Breadcrumb items={breadcrumbLabel} className="mb-3" />
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
    </div>
  );
};
