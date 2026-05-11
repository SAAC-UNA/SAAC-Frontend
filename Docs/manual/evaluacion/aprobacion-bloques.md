---
title: Aprobacion de Bloques
---

# Aprobacion de Bloques

El submodulo Aprobacion de Bloques permite revisar bloques de criterios o elementos del proceso seleccionado, consultar sus evidencias/fuentes asociadas y aprobar o rechazar el bloque completo o elementos individuales.

<div class="module-meta">

**Ruta:** `/aprobacion-bloques`  
**Archivo principal:** `src/Pages/BlockApproval/BlockApproval.tsx`  
**Componentes:** `src/Pages/BlockApproval/Components`  
**Acceso en menu:** `cap.approvals.view` o permiso `aprobaciones.view`  
**Requiere contexto:** ciclo y proceso seleccionados  

</div>

## Vista principal

La pantalla muestra bloques asociados al proceso activo. En modelo tradicional, los bloques corresponden a criterios con evidencias asignadas. En modelo flexible, corresponden a elementos padre con hijos asignados.

Elementos visibles:

| Elemento | Descripcion |
| --- | --- |
| Encabezado contextual | Usa el ciclo y proceso seleccionado. |
| Buscador | Campo `Buscar elementos, responsables o estado...`. |
| Tabla de bloques | Lista criterio/elemento, responsables, recursos, estado y acciones. |
| Modal de evidencias/fuentes | Muestra los elementos internos del bloque y documentos asociados. |
| Modal de aprobacion/rechazo de bloque | Confirma acciones sobre el bloque completo. |
| Modal de aprobacion/rechazo individual | Confirma acciones sobre una evidencia o elemento hijo. |

## Acceso y contexto

La opcion de menu aparece solo si hay ciclo y proceso seleccionados.

Permisos:

| Permiso/capacidad | Uso |
| --- | --- |
| `cap.approvals.view` | Permite ver el submodulo desde navegacion. |
| `aprobaciones.view` | Permiso requerido por la ruta protegida. |

Si no hay proceso seleccionado, la tabla muestra:

```txt
No hay datos disponibles
Seleccione un proceso para continuar
```

La pantalla escucha cambios del filtro global con `GLOBAL_FILTER_CONTEXT_CHANGED_EVENT` y sincroniza el proceso operativo usando `getOperationalContextSnapshot()`.

## Modo tradicional y modo flexible

El comportamiento depende del modelo asociado al proceso seleccionado.

| Modelo | Bloque mostrado | Elementos internos |
| --- | --- | --- |
| Tradicional | Criterio | Evidencias del criterio. |
| `elemento_flexible` | Elemento padre | Elementos hijos/fuentes asignadas. |

El frontend detecta el modo usando:

```txt
accreditation_cycle.modelo_estructura.tipo
```

## Carga de datos

La pantalla siempre carga los procesos para detectar el proceso actual y su modelo.

### Modelo tradicional

Consultas principales:

| Endpoint | Uso |
| --- | --- |
| `GET /estructura/procesos` | Cargar procesos y detectar modelo. |
| `GET /estructura/criterios` | Cargar criterios. |
| `GET /estructura/evidencias` | Cargar evidencias. |
| `GET /aprobaciones-criterios` | Cargar estados de aprobacion de criterios. |
| `GET /procesos/:id/asignaciones` | Cargar asignaciones del proceso seleccionado. |

Reglas:

- Solo se muestran criterios con evidencias asignadas o aprobaciones existentes en el proceso.
- El conteo de recursos representa la cantidad de evidencias vinculadas al criterio dentro del proceso.
- Los responsables se deduplican por usuario a partir de las asignaciones.
- El estado del criterio se toma de la aprobacion mas reciente para ese criterio y proceso.

### Modelo flexible

Consultas principales:

| Endpoint | Uso |
| --- | --- |
| `GET /estructura/procesos` | Cargar procesos y detectar modelo. |
| `GET /estructura/elementos` | Cargar elementos del modelo flexible. |
| `GET /procesos/:id/elementos-asignaciones` | Cargar asignaciones de elementos del proceso. |
| `GET /aprobaciones-elementos` | Cargar aprobaciones de elementos. |

Reglas:

- Se identifican elementos hijos asignados dentro del proceso.
- Se muestran como bloques los padres de esos hijos.
- El conteo de recursos representa la cantidad de hijos/fuentes asignadas al bloque.
- Los responsables se deduplican por usuario en las asignaciones del bloque.
- Las decisiones individuales se agrupan por elemento y usuario.

## Busqueda

La busqueda es local sobre los bloques cargados.

Campos revisados:

- Nomenclatura.
- Descripcion.
- Estado del bloque.
- Variantes del estado: pendiente, aprobado, rechazado, incompleto.
- Nombre de responsables.
- ID de responsables.
- Cantidad de recursos.
- Texto `sin recursos`.

Al cambiar el resultado filtrado, la tabla vuelve a la primera pagina.

## Tabla de bloques

Columnas:

| Columna | Modelo tradicional | Modelo flexible |
| --- | --- | --- |
| Criterio/Elemento | Criterio con nomenclatura y descripcion. | Elemento padre con nomenclatura y descripcion. |
| Responsables | Avatares de usuarios responsables. | Avatares de usuarios responsables. |
| Recursos | Cantidad de evidencias vinculadas. | Cantidad de hijos/fuentes vinculadas. |
| Estado | Estado de aprobacion del bloque. | Estado de aprobacion del bloque. |
| Acciones | Ver evidencias, aprobar bloque, rechazar bloque. | Ver fuentes, aprobar bloque, rechazar bloque. |

Estados de bloque:

| Estado | Descripcion |
| --- | --- |
| `pendiente` | Puede aprobarse o rechazarse si no hay decisiones internas incompatibles. |
| `aprobado` | El bloque ya fue aprobado. |
| `rechazado` | El bloque ya fue rechazado. |
| `incompleto` | Existen decisiones internas que impiden procesarlo como bloque completo. |

Mensajes vacios:

| Condicion | Mensaje |
| --- | --- |
| Modelo tradicional sin criterios | `No hay criterios disponibles para el filtro seleccionado` |
| Modelo flexible sin elementos | `No hay elementos disponibles para el filtro seleccionado` |

## Reglas para aprobar o rechazar bloques

Las acciones de bloque se habilitan solo cuando el estado es `pendiente` y las reglas internas lo permiten.

| Accion | Bloquea si... | Mensaje funcional |
| --- | --- | --- |
| Aprobar bloque | Hay evidencias/elementos rechazados dentro del bloque. | `No se puede aprobar: hay evidencias rechazadas en el bloque` |
| Rechazar bloque | Hay evidencias/elementos aprobados dentro del bloque. | `No se puede rechazar: hay evidencias aprobadas en el bloque` |
| Aprobar/Rechazar | El bloque ya fue procesado. | `Bloque ya procesado` |
| Aprobar/Rechazar | Aun se estan cargando decisiones internas. | `Validando evidencias del bloque...` |

En modelo flexible, los mensajes usan `elementos` en lugar de `evidencias`.

## Ver evidencias o fuentes asociadas

El boton de vista abre el modal:

| Modelo | Titulo del modal |
| --- | --- |
| Tradicional | `Evidencias asociadas del bloque` |
| Flexible | `Fuentes asociadas del bloque` |

Contenido por fila:

| Dato | Descripcion |
| --- | --- |
| Estado individual | Pendiente, aprobado o rechazado. |
| Nomenclatura y descripcion | Identificacion de la evidencia o fuente. |
| Responsable | Usuario asignado a esa evidencia/fuente. |
| Motivo | Comentario de rechazo si existe. |
| Documentos del responsable | Dropdown para ver archivos o enlaces cargados por ese responsable. |
| Acciones | Aprobar o rechazar el elemento individual si esta pendiente. |

Si no hay elementos internos:

| Modelo | Mensaje |
| --- | --- |
| Tradicional | `No hay evidencias asociadas para revisar en este bloque.` |
| Flexible | `No hay fuentes asociadas para revisar en este bloque.` |

## Documentos asociados

Dentro del modal de evidencias/fuentes, el usuario puede desplegar `Ver documentos del responsable`.

Comportamiento:

| Tipo | Comportamiento |
| --- | --- |
| Archivo tradicional | Descarga desde `/archivos/:id/download`. |
| Archivo flexible | Descarga desde `/elementos-archivos/:id/download`. |
| Enlace | Abre la URL en una nueva pestana. |
| Sin documentos | Muestra `Este responsable no tiene documentos adjuntos para esta evidencia.` |

Los documentos se filtran por responsable. En modelo flexible, si no hay coincidencia por `usuario_id`, se intenta relacionar por nombre de autor.

## Aprobar bloque

El modal `Aprobar Bloque` confirma la accion sobre todo el bloque.

Mensaje:

```txt
¿Esta seguro que desea aprobar este bloque? Todas las evidencias pendientes seran aprobadas en cascada.
```

Al confirmar:

| Modelo | Endpoint |
| --- | --- |
| Tradicional | `POST /criterios/:id/aprobar` |
| Flexible | `POST /elementos/:id/aprobar` |

Payload:

```ts
{
  proceso_id: number;
  comentario: string | null;
}
```

Exito:

```txt
Bloque Aprobado
El bloque ha sido aprobado exitosamente.
```

## Rechazar bloque

El modal `Rechazar Bloque` permite agregar comentario y nueva fecha limite opcional.

Mensaje:

```txt
¿Esta seguro que desea rechazar este bloque? Todas las evidencias seran marcadas como rechazadas.
```

Campos:

| Campo | Obligatorio | Regla |
| --- | --- | --- |
| Comentario | No | Maximo 500 caracteres en modelo tradicional; maximo 100 en modelo flexible. |
| Nueva fecha limite | No | Debe ser posterior a hoy. |

Al confirmar:

| Modelo | Endpoint |
| --- | --- |
| Tradicional | `POST /criterios/:id/rechazar` |
| Flexible | `POST /elementos/:id/rechazar` |

Payload tradicional:

```ts
{
  proceso_id: number;
  comentario: string | null;
  nueva_fecha_limite?: string;
}
```

Payload flexible:

```ts
{
  proceso_id: number;
  comentario: string | null;
  fecha_limite?: string;
}
```

Exito:

```txt
Bloque Rechazado
El bloque ha sido rechazado exitosamente.
```

## Aprobar elemento individual

Desde el modal de evidencias/fuentes se puede aprobar una evidencia o elemento hijo pendiente.

Modal:

```txt
Aprobar Elemento
```

Mensaje:

```txt
¿Esta seguro que desea aprobar este elemento?
```

Endpoints:

| Modelo | Endpoint |
| --- | --- |
| Tradicional | `POST /criterios/:criterioId/evidencias/:evidenciaId/aprobar` |
| Flexible | `POST /elementos/:elementoPadreId/hijos/:elementoHijoId/aprobar` |

Payload:

```ts
{
  proceso_id: number;
  responsable_usuario_id?: number;
}
```

Exito:

```txt
Elemento Aprobado
El elemento ha sido aprobado exitosamente.
```

## Rechazar elemento individual

Desde el modal de evidencias/fuentes se puede rechazar una evidencia o elemento hijo pendiente.

Modal:

```txt
Rechazar Elemento
```

Mensaje:

```txt
¿Esta seguro que desea rechazar este elemento? El responsable recibira una notificacion y debera reenviar la entrega.
```

Campos:

| Campo | Obligatorio | Regla |
| --- | --- | --- |
| Comentario | No | Maximo 500 caracteres. |
| Nueva fecha limite | No | Debe ser posterior a hoy. |

Endpoints:

| Modelo | Endpoint |
| --- | --- |
| Tradicional | `POST /criterios/:criterioId/evidencias/:evidenciaId/rechazar` |
| Flexible | `POST /elementos/:elementoPadreId/hijos/:elementoHijoId/rechazar` |

Payload:

```ts
{
  proceso_id: number;
  responsable_usuario_id?: number;
  comentario?: string;
  nueva_fecha_limite?: string;
}
```

Exito:

```txt
Elemento Rechazado
El elemento ha sido rechazado exitosamente.
```

## Reglas de bloqueo individual

Dentro del modal de evidencias/fuentes:

| Condicion | Comportamiento |
| --- | --- |
| Bloque aprobado | Las acciones individuales quedan bloqueadas. |
| Bloque rechazado | Las acciones individuales quedan bloqueadas. |
| Elemento aprobado | No puede rechazarse. |
| Elemento rechazado | No puede procesarse nuevamente. |
| Bloque incompleto con elemento aprobado | El elemento aprobado queda bloqueado. |
| Elemento pendiente | Puede aprobarse o rechazarse si el bloque no esta procesado. |

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/estructura/procesos` | Cargar procesos y detectar modelo. |
| `GET` | `/estructura/criterios` | Cargar criterios en modelo tradicional. |
| `GET` | `/estructura/evidencias` | Cargar evidencias en modelo tradicional. |
| `GET` | `/aprobaciones-criterios` | Cargar aprobaciones de bloques tradicionales. |
| `GET` | `/procesos/:id/asignaciones` | Cargar asignaciones tradicionales del proceso. |
| `GET` | `/criterios/:id/evidencias/aprobaciones` | Cargar aprobaciones individuales de evidencias. |
| `GET` | `/estructura/elementos` | Cargar elementos del modelo flexible. |
| `GET` | `/procesos/:id/elementos-asignaciones` | Cargar asignaciones flexibles del proceso. |
| `GET` | `/aprobaciones-elementos` | Cargar aprobaciones de elementos flexibles. |
| `GET` | `/elementos-archivos` | Cargar documentos de elementos flexibles. |
| `GET` | `/archivos/:id/download` | Descargar archivo tradicional. |
| `GET` | `/elementos-archivos/:id/download` | Descargar archivo flexible. |
| `POST` | `/criterios/:id/aprobar` | Aprobar bloque tradicional. |
| `POST` | `/criterios/:id/rechazar` | Rechazar bloque tradicional. |
| `POST` | `/elementos/:id/aprobar` | Aprobar bloque flexible. |
| `POST` | `/elementos/:id/rechazar` | Rechazar bloque flexible. |
| `POST` | `/criterios/:criterioId/evidencias/:evidenciaId/aprobar` | Aprobar evidencia individual. |
| `POST` | `/criterios/:criterioId/evidencias/:evidenciaId/rechazar` | Rechazar evidencia individual. |
| `POST` | `/elementos/:padreId/hijos/:hijoId/aprobar` | Aprobar elemento hijo. |
| `POST` | `/elementos/:padreId/hijos/:hijoId/rechazar` | Rechazar elemento hijo. |

## Datos principales

Bloque:

```ts
interface Criterio {
  id: number;
  nomenclatura: string;
  descripcion: string;
  estado_aprobacion?: 'pendiente' | 'aprobado' | 'rechazado' | 'incompleto';
  linked_count?: number;
  responsables?: Array<{ id: number; name: string }>;
}
```

Elemento interno:

```ts
interface EvidenceApprovalItem {
  evidencia_id: number;
  nomenclatura: string;
  descripcion: string;
  approval_status: 'pendiente' | 'aprobado' | 'rechazado';
  comentario_rechazo?: string | null;
  asignacion?: {
    estado: string;
    fecha_limite: string | null;
    usuario_id: number;
    usuario_nombre?: string | null;
  } | null;
  approvals_by_user?: Record<string, {
    approval_status: 'pendiente' | 'aprobado' | 'rechazado';
    comentario_rechazo?: string | null;
  }>;
}
```

## Estados de carga y error

| Estado | Comportamiento |
| --- | --- |
| Cargando bloques | La tabla muestra estado de carga. |
| Error al cargar datos | Muestra toast `Error al cargar datos`. |
| Cargando evidencias/fuentes | El modal muestra `LoadingSpinner`. |
| Error al cargar evidencias/fuentes | Muestra lista vacia para ese bloque. |
| Error al aprobar/rechazar bloque | Muestra toast `No se pudo rechazar/aprobar el bloque`. |
| Error al aprobar/rechazar elemento | Muestra toast `Error al procesar el elemento`. |
| Error al descargar documento | Muestra toast `Error al descargar`. |
| Enlace sin URL | Muestra toast `Enlace no disponible`. |

## Reglas importantes para soporte y QA

- La pantalla depende totalmente del proceso seleccionado en el contexto global.
- En modelo tradicional se revisan criterios y evidencias.
- En modelo flexible se revisan elementos padre e hijos/fuentes.
- Aprobar un bloque no esta permitido si hay elementos internos rechazados.
- Rechazar un bloque no esta permitido si hay elementos internos aprobados.
- Las acciones individuales solo aplican a elementos pendientes.
- Rechazar puede actualizar la fecha limite si el usuario define una nueva fecha.
- La fecha limite nueva debe ser posterior a hoy.
- Despues de aprobar o rechazar, se invalida la cache del bloque y se recargan los datos.
- La autorizacion final y las reglas de negocio definitivas deben mantenerse en backend.
