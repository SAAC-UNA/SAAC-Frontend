import React from "react";
import { useNavigate } from "react-router-dom";
import { MODELO_TIPO_BADGE } from "@/Constants/StatusBadges";
import { TYPOGRAPHY } from "@/Constants/Typography";
import { ROUTES } from "@/Constants/ROUTES";
import type { StructureModel, TipoJerarquia } from "@/Types/StructureModelTypes";
import { cn } from "@/Utils/ClassNames";
import {
  ActionCard,
  type ActionCardAction,
  type ActionCardBadge,
} from "./ActionCard";

const TRADITIONAL_HIERARCHY = "Dimension > Componente > Criterio > Evidencia";

const FALLBACK_HIERARCHY = "Jerarquia sin definir";

const sortByIndex = (items: string[], indexes: Map<string, number>): string[] => {
  return [...items].sort(
    (a, b) =>
      (indexes.get(a) ?? Number.MAX_SAFE_INTEGER) -
      (indexes.get(b) ?? Number.MAX_SAFE_INTEGER),
  );
};

export const buildHierarchyPath = (
  tiposJerarquia: TipoJerarquia[] | null | undefined,
): string => {
  if (!tiposJerarquia || tiposJerarquia.length === 0) {
    return FALLBACK_HIERARCHY;
  }

  const cleaned = tiposJerarquia
    .map((entry) => ({
      tipo: entry.tipo.trim(),
      padre_tipo: entry.padre_tipo?.trim() || null,
    }))
    .filter((entry) => entry.tipo.length > 0);

  if (cleaned.length === 0) {
    return FALLBACK_HIERARCHY;
  }

  const order = cleaned.map((entry) => entry.tipo);
  const indexes = new Map(order.map((tipo, idx) => [tipo, idx]));
  const byTipo = new Map(cleaned.map((entry) => [entry.tipo, entry]));
  const childrenByParent = new Map<string, string[]>();

  cleaned.forEach((entry) => {
    if (!entry.padre_tipo || !byTipo.has(entry.padre_tipo)) return;
    const children = childrenByParent.get(entry.padre_tipo) ?? [];
    children.push(entry.tipo);
    childrenByParent.set(entry.padre_tipo, children);
  });

  const roots = sortByIndex(
    cleaned
      .filter((entry) => !entry.padre_tipo || !byTipo.has(entry.padre_tipo))
      .map((entry) => entry.tipo),
    indexes,
  );

  const path: string[] = [];
  const visited = new Set<string>();

  const walk = (tipo: string) => {
    if (visited.has(tipo)) return;
    visited.add(tipo);
    path.push(tipo);

    const children = sortByIndex(childrenByParent.get(tipo) ?? [], indexes);
    children.forEach(walk);
  };

  roots.forEach(walk);
  sortByIndex(cleaned.map((entry) => entry.tipo), indexes).forEach(walk);

  return path.length > 0 ? path.join(" > ") : FALLBACK_HIERARCHY;
};

export const buildModelHierarchyLabel = (model: StructureModel): string => {
  if (model.tipo === "tradicional") {
    return TRADITIONAL_HIERARCHY;
  }

  return buildHierarchyPath(model.tipos_jerarquia);
};

interface StructureModelCardProps {
  model: StructureModel;
  hasCiclos?: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  editTooltip?: string;
  toggleTooltip?: string;
  deleteTooltip?: string;
}

export const StructureModelCard: React.FC<StructureModelCardProps> = ({
  model,
  hasCiclos = false,
  onEdit,
  onToggleActive,
  onDelete,
  editTooltip,
  toggleTooltip,
  deleteTooltip,
}) => {
  const navigate = useNavigate();
  const isTradicional = model.tipo === "tradicional";
  const hierarchyLabel = buildModelHierarchyLabel(model);

  const resolvedEditTooltip =
    editTooltip ??
    (isTradicional
      ? "No se puede editar el modelo tradicional"
      : "Editar modelo");

  const resolvedToggleTooltip =
    toggleTooltip ??
    (isTradicional
      ? "No se puede desactivar el modelo tradicional"
      : model.activo
        ? "Desactivar modelo"
        : "Activar modelo");

  const resolvedDeleteTooltip =
    deleteTooltip ??
    (isTradicional
      ? "No se puede eliminar el modelo tradicional"
      : hasCiclos
        ? "Eliminar bloqueado, tiene ciclos asociados"
        : "Eliminar modelo");

  const badges: ActionCardBadge[] = [
    {
      label: MODELO_TIPO_BADGE[model.tipo]?.label ?? model.tipo,
      colorClasses:
        MODELO_TIPO_BADGE[model.tipo]?.colorClasses ??
        "bg-gris-light text-gris-una",
    },
    {
      label: model.activo ? "Activo" : "Inactivo",
      colorClasses: model.activo
        ? "text-verde-dark bg-verde-ring"
        : "text-error-dark bg-error-ring",
    },
  ];

  const actions: ActionCardAction[] = [
    {
      id: "view",
      action: "view",
      tooltip: "Ver estructura",
      onClick: () =>
        navigate(
          `${ROUTES.STRUCTURE_MODELS}?modelo=${
            isTradicional ? 0 : model.modelo_estructura_id
          }`,
        ),
    },
    {
      id: "edit",
      action: "edit",
      tooltip: resolvedEditTooltip,
      onClick: onEdit,
      disabled: isTradicional,
    },
    {
      id: "toggle",
      action: "power",
      tooltip: resolvedToggleTooltip,
      onClick: onToggleActive,
      disabled: isTradicional,
      isActive: model.activo,
    },
    {
      id: "delete",
      action: "delete",
      tooltip: resolvedDeleteTooltip,
      onClick: onDelete,
      disabled: isTradicional || hasCiclos,
    },
  ];

  return (
    <ActionCard
      title={model.nombre}
      titleTooltip={model.nombre}
      subtitle={model.version ? `v${model.version}` : null}
      badges={badges}
      details={
        <p
          className={cn(
            TYPOGRAPHY.form.helper,
            "text-gris-una wrap-anywhere",
          )}
          title={hierarchyLabel}
        >
          Jerarquia: {hierarchyLabel}
        </p>
      }
      actions={actions}
      muted={!model.activo}
    />
  );
};
