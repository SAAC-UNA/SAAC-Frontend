---
title: Gestionar Solicitudes
---

# Gestionar Solicitudes

El submodulo Gestionar Solicitudes permite a encargados revisar, aprobar o rechazar solicitudes de ampliacion de plazo asociadas al ciclo y proceso operativo seleccionado.

<div class="module-meta">

**Ruta:** `/solicitudes-ampliacion/gestionar`  
**Archivo principal:** `src/Pages/ExtensionRequest/ManageExtensionRequestsPage.tsx`  
**Componentes:** `src/Pages/ExtensionRequest/Components`  
**Servicios:** `src/Services/ExtensionRequestService.ts`, `src/Services/FlexibleExtensionRequestService.ts`  
**Acceso en menu:** `cap.extension.manage`, `solicitudes_ampliacion.approve` o `solicitudes_ampliacion.reject`  
**Requiere contexto:** ciclo y proceso seleccionados  
**Carpeta frontend:** `src/Pages/ExtensionRequest`

</div>

## Vista principal

La pantalla muestra solicitudes de ampliacion filtradas por el contexto operativo. Desde esta vista se pueden revisar detalles, aprobar solicitudes pendientes o rechazarlas.

Elementos visibles:

| Elemento | Descripcion |
| --- | --- |
| Encabezado contextual | Usa el ciclo/proceso activo como contexto de trabajo. |
| Buscador | Campo `Buscar por solicitante, email...`. |
| Tabla | Lista solicitante, motivo, fechas, estado y acciones. |
| Modal de detalle | Muestra informacion completa antes de decidir. |
| Modales de confirmacion | Confirman aprobacion o rechazo. |
| Modal de exito | Confirma aprobacion correcta. |

## Acceso y autorizacion

La opcion del menu solo se muestra cuando existe seleccion contextual de ciclo/proceso y el usuario tiene capacidad o permisos de gestion.

Permisos relevantes:

| Permiso/capacidad | Uso |
| --- | --- |
| `cap.extension.manage` | Habilita acceso funcional desde navegacion. |
| `solicitudes_ampliacion.approve` | Permite gestionar aprobaciones. |
| `solicitudes_ampliacion.reject` | Permite gestionar rechazos. |

La ruta tambien esta protegida por `ProtectedRoute` con permisos de aprobacion y rechazo. Si el usuario no esta autenticado o no tiene permisos suficientes, la pagina muestra mensajes de bloqueo.

Mensajes:

| Condicion | Mensaje |
| --- | --- |
| No autenticado | `Debe iniciar sesion para acceder a esta seccion.` |
| Sin permisos | `No tiene permisos para gestionar solicitudes de ampliacion. Esta seccion es solo para Encargados de Acreditacion.` |

## Contexto operativo

La pantalla usa `useOperationalContextSnapshot()` para conocer ciclo, proceso y tipo de modelo.

Reglas:

| Regla | Comportamiento |
| --- | --- |
| Ciclo/proceso seleccionado | La lista se filtra contra ese contexto. |
| `cycleModelType = tradicional` | Consulta solicitudes tradicionales. |
| `cycleModelType = elemento_flexible` | Consulta solicitudes de elementos flexibles. |
| Modelo desconocido | Usa fallback y consulta ambos servicios. |
| Proceso seleccionado | Tiene prioridad sobre ciclo para filtrar resultados. |
| Solo ciclo seleccionado | Filtra por ciclo cuando no hay proceso. |

El filtro de contexto compara `proceso_id` y `ciclo_acreditacion_id` desde la relacion de evidencia, elemento o un objeto `context` si viene en la respuesta.

## Carga de solicitudes

La pantalla carga todas las paginas disponibles del endpoint correspondiente usando `per_page: 100`.

Fuentes:

| Modelo | Endpoint | Servicio |
| --- | --- | --- |
| Tradicional | `GET /solicitudes-ampliacion` | `extensionRequestService.getAllRequests` |
| Flexible | `GET /elemento-solicitudes-ampliacion` | `flexibleExtensionRequestService.getAllRequests` |

Si el endpoint devuelve varias paginas, el frontend consulta desde la pagina 1 hasta `meta.last_page` y une los resultados.

Estados:

| Estado | Comportamiento |
| --- | --- |
| Cargando | La tabla muestra estado de carga. |
| Error de carga | Muestra toast `Error al Cargar` y `BackendErrorAlert`. |
| Reintento | El `BackendErrorAlert` permite volver a ejecutar la carga. |

## Busqueda

El buscador filtra localmente las solicitudes ya cargadas.

Campos revisados:

- Motivo.
- ID de solicitud.
- Nombre del solicitante.
- Correo del solicitante.
- Estado.
- Fecha sugerida.
- Fecha de creacion.

Al cambiar la busqueda, la tabla vuelve a la primera pagina.

## Tabla de gestion

Columnas:

| Columna | Descripcion |
| --- | --- |
| Solicitante | Nombre y correo del usuario que solicito la ampliacion. |
| Motivo | Texto resumido del motivo enviado por el solicitante. |
| Fecha Solicitud | Fecha en que se creo la solicitud. |
| Fecha Sugerida | Nueva fecha limite solicitada. |
| Estado | Badge de estado actual. |
| Acciones | Ver detalle, aprobar y rechazar. |

Estados:

| Estado | Descripcion |
| --- | --- |
| `pendiente` | Puede aprobarse o rechazarse. |
| `aprobada` | Ya fue aprobada y no permite nueva accion. |
| `rechazada` | Ya fue rechazada y no permite nueva accion. |
| `cancelada` | Fue cancelada por el solicitante y no permite nueva accion. |

Mensajes de tabla vacia:

| Condicion | Mensaje |
| --- | --- |
| Busqueda sin coincidencias | `No se encontraron solicitudes que coincidan con "...".` |
| Filtro por estado sin resultados | `No hay solicitudes {estado}` |
| Sin solicitudes | `No hay solicitudes de ampliacion registradas` |

Nota: el componente de tabla soporta `filterEstado`, aunque la pantalla actual solo expone buscador en el encabezado.

## Acciones

### Ver detalles

El boton `Ver detalles` abre el modal `Solicitud de Ampliacion`.

### Aprobar solicitud

El boton de aprobar solo esta habilitado cuando la solicitud esta en estado `pendiente`.

Flujo:

1. El usuario presiona aprobar desde la tabla o desde el modal de detalle.
2. Se abre el modal `Aprobar solicitud`.
3. El usuario confirma la accion.
4. El frontend envia la aprobacion al servicio correspondiente.
5. Se muestra el modal de exito.
6. La tabla se recarga.

Mensaje de confirmacion:

```txt
¿Esta seguro de que desea aprobar esta solicitud de ampliacion? La fecha limite de la asignacion se actualizara automaticamente.
```

Exito:

```txt
Solicitud Aprobada
La solicitud ha sido aprobada correctamente y la fecha limite ha sido actualizada.
```

### Rechazar solicitud

El boton de rechazar solo esta habilitado cuando la solicitud esta en estado `pendiente`.

Flujo:

1. El usuario presiona rechazar desde la tabla o desde el modal de detalle.
2. Se abre el modal `Rechazar solicitud`.
3. El usuario confirma la accion.
4. El frontend envia el rechazo al servicio correspondiente.
5. Se muestra toast de advertencia.
6. La tabla se recarga.

Mensaje de confirmacion:

```txt
¿Esta seguro de que desea rechazar esta solicitud de ampliacion? Esta accion no se puede revertir.
```

Toast de exito:

```txt
Solicitud Rechazada
La solicitud ha sido rechazada.
```

## Modal de detalle

El modal `Solicitud de Ampliacion` es de solo lectura, pero incluye accesos rapidos para aprobar o rechazar si la solicitud sigue pendiente.

Campos:

| Campo | Descripcion |
| --- | --- |
| Nombre | Nombre del solicitante. |
| Email | Correo del solicitante. |
| Fecha de solicitud | Fecha y hora de creacion. |
| Evidencia | Nomenclatura y descripcion, si la solicitud pertenece al modelo tradicional. |
| Elemento | Nombre y tipo, si pertenece al modelo flexible. |
| Fecha limite actual | Fecha limite vigente de la asignacion. |
| Fecha nueva solicitada | Fecha propuesta por el usuario. |
| Motivo | Justificacion escrita por el solicitante. |

Aviso visible:

```txt
Importante: Una vez aprobada o rechazada, la decision no podra revertirse.
```

Cuando la solicitud es tradicional, el aviso tambien indica que al aprobar se actualiza automaticamente la fecha limite de la asignacion.

## Aprobacion y rechazo por modelo

La pantalla selecciona el servicio segun si la solicitud tiene `elemento_asignacion_id`.

| Condicion | Accion | Endpoint |
| --- | --- | --- |
| Sin `elemento_asignacion_id` | Aprobar tradicional | `POST /solicitudes-ampliacion/:id/aprobar` |
| Sin `elemento_asignacion_id` | Rechazar tradicional | `POST /solicitudes-ampliacion/:id/rechazar` |
| Con `elemento_asignacion_id` | Aprobar flexible | `POST /elemento-solicitudes-ampliacion/:id/aprobar` |
| Con `elemento_asignacion_id` | Rechazar flexible | `POST /elemento-solicitudes-ampliacion/:id/rechazar` |

Payload enviado:

```ts
interface ReviewFormData {
  justificacion: string;
}
```

En la pantalla actual, la confirmacion envia `justificacion: ""`.

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/solicitudes-ampliacion` | Listar solicitudes tradicionales para gestion. |
| `GET` | `/elemento-solicitudes-ampliacion` | Listar solicitudes flexibles para gestion. |
| `POST` | `/solicitudes-ampliacion/:id/aprobar` | Aprobar solicitud tradicional. |
| `POST` | `/solicitudes-ampliacion/:id/rechazar` | Rechazar solicitud tradicional. |
| `POST` | `/elemento-solicitudes-ampliacion/:id/aprobar` | Aprobar solicitud flexible. |
| `POST` | `/elemento-solicitudes-ampliacion/:id/rechazar` | Rechazar solicitud flexible. |

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

Respuesta paginada:

```ts
interface ExtensionRequestPaginatedResponse {
  data: ExtensionRequest[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
```

## Estados de carga y error

| Estado | Comportamiento |
| --- | --- |
| No autenticado | Muestra alerta de autenticacion requerida. |
| Sin permisos | Muestra alerta de acceso denegado. |
| Cargando solicitudes | Muestra tabla en estado de carga. |
| Error al cargar | Muestra toast y alerta con reintento. |
| Error al aprobar | Muestra toast `Error al Aprobar`. |
| Error al rechazar | Muestra toast `Error al Rechazar`. |
| Aprobacion exitosa | Muestra modal `Solicitud Aprobada`. |
| Rechazo exitoso | Muestra toast `Solicitud Rechazada`. |

## Reglas importantes para soporte y QA

- La opcion del menu requiere ciclo y proceso seleccionados.
- La pantalla filtra solicitudes segun el contexto operativo activo.
- En modelo tradicional consulta solicitudes de evidencias.
- En modelo flexible consulta solicitudes de elementos.
- Solo las solicitudes `pendiente` habilitan aprobar o rechazar.
- La decision no puede revertirse desde la interfaz.
- Al aprobar una solicitud tradicional, la fecha limite de la asignacion debe actualizarse desde backend.
- El rechazo actual no solicita justificacion visible; envia una justificacion vacia.
- La autorizacion final debe mantenerse en backend; el frontend controla visibilidad, flujo y mensajes.
