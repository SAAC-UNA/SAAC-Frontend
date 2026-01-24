# Problema: Subida de Múltiples Archivos - Solo llega el primer archivo

**Fecha**: 24 de enero de 2026  
**Módulo**: HU-008 - Subida de Evidencias  
**Estado**: 🔴 **SIN RESOLVER**

---

## 📋 Resumen del Problema

Al intentar subir múltiples archivos (2 o más) usando `FormData` desde el frontend React hacia el backend Laravel, **solo llega el primer archivo al servidor**. El segundo (y subsecuentes) archivos llegan vacíos.

### Síntomas

- **Frontend**: FormData contiene correctamente ambos archivos antes de enviar (verificado con `formData.entries()`)
- **Backend**: Solo recibe el primer archivo, los demás llegan como `UploadedFile` vacíos (`""`)

### Ejemplo del Log

**Frontend (antes de enviar)**:
```
archivos[]: File(API de Bitácora.docx, 20186bytes)
archivos[]: File(DOCUMENTO.pdf, 3972092bytes)
```

**Backend (después de recibir)**:
```json
{
  "archivos": [
    {"Illuminate\\Http\\UploadedFile": "C:\\...\\php2EAC.tmp"},  // ✅ Archivo 1
    {"Illuminate\\Http\\UploadedFile": ""}                       // ❌ Archivo 2 vacío
  ]
}
```

---

## 🔍 Investigación Realizada

### Intentos de Solución

#### 1. ❌ Cambio de nombre de campo
- **Probado**: `archivos`, `archivos[]`, `archivos[0]`, `archivos[1]`
- **Resultado**: Mismo problema - solo llega el primer archivo

#### 2. ❌ Eliminación de Content-Type en Axios
- **Probado**: `'Content-Type': undefined`, eliminar headers, `transformRequest`
- **Resultado**: Sin cambios

#### 3. ❌ Modificación del interceptor de Axios
- **Probado**: Detectar `FormData` y no establecer `Content-Type: application/json`
- **Resultado**: Sin cambios

#### 4. ❌ Uso de XMLHttpRequest nativo
- **Probado**: Reemplazar Axios completamente con `XMLHttpRequest`
- **Resultado**: Mismo problema persiste

#### 5. ❌ Uso de Blob wrapper
- **Probado**: `new Blob([file], { type: file.type })`
- **Resultado**: Sin cambios

### Código Actual del Frontend

```typescript
// FileService.ts - uploadMultipleFiles
const formData = new FormData();
formData.append('evidencia_id', evidenciaId.toString());
formData.append('proceso_id', procesoId.toString());

files.forEach(file => {
  formData.append('archivos[]', file);
});

await axiosInstance.post('/api/archivos', formData, {
  onUploadProgress: (progressEvent) => { /* ... */ }
});
```

### Código Actual del Backend

```php
// StoreFileRequest.php
public function rules(): array
{
    return [
        'archivos' => ['required', 'array', 'min:1', 'max:5'],
        'archivos.*' => ['required', 'file', 'max:51200', 'mimes:...'],
        'evidencia_id' => ['required', 'integer', 'exists:EVIDENCIA,evidencia_id'],
        'proceso_id' => ['required', 'integer', 'exists:PROCESO,proceso_id'],
    ];
}

// FileController.php
foreach ($request->file('archivos', []) as $index => $archivo) {
    // Solo ejecuta una vez - solo hay un archivo válido
}
```

---

## 🤔 Posibles Causas

### 1. Configuración de PHP
- **Límites de upload**: `upload_max_filesize`, `post_max_size`, `max_file_uploads`
- **Timeout**: `max_execution_time`, `max_input_time`
- **Memory**: `memory_limit`

**Verificar en**: `php.ini` o ejecutar `php -i | Select-String "upload\|post_max\|max_file"`

### 2. Configuración del Servidor Web
- **Nginx/Apache**: Límites de tamaño de request body
- **Timeouts**: Puede estar cortando archivos grandes

### 3. Middleware de Laravel
- **VerifyCsrfToken**: Aunque debería estar deshabilitado para API
- **TrimStrings/ConvertEmptyStringsToNull**: Podría estar interfiriendo

### 4. Configuración de Sanctum
- Algún middleware que procese el request antes de llegar al controller

### 5. Problema con el Boundary de multipart/form-data
- El navegador genera el boundary automáticamente
- Podría estar mal formado o truncado en el servidor

### 6. Buffer/Stream del Request
- PHP podría estar leyendo solo parte del stream
- Problema con `php://input` o similar

---

## 🔧 Pasos de Diagnóstico Recomendados

### 1. Verificar Configuración de PHP

```powershell
# Ver configuración actual
php -i | Select-String "upload_max_filesize|post_max_size|max_file_uploads"

# Valores recomendados en php.ini:
# upload_max_filesize = 50M
# post_max_size = 100M
# max_file_uploads = 20
```

### 2. Inspeccionar el Request Raw en el Backend

Agregar en `FileController::store()`:

```php
// Ver el request completo
\Log::info('Raw Request', [
    'content_type' => $request->header('Content-Type'),
    'content_length' => $request->header('Content-Length'),
    'all_files' => $request->allFiles(),
    'file_count' => count($request->file('archivos', [])),
]);

// Ver cada archivo individualmente
foreach ($request->file('archivos', []) as $index => $file) {
    \Log::info("Archivo $index", [
        'original_name' => $file->getClientOriginalName(),
        'size' => $file->getSize(),
        'mime' => $file->getMimeType(),
        'is_valid' => $file->isValid(),
        'error' => $file->getError(),
        'path' => $file->getRealPath(),
    ]);
}
```

### 3. Capturar el Request HTTP Completo

Usar herramientas como:
- **Postman**: Probar el endpoint directamente con múltiples archivos
- **cURL**: Comando para testing:
  ```bash
  curl -X POST http://127.0.0.1:8000/api/archivos \
    -H "Authorization: Bearer TOKEN" \
    -F "archivos[]=@file1.pdf" \
    -F "archivos[]=@file2.docx" \
    -F "evidencia_id=6" \
    -F "proceso_id=1"
  ```
- **Fiddler/Charles Proxy**: Ver el request exacto que se envía

### 4. Verificar Logs del Servidor Web

```powershell
# Laravel logs
Get-Content storage/logs/laravel.log -Tail 50

# PHP error logs (ubicación puede variar)
Get-Content C:\xampp\php\logs\php_error_log -Tail 50
```

### 5. Probar con Subida Individual

Verificar si el problema es específico de múltiples archivos:

```typescript
// Subir archivo por archivo en secuencia
for (const file of files) {
  const formData = new FormData();
  formData.append('archivo', file);
  formData.append('evidencia_id', evidenciaId.toString());
  formData.append('proceso_id', procesoId.toString());
  
  await fileService.uploadFile(file, evidenciaId, procesoId);
}
```

---

## 💡 Soluciones Alternativas (Workarounds)

### Opción 1: Subida Secuencial
Subir archivos uno por uno en lugar de simultáneamente:

**Pros**: Debería funcionar con el código actual  
**Contras**: Más lento, más requests HTTP

### Opción 2: Endpoint Separado para Múltiples Archivos
Crear un endpoint dedicado `/api/archivos/multiple` con validación específica

### Opción 3: Usar Base64
Convertir archivos a Base64 y enviar como JSON (NO RECOMENDADO para archivos grandes)

### Opción 4: Subida en Chunks
Dividir archivos grandes en partes y ensamblar en el servidor

---

## 📚 Referencias

### Documentación Relevante
- [Laravel File Uploads](https://laravel.com/docs/11.x/requests#files)
- [MDN FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [PHP File Upload Configuration](https://www.php.net/manual/en/ini.core.php#ini.file-uploads)

### Issues Similares
- [Laravel GitHub - Multiple File Upload Issues](https://github.com/laravel/framework/issues?q=multiple+file+upload)
- [Axios FormData Problems](https://github.com/axios/axios/issues?q=formdata)

---

## 🎯 Próximos Pasos

1. **Revisar `php.ini`** - Verificar límites de archivos
2. **Probar con Postman** - Descartar problema del frontend
3. **Agregar logging detallado** - Ver exactamente qué llega al servidor
4. **Verificar middlewares** - Revisar si algo procesa el request antes del controller
5. **Actualizar dependencias** - Verificar si hay bugs conocidos en Laravel/Sanctum

---

## 👥 Información Adicional

**Entorno**:
- Frontend: React + Vite + TypeScript + Axios
- Backend: Laravel 11 + PHP 8.4
- Servidor: `php artisan serve` (desarrollo)
- SO: Windows

**Archivos Relacionados**:
- Frontend: `src/Services/FileService.ts`
- Frontend: `src/Config/axios.ts`
- Backend: `app/Http/Controllers/FileController.php`
- Backend: `app/Http/Requests/StoreFileRequest.php`

---

**Nota**: Este problema requiere investigación más profunda a nivel de infraestructura (PHP, servidor web, configuración de Laravel) más que a nivel de código de aplicación.
