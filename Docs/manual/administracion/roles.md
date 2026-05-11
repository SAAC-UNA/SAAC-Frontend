---
title: Roles
---

# Roles

El submodulo Roles permite consultar, crear, editar, activar, inactivar y eliminar roles del sistema. Cada rol define un conjunto de permisos que luego condiciona el acceso de los usuarios a los modulos del frontend y a las acciones autorizadas por el backend.

<div class="module-meta">

**Ruta:** `/roles`  
**Archivo principal:** `src/Pages/Roles/RolesList.tsx`  
**Componentes clave:** `RolesCards`, `RoleFormModal`, `RoleForm`, `PermissionsModal`  
**Servicio:** `src/Services/RoleService.ts`  
**Acceso en menu:** `cap.admin.roles.manage` o alguno de `roles.create`, `roles.edit`, `roles.delete`

</div>

## Vista principal

Al ingresar a Roles, el sistema carga la lista completa de roles mediante `useRoles().loadRoles()`. La informacion se muestra como tarjetas en una cuadricula responsive.

Cada tarjeta muestra:

| Elemento | Descripcion |
| --- | --- |
| Nombre del rol | Nombre principal del rol. |
| Descripcion | Texto descriptivo del rol. Si no existe, muestra `Sin descripcion`. |
| Cantidad de permisos | Badge con el total de permisos asociados al rol. |
| Estado | Badge de activo o inactivo. |
| Detalle inferior | Si el rol es protegido, indica que es un rol protegido por el sistema. Si no, muestra la cantidad de usuarios asignados. |
| Acciones | Ver permisos, editar, activar/inactivar y eliminar. |

## Busqueda

La pantalla incluye un campo `Buscar roles...`.

La busqueda filtra localmente por:

- Nombre del rol.
- Descripcion del rol.

Si no hay coincidencias, se muestra el mensaje: `No se encontraron roles que coincidan con la busqueda.`

Si no existen roles creados, se muestra: `No hay roles creados aun.`

## Acciones disponibles

| Accion | Boton | Resultado |
| --- | --- | --- |
| Ver permisos | Icono de ver | Abre un modal con el nombre del rol, descripcion y permisos agrupados. |
| Editar rol | Icono de editar | Abre el formulario en modo edicion con los datos actuales del rol. |
| Activar o inactivar | Icono de encendido | Abre una confirmacion antes de cambiar el estado del rol. |
| Eliminar rol | Icono de eliminar | Abre una confirmacion de eliminacion. Puede estar deshabilitado. |
| Crear rol | Boton `Crear` en el encabezado | Abre el formulario en modo creacion. |

## Ver permisos

El modal de permisos usa `PermissionsModal`.

Muestra:

- Nombre del rol como titulo.
- Subtitulo `Permisos del rol`.
- Badge con la cantidad total de permisos.
- Descripcion del rol, si existe.
- Permisos agrupados segun el catalogo disponible desde backend.

Cuando no hay permisos asignados, muestra: `Este rol no tiene permisos asignados`.

## Crear rol

El boton `Crear` abre `RoleFormModal` en modo creacion.

Flujo:

1. El usuario llena el formulario.
2. El formulario valida los datos.
3. Al confirmar, se abre el modal `Confirmar creacion de rol`.
4. Si el usuario confirma, se llama a `createRole`.
5. Si el backend responde correctamente, se muestra el modal de exito.
6. Al cerrar el exito, se recarga la lista de roles.

Endpoint usado:

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `POST` | `/roles` | Crear un nuevo rol con permisos. |

Payload enviado:

```ts
{
  name: string;
  description?: string;
  permissions: string[];
}
```

## Editar rol

La accion Editar abre el mismo formulario, pero en modo edicion.

El formulario se precarga con:

- Nombre actual.
- Descripcion actual.
- Permisos actuales, usando el campo `permission.name`.

El boton principal queda deshabilitado si no hay cambios. Se considera que hay cambios cuando cambia el nombre, la descripcion o la seleccion de permisos.

Endpoint usado:

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `PUT` | `/roles/:id` | Editar nombre, descripcion y permisos del rol. |

## Activar o inactivar rol

La accion de encendido alterna el estado `is_active`.

Si el rol esta inactivo, el sistema muestra una confirmacion de activacion:

- Titulo: `Confirmar activacion de rol`
- Confirmacion: `Si, activar`
- Mensaje funcional: al activarlo, los usuarios con este rol podran acceder a sus funcionalidades.

Si el rol esta activo, el sistema muestra una confirmacion de inactivacion:

- Titulo: `Confirmar inactivacion de rol`
- Confirmacion: `Si, inactivar`
- Mensaje funcional: al inactivarlo, los usuarios con este rol veran restringido su acceso.
- Nota: `Esta accion puede ser revertida en el futuro`.

Endpoint usado:

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `PATCH` | `/roles/:id/toggle` | Alternar estado activo/inactivo. |

## Eliminar rol

La accion Eliminar abre un modal de confirmacion.

Reglas visibles en frontend:

| Condicion | Comportamiento |
| --- | --- |
| `role.is_protected` es verdadero | El boton se deshabilita y el tooltip indica que los roles del sistema no pueden eliminarse. |
| `role.users_count > 0` | El boton se deshabilita si `can_delete` es falso y el tooltip indica cuantos usuarios tiene asignados. |
| `role.can_delete` es verdadero | El boton permite abrir la confirmacion de eliminacion. |

Endpoint usado:

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `DELETE` | `/roles/:id` | Eliminar un rol. |

## Campos del formulario

<div class="field-table">

| Campo | Obligatorio | Validaciones | Comportamiento en UI |
| --- | --- | --- | --- |
| Nombre del Rol | Si | Minimo 3 caracteres, maximo 50, solo letras, espacios y acentos | Input con placeholder `Ej: Administrador, Docente...`, contador de caracteres y validacion en tiempo real. |
| Descripcion | No | Minimo 10 caracteres si se escribe, maximo 255, letras, numeros, espacios y puntuacion basica | Textarea con placeholder `Descripcion del rol...`, contador de caracteres y texto de ayuda. |
| Permisos | Si | Debe seleccionarse al menos un permiso | Matriz agrupada de permisos con acciones por modulo. Si falta seleccion, se muestra toast de error. |

</div>

## Matriz de permisos

Los permisos disponibles se cargan al abrir el formulario mediante `loadPermissions()`.

Endpoint usado:

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/roles/modules` | Obtener el catalogo de modulos y permisos disponibles. |

La matriz agrupa permisos por grupo funcional. Algunos grupos se consolidan en frontend:

| Grupo frontend | Modulos incluidos |
| --- | --- |
| Estructura universitaria | `universidades`, `campuses`, `carreras` |
| Estructura de acreditacion | `dimensiones`, `componentes`, `criterios`, `estandares`, `elemento` |

Acciones reconocidas por la matriz:

| Accion tecnica | Etiqueta visible |
| --- | --- |
| `view` | Ver |
| `create` | Crear |
| `edit` | Editar |
| `delete` | Eliminar |
| `assign` | Asignar |
| `upload` | Subir |
| `download` | Descargar |
| `make_public` | Publico |
| `approve` | Aprobar |
| `reject` | Rechazar |
| `cancel` | Cancelar |
| `generate` | Generar |
| `export` | Exportar |
| `reactivar` | Reactivar |

Cada grupo permite:

- Seleccionar un permiso individual.
- Seleccionar todos los permisos del grupo.
- Quitar todos los permisos del grupo.
- Limpiar toda la seleccion desde el boton de limpiar.

## Estados de carga y error

| Estado | Comportamiento |
| --- | --- |
| Cargando roles | Se muestra `LoadingSpinner`. |
| Error al cargar roles | Se muestra `BackendErrorAlert` con opcion de reintento. |
| Cargando permisos | La seccion de permisos muestra `Cargando permisos disponibles...` o spinner segun el modal. |
| Error al crear, editar, eliminar o cambiar estado | Se muestra toast de error con el mensaje del backend cuando esta disponible. |

## Datos que recibe el frontend

El frontend espera roles con esta forma:

```ts
interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: BackendPermission[];
  users_count: number;
  is_protected: boolean;
  can_delete: boolean;
  is_active: boolean;
}
```

Cada permiso del backend tiene:

```ts
interface BackendPermission {
  id: number;
  name: string;
  label: string;
}
```

## Reglas importantes para soporte y QA

- Un rol protegido por el sistema no debe poder eliminarse desde la interfaz.
- Un rol con usuarios asignados puede aparecer con eliminacion bloqueada segun `can_delete`.
- Crear o editar requiere al menos un permiso.
- La lista de permisos no esta fija en el frontend; viene del backend desde `/roles/modules`.
- Si el backend agrega nuevos permisos con formato `modulo.accion`, la matriz los puede mostrar si la accion esta dentro de las acciones reconocidas.
- El frontend filtra y controla visualmente, pero la autorizacion definitiva debe mantenerse en backend.
