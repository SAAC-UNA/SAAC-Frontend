---
title: Autenticacion
---

# Autenticacion

La autenticacion permite ingresar al sistema con credenciales institucionales. El frontend valida campos basicos, solicita la cookie CSRF requerida por Laravel Sanctum, envia las credenciales al backend y guarda la informacion de sesion en el navegador.

<div class="module-meta">

**Rutas:** `/login`, `/session-expired`  
**Archivo login:** `src/Pages/Auth/Login.tsx`  
**Archivo sesion expirada:** `src/Pages/Auth/SessionExpired.tsx`  
**Servicio:** `src/Services/AuthService.ts`  
**Contexto:** `src/Context/AuthContext.tsx`

</div>

## Inicio de sesion

La ruta `/login` muestra una tarjeta central con el logo de SAAC, fondo visual animado y el formulario de ingreso.

Campos visibles:

| Campo | Obligatorio | Comportamiento |
| --- | --- | --- |
| Identificacion | Si | Recibe la cedula o identificacion institucional. |
| Contrasena | Si | Recibe la contrasena institucional. Puede mostrarse u ocultarse. |

El formulario tambien muestra:

- Boton `Ingresar`.
- Enlace `Olvido su contrasena?` hacia `https://recuperacion.una.ac.cr/`.
- Tooltip de ayuda en el campo contrasena.
- Pie de pagina con el anio actual, SAAC y Universidad Nacional de Costa Rica.

## Validaciones visibles

Antes de enviar al backend, el servicio valida que identificacion y contrasena no esten vacias.

Si falta alguno de los campos, se genera el mensaje:

```txt
La cedula y contrasena son obligatorias
```

Si el backend devuelve errores de validacion, el frontend muestra cada mensaje como toast. Si devuelve un error general, se muestra el mensaje recibido o uno generico de credenciales incorrectas.

## Flujo tecnico de login

1. El usuario escribe identificacion y contrasena.
2. Presiona `Ingresar`.
3. El boton cambia a `Cargando...` y los campos quedan deshabilitados.
4. El frontend solicita la cookie CSRF de Sanctum.
5. El frontend envia `cedula` y `password` al backend.
6. Si el backend responde correctamente, el usuario queda guardado en `sessionStorage`.
7. El sistema redirige a `/`.

## Persistencia de sesion

La sesion se guarda por pestana del navegador mediante `sessionStorage`.

| Llave | Uso |
| --- | --- |
| `auth_user` | Datos del usuario autenticado. |
| `session_expiration` | Marca temporal de expiracion local. |
| `session_lifetime_seconds` | Duracion de sesion informada por backend. |

El token de autenticacion no se maneja como token visible del frontend; la sesion depende de cookie httpOnly enviada por el backend.

## Sesion expirada

La ruta `/session-expired` muestra un dialogo centrado con:

- Logo SAAC.
- Titulo `SESION EXPIRADA`.
- Mensaje indicando que la sesion expiro.
- Cuenta regresiva de 5 segundos.
- Boton `Iniciar sesion`.

Si el usuario no presiona el boton, el sistema redirige automaticamente a `/login` al terminar la cuenta regresiva.

## Expiracion automatica

El interceptor de Axios redirige a `/session-expired` cuando una respuesta protegida devuelve:

| Codigo | Significado funcional |
| --- | --- |
| `401` | No autorizado o sesion invalida. |
| `419` | CSRF o sesion expirada. |

La redireccion se omite cuando la solicitud incluye el encabezado:

```txt
X-Skip-Session-Redirect: true
```

Este encabezado se usa en validaciones o vistas publicas donde no se debe forzar el flujo de sesion expirada.

## Cierre de sesion

El servicio de autenticacion llama al backend para cerrar sesion y luego limpia datos locales.

Tambien elimina el contexto operacional seleccionado, para evitar que una nueva sesion reutilice carrera, ciclo o proceso de otro usuario.

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/sanctum/csrf-cookie` | Obtener cookie CSRF antes del login. |
| `POST` | `/auth/login` | Autenticar por identificacion y contrasena. |
| `POST` | `/auth/logout` | Cerrar sesion y limpiar cookie. |
| `GET` | `/auth/me` | Validar sesion actual y recuperar usuario autenticado. |

Payload de login:

```ts
{
  cedula: string;
  password: string;
}
```

## Reglas importantes para soporte y QA

- El acceso usa credenciales institucionales, no usuarios creados solo en frontend.
- El enlace de recuperacion de contrasena abre un sitio externo de la Universidad Nacional.
- Despues de login correcto, la navegacion depende de roles, permisos y contexto.
- Una sesion expirada debe limpiar el estado local antes de redirigir al login.
- La sesion se conserva al refrescar la pestana, pero no necesariamente en una pestana nueva.
