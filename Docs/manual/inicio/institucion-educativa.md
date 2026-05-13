---
title: Acerca de SAAC UNA
---

# Acerca de SAAC UNA

La pantalla Acerca de SAAC UNA muestra informacion institucional general del sistema y datos del equipo de desarrollo.

<div class="module-meta">

**Ruta:** `/institucion-educativa`  
**Archivo principal:** `src/Pages/InstitutionalHomePage.tsx`  
**Acceso:** ruta interna para usuarios autenticados

</div>

## Vista principal

La pantalla muestra el titulo `Acerca de SAAC UNA` y el subtitulo `Sistema de Acreditacion y Autoevaluacion de Carreras`.

El contenido se divide en dos bloques:

| Bloque | Descripcion |
| --- | --- |
| Informacion institucional | Presenta sede, campus y proposito del sistema. |
| Equipo de desarrollo | Presenta tarjetas con integrantes y rol dentro del proyecto. |

## Informacion institucional

El bloque institucional muestra:

| Campo | Valor visible |
| --- | --- |
| Sede | Seccion Regional Central Occidente |
| Campus | Alajuela |
| Proposito | Brindar una herramienta administrativa para organizar, consultar y gestionar informacion asociada a procesos de acreditacion institucional y academica. |

## Equipo de desarrollo

El bloque de equipo muestra tarjetas con:

- Nombre de la persona.
- Rol dentro del proyecto.
- Icono representativo.

## Estados y acciones

Esta pantalla es informativa. No contiene formularios, filtros, modales ni llamadas directas a servicios del backend.

## Reglas importantes para soporte y QA

- La informacion visible esta definida directamente en el componente frontend.
- Si cambian datos institucionales o integrantes del equipo, el ajuste se realiza en `src/Pages/InstitutionalHomePage.tsx`.
- La pantalla no depende del contexto de carrera, ciclo o proceso.
