---
title: Mis Solicitudes
---

# Mis Solicitudes

El submodulo Mis Solicitudes permite al usuario consultar el estado de sus solicitudes de ampliacion de plazo, revisar el detalle de cada una y cancelar solicitudes pendientes.

<div class="module-meta">

**Ruta:** `/solicitudes-ampliacion/mias`  
**Archivo principal:** `src/Pages/MyExtensionRequest/MyExtensionRequestsPage.tsx`  
**Componentes:** `src/Pages/MyExtensionRequest/Components`  
**Servicios:** `src/Services/ExtensionRequestService.ts`, `src/Services/FlexibleExtensionRequestService.ts`  
**Acceso en menu:** `cap.extension.view` o permiso `solicitudes_ampliacion.view`  
**Carpeta frontend:** `src/Pages/MyExtensionRequest`

</div>

## Vista principal

La pantalla muestra las solicitudes de ampliacion creadas por el usuario autenticado. Combina solicitudes del modelo tradicional y del modelo flexible en una sola tabla.

Elementos visibles:

| Elemento | Descripcion |
| --- | --- |
| Buscador | Campo `Buscar solicitudes...` para filtrar solicitudes cargadas. |
| Filtro de estado | Boton de filtro con estados de solicitud. |
| Tabla | Lista motivo, fechas, estado y acciones. |
| Modal de detalle | Muestra informacion completa de la solicitud seleccionada. |

## Carga de solicitudes

Al abrir la pantalla, el frontend consulta en paralelo dos fuentes:

| Fuente | Endpoint | Uso |
| --- | --- | --- |
| Modelo tradicional | `GET /solicitudes-ampliacion/mis-solicitudes` | Solicitudes sobre evidencias asignadas. |
| Modelo flexible | `GET /elemento-solicitudes-ampliacion/mis-solicitudes` | Solicitudes sobre elementos asignados. |

Ambas consultas usan `per_page: 100`.

Reglas:

| Regla | Comportamiento |
| --- | --- |
| Ambas consultas exitosas | Une los resultados tradicionales y flexibles. |
| Una consulta falla | Muestra las solicitudes de la consulta exitosa. |
| Ambas consultas fallan | Muestra error `No se pudieron cargar las solicitudes`. |
| Error general | Muestra toast `Error al Cargar`. |

## Creacion de solicitudes

Esta pantalla no contiene el boton de crear. Las solicitudes se crean desde el modulo **Mis Entregas**, al usar la accion de solicitar ampliacion sobre una evidencia o elemento asignado.

Modal usado:

```txt
Solicitar Ampliacion de Plazo
```

Archivo:

```txt
src/Pages/MyEvidence/Components/CreateExtensionRequestModal.tsx
```

Campos del modal:

| Campo | Obligatorio | Regla |
| --- | --- | --- |
| Motivo de la solicitud | Si | Minimo 10 caracteres y maximo 300. |
| Nueva fecha limite solicitada | Si | Debe ser posterior a hoy. |

Informacion contextual que puede mostrarse:

| Dato | Descripcion |
| --- | --- |
| Evidencia | Nombre o identificador de la evidencia seleccionada, cuando esta disponible. |
| Fecha limite actual | Fecha limite vigente de la asignacion. |

Nota visible:

```txt
La solicitud sera revisada por el encargado de acreditacion, quien decidira si aprobar o rechazar la ampliacion del plazo.
```

### Creacion en modelo tradicional

Cuando la ampliacion corresponde a una evidencia asignada, el frontend envia:

```txt
POST /solicitudes-ampliacion
```

Payload:

```ts
interface CreateExtensionRequestData {
  evidencia_asignacion_id: number;
  motivo: string;
  fecha_sugerida: string;
}
```

Al completar correctamente, muestra:

```txt
Solicitud enviada
Su solicitud de ampliacion ha sido enviada correctamente
```

### Creacion en modelo flexible

Cuando la ampliacion corresponde a un elemento asignado, el mismo modal se reutiliza visualmente, pero el envio usa el identificador de la asignacion de elemento.

Endpoint:

```txt
POST /elementos-asignaciones/:id/solicitud-ampliacion
```

Payload:

```ts
{
  motivo: string;
  fecha_sugerida: string;
}
```

Al completar correctamente, muestra:

```txt
Solicitud enviada
Su solicitud de ampliacion ha sido enviada
```

### Solicitud duplicada

Si el backend indica que ya existe una solicitud pendiente, el frontend muestra un error especifico.

| Modelo | Mensaje |
| --- | --- |
| Tradicional | `Ya tienes una solicitud de ampliacion pendiente para esta evidencia` |
| Flexible | `Ya tienes una solicitud pendiente para este elemento` |

## Busqueda y filtros

La busqueda y el filtro se aplican localmente sobre las solicitudes cargadas.

### Busqueda

El campo `Buscar solicitudes...` revisa:

- Motivo.
- ID de solicitud.
- Nombre del usuario, si viene en la respuesta.
- Correo del usuario, si viene en la respuesta.
- Estado.
- Fecha sugerida.
- Fecha de creacion.

### Filtro de estado

Opciones disponibles:

| Opcion | Valor interno |
| --- | --- |
| Todos | `todos` |
| Pendiente | `pendiente` |
| Aprobada | `aprobada` |
| Rechazada | `rechazada` |
| Cancelada | `cancelada` |

Al cambiar busqueda o filtro, la tabla vuelve a la primera pagina.

## Tabla de solicitudes

Columnas:

| Columna | Descripcion |
| --- | --- |
| Motivo | Motivo de la solicitud. Debajo muestra la evidencia o elemento relacionado. |
| Fecha Solicitud | Fecha en que se creo la solicitud. |
| Fecha Sugerida | Nueva fecha limite solicitada. |
| Estado | Badge con el estado actual. |
| Acciones | Ver detalle y cancelar, cuando aplica. |

Estados:

| Estado | Descripcion |
| --- | --- |
| `pendiente` | La solicitud esta esperando revision. |
| `aprobada` | La ampliacion fue aceptada. |
| `rechazada` | La ampliacion fue rechazada. |
| `cancelada` | El usuario cancelo la solicitud antes de su resolucion. |

Mensajes de tabla vacia:

| Condicion | Mensaje |
| --- | --- |
| Busqueda sin coincidencias | `No se encontraron solicitudes que coincidan con "...".` |
| Filtro por estado sin resultados | `No tiene solicitudes {estado}` |
| Sin solicitudes | `No tiene solicitudes. Puede crear solicitudes desde la seccion de evidencias asignadas` |

## Acciones

### Ver detalles

El boton `Ver detalles de la solicitud` abre el modal `Mi Solicitud de Ampliacion`.

### Cancelar ampliacion

El boton de cancelar solo esta habilitado cuando la solicitud esta en estado `pendiente`.

Reglas:

| Regla | Comportamiento |
| --- | --- |
| Estado `pendiente` | Permite cancelar la solicitud. |
| Estado distinto de `pendiente` | El boton queda deshabilitado. |
| Solicitud tradicional | Usa `PATCH /solicitudes-ampliacion-tiempo/:id/cancelar`. |
| Solicitud flexible | Usa `PATCH /solicitudes-ampliacion-elemento/:id/cancelar`. |
| Exito | Muestra toast `Solicitud cancelada` y recarga la tabla. |
| Error | Muestra toast `Error`. |

Tooltip cuando no se puede cancelar:

```txt
Solo se pueden cancelar solicitudes pendientes
```

## Modal de detalle

El modal `Mi Solicitud de Ampliacion` resume la solicitud seleccionada.

Campos:

| Campo | Descripcion |
| --- | --- |
| Fecha de solicitud | Fecha y hora de creacion. |
| Fecha limite actual | Fecha limite vigente de la evidencia o elemento asignado. |
| Fecha nueva solicitada | Fecha propuesta por el usuario. |
| Motivo | Texto enviado al crear la solicitud. |

### Solicitudes pendientes o canceladas

Si la solicitud no esta aprobada ni rechazada, muestra un aviso informativo:

```txt
Su solicitud esta siendo revisada. Recibira una notificacion cuando sea resuelta.
```

Nota: el frontend usa este mismo aviso para cualquier estado no resuelto por aprobacion/rechazo.

### Solicitudes aprobadas o rechazadas

Cuando la solicitud ya fue resuelta, el modal muestra una tarjeta de resolucion.

| Estado | Titulo |
| --- | --- |
| `aprobada` | `Solicitud aprobada` |
| `rechazada` | `Solicitud rechazada` |

Datos adicionales:

| Dato | Descripcion |
| --- | --- |
| Justificacion | Texto del resolutor, si existe. |
| Fecha de resolucion | Fecha en que se resolvio. |
| Resolutor | Nombre de la persona que resolvio, si viene en la respuesta. |

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/solicitudes-ampliacion/mis-solicitudes` | Listar solicitudes propias del modelo tradicional. |
| `GET` | `/elemento-solicitudes-ampliacion/mis-solicitudes` | Listar solicitudes propias del modelo flexible. |
| `POST` | `/solicitudes-ampliacion` | Crear solicitud tradicional desde Mis Entregas. |
| `POST` | `/elementos-asignaciones/:id/solicitud-ampliacion` | Crear solicitud flexible desde Mis Entregas. |
| `PATCH` | `/solicitudes-ampliacion-tiempo/:id/cancelar` | Cancelar solicitud tradicional pendiente. |
| `PATCH` | `/solicitudes-ampliacion-elemento/:id/cancelar` | Cancelar solicitud flexible pendiente. |

## Datos principales

Solicitud:

```ts
interface ExtensionRequest {
  solicitud_ampliacion_id: number;
  evidencia_asignacion_id: number | null;
  elemento_asignacion_id: number | null;
  usuario_id: number;
  motivo: string;
  fecha_sugerida: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';
  fecha_resolucion: string | null;
  usuario_resolutor_id: number | null;
  justificacion: string | null;
  created_at: string;
  updated_at: string;
}
```

Filtros:

```ts
interface ExtensionRequestFilters {
  estado?: ExtensionRequestStatus;
  usuario_id?: number;
  evidencia_asignacion_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  per_page?: number;
  page?: number;
}
```

## Estados de carga y error

| Estado | Comportamiento |
| --- | --- |
| Cargando | La tabla muestra estado de carga. |
| Error de carga total | Muestra `BackendErrorAlert` con opcion de reintento. |
| Error parcial | Conserva los datos de la consulta exitosa. |
| Error al cancelar | Muestra toast `Error`. |
| Exito al cancelar | Muestra toast `Solicitud cancelada`. |
| Error al crear | Muestra toast con mensaje del backend. |

## Reglas importantes para soporte y QA

- La pantalla solo lista solicitudes del usuario autenticado.
- La creacion ocurre desde Mis Entregas, no desde esta pantalla.
- La lista combina solicitudes tradicionales y flexibles.
- Solo las solicitudes pendientes pueden cancelarse.
- Una solicitud pendiente duplicada debe ser rechazada por backend y mostrarse con mensaje especifico.
- El estado final de aprobacion o rechazo depende del modulo Gestionar Solicitudes.
- La autorizacion final debe mantenerse en backend; el frontend controla visibilidad, filtros y mensajes.
