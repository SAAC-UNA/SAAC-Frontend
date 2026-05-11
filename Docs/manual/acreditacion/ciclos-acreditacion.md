---
title: Ciclos de Acreditacion
---

# Ciclos de Acreditacion

La pantalla Ciclos de Acreditacion permite administrar los periodos de acreditacion asociados a una carrera-sede y a un modelo de estructura.

<div class="module-meta">

**Rutas:** `/acreditacion?seccion=ciclos`, `/ciclos-acreditacion`  
**Archivo principal:** `src/Pages/AccreditationCycles/AccreditationCyclesPage.tsx`  
**Componentes:** `src/Pages/AccreditationCycles/Components`  
**Acceso:** `cap.accreditation.cycle.view` o permiso `ciclos.view`

</div>

## Vista principal

| Elemento | Descripcion |
| --- | --- |
| Tabla de ciclos | Lista ciclos paginados. |
| Boton Crear | Visible para usuarios con `ciclos.create`. |
| Detalle | Permite revisar la informacion del ciclo. |
| Acciones | Editar, eliminar, activar/inactivar, reactivar o completar segun permisos y estado. |

## Permisos

| Permiso | Uso |
| --- | --- |
| `ciclos.view` | Ver listado. |
| `ciclos.create` | Mostrar boton Crear. |
| `ciclos.edit` | Permitir edicion y cambios de estado. |
| `ciclos.delete` | Permitir eliminacion. |
| `ciclos.reactivar` | Permitir reactivacion. |

## Acciones

| Accion | Comportamiento |
| --- | --- |
| Crear | Abre formulario para registrar un ciclo. |
| Ver detalle | Abre modal de detalle del ciclo. |
| Editar | Reutiliza el formulario con datos existentes. |
| Activar/Inactivar | Cambia estado del ciclo. |
| Reactivar | Reactiva ciclos permitidos por backend. |
| Completar | Marca el ciclo como completado con confirmacion. |
| Eliminar | Solicita confirmacion por nombre. |

## Reglas visibles

- Crear ciclo abre un modal de formulario.
- Editar ciclo reutiliza el mismo modal con datos existentes.
- Eliminar ciclo solicita confirmacion.
- Activar un ciclo valida que no exista otro ciclo activo para la misma carrera-sede.
- Marcar como completado solicita confirmacion.

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/estructura/ciclos-acreditacion` | Listar ciclos. |
| `GET` | `/estructura/ciclos-acreditacion/:id` | Obtener detalle. |
| `POST` | `/estructura/ciclos-acreditacion` | Crear ciclo. |
| `PATCH` | `/estructura/ciclos-acreditacion/:id` | Actualizar ciclo o estado. |
| `DELETE` | `/estructura/ciclos-acreditacion/:id` | Eliminar ciclo. |
| `PATCH` | `/estructura/ciclos-acreditacion/:id/reactivar` | Reactivar ciclo. |
| `GET` | `/estructura/carrera-sede` | Cargar carrera-sedes disponibles. |
| `GET` | `/estructura/modelos` | Cargar modelos de estructura disponibles. |

## Reglas importantes para soporte y QA

- Los ciclos se asocian a carrera-sede y modelo de estructura.
- Puede existir control de unicidad para ciclo activo por carrera-sede.
- Las acciones visibles dependen de permisos y estado.
- La ruta directa `/ciclos-acreditacion` existe aunque el acceso principal sea la pestana de Acreditacion.
