import React, { useState, useEffect, useMemo } from "react";
import { DataTable, ExpandableChildRow } from "@/Components/Ui/Table/DataTable";
import type { DataTableColumn } from "@/Components/Ui/Table/DataTable";
import { ButtonWithTooltip } from "@/Components/Ui/Buttons/ButtonWithTooltip";
import { StatusBadge } from "@/Components/Ui/Feedback/StatusBadge";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";
import { EvidenceFilesModal } from "./EvidenceFilesModal";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { TABLE_ACTION_BUTTON } from "@/Constants/Components";

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

// ---------- EvidenceExpansionRow ----------

interface EvidenceExpansionProps {
  criterio: Criterio;
  evidences: Evidencia[];
  loadingFiles: Set<number>;
  onLoadFile: (id: number) => void;
  onOpenLink: (evidencia: Evidencia) => void;
}

const EvidenceExpansionRow: React.FC<EvidenceExpansionProps> = ({
  criterio,
  evidences,
  loadingFiles,
  onLoadFile,
  onOpenLink,
}) => {
  const criterionEvidences = evidences.filter(
    (e) => e.criterio_id === criterio.id,
  );
  const [noFilesModal, setNoFilesModal] = useState<{
    open: boolean;
    evidencia: Evidencia | null;
  }>({
    open: false,
    evidencia: null,
  });

  useEffect(() => {
    criterionEvidences.forEach((ev) => {
      if (!ev.archivos) onLoadFile(ev.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criterio.id]);

  if (criterionEvidences.length === 0) {
    return (
      <p className={`px-4 py-3 ${TYPOGRAPHY.table.helper} text-gris-una`}>
        Sin evidencias
      </p>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {criterionEvidences.map((evidencia) => {
          const tieneArchivos = (evidencia.archivos?.length ?? 0) > 0;
          const tieneEnlace = (evidencia.archivos ?? []).some(
            (a) =>
              a.is_publico &&
              (Boolean(a.token_publico) ||
                Boolean(a.url_publica) ||
                Boolean(a.url_publica_carpeta)),
          );
          const isLoadingFile = loadingFiles.has(evidencia.id);

          const action = isLoadingFile ? (
            <span className={`${TYPOGRAPHY.table.helper} text-gris-una px-2`}>
              Cargando...
            </span>
          ) : tieneEnlace ? (
            <div className="flex items-center gap-1.5">
              <StatusBadge
                label="Enlace listo"
                colorClasses="text-verde-dark bg-verde-ring"
              />
              <ButtonWithTooltip
                variant="tableView"
                size="sm"
                tooltip="Abrir enlace público"
                tooltipPosition="left"
                onClick={() => onOpenLink(evidencia)}
                className={TABLE_ACTION_BUTTON.button}
              >
                <SystemIcons.actions.linkIcon
                  className={TABLE_ACTION_BUTTON.icon}
                />
              </ButtonWithTooltip>
            </div>
          ) : tieneArchivos ? (
            <div className="flex items-center gap-1.5">
              <StatusBadge
                label="Sin enlace"
                colorClasses="text-warning-dark bg-warning-ring"
              />
              <ButtonWithTooltip
                variant="tableView"
                size="sm"
                tooltip="Abrir enlace público"
                tooltipPosition="left"
                onClick={() => onOpenLink(evidencia)}
                className={TABLE_ACTION_BUTTON.button}
              >
                <SystemIcons.actions.linkIcon
                  className={TABLE_ACTION_BUTTON.icon}
                />
              </ButtonWithTooltip>
            </div>
          ) : (
            <ButtonWithTooltip
              variant="tableView"
              size="sm"
              tooltip="Ver archivos asociados"
              tooltipPosition="left"
              onClick={() => setNoFilesModal({ open: true, evidencia })}
              className={TABLE_ACTION_BUTTON.button}
            >
              <SystemIcons.actions.view className={TABLE_ACTION_BUTTON.icon} />
            </ButtonWithTooltip>
          );

          return (
            <ExpandableChildRow
              key={evidencia.id}
              item={{
                key: String(evidencia.id),
                content: (
                  <p
                    className={`truncate flex-1 min-w-0 ${TYPOGRAPHY.table.helper}`}
                    title={`${evidencia.nomenclatura} — ${evidencia.descripcion}`}
                  >
                    <span className="font-medium text-negro-una">
                      {evidencia.nomenclatura}
                    </span>
                    <span className="text-gris-una">
                      {" "}
                      — {evidencia.descripcion}
                    </span>
                  </p>
                ),
                action,
              }}
            />
          );
        })}
      </div>

      <EvidenceFilesModal
        isOpen={noFilesModal.open}
        onClose={() => setNoFilesModal({ open: false, evidencia: null })}
        evidencia={noFilesModal.evidencia}
      />
    </>
  );
};

// ---------- FlexiblePautaExpansionRow (modelo flexible) ----------

const normalizeElementType = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
};

const hasPublicLink = (archivos: Archivo[] = []) =>
  archivos.some(
    (a) =>
      a.is_publico &&
      (Boolean(a.token_publico) ||
        Boolean(a.url_publica) ||
        Boolean(a.url_publica_carpeta)),
  );

const buildSourceAsEvidence = (source: Criterio): Evidencia => ({
  id: source.id,
  nomenclatura: source.nomenclatura,
  descripcion: source.descripcion,
  criterio_id: 0,
  archivos: source.archivos ?? [],
});

interface FlexiblePautaExpansionProps {
  pauta: Criterio;
  sources: Criterio[];
  loadingFiles: Set<number>;
  onLoadFile: (id: number) => void;
  onOpenLink: (evidencia: Evidencia) => void;
}

const FlexiblePautaExpansionRow: React.FC<FlexiblePautaExpansionProps> = ({
  pauta,
  sources,
  loadingFiles,
  onLoadFile,
  onOpenLink,
}) => {
  useEffect(() => {
    sources.forEach((source) => {
      if (!source.archivos) onLoadFile(source.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pauta.id, sources.map((source) => source.id).join(",")]);

  const visibleSources = sources.filter((source) => {
    if (source.estado_aprobacion && source.estado_aprobacion !== "aprobado") {
      return false;
    }

    // Mantener visible mientras se cargan archivos; ocultar cuando ya cargó y no tiene archivos.
    return source.archivos === undefined || (source.archivos?.length ?? 0) > 0;
  });

  if (visibleSources.length === 0) {
    return (
      <p className={`px-4 py-3 ${TYPOGRAPHY.table.helper} text-gris-una`}>
        No hay fuentes aprobadas con archivos
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {visibleSources.map((source) => {
        const isLoadingFile = loadingFiles.has(source.id);
        const archivos = source.archivos ?? [];
        const tieneArchivos = archivos.length > 0;
        const tieneEnlace = hasPublicLink(archivos);

        let action: React.ReactNode;
        if (isLoadingFile) {
          action = (
            <span className={`${TYPOGRAPHY.table.helper} text-gris-una px-2`}>
              Cargando...
            </span>
          );
        } else {
          action = (
            <div className="flex items-center gap-1.5">
              <StatusBadge
                label={
                  tieneEnlace
                    ? "Enlace listo"
                    : tieneArchivos
                      ? "Sin enlace"
                      : "Sin archivos"
                }
                colorClasses={
                  tieneEnlace
                    ? "text-verde-dark bg-verde-ring"
                    : tieneArchivos
                      ? "text-warning-dark bg-warning-ring"
                      : "text-gris-una bg-gris-light"
                }
              />
              <ButtonWithTooltip
                variant="tableView"
                size="sm"
                tooltip="Gestionar enlace público"
                tooltipPosition="left"
                onClick={() => onOpenLink(buildSourceAsEvidence(source))}
                className={TABLE_ACTION_BUTTON.button}
              >
                <SystemIcons.actions.view
                  className={TABLE_ACTION_BUTTON.icon}
                />
              </ButtonWithTooltip>
            </div>
          );
        }

        return (
          <ExpandableChildRow
            key={source.id}
            item={{
              key: String(source.id),
              content: (
                <p
                  className={`truncate flex-1 min-w-0 ${TYPOGRAPHY.table.helper}`}
                  title={`${source.nomenclatura} — ${source.descripcion}`}
                >
                  <span className="font-medium text-negro-una">
                    {source.nomenclatura}
                  </span>
                  <span className="text-gris-una"> — {source.descripcion}</span>
                </p>
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
  onViewDetail: (criterio: Criterio) => void;
}

export const FinalReportsTable: React.FC<FinalReportsTableProps> = ({
  criteria,
  evidences,
  isFlexible = false,
  loadingFiles,
  onLoadFile,
  onOpenLink,
  onViewDetail,
}) => {
  const { pautaRows, sourcesByPauta } = useMemo(() => {
    if (!isFlexible) {
      return {
        pautaRows: criteria,
        sourcesByPauta: new Map<number, Criterio[]>(),
      };
    }

    const criteriaById = new Map<number, Criterio>(
      criteria.map((item) => [item.id, item]),
    );
    const childrenByParent = new Map<number, Criterio[]>();

    criteria.forEach((item) => {
      if (typeof item.padre_id !== "number") return;
      if (!criteriaById.has(item.padre_id)) return;

      const currentChildren = childrenByParent.get(item.padre_id) ?? [];
      currentChildren.push(item);
      childrenByParent.set(item.padre_id, currentChildren);
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
      const fallback = new Map<number, Criterio[]>();
      criteria.forEach((item) => fallback.set(item.id, [item]));

      return {
        pautaRows: criteria,
        sourcesByPauta: fallback,
      };
    }

    const groupedSources = new Map<number, Criterio[]>();
    pautas.forEach((pauta) => {
      const sources = collectLeafSources(pauta).filter(
        (source) => source.estado_aprobacion === "aprobado",
      );

      if (sources.length > 0) {
        groupedSources.set(pauta.id, sources);
      }
    });

    const visiblePautas = pautas.filter(
      (pauta) => (groupedSources.get(pauta.id)?.length ?? 0) > 0,
    );

    return {
      pautaRows: visiblePautas,
      sourcesByPauta: groupedSources,
    };
  }, [criteria, isFlexible]);

  const columns: DataTableColumn<Criterio>[] = [
    {
      key: "nomenclatura",
      header: isFlexible ? "Pauta" : "Criterio",
      render: (_, item) => (
        <p
          className={`truncate ${TYPOGRAPHY.table.cell}`}
          title={`${item.nomenclatura} — ${item.descripcion}`}
        >
          <span className="font-bold text-negro-una-2">
            {item.nomenclatura}
          </span>
          <span className="text-gris-una"> — {item.descripcion}</span>
        </p>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      align: "center",
      width: "90px",
      render: (_, item) => (
        <div className="flex items-center justify-center gap-2">
          <ButtonWithTooltip
            variant="tableView"
            size="sm"
            tooltip={isFlexible ? "Ver detalle de pauta" : "Ver detalles"}
            onClick={(event) => {
              event.stopPropagation();
              onViewDetail(item);
            }}
            className={TABLE_ACTION_BUTTON.button}
          >
            <SystemIcons.actions.view className={TABLE_ACTION_BUTTON.icon} />
          </ButtonWithTooltip>
        </div>
      ),
    },
  ];

  const tableData = isFlexible ? pautaRows : criteria;

  return (
    <DataTable<Criterio>
      data={tableData}
      columns={columns}
      getRowKey={(item) => String(item.id)}
      searchable={false}
      expandableRow={(item) => [
        {
          key: String(item.id),
          noBorder: true,
          content: isFlexible ? (
            <FlexiblePautaExpansionRow
              pauta={item}
              sources={sourcesByPauta.get(item.id) ?? []}
              loadingFiles={loadingFiles}
              onLoadFile={onLoadFile}
              onOpenLink={onOpenLink}
            />
          ) : (
            <EvidenceExpansionRow
              criterio={item}
              evidences={evidences}
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
