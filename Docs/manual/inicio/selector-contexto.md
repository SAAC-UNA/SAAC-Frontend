---
title: Selector de Contexto
---

# Selector de Contexto

El selector de contexto permite definir la carrera, el ciclo de acreditacion y el proceso con el que trabajara el usuario. Este contexto se usa como filtro transversal para varios modulos del sistema.

<div class="module-meta">

**Ruta principal:** `/selector-procesos`  
**Archivo principal:** `src/Pages/ContextSelector.tsx`  
**Variante con selects:** `src/Pages/Context/GlobalContextSelectionPage.tsx`  
**Servicio:** `src/Services/GlobalFilterContextService.ts`  
**Estado local:** `src/Services/OperationalContextStore.ts`

</div>

## Vista por tarjetas

La ruta `/selector-procesos` presenta un flujo por pasos. El usuario selecciona una tarjeta y avanza al siguiente nivel.

| Paso | Cuando aparece | Resultado |
| --- | --- | --- |
| Carrera | Para superusuarios | Define la carrera y sede de trabajo. |
| Ciclo | Para todos los usuarios con carrera disponible | Define el ciclo de acreditacion activo. |
| Proceso | Despues de seleccionar un ciclo | Define el proceso activo y aplica el contexto. |

El encabezado muestra el nombre del sistema y una instruccion segun el paso actual:

| Paso | Texto funcional |
| --- | --- |
| Carrera | `Selecciona la carrera con la que vas a trabajar.` |
| Ciclo | `Selecciona el ciclo de acreditacion.` |
| Proceso | `Selecciona el proceso en el que trabajaras.` |

## Seleccion de carrera

La carrera se muestra como tarjeta con:

- Nombre de carrera.
- Sede como subtitulo.

Al seleccionar una carrera:

1. Se guarda temporalmente `careerCampusId`.
2. Se limpia cualquier ciclo o proceso anterior.
3. El usuario avanza al paso Ciclo.

Este paso solo se muestra a superusuarios. Para otros perfiles, la carrera se toma del contexto asociado al usuario.

## Seleccion de ciclo

La pantalla lista ciclos activos.

Reglas visibles:

| Condicion | Comportamiento |
| --- | --- |
| Hay carrera seleccionada o fija | Muestra solo ciclos activos de esa carrera. |
| No hay carrera disponible | Puede mostrar ciclos activos disponibles segun catalogo. |
| El usuario selecciona un ciclo | Se guarda `cycleId`, se limpia el proceso anterior y avanza a Proceso. |

La seleccion tambien guarda el nombre del ciclo y el tipo de modelo cuando viene en el catalogo.

## Seleccion de proceso

La pantalla lista procesos activos del ciclo seleccionado.

Al seleccionar un proceso:

1. Se identifica la carrera, ciclo y proceso elegidos.
2. Se llama al backend para guardar el contexto.
3. Se sincroniza el snapshot local con etiquetas visibles.
4. El sistema redirige a `/`.

Mientras guarda, se muestra un overlay con `LoadingSpinner`.

## Boton Volver

El boton `Volver` aparece cuando el usuario puede regresar al paso anterior.

| Desde | Resultado |
| --- | --- |
| Proceso | Limpia ciclo y proceso, y vuelve al paso Ciclo. |
| Ciclo, si es superusuario | Limpia carrera, ciclo y proceso, y vuelve al paso Carrera. |

## Estados vacios

Si no hay tarjetas disponibles, se muestra un estado vacio contextual.

| Paso | Mensaje principal | Accion disponible |
| --- | --- | --- |
| Carrera | `Sin carreras disponibles` | Indica contactar al administrador del sistema. |
| Ciclo | `Sin ciclos de acreditacion` | Boton `Ir a Ciclos de Acreditacion`. |
| Proceso | `Sin procesos para este ciclo` | Boton `Ir a Procesos de Acreditacion`. |

## Variante con selects

Existe una variante implementada en `GlobalContextSelectionPage`.

Esta pantalla usa tres campos tipo select:

| Campo | Reglas |
| --- | --- |
| Carrera | Lista carreras como `Carrera - Sede`. |
| Ciclo | Se habilita despues de seleccionar carrera y muestra ciclos activos. |
| Proceso | Se habilita despues de seleccionar ciclo y muestra procesos activos. |

El boton `Continuar` solo se habilita cuando carrera, ciclo y proceso tienen valor. El boton `Limpiar seleccion` elimina el contexto guardado.

Los docentes o profesores son redirigidos a Inicio cuando intentan entrar a esta variante.

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/contexto/filtros-globales/catalogo` | Obtener carreras, ciclos, procesos y contexto disponible. |
| `PUT` | `/contexto/filtros-globales` | Guardar carrera, ciclo y proceso seleccionados. |
| `DELETE` | `/contexto/filtros-globales` | Limpiar contexto seleccionado desde la variante con selects. |

Payload enviado al guardar:

```ts
{
  career_campus_id: number | null;
  ciclo_acreditacion_id: number | null;
  proceso_id: number | null;
}
```

## Persistencia del contexto

El frontend guarda una copia local en `localStorage` con la llave `operational-context`.

La estructura esperada incluye:

```ts
{
  careerCampusId: number | null;
  cycleId: number | null;
  processId: number | null;
  careerLabel: string | null;
  campusLabel: string | null;
  cycleLabel: string | null;
  processLabel: string | null;
  cycleModelType: string | null;
}
```

Cada actualizacion emite el evento `saac:global-filter-context-changed`, usado por otros componentes para refrescar el contexto visible.

## Reglas importantes para soporte y QA

- Para trabajar correctamente se debe completar carrera, ciclo y proceso.
- Solo los ciclos con estado `activo` aparecen como seleccionables.
- Solo los procesos con `activo: true` aparecen como seleccionables.
- Cambiar carrera limpia ciclo y proceso.
- Cambiar ciclo limpia proceso.
- Si el contexto local queda corrupto, reiniciar la seleccion o limpiar `operational-context` en el navegador puede resolver inconsistencias visuales.
