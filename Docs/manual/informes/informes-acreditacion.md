---
title: Informes de Acreditacion
---

# Informes de Acreditacion

El submodulo Informes de Acreditacion permite administrar archivos oficiales asociados al proceso seleccionado y consultar, desde la vista publica, resoluciones e informes publicados.

<div class="module-meta">

**Ruta:** `/informes-acreditacion`  
**Vista publica relacionada:** `/informe-publico`  
**Archivo principal:** `src/Pages/AccreditationReport/AccreditationReportAdminPage.tsx`  
**Vista publica:** `src/Pages/AccreditationReport/AccreditationReportPublicPage.tsx`  
**Servicios:** `src/Services/ReportFileService.ts`, `src/Services/AccreditationReportService.ts`  
**Acceso en menu:** `cap.reports.access`, `reportes.generate` o `reportes.export`  
**Requiere contexto:** ciclo y proceso seleccionados  
**Carpeta frontend:** `src/Pages/AccreditationReport`

</div>

## Vista administrativa

La ruta `/informes-acreditacion` muestra la vista administrativa para archivos fisicos de informes. Trabaja sobre el proceso activo del contexto operacional.

Elementos visibles:

| Elemento | Descripcion |
| --- | --- |
| Encabezado contextual | Usa el proceso seleccionado en el filtro global. |
| Buscador | Campo `Buscar por nombre, visibilidad...`. |
| Boton Subir | Abre el modal para cargar archivos. |
| Tabs | Clasifican los archivos por tipo de informe. |
| Tabla | Lista archivos de la categoria activa. |
| Modal de detalle | Muestra metadata completa del archivo. |
| Confirmacion de eliminacion | Protege la eliminacion de archivos. |

## Acceso y contexto

La opcion del menu requiere contexto con ciclo y proceso seleccionados.

Permisos:

| Permiso/capacidad | Uso |
| --- | --- |
| `cap.reports.access` | Permite acceder a pantallas de informes. |
| `reportes.generate` | Permite acceso funcional a reportes. |
| `reportes.export` | Permite acceso funcional a reportes/exportacion. |

La pantalla toma el proceso desde `useOperationalContextSnapshot()`.

Si no hay proceso activo, muestra:

```txt
Seleccione un proceso
Para gestionar los informes de acreditacion, primero debe seleccionar una carrera, ciclo y proceso en el filtro superior.
```

El boton `Subir` queda deshabilitado si no hay proceso.

## Categorias de informes

La pantalla organiza los archivos por tabs.

Categorias:

| Tab | Uso |
| --- | --- |
| Informes Universitarios | Informes internos o institucionales de la universidad. |
| Informes SINAES | Documentos enviados o relacionados con SINAES. |
| Resoluciones SINAES | Resoluciones oficiales de acreditacion. |
| Certificaciones | Certificaciones asociadas al proceso. |

Al cambiar de tab, se limpia la busqueda.

El valor del tab activo se envia como `tipo` al backend al subir archivos.

## Consulta de archivos

Al cargar la pantalla o cambiar el proceso, se consultan los archivos del proceso activo.

Endpoint:

```txt
GET /informes-archivos?proceso_id=:id
```

Reglas:

| Regla | Comportamiento |
| --- | --- |
| Sin proceso | La lista queda vacia. |
| Carga correcta | Se muestran archivos filtrados por tab activo. |
| Error de carga | Muestra toast `Error al cargar archivos`. |

La tabla filtra localmente por:

- Nombre original.
- Visibilidad: publico o privado.
- Fecha formateada.
- Fecha ISO `YYYY-MM-DD`.

## Tabla de archivos

Columnas:

| Columna | Descripcion |
| --- | --- |
| Nombre del Archivo | Muestra tipo/categoria, nombre original y fecha de subida. |
| Visibilidad | Badge `Publico` o `Privado`. |
| Acciones | Ver detalle, cambiar visibilidad, copiar enlace, descargar y eliminar. |

Mensaje vacio:

```txt
No hay informes registrados para esta categoria.
```

Mientras carga:

```txt
Cargando informes...
```

## Subir informes

El boton `Subir` abre el modal `Subir Informes de Acreditacion`.

Campos y reglas:

| Campo | Regla |
| --- | --- |
| Archivos | Permite seleccionar hasta 5 archivos. |
| Formatos | El footer indica PDF, Word y Excel. |
| Proceso | Obligatorio; si no existe proceso activo, no se puede subir. |
| Categoria | Se toma del tab activo. |

Endpoint:

```txt
POST /informes-archivos
```

Payload multipart:

```txt
proceso_id: number
tipo: string
archivos[]: File[]
```

Durante la carga se muestra progreso por archivo.

Resultados:

| Resultado | Comportamiento |
| --- | --- |
| Exito | Toast `Carga exitosa`, cierra modal y recarga tabla. |
| Error | Marca progreso en error y muestra toast `Error al subir`. |
| Sin archivos | Toast `Validacion`: `Seleccione al menos un archivo.` |

## Detalle del archivo

La accion `Ver detalles` abre el modal `Detalles del Archivo`.

Endpoint:

```txt
GET /informes-archivos/:id
```

Campos visibles:

| Campo | Descripcion |
| --- | --- |
| Nombre original | Nombre del archivo subido. |
| Tipo MIME | Tipo tecnico del archivo, si viene en la respuesta. |
| Fecha de subida | Fecha y hora de carga. |
| Tamano | Tamano en MB, si existe. |
| Visibilidad | Badge `Publico` o `Privado`. |

Mientras carga:

```txt
Cargando informacion del archivo...
```

Si falla el detalle, muestra toast `Error al cargar detalle`.

## Cambiar visibilidad

La accion de encendido/apagado cambia si el archivo es publico o privado.

| Estado actual | Tooltip | Endpoint |
| --- | --- | --- |
| Privado | `Hacer publico` | `POST /informes-archivos/:id/make-public` |
| Publico | `Hacer privado` | `POST /informes-archivos/:id/revoke-public` |

Al cambiar correctamente:

| Accion | Mensaje |
| --- | --- |
| Hacer publico | `El archivo ahora es publico.` |
| Hacer privado | `El archivo ahora es privado.` |

Si falla:

```txt
No se pudo cambiar la visibilidad.
```

## Copiar enlace publico

La accion de copiar enlace solo esta habilitada cuando:

- El archivo esta publico.
- Existe `url_publica`.

Tooltip si no aplica:

```txt
Disponible cuando el archivo sea publico
```

Al copiar correctamente:

```txt
Copiado
Enlace publico copiado al portapapeles.
```

Si falla:

```txt
No se pudo copiar el enlace publico.
```

## Descargar archivo

La accion descargar abre una nueva pestana con la URL absoluta del backend.

Endpoint:

```txt
GET /informes-archivos/:id/download
```

La URL se construye con el `baseURL` de `axiosInstance`, por lo que mantiene el mismo origen/API configurado del sistema.

## Eliminar archivo

La accion `Eliminar` abre `DeleteConfirmationModal`.

Datos:

| Campo | Valor |
| --- | --- |
| Titulo | `Eliminar Archivo` |
| Item | Nombre original del archivo. |
| Confirmacion | `Si, eliminar` |
| Footer | `Esta accion no se puede deshacer.` |

Endpoint:

```txt
DELETE /informes-archivos/:id
```

Resultados:

| Resultado | Comportamiento |
| --- | --- |
| Exito | Toast `Archivo eliminado` y recarga tabla. |
| Error | Toast `Error al eliminar`. |

## Vista publica relacionada

La ruta `/informe-publico` muestra una vista de consulta para resoluciones e informes publicados.

Archivo:

```txt
src/Pages/AccreditationReport/AccreditationReportPublicPage.tsx
```

Tabs:

| Tab | Descripcion |
| --- | --- |
| Resolucion SINAES | Muestra resoluciones publicadas desde backend. |
| Informe Final Institucional | Muestra un acordeon institucional actualmente alimentado con datos mock en frontend. |

Si el usuario tiene permisos de reportes, aparece un boton para volver a la vista administrativa.

## Resoluciones publicadas

La vista publica consulta:

```txt
GET /informes-acreditacion
```

Parametro usado cuando hay contexto:

```txt
carrera_campus_id
```

La respuesta se transforma a resoluciones con:

| Campo local | Fuente |
| --- | --- |
| Documento | `archivo.nombre_original` |
| Estado | `estado` |
| URL | `archivo.url_publica` |
| Publicado por | `publicado_por.nombre` |
| Fecha publicacion | `fecha_publicacion` o `created_at` |
| Tamano | `archivo.tamanio` |

La resolucion activa es el primer elemento del historial recibido.

Si existe resolucion activa, se muestra un bloque destacado `Resolucion de Acreditacion Vigente` con boton `Ver Resolucion`.

Si no hay informes publicados:

```txt
Sin informes publicados
Actualmente no hay informes de acreditacion o resoluciones SINAES publicadas para esta carrera y sede.
```

## Historial publico

Dentro del tab `Resolucion SINAES`, se muestra la tabla `Historial de resoluciones publicadas`.

Columnas:

| Columna | Descripcion |
| --- | --- |
| Documento | Nombre, fecha de publicacion y tamano. |
| Estado | Badge `Publicado` o `Borrador`. |
| Acciones | Boton `Ver PDF`. |

Estado vacio:

```txt
No se encontraron resoluciones historicas.
```

## Informe Final Institucional

El tab `Informe Final Institucional` muestra un acordeon por dimensiones, criterios, evidencias y archivos.

Importante:

```txt
Esta seccion usa datos mock definidos en frontend.
```

Estructura visible:

| Nivel | Descripcion |
| --- | --- |
| Dimension | Encabezado colapsable con cantidad de criterios. |
| Criterio | Subnivel colapsable con cantidad de evidencias. |
| Evidencia | Muestra nomenclatura, descripcion y botones de archivo. |
| Archivo | Boton para abrir/descargar el recurso. |

## Servicio de publicacion de acreditacion

El servicio `AccreditationReportService.ts` contiene funciones para flujo de resoluciones publicadas, aunque la vista administrativa actual usa principalmente `ReportFileService.ts`.

Funciones disponibles:

| Funcion | Endpoint |
| --- | --- |
| `fetchReports` | `GET /informes-acreditacion` |
| `fetchAdminReports` | `GET /admin/informes-acreditacion` |
| `fetchReportByCycle` | `GET /estructura/ciclos-acreditacion/:cycle/informe` |
| `publishReport` | `POST /estructura/ciclos-acreditacion/:cycle/informe` |
| `updateReport` | `PUT /informes-acreditacion/:report` |
| `deleteReport` | `DELETE /informes-acreditacion/:report` |
| `unpublishReport` | `PATCH /informes-acreditacion/:report/despublicar` |

## Endpoints usados

### Vista administrativa

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/informes-archivos` | Listar archivos por proceso. |
| `GET` | `/informes-archivos/:id` | Obtener detalle de un archivo. |
| `POST` | `/informes-archivos` | Subir archivos de informe. |
| `POST` | `/informes-archivos/:id/make-public` | Hacer publico un archivo. |
| `POST` | `/informes-archivos/:id/revoke-public` | Revocar visibilidad publica. |
| `GET` | `/informes-archivos/:id/download` | Descargar archivo. |
| `DELETE` | `/informes-archivos/:id` | Eliminar archivo. |

### Vista publica/resoluciones

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/informes-acreditacion` | Listar resoluciones publicadas. |
| `GET` | `/admin/informes-acreditacion` | Listado administrativo de resoluciones. |
| `GET` | `/estructura/ciclos-acreditacion/:cycle/informe` | Obtener informe de un ciclo. |
| `POST` | `/estructura/ciclos-acreditacion/:cycle/informe` | Publicar informe de acreditacion. |
| `PUT` | `/informes-acreditacion/:report` | Actualizar informe publicado. |
| `DELETE` | `/informes-acreditacion/:report` | Eliminar informe publicado. |
| `PATCH` | `/informes-acreditacion/:report/despublicar` | Despublicar informe. |

## Datos principales

Archivo administrativo:

```ts
interface ReportFileApi {
  informe_archivo_id: number;
  nombre_original: string;
  fecha_subida: string | null;
  tipo: string;
  url?: string;
  tamanio?: number;
  tipo_mime?: string;
  is_publico: boolean;
  token_publico?: string | null;
  url_publica?: string;
  url_publica_carpeta?: string;
  link_expira_en?: string | null;
  usuario_id: number;
  proceso_id: number;
}
```

Resolucion publica:

```ts
interface AccreditationReportApi {
  informe_archivo_id: number;
  estado: 'publicado' | 'despublicado';
  fecha_publicacion: string | null;
  observaciones: string | null;
  created_at: string | null;
  updated_at: string | null;
  archivo: {
    nombre_original: string;
    tipo_mime: string | null;
    tamanio: number | null;
    is_publico: boolean;
    url_publica: string | null;
  } | null;
}
```

Payload de publicacion:

```ts
interface PublishReportPayload {
  archivo: File;
  proceso_id: number;
  observaciones?: string;
}
```

## Estados de carga y error

| Estado | Comportamiento |
| --- | --- |
| Sin proceso | Muestra tarjeta indicando seleccionar proceso. |
| Cargando archivos | Tabla muestra `Cargando informes...`. |
| Error al cargar archivos | Toast `Error al cargar archivos`. |
| Error al subir | Toast `Error al subir`. |
| Error al cargar detalle | Toast `Error al cargar detalle`. |
| Error al cambiar visibilidad | Toast `Error`. |
| Error al copiar enlace | Toast `Error`. |
| Error al eliminar | Toast `Error al eliminar`. |
| Vista publica cargando | La tabla muestra estado de carga. |
| Error publico | Se silencia en la vista publica y se muestra estado vacio si no hay datos. |

## Reglas importantes para soporte y QA

- La vista administrativa requiere proceso seleccionado.
- Los archivos se clasifican por el tab activo al momento de subir.
- Se pueden subir hasta 5 archivos por operacion desde el frontend.
- El buscador solo filtra dentro de la categoria activa.
- Copiar enlace requiere archivo publico y `url_publica`.
- Hacer publico/privado actualiza la fila en memoria sin recargar toda la tabla.
- Eliminar archivo siempre pide confirmacion.
- La vista publica de resoluciones consume backend; el Informe Final Institucional actual usa datos mock.
- La autorizacion final debe mantenerse en backend; el frontend controla visibilidad, estados y mensajes.
