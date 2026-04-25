import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, LoadingSpinner, Button } from "@/Components/Ui/Index";
import { globalFilterContextService } from "@/Services/GlobalFilterContextService";
import { useAuth } from "@/Context/AuthContext";
import { cn } from "@/Utils/ClassNames";
import { getOperationalContextSnapshot } from "@/Services/OperationalContextStore";
import { ROUTES } from "@/Constants/ROUTES";
import { SystemIcons } from "@/Components/Ui/Icons/SystemIcons";

// Navegación por cards: Carrera (solo superusuario) → Ciclo → Proceso
type Step = "career" | "cycle" | "process";

interface CardItem {
  id: string;
  label: string;
  sublabel?: string;
}

// Clases Tailwind estáticas por paso (no se pueden construir dinámicamente)
const stepClasses: Record<
  Step,
  {
    label: string;
    text: string;
    border: string;
    bg: string;
    hoverBorder: string;
    hoverBg: string;
    dotBg: string;
  }
> = {
  career: {
    label: "Carrera",
    text: "text-azul-una",
    border: "border-azul-una/20",
    bg: "bg-azul-una/5",
    hoverBorder: "group-hover:border-azul-una/50",
    hoverBg: "group-hover:bg-azul-una/10",
    dotBg: "bg-azul-una",
  },
  cycle: {
    label: "Ciclo",
    text: "text-rojo-una",
    border: "border-rojo-una/20",
    bg: "bg-rojo-una/5",
    hoverBorder: "group-hover:border-rojo-una/50",
    hoverBg: "group-hover:bg-rojo-una/10",
    dotBg: "bg-rojo-una",
  },
  process: {
    label: "Proceso",
    text: "text-verde",
    border: "border-verde/20",
    bg: "bg-verde/5",
    hoverBorder: "group-hover:border-verde/50",
    hoverBg: "group-hover:bg-verde/10",
    dotBg: "bg-verde",
  },
};

const stepSubtitle: Record<Step, string> = {
  career: "Selecciona la carrera con la que vas a trabajar.",
  cycle: "Selecciona el ciclo de acreditación.",
  process: "Selecciona el proceso en el que trabajarás.",
};

// ContextSelector: route /selector-procesos
const ContextSelector: React.FC = () => {
  const { userRoleNames } = useAuth();
  const isSuperUser = userRoleNames.some((r) => {
    const n = r.toLowerCase();
    return n === "superusuario" || n === "super usuario";
  });

  const [catalog, setCatalog] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState<string>("");
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  const [step, setStep] = useState<Step>("cycle");

  const [searchParams] = useSearchParams();
  const stepParam = searchParams.get("step") as Step | null;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await globalFilterContextService.getCatalog();
        if (!mounted) return;
        setCatalog(data);
        if (data.context?.career_campus_id) {
          setSelectedCareerId(String(data.context.career_campus_id));
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const isCareerFixed = Boolean(catalog?.context?.career_campus_id);
  const showCareerStep = isSuperUser && !isCareerFixed;

  // Paso inicial una vez que carga el catálogo
  useEffect(() => {
    if (!catalog) return;

    const isFixed = Boolean(catalog?.context?.career_campus_id);
    const snapshot = getOperationalContextSnapshot();
    const validSteps: Step[] = ["career", "cycle", "process"];
    const isValidParam = stepParam && validSteps.includes(stepParam);

    if (isValidParam) {
      // Pre-poblar estados anteriores para que los filtros de cards funcionen
      if (
        (stepParam === "cycle" || stepParam === "process") &&
        !isFixed &&
        snapshot.careerCampusId
      ) {
        setSelectedCareerId(String(snapshot.careerCampusId));
      }
      if (stepParam === "process" && snapshot.cycleId) {
        setSelectedCycleId(String(snapshot.cycleId));
      }
      setStep(stepParam);
    } else {
      setStep(showCareerStep ? "career" : "cycle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog]);

  const careerCards = useMemo<CardItem[]>(() => {
    if (!catalog?.careers) return [];
    return catalog.careers.map((c: any) => ({
      id: String(c.carrera_sede_id),
      label: c.carrera_nombre,
      sublabel: c.sede_nombre,
    }));
  }, [catalog]);

  const cycleCards = useMemo<CardItem[]>(() => {
    if (!catalog?.cycles) return [];
    const fixedCareer = catalog.context?.career_campus_id ?? null;
    const cid = selectedCareerId ? Number(selectedCareerId) : null;
    const target = fixedCareer ?? cid;
    return catalog.cycles
      .filter((cy: any) => (target ? cy.carrera_sede_id === target : true))
      .map((cy: any) => ({
        id: String(cy.ciclo_acreditacion_id),
        label: cy.nombre,
      }));
  }, [catalog, selectedCareerId]);

  const processCards = useMemo<CardItem[]>(() => {
    if (!catalog?.processes || !selectedCycleId) return [];
    return catalog.processes
      .filter((p: any) => p.ciclo_acreditacion_id === Number(selectedCycleId))
      .map((p: any) => ({
        id: String(p.proceso_id),
        label: p.tipo_proceso,
      }));
  }, [catalog, selectedCycleId]);

  const handleSelectCareer = (careerId: string) => {
    const careerObj = catalog?.careers.find(
      (c: any) => String(c.carrera_sede_id) === careerId,
    );
    globalFilterContextService.syncContextSnapshot({
      careerCampusId: Number(careerId),
      careerLabel: careerObj
        ? `${careerObj.carrera_nombre} - ${careerObj.sede_nombre}`
        : null,
      campusLabel: null,
      cycleId: null,
      cycleLabel: null,
      processId: null,
      processLabel: null,
      cycleModelType: null,
    });
    setSelectedCareerId(careerId);
    setSelectedCycleId("");
    setStep("cycle");
  };

  const handleSelectCycle = (cycleId: string) => {
    const cycleObj = catalog?.cycles.find(
      (cy: any) => String(cy.ciclo_acreditacion_id) === cycleId,
    );
    globalFilterContextService.syncContextSnapshot({
      cycleId: Number(cycleId),
      cycleLabel: cycleObj?.nombre ?? null,
      processId: null,
      processLabel: null,
      cycleModelType: cycleObj?.modelo_tipo ?? null,
    });
    setSelectedCycleId(cycleId);
    setStep("process");
  };

  const handleSelectProcess = async (processId: string) => {
    setSaving(true);
    try {
      const careerCampusId = isCareerFixed
        ? catalog.context.career_campus_id
        : selectedCareerId
          ? Number(selectedCareerId)
          : null;

      const cycleObj = catalog.cycles.find(
        (cy: any) => String(cy.ciclo_acreditacion_id) === selectedCycleId,
      );
      const processObj = catalog.processes.find(
        (p: any) => String(p.proceso_id) === processId,
      );
      const careerObj = careerCampusId
        ? catalog.careers.find((c: any) => c.carrera_sede_id === careerCampusId)
        : null;

      await globalFilterContextService.updateContext({
        career_campus_id: careerCampusId,
        ciclo_acreditacion_id: Number(selectedCycleId),
        proceso_id: Number(processId),
      });
      globalFilterContextService.syncContextSnapshot({
        careerCampusId: careerCampusId ?? null,
        cycleId: Number(selectedCycleId),
        processId: Number(processId),
        careerLabel: careerObj
          ? `${careerObj.carrera_nombre} - ${careerObj.sede_nombre}`
          : null,
        campusLabel: null,
        cycleLabel: cycleObj?.nombre ?? null,
        processLabel: processObj?.tipo_proceso ?? null,
      });
      window.location.href = ROUTES.HOME;
    } catch {
      alert("Error al aplicar el contexto");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step === "process") {
      // Nullear ciclo y proceso al retroceder al paso de ciclo
      globalFilterContextService.syncContextSnapshot({
        cycleId: null,
        cycleLabel: null,
        processId: null,
        processLabel: null,
        cycleModelType: null,
      });
      setSelectedCycleId("");
      setStep("cycle");
    } else if (step === "cycle" && showCareerStep) {
      // Nullear carrera, ciclo y proceso al retroceder al paso de carrera
      globalFilterContextService.syncContextSnapshot({
        careerCampusId: null,
        careerLabel: null,
        campusLabel: null,
        cycleId: null,
        cycleLabel: null,
        processId: null,
        processLabel: null,
        cycleModelType: null,
      });
      setSelectedCareerId("");
      setStep("career");
    }
  };

  const handleCardClick = (id: string) => {
    if (step === "career") handleSelectCareer(id);
    else if (step === "cycle") handleSelectCycle(id);
    else handleSelectProcess(id);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <LoadingSpinner variant="loader" />
      </div>
    );
  }

  const steps: Step[] = showCareerStep
    ? ["career", "cycle", "process"]
    : ["cycle", "process"];

  const currentStepIndex = steps.indexOf(step);
  const canGoBack = step === "process" || (step === "cycle" && showCareerStep);

  const currentCards =
    step === "career"
      ? careerCards
      : step === "cycle"
        ? cycleCards
        : processCards;

  const cls = stepClasses[step];

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-10">
      {/* Overlay mientras guarda */}
      {saving && (
        <div className="fixed inset-0 bg-negro-una/20 flex items-center justify-center z-50">
          <LoadingSpinner variant="loader" />
        </div>
      )}

      <div className="w-full max-w-5xl flex flex-col items-center gap-8">
        {/* Encabezado */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-negro-una leading-tight">
            Sistema de Acreditación y
            <br />
            Autoevaluación de las Carreras
          </h1>
          <p className="mt-3 text-base text-gris-una">{stepSubtitle[step]}</p>
        </div>

        {/* Indicadores de paso */}
        <div className="flex items-center gap-2">
          {steps.map((s, idx) => {
            const isPast = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <React.Fragment key={s}>
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors",
                    isCurrent
                      ? `${stepClasses[s].dotBg} text-blanco-una`
                      : isPast
                        ? "bg-negro-una/20 text-negro-una"
                        : "bg-gris-una/20 text-gris-una",
                  )}
                >
                  <span className="text-xs font-bold">{idx + 1}</span>
                  <span>{stepClasses[s].label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-8 h-px",
                      idx < currentStepIndex
                        ? "bg-negro-una/40"
                        : "bg-gris-una/30",
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Botón volver — se mueve debajo de las cards */}

        {/* Cards del paso actual */}
        {currentCards.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            {/* Icono de tabla vacía */}
            <div className="text-gris-una/40">
              <SystemIcons.modal.document className="w-20 h-20" />
            </div>

            {/* Título y descripción */}
            <div className="max-w-xs">
              <p className="text-base font-semibold text-gris-una">
                {step === "career" && "Sin carreras disponibles"}
                {step === "cycle" && "Sin ciclos de acreditación"}
                {step === "process" && "Sin procesos para este ciclo"}
              </p>
              <p className="mt-1 text-sm text-gris-una/70">
                {step === "career" &&
                  "Tu usuario no tiene carreras asignadas. Contacta al administrador del sistema."}
                {step === "cycle" &&
                  "Aún no existe ningún ciclo creado. Puedes crearlos en la sección de Ciclos de Acreditación."}
                {step === "process" &&
                  "Este ciclo no tiene procesos asociados. Puedes crearlos en la sección de Procesos de Acreditación."}
              </p>
            </div>

            {/* Acciones */}
            <div className="flex flex-col items-center gap-2">
              {step === "cycle" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-negro-una text-blanco-una hover:bg-negro-una/90 hover:shadow-md"
                  onClick={() =>
                    (window.location.href = ROUTES.ACCREDITATION_CYCLES)
                  }
                >
                  Ir a Ciclos de Acreditación
                </Button>
              )}
              {step === "process" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-negro-una text-blanco-una hover:bg-negro-una/90 hover:shadow-md"
                  onClick={() =>
                    (window.location.href = ROUTES.ACCREDITATION_PROCESSES)
                  }
                >
                  Ir a Procesos de Acreditación
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="w-full flex flex-wrap justify-center gap-5">
              {currentCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={saving}
                  className="group w-full max-w-xs text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-negro-una rounded-corner"
                >
                  <Card
                    className={cn(
                      "h-full p-6 border shadow-sm cursor-pointer transition-all duration-200",
                      cls.border,
                      cls.bg,
                      cls.hoverBorder,
                      cls.hoverBg,
                      "group-hover:shadow-md group-hover:scale-[1.02]",
                      "group-disabled:opacity-60 group-disabled:cursor-not-allowed",
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs uppercase tracking-wide font-semibold mb-3",
                        cls.text,
                      )}
                    >
                      {cls.label}
                    </p>
                    <p className="text-base font-semibold text-negro-una leading-snug">
                      {card.label}
                    </p>
                    {card.sublabel && (
                      <p className="text-sm text-gris-una mt-1">
                        {card.sublabel}
                      </p>
                    )}
                  </Card>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Botón volver — debajo de cards y estado vacío */}
        {canGoBack && (
          <div>
            <Button variant="ghost" size="sm" onClick={handleBack}>
              ← Volver
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextSelector;
