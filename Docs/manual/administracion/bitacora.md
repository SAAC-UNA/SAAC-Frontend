---
title: Bitacora del Sistema
---

# Bitacora del Sistema

La Bitacora del Sistema permite consultar eventos y acciones registradas por la aplicacion. Su objetivo es facilitar trazabilidad, auditoria y revision de actividad dentro del sistema.

<div class="module-meta">

**Ruta:** `/bitacora`  
**Archivo principal:** `src/Pages/AuditLog/AuditLogPage.tsx`  
**Componentes clave:** `AuditLogFilters`, `AuditLogTable`, `AuditLogDetailModal`  
**Servicio:** `src/Services/AuditLogService.ts`  
**Acceso en menu:** `cap.audit.view` o permiso `bitacora.view`

</div>

## Vista principal

Al ingresar a Bitacora del Sistema, el frontend carga registros paginados mediante `AuditLogService.getAuditLogs()`.

Elementos principales:

| Elemento | Descripcion |
| --- | --- |
| Encabezado | Muestra el titulo y descripcion del modulo. |
| Buscador | Campo para busqueda libre por usuario, modulo, accion o detalle. |
| Exportar | Menu para generar PDF o Excel cuando existe rango de fechas. |
| Filtros | Boton de filtros que muestra u oculta el panel avanzado. |
| Tabla | Lista registros de auditoria con usuario, modulo, fecha, hora y accion. |
| Modal de detalle | Muestra toda la informacion del registro seleccionado. |

## Busqueda

El buscador usa debounce de 300 ms. Al cambiar el termino de busqueda, el frontend consulta nuevamente al backend desde la pagina 1.

Placeholder visible:

```txt
Buscar por usuario, modulo, accion, detalle...
```

La busqueda se envia como parametro `search` junto con los filtros activos.

## Filtros avanzados

El panel de filtros se abre desde el boton de filtro del encabezado. Los filtros se aplican automaticamente al cambiar cada campo.

| Filtro | Control | Fuente de datos | Comportamiento |
| --- | --- | --- | --- |
| Usuario | Select buscable | `userService.listUsers()` | Permite filtrar por usuario especifico. |
| Modulo del Sistema | Select buscable | `GET /bitacora/modulos` | Permite filtrar por modulo registrado en bitacora. |
| Tipo de Accion | Select buscable | `GET /bitacora/tipos-accion` | Permite filtrar por descripcion de accion. |
| Fecha inicio | DatePicker | Usuario | Define `fecha_desde`; no permite ser posterior a fecha fin. |
| Fecha fin | DatePicker | Usuario | Define `fecha_hasta`; no permite ser anterior a fecha inicio. |

Si hay filtros activos, aparece un boton para limpiarlos. Al limpiar, se restablecen todos los filtros y se consulta nuevamente sin filtros avanzados.

## Tabla de registros

| Columna | Descripcion |
| --- | --- |
| Usuario | Nombre del usuario que ejecuto la accion. Si no existe usuario, muestra `Sistema`. Debajo puede mostrar correo. |
| Modulo | Modulo asociado al registro. Si no existe, muestra `Sin modulo`. |
| Fecha | Fecha del evento, formateada desde `fecha_hora`. |
| Hora | Hora del evento, formateada desde `fecha_hora`. |
| Accion | Badge con el tipo de accion registrado. |
| Acciones | Boton para ver detalle completo. |

La tabla usa paginacion del backend. El tamano de pagina se toma de `TABLE_PAGE_SIZE.standard`.

Mensaje cuando no hay resultados:

```txt
No hay registros de bitacora que coincidan con los filtros aplicados
```

## Ver detalle

La accion Ver abre `AuditLogDetailModal`.

El modal muestra:

| Campo | Descripcion |
| --- | --- |
| Nombre | Usuario que ejecuto la accion. Si no existe, muestra `Desconocido`. |
| Correo electronico | Correo del usuario, si esta disponible. |
| Rol | Roles del usuario como badges. |
| Tipo de accion | Badge de accion. |
| Modulo | Modulo afectado por el evento. |
| Detalle | Texto descriptivo completo del registro. |
| Fecha y hora | Fecha principal del evento. |
| Registrado el | Fecha de creacion del registro. |

Al final del modal se muestra la nota:

```txt
Registro inmutable
Este registro no puede ser modificado ni eliminado para garantizar la trazabilidad y seguridad del sistema.
```

## Exportar bitacora

El boton `Exportar` muestra dos opciones:

- Exportar a PDF.
- Exportar a Excel.

Reglas visibles:

| Regla | Comportamiento |
| --- | --- |
| Rango de fechas obligatorio | Si falta fecha inicio o fecha fin, se muestra toast de error. |
| Sin registros | Las opciones se deshabilitan si no hay registros cargados. |
| Durante carga | El boton se deshabilita mientras `isLoading` es verdadero. |
| Fechas presentes | Se envia la exportacion al backend con formato y filtros aplicables. |

Si el usuario intenta exportar sin fechas, se muestra:

```txt
Debe seleccionar un rango de fechas (desde - hasta) para exportar la bitacora
```

Cuando inicia la exportacion, se muestra un toast informativo. Si termina correctamente, el frontend descarga el archivo y muestra un toast de exito.

Nombre de archivo por defecto:

| Formato | Nombre |
| --- | --- |
| PDF | `bitacora_YYYY-MM-DD.pdf` |
| Excel | `bitacora_YYYY-MM-DD.xlsx` |

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/bitacora` | Obtener registros paginados con filtros. |
| `GET` | `/bitacora/:id` | Obtener detalle de un registro especifico. |
| `GET` | `/bitacora/export` | Exportar registros a PDF o Excel. |
| `GET` | `/bitacora/modulos` | Obtener catalogo de modulos registrados. |
| `GET` | `/bitacora/tipos-accion` | Obtener catalogo de tipos de accion. |
| `GET` | `/admin/users` | Obtener usuarios para el filtro por usuario. |

Parametros usados en consulta:

```ts
interface AuditLogFilters {
  usuario_id?: number;
  tipo_accion_id?: number;
  tipo_accion?: string;
  modulo?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  search?: string;
  page?: number;
  per_page?: number;
}
```

## Datos que recibe el frontend

Cada registro de bitacora tiene esta forma:

```ts
interface AuditLog {
  bitacora_id: number;
  usuario: AuditLogUser | null;
  tipo_accion: ActionType;
  modulo: string | null;
  detalle: string | null;
  fecha_hora: string;
  created_at: string;
}
```

El usuario del registro puede venir como `null`, por ejemplo en eventos generados por el sistema o escenarios donde no hay usuario autenticado asociado.

La respuesta paginada esperada por el frontend incluye:

```ts
interface AuditLogPaginatedResponse {
  data: AuditLog[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}
```

## Estados de carga y error

| Estado | Comportamiento |
| --- | --- |
| Cargando registros | La tabla recibe `loading` y muestra el estado de carga. |
| Error al cargar registros | Se muestra `BackendErrorAlert` sobre la tabla. |
| Error 403 al consultar | El servicio muestra mensaje de acceso denegado para usuarios sin permiso suficiente. |
| Error 404 al consultar detalle | El servicio devuelve `Registro de bitacora no encontrado.` |
| Error al cargar catalogos | Cada catalogo falla de forma independiente; los demas pueden seguir disponibles. |
| Error al exportar | Se muestra toast de error con el mensaje disponible. |

## Reglas importantes para soporte y QA

- La bitacora es de consulta; no hay acciones para crear, editar o eliminar registros.
- La exportacion requiere fecha inicio y fecha fin.
- Los filtros se aplican automaticamente al cambiar un valor.
- La busqueda vuelve a consultar al backend y reinicia en pagina 1.
- El detalle debe comunicar que el registro es inmutable.
- El backend debe mantener la autorizacion final; el frontend solo controla visibilidad y flujo.
