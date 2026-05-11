---
title: Usuarios
---

# Usuarios

El submodulo Usuarios permite consultar las cuentas registradas, revisar su informacion, cambiar su estado de acceso y editar su rol o asignaciones operativas.

<div class="module-meta">

**Ruta:** `/usuarios`  
**Archivo principal:** `src/Pages/Users/UsersList.tsx`  
**Componentes clave:** `UsersTable`, `UserDetailsModal`, `UserEditModal`, `EditUserForm`  
**Servicio:** `src/Services/UserService.ts`  
**Acceso en menu:** `cap.admin.users.manage` o alguno de `usuarios.view`, `usuarios.create`, `usuarios.edit`, `usuarios.delete`

</div>

## Vista principal

Al ingresar a Usuarios, el sistema carga la lista de usuarios mediante `useUsers().loadUsers()`. La pantalla muestra un encabezado con la informacion contextual del modulo y un buscador.

Elementos principales:

| Elemento | Descripcion |
| --- | --- |
| Encabezado | Muestra el titulo y descripcion definidos para Gestion de Usuarios. |
| Buscador | Campo `Buscar usuarios...` para filtrar resultados. |
| Tabla | Lista usuarios con nombre, correo, rol, estado y acciones. |
| Paginacion | Se muestra cuando la cantidad de usuarios supera el tamano estandar de pagina. |
| Modales | Se usan para ver detalle, editar usuario y confirmar cambios de estado. |

## Busqueda

La busqueda se aplica con debounce de 300 ms para evitar filtrados innecesarios mientras el usuario escribe.

Filtra por:

- Nombre del usuario.
- Correo electronico.
- Rol asignado.
- Estado tecnico (`active` o `inactive`).
- Estado visible (`activo` o `inactivo`).

Si no hay coincidencias, la tabla muestra: `No se encontraron usuarios que coincidan con los filtros de busqueda`.

Si no existen usuarios registrados, muestra: `No hay usuarios registrados aun.`

## Tabla de usuarios

| Columna | Descripcion |
| --- | --- |
| Nombre | Muestra el nombre del usuario y debajo su correo electronico. |
| Rol | Muestra el rol asignado. Si no hay rol, muestra `Sin rol`. |
| Estado | Badge de estado activo o inactivo. |
| Acciones | Botones para ver, editar y activar/inactivar usuario. |

Los textos largos se truncan visualmente y conservan el valor completo en el tooltip nativo del navegador cuando aplica.

## Acciones disponibles

| Accion | Boton | Resultado |
| --- | --- | --- |
| Ver usuario | Icono de ver | Abre un modal con informacion personal, estado, rol y permisos del usuario. |
| Editar usuario | Icono de editar | Abre el formulario de edicion para cambiar rol y, si aplica, sede-carrera. |
| Activar usuario | Icono de encendido sobre usuario inactivo | Abre confirmacion antes de activar el acceso. |
| Inactivar usuario | Icono de encendido sobre usuario activo | Abre confirmacion antes de revocar el acceso. |

## Ver usuario

El modal de detalle usa `UserDetailsModal`.

Muestra:

- Nombre completo.
- Estado.
- Correo electronico.
- Rol asignado, si existe.
- Permisos agrupados por catalogo cuando hay permisos disponibles.
- Total de permisos.

Si el catalogo de permisos todavia esta cargando, el modal muestra un indicador de carga en la seccion de permisos. Si no se pueden agrupar, muestra la lista simple de permisos.

## Editar usuario

La accion Editar abre `UserEditModal`, que contiene `EditUserForm`.

El formulario permite:

- Ver informacion personal del usuario en modo solo lectura.
- Seleccionar un unico rol para el usuario.
- Revisar una vista previa de los permisos del rol seleccionado.
- Asignar sede-carrera cuando el usuario autenticado tiene permiso para hacerlo.

El boton Guardar del modal queda deshabilitado hasta que existan cambios pendientes.

## Gestion de roles del usuario

El formulario carga los roles disponibles mediante `roleService.listarRoles()`.

Reglas visibles:

| Regla | Comportamiento |
| --- | --- |
| Solo un rol por usuario | El formulario indica `(Solo se permite un rol por usuario)`. |
| Rol obligatorio para guardar | Si no se selecciona rol, se registra el error `Debe seleccionar un rol`. |
| Permisos del rol | Se muestran como vista previa y no pueden modificarse desde Usuarios. |
| Sin cambios | El boton principal permanece deshabilitado. |

Cuando se confirma la edicion, si el rol cambio, el frontend llama al endpoint de asignacion de rol.

## Asignacion de sede-carrera

La seccion `Asignacion de Sede-Carrera` aparece solo si el usuario autenticado puede acceder con alguno de estos permisos:

- `usuarios.assign`
- `usuarios.approve`

Cuando esta disponible, permite:

- Seleccionar una carrera activa.
- Seleccionar una sede filtrada por la universidad de la carrera seleccionada.
- Agregar pares carrera-sede a la lista del usuario.
- Eliminar pares agregados.

Reglas visibles:

| Regla | Comportamiento |
| --- | --- |
| Primero carrera | El selector de sede permanece deshabilitado hasta seleccionar carrera. |
| Sedes filtradas | Solo se muestran sedes de la universidad asociada a la carrera. |
| Duplicados | No se agrega un par carrera-sede si ya existe en la lista. |
| Sin asignaciones | Se muestra `No hay sede-carreras asignadas.` |
| Advertencia | Se indica que el usuario solo vera informacion de las sede-carreras asignadas. |

Antes de guardar, cada par carrera-sede se resuelve o crea mediante `resolveOrCreateCareerCampus`.

## Activar usuario

Si el usuario esta inactivo, la accion de estado abre una confirmacion:

- Titulo: `Confirmar activacion de usuario`
- Confirmacion: `Si, activar`
- Mensaje funcional: al activar el usuario, podra acceder al sistema con sus credenciales.

Si el backend confirma la operacion, se muestra un modal de exito con el titulo `Usuario activado`.

## Inactivar usuario

Si el usuario esta activo, la accion de estado abre una confirmacion:

- Titulo: `Confirmar inactivacion de usuario`
- Confirmacion: `Si, inactivar`
- Mensaje funcional: al inactivar el usuario, se revocara su acceso al sistema.
- Nota: `Esta accion puede ser revertida en el futuro`.

Si el backend confirma la operacion, se muestra un modal de exito con el titulo `Usuario inactivado`.

## Actualizacion optimista

El hook `useUsers` actualiza el estado del usuario antes de completar la llamada de activacion o inactivacion. Si el backend responde con error, el frontend revierte el cambio visual al estado anterior y registra el error.

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/admin/users` | Cargar la lista de usuarios. |
| `PATCH` | `/admin/users/:id/activate` | Activar un usuario. |
| `PATCH` | `/admin/users/:id/deactivate` | Inactivar un usuario. |
| `PUT` | `/admin/users/:id/role` | Asignar un rol al usuario. |
| `PUT` | `/admin/users/:id/careers` | Asignar carrera-sedes al usuario. |
| `GET` | `/estructura/carrera-sede` | Listar carrera-sedes disponibles. |

Ademas, la edicion consulta roles desde el servicio de roles con `GET /roles`.

## Datos que recibe el frontend

El frontend transforma usuarios del backend a esta forma:

```ts
interface User {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  role?: string;
  careers?: BackendCareer[];
  directPermissions?: string[];
  allPermissions?: BackendPermission[];
  createdAt?: Date;
  updatedAt?: Date;
}
```

Cada usuario del backend puede incluir:

```ts
interface BackendUser {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  cedula: string;
  created_at: string;
  updated_at: string;
  roles: BackendRole[];
  careers: BackendCareer[];
  direct_permissions: BackendPermission[];
  all_permissions: BackendPermission[];
}
```

## Estados de carga y error

| Estado | Comportamiento |
| --- | --- |
| Cargando usuarios | La tabla recibe `loading` desde `DataTable`. |
| Error al cargar usuarios | Se muestra `BackendErrorAlert` con reintento. |
| Cargando roles en edicion | Se muestra `LoadingSpinner` en el selector de rol. |
| Error al cargar roles | Se muestra `BackendErrorAlert` dentro del formulario. |
| Error al cambiar estado | Se muestra toast de error y se cierra la confirmacion. |
| Error al actualizar usuario | Se muestra toast de error y se cierra la confirmacion de edicion. |

## Reglas importantes para soporte y QA

- La pantalla no muestra boton de creacion de usuario; solo permite consultar, editar y cambiar estado.
- La edicion permite un solo rol por usuario.
- Los permisos se heredan del rol y no se editan desde Usuarios.
- La asignacion sede-carrera solo aparece con permisos `usuarios.assign` o `usuarios.approve`.
- Activar o inactivar usuario requiere confirmacion.
- La autorizacion final debe mantenerse en backend; el frontend solo controla visibilidad y flujo de uso.
