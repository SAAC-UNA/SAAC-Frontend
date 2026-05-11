---
title: Como ejecutar el manual
---

# Como ejecutar el manual

El manual esta montado con Docusaurus dentro del mismo repositorio del frontend.

## Desarrollo local

```bash
npm run docs:dev
```

Este comando abre un servidor local para navegar y editar la documentacion.

## Build estatico

```bash
npm run docs:build
```

Este comando genera el sitio estatico en `build`.

## Nota sobre Node

Docusaurus debe ejecutarse con una version estable/LTS de Node. En este equipo se probo con Node `v24.13.1` y el build llego a compilar cliente y servidor, pero fallo durante el render estatico con `require.resolveWeak is not a function`.

Para generar el build estatico, usar Node LTS, preferiblemente Node 20 o Node 22.
