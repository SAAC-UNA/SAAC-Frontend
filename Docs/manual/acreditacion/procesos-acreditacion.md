---
title: Procesos de Acreditacion
---

# Procesos de Acreditacion

La pantalla Procesos de Acreditacion permite administrar procesos asociados a ciclos de acreditacion y configurar compromisos de mejora cuando el tipo de proceso lo requiere.

<div class="module-meta">

**Rutas:** `/acreditacion?seccion=procesos`, `/procesos-acreditacion`  
**Archivo principal:** `src/Pages/AccreditationProcess/AccreditationProcessList.tsx`  
**Componentes:** `src/Pages/AccreditationProcess/Components`  
**Vista enlazada:** `src/Pages/ImprovementCommitments/CreateImprovementCommitment.tsx`  
**Acceso:** `cap.accreditation.process.view` o permiso `procesos.view`

</div>

## Vista principal

| Elemento | Descripcion |
| --- | --- |
| Buscador | Campo `Buscar procesos...`. |
| Boton Crear | Abre formulario de proceso. |
| Tabla de procesos | Lista procesos cargados desde backend. |
| Modales | Crear/editar, detalle, eliminar y exito de eliminacion. |

## Acciones

| Accion | Resultado |
| --- | --- |
| Crear | Registra un proceso asociado a un ciclo. |
| Ver | Abre modal de detalles. |
| Editar | Abre formulario con datos existentes. |
| Activar/Inactivar | Cambia estado del proceso. |
| Configurar | Abre configuracion de compromiso de mejora cuando aplica. |
| Eliminar | Solicita confirmacion y elimina el proceso. |

## Reglas visibles

- El tipo de proceso es obligatorio.
- Debe seleccionarse un ciclo de acreditacion.
- No puede existir otro proceso activo del mismo tipo para el mismo ciclo.
- Si el proceso es `Compromiso de mejora`, se conserva descripcion para la configuracion.
- Al crear o editar, se sincroniza el contexto operacional con ciclo y proceso.

## Configuracion de compromiso de mejora

Cuando se configura un compromiso de mejora, la pantalla puede reemplazar temporalmente la lista por `CreateImprovementCommitment`.

| Dato | Uso |
| --- | --- |
| `procesoId` | Asociar compromiso al proceso. |
| `cicloId` | Usar ciclo ya definido. |
| `startDate` | Fecha inicio sugerida. |
| `estimatedEndDate` | Fecha fin sugerida. |
| `description` | Descripcion del proceso. |
| `modeloTipo` | Determina tradicional o flexible. |
| `modeloId` | Cargar elementos del modelo flexible. |

Al completar la configuracion, vuelve al listado de procesos.

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/estructura/procesos` | Listar procesos. |
| `POST` | `/estructura/procesos` | Crear proceso. |
| `PUT` | `/estructura/procesos/:id` | Actualizar proceso o estado. |
| `DELETE` | `/estructura/procesos/:id` | Eliminar proceso. |
| `GET` | `/estructura/ciclos-acreditacion` | Cargar ciclos disponibles. |

## Reglas importantes para soporte y QA

- La ruta directa `/procesos-acreditacion` existe aunque la pantalla tambien viva dentro de `/acreditacion`.
- Configurar compromisos depende del tipo de proceso y del modelo del ciclo.
- El contexto operacional se sincroniza al crear o editar procesos.
- La validacion de duplicados de proceso activo debe mantenerse en backend.
