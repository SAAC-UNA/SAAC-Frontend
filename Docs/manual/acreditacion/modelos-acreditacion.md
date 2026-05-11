---
title: Modelos de Acreditacion
---

# Modelos de Acreditacion

La pantalla Modelos de Acreditacion permite administrar los modelos de estructura que definen como se organiza un proceso de acreditacion. Puede trabajar con el modelo tradicional o con modelos flexibles configurables.

<div class="module-meta">

**Rutas:** `/acreditacion?seccion=modelos`, `/estructura/modelos`  
**Parametro relacionado:** `modelo` en `/acreditacion?seccion=modelos&modelo=:id`  
**Archivo principal:** `src/Pages/StructureModels/StructureModelsPage.tsx`  
**Estructura tradicional:** `src/Pages/Structure/StructureList.tsx`  
**Estructura flexible:** `src/Pages/Structure/Components/StructureElementView.tsx`  
**Acceso:** `cap.accreditation.model.view` o permiso `modelos.view`

</div>

## Vista principal

La vista lista los modelos disponibles y permite crear, editar, activar/inactivar, eliminar o abrir la estructura del modelo.

| Elemento | Descripcion |
| --- | --- |
| Tarjetas de modelo | Muestran los modelos disponibles. |
| Boton Crear | Permite crear un nuevo modelo flexible. |
| Acciones por modelo | Ver estructura, editar, activar/inactivar y eliminar. |
| Estado vacio | Muestra `No hay modelos configurados.` |

## Navegacion por URL

| URL | Comportamiento |
| --- | --- |
| `/acreditacion?seccion=modelos` | Muestra la lista de modelos. |
| `/acreditacion?seccion=modelos&modelo=0` | Abre la estructura del modelo tradicional. |
| `/acreditacion?seccion=modelos&modelo=<id>` | Abre la estructura de un modelo flexible. |

Si el modelo indicado no existe o no esta disponible, el frontend limpia el parametro y muestra error.

## Acciones

| Accion | Comportamiento |
| --- | --- |
| Ver | Entra a la estructura del modelo seleccionado. |
| Crear | Abre modal para registrar modelo flexible. |
| Editar | Abre modal con los datos actuales. |
| Activar/Inactivar | Solicita confirmacion y cambia estado. |
| Eliminar | Abre confirmacion; considera si el modelo tiene ciclos asociados. |

## Estructura tradicional

Cuando se abre `modelo=0`, el sistema renderiza la estructura tradicional.

| Componente | Uso |
| --- | --- |
| `StructureList` | Vista principal de estructura tradicional. |
| `StructureTable` | Tabla jerarquica de dimensiones, componentes, criterios y evidencias. |
| `StructureFormModal` | Crear o editar elementos tradicionales. |
| `StructureDetailModal` | Ver detalle del elemento seleccionado. |

## Estructura flexible

Cuando se abre un modelo flexible, el sistema renderiza la gestion de elementos del modelo.

| Componente | Uso |
| --- | --- |
| `StructureElementView` | Contenedor de elementos flexibles. |
| `StructureElementTable` | Tabla de elementos del modelo. |
| `StructureElementFormModal` | Crear o editar elementos flexibles. |
| `StructureElementDetailModal` | Ver detalle de un elemento. |

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/estructura/modelos` | Listar modelos de estructura. |
| `POST` | `/estructura/modelos` | Crear modelo flexible. |
| `PUT` | `/estructura/modelos/:id` | Editar modelo. |
| `PATCH` | `/estructura/modelos/:id/active` | Activar o inactivar modelo. |
| `DELETE` | `/estructura/modelos/:id` | Eliminar modelo. |
| `GET` | `/estructura/elementos` | Listar elementos flexibles. |
| `POST` | `/estructura/elementos` | Crear elemento flexible. |
| `PUT` | `/estructura/elementos/:id` | Editar elemento flexible. |
| `PATCH` | `/estructura/elementos/:id/active` | Activar o inactivar elemento flexible. |
| `DELETE` | `/estructura/elementos/:id` | Eliminar elemento flexible. |

## Reglas importantes para soporte y QA

- El parametro `modelo` solo aplica cuando `seccion=modelos`.
- `modelo=0` representa el modelo tradicional.
- Los modelos flexibles usan elementos jerarquicos configurables.
- Inactivar un modelo puede afectar su disponibilidad para ciclos nuevos.
- La autorizacion final debe mantenerse en backend.
