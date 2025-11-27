# Requerimientos Backend - HU008: Subida Múltiple de Evidencias

**Fecha:** 25 de noviembre de 2025  
**Rama:** `HU008_Subida_de_Evidencias_al_Sistema`  
**Equipo destinatario:** Backend

---

## 📋 Resumen Ejecutivo

El backend actual implementa correctamente la **subida individual de archivos**, pero la Historia de Usuario HU008 requiere funcionalidades adicionales que no están implementadas:

1. **Subida múltiple simultánea de archivos**
2. **Asociación de comentarios a archivos específicos**
3. **Soporte para enlaces web como evidencia**

---

## ⚠️ Funcionalidades Faltantes

### 1. Subida Múltiple de Archivos

#### **Problema Actual:**
El endpoint `POST /api/archivos` solo acepta **un archivo a la vez**:
```php
// StoreFileRequest.php - Línea 32
'archivo' => [
    'required',
    'file',  // ← Solo acepta un archivo
    'max:51200',
    'mimes:pdf,doc,docx,xls,xlsx,...'
],
```

#### **Requerimiento según HU008:**
> "El sistema permite seleccionar uno o varios archivos para subir simultáneamente."
> 
> **Criterio de Aceptación:**  
> "Dado que el usuario selecciona varios archivos en un mismo proceso, Cuando presiona Subir, Entonces el sistema procesa cada archivo individualmente, confirma la subida exitosa de cada uno y los muestra agrupados dentro del mismo criterio o evidencia."

#### **Solución Propuesta:**

**Opción A: Nuevo endpoint para subida múltiple**
```php
// Nueva ruta en api.php
Route::post('/archivos/bulk-upload', [FileController::class, 'bulkUpload']);
```

**Request esperado:**
```php
// StoreMultipleFilesRequest.php (CREAR)
public function rules(): array
{
    return [
        'archivos' => 'required|array|min:1|max:10', // Máximo 10 archivos por request
        'archivos.*' => [
            'required',
            'file',
            'max:51200', // 50MB por archivo
            'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,webp,mp4,avi,mov,wmv,mkv,webm,zip,rar,7z',
        ],
        'evidencia_id' => 'required|integer|exists:EVIDENCIA,evidencia_id',
        'proceso_id' => 'required|integer|exists:PROCESO,proceso_id',
        'comentario' => 'nullable|string|max:500', // Comentario opcional para el grupo
    ];
}
```

**Response esperado:**
```json
{
  "success": true,
  "message": "5 archivos subidos exitosamente.",
  "data": {
    "archivos_exitosos": [
      {
        "archivo_id": 101,
        "nombre_original": "Evidencia1.pdf",
        "estado": "success"
      },
      {
        "archivo_id": 102,
        "nombre_original": "Evidencia2.docx",
        "estado": "success"
      }
    ],
    "archivos_fallidos": [
      {
        "nombre_original": "ArchivoGrande.mp4",
        "error": "El archivo no debe superar los 50MB."
      }
    ],
    "total_subidos": 4,
    "total_fallidos": 1
  }
}
```

**Implementación sugerida en FileController:**
```php
public function bulkUpload(StoreMultipleFilesRequest $request): JsonResponse
{
    $validated = $request->validated();
    $usuarioId = auth()->id();
    
    $archivosSubidos = [];
    $archivosFallidos = [];
    
    foreach ($request->file('archivos') as $file) {
        try {
            $archivo = $this->fileService->uploadFile(
                file: $file,
                evidenciaId: $validated['evidencia_id'],
                usuarioId: $usuarioId,
                procesoId: $validated['proceso_id']
            );
            
            $archivosSubidos[] = [
                'archivo_id' => $archivo->archivo_id,
                'nombre_original' => $archivo->nombre_original,
                'estado' => 'success'
            ];
        } catch (\Exception $e) {
            $archivosFallidos[] = [
                'nombre_original' => $file->getClientOriginalName(),
                'error' => $e->getMessage()
            ];
        }
    }
    
    return response()->json([
        'success' => count($archivosSubidos) > 0,
        'message' => count($archivosSubidos) . ' archivos subidos exitosamente.',
        'data' => [
            'archivos_exitosos' => $archivosSubidos,
            'archivos_fallidos' => $archivosFallidos,
            'total_subidos' => count($archivosSubidos),
            'total_fallidos' => count($archivosFallidos),
        ],
    ], 201);
}
```

---

### 2. Comentarios Asociados a Archivos

#### **Problema Actual:**
La tabla `COMENTARIO` **NO tiene relación con `ARCHIVO`**:

```sql
-- Estructura actual de COMENTARIO
CREATE TABLE COMENTARIO (
    comentario_id BIGINT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    texto TEXT(300),
    fecha_creacion DATE,
    -- ❌ FALTA: archivo_id
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(usuario_id)
);
```

#### **Requerimiento según HU008:**
> "El sistema permite ingresar un comentario para cada evidencia o para un grupo de ellas."
>
> **Criterio de Aceptación:**  
> "Dado que el usuario adjunta un comentario junto con uno o varios archivos, Cuando confirma la subida, Entonces el sistema guarda el comentario y lo vincula a la evidencia, permitiendo visualizarlo junto con los archivos adjuntos."

#### **Solución Propuesta:**

**Opción A: Agregar relación archivo_id a COMENTARIO (Recomendada)**

**Nueva migración:**
```php
// database/migrations/2025_11_25_add_archivo_id_to_comentario_table.php

public function up(): void
{
    Schema::table('COMENTARIO', function (Blueprint $table) {
        // Agregar columna nullable (para no romper datos existentes)
        $table->foreignId('archivo_id')
              ->nullable()
              ->after('usuario_id')
              ->constrained('ARCHIVO', 'archivo_id')
              ->onDelete('cascade'); // Si se elimina el archivo, se elimina el comentario
        
        // Índice para optimización
        $table->index('archivo_id');
    });
}

public function down(): void
{
    Schema::table('COMENTARIO', function (Blueprint $table) {
        $table->dropForeign(['archivo_id']);
        $table->dropColumn('archivo_id');
    });
}
```

**Actualizar Model Comment.php:**
```php
protected $fillable = [
    'usuario_id',
    'archivo_id', // ← AGREGAR
    'texto',
    'fecha_creacion'
];

/**
 * Relación: Un comentario pertenece a un archivo.
 */
public function file()
{
    return $this->belongsTo(File::class, 'archivo_id', 'archivo_id');
}
```

**Actualizar Model File.php:**
```php
/**
 * Relación: Un archivo puede tener múltiples comentarios.
 */
public function comments()
{
    return $this->hasMany(Comment::class, 'archivo_id', 'archivo_id');
}
```

**Modificar StoreMultipleFilesRequest para incluir comentario:**
```php
public function rules(): array
{
    return [
        'archivos' => 'required|array|min:1|max:10',
        'archivos.*' => [...],
        'evidencia_id' => 'required|integer|exists:EVIDENCIA,evidencia_id',
        'proceso_id' => 'required|integer|exists:PROCESO,proceso_id',
        'comentario' => 'nullable|string|max:500', // ← Comentario general para todos los archivos
    ];
}
```

**Modificar bulkUpload para guardar comentario:**
```php
public function bulkUpload(StoreMultipleFilesRequest $request): JsonResponse
{
    $validated = $request->validated();
    $usuarioId = auth()->id();
    $comentarioTexto = $validated['comentario'] ?? null;
    
    $archivosSubidos = [];
    
    foreach ($request->file('archivos') as $file) {
        $archivo = $this->fileService->uploadFile(...);
        
        // Si hay comentario, crearlo y asociarlo al archivo
        if ($comentarioTexto) {
            Comment::create([
                'usuario_id' => $usuarioId,
                'archivo_id' => $archivo->archivo_id,
                'texto' => $comentarioTexto,
                'fecha_creacion' => now(),
            ]);
        }
        
        $archivosSubidos[] = [...];
    }
    
    return response()->json([...]);
}
```

**Opción B: Tabla intermedia COMENTARIO_ARCHIVO**

Si prefieres mantener COMENTARIO independiente:
```sql
CREATE TABLE COMENTARIO_ARCHIVO (
    comentario_archivo_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    comentario_id BIGINT NOT NULL,
    archivo_id BIGINT NOT NULL,
    FOREIGN KEY (comentario_id) REFERENCES COMENTARIO(comentario_id) ON DELETE CASCADE,
    FOREIGN KEY (archivo_id) REFERENCES ARCHIVO(archivo_id) ON DELETE CASCADE,
    UNIQUE KEY unique_comentario_archivo (comentario_id, archivo_id)
);
```

---

### 3. Soporte para Enlaces Web como Evidencia

#### **Problema Actual:**
La tabla `ARCHIVO` **solo soporta archivos físicos**, no enlaces web.

#### **Requerimiento según HU008:**
> "Quiero poder subir uno o varios archivos de distintos formatos (PDF, Word, Excel, imágenes, videos, **enlaces**, texto)"

#### **Solución Propuesta:**

**Nueva migración:**
```php
// database/migrations/2025_11_25_add_url_support_to_archivo_table.php

public function up(): void
{
    Schema::table('ARCHIVO', function (Blueprint $table) {
        // Agregar campo para URLs externas
        $table->string('url_externa', 2048)->nullable()->after('nombre_original');
        
        // Agregar tipo de evidencia
        $table->enum('tipo', ['archivo', 'url'])->default('archivo')->after('url_externa');
        
        // Hacer path nullable (ya que si es URL, no habrá path)
        $table->string('path', 512)->nullable()->change();
        
        // Índice
        $table->index('tipo');
    });
}

public function down(): void
{
    Schema::table('ARCHIVO', function (Blueprint $table) {
        $table->dropColumn(['url_externa', 'tipo']);
        $table->string('path', 512)->nullable(false)->change();
    });
}
```

**Actualizar Model File.php:**
```php
protected $fillable = [
    'evidencia_id',
    'usuario_id',
    'proceso_id',
    'fecha_subida',
    'path',
    'nombre_original',
    'url_externa',    // ← AGREGAR
    'tipo',           // ← AGREGAR
    'is_publico',
    'token_publico',
    'link_expira_en',
];

protected $casts = [
    'fecha_subida' => 'datetime',
    'is_publico' => 'boolean',
    'link_expira_en' => 'datetime',
];

/**
 * Verifica si el archivo es una URL externa.
 */
public function isUrl(): bool
{
    return $this->tipo === 'url';
}

/**
 * Verifica si el archivo es un archivo físico.
 */
public function isFile(): bool
{
    return $this->tipo === 'archivo';
}
```

**Nuevo Request para URLs:**
```php
// app/Http/Requests/StoreUrlRequest.php (CREAR)

public function rules(): array
{
    return [
        'url' => 'required|url|max:2048',
        'nombre_original' => 'nullable|string|max:255', // Título personalizado para la URL
        'evidencia_id' => 'required|integer|exists:EVIDENCIA,evidencia_id',
        'proceso_id' => 'required|integer|exists:PROCESO,proceso_id',
        'comentario' => 'nullable|string|max:500',
    ];
}

public function messages(): array
{
    return [
        'url.required' => 'Debe proporcionar una URL válida.',
        'url.url' => 'El formato de la URL no es válido.',
        'url.max' => 'La URL no debe superar los 2048 caracteres.',
    ];
}
```

**Nuevo método en FileService:**
```php
/**
 * Registra una URL externa como evidencia.
 */
public function storeUrl(
    string $url,
    int $evidenciaId,
    int $usuarioId,
    int $procesoId,
    ?string $nombreOriginal = null
): File {
    $archivo = File::create([
        'evidencia_id' => $evidenciaId,
        'usuario_id' => $usuarioId,
        'proceso_id' => $procesoId,
        'fecha_subida' => now(),
        'path' => null, // No hay path físico
        'nombre_original' => $nombreOriginal ?? $url,
        'url_externa' => $url,
        'tipo' => 'url',
        'is_publico' => false,
        'token_publico' => null,
        'link_expira_en' => null,
    ]);

    Log::info('URL registrada como evidencia', [
        'archivo_id' => $archivo->archivo_id,
        'url' => $url,
        'usuario_id' => $usuarioId,
    ]);

    return $archivo;
}
```

**Nuevo endpoint en FileController:**
```php
/**
 * Registrar una URL externa como evidencia.
 * POST /api/archivos/url
 */
public function storeUrl(StoreUrlRequest $request): JsonResponse
{
    $validated = $request->validated();
    $usuarioId = auth()->id();
    
    $archivo = $this->fileService->storeUrl(
        url: $validated['url'],
        evidenciaId: $validated['evidencia_id'],
        usuarioId: $usuarioId,
        procesoId: $validated['proceso_id'],
        nombreOriginal: $validated['nombre_original'] ?? null
    );
    
    // Si hay comentario, crearlo
    if (isset($validated['comentario'])) {
        Comment::create([
            'usuario_id' => $usuarioId,
            'archivo_id' => $archivo->archivo_id,
            'texto' => $validated['comentario'],
            'fecha_creacion' => now(),
        ]);
    }
    
    $archivo->load(['evidence', 'user', 'process']);
    
    return response()->json([
        'success' => true,
        'message' => 'URL registrada exitosamente como evidencia.',
        'data' => new FileResource($archivo),
    ], 201);
}
```

**Nueva ruta en api.php:**
```php
// Registrar URL externa
Route::post('/url', [FileController::class, 'storeUrl']);
```

---

## 📊 Resumen de Cambios Necesarios

### Archivos a Crear:
1. ✅ `app/Http/Requests/StoreMultipleFilesRequest.php`
2. ✅ `app/Http/Requests/StoreUrlRequest.php`
3. ✅ `database/migrations/2025_11_25_add_archivo_id_to_comentario_table.php`
4. ✅ `database/migrations/2025_11_25_add_url_support_to_archivo_table.php`

### Archivos a Modificar:
1. ✅ `app/Http/Controllers/FileController.php` - Agregar métodos `bulkUpload()` y `storeUrl()`
2. ✅ `app/Services/FileService.php` - Agregar método `storeUrl()`
3. ✅ `app/Models/File.php` - Agregar relación `comments()` y métodos `isUrl()`, `isFile()`
4. ✅ `app/Models/Comment.php` - Agregar campo `archivo_id` y relación `file()`
5. ✅ `routes/api.php` - Agregar rutas `POST /archivos/bulk-upload` y `POST /archivos/url`

---

## 🧪 Pruebas Sugeridas

### Pruebas Unitarias:
```php
// tests/Unit/FileServiceTest.php
public function test_upload_multiple_files_success()
public function test_upload_with_comment()
public function test_store_url_as_evidence()
public function test_url_validation()
```

### Pruebas de Feature:
```php
// tests/Feature/BulkFileUploadTest.php
public function test_bulk_upload_endpoint_accepts_multiple_files()
public function test_bulk_upload_returns_success_and_failed_files()
public function test_bulk_upload_with_comment_creates_comment_for_all_files()
public function test_url_endpoint_creates_file_record_without_physical_file()
```

---

## 🔗 Endpoints Resultantes

### Endpoints Actuales (Ya implementados):
- `GET /api/archivos` - Listar archivos
- `POST /api/archivos` - Subir archivo individual
- `GET /api/archivos/{id}` - Ver metadatos
- `DELETE /api/archivos/{id}` - Eliminar archivo
- `POST /api/archivos/{id}/make-public` - Hacer público
- `POST /api/archivos/{id}/revoke-public` - Revocar acceso
- `POST /api/archivos/bulk-make-public` - Múltiples públicos

### Endpoints Nuevos (A implementar):
- ✅ `POST /api/archivos/bulk-upload` - **Subir múltiples archivos**
- ✅ `POST /api/archivos/url` - **Registrar URL como evidencia**

---

## 📞 Contacto y Coordinación

**Equipo Frontend esperando:**
- Notificación cuando se implementen los endpoints de subida múltiple
- Documentación de los nuevos contratos de API
- Ambiente de pruebas con las migraciones aplicadas

**Sugerencia de prioridad:**
1. 🔴 **Alta:** Subida múltiple de archivos (Criterio de aceptación crítico)
2. 🟡 **Media:** Comentarios asociados a archivos (Mejora UX)
3. 🟢 **Baja:** Soporte para URLs (Feature adicional)

---

## 📝 Notas Finales

- Todos los cambios propuestos son **retrocompatibles** con el código actual
- Las migraciones usan campos `nullable()` para no romper datos existentes
- Se mantienen las validaciones de seguridad (FilePolicy) existentes
- El frontend puede comenzar desarrollo con subida individual mientras tanto

**Fecha estimada de necesidad:** Antes del 30 de noviembre de 2025

---

**Preparado por:** Equipo Frontend  
**Revisión sugerida por:** Equipo Backend
