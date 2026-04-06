/**
 * EvidenceSearchFiltersPanel — Panel de filtros jerárquicos para búsqueda de evidencias
 *
 * Modo tradicional: Dimensión → Componente → Criterio
 * Modo flexible:    Pauta (elemento hoja del modelo)
 *
 * El modo se determina por `isFlexible`, derivado del proceso global activo.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { CustomSelect, type SelectOption } from "@/Components/Ui/Index";
import { Card } from "@/Components/Ui/Layout/Card";
import { TreeSelect } from "@/Components/Ui/Forms/TreeSelect";
import { evidenceSearchFiltersService } from "@/Services/EvidenceSearchService";
import type { EvidenceSearchFilters } from "@/Types/EvidenceSearchTypes";
import type { FlexibleElement } from "@/Types/StructureModelTypes";

interface ComponenteOption extends SelectOption {
  dimension_id: number;
}

interface EvidenceSearchFiltersPanelProps {
  onFiltersChange: (filters: EvidenceSearchFilters) => void;
  isFlexible: boolean;
  flexElements: FlexibleElement[];
}

export const EvidenceSearchFiltersPanel: React.FC<
  EvidenceSearchFiltersPanelProps
> = ({ onFiltersChange, isFlexible, flexElements }) => {
  const dedupeOptions = useCallback((options: SelectOption[]) => {
    const seen = new Set<string>();
    return options.filter((option) => {
      const key = option.label.trim().toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, []);

  // ── Estado modo tradicional ──────────────────────────────────────────────
  const [dimensiones, setDimensiones] = useState<SelectOption[]>([]);
  const [todosComponentes, setTodosComponentes] = useState<ComponenteOption[]>(
    [],
  );
  const [todosCriterios, setTodosCriterios] = useState<SelectOption[]>([]);
  const [dimensionId, setDimensionId] = useState<string>("");
  const [componenteId, setComponenteId] = useState<string>("");
  const [criterioId, setCriterioId] = useState<string>("");

  // ── Estado modo flexible ─────────────────────────────────────────────────
  const [pautaId, setPautaId] = useState<string>("");

  // Cargar datos del modo tradicional al montar
  useEffect(() => {
    if (!isFlexible) {
      evidenceSearchFiltersService
        .getDimensiones()
        .then((items) => setDimensiones(dedupeOptions(items)));
      evidenceSearchFiltersService
        .getComponentes()
        .then((items) =>
          setTodosComponentes(dedupeOptions(items) as ComponenteOption[]),
        );
      evidenceSearchFiltersService
        .getCriterios()
        .then((items) => setTodosCriterios(dedupeOptions(items)));
    }
  }, [isFlexible, dedupeOptions]);

  // Resetear filtros internos al cambiar de modo
  useEffect(() => {
    setDimensionId("");
    setComponenteId("");
    setCriterioId("");
    setPautaId("");
  }, [isFlexible]);

  // ── Derivados modo tradicional ───────────────────────────────────────────
  const componentesFiltrados = useMemo<SelectOption[]>(() => {
    const filtered = !dimensionId
      ? todosComponentes
      : todosComponentes.filter(
          (c) => c.dimension_id === parseInt(dimensionId),
        );

    return dedupeOptions(filtered);
  }, [dimensionId, todosComponentes, dedupeOptions]);

  const criteriosFiltrados = useMemo<SelectOption[]>(() => {
    if (!componenteId) return dedupeOptions(todosCriterios);
    const comp = todosComponentes.find((c) => c.value === componenteId);
    if (!comp) return dedupeOptions(todosCriterios);
    const prefijo = comp.label.split(" - ")[0];
    return dedupeOptions(
      todosCriterios.filter((c) => c.label.startsWith(prefijo)),
    );
  }, [componenteId, todosComponentes, todosCriterios, dedupeOptions]);

  const emitChange = useCallback(
    (nextDim: string, nextComp: string, nextCrit: string) => {
      onFiltersChange({
        dimension_id: nextDim ? parseInt(nextDim) : null,
        componente_id: nextComp ? parseInt(nextComp) : null,
        criterio: nextCrit || null,
      });
    },
    [onFiltersChange],
  );

  // ── Handlers modo tradicional ────────────────────────────────────────────
  const handleDimensionChange = useCallback(
    (value: string) => {
      const next = value === "__all__" ? "" : value;
      setDimensionId(next);
      setComponenteId("");
      setCriterioId("");
      emitChange(next, "", "");
    },
    [emitChange],
  );

  const handleComponenteChange = useCallback(
    (value: string) => {
      const next = value === "__all__" ? "" : value;
      setComponenteId(next);
      setCriterioId("");
      emitChange(dimensionId, next, "");
    },
    [dimensionId, emitChange],
  );

  const handleCriterioChange = useCallback(
    (value: string) => {
      const next = value === "__all__" ? "" : value;
      setCriterioId(next);
      emitChange(dimensionId, componenteId, next);
    },
    [dimensionId, componenteId, emitChange],
  );

  // ── Limpiar todos los filtros ────────────────────────────────────────────
  const handleLimpiar = useCallback(() => {
    setDimensionId("");
    setComponenteId("");
    setCriterioId("");
    setPautaId("");
    onFiltersChange({});
  }, [onFiltersChange]);

  const hayFiltrosActivos = isFlexible
    ? pautaId !== ""
    : dimensionId || componenteId || criterioId;

  // ── Opciones con "Todas/Todos" ───────────────────────────────────────────
  const opcionesDimension = useMemo<SelectOption[]>(
    () => [
      { value: "__all__", label: "Todas las dimensiones" },
      ...dimensiones,
    ],
    [dimensiones],
  );
  const opcionesComponente = useMemo<SelectOption[]>(
    () => [
      { value: "__all__", label: "Todos los componentes" },
      ...componentesFiltrados,
    ],
    [componentesFiltrados],
  );
  const opcionesCriterio = useMemo<SelectOption[]>(
    () => [
      { value: "__all__", label: "Todos los criterios" },
      ...criteriosFiltrados,
    ],
    [criteriosFiltrados],
  );
  return (
    <Card className="p-4 w-full">
      <div className="flex items-end gap-4">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Modo flexible: filtros jerárquicos por nivel */}
          {isFlexible ? (
            <div className="md:col-span-1 xl:col-span-3">
              <TreeSelect
                elements={flexElements}
                value={pautaId ? [parseInt(pautaId, 10)] : []}
                onChange={(ids) => {
                  const next =
                    ids.length > 0 ? ids[ids.length - 1].toString() : "";
                  setPautaId(next);
                  onFiltersChange({
                    elemento_id: next ? parseInt(next, 10) : null,
                  });
                }}
                mode="filter"
                label="Filtrar por nivel"
                disabled={flexElements.length === 0}
              />
            </div>
          ) : (
            /* Modo tradicional: cascada Dimensión → Componente → Criterio */
            <>
              <div>
                <CustomSelect
                  label="Dimensión"
                  value={dimensionId || "__all__"}
                  options={opcionesDimension}
                  onChange={handleDimensionChange}
                  searchable
                  minItemsForSearch={4}
                  size="sm"
                />
              </div>

              <div>
                <CustomSelect
                  label="Componente"
                  value={componenteId || "__all__"}
                  options={opcionesComponente}
                  onChange={handleComponenteChange}
                  disabled={componentesFiltrados.length === 0}
                  searchable
                  minItemsForSearch={4}
                  size="sm"
                />
              </div>

              <div>
                <CustomSelect
                  label="Criterio"
                  value={criterioId || "__all__"}
                  options={opcionesCriterio}
                  onChange={handleCriterioChange}
                  disabled={criteriosFiltrados.length === 0}
                  searchable
                  minItemsForSearch={4}
                  size="sm"
                />
              </div>
            </>
          )}
        </div>

        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={handleLimpiar}
            className="text-xs text-azul-una hover:underline whitespace-nowrap pb-1"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </Card>
  );
};
