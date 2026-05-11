---
title: Plantilla de modulo
---

# Plantilla de modulo

Usar esta estructura para documentar nuevos modulos o completar paginas pendientes.

## Resumen

Describir que problema resuelve el modulo y quien lo usa.

## Acceso

| Dato | Valor |
| --- | --- |
| Ruta frontend | `/ruta` |
| Archivo principal | `src/Pages/...` |
| Permisos o capacidades | `cap...` |
| Requiere contexto operativo | Si o no |

## Vista principal

Describir tablas, tarjetas, filtros, encabezado, estados vacios y mensajes.

## Acciones

| Accion | Boton o control | Resultado | Restricciones |
| --- | --- | --- | --- |
| Crear | Boton `Crear` | Abre formulario | Permiso requerido |

## Campos y validaciones

| Campo | Obligatorio | Reglas | Mensajes |
| --- | --- | --- | --- |
| Nombre | Si | Maximo X caracteres | Mensaje visible |

## Servicios y endpoints

| Metodo | Endpoint | Uso |
| --- | --- | --- |
| `GET` | `/endpoint` | Cargar datos |

## Estados

Documentar carga, error, vacio, exito y confirmaciones.

## Reglas para QA

Listar escenarios que deben probarse.
