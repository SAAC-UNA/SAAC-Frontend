import { render, screen } from "@testing-library/react";
import App from "../App.tsx";


test("muestra el título SAAC-UNA", () => {
  render(<App />);
  expect(screen.getByText(/SAAC-UNA/i)).toBeInTheDocument();
});
