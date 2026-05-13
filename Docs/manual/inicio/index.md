---
title: Inicio y Contexto
---

# Inicio y Contexto

Esta seccion documenta las pantallas transversales que preparan el espacio de trabajo del usuario antes de ingresar a los modulos operativos del sistema.

Incluye:

| Pagina | Proposito |
| --- | --- |
| Inicio | Presentar el panel inicial, el contexto activo y los accesos rapidos segun rol y permisos. |
| Selector de Contexto | Seleccionar carrera, ciclo de acreditacion y proceso de trabajo. |
| Acerca de SAAC UNA | Mostrar informacion institucional y del equipo del sistema. |

## Rutas incluidas

| Ruta | Pantalla |
| --- | --- |
| `/` | Panel de Inicio |
| `/selector-procesos` | Selector de contexto de trabajo por tarjetas |
| `/institucion-educativa` | Acerca de SAAC UNA |

## Relacion con otros modulos

El contexto seleccionado en esta seccion afecta la informacion disponible en varios modulos, especialmente entregables, ampliacion, aprobacion de bloques, informes, ciclos y procesos de acreditacion.

Cuando el sistema necesita saber sobre que carrera, ciclo y proceso trabaja el usuario, toma esos valores del contexto operacional guardado por el frontend y sincronizado con el backend.
