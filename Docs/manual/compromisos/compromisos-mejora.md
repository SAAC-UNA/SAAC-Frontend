---
title: Compromisos de Mejora
---

# Compromisos de Mejora

El modulo Compromisos de Mejora permite crear compromisos vinculados a un ciclo/proceso, seleccionar criterios o elementos del modelo flexible, asignar responsables y consultar el avance registrado.

<div class="module-meta">

**Rutas:** `/compromisos`, `/compromisos/nuevo`, `/compromisos/editar`, `/compromisos/detalle`  
**Archivo listado:** `src/Pages/ImprovementCommitments/CompromisosList.tsx`  
**Archivo configuracion:** `src/Pages/ImprovementCommitments/CreateImprovementCommitment.tsx`  
**Archivo detalle:** `src/Pages/ImprovementCommitments/CompromisoDetalle.tsx`  
**Componentes:** `src/Pages/ImprovementCommitments/Components`  
**Servicio:** `src/Services/ImprovementCommitmentService.ts`  
**Acceso:** `cap.improvement.access` o permisos `compromisos_mejora.view`, `compromisos_mejora.create`, `compromisos_mejora.edit`

</div>

## Rutas enlazadas

Este modulo no tiene actualmente una entrada dedicada en `Navigation.ts`. Aun asi, sus rutas estan registradas en `src/App.tsx` y se abren desde acciones internas, por ejemplo al configurar compromisos desde Procesos de Acreditacion.

| Ruta | Uso |
| --- | --- |
| `/compromisos` | Listar compromisos de mejora. |
| `/compromisos/nuevo` | Configurar un compromiso nuevo. |
| `/compromisos/editar` | Editar configuracion existente. |
| `/compromisos/detalle` | Consultar detalle; recibe el ID por `location.state`. |

Si se abre `/compromisos/detalle` sin `state.id`, el frontend redirige al listado.

## Listado de compromisos

La pantalla `/compromisos` muestra tarjetas de compromisos registrados.

Elementos visibles:

| Elemento | Descripcion |
| --- | --- |
| Encabezado | Titulo y descripcion del modulo. |
| Boton Crear compromiso | Navega a `/compromisos/nuevo`. |
| Tarjetas | Una tarjeta por compromiso. |
| Estado | Badge segun estado o vencimiento. |
| Acciones | Ver detalle y crear nuevo compromiso. |

Datos por tarjeta:

| Dato | Descripcion |
| --- | --- |
| Descripcion | Texto del compromiso o fallback `Compromiso {id}`. |
| Periodo | Fecha inicio y fecha fin. |
| Proceso | Nombre del proceso o `#{proceso_id}`. |
| Criterios | Cantidad de selecciones. |
| Evidencias asignadas | Cantidad de evidencias asociadas. |

Estados:

```txt
Pendiente
En Progreso
Completado
Vencido
```

Si `is_overdue` viene activo, el badge se muestra como `Vencido` aunque el estado base sea otro.

## Carga del listado

Endpoint:

```txt
GET /compromisos-de-mejora?per_page=50
```

Estados:

| Estado | Comportamiento |
| --- | --- |
| Cargando | Muestra `LoadingSpinner`. |
| Error | Muestra `No fue posible cargar los compromisos de mejora.` |
| Sin datos | Muestra `No hay compromisos registrados`. |

## Configurar compromiso

La pantalla `/compromisos/nuevo` usa un formulario tipo wizard con tabla de criterios o elementos y modales de configuracion.

Tambien puede ejecutarse en modo embebido desde Procesos de Acreditacion. En ese caso recibe por `location.state` o `contextState`:

- `procesoId`
- `cicloId`
- `startDate`
- `estimatedEndDate`
- `description`
- `modeloTipo`
- `modeloId`

Cuando viene desde un proceso, el ciclo y las fechas pueden venir predefinidas y no se muestran como campos editables principales.

## Encabezado de configuracion

Controles:

| Control | Comportamiento |
| --- | --- |
| Ciclo | Selector obligatorio cuando no viene desde un proceso. |
| Buscar elementos | Filtra criterios o elementos visibles. |
| Configurar | Valida y abre confirmacion. |

Campo de periodo:

| Campo | Regla |
| --- | --- |
| Fecha inicio | Obligatoria si no viene desde proceso. |
| Fecha fin | Obligatoria si no viene desde proceso y debe ser posterior a fecha inicio. |

La descripcion del compromiso es opcional, pero si se ingresa no puede exceder 100 caracteres.

## Modelo tradicional

En modelo tradicional se configuran criterios y evidencias.

Fuente de datos:

| Endpoint | Uso |
| --- | --- |
| `GET /estructura/ciclos-acreditacion` | Cargar ciclos para el selector. |
| `GET /estructura/criterios?activo=true` | Cargar criterios activos. |
| `GET /estructura/evidencias?criterio_id=:id` | Cargar evidencias del criterio. |
| `GET /admin/users` | Cargar usuarios para responsables. |
| `GET /roles` | Cargar roles para responsables. |

Tabla:

| Columna | Descripcion |
| --- | --- |
| Criterio | Nomenclatura, descripcion y componente padre. |
| Destinatarios | Avatares de usuarios/roles seleccionados. |
| Estado | `Seleccionado` o `Pendiente`. |
| Acciones | Configurar, editar configuracion o eliminar criterio. |

## Configurar criterio

El modal `Configurar Criterio` o `Editar Criterio` permite definir el alcance del compromiso para un criterio.

Campos:

| Campo | Obligatorio | Regla |
| --- | --- | --- |
| Evidencias a incluir | Si | Debe seleccionarse al menos una evidencia. |
| Usuarios | No, si hay roles | Solo usuarios activos. |
| Roles | No, si hay usuarios | Muestra metadata con cantidad de usuarios por rol. |
| Fecha limite | Si | Minimo la fecha actual. |
| Comentario | No | Maximo 500 caracteres. |

Regla de destinatarios:

```txt
Debe seleccionar al menos un usuario o un rol
```

El selector de evidencias permite `Seleccionar todos` y `Deseleccionar todos`.

## Modelo flexible

En modelo flexible se configuran elementos. La pantalla carga elementos del modelo asociado y detecta hojas/fuentes.

Fuente de datos:

| Endpoint | Uso |
| --- | --- |
| `GET /estructura/ciclos-acreditacion` | Cargar ciclos para el selector. |
| `GET /estructura/elementos?modelo_estructura_id=:id` | Cargar elementos del modelo flexible. |
| `GET /admin/users` | Cargar usuarios para responsables. |
| `GET /roles` | Cargar roles para responsables. |

Reglas de visualizacion:

- Si hay jerarquia, se muestran como filas las pautas o padres directos de fuentes.
- Si el modelo es plano, se muestran las hojas directamente.
- Los hijos seleccionables se tratan como fuentes.

Tabla:

| Columna | Descripcion |
| --- | --- |
| Elemento | Nombre, nomenclatura, descripcion y padre. |
| Destinatarios | Avatares de usuarios/roles seleccionados. |
| Estado | `Seleccionado` o `Pendiente`. |
| Acciones | Configurar, editar configuracion o eliminar elemento. |

## Configurar elemento

El modal `Configurar Elemento` o `Editar Elemento` permite definir responsables y fuentes.

Campos:

| Campo | Obligatorio | Regla |
| --- | --- | --- |
| Fuentes a incluir | Si hay hijos | Debe seleccionarse al menos una fuente. |
| Usuarios | No, si hay roles | Solo usuarios activos. |
| Roles | No, si hay usuarios | Muestra cantidad de usuarios por rol. |
| Fecha limite | Si | Minimo la fecha actual. |
| Comentario | No | Maximo 500 caracteres. |

Si el elemento tiene hijos, el modal incluye accion para seleccionar o deseleccionar todas las fuentes.

## Confirmacion y guardado

El boton `Configurar` valida el formulario y abre el modal:

```txt
Confirmar configuracion de compromiso
```

Mensaje:

```txt
¿Esta seguro de que desea configurar este compromiso de mejora? Se guardaran todas las asignaciones y notificaciones a los encargados.
```

Al guardar correctamente:

```txt
Compromiso configurado exitosamente
El compromiso de mejora ha sido guardado correctamente en el sistema.
```

En modo no embebido, al cerrar el exito navega a `/procesos-acreditacion`.

## Guardado tradicional

En modelo tradicional se crea o actualiza un unico compromiso con todos los criterios seleccionados.

Crear:

```txt
POST /compromisos-de-mejora
```

Actualizar:

```txt
PUT /compromisos-de-mejora/:id
```

Payload principal:

```ts
interface CrearCompromisoPayload {
  ciclo_acreditacion_id: number;
  proceso_id?: number;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  selecciones: Array<{
    entidad_tipo: 'CRITERIO';
    entidad_id: number;
  }>;
  evidencias_asignar: Array<{
    evidencia_id: number;
    usuarios: number[];
    roles?: number[];
    fecha_limite?: string;
    comentario?: string;
  }>;
}
```

Cuando se abre desde un proceso y ya existe compromiso, el frontend precarga el compromiso con:

```txt
GET /compromisos-de-mejora?proceso_id=:id&per_page=1
```

## Guardado flexible

En modelo flexible se crea o actualiza un compromiso por elemento seleccionado.

Crear:

```txt
POST /compromisos-elementos
```

Actualizar:

```txt
PUT /compromisos-elementos/:id
```

Payload:

```ts
interface CrearCompromisoElementoPayload {
  proceso_id: number;
  elemento_id: number;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  elementos_asignar: Array<{
    elemento_id: number;
    usuarios: number[];
    roles: number[];
    fecha_limite?: string;
    comentario?: string;
  }>;
}
```

Si hay fuentes hijas seleccionadas, se asigna cada fuente individualmente. Si el modelo es plano, se asigna el elemento directamente.

Cuando se abre desde un proceso y ya existen compromisos flexibles, el frontend precarga con:

```txt
GET /compromisos-elementos?proceso_id=:id&per_page=50
```

## Detalle del compromiso

La ruta `/compromisos/detalle` muestra la informacion de un compromiso especifico. El ID viaja por `location.state.id`.

Endpoint:

```txt
GET /compromisos-de-mejora/:id
```

Secciones:

| Seccion | Descripcion |
| --- | --- |
| Resumen | Descripcion, periodo, estado, ID, proceso, conteos. |
| Selecciones | Criterios, componentes o dimensiones asociados. |
| Evidencias asignadas | Evidencias asignadas, estado y fecha limite. |

Estados:

| Estado | Comportamiento |
| --- | --- |
| Sin ID | Redirige a `/compromisos`. |
| Cargando | Muestra `LoadingSpinner`. |
| Error | Muestra `No fue posible cargar el detalle del compromiso.` |
| Sin compromiso | Muestra `No se encontro el compromiso solicitado.` |

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/compromisos-de-mejora` | Listar compromisos o buscar por proceso. |
| `GET` | `/compromisos-de-mejora/:id` | Obtener detalle. |
| `POST` | `/compromisos-de-mejora` | Crear compromiso tradicional. |
| `PUT` | `/compromisos-de-mejora/:id` | Actualizar compromiso tradicional. |
| `PATCH` | `/compromisos-de-mejora/:id/active` | Activar o desactivar compromiso. |
| `GET` | `/compromisos-de-mejora/usuario/:id` | Consultar compromisos por usuario. |
| `GET` | `/compromisos-de-mejora/evidencia/:id` | Consultar compromisos por evidencia. |
| `GET` | `/estructura/ciclos-acreditacion` | Cargar ciclos. |
| `GET` | `/estructura/criterios` | Cargar criterios. |
| `GET` | `/estructura/evidencias` | Cargar evidencias. |
| `GET` | `/estructura/evidencias/:id` | Obtener una evidencia. |
| `GET` | `/estructura/elementos` | Cargar elementos flexibles. |
| `POST` | `/compromisos-elementos` | Crear compromiso flexible. |
| `GET` | `/compromisos-elementos` | Buscar compromisos flexibles por proceso. |
| `PUT` | `/compromisos-elementos/:id` | Actualizar compromiso flexible. |
| `GET` | `/admin/users` | Cargar usuarios responsables. |
| `GET` | `/roles` | Cargar roles responsables. |

## Estados de carga y error

| Estado | Comportamiento |
| --- | --- |
| Error de validacion local | Toast `Hay errores en el formulario` y mensajes por campo. |
| Error 409 | Toast `Conflicto al configurar el compromiso`. |
| Error 403 | Toast `Sin permisos`. |
| Error 500 | Toast de error interno. |
| Error backend con `errors` | Mapea errores permitidos y muestra toast `Error al configurar el compromiso`. |
| Carga de catalogos | Muestra `LoadingSpinner`. |
| Error al cargar catalogos | Registra error en consola y detiene carga. |

## Reglas importantes para soporte y QA

- Aunque no aparezca en `Navigation.ts`, el modulo esta activo por rutas y acciones internas.
- La ruta de detalle depende de `location.state.id`; recargar la pagina puede redirigir al listado.
- Desde Procesos de Acreditacion el formulario puede abrirse embebido y con ciclo/proceso/fechas prellenados.
- En modelo tradicional se guarda un compromiso con multiples criterios.
- En modelo flexible se guarda un compromiso por elemento seleccionado.
- Cada criterio o elemento debe tener fecha limite y al menos un destinatario.
- La descripcion general no puede exceder 100 caracteres.
- El comentario por criterio/elemento no puede exceder 500 caracteres.
- La autorizacion final debe mantenerse en backend; el frontend controla flujo, visibilidad y validaciones inmediatas.
