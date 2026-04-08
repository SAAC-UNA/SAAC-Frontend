import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AccreditationProcessList } from "./AccreditationProcessList";

const mockNavigate = jest.fn();
const mockGetCycles = jest.fn();
const mockGetProcesses = jest.fn();
const mockGetCatalog = jest.fn();
const mockSyncContextSnapshot = jest.fn();
const mockGetOperationalContextSnapshot = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("@/Constants/ModuleInfo", () => ({
  getModuleInfo: jest.fn(() => ({
    title: "Procesos de Acreditación",
    description: "Gestiona los procesos de acreditación.",
  })),
}));

jest.mock("@/Services/AccreditationProcessService", () => ({
  accreditationProcessService: {
    getCycles: (...args: unknown[]) => mockGetCycles(...args),
    getProcesses: (...args: unknown[]) => mockGetProcesses(...args),
    createProcess: jest.fn(),
    updateProcess: jest.fn(),
    deleteProcess: jest.fn(),
  },
}));

jest.mock("@/Services/GlobalFilterContextService", () => ({
  GLOBAL_FILTER_CONTEXT_CHANGED_EVENT: "global-filter-context-changed",
  globalFilterContextService: {
    getCatalog: (...args: unknown[]) => mockGetCatalog(...args),
    syncContextSnapshot: (...args: unknown[]) => mockSyncContextSnapshot(...args),
  },
}));

jest.mock("@/Services/OperationalContextStore", () => ({
  getOperationalContextSnapshot: (...args: unknown[]) =>
    mockGetOperationalContextSnapshot(...args),
}));

jest.mock("@/Components/Ui/Layout/ScreenContainer", () => ({
  ScreenContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="screen-container">{children}</div>
  ),
}));

jest.mock("@/Components/Ui/Index", () => ({
  PageHeader: ({
    title,
    description,
    headerExtra,
  }: {
    title: string;
    description?: string;
    headerExtra?: React.ReactNode;
  }) => (
    <header>
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      {headerExtra}
    </header>
  ),
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

jest.mock("@/Components/Ui/Forms/SearchInput", () => ({
  SearchInput: ({
    placeholder,
    value,
    onChange,
  }: {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <input
      aria-label="Buscar procesos"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

jest.mock("./Components/AccreditationProcessTable", () => ({
  AccreditationProcessTable: ({
    processes,
    isLoading,
    onConfigure,
  }: {
    processes: Array<{ id: string }>;
    isLoading: boolean;
    onConfigure?: (process: { id: string }) => void;
  }) => (
    <div
      data-testid="process-table"
      data-count={String(processes.length)}
      data-loading={String(isLoading)}
    >
      <div data-testid="process-ids">
        {processes.map((process) => process.id).join(",")}
      </div>
      {processes[0] ? (
        <button onClick={() => onConfigure?.(processes[0])}>
          Configurar primer proceso
        </button>
      ) : null}
    </div>
  ),
}));

jest.mock("./Components/AccreditationProcessFormModal", () => ({
  AccreditationProcessFormModal: ({
    isOpen,
    cycles,
    initialData,
  }: {
    isOpen: boolean;
    cycles: Array<{ id: string }>;
    initialData?: { id: string } | null;
  }) =>
    isOpen ? (
      <div
        data-testid="process-form-modal"
        data-cycles={String(cycles.length)}
        data-mode={initialData ? "edit" : "create"}
      />
    ) : null,
}));

jest.mock("./Components/AccreditationProcessDetailsModal", () => ({
  AccreditationProcessDetailsModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="process-details-modal" /> : null,
}));

jest.mock("./Components/AccreditationProcessDeleteModal", () => ({
  AccreditationProcessDeleteModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="process-delete-modal" /> : null,
}));

jest.mock("@/Components/Ui/Modals/SuccessModal", () => ({
  SuccessModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="success-modal" /> : null,
}));

describe("AccreditationProcessList", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetCycles.mockResolvedValue([
      {
        id: "1",
        name: "Ciclo 2025",
        modeloEstructuraId: "77",
        modeloEstructuraTipo: "Modelo A",
      },
      {
        id: "2",
        name: "Ciclo 2024",
      },
    ]);

    mockGetProcesses.mockResolvedValue([
      {
        id: "proc-1",
        type: "Compromiso de mejora",
        accreditationCycleId: "1",
        accreditationCycleName: "Ciclo 2025",
        status: "activo",
        startDate: "2025-01-10",
        estimatedEndDate: "2025-02-10",
        createdAt: "2025-01-01T10:00:00Z",
        updatedAt: "2025-01-02T10:00:00Z",
      },
      {
        id: "proc-2",
        type: "Autoevaluación",
        accreditationCycleId: "2",
        accreditationCycleName: "Ciclo 2024",
        status: "inactivo",
        startDate: "2024-01-10",
        estimatedEndDate: "2024-02-10",
        createdAt: "2024-01-01T10:00:00Z",
        updatedAt: "2024-01-02T10:00:00Z",
      },
    ]);

    mockGetCatalog.mockResolvedValue({
      cycles: [
        {
          ciclo_acreditacion_id: 1,
          nombre: "Ciclo 2025",
        },
      ],
    });

    mockGetOperationalContextSnapshot.mockReturnValue({
      careerCampusId: null,
      cycleId: 1,
      processId: null,
    });
  });

  it("carga los procesos y sincroniza el contexto seleccionado", async () => {
    render(<AccreditationProcessList />);

    await waitFor(() => {
      expect(mockGetProcesses).toHaveBeenCalledTimes(1);
      expect(mockGetCycles).toHaveBeenCalledTimes(1);
      expect(mockGetCatalog).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByTestId("process-table")).toHaveAttribute("data-loading", "false");
    });

    expect(screen.getByRole("heading", { name: "Procesos de Acreditación" })).toBeInTheDocument();
    expect(screen.getByTestId("process-table")).toHaveAttribute("data-count", "1");
    expect(screen.getByTestId("process-ids")).toHaveTextContent("proc-1");
    expect(screen.getByTestId("process-ids")).not.toHaveTextContent("proc-2");

    expect(mockSyncContextSnapshot).toHaveBeenCalledWith({
      careerCampusId: null,
      cycleId: 1,
      processId: null,
      cycleLabel: "Ciclo 2025",
    });
  });

  it("abre el modal de creacion desde el boton Crear", async () => {
    render(<AccreditationProcessList />);

    await waitFor(() => {
      expect(screen.getByTestId("process-table")).toHaveAttribute("data-count", "1");
    });

    fireEvent.click(screen.getByRole("button", { name: "Crear" }));

    expect(screen.getByTestId("process-form-modal")).toHaveAttribute("data-mode", "create");
    expect(screen.getByTestId("process-form-modal")).toHaveAttribute("data-cycles", "1");
  });

  it("navega a configuracion con los parametros del proceso", async () => {
    render(<AccreditationProcessList />);

    await waitFor(() => {
      expect(screen.getByTestId("process-table")).toHaveAttribute("data-count", "1");
    });

    fireEvent.click(screen.getByRole("button", { name: "Configurar primer proceso" }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);

    const [targetPath, navigateOptions] = mockNavigate.mock.calls[0];

    expect(targetPath).toContain("/compromisos/crear?");
    expect(targetPath).toContain("procesoId=proc-1");
    expect(targetPath).toContain("cicloId=1");
    expect(targetPath).toContain("startDate=2025-01-10");
    expect(targetPath).toContain("estimatedEndDate=2025-02-10");
    expect(targetPath).toContain("modeloTipo=Modelo+A");
    expect(targetPath).toContain("modeloId=77");

    expect(navigateOptions).toEqual({
      state: {
        procesoId: "proc-1",
        cicloId: "1",
        startDate: "2025-01-10",
        estimatedEndDate: "2025-02-10",
        modeloTipo: "Modelo A",
        modeloId: 77,
      },
    });
  });
});