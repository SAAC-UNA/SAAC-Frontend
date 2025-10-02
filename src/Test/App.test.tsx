import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
// Nota: Se usará la ruta relativa aquí porque VS Code tiene problemas con @/App, pero Jest sí reconoce el alias
import App from "../App";


test("muestra el título SAAC-UNA", () => {
  render(<App />);
  expect(screen.getByText(/SAAC-UNA/i)).toBeInTheDocument();
});
