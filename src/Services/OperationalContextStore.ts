export interface OperationalContextIds {
  careerCampusId: number | null;
  cycleId: number | null;
  processId: number | null;
}

export interface OperationalContextSnapshot extends OperationalContextIds {
  careerLabel: string | null;
  campusLabel: string | null;
  cycleLabel: string | null;
  processLabel: string | null;
}

const DEFAULT_CONTEXT: OperationalContextSnapshot = {
  careerCampusId: null,
  cycleId: null,
  processId: null,
  careerLabel: null,
  campusLabel: null,
  cycleLabel: null,
  processLabel: null,
};

const STORAGE_KEY = "operational-context";

// In-memory storage
let memoryContext = { ...DEFAULT_CONTEXT };
let isInitialized = false;

// Initialize from localStorage on first use
const ensureInitialized = (): void => {
  if (isInitialized || typeof window === "undefined") {
    return;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      memoryContext = {
        ...DEFAULT_CONTEXT,
        ...parsed,
      };
    }
  } catch {
    // Silently fail and use default context if localStorage is unavailable or corrupted
  }

  isInitialized = true;
};

export const getOperationalContextSnapshot = (): OperationalContextSnapshot => {
  ensureInitialized();
  return { ...memoryContext };
};

export const setOperationalContextSnapshot = (
  partial: Partial<OperationalContextSnapshot>,
): void => {
  ensureInitialized();

  memoryContext = {
    ...memoryContext,
    ...partial,
  };

  // Persist to localStorage
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryContext));
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }
};

export const clearOperationalContextIds = (): void => {
  ensureInitialized();

  memoryContext = { ...DEFAULT_CONTEXT };

  // Clear from localStorage
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }
};
