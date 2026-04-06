import { useEffect, useState } from "react";
import { GLOBAL_FILTER_CONTEXT_CHANGED_EVENT } from "@/Services/GlobalFilterContextService";
import {
  getOperationalContextSnapshot,
  type OperationalContextSnapshot,
} from "@/Services/OperationalContextStore";

export const useOperationalContextSnapshot = (): OperationalContextSnapshot => {
  const [snapshot, setSnapshot] = useState<OperationalContextSnapshot>(() =>
    getOperationalContextSnapshot(),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncSnapshot = () => {
      setSnapshot(getOperationalContextSnapshot());
    };

    window.addEventListener(GLOBAL_FILTER_CONTEXT_CHANGED_EVENT, syncSnapshot);
    syncSnapshot();

    return () => {
      window.removeEventListener(
        GLOBAL_FILTER_CONTEXT_CHANGED_EVENT,
        syncSnapshot,
      );
    };
  }, []);

  return snapshot;
};
