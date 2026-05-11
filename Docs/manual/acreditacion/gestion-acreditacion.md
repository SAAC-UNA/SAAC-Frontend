---
title: Gestion de Acreditacion
---

# Gestion de Acreditacion

Gestion de Acreditacion es la pantalla contenedora para administrar la base del proceso de acreditacion. Desde esta vista se accede, segun permisos, a modelos de acreditacion, ciclos, procesos y estructura institucional.

<div class="module-meta">

**Ruta:** `/acreditacion`  
**Archivo principal:** `src/Pages/Accreditation/AccreditationModulePage.tsx`  
**Componentes embebidos:** `StructureModelsPage`, `AccreditationCyclesPage`, `AccreditationProcessList`, `InstitutionalStructurePage`  
**Acceso en menu:** capacidades de modelos, ciclos o procesos de acreditacion

</div>

## Vista principal

La pantalla usa un encabezado comun y una navegacion por pestanas. Cada pestana embebe una pagina especializada y puede cambiar el titulo, descripcion, breadcrumb y acciones del encabezado.

Pestanas disponibles:

| Pestana | Componente embebido | Descripcion |
| --- | --- | --- |
| Modelo de acreditacion | `StructureModelsPage` | Gestiona modelos de estructura y permite entrar a la estructura del modelo seleccionado. |
| Ciclos de acreditacion | `AccreditationCyclesPage` | Gestiona ciclos asociados a carrera-sede y modelo de estructura. |
| Procesos de acreditacion | `AccreditationProcessList` | Gestiona procesos asociados a ciclos de acreditacion. |
| Estructura institucional | `InstitutionalStructurePage` | Gestiona universidades, sedes y carreras. |

## Acceso por permisos

Las pestanas se filtran segun permisos del usuario autenticado. Si el usuario no cumple la regla de una seccion, esa pestana no aparece.

| Pestana | Capacidad | Permiso equivalente |
| --- | --- | --- |
| Modelo de acreditacion | `cap.accreditation.model.view` | `modelos.view` |
| Ciclos de acreditacion | `cap.accreditation.cycle.view` | `ciclos.view` |
| Procesos de acreditacion | `cap.accreditation.process.view` | `procesos.view` |
| Estructura institucional | `cap.accreditation.model.view` | `universidades.view` |

Si la URL solicita una pestana que el usuario no puede ver, el frontend selecciona la primera pestana disponible para ese usuario.

## Navegacion por URL

La seccion activa puede viajar en query string con el parametro `seccion`.

| Valor | Pestana |
| --- | --- |
| `modelos` | Modelo de acreditacion |
| `ciclos` | Ciclos de acreditacion |
| `procesos` | Procesos de acreditacion |
| `estructura` | Estructura institucional |

Ejemplos:

```txt
/acreditacion?seccion=modelos
/acreditacion?seccion=ciclos
/acreditacion?seccion=procesos
/acreditacion?seccion=estructura
```

Cuando el usuario cambia de pestana, el frontend actualiza `seccion`, limpia el modelo seleccionado y reinicia estados internos del encabezado.

## Seleccion de modelo

La pestana Modelo de acreditacion tambien puede recibir el parametro `modelo`.

| Valor | Comportamiento |
| --- | --- |
| Sin `modelo` | Muestra la lista de modelos disponibles. |
| `modelo=0` | Abre la estructura del modelo tradicional. |
| `modelo=<id>` | Abre la estructura de un modelo flexible especifico. |

Ejemplo:

```txt
/acreditacion?seccion=modelos&modelo=0
```

Si el modelo solicitado no existe o no esta disponible, el frontend limpia el parametro y muestra una notificacion de error.

## Encabezado dinamico

`AccreditationModulePage` administra un encabezado unico para todas las secciones. Las paginas embebidas pueden enviar:

- Acciones del encabezado, como botones `Crear` o buscadores.
- Titulo y descripcion especificos de la seccion.
- Modo de breadcrumb.
- Breadcrumb padre cuando la vista entra a una subpagina.

Esto permite que la pantalla se sienta como un solo modulo aunque internamente renderice subpaginas distintas.

## Modelo de acreditacion

La seccion Modelo de acreditacion permite gestionar modelos de estructura.

Vista de lista:

| Elemento | Descripcion |
| --- | --- |
| Tarjetas de modelo | Muestran los modelos disponibles. |
| Boton Crear | Permite crear un nuevo modelo flexible. |
| Acciones por modelo | Ver estructura, editar, activar/inactivar y eliminar. |
| Estado vacio | Muestra `No hay modelos configurados.` |

Acciones principales:

| Accion | Resultado |
| --- | --- |
| Ver | Abre la estructura del modelo. |
| Crear | Abre modal para registrar modelo flexible. |
| Editar | Abre modal de edicion del modelo. |
| Activar/Inactivar | Solicita confirmacion y actualiza estado. |
| Eliminar | Abre confirmacion; considera si el modelo tiene ciclos asociados. |

Si el modelo es tradicional, la vista abre `StructureList`. Si es flexible, abre `StructureElementsView` para gestionar sus elementos.

Endpoints principales:

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/estructura/modelos` | Listar modelos de estructura. |
| `POST` | `/estructura/modelos` | Crear modelo flexible. |
| `PUT` | `/estructura/modelos/:id` | Editar modelo. |
| `PATCH` | `/estructura/modelos/:id/active` | Activar o inactivar modelo. |
| `DELETE` | `/estructura/modelos/:id` | Eliminar modelo con confirmacion. |
| `GET` | `/estructura/elementos` | Listar elementos de modelo flexible. |
| `POST` | `/estructura/elementos` | Crear elemento flexible. |
| `PUT` | `/estructura/elementos/:id` | Editar elemento flexible. |
| `PATCH` | `/estructura/elementos/:id/active` | Activar o inactivar elemento flexible. |
| `DELETE` | `/estructura/elementos/:id` | Eliminar elemento flexible. |

## Ciclos de acreditacion

La seccion Ciclos de acreditacion permite administrar ciclos de acreditacion.

Elementos visibles:

| Elemento | Descripcion |
| --- | --- |
| Tabla de ciclos | Lista ciclos paginados. |
| Boton Crear | Visible para usuarios con `ciclos.create`. |
| Detalle | Permite revisar informacion del ciclo. |
| Acciones | Editar, eliminar, activar/inactivar, reactivar o marcar como completado segun permisos y estado. |

Permisos usados en la vista:

| Permiso | Uso |
| --- | --- |
| `ciclos.create` | Mostrar boton Crear. |
| `ciclos.edit` | Permitir edicion. |
| `ciclos.delete` | Permitir eliminacion. |
| `ciclos.reactivar` | Permitir reactivacion. |

Reglas visibles:

- Crear ciclo abre un modal de formulario.
- Editar ciclo reutiliza el mismo modal con datos existentes.
- Eliminar ciclo solicita confirmacion por nombre.
- Activar un ciclo valida que no exista otro ciclo activo para la misma carrera-sede.
- Marcar como completado solicita confirmacion.

Endpoints principales:

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/estructura/ciclos-acreditacion` | Listar ciclos. |
| `GET` | `/estructura/ciclos-acreditacion/:id` | Obtener detalle de ciclo. |
| `POST` | `/estructura/ciclos-acreditacion` | Crear ciclo. |
| `PATCH` | `/estructura/ciclos-acreditacion/:id` | Actualizar ciclo o estado. |
| `DELETE` | `/estructura/ciclos-acreditacion/:id` | Eliminar ciclo con confirmacion. |
| `PATCH` | `/estructura/ciclos-acreditacion/:id/reactivar` | Reactivar ciclo. |
| `GET` | `/estructura/carrera-sede` | Cargar carrera-sedes disponibles. |

## Procesos de acreditacion

La seccion Procesos de acreditacion permite administrar procesos asociados a ciclos.

Elementos visibles:

| Elemento | Descripcion |
| --- | --- |
| Buscador | Campo `Buscar procesos...`. |
| Boton Crear | Abre formulario de proceso. |
| Tabla de procesos | Lista procesos cargados desde backend. |
| Modales | Crear/editar, detalle, eliminar y exito de eliminacion. |

Acciones principales:

| Accion | Resultado |
| --- | --- |
| Crear | Registra un proceso asociado a un ciclo. |
| Ver | Abre modal de detalles. |
| Editar | Abre formulario con datos existentes. |
| Activar/Inactivar | Cambia estado del proceso. |
| Configurar | Abre configuracion de compromiso de mejora cuando aplica. |
| Eliminar | Solicita confirmacion y elimina el proceso. |

Reglas visibles:

- El tipo de proceso es obligatorio.
- Debe seleccionarse un ciclo de acreditacion.
- No puede existir otro proceso activo del mismo tipo para el mismo ciclo.
- Si el proceso es `Compromiso de mejora`, se conserva descripcion para la configuracion.
- Al crear o editar, se sincroniza el contexto operacional con ciclo y proceso.

Cuando se configura un compromiso de mejora en modo embebido, la pantalla reemplaza temporalmente la lista por `CreateImprovementCommitment` y vuelve al listado al completar.

Endpoints principales:

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/estructura/procesos` | Listar procesos. |
| `POST` | `/estructura/procesos` | Crear proceso. |
| `PUT` | `/estructura/procesos/:id` | Actualizar proceso o estado. |
| `DELETE` | `/estructura/procesos/:id` | Eliminar proceso con confirmacion. |
| `GET` | `/estructura/ciclos-acreditacion` | Cargar ciclos disponibles para procesos. |

## Estructura institucional

La seccion Estructura institucional permite gestionar universidades, sedes y carreras registradas en el sistema.

Elementos visibles:

| Elemento | Descripcion |
| --- | --- |
| Buscador | Campo `Buscar...` para filtrar la jerarquia. |
| Boton Crear | Visible si el usuario puede crear universidades, sedes o carreras. |
| Tabla jerarquica | Muestra la estructura institucional y permite editar elementos. |
| Modal de creacion/edicion | Permite registrar o editar elementos institucionales. |

Permisos que habilitan creacion:

- `universidades.create`
- `campuses.create`
- `carreras.create`

La tabla puede solicitar refresco despues de crear o editar un elemento.

## Estados de carga y error

| Estado | Comportamiento |
| --- | --- |
| Cargando modelos | Se muestra `LoadingSpinner` en la seccion de modelos. |
| Sin modelos | Muestra `No hay modelos configurados.` |
| Modelo invalido por URL | Limpia el parametro `modelo` y muestra toast de error. |
| Cargando ciclos | La tabla de ciclos recibe estado de carga. |
| Error en ciclos, modelos o procesos | Los hooks/servicios muestran toast o limpian listas segun el caso. |
| Configuracion de compromiso abierta | La seccion de procesos renderiza el formulario de compromiso en lugar de la tabla. |

## Reglas importantes para soporte y QA

- Las pestanas visibles dependen de permisos; no todos los usuarios veran las cuatro secciones.
- El parametro `seccion` permite abrir una pestana especifica desde URL.
- El parametro `modelo` solo aplica a la pestana de modelos.
- Cambiar de pestana limpia el modelo seleccionado y las acciones especiales del encabezado.
- Ciclos y procesos pueden tener rutas independientes, pero dentro de `/acreditacion` se muestran en modo embebido.
- La autorizacion final debe mantenerse en backend; el frontend solo controla visibilidad y flujo.
