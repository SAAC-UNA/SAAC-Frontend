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
  titleClassName?: string;
  className?: string;
  children?: React.ReactNode; // Para botones de acción, breadcrumbs, etc.
  headerExtra?: React.ReactNode; // Para contenido adicional al lado del título
  breadcrumbMode?: "none" | "simple" | "cycle-only" | "contextual";
  breadcrumbParent?: BreadcrumbItem;
  /** Items de breadcrumb personalizados; si se proveen, reemplazan los generados por breadcrumbMode. */
  breadcrumbItems?: BreadcrumbItem[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  titleClassName,
  className,
  children,
  headerExtra,
  breadcrumbMode = "none",
  breadcrumbParent,
  breadcrumbItems,
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
    const cycleBreadcrumbLabel = contextSnapshot.cycleLabel;
    const processBreadcrumbLabel = contextSnapshot.processLabel;

    if (breadcrumbMode === "none") {
      return [] as BreadcrumbItem[];
    }

    if (breadcrumbMode === "simple") {
      return subtitle
        ? ([
            ...(breadcrumbParent ? [breadcrumbParent] : []),
            { label: subtitle },
            { label: title, current: true },
          ] as BreadcrumbItem[])
        : ([
            ...(breadcrumbParent ? [breadcrumbParent] : []),
            { label: title, current: true },
          ] as BreadcrumbItem[]);
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
              cycleModelType: contextSnapshot.cycleModelType,
            });
          },
        });

        if (breadcrumbParent) {
          items.push(breadcrumbParent);
        }

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
                  cycleModelType: contextSnapshot.cycleModelType,
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
  }, [breadcrumbMode, breadcrumbParent, contextSnapshot, subtitle, title]);

  return (
    <div
      className={cn(
        "mb-8 w-full text-left transition-all duration-300",
        className,
      )}
    >
      {(breadcrumbItems ?? breadcrumbLabel).length > 0 && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <Breadcrumb items={breadcrumbItems ?? breadcrumbLabel} className="mb-0 min-w-0 flex-1" />
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
              titleClassName,
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

      {/* Modal de contexto eliminado — usar /selector-procesos */}
    </div>
  );
};
