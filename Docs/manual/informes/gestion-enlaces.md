---
title: Gestion de Enlaces
---

# Gestion de Enlaces

El submodulo Gestion de Enlaces permite revisar los entregables aprobados del proceso seleccionado, generar enlaces publicos para sus archivos y exportar un informe de evidencias con enlaces.

<div class="module-meta">

**Ruta:** `/gestion-enlaces`  
**Archivo principal:** `src/Pages/ReportManagement/FinalReports.tsx`  
**Componentes:** `src/Pages/ReportManagement/Components`  
**Acceso en menu:** `cap.reports.access`, `reportes.generate` o `reportes.export`  
**Requiere contexto:** ciclo y proceso seleccionados  
**Carpeta frontend:** `src/Pages/ReportManagement`

</div>

## Vista principal

La pantalla muestra un listado de criterios o elementos aprobados y permite administrar los enlaces publicos de los archivos asociados.

Elementos visibles:

| Elemento | Descripcion |
| --- | --- |
| Encabezado contextual | Muestra el contexto activo de carrera, ciclo y proceso. |
| Boton Generar | Genera enlaces publicos masivos para archivos sin enlace. |
| Boton Exportar | Permite exportar el informe en PDF o Excel. |
| Tabla | Lista entregables aprobados, archivos, enlaces y estado. |
| Filas expandibles | Muestran evidencias, fuentes o archivos asociados. |
| Modal de enlace publico | Permite generar, copiar o revocar enlaces. |

Los botones `Generar` y `Exportar` aparecen cuando hay proceso seleccionado y existen criterios/elementos aprobados.

## Acceso y contexto

La opcion de menu requiere contexto operativo activo.

Permisos:

| Permiso/capacidad | Uso |
| --- | --- |
| `cap.reports.access` | Permite acceder al modulo de informes. |
| `reportes.generate` | Permite acceso funcional a reportes. |
| `reportes.export` | Permite acceso funcional a exportacion. |

La pantalla obtiene el contexto desde `globalFilterContextService.getCatalog()` y sincroniza:

- Carrera/sede.
- Ciclo de acreditacion.
- Proceso seleccionado.

Si no existe proceso seleccionado, muestra:

```txt
No hay datos disponibles
Defina ciclo y proceso en Inicio para continuar
```

## Modo tradicional y modo flexible

El comportamiento depende del modelo de estructura del proceso seleccionado.

| Modelo | Elemento principal | Filas expandibles |
| --- | --- | --- |
| Tradicional | Criterios aprobados | Evidencias del criterio. |
| `elemento_flexible` | Pautas o elementos agrupadores aprobados | Fuentes/elementos hoja aprobados. |

En modelo flexible, la pantalla exporta y genera enlaces sobre fuentes o nodos hoja, no sobre los nodos padre.

## Carga de datos

### Modelo tradicional

La pantalla carga criterios aprobados para el proceso y sus evidencias asociadas.

Consultas:

| Endpoint | Uso |
| --- | --- |
| `GET /estructura/procesos` | Detectar proceso y tipo de modelo. |
| `GET /estructura/criterios` | Cargar criterios. |
| `GET /estructura/evidencias` | Cargar evidencias. |
| `GET /aprobaciones-criterios?estado=aprobado` | Identificar criterios aprobados. |
| `GET /archivos` | Cargar archivos de una evidencia. |

Reglas:

- Solo se muestran criterios con aprobacion `aprobado` para el proceso seleccionado.
- Las evidencias se normalizan por `id` y `criterio_id`.
- Los archivos se cargan por evidencia y proceso.
- Si una evidencia no tiene archivos cargados, se muestra como `Sin archivos`.

### Modelo flexible

La pantalla carga elementos aprobados del modelo flexible y sus archivos.

Consultas:

| Endpoint | Uso |
| --- | --- |
| `GET /estructura/procesos` | Detectar proceso, ciclo y modelo. |
| `GET /estructura/elementos?modelo_estructura_id=:id` | Cargar elementos del modelo. |
| `GET /aprobaciones-elementos?proceso_id=:id&estado=aprobado` | Identificar elementos aprobados del proceso. |
| `GET /elementos-archivos` | Cargar archivos de un elemento aprobado. |

Reglas:

- Solo se consideran elementos aprobados para el proceso seleccionado.
- La tabla intenta agrupar por elementos tipo `pauta`.
- Si no existen pautas, agrupa por elementos que tengan hijos.
- Si tampoco existen grupos, muestra los elementos aprobados como filas directas.

## Tabla de gestion

Columnas:

| Columna | Descripcion |
| --- | --- |
| Entregable | Nomenclatura y descripcion del criterio, pauta o elemento. |
| Archivos | Cantidad de archivos fisicos disponibles. |
| Con enlace | Cantidad de archivos con enlace publico sobre el total. |
| Estado | Estado global de enlaces del entregable. |

Estados de enlace:

| Estado | Descripcion |
| --- | --- |
| Completo | Todos los archivos tienen enlace publico. |
| Parcial | Solo algunos archivos tienen enlace publico. |
| Sin enlaces | Hay archivos, pero ninguno tiene enlace publico. |
| Sin evidencias | No hay evidencias/fuentes o archivos asociados. |
| Pendiente | Los archivos aun no se han cargado para calcular estado. |

## Filas expandibles

Cada fila principal se puede expandir.

En modelo tradicional, muestra las evidencias del criterio. En modelo flexible, muestra las fuentes o elementos hoja del grupo.

Por cada fila expandida:

| Estado | Comportamiento |
| --- | --- |
| Cargando archivos | Muestra `Cargando...`. |
| Archivo con enlace | Muestra badge `Enlace listo` y boton para abrir/gestionar enlace. |
| Archivo sin enlace | Muestra badge `Sin enlace` y boton para gestionar enlace publico. |
| Sin archivos | Muestra badge `Sin archivos`. |

Si no hay elementos internos:

```txt
Sin evidencias disponibles
```

## Gestion de enlace publico individual

El modal `Enlace publico` se abre desde la accion de enlace de una evidencia, fuente o archivo.

### Sin enlace publico

Cuando el archivo no tiene enlace, muestra:

```txt
Sin enlace publico
```

Accion disponible:

| Accion | Endpoint |
| --- | --- |
| Generar enlace publico tradicional | `POST /archivos/:id/make-public` |
| Generar enlace publico flexible | `POST /elementos-archivos/:id/make-public` |

La pantalla intenta primero el endpoint tradicional. Si recibe `404`, intenta el endpoint flexible.

Exito:

```txt
Enlace publico generado
El enlace publico se genero exitosamente.
```

### Con enlace publico activo

Cuando el archivo ya tiene enlace, el modal muestra:

- Nombre del archivo.
- URL publica.
- Fecha de expiracion si existe `link_expira_en`.
- Boton para copiar enlace.
- Boton para revocar enlace.

La URL se resuelve en este orden:

1. `token_publico`, usando `FRONTEND_BASE_URL/p/:token`.
2. `url_publica_carpeta`.
3. `url_publica`.

Informacion visible:

```txt
Cualquier persona con este enlace puede acceder al archivo
No se requiere autenticacion para ver el contenido
Puede revocar el enlace en cualquier momento
```

### Copiar enlace

El boton copiar usa el portapapeles del navegador.

| Resultado | Comportamiento |
| --- | --- |
| Exito | Cambia temporalmente el tooltip a `¡Enlace copiado!`. |
| Error | Muestra toast `Error al copiar`. |

### Revocar enlace

El boton de revocar abre confirmacion.

Mensaje:

```txt
¿Esta seguro de que desea revocar este enlace publico?
```

Footer:

```txt
El enlace actual dejara de funcionar inmediatamente
```

Endpoints:

| Accion | Endpoint |
| --- | --- |
| Revocar enlace tradicional | `POST /archivos/:id/revoke-public` |
| Revocar enlace flexible | `POST /elementos-archivos/:id/revoke-public` |

Igual que al generar, si el endpoint tradicional responde `404`, se intenta el flexible.

Exito:

```txt
Enlace publico revocado
El enlace publico se revoco exitosamente.
```

## Generacion masiva de enlaces

El boton `Generar` abre el modal `Generar enlaces publicos`.

Alcance:

| Modelo | Alcance |
| --- | --- |
| Tradicional | Todas las evidencias de los criterios aprobados. |
| Flexible | Todas las fuentes de los elementos aprobados. |

Mensaje:

```txt
¿Esta seguro que desea generar enlaces publicos para ...? Esta accion puede tardar un momento.
```

Flujo:

1. Recolecta archivos adjuntos del proceso.
2. Excluye archivos que ya son publicos.
3. Si no hay pendientes, muestra toast `No hay archivos sin enlace publico`.
4. Envia los IDs pendientes a generacion masiva.
5. Recarga archivos para actualizar los estados de la tabla.

Endpoint:

```txt
POST /archivos/bulk-make-public
```

Payload:

```ts
{
  archivos_ids: number[];
}
```

Exito:

```txt
Se generaron X enlaces publicos exitosamente
```

## Exportacion

El boton `Exportar` permite descargar el informe en PDF o Excel.

### Exportar a PDF

El PDF se genera en frontend con `usePdfExport()`.

Incluye metadata:

| Campo | Descripcion |
| --- | --- |
| Carrera | Carrera/sede del contexto. |
| Ciclo | Ciclo seleccionado. |
| Proceso | Proceso seleccionado. |
| Generado | Fecha y hora de generacion. |

Columnas:

| Modelo | Columnas |
| --- | --- |
| Tradicional | Criterio, Evidencia, Enlace. |
| Flexible | Elemento, Archivo, Enlace. |

Si no hay filas para exportar, muestra:

```txt
No hay evidencias para exportar
```

### Exportar a Excel

El Excel se descarga desde backend.

Endpoint:

```txt
GET /estructura/evidencias/export/excel
```

Nombre del archivo:

```txt
informe_evidencias_{procesoId}_{timestamp}.xlsx
```

Si falla, muestra toast:

```txt
Error al exportar
No se pudo generar el informe en Excel
```

## Archivos considerados validos

La pantalla solo considera un archivo como adjunto si cumple:

- Tiene `archivo_id` numerico mayor a 0.
- Tiene al menos una referencia fisica o publica:
  - `ruta_archivo`
  - `nombre_original`
  - `url_publica`
  - `url_publica_carpeta`
  - `token_publico`

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/estructura/procesos` | Cargar procesos y detectar modelo. |
| `GET` | `/estructura/criterios` | Cargar criterios tradicionales. |
| `GET` | `/estructura/evidencias` | Cargar evidencias tradicionales. |
| `GET` | `/aprobaciones-criterios` | Obtener criterios aprobados. |
| `GET` | `/estructura/elementos` | Cargar elementos flexibles. |
| `GET` | `/aprobaciones-elementos` | Obtener elementos aprobados. |
| `GET` | `/archivos` | Cargar archivos tradicionales. |
| `GET` | `/elementos-archivos` | Cargar archivos flexibles. |
| `POST` | `/archivos/:id/make-public` | Generar enlace publico tradicional. |
| `POST` | `/elementos-archivos/:id/make-public` | Generar enlace publico flexible. |
| `POST` | `/archivos/:id/revoke-public` | Revocar enlace tradicional. |
| `POST` | `/elementos-archivos/:id/revoke-public` | Revocar enlace flexible. |
| `POST` | `/archivos/bulk-make-public` | Generar enlaces publicos masivos. |
| `GET` | `/estructura/evidencias/export/excel` | Exportar informe en Excel. |

## Datos principales

Archivo:

```ts
interface Archivo {
  archivo_id: number;
  nombre_original: string;
  ruta_archivo: string;
  token_publico?: string;
  url_publica?: string;
  url_publica_carpeta?: string;
  is_publico: boolean;
  link_expira_en?: string;
}
```

Evidencia:

```ts
interface Evidencia {
  id: number;
  nomenclatura: string;
  descripcion: string;
  criterio_id: number;
  archivos?: Archivo[];
}
```

Criterio o elemento:

```ts
interface Criterio {
  id: number;
  nomenclatura: string;
  descripcion: string;
  padre_id?: number | null;
  tipo?: string | null;
  estado_aprobacion?: 'pendiente' | 'aprobado' | 'rechazado';
  archivos?: Archivo[];
}
```

## Estados de carga y error

| Estado | Comportamiento |
| --- | --- |
| Cargando contexto | Muestra `LoadingSpinner`. |
| Cargando datos | Muestra `LoadingSpinner`. |
| Error al cargar informe | Muestra toast `Error al cargar informe`. |
| Sin proceso | Muestra aviso para definir ciclo y proceso en Inicio. |
| Sin aprobados | Muestra `No hay criterios aprobados` o `No hay elementos aprobados`. |
| Error cargando archivos | Marca el item con lista vacia para evitar reintentos infinitos. |
| Error al generar enlace | Muestra toast `Error al generar enlace`. |
| Error al revocar enlace | Muestra toast `Error al revocar enlace`. |
| Error al exportar Excel | Muestra toast `Error al exportar`. |

## Reglas importantes para soporte y QA

- La pantalla solo trabaja sobre criterios o elementos aprobados.
- La generacion masiva no vuelve a generar enlaces para archivos que ya son publicos.
- Un enlace publico permite acceso sin autenticacion.
- Revocar un enlace lo invalida inmediatamente.
- En modelo flexible se trabaja sobre fuentes o elementos hoja aprobados.
- El PDF se genera en frontend; el Excel se solicita al backend.
- La autorizacion final debe mantenerse en backend; el frontend controla visibilidad, confirmaciones y mensajes.
