---
title: Compromisos de Mejora
---

# Compromisos de Mejora

El modulo Compromisos de Mejora agrupa las pantallas para listar, configurar y consultar compromisos asociados a procesos, criterios, evidencias o elementos flexibles.

## Submodulos y rutas

| Submodulo | Ruta | Condicion de acceso en frontend |
| --- | --- | --- |
| Listado de compromisos | `/compromisos` | `cap.improvement.access` o permisos `compromisos_mejora.view/create/edit` |
| Configurar compromiso | `/compromisos/nuevo` | Permiso `compromisos_mejora.create` |
| Editar compromiso | `/compromisos/editar` | Permiso `compromisos_mejora.edit` |
| Detalle del compromiso | `/compromisos/detalle` | `cap.improvement.access` o permisos `compromisos_mejora.view/create/edit` |

Estas rutas no aparecen actualmente como grupo propio en `src/Navigation.ts`, pero son pantallas del sistema enlazadas desde otras acciones, especialmente desde Procesos de Acreditacion.
