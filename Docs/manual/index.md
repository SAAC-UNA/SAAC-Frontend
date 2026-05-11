---
id: index
title: Manual funcional del frontend
slug: /
---

# Manual funcional del frontend

Este sitio documenta el comportamiento visible del sistema SAAC desde el frontend. La organizacion sigue el menu principal definido en `src/Navigation.ts` y tambien incluye rutas funcionales enlazadas desde botones o acciones internas aunque no aparezcan directamente en la navegacion lateral.

## Como leer este manual

Cada pagina de modulo debe indicar:

- Quienes pueden acceder al modulo.
- Que ruta del frontend abre la pantalla.
- Que acciones puede ejecutar el usuario.
- Que campos, validaciones, botones, estados y mensajes aparecen en pantalla.
- Que servicios o endpoints del backend alimentan la vista.
- Que reglas especiales debe conocer soporte, QA o el equipo funcional.

## Modulos actuales

| Modulo | Submodulos visibles desde navegacion |
| --- | --- |
| Inicio | Inicio |
| Administracion | Roles, Usuarios, Bitacora del Sistema |
| Acreditacion | Gestion de Acreditacion |
| Entregables | Asignar Entregables, Mis Entregas, Buscar Entregables |
| Ampliacion | Mis Solicitudes, Gestionar Solicitudes |
| Compromisos de Mejora | Listado, Configuracion, Detalle |
| Evaluacion | Aprobacion de Bloques |
| Informes | Gestion de Enlaces, Informes de Acreditacion |

## Fuente principal

La fuente inicial de verdad para el arbol de modulos es `src/Navigation.ts`. La cobertura se completa con `src/Constants/ROUTES.ts`, porque algunas pantallas no estan en el menu lateral pero si se abren desde acciones internas. Las reglas de acceso se complementan con `src/Constants/PermissionCapabilities.ts` y los componentes de cada carpeta en `src/Pages`.
