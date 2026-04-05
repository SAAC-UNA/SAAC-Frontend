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

// In-memory storage that persists only during the current page session
let memoryContext = { ...DEFAULT_CONTEXT };

export const getOperationalContextSnapshot = (): OperationalContextSnapshot => {
  return { ...memoryContext };
};

export const setOperationalContextSnapshot = (
  partial: Partial<OperationalContextSnapshot>,
): void => {
  memoryContext = {
    ...memoryContext,
    ...partial,
  };
};

export const clearOperationalContextIds = (): void => {
  memoryContext = { ...DEFAULT_CONTEXT };
};
