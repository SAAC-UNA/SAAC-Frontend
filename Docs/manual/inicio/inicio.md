---
title: Inicio
slug: /inicio/panel
---

# Inicio

La pantalla Inicio es el panel principal del sistema despues de iniciar sesion. Muestra el espacio de trabajo activo y accesos rapidos a los modulos que el usuario puede utilizar segun sus roles, permisos y contexto seleccionado.

<div class="module-meta">

**Ruta:** `/`  
**Archivo principal:** `src/Pages/HomePage.tsx`  
**Servicio de contexto:** `src/Services/GlobalFilterContextService.ts`  
**Estado local de contexto:** `src/Services/OperationalContextStore.ts`  
**Acceso en menu:** visible para usuarios autenticados

</div>

## Vista principal

La pantalla muestra el titulo `Panel de Inicio` y adapta su contenido segun el tipo de usuario.

| Tipo de usuario | Comportamiento |
| --- | --- |
| Docente o profesor | Muestra accesos rapidos relacionados con entregas propias, solicitudes de ampliacion propias y busqueda de entregables. No muestra el selector de contexto como paso obligatorio. |
| Superusuario | Muestra un bloque `Espacio de Trabajo` con carrera, sede, ciclo y proceso, ademas de accesos rapidos de administracion y gestion. |
| Usuario operativo | Muestra el contexto de trabajo asociado a la carrera asignada y accesos rapidos a los modulos permitidos. |

## Espacio de Trabajo

El bloque `Espacio de Trabajo` resume el contexto activo:

| Campo | Descripcion |
| --- | --- |
| Carrera | Carrera seleccionada o asignada al usuario. |
| Sede | Sede asociada a la carrera. |
| Ciclo | Ciclo de acreditacion seleccionado. |
| Proceso | Proceso seleccionado dentro del ciclo. |

El boton `Cambiar` abre el selector de contexto en `/selector-procesos`.

Si el usuario no tiene carrera asociada, la pantalla muestra: `Su usuario no tiene una carrera asociada. Solicite la asignacion de carrera para continuar.`

## Mini encabezado de contexto

La pantalla puede mostrar un breadcrumb con los valores activos de:

- Carrera.
- Ciclo.
- Proceso.

Cada elemento permite volver al selector en un paso especifico:

| Elemento | Ruta generada |
| --- | --- |
| Carrera | `/selector-procesos?step=career` |
| Ciclo | `/selector-procesos?step=cycle` |
| Proceso | `/selector-procesos?step=process` |

Para superusuarios se muestra tambien la carrera, porque pueden cambiar entre carreras. Para otros usuarios, la carrera puede venir fijada por su asignacion.

## Accesos rapidos

Los accesos rapidos se calculan desde `getNavigationItems()` usando:

- Roles del usuario.
- Permisos del usuario.
- Ciclo seleccionado.
- Proceso seleccionado.

La pantalla prioriza accesos distintos segun el rol.

| Perfil | Accesos priorizados |
| --- | --- |
| Superusuario | Usuarios, Roles, Bitacora, Gestion de Acreditacion, Gestion de Enlaces e Informes de Acreditacion. |
| Docente | Mis Entregas, Mis Solicitudes y Buscar Entregables. |
| Usuario operativo | Asignar Entregables, Mis Entregas, Gestionar Solicitudes, Mis Solicitudes, Buscar Entregables, Aprobacion de Bloques, Procesos, Ciclos e Informes. |

Cada tarjeta muestra:

| Elemento | Descripcion |
| --- | --- |
| Titulo | Nombre funcional del modulo. |
| Icono | Icono asociado al modulo. |
| Descripcion | Texto descriptivo tomado de `src/Constants/ModuleInfo.ts`. |
| Navegacion | Al hacer clic redirige a la ruta del modulo. |

## Estados de carga y error

| Estado | Comportamiento |
| --- | --- |
| Cargando contexto | Muestra `LoadingSpinner`. |
| Error al cargar contexto | Muestra toast `No se pudo cargar el contexto de trabajo.` |
| Error al cargar tablero TI | Muestra toast `No se pudo cargar el tablero TI con datos reales.` |
| Error al cargar resumen docente | Muestra toast `No se pudo cargar el resumen del docente.` |

## Endpoints usados

La pantalla puede consultar servicios diferentes segun el perfil.

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/contexto/filtros-globales/catalogo` | Obtener carreras, ciclos, procesos y contexto disponible. |
| `GET` | `/admin/users` | Calcular resumen de usuarios para superusuario. |
| `GET` | `/roles` | Calcular resumen de roles para superusuario. |
| `GET` | `/bitacora` | Calcular resumen de bitacora para superusuario. |
| `GET` | Endpoints de solicitudes de ampliacion | Calcular pendientes y rechazadas para superusuario o docente. |
| `GET` | Endpoints de asignaciones de evidencia | Calcular asignaciones activas y completadas para docente. |

## Reglas importantes para soporte y QA

- Inicio siempre aparece en la navegacion principal.
- Las tarjetas no son fijas; dependen de permisos, roles y contexto seleccionado.
- Si no hay ciclo y proceso seleccionados, algunos modulos pueden no aparecer o no estar listos para trabajar.
- El contexto se conserva en `localStorage` bajo la llave `operational-context`.
- La autorizacion definitiva depende del backend; el frontend solo controla visibilidad y navegacion.
