---
title: Navegacion y permisos
---

# Navegacion y permisos

La navegacion del frontend se calcula en `src/Navigation.ts` mediante `getNavigationItems`.

## Entrada de acceso

La funcion puede recibir:

- Un rol como texto.
- Una lista de roles.
- Un objeto con roles, permisos y contexto operativo.

El contexto operativo incluye:

```ts
{
  hasOperationalContext?: boolean;
  cycleId?: number | null;
  processId?: number | null;
}
```

Algunas opciones del menu requieren ciclo y proceso seleccionados. En el codigo se evalua como `hasContextualSelection`.

## Regla general

Cada item protegido usa `evaluateAccess` con una combinacion de capacidades y permisos. Si el usuario no cumple la regla, el item no se agrega al menu.

## Nota de seguridad

El menu solo controla visibilidad y experiencia de usuario. La autorizacion definitiva debe ejecutarse en backend.
