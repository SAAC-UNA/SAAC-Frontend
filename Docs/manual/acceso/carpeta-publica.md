---
title: Carpeta Publica
---

# Carpeta Publica

La Carpeta Publica permite consultar archivos y enlaces publicados mediante un token. Esta pantalla se usa para compartir evidencias o documentos sin requerir que la persona visitante inicie sesion en SAAC.

<div class="module-meta">

**Ruta:** `/p/:token`  
**Archivo principal:** `src/Pages/PublicFolder/PublicFolderPage.tsx`  
**Servicio:** usa `axiosInstance` directamente  
**Acceso:** publico por token

</div>

## Vista principal

La pantalla muestra un encabezado institucional con logos, badges de acceso publico y el tipo de contexto publicado.

Cuando la carpeta carga correctamente, se muestran:

| Elemento | Descripcion |
| --- | --- |
| Titulo | `Carpeta de ...`, segun el titulo o tipo recibido desde backend. |
| Nomenclatura | Identificador del criterio, elemento o contexto publicado. |
| Total elementos | Cantidad total de archivos y enlaces disponibles. |
| Archivos y enlaces | Resumen de cuantos elementos son archivos y cuantos son enlaces. |
| Descripcion | Texto descriptivo del contexto, si el backend lo envia. |
| Documentos disponibles | Lista de recursos publicados. |

## Token de acceso

La ruta espera un parametro `token`.

Si el token no existe, la pantalla muestra error:

```txt
Token de acceso invalido.
```

Si el token existe, el frontend consulta la carpeta publica asociada.

## Lista de documentos

Cada recurso disponible muestra:

| Campo | Descripcion |
| --- | --- |
| Nombre | Nombre original del archivo o enlace. |
| Tipo | Badge `Archivo` o `Enlace`. |
| Fecha de subida | Fecha enviada por backend o `Sin fecha`. |
| Accion | `Descargar` para archivos o `Abrir enlace` para enlaces. |

## Descargar archivos

Cuando el recurso es de tipo archivo:

1. El usuario presiona `Descargar`.
2. El frontend usa el `token_publico` del archivo.
3. Solicita el contenido como blob.
4. Crea una descarga local con el nombre original del archivo.

Mientras descarga, el boton muestra `Abriendo...`.

Si falta el token publico del archivo, se muestra:

```txt
No se encontro el token publico del archivo.
```

Si falla la descarga, se muestra:

```txt
No fue posible descargar el archivo.
```

## Abrir enlaces

Cuando el recurso es de tipo enlace:

1. El usuario presiona `Abrir enlace`.
2. El frontend abre `item.url` en una pestana nueva.

## Estados de pantalla

| Estado | Comportamiento |
| --- | --- |
| Cargando | Muestra `LoadingSpinner`. |
| Error | Muestra `No se pudo abrir la carpeta publica` y la descripcion del error. |
| Sin elementos | Muestra `Sin archivos publicados`. |
| Con elementos | Muestra lista de documentos disponibles. |

## Endpoints usados

| Metodo | Ruta backend | Uso |
| --- | --- | --- |
| `GET` | `/p/:token/carpeta` | Obtener contexto y lista de recursos publicados. |
| `GET` | `/p/:token_publico` | Descargar un archivo publico individual. |

Las solicitudes publicas envian:

```txt
X-Skip-Session-Redirect: true
```

Esto evita que una respuesta no autenticada mande al usuario a la pantalla de sesion expirada.

## Datos esperados

La respuesta de carpeta publica tiene esta forma funcional:

```ts
{
  success: boolean;
  data: {
    contexto: {
      tipo: string;
      titulo: string;
      nomenclatura?: string | null;
      descripcion?: string | null;
    };
    items: Array<{
      archivo_id: number;
      nombre_original: string;
      tipo: "archivo" | "enlace";
      token_publico?: string | null;
      fecha_subida?: string | null;
      url?: string | null;
    }>;
  };
}
```

## Reglas importantes para soporte y QA

- Esta pantalla debe funcionar sin sesion activa.
- El token de la ruta identifica la carpeta, pero cada archivo puede tener su propio `token_publico`.
- Revocar o regenerar enlaces desde Gestion de Enlaces puede afectar el acceso a esta pantalla.
- Un enlace externo se abre en otra pestana; un archivo se descarga desde el backend.
- Si el backend devuelve `success: false`, la vista se considera error.
