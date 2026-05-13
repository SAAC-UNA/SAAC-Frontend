---
title: Estructura Tradicional
---

# Estructura Tradicional

La pantalla Estructura Tradicional permite administrar los elementos jerarquicos del modelo tradicional de acreditacion: dimensiones, componentes, criterios, estandares y evidencias. Aunque la ruta tambien puede listar tipos institucionales en el servicio, la tabla visible excluye universidades, sedes y carreras para concentrarse en la estructura de evaluacion.

<div class="module-meta">

**Ruta:** `/estructura`  
**Archivo principal:** `src/Pages/Structure/StructureList.tsx`  
**Tabla:** `src/Pages/Structure/Components/StructureTable.tsx`  
**Formulario:** `src/Pages/Structure/Components/StructureFormModal.tsx`  
**Hook:** `src/Hooks/UseStructure.ts`  
**Servicio:** `src/Services/StructureService.ts`  
**Acceso:** permiso `procesos.view`

</div>

## Relacion con Modelos de Acreditacion

Esta pantalla maneja exclusivamente estructura tradicional.

Si la ruta recibe una query de modelo flexible:

```txt
/estructura?modelo=:id
```

el frontend redirige a:

```txt
/estructura/modelos?modelo=:id
```

Esto evita mezclar la administracion de elementos flexibles con la jerarquia tradicional.

## Vista principal

La pantalla carga el arbol completo de estructura mediante `useStructure().loadTree()` y lo muestra en una tabla paginada.

Elementos visibles en el encabezado:

| Elemento | Descripcion |
| --- | --- |
| Titulo | Informacion del modulo `structure_list`. |
| Breadcrumb | Puede volver a Modelos de Acreditacion si la pantalla fue abierta desde esa ruta. |
| Buscador | Campo `Buscar elementos...`. |
| Boton Crear | Abre el modal `Crear Elemento`. |

## Tabla de elementos

La tabla aplana el arbol recibido desde backend, excluye `Universidad`, `Sede` y `Carrera`, y ordena por tipo y nomenclatura natural.

Columnas visibles:

| Columna | Descripcion |
| --- | --- |
| Identificador | Muestra nombre o descripcion principal. Si tiene padre, muestra una linea auxiliar con el padre. |
| Tipo | Muestra etiqueta funcional del tipo y la nomenclatura cuando existe. |
| Estado | Badge `Activo` o `Inactivo`. |
| Acciones | Ver detalles, editar, activar/inactivar y eliminar. |

Tipos funcionales visibles:

| Tipo tecnico | Etiqueta visible |
| --- | --- |
| `dimension` | Dimension |
| `component` | Componente |
| `criteria` | Criterio |
| `standard` | Estandar |
| `evidence` | Evidencia |

## Busqueda

El buscador usa debounce de 300 ms.

Filtra por:

- Tipo tecnico.
- Etiqueta visible del tipo.
- Nomenclatura.
- Nombre.
- Descripcion.
- Estado.

Reglas especiales:

| Busqueda exacta | Resultado |
| --- | --- |
| `activo` | Muestra solo elementos activos. |
| `inactivo` | Muestra solo elementos inactivos. |

Si no hay coincidencias, muestra:

```txt
No se encontraron elementos que coincidan con "..."
```

Si no hay elementos creados, muestra:

```txt
No hay elementos creados aun. Crea el primer elemento!
```

## Ver detalles

La accion `Ver detalles` abre `StructureElementDetail`.

El modal recibe:

- Elemento seleccionado.
- Nombre del elemento padre.
- Datos principales del elemento segun el tipo.
- Estado activo/inactivo.

## Crear elemento

El boton `Crear` abre `StructureFormModal` en modo creacion.

Flujo:

1. El usuario selecciona el tipo de elemento.
2. Si el tipo requiere padre, selecciona el elemento padre activo.
3. Completa los campos requeridos.
4. Presiona `Crear`.
5. Se abre `Confirmar creacion de elemento`.
6. Si confirma, se llama a `createElement`.
7. Si el backend responde correctamente, se muestra `Elemento creado`.
8. Al cerrar el exito, se recarga el arbol.

## Editar elemento

La accion `Editar elemento` abre el mismo formulario en modo edicion.

Reglas visibles:

| Regla | Comportamiento |
| --- | --- |
| El tipo no se puede cambiar | Se muestra como bloque informativo. |
| El boton `Guardar` requiere cambios | Si no hay cambios, permanece deshabilitado. |
| Campos editables | Nomenclatura, nombre y descripcion, segun el tipo. |

Al confirmar, se muestra `Confirmar edicion`. Si el backend responde correctamente, se muestra `Elemento actualizado`.

## Activar o inactivar

La accion de encendido alterna el estado `active`.

| Estado actual | Modal | Resultado |
| --- | --- | --- |
| Inactivo | `Confirmar activacion` | Activa el elemento y puede activar elementos conectados. |
| Activo | `Confirmar inactivacion` | Inactiva el elemento y puede inactivar elementos conectados. |

Si el elemento tiene descendientes, el mensaje indica que tambien se afectaran elementos conectados.

Regla de bloqueo:

| Condicion | Comportamiento |
| --- | --- |
| El elemento esta inactivo y su padre esta inactivo | El boton se deshabilita con tooltip `No se puede activar: el padre esta inactivo`. |

El hook aplica una actualizacion optimista de estado y conserva overrides temporales en `localStorage` con la llave `saac.structure.active-overrides.v1`.

## Eliminar elemento

La accion `Eliminar elemento` abre el modal `Confirmar Eliminacion`.

Reglas visibles:

| Condicion | Comportamiento |
| --- | --- |
| El elemento no tiene hijos | Permite abrir confirmacion de eliminacion. |
| El elemento tiene hijos | El boton queda deshabilitado con tooltip `No se puede eliminar: tiene elementos dependientes`. |

Si se elimina correctamente, se muestra `Elemento eliminado`.

## Jerarquia tradicional

La jerarquia esperada es:

| Elemento | Padre requerido | Hijos permitidos |
| --- | --- | --- |
| Dimension | Ninguno | Componentes |
| Componente | Dimension | Criterios |
| Criterio | Componente | Estandares y Evidencias |
| Estandar | Criterio | Ninguno |
| Evidencia | Criterio | Ninguno |

El formulario tambien contiene configuracion para Universidad, Sede y Carrera, pero esos tipos no se muestran en la tabla principal de esta pantalla.

## Campos del formulario

| Campo | Cuando aparece | Validaciones |
| --- | --- | --- |
| Tipo de Elemento | Solo creacion | Debe ser un tipo reconocido. |
| Elemento Padre | Tipos que requieren padre | Debe seleccionarse un padre activo del tipo esperado. |
| Nomenclatura | Segun tipo | Maximo 20 caracteres; letras, numeros, guiones, puntos y guiones bajos. |
| Nombre | Segun tipo | Maximo 80 caracteres; letras, numeros, espacios y puntuacion basica. |
| Descripcion | Segun tipo | Maximo segun tipo; requerida para criterios, estandares y evidencias. |

Limites de descripcion:

| Tipo | Maximo |
| --- | --- |
| Dimension | 250 caracteres |
| Componente | 250 caracteres |
| Criterio | 300 caracteres |
| Estandar | 250 caracteres |
| Evidencia | 80 caracteres |

Campos requeridos por tipo:

| Tipo | Campos requeridos |
| --- | --- |
| Dimension | Nomenclatura, nombre |
| Componente | Nomenclatura, nombre, padre dimension |
| Criterio | Nomenclatura, descripcion, padre componente |
| Estandar | Descripcion, padre criterio |
| Evidencia | Nomenclatura, descripcion, padre criterio |

## Endpoints usados

Para cargar el arbol completo, el servicio consulta los tipos conocidos:

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/estructura/universidades` | Cargar universidades. |
| `GET` | `/estructura/campuses` | Cargar sedes. |
| `GET` | `/estructura/carreras` | Cargar carreras. |
| `GET` | `/estructura/dimensiones` | Cargar dimensiones. |
| `GET` | `/estructura/componentes` | Cargar componentes. |
| `GET` | `/estructura/criterios` | Cargar criterios. |
| `GET` | `/estructura/estandares` | Cargar estandares. |
| `GET` | `/estructura/evidencias` | Cargar evidencias. |

Operaciones por tipo:

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/estructura/:tipo/:id` | Obtener detalle de un elemento. |
| `POST` | `/estructura/:tipo` | Crear elemento. |
| `PUT` | `/estructura/:tipo/:id` | Actualizar elemento. |
| `DELETE` | `/estructura/:tipo/:id` | Eliminar elemento. |
| `PATCH` | `/estructura/:tipo/:id/active` | Activar o inactivar elemento. |

Donde `:tipo` corresponde a:

```txt
universidades, campuses, carreras, dimensiones, componentes, criterios, estandares, evidencias
```

Al crear dimensiones, componentes o criterios, el frontend crea antes un comentario de sistema mediante:

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/admin/users` | Obtener un usuario valido para asociar el comentario. |
| `POST` | `/dev/comments` | Crear comentario generado automaticamente. |

## Datos que recibe el frontend

El frontend trabaja con esta forma:

```ts
interface StructureElement {
  id: string;
  nomenclature?: string;
  name?: string;
  description?: string;
  type: ElementType;
  parentElementId?: string;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;
  updatedBy?: string;
  parentElement?: StructureElement;
  childElements?: StructureElement[];
  hasChildren: boolean;
  canDelete: boolean;
}
```

## Estados de carga y error

| Estado | Comportamiento |
| --- | --- |
| Cargando arbol | La tabla muestra estado de carga. |
| Error total al cargar | El hook guarda `No se pudo cargar la estructura en este momento. Intente nuevamente.` |
| Error parcial al cargar un tipo | Se omite ese tipo y se registra advertencia en consola. |
| Error al guardar | Muestra toast con el mensaje del backend si existe. |
| Error al eliminar | Cierra modal y muestra toast de error. |
| Operacion exitosa | Muestra modal de exito y recarga datos cuando corresponde. |

## Reglas importantes para soporte y QA

- `/estructura` es para estructura tradicional; los modelos flexibles se gestionan desde `/estructura/modelos`.
- La tabla visible no muestra Universidad, Sede ni Carrera.
- Solo puede eliminarse un elemento sin hijos.
- No puede activarse un hijo si su padre esta inactivo.
- Al inactivar o activar un elemento, tambien pueden afectarse descendientes.
- La busqueda `activo` e `inactivo` filtra estrictamente por estado.
- La autorizacion final de crear, editar, eliminar o cambiar estado debe mantenerse en backend aunque el frontend muestre botones.
