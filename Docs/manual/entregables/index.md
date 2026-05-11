---
title: Entregables
---

# Entregables

El modulo Entregables concentra las pantallas relacionadas con asignacion, carga, revision y busqueda de evidencias o entregables del proceso.

<div class="module-meta">

**Nodo de navegacion:** `evidencias`  
**Comportamiento:** algunas opciones requieren que exista seleccion de ciclo y proceso en el contexto operativo.

</div>

## Submodulos

| Submodulo | Ruta | Condicion de acceso en frontend |
| --- | --- | --- |
| Asignar Entregables | `/entregables/asignar` | Contexto con ciclo y proceso, mas `cap.evidence.assign` o permisos equivalentes |
| Mis Entregas | `/entregables/mias` | `cap.evidence.view` o permisos equivalentes |
| Buscar Entregables | `/entregables/buscar` | Contexto con ciclo y proceso, mas `cap.evidence.assign` o permisos equivalentes |
