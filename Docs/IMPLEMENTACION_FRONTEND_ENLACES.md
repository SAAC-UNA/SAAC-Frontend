# Implementación Frontend: Soporte de Enlaces en Evidencias

**Fecha:** 24 de enero de 2026  
**Estado:** ✅ Implementado (Pendiente backend)  
**Módulo:** Sistema de Evidencias (HU-008, HU-029)

---

## Resumen

Se ha implementado la funcionalidad completa del frontend para permitir a los usuarios agregar enlaces/URLs como evidencias, además de archivos físicos. El backend aún no está preparado (ver: [REQUISITOS_BACKEND_ENLACES_EVIDENCIAS.md](REQUISITOS_BACKEND_ENLACES_EVIDENCIAS.md)).

---

## Archivos Creados/Modificados

### 1. Tipos Actualizados
**Archivo:** [src/Types/FileTypes.ts](../src/Types/FileTypes.ts)

**Cambios:**
- ✅ Agregado campo `url_externa?: string | null` a `FileModel`
- ✅ Agregado campo `tipo_evidencia?: 'archivo' | 'enlace'` a `FileModel`
- ✅ Agregado campo `path?: string | null` a `FileModel`
- ✅ Nueva constante `MAX_LINKS_PER_UPLOAD = 5`
- ✅ Nueva constante `MAX_URL_LENGTH = 2048`
- ✅ Nueva constante `URL_REGEX` para validación
- ✅ Nuevo tipo en `FileCategory`: `'link'`

### 2. Servicio de Archivos Extendido
**Archivo:** [src/Services/FileService.ts](../src/Services/FileService.ts)

**Nuevos métodos:**

```typescript
// Subir solo enlaces
fileService.uploadMultipleLinks(
  urls: string[],
  evidenciaId: number,
  procesoId: number
): Promise<{ successful: FileModel[]; failed: Array<{ url: string; error: string }> }>

// Subir archivos y enlaces combinados
fileService.uploadFilesAndLinks(
  files: File[],
  urls: string[],
  evidenciaId: number,
  procesoId: number,
  onProgress?: (progress: number) => void
): Promise<{ 
  successful: FileModel[]; 
  failed: Array<{ item: File | string; error: string; type: 'file' | 'link' }> 
}>
```

### 3. Hook de Validación de URLs
**Archivo:** [src/Hooks/useUrlValidation.ts](../src/Hooks/useUrlValidation.ts)

**Funciones exportadas:**
- `validateUrl(url: string): UrlValidationResult` - Valida una URL individual
- `validateUrls(urls: string[]): { valid: string[]; invalid: Array<...> }` - Valida array de URLs
- `useUrlValidation()` - Hook React que retorna las funciones de validación

**Validaciones realizadas:**
- ✅ URL no vacía
- ✅ Longitud máxima 2048 caracteres
- ✅ Formato HTTP/HTTPS
- ✅ URL bien formada (constructor `new URL()`)

### 4. Componente de Input de Enlaces
**Archivo:** [src/Components/Ui/LinkInput.tsx](../src/Components/Ui/LinkInput.tsx)

**Props:**
```typescript
interface LinkInputProps {
  onLinksChange: (links: string[]) => void;
  maxLinks?: number;           // Default: 5
  disabled?: boolean;
  className?: string;
}
```

**Características:**
- ✅ Input de texto para agregar URLs
- ✅ Validación en tiempo real
- ✅ Soporte para pegar múltiples URLs (separadas por saltos de línea o comas)
- ✅ Lista visual de enlaces agregados
- ✅ Botón para eliminar enlaces
- ✅ Contador de enlaces (X de 5)
- ✅ Mensajes de error descriptivos
- ✅ Enlaces clicables con `target="_blank"` y `rel="noopener noreferrer"`

### 5. Componente Completo de Subida
**Archivo:** [src/Pages/EvidenceAssignment/Components/EvidenceUploader.tsx](../src/Pages/EvidenceAssignment/Components/EvidenceUploader.tsx)

**Props:**
```typescript
interface EvidenceUploaderProps {
  evidenciaId: number;
  procesoId: number;
  onUploadSuccess?: (files: FileModel[]) => void;
  onUploadError?: (error: string) => void;
}
```

**Características:**
- ✅ Tres modos de operación:
  - 📄 **Solo Archivos**: Drag & drop + selector de archivos
  - 🔗 **Solo Enlaces**: Input de URLs
  - 📎 **Ambos**: Archivos y enlaces en una sola subida
- ✅ Interfaz con pestañas para cambiar de modo
- ✅ Drag & drop para archivos
- ✅ Barra de progreso durante subida
- ✅ Lista de archivos/enlaces seleccionados
- ✅ Validación antes de enviar
- ✅ Manejo de errores parciales (algunos exitosos, otros fallidos)
- ✅ Feedback visual de estado (subiendo, completado, error)

---

## Ejemplo de Uso

### Uso Básico

```typescript
import EvidenceUploader from '@/Pages/EvidenceAssignment/Components/EvidenceUploader';

function MyComponent() {
  const handleSuccess = (files: FileModel[]) => {
    console.log('Evidencias subidas:', files);
    // Actualizar lista, mostrar notificación, etc.
  };

  const handleError = (error: string) => {
    console.error('Error:', error);
    // Mostrar mensaje de error al usuario
  };

  return (
    <EvidenceUploader
      evidenciaId={6}
      procesoId={1}
      onUploadSuccess={handleSuccess}
      onUploadError={handleError}
    />
  );
}
```

### Uso del Servicio Directamente

```typescript
import { fileService } from '@/Services/FileService';

// Solo enlaces
const result = await fileService.uploadMultipleLinks(
  ['https://drive.google.com/file/d/abc123', 'https://youtube.com/watch?v=xyz'],
  evidenciaId,
  procesoId
);

// Archivos y enlaces combinados
const result = await fileService.uploadFilesAndLinks(
  [file1, file2],
  ['https://ejemplo.com/doc'],
  evidenciaId,
  procesoId,
  (progress) => console.log(`Progreso: ${progress}%`)
);

// Manejar resultado
if (result.successful.length > 0) {
  console.log('Exitosos:', result.successful);
}
if (result.failed.length > 0) {
  console.log('Fallidos:', result.failed);
}
```

### Uso del Hook de Validación

```typescript
import { useUrlValidation } from '@/Hooks/useUrlValidation';

function MyForm() {
  const { validateUrl, validateUrls } = useUrlValidation();

  const handleSubmit = () => {
    const url = 'https://ejemplo.com';
    const result = validateUrl(url);
    
    if (result.isValid) {
      // Proceder con la subida
    } else {
      alert(result.error);
    }
  };
}
```

---

## Comportamiento Actual

### ✅ Lo que funciona (Frontend listo)

1. **Interfaz de usuario:**
   - Componente visual para agregar enlaces
   - Validación de URLs en cliente
   - Modo mixto (archivos + enlaces)
   - Feedback visual completo

2. **Validaciones:**
   - Formato HTTP/HTTPS
   - Longitud máxima 2048 caracteres
   - Límite de 5 enlaces por request
   - URL bien formada

3. **Integración:**
   - Servicio preparado para enviar datos al backend
   - Estructura FormData correcta (`archivos[]`, `enlaces[]`)
   - Manejo de respuestas parciales (207 Multi-Status)

### ❌ Lo que NO funciona (Pendiente backend)

1. **Backend no procesa enlaces:**
   - `StoreFileRequest.php` solo valida campo `archivos`
   - No existe validación para campo `enlaces`
   - Retornará error 422 si se envían enlaces

2. **Base de datos no soporta enlaces:**
   - Tabla `ARCHIVO` no tiene campo `url_externa`
   - No existe campo `tipo_evidencia`
   - Campo `path` no es nullable

3. **Controlador no maneja enlaces:**
   - `FileController::store()` solo itera sobre `archivos`
   - No existe lógica para guardar enlaces
   - `FileService` no tiene método `saveExternalLink()`

---

## Request que Envía el Frontend

### Solo Enlaces

```http
POST /api/archivos HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="enlaces[]"

https://drive.google.com/file/d/abc123
------WebKitFormBoundary
Content-Disposition: form-data; name="enlaces[]"

https://youtube.com/watch?v=xyz
------WebKitFormBoundary
Content-Disposition: form-data; name="evidencia_id"

6
------WebKitFormBoundary
Content-Disposition: form-data; name="proceso_id"

1
------WebKitFormBoundary--
```

### Archivos y Enlaces Combinados

```http
POST /api/archivos HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="archivos[]"; filename="documento.pdf"
Content-Type: application/pdf

[binary data]
------WebKitFormBoundary
Content-Disposition: form-data; name="enlaces[]"

https://ejemplo.com/recurso
------WebKitFormBoundary
Content-Disposition: form-data; name="evidencia_id"

6
------WebKitFormBoundary
Content-Disposition: form-data; name="proceso_id"

1
------WebKitFormBoundary--
```

---

## Respuesta Esperada del Backend

```json
{
  "success": true,
  "message": "Evidencias guardadas exitosamente",
  "data": [
    {
      "archivo_id": 123,
      "evidencia_id": 6,
      "usuario_id": 1,
      "proceso_id": 1,
      "fecha_subida": "2026-01-24T10:30:00.000000Z",
      "nombre_original": "documento.pdf",
      "path": "/storage/uuid-archivo.pdf",
      "url_externa": null,
      "tipo_evidencia": "archivo",
      "created_at": "2026-01-24T10:30:00.000000Z"
    },
    {
      "archivo_id": 124,
      "evidencia_id": 6,
      "usuario_id": 1,
      "proceso_id": 1,
      "fecha_subida": "2026-01-24T10:30:00.000000Z",
      "nombre_original": "ejemplo.com",
      "path": null,
      "url_externa": "https://ejemplo.com/recurso",
      "tipo_evidencia": "enlace",
      "created_at": "2026-01-24T10:30:00.000000Z"
    }
  ],
  "total": 2
}
```

---

## Próximos Pasos

1. **Equipo Backend debe implementar:**
   - Migración de base de datos (agregar `url_externa`, `tipo_evidencia`)
   - Actualizar `StoreFileRequest` con validación de enlaces
   - Actualizar `FileController::store()` para procesar enlaces
   - Crear método `FileService::saveExternalLink()`
   - Actualizar modelo `File`

2. **Documentación de referencia:**
   - Ver: [REQUISITOS_BACKEND_ENLACES_EVIDENCIAS.md](REQUISITOS_BACKEND_ENLACES_EVIDENCIAS.md)

3. **Pruebas de integración:**
   - Una vez implementado el backend, probar:
     - Subida solo enlaces
     - Subida mixta (archivos + enlaces)
     - Validaciones del backend
     - Visualización de enlaces en listado de evidencias

---

## Notas Técnicas

### Seguridad

- ✅ Validación de URLs en frontend (solo UX)
- ⚠️ Backend debe validar URLs (seguridad real)
- ✅ Enlaces se abren con `target="_blank" rel="noopener noreferrer"`
- ⚠️ Backend debe sanitizar URLs antes de guardar

### Limitaciones

- Máximo 5 enlaces por request (configurable)
- Máximo 2048 caracteres por URL
- Solo protocolos HTTP/HTTPS permitidos
- No se valida si la URL existe/funciona (validación asíncrona futura)

### Compatibilidad

- ✅ React 18+
- ✅ TypeScript 5+
- ✅ Tailwind CSS
- ✅ Axios
- ✅ FormData API (todos los navegadores modernos)

---

## Autor

Frontend Team - SAAC Project  
**Fecha implementación:** 24 de enero de 2026
