import React from "react";
import { render, screen, act } from "@testing-library/react";
import { NavigationProvider, useNavigation } from "./NavigationContext";
import { AuthContext } from "./AuthContext";
import { MemoryRouter } from "react-router-dom";

// Mock de AuthContext para las pruebas
const mockAuthContextValue = {
  user: {
    usuario_id: 1,
    id: 1,
    cedula: "123456789",
    nombre: "Usuario Test",
    name: "Usuario Test",
    email: "test@test.com",
    roles: [{ id: 1, name: "Admin" }],
    careers: [],
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    all_permissions: [
      { id: 1, name: "evidencias.view", label: "Ver evidencias" },
    ],
    direct_permissions: [],
  },
  userRoleNames: ["Admin"],
  userPermissionNames: ["evidencias.view"],
  loading: false,
  authChecked: true,
  isAuthenticated: true,
  isSuperUser: () => false,
  isAdmin: () => true,
  hasRole: () => false,
  hasAnyRole: () => false,
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
  canAccess: () => true,
  canMakeFilesPublic: () => false,
  getUserCareer: () => null,
  login: jest.fn(),
  logout: jest.fn(),
  error: null,
};

describe("NavigationContext", () => {
  function TestComponent() {
    const {
      activeItemId,
      expandedItemId,
      setActiveItem,
      setExpandedItem,
      toggleExpanded,
    } = useNavigation();
    return (
      <div>
        <span data-testid="active">{activeItemId}</span>
        <span data-testid="expanded">{expandedItemId}</span>
        <button onClick={() => setActiveItem("test")}>Set Active</button>
        <button onClick={() => setExpandedItem("expand")}>Set Expanded</button>
        <button onClick={() => toggleExpanded("expand")}>
          Toggle Expanded
        </button>
      </div>
    );
  }

  it("proporciona valores iniciales y permite cambiar el activo", () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <MemoryRouter initialEntries={["/inicio"]}>
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByTestId("active").textContent).toBe("inicio");
    expect(screen.getByTestId("expanded").textContent).toBe("");
    act(() => {
      screen.getByText("Set Active").click();
    });
    expect(screen.getByTestId("active").textContent).toBe("test");
  });

  it("permite cambiar el expandido y alternar", () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <MemoryRouter initialEntries={["/inicio"]}>
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    act(() => {
      screen.getByText("Set Expanded").click();
    });
    expect(screen.getByTestId("expanded").textContent).toBe("expand");
    act(() => {
      screen.getByText("Toggle Expanded").click();
    });
    expect(screen.getByTestId("expanded").textContent).toBe("");
    act(() => {
      screen.getByText("Toggle Expanded").click();
    });
    expect(screen.getByTestId("expanded").textContent).toBe("expand");
  });
});
