import React, { useCallback, useMemo, useState } from "react";
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

const AccreditationModulePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [headerExtra, setHeaderExtra] = useState<React.ReactNode>(null);
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

  const handleSectionChange = (section: AccreditationSection) => {
    setHeaderExtra(null);
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("seccion", KEY_BY_SECTION[section]);

    if (section !== "Modelo de acreditación") {
      nextSearchParams.delete("modelo");
    }

    setSearchParams(nextSearchParams);
  };

  const handleHeaderExtraChange = useCallback(
    (nextHeaderExtra: React.ReactNode) => {
      setHeaderExtra(nextHeaderExtra);
    },
    [],
  );

  const moduleInfo = getModuleInfo(MODULE_INFO_BY_SECTION[activeSection]);

  return (
    <ScreenContainer>
      <PageHeader
        title={moduleInfo.title}
        description={moduleInfo.description}
        breadcrumbMode="cycle-only"
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
        />
      )}
      {activeSection === "Ciclos de acreditación" && (
        <AccreditationCyclesPage
          embedded
          onHeaderExtraChange={handleHeaderExtraChange}
        />
      )}
      {activeSection === "Procesos de acreditación" && (
        <AccreditationProcessList
          embedded
          onHeaderExtraChange={handleHeaderExtraChange}
        />
      )}
    </ScreenContainer>
  );
};

export default AccreditationModulePage;
