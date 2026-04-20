import React, { useEffect, useMemo, useState } from "react";
import { DataTable, ExpandableChildRow } from "@/Components/Ui/Table/DataTable";
import type { DataTableColumn } from "@/Components/Ui/Table/DataTable";
import { ButtonWithTooltip } from "@/Components/Ui/Buttons/ButtonWithTooltip";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { Breadcrumb } from "@/Components/Ui/Feedback/Breadcrumb";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { LINK_STATUS_BADGE, BADGE_COLORS } from "@/Constants/StatusBadges";
import type { LinkStatus } from "@/Constants/StatusBadges";
import { TABLE_ACTION_BUTTON, TABLE_COLUMN_WIDTHS } from "@/Constants/Components";
import { TABLE_TRUNCATE } from "@/Constants/TableTruncate";
import { truncateText } from "@/Utils";
import { useFirstColumnConfig } from "@/Hooks/UseFirstColumnConfig";

export interface Archivo {
  archivo_id: number;
  nombre_original: string;
  ruta_archivo: string;
  token_publico?: string;
  url_publica?: string;
  url_publica_carpeta?: string;
  is_publico: boolean;
  link_expira_en?: string;
}

export interface Evidencia {
  id: number;
  nomenclatura: string;
  descripcion: string;
  criterio_id: number;
  archivos?: Archivo[];
}

export interface Criterio extends Record<string, unknown> {
  id: number;
  nomenclatura: string;
  descripcion: string;
  padre_id?: number | null;
  tipo?: string | null;
  estado_aprobacion?: "pendiente" | "aprobado" | "rechazado";
  archivos?: Archivo[];
}

// ---------- Tipo unificado para filas expandidas ----------

interface ExpansionItem {
  id: number;
  nomenclatura: string;
  descripcion: string;
  archivos?: Archivo[];
  criterio_id?: number;
}

// ---------- Helpers ----------

const hasPublicLink = (archivos: Archivo[] = []) =>
  archivos.some(
    (a) =>
      a.is_publico &&
      (Boolean(a.token_publico) ||
        Boolean(a.url_publica) ||
        Boolean(a.url_publica_carpeta)),
  );

const normalizeElementType = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
};

// ---------- ExpansionRow (unificado para ambos modelos) ----------

interface ExpansionRowProps {
  items: ExpansionItem[];
  loadingFiles: Set<number>;
  onLoadFile: (id: number) => void;
  onOpenLink: (evidencia: Evidencia) => void;
}

const ExpansionRow: React.FC<ExpansionRowProps> = ({
  items,
  loadingFiles,
  onLoadFile,
  onOpenLink,
}) => {
  useEffect(() => {
    items.forEach((item) => {
      if (!item.archivos) onLoadFile(item.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((i) => i.id).join(",")]);

  if (items.length === 0) {
    return (
      <p className={`px-4 py-3 ${TYPOGRAPHY.table.helper} text-gris-una`}>
        Sin evidencias disponibles
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const tieneArchivos = (item.archivos?.length ?? 0) > 0;
        const tieneEnlace = hasPublicLink(item.archivos ?? []);
        const isLoadingFile = loadingFiles.has(item.id);

        const asEvidencia: Evidencia = {
          id: item.id,
          nomenclatura: item.nomenclatura,
          descripcion: item.descripcion,
          criterio_id: item.criterio_id ?? 0,
          archivos: item.archivos ?? [],
        };

        let action: React.ReactNode;
        if (isLoadingFile) {
          action = (
            <span className={`${TYPOGRAPHY.table.helper} text-gris-una px-2`}>
              Cargando...
            </span>
          );
        } else if (tieneEnlace) {
          action = (
            <div className="flex items-center gap-1.5">
              <StatusBadge
                label="Enlace listo"
                colorClasses={BADGE_COLORS.verde.colorClasses}
              />
              <ButtonWithTooltip
                variant="tableView"
                size="sm"
                tooltip="Abrir enlace público"
                tooltipPosition="left"
                onClick={() => onOpenLink(asEvidencia)}
                className={TABLE_ACTION_BUTTON.button}
              >
                <SystemIcons.actions.linkIcon
                  className={TABLE_ACTION_BUTTON.icon}
                />
              </ButtonWithTooltip>
            </div>
          );
        } else if (tieneArchivos) {
          action = (
            <div className="flex items-center gap-1.5">
              <StatusBadge
                label="Sin enlace"
                colorClasses={BADGE_COLORS.warning.colorClasses}
              />
              <ButtonWithTooltip
                variant="tableView"
                size="sm"
                tooltip="Gestionar enlace público"
                tooltipPosition="left"
                onClick={() => onOpenLink(asEvidencia)}
                className={TABLE_ACTION_BUTTON.button}
              >
                <SystemIcons.actions.linkIcon
                  className={TABLE_ACTION_BUTTON.icon}
                />
              </ButtonWithTooltip>
            </div>
          );
        } else {
          action = (
            <StatusBadge
              label="Sin archivos"
              colorClasses={BADGE_COLORS.gris.colorClasses}
            />
          );
        }
        {/** Tabla hija */}
        return (
          <ExpandableChildRow
            key={item.id}
            item={{
              key: String(item.id),
              content: (
                <Breadcrumb
                  variant="child"
                  items={[
                    {
                      label: truncateText(
                        item.nomenclatura,
                        TABLE_TRUNCATE.name * 2,
                      ),
                    },
                    {
                      label: truncateText(
                        item.descripcion,
                        TABLE_TRUNCATE.text * 2,
                      ),
                      current: true,
                    },
                  ]}
                  className="min-w-0 flex-1"
                />
              ),
              action,
            }}
          />
        );
      })}
    </div>
  );
};

// ---------- FinalReportsTable ----------

interface FinalReportsTableProps {
  criteria: Criterio[];
  evidences: Evidencia[];
  isFlexible?: boolean;
  loadingFiles: Set<number>;
  onLoadFile: (id: number) => void;
  onOpenLink: (evidencia: Evidencia) => void;
}

export const FinalReportsTable: React.FC<FinalReportsTableProps> = ({
  criteria,
  evidences,
  isFlexible = false,
  loadingFiles,
  onLoadFile,
  onOpenLink,
}) => {
  const firstColumn = useFirstColumnConfig();
  const PAGE_SIZE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  const { displayRows, expansionItemsMap } = useMemo(() => {
    if (!isFlexible) {
      return {
        displayRows: criteria,
        expansionItemsMap: new Map<number, ExpansionItem[]>(),
      };
    }

    const criteriaById = new Map<number, Criterio>(
      criteria.map((item) => [item.id, item]),
    );
    const childrenByParent = new Map<number, Criterio[]>();

    criteria.forEach((item) => {
      if (typeof item.padre_id !== "number") return;
      if (!criteriaById.has(item.padre_id)) return;
      const existing = childrenByParent.get(item.padre_id) ?? [];
      existing.push(item);
      childrenByParent.set(item.padre_id, existing);
    });

    const collectLeafSources = (root: Criterio): Criterio[] => {
      const leaves: Criterio[] = [];
      const stack: Criterio[] = [root];
      const visited = new Set<number>();
      while (stack.length > 0) {
        const current = stack.pop()!;
        if (visited.has(current.id)) continue;
        visited.add(current.id);
        const children = childrenByParent.get(current.id) ?? [];
        if (children.length === 0 && current.id !== root.id) {
          leaves.push(current);
          continue;
        }
        children.forEach((child) => stack.push(child));
      }
      return leaves;
    };

    let pautas = criteria.filter(
      (item) => normalizeElementType(item.tipo) === "pauta",
    );
    if (pautas.length === 0) {
      pautas = criteria.filter(
        (item) => (childrenByParent.get(item.id)?.length ?? 0) > 0,
      );
    }
    if (pautas.length === 0) {
      const fallback = new Map<number, ExpansionItem[]>();
      criteria.forEach((item) => fallback.set(item.id, [item]));
      return { displayRows: criteria, expansionItemsMap: fallback };
    }

    const groupedSources = new Map<number, ExpansionItem[]>();
    pautas.forEach((pauta) => {
      const sources = collectLeafSources(pauta).filter(
        (s) => s.estado_aprobacion === "aprobado",
      );
      if (sources.length > 0) groupedSources.set(pauta.id, sources);
    });

    const visiblePautas = pautas.filter(
      (p) => (groupedSources.get(p.id)?.length ?? 0) > 0,
    );
    return { displayRows: visiblePautas, expansionItemsMap: groupedSources };
  }, [criteria, isFlexible]);

  const totalPages = Math.ceil(displayRows.length / PAGE_SIZE);
  const paginatedRows = displayRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const getExpansionItems = (criterio: Criterio): ExpansionItem[] => {
    if (isFlexible) {
      return expansionItemsMap.get(criterio.id) ?? [];
    }
    return evidences.filter(
      (ev) => ev.criterio_id === criterio.id,
    ) as ExpansionItem[];
  };

  const getEvidenceStats = (
    criterio: Criterio,
  ): { total: number; loaded: number; withLink: number } => {
    const items = getExpansionItems(criterio);
    const loaded = items.filter((i) => i.archivos !== undefined);
    const withLink = loaded.filter((i) => hasPublicLink(i.archivos ?? []));
    return {
      total: items.length,
      loaded: loaded.length,
      withLink: withLink.length,
    };
  };

  const getLinkStatus = (stats: {
    total: number;
    loaded: number;
    withLink: number;
  }): LinkStatus => {
    const { total, loaded, withLink } = stats;
    if (total === 0) return "sin_evidencias";
    if (loaded === 0) return "pendiente";
    if (withLink === total) return "completo";
    if (withLink > 0) return "parcial";
    return "sin_enlaces";
  };

  const columns: DataTableColumn<Criterio>[] = [
    {
      key: "nomenclatura",
      header: "Entregable",
      align: "left",
      render: (_, item) => (
        <Breadcrumb
          variant="table"
          items={[
            {
              label: truncateText(item.nomenclatura, firstColumn.maxLength),
            },
            {
              label: truncateText(item.descripcion, firstColumn.maxLength),
              current: true,
            },
          ]}
        />
      ),
    },
    {
      key: "evidencias_count",
      header: "Archivos",
      align: "left",
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, item) => {
        const { total } = getEvidenceStats(item);
        const label =
          total === 0
            ? "Sin recursos"
            : total === 1
              ? "1 recurso"
              : `${total} recursos`;
        const colorClasses =
          total === 0
            ? BADGE_COLORS.gris.colorClasses
            : BADGE_COLORS.info.colorClasses;
        return (
          <div className="flex items-start">
            <StatusBadge label={label} colorClasses={colorClasses} />
          </div>
        );
      },
    },
    {
      key: "con_enlace",
      header: "Con enlace",
      align: "left",
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, item) => {
        const { total, loaded, withLink } = getEvidenceStats(item);
        if (total === 0) return null;
        if (loaded === 0) {
          return (
            <div className="flex items-start">
              <StatusBadge label="N/A" colorClasses={BADGE_COLORS.gris.colorClasses} />
            </div>
          );
        }
        const label = `${withLink} / ${total}`;
        const colorClasses =
          withLink === total
            ? BADGE_COLORS.warning.colorClasses
            : withLink > 0
              ? BADGE_COLORS.warning.colorClasses
              : BADGE_COLORS.error.colorClasses;
        return (
          <div className="flex items-start">
            <StatusBadge label={label} colorClasses={colorClasses} />
          </div>
        );
      },
    },
    {
      key: "estado_enlace",
      header: "Estado",
      align: "left",
      width: TABLE_COLUMN_WIDTHS.status,
      render: (_, item) => {
        const stats = getEvidenceStats(item);
        const status = getLinkStatus(stats);
        const badge = LINK_STATUS_BADGE[status];
        return (
          <div className="flex justify-start">
            <StatusBadge
              label={badge.label}
              colorClasses={badge.colorClasses}
            />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable<Criterio>
      data={paginatedRows}
      columns={columns}
      getRowKey={(item) => String(item.id)}
      searchable={false}
      pagination={
        totalPages > 1
          ? { currentPage, totalPages, onPageChange: setCurrentPage }
          : undefined
      }
      expandableRow={(item) => [
        {
          key: String(item.id),
          noBorder: true,
          content: (
            <ExpansionRow
              items={getExpansionItems(item)}
              loadingFiles={loadingFiles}
              onLoadFile={onLoadFile}
              onOpenLink={onOpenLink}
            />
          ),
        },
      ]}
    />
  );
};

