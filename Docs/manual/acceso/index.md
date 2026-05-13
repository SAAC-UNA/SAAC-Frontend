---
title: Acceso y Vistas Publicas
---

# Acceso y Vistas Publicas

Esta seccion documenta las pantallas que permiten ingresar al sistema, manejar sesiones vencidas y consultar recursos publicados sin entrar al flujo normal de modulos autenticados.

Incluye:

| Pagina | Proposito |
| --- | --- |
| Autenticacion | Iniciar sesion con credenciales institucionales y entender la expiracion de sesion. |
| Carpeta Publica | Consultar archivos y enlaces publicados mediante token. |
| Informe Publico | Consultar resoluciones SINAES e informe final institucional publicados. |

## Rutas incluidas

| Ruta | Pantalla |
| --- | --- |
| `/login` | Inicio de sesion |
| `/session-expired` | Sesion expirada |
| `/p/:token` | Carpeta publica |
| `/informe-publico` | Vista publica de informes de acreditacion |

## Reglas generales

- Estas rutas no se muestran como modulos operativos dentro de la navegacion lateral.
- Algunas vistas pueden abrirse sin sesion activa, como la carpeta publica generada por token.
- Las vistas publicas usan encabezados especiales para evitar redirecciones automaticas por sesion expirada cuando el acceso no requiere autenticacion.
- La autorizacion y validez final de tokens, cookies y permisos depende del backend.
