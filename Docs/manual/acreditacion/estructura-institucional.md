---
title: Estructura Institucional
---

# Estructura Institucional

La pantalla Estructura Institucional permite gestionar universidades, sedes y carreras registradas en el sistema.

<div class="module-meta">

**Rutas:** `/acreditacion?seccion=estructura`, `/institucion-educativa`  
**Archivo principal:** `src/Pages/InstitutionalStructure/InstitutionalStructurePage.tsx`  
**Componentes:** `src/Pages/InstitutionalStructure/Components`  
**Acceso:** permisos de estructura institucional, por ejemplo `universidades.view`

</div>

## Vista principal

| Elemento | Descripcion |
| --- | --- |
| Buscador | Campo para filtrar la jerarquia institucional. |
| Boton Crear | Visible si el usuario puede crear universidades, sedes o carreras. |
| Tabla jerarquica | Muestra universidades, sedes y carreras. |
| Modal de creacion/edicion | Permite registrar o editar elementos institucionales. |

## Jerarquia

| Nivel | Descripcion |
| --- | --- |
| Universidad | Institucion principal. |
| Sede | Sede asociada a una universidad. |
| Carrera | Carrera asociada a una sede. |
| Carrera-sede | Relacion operativa que luego se usa en ciclos y contexto. |

## Acciones

| Accion | Comportamiento |
| --- | --- |
| Crear | Abre modal para crear el tipo de entidad permitido. |
| Editar | Abre modal con datos existentes. |
| Refrescar | La tabla puede solicitar recarga despues de crear o editar. |

## Permisos de creacion

- `universidades.create`
- `campuses.create`
- `carreras.create`

## Endpoints relacionados

| Recurso | Uso |
| --- | --- |
| Universidades | Crear, listar y editar universidades. |
| Sedes | Crear, listar y editar sedes. |
| Carreras | Crear, listar y editar carreras. |
| Carrera-sede | Relacionar carreras con sedes para uso posterior en ciclos. |

## Reglas importantes para soporte y QA

- Esta pantalla alimenta datos usados por ciclos de acreditacion.
- Los cambios pueden impactar las opciones de carrera-sede disponibles en otros modulos.
- La ruta `/institucion-educativa` existe como ruta directa.
- Tambien se puede abrir desde `/acreditacion?seccion=estructura`.
- La autorizacion final debe mantenerse en backend.
