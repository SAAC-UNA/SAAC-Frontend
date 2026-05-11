---
title: Mis Entregas
---

# Mis Entregas

Mis Entregas permite al usuario autenticado consultar los entregables que tiene asignados, subir archivos o enlaces, revisar detalles, cambiar estados y solicitar ampliaciones de plazo.

<div class="module-meta">

**Ruta:** `/entregables/mias`  
**Archivo principal:** `src/Pages/MyEvidence/MyEvidenceAssignmentsPage.tsx`  
**Componentes clave:** `EvidenceAssignmentsTable`, `ElementAssignmentsTable`, `EvidenceAssignmentDetail`, `ElementAssignmentDetailModal`, `EvidenceUploadPage`, `ElementUploadPage`, `CreateExtensionRequestModal`  
**Servicio principal:** `src/Services/EvidenceAssignmentService.ts`  
**Acceso en menu:** `cap.evidence.view` o permisos `evidencias.view`, `asignaciones.view`

</div>

## Vista principal

La pantalla carga las asignaciones del usuario autenticado y decide si debe mostrar entregables de modelo tradicional o elementos de modelo flexible segun el ciclo seleccionado.

Elementos principales:

| Elemento | Descripcion |
| --- | --- |
| Encabezado | Muestra titulo, descripcion y breadcrumb contextual del proceso. |
| Selector de proceso de acreditacion | Aparece si el usuario tiene asignaciones en mas de una carrera. |
| Buscador | Aparece cuando hay asignaciones disponibles para buscar. |
| Tabla tradicional | Muestra evidencias asignadas. |
| Tabla flexible | Muestra elementos asignados. |
| Modales | Permiten ver detalle, subir recursos, pedir ampliacion y confirmar reversion de estado. |

## Carga inicial

Al montar la pantalla se ejecutan tres cargas:

| Carga | Servicio | Uso |
| --- | --- | --- |
| Evidencias asignadas | `getMyAssignments(userId, true)` | Cargar asignaciones tradicionales. |
| Elementos asignados | `getMyElementAssignments(userId, true)` | Cargar asignaciones de modelo flexible. |
| Ciclos del usuario | `getUserCycles(userId)` | Construir selector de ciclo/proceso y determinar tipo de modelo. |

La pantalla tambien escucha `visibilitychange`. Cuando el usuario vuelve a la pestaña del navegador, recarga asignaciones tradicionales y flexibles.

Si no se puede obtener el ID del usuario autenticado, muestra error:

```txt
No se pudo obtener la informacion del usuario
```

## Selector de ciclo o proceso

La pantalla construye una lista de ciclos disponibles. Usa como fuente principal `/usuarios/:id/mis-ciclos`; si falla, intenta inferir ciclos desde las asignaciones cargadas.

El selector aparece solo si el usuario tiene asignaciones en mas de una carrera.

Formato de opcion:

```txt
Sede / Carrera / Ciclo
```

Al cambiar de ciclo:

- Se actualiza `selectedCycleId`.
- Se reinicia la paginacion a la pagina 1.
- Se decide si la tabla activa es tradicional o flexible.

## Contexto desde URL

La pantalla puede recibir parametros por URL:

| Parametro | Uso |
| --- | --- |
| `ciclo_acreditacion_id` | Intenta seleccionar directamente el ciclo indicado. |
| `proceso_id` | Intenta localizar el ciclo relacionado con ese proceso. |

Si el ciclo o proceso indicado existe entre las asignaciones disponibles, se aplica la seleccion automaticamente.

## Busqueda

El buscador aparece cuando hay asignaciones para el modo activo.

Placeholder:

| Modo | Placeholder |
| --- | --- |
| Tradicional | `Buscar evidencias...` |
| Flexible | `Buscar elementos...` |

En modelo tradicional, la busqueda filtra por:

- Nomenclatura o descripcion de evidencia.
- Nomenclatura o descripcion de criterio.
- Estado visible o tecnico.
- Fecha de asignacion.
- Fecha limite.

En modelo flexible, la busqueda filtra por:

- Nombre, nomenclatura o descripcion del elemento.
- Nombre del proceso.
- Estado.
- Fecha limite.

## Tabla de evidencias tradicionales

La tabla tradicional usa `EvidenceAssignmentsTable`.

Columnas:

| Columna | Descripcion |
| --- | --- |
| Evidencia | Muestra nomenclatura y descripcion de la evidencia; debajo muestra criterio. |
| Fecha Asignacion | Fecha en que se asigno la evidencia. |
| Fecha Limite | Fecha limite o `Sin limite`; se resalta si esta vencida. |
| Estado | Badge de estado, considerando vencimiento dinamico. |
| Acciones | Ver detalles, subir archivos, marcar completado/en progreso y solicitar/cancelar ampliacion. |

Estado vacio:

| Caso | Mensaje |
| --- | --- |
| Con busqueda/filtros | `No se encontraron asignaciones que coincidan con los filtros aplicados.` |
| Sin asignaciones | `No tienes evidencias asignadas. Cuando se te asigne una evidencia, aparecera aqui.` |

## Tabla de elementos flexibles

La tabla flexible usa `ElementAssignmentsTable`.

Columnas:

| Columna | Descripcion |
| --- | --- |
| Elemento | Muestra nombre del elemento y, si esta disponible, su ruta jerarquica. |
| Fecha Asignacion | Fecha de creacion de la asignacion. |
| Fecha Limite | Fecha limite o `Sin limite`; se resalta si el estado es `Vencido`. |
| Estado | Badge de estado del elemento. |
| Acciones | Ver detalles, subir archivos, solicitar/cancelar ampliacion y marcar completado/en progreso. |

Estado vacio:

| Caso | Mensaje |
| --- | --- |
| Con busqueda/filtros | `No se encontraron elementos que coincidan con los filtros aplicados.` |
| Sin asignaciones | `No tienes elementos asignados. Cuando se te asigne un elemento, aparecera aqui.` |

## Estados de asignacion

### Modelo tradicional

Estados tecnicos esperados:

- `pendiente`
- `en_progreso`
- `completado`
- `vencido`

Reglas visibles:

| Regla | Comportamiento |
| --- | --- |
| Vencida | Si la fecha limite ya paso y no esta completada, se muestra como vencida. |
| Devuelta por rechazo | Si esta pendiente y `is_returned_for_changes` es verdadero, muestra tooltip `Devuelta por rechazo`. |
| Completar | Solo se permite marcar completada si `has_uploaded_files` es verdadero. |
| Revertir | Si esta completada, puede revertirse a `en_progreso` con confirmacion. |

### Modelo flexible

Estados visibles esperados:

- `Pendiente`
- `En Progreso`
- `Completado`
- `Vencido`

Reglas visibles:

| Regla | Comportamiento |
| --- | --- |
| Completar | Solo se permite marcar completado si tiene al menos un archivo o enlace. |
| Revertir | Si esta completado, puede revertirse a `En Progreso` con confirmacion. |
| Devuelta por rechazo | Si esta pendiente y `is_returned_for_changes` es verdadero, muestra tooltip `Devuelta por rechazo`. |

## Ver detalles

### Detalle de evidencia tradicional

El modal `EvidenceAssignmentDetail` carga el detalle por ID.

Muestra:

- Estado.
- Fecha de asignacion.
- Fecha limite.
- Alerta si esta vencida o proxima a vencer.
- Criterio asociado.
- Instrucciones del encargado, si hay comentario.
- Retroalimentacion recibida.
- Archivos subidos.

Tambien permite eliminar archivos desde la lista de archivos.

### Detalle de elemento flexible

El modal `ElementAssignmentDetailModal` carga el detalle por ID.

Muestra:

- Estado.
- Fecha de asignacion.
- Fecha limite.
- Alerta si esta vencido o proximo a vencer.
- Jerarquia del elemento, incluyendo ancestros cuando estan disponibles.
- Instrucciones del encargado.
- Retroalimentacion recibida.
- Archivos subidos.

Tambien permite eliminar archivos asociados al elemento.

## Subir archivos y enlaces

La accion Subir archivos abre un modal de carga.

| Modo | Modal | Servicio |
| --- | --- | --- |
| Tradicional | `EvidenceUploadPage` | `FileService` |
| Flexible | `ElementUploadPage` | `EvidenceAssignmentService` |

Ambos modales permiten:

- Seleccionar archivos.
- Agregar enlaces externos.
- Ver progreso de subida.
- Consultar archivos ya subidos.
- Actualizar la lista de archivos.
- Eliminar archivos existentes.

Reglas visibles:

| Regla | Comportamiento |
| --- | --- |
| Sin archivos ni enlaces | Muestra advertencia y no sube nada. |
| Durante subida | Bloquea el cierre del modal. |
| Subida exitosa | Muestra toast de exito y recarga archivos/asignaciones. |
| Subida parcial | Muestra toast de advertencia. |
| Fallo total | Muestra toast de error. |

## Solicitudes de ampliacion

El boton de reloj permite solicitar o cancelar ampliaciones de plazo.

### Solicitar ampliacion

Puede solicitarse cuando:

- No existe solicitud pendiente.
- El estado permite accion.

Estados permitidos:

| Modo | Estados |
| --- | --- |
| Tradicional | `pendiente`, `en_progreso` |
| Flexible | `Pendiente`, `En Progreso` |

El modal solicita:

| Campo | Validacion |
| --- | --- |
| Motivo | Obligatorio, minimo 10 caracteres, maximo 300. |
| Nueva fecha limite solicitada | Obligatoria y posterior a hoy. |

Tambien muestra la fecha limite actual cuando existe.

### Cancelar ampliacion

Si ya existe una solicitud pendiente, el mismo boton cambia de comportamiento y permite cancelarla.

Endpoints:

| Modo | Endpoint |
| --- | --- |
| Tradicional | `PATCH /solicitudes-ampliacion-tiempo/:id/cancelar` |
| Flexible | `PATCH /solicitudes-ampliacion-elemento/:id/cancelar` |

Si el backend indica que ya existe una solicitud pendiente al intentar crear otra, la pantalla muestra mensaje de solicitud duplicada, cierra el modal y recarga asignaciones.

## Cambiar estado

### Marcar como completada

La accion de completar solo se habilita si hay al menos un archivo o enlace subido.

Si el usuario intenta completar sin recursos, se muestra:

```txt
Debe subir al menos un archivo o enlace antes de marcar como completada.
```

### Revertir a en progreso

Si la asignacion ya esta completada, la accion solicita confirmacion antes de revertir.

Titulo tradicional:

```txt
Revertir estado de evidencia
```

Titulo flexible:

```txt
Revertir estado de elemento
```

La confirmacion indica que la entrega dejara de estar marcada como completada.

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/usuarios/:id/evidencias-asignadas` | Cargar evidencias asignadas al usuario. |
| `GET` | `/usuarios/:id/elementos-asignados` | Cargar elementos asignados al usuario. |
| `GET` | `/usuarios/:id/mis-ciclos` | Cargar ciclos donde el usuario tiene asignaciones. |
| `GET` | `/evidencias-asignaciones/:id` | Obtener detalle de evidencia asignada. |
| `PUT` | `/evidencias-asignaciones/:id` | Actualizar estado de evidencia asignada. |
| `GET` | `/elementos-asignaciones/:id` | Obtener detalle de elemento asignado. |
| `PATCH` | `/elementos-asignaciones/:id` | Actualizar estado de elemento asignado. |
| `GET` | `/estructura/elementos` | Cargar jerarquia de elementos flexibles. |
| `POST` | `/solicitudes-ampliacion` | Crear solicitud de ampliacion tradicional. |
| `POST` | `/elementos-asignaciones/:id/solicitud-ampliacion` | Crear solicitud de ampliacion para elemento flexible. |
| `PATCH` | `/solicitudes-ampliacion-tiempo/:id/cancelar` | Cancelar solicitud tradicional pendiente. |
| `PATCH` | `/solicitudes-ampliacion-elemento/:id/cancelar` | Cancelar solicitud flexible pendiente. |
| `GET` | `/elementos-archivos` | Listar archivos de elemento flexible. |
| `POST` | `/elementos-archivos` | Subir archivos o enlaces de elemento flexible. |
| `DELETE` | `/elementos-archivos/:id` | Eliminar archivo de elemento flexible. |

La carga y eliminacion de archivos tradicionales se realiza mediante `FileService` usando evidencia, proceso y usuario cuando aplica.

## Datos principales

Asignacion tradicional:

```ts
interface EvidenceAssignment {
  evidencia_asignacion_id: number;
  proceso_id: number;
  evidencia_id: number;
  usuario_id: number;
  estado: "pendiente" | "en_progreso" | "completado" | "vencido";
  fecha_asignacion: string;
  fecha_limite: string | null;
  comentario: string | null;
  has_pending_extension_request?: boolean;
  pending_extension_request_id?: number | null;
  has_uploaded_files?: boolean;
  is_returned_for_changes?: boolean;
}
```

Asignacion flexible:

```ts
interface FlexibleAssignmentItem {
  elemento_asignacion_id: number;
  elemento_id: number;
  usuario_id: number;
  proceso_id: number;
  estado: string;
  fecha_limite: string | null;
  comentario: string | null;
  has_pending_extension_request?: boolean;
  pending_extension_request_id?: number | null;
  has_uploaded_files?: boolean;
  is_returned_for_changes?: boolean;
}
```

## Estados de carga y error

| Estado | Comportamiento |
| --- | --- |
| Carga inicial | Muestra `LoadingSpinner` si todavia no hay ciclo seleccionado. |
| Sin asignaciones | Muestra `No tienes asignaciones en ningun proceso de acreditacion.` |
| Error tradicional | Muestra `BackendErrorAlert` con reintento a `loadAssignments`. |
| Error flexible | Muestra `BackendErrorAlert` con reintento a `loadFlexAssignments`. |
| Error al cargar detalle | Muestra toast de error y cierra el modal. |
| Error al cambiar estado | Muestra toast `No se pudo actualizar el estado`. |
| Error al solicitar ampliacion | Muestra toast con mensaje del backend o mensaje de duplicado. |

## Reglas importantes para soporte y QA

- La pantalla muestra evidencias tradicionales o elementos flexibles segun el ciclo seleccionado.
- Si hay mas de una carrera, aparece selector de proceso de acreditacion.
- Para completar una entrega debe existir al menos un archivo o enlace subido.
- Una entrega completada puede revertirse a en progreso con confirmacion.
- Una solicitud de ampliacion pendiente puede cancelarse desde la misma accion de reloj.
- Las fechas proximas o vencidas se resaltan en detalle.
- Los archivos pueden eliminarse desde el detalle o desde el modal de subida.
- La autorizacion final debe mantenerse en backend; el frontend controla flujo, estados visibles y validaciones locales.
