import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  PageHeader,
  ScreenContainer,
  SectionTabs,
} from "@/Components/Ui/Index";
import { getModuleInfo } from "@/Constants/ModuleInfo";
import { CAPABILITIES } from "@/Constants/PermissionCapabilities";
import { useAuth } from "@/Context/AuthContext";
import StructureModelsPage from "@/Pages/StructureModels/StructureModelsPage";
import AccreditationCyclesPage from "@/Pages/AccreditationCycles/AccreditationCyclesPage";
import { AccreditationProcessList } from "@/Pages/AccreditationProcess";
import type { CommitmentConfigurationState } from "@/Pages/AccreditationProcess/AccreditationProcessList";
import CreateImprovementCommitment from "@/Pages/ImprovementCommitments/CreateImprovementCommitment";
import type { BreadcrumbItem } from "@/Components/Ui/Feedback/Breadcrumb";

const SECTIONS = [
  "Modelo de acreditación",
  "Ciclos de acreditación",
  "Procesos de acreditación",
] as const;

type AccreditationSection = (typeof SECTIONS)[number];
type SectionKey = "modelos" | "ciclos" | "procesos";

const SECTION_BY_KEY: Record<SectionKey, AccreditationSection> = {
  modelos: "Modelo de acreditación",
  ciclos: "Ciclos de acreditación",
  procesos: "Procesos de acreditación",
};

const KEY_BY_SECTION: Record<AccreditationSection, SectionKey> = {
  "Modelo de acreditación": "modelos",
  "Ciclos de acreditación": "ciclos",
  "Procesos de acreditación": "procesos",
};

const isSectionKey = (value: string | null): value is SectionKey =>
  value === "modelos" || value === "ciclos" || value === "procesos";

const SECTION_ACCESS: Record<
  AccreditationSection,
  { capability: string; permission: string }
> = {
  "Modelo de acreditación": {
    capability: CAPABILITIES.ACCREDITATION_MODEL_VIEW,
    permission: "modelos.view",
  },
  "Ciclos de acreditación": {
    capability: CAPABILITIES.ACCREDITATION_CYCLE_VIEW,
    permission: "ciclos.view",
  },
  "Procesos de acreditación": {
    capability: CAPABILITIES.ACCREDITATION_PROCESS_VIEW,
    permission: "procesos.view",
  },
};

const MODULE_INFO_BY_SECTION: Record<AccreditationSection, string> = {
  "Modelo de acreditación": "accreditation_models",
  "Ciclos de acreditación": "accreditation_cycles",
  "Procesos de acreditación": "accreditation_processes",
};

type HeaderMode = "none" | "simple" | "cycle-only" | "contextual";

interface EmbeddedHeaderMeta {
  title: string;
  description?: string;
  breadcrumbMode?: HeaderMode;
  breadcrumbParent?: BreadcrumbItem;
}

const AccreditationModulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [headerExtra, setHeaderExtra] = useState<React.ReactNode>(null);
  const [processConfigState, setProcessConfigState] =
    useState<CommitmentConfigurationState | null>(null);
  const { canAccess } = useAuth();

  const availableSections = useMemo(
    () =>
      SECTIONS.filter((section) => {
        const access = SECTION_ACCESS[section];
        return canAccess({
          requireAnyCapabilities: [access.capability],
          requireAnyPermissions: [access.permission],
        });
      }),
    [canAccess],
  );

  const activeSection = useMemo<AccreditationSection>(() => {
    const sectionKey = searchParams.get("seccion");
    const requestedSection = isSectionKey(sectionKey)
      ? SECTION_BY_KEY[sectionKey]
      : "Modelo de acreditación";

    return availableSections.includes(requestedSection)
      ? requestedSection
      : availableSections[0] ?? "Modelo de acreditación";
  }, [availableSections, searchParams]);

  const defaultHeaderMeta = useMemo<EmbeddedHeaderMeta>(() => {
    const moduleInfo = getModuleInfo(MODULE_INFO_BY_SECTION[activeSection]);
    return {
      title: moduleInfo.title,
      description: moduleInfo.description,
      breadcrumbMode: "cycle-only",
    };
  }, [activeSection]);

  const [headerMeta, setHeaderMeta] = useState<EmbeddedHeaderMeta>(
    defaultHeaderMeta,
  );

  useEffect(() => {
    setHeaderExtra(null);
    setProcessConfigState(null);
    setHeaderMeta(defaultHeaderMeta);
  }, [defaultHeaderMeta]);

  const handleSectionChange = (section: AccreditationSection) => {
    setHeaderExtra(null);
    setProcessConfigState(null);
    setHeaderMeta({
      title: getModuleInfo(MODULE_INFO_BY_SECTION[section]).title,
      description: getModuleInfo(MODULE_INFO_BY_SECTION[section]).description,
      breadcrumbMode: "cycle-only",
    });
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("seccion", KEY_BY_SECTION[section]);

    // Clicking a module tab should always return to that section's main view.
    nextSearchParams.delete("modelo");

    setSearchParams(nextSearchParams);
  };

  const handleHeaderExtraChange = useCallback(
    (nextHeaderExtra: React.ReactNode) => {
      setHeaderExtra(nextHeaderExtra);
    },
    [],
  );

  const handleHeaderMetaChange = useCallback(
    (nextHeaderMeta: EmbeddedHeaderMeta | null) => {
      if (!nextHeaderMeta) {
        setHeaderMeta(defaultHeaderMeta);
        return;
      }

      setHeaderMeta((prev) => ({
        ...prev,
        ...nextHeaderMeta,
      }));
    },
    [defaultHeaderMeta],
  );

  const handleOpenCommitmentConfig = useCallback(
    (state: CommitmentConfigurationState) => {
      setProcessConfigState(state);
    },
    [],
  );

  return (
    <ScreenContainer>
      <PageHeader
        title={headerMeta.title}
        description={headerMeta.description}
        breadcrumbMode={headerMeta.breadcrumbMode ?? "cycle-only"}
        breadcrumbParent={headerMeta.breadcrumbParent}
        headerExtra={headerExtra}
      />

      <SectionTabs
        tabs={availableSections}
        activeTab={activeSection}
        onTabChange={handleSectionChange}
      />

      {activeSection === "Modelo de acreditación" && (
        <StructureModelsPage
          embedded
          onHeaderExtraChange={handleHeaderExtraChange}
          onHeaderMetaChange={handleHeaderMetaChange}
        />
      )}
      {activeSection === "Ciclos de acreditación" && (
        <AccreditationCyclesPage
          embedded
          onHeaderExtraChange={handleHeaderExtraChange}
        />
      )}
      {activeSection === "Procesos de acreditación" && (
        processConfigState ? (
          <CreateImprovementCommitment
            embedded
            contextState={processConfigState}
            onHeaderExtraChange={handleHeaderExtraChange}
            onHeaderMetaChange={handleHeaderMetaChange}
            onComplete={() => setProcessConfigState(null)}
          />
        ) : (
          <AccreditationProcessList
            embedded
            onHeaderExtraChange={handleHeaderExtraChange}
            onHeaderMetaChange={handleHeaderMetaChange}
            onConfigureCommitment={handleOpenCommitmentConfig}
          />
        )
      )}
    </ScreenContainer>
  );
};

export default AccreditationModulePage;
