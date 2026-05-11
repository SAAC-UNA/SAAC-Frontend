---
title: Administracion
---

# Administracion

El modulo Administracion agrupa las herramientas para configurar seguridad, usuarios y trazabilidad del sistema.

<div class="module-meta">

**Origen en frontend:** `src/Navigation.ts`  
**Nodo de navegacion:** `administracion`  
**Comportamiento:** el grupo solo aparece si el usuario tiene acceso al menos a uno de sus submodulos.

</div>

## Submodulos

| Submodulo | Ruta | Condicion de acceso en frontend |
| --- | --- | --- |
| Roles | `/roles` | Capacidad `cap.admin.roles.manage` o permisos de gestion de roles |
| Usuarios | `/usuarios` | Capacidad `cap.admin.users.manage` o permisos de gestion de usuarios |
| Bitacora del Sistema | `/bitacora` | Capacidad `cap.audit.view` o permiso `bitacora.view` |

## Uso esperado

Administracion debe ser usado por perfiles responsables de mantener la configuracion operativa del sistema. Desde aqui se crean roles personalizados, se gestionan usuarios y se consulta la actividad registrada por la aplicacion.
