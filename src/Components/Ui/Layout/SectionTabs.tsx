import { cn } from "@/Utils/ClassNames";

export type SectionTabsProps<TTab extends string> = {
  tabs: readonly TTab[];
  activeTab: TTab;
  onTabChange: (tab: TTab) => void;
  className?: string;
};

export const SectionTabs = <TTab extends string>({
  tabs,
  activeTab,
  onTabChange,
  className,
}: SectionTabsProps<TTab>) => (
  <div
    className={cn(
      "flex flex-wrap border-b border-gris-light mb-6 gap-0",
      className,
    )}
    role="tablist"
  >
    {tabs.map((tab) => (
      <button
        key={tab}
        type="button"
        role="tab"
        aria-selected={activeTab === tab}
        onClick={() => onTabChange(tab)}
        className={cn(
          "px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
          activeTab === tab
            ? "border-error text-error"
            : "border-transparent text-gris-una hover:text-negro-una-2",
        )}
      >
        {tab}
      </button>
    ))}
  </div>
);
