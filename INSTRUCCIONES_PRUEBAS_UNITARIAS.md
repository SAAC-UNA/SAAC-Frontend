# Pruebas Unitarias en el Frontend (React + TypeScript)

## Dependencias instaladas
- `jest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `ts-jest`
- `@types/jest`

## ¿Qué debes probar?
- **Renderizado de componentes**: Que los componentes muestran el contenido esperado según las props y el estado.
- **Eventos e interacción**: Que los eventos de usuario (click, input, submit) producen los cambios esperados.
- **Lógica de hooks y utilidades**: Que los hooks personalizados y funciones devuelven los valores correctos.
- **Renderizado condicional**: Que la UI cambia correctamente según el estado o las props.
- **Integración básica**: Que los componentes se comunican correctamente (props, callbacks).

## ¿Cómo crear y ejecutar pruebas?

1. **Crear archivos de prueba**
   - Crea archivos con el sufijo `.test.tsx` o `.test.ts` junto a tus componentes, por ejemplo: `App.test.tsx`.

2. **Ejemplo básico de prueba**

```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza el texto principal', () => {
  render(<App />);
  expect(screen.getByText(/react/i)).toBeInTheDocument();
});
```

3. **Configurar Jest (si es necesario)**
   - Puedes agregar un archivo `jest.config.js`:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
};
```

4. **Ejecutar las pruebas**
   - Agrega en `package.json` el script:
     ```json
     "test": "jest"
     ```
   - Ejecuta en terminal:
     ```sh
     npm test
     ```

## ¿Cómo puede ayudarte GitHub Copilot (agent)?
- Puede generar archivos de prueba automáticamente para tus componentes.
- Puede sugerir casos de prueba para lógica, hooks y utilidades.
- Puede ayudarte a depurar errores de pruebas y mejorar la cobertura.

---

**Recomendación:**
Comienza probando los componentes principales (`App.tsx`) y luego los componentes más pequeños y funciones reutilizables.
