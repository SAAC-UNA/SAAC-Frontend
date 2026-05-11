---
title: Acreditacion
---

# Acreditacion

El modulo Acreditacion agrupa la configuracion y gestion del proceso de acreditacion.

<div class="module-meta">

**Nodo de navegacion:** `acreditacion`  
**Comportamiento:** aparece cuando el usuario puede consultar la configuracion de acreditacion o los procesos asociados al contexto seleccionado.

</div>

## Submodulos

| Submodulo | Ruta | Condicion de acceso en frontend |
| --- | --- | --- |
| Gestion de Acreditacion | `/acreditacion` | `cap.accreditation.model.view`, `cap.accreditation.cycle.view` o, con ciclo seleccionado, `cap.accreditation.process.view` |
| Modelos de Acreditacion | `/acreditacion?seccion=modelos`, `/estructura/modelos` | `cap.accreditation.model.view` o `modelos.view` |
| Ciclos de Acreditacion | `/acreditacion?seccion=ciclos`, `/ciclos-acreditacion` | `cap.accreditation.cycle.view` o `ciclos.view` |
| Procesos de Acreditacion | `/acreditacion?seccion=procesos`, `/procesos-acreditacion` | `cap.accreditation.process.view` o `procesos.view` |
| Estructura Institucional | `/acreditacion?seccion=estructura`, `/institucion-educativa` | Permisos de estructura institucional |
