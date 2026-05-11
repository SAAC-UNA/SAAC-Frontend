import { render, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import App from "../App";

jest.mock("@/Components/Ui/Backgrounds/Grainient", () => ({
  Grainient: () => <div data-testid="grainient-background" />,
}));

// Mockeamos el servicio de autenticación para que resuelva sin sesión activa
jest.mock("@/Services/AuthService", () => ({
  authService: {
    checkAuthStatus: jest.fn().mockResolvedValue(null),
    logout: jest.fn().mockResolvedValue(undefined),
  },
}));

// La app arranca en la ruta de login cuando no hay sesion activa
test("muestra el formulario de inicio de sesion", async () => {
  const { container } = render(<App />);
  // Esperar a que el AuthProvider termine de verificar la sesión
  await waitFor(() => {
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
  });
});
