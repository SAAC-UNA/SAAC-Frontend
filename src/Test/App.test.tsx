import { render } from "@testing-library/react";
import '@testing-library/jest-dom';
import App from "../App";

// La app arranca en la ruta de login cuando no hay sesion activa
test("muestra el formulario de inicio de sesion", () => {
  const { container } = render(<App />);
  // El login siempre renderiza un campo de tipo password
  expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
});
