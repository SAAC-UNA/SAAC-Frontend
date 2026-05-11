---
title: Asignar Entregables
---

# Asignar Entregables

El submodulo Asignar Entregables permite asignar evidencias o elementos de un modelo flexible a usuarios y roles dentro del proceso operativo seleccionado.

<div class="module-meta">

**Ruta:** `/entregables/asignar`  
**Archivo principal:** `src/Pages/EvidenceAssignment/EvidenceAssignment.tsx`  
**Componente de vista:** `src/Pages/EvidenceAssignment/Components/EvidenceAssignmentView.tsx`  
**Servicio:** `src/Services/EvidenceAssignmentService.ts`  
**Acceso en menu:** `cap.evidence.assign` o permisos `evidencias.assign`, `asignaciones.create`, `asignaciones.edit`  
**Requiere contexto:** ciclo y proceso seleccionados

</div>

## Vista principal

La pantalla muestra un formulario de asignacion dividido en secciones. El encabezado usa la informacion contextual del modulo y muestra el boton `Asignar`.

Secciones visibles:

| Seccion | Descripcion |
| --- | --- |
| Asignaciones | Permite seleccionar criterios/evidencias o elementos flexibles, segun el modelo del proceso. |
| Destinatarios | Permite seleccionar usuarios y roles que recibiran la asignacion. |
| Fecha limite | Campo opcional para definir fecha maxima de entrega. |
| Comentario | Campo opcional para instrucciones o contexto de la asignacion. |
| Resumen de asignaciones | Tabla previa con entregables, destinatarios y fecha limite. |
| Duplicados | Alertas y tablas cuando existen asignaciones previas para los mismos usuarios/evidencias. |

## Contexto operativo

La pantalla toma el proceso activo desde `getOperationalContextSnapshot()`.

Reglas:

| Regla | Comportamiento |
| --- | --- |
| Sin proceso seleccionado | El formulario no puede enviarse y muestra `Debe seleccionar un proceso`. |
| Cambio de contexto | La pantalla escucha `GLOBAL_FILTER_CONTEXT_CHANGED_EVENT` y sincroniza el proceso seleccionado. |
| Proceso no disponible | Si el proceso del contexto no esta dentro de los procesos cargados, se limpia la seleccion. |
| Cambio de proceso | Se limpian criterios, evidencias, elementos y exclusiones que dependian del proceso anterior. |

## Modo tradicional y modo flexible

El comportamiento depende del tipo de modelo asociado al proceso seleccionado.

| Tipo de modelo | Seleccion principal | Endpoint de creacion |
| --- | --- | --- |
| Tradicional | Criterios y evidencias | `POST /evidencias-asignaciones` |
| `elemento_flexible` | Elementos del modelo flexible | `POST /elementos-asignaciones` |

El frontend detecta el modo usando `modelo_estructura_tipo` del proceso.

## Asignaciones en modelo tradicional

En modo tradicional, el usuario primero selecciona criterios y luego evidencias.

Flujo:

1. Seleccionar uno o varios criterios de evaluacion.
2. El sistema filtra las evidencias disponibles segun esos criterios.
3. Seleccionar una o varias evidencias.
4. Seleccionar usuarios y/o roles destinatarios.
5. Opcionalmente definir fecha limite y comentario.
6. Revisar resumen.
7. Confirmar asignacion.

Campos visibles:

| Campo | Obligatorio | Comportamiento |
| --- | --- | --- |
| Criterios de Evaluacion | Si, para habilitar evidencias | Permite seleccion multiple y seleccionar/deseleccionar todos. |
| Evidencias a asignar | Si | Permanece deshabilitado hasta seleccionar al menos un criterio. |
| Usuarios | No, si hay roles | Seleccion multiple de usuarios del catalogo. |
| Roles | No, si hay usuarios | Seleccion multiple de roles; todos los usuarios del rol reciben la asignacion. |
| Fecha limite | No | Debe ser posterior a hoy si se define. |
| Comentario | No | Maximo 500 caracteres, con contador. |

## Asignaciones en modelo flexible

En modo flexible, la pantalla reemplaza criterios/evidencias por un selector encadenado de elementos.

Reglas:

| Regla | Comportamiento |
| --- | --- |
| Carga de elementos | Se consulta `/estructura/elementos` con `modelo_estructura_id`. |
| Elementos asignables | Se usan hojas y padres directos de hojas para simular el flujo tradicional de criterio a evidencia. |
| Seleccion requerida | Debe seleccionarse al menos un elemento. |
| Creacion | Se crea una asignacion por cada elemento seleccionado. |

El resumen muestra el breadcrumb del elemento y usa el texto `Elemento` como encabezado de columna.

## Destinatarios

La seccion Destinatarios permite asignar a usuarios especificos, roles completos o ambos.

| Campo | Fuente | Comportamiento |
| --- | --- | --- |
| Usuarios | `GET /evidencias-asignaciones/catalogo/usuarios` | Muestra nombre y correo. Permite seleccionar todos. |
| Roles | `GET /evidencias-asignaciones/catalogo/roles` | Muestra el rol y la cantidad de usuarios asociados. Permite seleccionar todos. |

Si falla la carga de usuarios o roles, la seccion correspondiente muestra `BackendErrorAlert` con opcion de reintento.

Regla de validacion:

```txt
Debe seleccionar al menos un usuario o rol
```

## Fecha limite

La fecha limite es opcional.

Reglas:

| Regla | Comportamiento |
| --- | --- |
| Sin fecha | La asignacion se crea sin `fecha_limite`. |
| Fecha igual o anterior a hoy | Muestra `La fecha limite debe ser posterior a hoy`. |
| Fecha valida | Se envia como `fecha_limite`. |

La interfaz usa `DateRangePicker` en modo compacto e inline, pero solo utiliza la fecha final (`to`) como fecha limite.

## Comentario

El comentario es opcional y sirve para agregar instrucciones a los destinatarios.

Campo visible:

```txt
Comentario sobre la Asignacion
```

Placeholder:

```txt
Anada instrucciones especiales, contexto o notas sobre esta asignacion...
```

El comentario usa contador de caracteres y maximo de 500 caracteres.

## Resumen de asignaciones

La tabla `Resumen de asignaciones` muestra una vista previa antes de confirmar.

Columnas:

| Columna | Descripcion |
| --- | --- |
| Evidencia o Elemento | Breadcrumb del criterio/evidencia o del elemento flexible. |
| Destinatarios | Avatares de usuarios y roles seleccionados. |
| Fecha limite | Fecha formateada si existe; si no, muestra guion. |

Estado vacio:

| Modo | Mensaje |
| --- | --- |
| Tradicional | `Selecciona criterios y evidencias para ver el resumen` |
| Flexible | `Selecciona elementos para ver el resumen` |

## Validacion de duplicados

En modo tradicional, cuando hay proceso, evidencias y usuarios seleccionados, el frontend valida duplicados por cada evidencia.

Endpoint:

```txt
POST /evidencias-asignaciones/validar-duplicados
```

Mientras valida, muestra:

```txt
Validando asignaciones existentes...
```

### Duplicados activos

Si existen asignaciones activas, se muestra la tabla `Asignaciones Duplicadas`.

Comportamiento:

- Agrupa duplicados por usuario.
- Muestra evidencias duplicadas en filas expandibles.
- Excluye automaticamente a usuarios con asignaciones pendientes o en progreso.
- Informa que no se pueden reasignar mientras no esten completadas o canceladas.

Mensaje funcional:

```txt
Bloqueado automaticamente: Estos usuarios fueron excluidos; ya tienen evidencias asignadas en estado activo.
```

### Evidencias ya completadas

Si existen duplicados en estado completado, se muestra la tabla `Evidencias Ya Completadas`.

Comportamiento:

- Permite decidir si se reasignan evidencias ya completadas.
- Incluye seleccion por usuario.
- Incluye seleccion individual por evidencia.
- Incluye opcion `Seleccionar todos`.

Mensaje funcional:

```txt
Reasignacion permitida: Estos usuarios ya completaron estas evidencias. Marquelos si desea reasignarlas para crear una nueva asignacion.
```

## Confirmacion y exito

Al presionar `Asignar`, el frontend valida el formulario.

Si hay errores, muestra toast:

```txt
Error de validacion
Por favor, revise los datos ingresados
```

Si la validacion pasa, se abre un modal de confirmacion.

| Modo | Titulo | Mensaje |
| --- | --- | --- |
| Tradicional | `Confirmar asignacion de evidencias` | Pregunta si desea asignar la cantidad de evidencias seleccionadas. |
| Flexible | `Confirmar asignacion de elementos` | Pregunta si desea asignar la cantidad de elementos seleccionados. |

Al confirmar:

- En modo tradicional, crea asignaciones en paralelo por evidencia.
- En modo flexible, crea asignaciones en paralelo por elemento.
- Si la operacion finaliza correctamente, muestra `Asignacion completada`.
- Limpia selecciones de entregables, destinatarios, fecha limite y comentario.
- Mantiene el proceso seleccionado en modo tradicional.

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/estructura/criterios` | Cargar criterios para modelo tradicional. |
| `GET` | `/estructura/evidencias` | Cargar evidencias para modelo tradicional. |
| `GET` | `/estructura/procesos` | Cargar procesos y detectar tipo de modelo. |
| `GET` | `/estructura/elementos` | Cargar elementos de modelo flexible. |
| `GET` | `/evidencias-asignaciones/catalogo/usuarios` | Cargar usuarios destinatarios. |
| `GET` | `/evidencias-asignaciones/catalogo/roles` | Cargar roles destinatarios. |
| `POST` | `/evidencias-asignaciones/validar-duplicados` | Validar duplicados antes de asignar evidencias. |
| `POST` | `/evidencias-asignaciones` | Crear asignaciones de evidencias. |
| `POST` | `/elementos-asignaciones` | Crear asignaciones de elementos flexibles. |

## Datos principales

Formulario interno:

```ts
interface EvidenceAssignmentFormData {
  proceso_id: number | null;
  criterio_id: number | null;
  selectedCriteria: number[];
  selectedEvidences: number[];
  selectedElements: number[];
  selectedUsers: number[];
  selectedRoles: number[];
  fecha_limite?: string;
  comentario?: string;
  excludedUsers?: number[];
}
```

Payload tradicional:

```ts
interface EvidenceAssignmentRequest {
  proceso_id: number;
  evidencia_id: number;
  usuarios?: number[];
  roles?: number[];
  fecha_limite?: string;
  comentario?: string;
}
```

Payload flexible:

```ts
{
  proceso_id: number;
  elemento_id: number;
  usuarios?: number[];
  roles?: number[];
  fecha_limite?: string;
  comentario?: string;
}
```

## Estados de carga y error

| Estado | Comportamiento |
| --- | --- |
| Cargando catalogos | Muestra `LoadingSpinner` dentro de una tarjeta. |
| Error al cargar usuarios | Muestra `BackendErrorAlert` y permite reintentar usuarios. |
| Error al cargar roles | Muestra `BackendErrorAlert` y permite reintentar roles. |
| Validando duplicados | Muestra aviso de validacion en progreso. |
| Error de validacion local | Muestra mensajes sobre el formulario y toast de error. |
| Error al asignar | Muestra toast `Error al asignar` con el mensaje disponible. |

## Reglas importantes para soporte y QA

- La opcion del menu requiere ciclo y proceso seleccionados.
- La pantalla no muestra selector visible de proceso; toma el proceso desde el contexto operativo.
- En modelo tradicional se asignan evidencias; en modelo flexible se asignan elementos.
- En modelo tradicional, los duplicados activos bloquean reasignacion automatica para esos usuarios.
- Las evidencias completadas pueden reasignarse si el usuario las mantiene seleccionadas.
- La fecha limite es opcional, pero si se define debe ser posterior a hoy.
- Debe seleccionarse al menos un usuario o un rol.
- La autorizacion final debe mantenerse en backend; el frontend controla flujo y validaciones visibles.
