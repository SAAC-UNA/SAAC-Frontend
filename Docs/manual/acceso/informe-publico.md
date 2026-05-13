---
title: Informe Publico
---

# Informe Publico

La vista Informe Publico permite consultar documentos publicados relacionados con acreditacion, especialmente resoluciones SINAES. Tambien muestra una pestaña de Informe Final Institucional con estructura de dimensiones, criterios y evidencias.

<div class="module-meta">

**Ruta:** `/informe-publico`  
**Archivo principal:** `src/Pages/AccreditationReport/AccreditationReportPublicPage.tsx`  
**Servicio:** `src/Services/AccreditationReportService.ts`  
**Vista administrativa relacionada:** `/informes-acreditacion`

</div>

## Vista principal

La pantalla usa la informacion del modulo `accreditation_report_public` para mostrar titulo y descripcion.

Incluye:

| Elemento | Descripcion |
| --- | --- |
| Encabezado | Titulo y descripcion de la vista publica. |
| Boton de administracion | Disponible solo si el usuario tiene permisos de informes. |
| Hero de resolucion vigente | Muestra la primera resolucion publicada disponible. |
| Tabs | `Resolucion SINAES` e `Informe Final Institucional`. |

## Acceso a vista administrativa

Si el usuario autenticado tiene permisos dentro de `REPORTS_ACCESS_PERMISSIONS`, se muestra un boton con tooltip `Vista administrativa`.

Al presionarlo, el sistema navega a:

```txt
/informes-acreditacion
```

Si el usuario no tiene permisos, el boton no aparece.

## Resolucion vigente

Cuando existen resoluciones publicadas, la pantalla toma la primera del historial como resolucion activa.

El bloque principal muestra:

| Campo | Descripcion |
| --- | --- |
| Estado | Badge `Publicado`. |
| Nombre del documento | Nombre original del archivo. |
| Publicado por | Nombre del usuario publicador. |
| Fecha | Fecha de publicacion. |
| Tamano | Tamano del archivo en MB. |
| Accion | Boton `Ver Resolucion`. |

El boton `Ver Resolucion` abre la URL publica del archivo en una pestana nueva.

## Sin informes publicados

Si la consulta termina y no hay resoluciones, la pantalla muestra:

```txt
Sin informes publicados
Actualmente no hay informes de acreditacion o resoluciones SINAES publicadas para esta carrera y sede.
```

## Tab Resolucion SINAES

Este tab muestra una tabla `Historial de resoluciones publicadas`.

Columnas:

| Columna | Descripcion |
| --- | --- |
| Documento | Nombre, fecha de publicacion y tamano. |
| Estado | Badge `Publicado` o `Borrador` segun estado recibido. |
| Acciones | Boton `Ver PDF`. |

El boton `Ver PDF` abre la URL publica del archivo.

## Tab Informe Final Institucional

Este tab muestra informacion estructurada en acordeones.

Niveles visibles:

| Nivel | Comportamiento |
| --- | --- |
| Dimension | Acordeon principal con nomenclatura, descripcion y cantidad de criterios. |
| Criterio | Acordeon secundario con nomenclatura, descripcion y cantidad de evidencias. |
| Evidencia | Fila con descripcion y botones de descarga de archivos asociados. |

Al final se muestra un bloque informativo con el titulo `Necesita mas informacion?`.

Nota tecnica: la estructura del Informe Final Institucional visible en esta pantalla esta definida actualmente como datos mock en el componente frontend.

## Filtro por contexto

La vista consulta resoluciones usando el contexto operacional actual.

Si existe `careerCampusId`, el servicio envia:

```ts
{
  carrera_campus_id: careerCampusId
}
```

Si no existe contexto de carrera, la consulta se realiza sin ese filtro.

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/informes-acreditacion` | Listar resoluciones publicadas. |

El servicio tambien define funciones para crear, actualizar, eliminar y despublicar informes, pero esas acciones pertenecen a la vista administrativa documentada en Informes de Acreditacion.

## Datos esperados

Cada resolucion se transforma a una estructura local con:

```ts
{
  id: string;
  estado: "publicado" | "despublicado";
  fecha_publicacion: string;
  observaciones: string | null;
  archivo: {
    id: string;
    nombre_original: string;
    tamanio: number;
    url: string;
  };
  publicado_por: {
    id: number;
    nombre: string;
  };
  publicado_at: string;
}
```

## Estados de pantalla

| Estado | Comportamiento |
| --- | --- |
| Cargando | La tabla muestra estado de carga. |
| Error al consultar | El error se silencia y la vista puede mostrar estado vacio. |
| Sin datos | Muestra mensaje de informes no publicados. |
| Con datos | Muestra resolucion vigente e historial. |

## Reglas importantes para soporte y QA

- La resolucion vigente corresponde al primer registro recibido en el historial.
- El Informe Final Institucional no consume datos reales en esta implementacion; usa datos mock.
- Para ver el boton hacia administracion se requieren permisos de informes.
- Las URLs publicas deben venir desde backend en `archivo.url_publica`.
- Esta vista esta relacionada con `/informes-acreditacion`, pero tiene comportamiento propio de consulta publica.
