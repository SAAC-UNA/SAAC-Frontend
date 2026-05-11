---
title: Buscar Entregables
---

# Buscar Entregables

El submodulo Buscar Entregables permite consultar evidencias o asignaciones del proceso operativo seleccionado, filtrar resultados, exportarlos y revisar el detalle de recursos asociados.

<div class="module-meta">

**Ruta:** `/entregables/buscar`  
**Archivo principal:** `src/Pages/EvidenceSearch/EvidenceSearchPage.tsx`  
**Componentes:** `src/Pages/EvidenceSearch/Components`  
**Servicio:** `src/Services/EvidenceSearchService.ts`  
**Acceso en menu:** `cap.evidence.assign` o permisos `evidencias.assign`, `asignaciones.create`, `asignaciones.edit`  
**Requiere contexto:** ciclo y proceso seleccionados  
**Carpeta frontend:** `src/Pages/EvidenceSearch`

</div>

## Vista principal

La pantalla muestra un explorador de entregables asociado al proceso activo. El encabezado usa la informacion contextual del modulo y ofrece acciones de filtro y exportacion.

Elementos visibles:

| Elemento | Descripcion |
| --- | --- |
| Buscador | Campo `Buscar por elemento...` para filtrar localmente los resultados cargados. |
| Boton Filtros | Muestra u oculta el panel de filtros jerarquicos. |
| Boton Exportar | Permite descargar resultados en PDF o Excel. |
| Tabla de resultados | Lista entregables, responsables, recursos, estado y accion de detalle. |
| Modal de detalle | Muestra informacion completa del entregable y, segun permisos, gestion de recursos y retroalimentacion. |

Estado vacio de tabla:

```txt
No existen elementos que cumplan con los filtros aplicados.
```

## Contexto operativo

La pantalla toma el proceso activo desde `useOperationalContextSnapshot()`.

Reglas:

| Regla | Comportamiento |
| --- | --- |
| Sin proceso seleccionado | La pantalla no ejecuta busqueda del proceso. |
| Proceso seleccionado | Se carga la informacion del proceso y se ejecuta una busqueda inicial. |
| Cambio de proceso | Se recalculan filtros base y se vuelve a buscar. |
| Modelo flexible | Se cargan los elementos del modelo con `modelo_estructura_id`. |

El frontend detecta el modo usando `modelo_estructura_tipo` del proceso.

## Modo tradicional y modo flexible

El modulo soporta dos formas de estructura.

| Tipo de modelo | Busqueda principal | Filtro jerarquico |
| --- | --- | --- |
| Tradicional | Evidencias asociadas a criterios | Dimension, componente y entregable. |
| `elemento_flexible` | Asignaciones de elementos del modelo | Selector encadenado de elementos flexibles. |

En ambos casos, los resultados se adaptan al mismo formato visual para que la tabla y el modal funcionen de forma uniforme.

## Busqueda

La busqueda tiene dos niveles:

| Tipo | Comportamiento |
| --- | --- |
| Busqueda backend | Se ejecuta al cargar el proceso o al cambiar filtros. |
| Busqueda local | El campo `Buscar por elemento...` filtra los resultados ya cargados en memoria. |

La busqueda local revisa:

- Nomenclatura y descripcion de la evidencia.
- Nomenclatura y descripcion del criterio o elemento.
- Estado.
- Fecha formateada.
- Cantidad de archivos o enlaces.
- Texto `sin recursos`.
- Nombre y correo de responsables.
- Roles con acceso.

Mientras carga, el buscador queda deshabilitado.

## Filtros

El boton de filtros muestra el panel `EvidenceSearchFiltersPanel`.

### Modelo tradicional

Filtros disponibles:

| Filtro | Comportamiento |
| --- | --- |
| Dimension | Permite seleccionar una dimension o `Todas las dimensiones`. |
| Componente | Se filtra por la dimension seleccionada; permite `Todos los componentes`. |
| Entregable | Se filtra por el componente seleccionado; permite `Todos los criterios`. |

Los selectores son buscables cuando tienen suficientes opciones.

### Modelo flexible

En procesos con `modelo_estructura_tipo = elemento_flexible`, el panel muestra un selector encadenado basado en los elementos del modelo.

Reglas:

| Regla | Comportamiento |
| --- | --- |
| Elementos disponibles | Se cargan desde el modelo asociado al proceso. |
| Sin elementos | El selector queda deshabilitado. |
| Seleccion de elemento | Envia `elemento_id` al servicio de busqueda. |

### Limpiar filtros

Cuando hay filtros activos, aparece el boton para limpiar. Al usarlo, la pantalla borra la seleccion interna y vuelve a emitir filtros vacios, conservando el proceso del contexto.

## Tabla de resultados

La tabla muestra resultados paginados con el tamano estandar del sistema.

Columnas:

| Columna | Descripcion |
| --- | --- |
| Entregable | Muestra nomenclatura y descripcion del criterio o elemento, mas la fecha de publicacion/asignacion. |
| Responsables | Indica `Sin asignar`, `1 responsable` o la cantidad total de responsables. |
| Recursos | Muestra cantidad total de archivos y enlaces, o `Sin recursos`. |
| Estado | Badge con el estado de la evidencia o asignacion. |
| Acciones | Boton `Ver detalles`. |

Estados posibles:

```txt
Pendiente
En Proceso
Completado
Vencido
Aprobado
Rechazado
Observada
Validada
```

## Ver detalle del entregable

El boton `Ver detalles` abre el modal `Detalles del Entregable`.

Informacion visible:

| Seccion | Descripcion |
| --- | --- |
| Encabezado | Nomenclatura y descripcion del criterio, entregable o elemento. |
| Conteo | Muestra cantidad de evidencias asociadas o asignaciones, segun el modelo. |
| Roles con acceso | Badges con los roles que pueden acceder, cuando vienen en la respuesta. |
| Evidencias/asignaciones | Tabla interna con recursos y estado. |

Mientras carga, muestra:

```txt
Cargando informacion del entregable...
```

## Recursos asociados

Dentro del detalle, los recursos se agrupan por responsable cuando el usuario tiene permisos para ver la gestion administrativa.

Por cada responsable se muestra:

| Dato | Descripcion |
| --- | --- |
| Responsable | Nombre del usuario asignado. |
| Fecha de asignacion | Fecha en que se asigno el entregable. |
| Fecha limite | Fecha maxima definida para la entrega, si existe. |
| Estado de asignacion | Badge del estado de la asignacion. |
| Archivos | Lista expandible de archivos asociados al usuario. |

Acciones sobre archivos:

| Accion | Permiso/condicion | Comportamiento |
| --- | --- | --- |
| Descargar | Archivo disponible | Descarga el archivo seleccionado. |
| Eliminar | Usuario con `archivos.make_public` en el modal administrativo | Elimina el archivo y recarga los recursos. |
| Subir archivo | Usuario con `archivos.make_public` | Abre el modal para agregar archivos o enlaces. |

Si no existen responsables, se muestra:

```txt
Sin responsables asignados
```

## Carga administrativa de recursos

El modal `Agregar recursos a evidencia` permite a usuarios privilegiados agregar recursos desde el detalle.

Permiso usado por frontend:

```txt
archivos.make_public
```

Campos:

| Campo | Descripcion |
| --- | --- |
| Archivos | Dropzone para seleccionar uno o varios archivos. |
| Enlaces | Entrada para agregar enlaces como recursos. |

Reglas:

| Regla | Comportamiento |
| --- | --- |
| Proceso conocido | Usa el `proceso_id` disponible en archivos existentes. |
| Proceso desconocido | Intenta resolverlo desde `/evidencias/:id/asignaciones`. |
| Sin proceso | Muestra error y no permite subir. |
| Sin archivos ni enlaces | El boton `Subir` permanece deshabilitado. |
| Error parcial | Muestra toast de advertencia con recursos guardados y fallidos. |
| Exito completo | Muestra toast de exito y recarga los recursos. |

Mensaje cuando no se puede resolver el proceso:

```txt
No se encontro un proceso activo para esta evidencia. No es posible subir archivos.
```

## Retroalimentacion

Los usuarios con permiso `evidencias.edit` pueden retroalimentar evidencias desde el modal de detalle.

Reglas:

| Regla | Comportamiento |
| --- | --- |
| Evidencia en `Pendiente` | El boton aparece deshabilitado con tooltip `Sin recursos para retroalimentar`. |
| Evidencia con recursos/avance | Permite abrir el modal de retroalimentacion. |
| Envio exitoso | Actualiza el estado visible de la evidencia. |

Opciones de estado:

| Estado | Uso |
| --- | --- |
| Observada | Requiere correccion por parte del responsable. |
| Validada | La evidencia cumple los criterios de evaluacion. |

Campo de comentario:

| Regla | Valor |
| --- | --- |
| Obligatorio | Si |
| Minimo | 5 caracteres |
| Maximo | 800 caracteres |
| Placeholder | `Describa las observaciones o el motivo de la validacion (min. 5 caracteres)...` |

Errores controlados:

| Codigo | Comportamiento |
| --- | --- |
| `403` | Toast `Sin autorizacion`. |
| `422` | Toast de validacion con mensaje del backend. |
| Otros | Toast `Error al enviar`. |

## Exportacion

El boton `Exportar` permite descargar los resultados actuales.

Formatos:

| Formato | Archivo |
| --- | --- |
| PDF | `evidencias_YYYY-MM-DD.pdf` o `pautas_YYYY-MM-DD.pdf` en modelo flexible. |
| Excel | `evidencias_YYYY-MM-DD.xlsx` o `pautas_YYYY-MM-DD.xlsx` en modelo flexible. |

Reglas:

| Regla | Comportamiento |
| --- | --- |
| Sin resultados visibles | El boton de exportacion queda deshabilitado. |
| Durante carga | El boton queda deshabilitado. |
| Modelo tradicional | Usa endpoints de evidencias. |
| Modelo flexible | Usa endpoints de elementos. |
| Error de exportacion | Muestra toast de error. |

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/estructura/procesos` | Cargar procesos y detectar tipo de modelo. |
| `GET` | `/estructura/evidencias/filter` | Buscar evidencias del modelo tradicional. |
| `GET` | `/elementos-asignaciones/filtrar` | Buscar asignaciones del modelo flexible. |
| `GET` | `/elementos-archivos` | Contar o listar recursos de elementos flexibles. |
| `GET` | `/estructura/dimensiones` | Cargar opciones de dimension. |
| `GET` | `/estructura/componentes` | Cargar opciones de componente. |
| `GET` | `/estructura/criterios` | Cargar opciones de entregable/criterio. |
| `GET` | `/estructura/evidencias/export/pdf` | Exportar evidencias tradicionales a PDF. |
| `GET` | `/estructura/evidencias/export/excel` | Exportar evidencias tradicionales a Excel. |
| `GET` | `/estructura/elementos/export/pdf` | Exportar elementos flexibles a PDF. |
| `GET` | `/estructura/elementos/export/excel` | Exportar elementos flexibles a Excel. |
| `GET` | `/evidencias/:id/asignaciones` | Resolver proceso para carga administrativa. |
| `GET` | `/elementos-archivos/:id/download` | Descargar archivo de modelo flexible. |
| `POST` | `/estructura/evidencias/:id/retroalimentacion` | Enviar retroalimentacion. |

Servicios relacionados desde el modal:

| Servicio | Uso |
| --- | --- |
| `fileService.listFiles` | Listar archivos por evidencia. |
| `fileService.uploadMultipleFiles` | Subir archivos administrativos. |
| `fileService.uploadMultipleLinks` | Subir enlaces administrativos. |
| `fileService.deleteFile` | Eliminar archivos tradicionales. |
| `evidenceAssignmentService.getAssignmentsByEvidence` | Cargar responsables de evidencias tradicionales. |
| `evidenceAssignmentService.getElementFiles` | Cargar archivos de elementos flexibles. |
| `evidenceAssignmentService.getElementAssignmentsByElement` | Cargar responsables de elementos flexibles. |
| `evidenceAssignmentService.deleteElementFile` | Eliminar archivo de elemento flexible. |

## Datos principales

Filtros:

```ts
interface EvidenceSearchFilters {
  proceso_id?: number | null;
  is_flexible?: boolean;
  dimension_id?: number | null;
  componente_id?: number | null;
  criterio?: string | null;
  elemento_id?: number | null;
  responsable_id?: number | null;
  fecha_publicacion_desde?: string | null;
  fecha_publicacion_hasta?: string | null;
  estado?: EvidencePublicationStatus | 'todos';
  rol_id?: number | null;
  busqueda_general?: string;
}
```

Resultado:

```ts
interface EvidenceSearchResult {
  evidencia_id: number;
  criterio_id: number;
  proceso_id?: number;
  nomenclatura: string;
  criterio_nomenclatura: string;
  criterio_descripcion: string;
  descripcion: string;
  fecha_publicacion: string;
  estado: EvidencePublicationStatus;
  responsables: Array<{
    usuario_id: number;
    nombre: string;
    email: string;
  }>;
  archivos_count: number;
  enlaces_count: number;
  roles_acceso: string[];
  created_at: string;
  updated_at: string;
}
```

Payload de retroalimentacion:

```ts
interface FeedbackPayload {
  estado: 'Observada' | 'Validada';
  comentario: string;
}
```

## Estados de carga y error

| Estado | Comportamiento |
| --- | --- |
| Cargando resultados | Muestra estado de carga en tabla y bloquea buscador/exportacion. |
| Error al buscar | Limpia resultados y muestra toast `Error al buscar`. |
| Sin resultados | Muestra el mensaje vacio de la tabla. |
| Error al exportar | Muestra toast `Error al exportar`. |
| Cargando detalle | Muestra texto de carga dentro del modal. |
| Error al cargar detalle | Deja el modal sin evidencias cargadas y registra error en consola. |
| Error al subir recursos | Muestra toast `Error al subir`. |
| Error al retroalimentar | Muestra toast segun el codigo recibido. |

## Reglas importantes para soporte y QA

- La opcion del menu requiere ciclo y proceso seleccionados.
- La pantalla no muestra selector visible de proceso; usa el proceso del contexto operativo.
- El modo tradicional consulta evidencias; el modo flexible consulta asignaciones de elementos.
- La busqueda del input es local sobre resultados ya cargados.
- La tabla principal solo tiene accion `Ver detalles`.
- La gestion administrativa de recursos depende de `archivos.make_public`.
- La retroalimentacion depende de `evidencias.edit`.
- Una evidencia en estado `Pendiente` no puede retroalimentarse desde la interfaz.
- La exportacion se deshabilita si no hay resultados visibles.
- La autorizacion final debe mantenerse en backend; el frontend controla visibilidad, validaciones y mensajes.
