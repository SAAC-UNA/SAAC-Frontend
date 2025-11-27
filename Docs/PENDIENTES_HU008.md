# Pendientes HU008 - Subida de Evidencias al Sistema

**Fecha de creación:** 27 de noviembre de 2025  
**Rama:** `HU008_Subida_de_Evidencias_al_Sistema`  
**Estado:** En desarrollo

---

## 📋 Resumen de Implementación

### ✅ Completado

#### Backend:
- ✅ Subida múltiple de archivos (máximo 5 por request)
- ✅ Validación de formatos y tamaños (50MB por archivo)
- ✅ FileController con manejo de errores individuales
- ✅ StoreFileRequest actualizado para arrays de archivos
- ✅ FileService con transacciones para integridad
- ✅ Throttling (10 uploads por minuto)
- ✅ Response con status 207 para errores parciales

#### Frontend:
- ✅ Componente FileUploader (drag & drop, validación)
- ✅ Componente FileUploadProgress (barras de progreso)
- ✅ Componente FileList (visualización y gestión)
- ✅ Página EvidenceUploadPage (integración completa)
- ✅ FileService con métodos de API
- ✅ Types y validaciones en FileTypes.ts
- ✅ Navegación agregada al menú
- ✅ Ruta configurada en App.tsx
- ✅ Documentación de seguridad
- ✅ Estructura de carpetas organizada (Pages/Evidence/Components/)

---

## ⏳ Pendientes de Implementación

### 1. 🔴 Actualizar Frontend para Subida Múltiple Real

**Estado:** Pendiente  
**Prioridad:** Alta  
**Estimación:** 2-3 horas

#### Problema Actual:
El frontend está preparado para subida múltiple, pero el `FileService.uploadMultipleFiles()` **sube archivos secuencialmente uno por uno** al endpoint individual:

```typescript
// ACTUAL (fileService.ts - línea ~90)
for (let i = 0; i < files.length; i++) {
  const formData = new FormData();
  formData.append('archivo', file); // ❌ Usa endpoint antiguo
  // ...
}
```

#### Solución Requerida:
Modificar `uploadMultipleFiles()` para enviar todos los archivos en **una sola request** usando el nuevo endpoint:

```typescript
// NUEVO (sugerido)
public async uploadMultipleFiles(
  files: File[],
  evidenciaId: number,
  procesoId: number,
  onProgress?: (overallProgress: number) => void
): Promise<FileUploadResponse> {
  const formData = new FormData();
  
  // Agregar todos los archivos al mismo FormData
  files.forEach(file => {
    formData.append('archivos[]', file); // ✅ Máximo 5
  });
  
  formData.append('evidencia_id', evidenciaId.toString());
  formData.append('proceso_id', procesoId.toString());
  
  const response = await api.post<FileUploadResponse>(
    '/archivos',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      }
    }
  );
  
  return response.data;
}
```

#### Archivos a Modificar:
- `src/Services/FileService.ts` - Método `uploadMultipleFiles()`
- `src/Pages/Evidence/EvidenceUploadPage.tsx` - Lógica de `handleStartUpload()`
- `src/Pages/Evidence/Components/FileUploadProgress.tsx` - Mostrar progreso general en lugar de individual

#### Consideraciones:
- **Límite:** Máximo 5 archivos por solicitud (backend)
- **Progress:** Solo hay un progreso general, no individual por archivo
- **Errores:** Backend retorna `errores[]` array con archivos fallidos
- **Status:** 201 (éxito total) o 207 (éxito parcial con errores)

#### Response del Backend:
```typescript
interface MultipleUploadResponse {
  success: boolean;
  message: string;
  data: FileModel[];
  count?: number;
  errores?: Array<{
    indice: number;
    nombre: string;
    error: string;
  }>;
}
```

---

### 2. 🟡 Comentarios por Archivo (Backend)

**Estado:** No implementado  
**Prioridad:** Media  
**Responsable:** Equipo Backend

#### Requerimiento Original:
> "El sistema permite ingresar un comentario para cada evidencia o para un grupo de ellas"

#### Faltante en Backend:
- ❌ Campo `archivo_id` en tabla `COMENTARIO`
- ❌ Migración para agregar foreign key
- ❌ Relación `comments()` en modelo `File`
- ❌ Relación `file()` en modelo `Comment`
- ❌ Parámetro `comentario` en `StoreFileRequest`
- ❌ Lógica en `FileController` para crear comentarios

#### Propuesta:
Ver documento `REQUERIMIENTOS_SUBIDA_MULTIPLE_ARCHIVOS.md` sección 2 para detalles completos.

#### Impacto en Frontend:
Una vez implementado en backend:
1. Agregar campo de comentario en `FileUploader.tsx`
2. Enviar comentario en FormData
3. Mostrar comentarios en `FileList.tsx`

---

### 3. 🟢 Soporte para URLs como Evidencia (Backend)

**Estado:** No implementado  
**Prioridad:** Baja  
**Responsable:** Equipo Backend

#### Requerimiento Original:
> "Quiero poder subir uno o varios archivos de distintos formatos (PDF, Word, Excel, imágenes, videos, **enlaces**, texto)"

#### Faltante en Backend:
- ❌ Campo `url_externa` en tabla `ARCHIVO`
- ❌ Campo `tipo` enum('archivo', 'url') en tabla `ARCHIVO`
- ❌ Migración para agregar campos
- ❌ `StoreUrlRequest` para validación
- ❌ Método `storeUrl()` en `FileService`
- ❌ Endpoint `POST /api/archivos/url`
- ❌ Path nullable en tabla `ARCHIVO`

#### Propuesta:
Ver documento `REQUERIMIENTOS_SUBIDA_MULTIPLE_ARCHIVOS.md` sección 3 para detalles completos.

#### Impacto en Frontend:
Una vez implementado en backend:
1. Agregar pestaña "URL" en `FileUploader.tsx`
2. Campo de texto para ingresar URL
3. Validación de formato URL
4. Método `uploadUrl()` en `FileService.ts`
5. Icono diferente en `FileList.tsx` para URLs
6. Botón "Abrir enlace" en lugar de descargar

---

### 4. 🟣 Mejoras de UX Opcionales

**Estado:** Pendiente  
**Prioridad:** Baja  
**Estimación:** 1-2 horas

#### 4.1. Límite Visual de 5 Archivos
Actualmente el frontend permite seleccionar más de 5 archivos, pero el backend rechazará el request.

**Solución:**
```typescript
// FileUploader.tsx
const MAX_FILES = 5;

const handleFilesSelected = (newFiles: File[]) => {
  if (files.length + newFiles.length > MAX_FILES) {
    toast.warning(
      'Límite de archivos',
      `Solo puedes subir ${MAX_FILES} archivos a la vez. Por favor, elimina algunos archivos.`
    );
    return;
  }
  // ...
};
```

#### 4.2. Vista Previa de Imágenes
Mostrar thumbnails de imágenes antes de subir.

**Componente sugerido:**
```typescript
// ImagePreview.tsx
const ImagePreview = ({ file }: { file: File }) => {
  const [preview, setPreview] = useState<string>('');
  
  useEffect(() => {
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, [file]);
  
  return <img src={preview} alt={file.name} className="w-20 h-20 object-cover" />;
};
```

#### 4.3. Reintentar Subida Fallida
Botón "Reintentar" para archivos que fallaron.

**Lógica:**
```typescript
const handleRetry = (fileIndex: number) => {
  const failedFile = uploadProgress[fileIndex].file;
  // Remover de la lista de progreso
  setUploadProgress(prev => prev.filter((_, i) => i !== fileIndex));
  // Agregar nuevamente a selectedFiles
  setSelectedFiles(prev => [...prev, failedFile]);
};
```

#### 4.4. Indicador de Espacio Disponible
Mostrar cuánto espacio queda en el servidor (si backend provee esta info).

---

## 📊 Métricas de Progreso

### Completitud General: 85%

| Área | Progreso | Estado |
|------|----------|--------|
| Backend - Subida múltiple | 100% | ✅ Completo |
| Backend - Comentarios | 0% | ⏳ Pendiente |
| Backend - URLs | 0% | ⏳ Pendiente |
| Frontend - UI/Componentes | 100% | ✅ Completo |
| Frontend - Integración Backend | 70% | ⏳ En progreso |
| Pruebas E2E | 0% | ⏳ Pendiente |
| Documentación | 90% | ✅ Casi completo |

### Criterios de Aceptación HU008

#### ✅ Cumplidos:
- ✅ El sistema permite seleccionar varios archivos para subir simultáneamente
- ✅ Cada archivo se valida (formato, tamaño) antes de subirse
- ✅ El sistema muestra el progreso de subida
- ✅ Se confirma la subida exitosa de cada archivo
- ✅ Los archivos se muestran agrupados dentro del mismo criterio/evidencia

#### ⏳ Parcialmente cumplidos:
- ⏳ El sistema permite ingresar un comentario (backend pendiente)
- ⏳ Soporte para enlaces web (backend pendiente)

#### ❌ No implementados:
- ❌ Pruebas con SINAES (acceso público con token)
- ❌ Descarga de archivos subidos (endpoint `/download` pendiente)
- ❌ Visualización inline de archivos (endpoint `/view` pendiente)

---

## 🔗 Documentos Relacionados

- `REQUERIMIENTOS_SUBIDA_MULTIPLE_ARCHIVOS.md` - Requerimientos enviados a backend
- `IMPLEMENTACION_SUBIDA_EVIDENCIAS.md` - Guía de implementación frontend
- `SEGURIDAD_VALIDACION_ARCHIVOS.md` - Análisis de seguridad
- `ESTRUCTURA_CARPETAS_EVIDENCE.md` - Organización de archivos

---

## 📅 Timeline Sugerido

| Fecha | Tarea | Responsable |
|-------|-------|-------------|
| 27 Nov | ✅ Revisar cambios backend | Frontend |
| 28 Nov | Actualizar FileService para subida múltiple real | Frontend |
| 29 Nov | Pruebas de integración con backend | Frontend |
| 2 Dic | Solicitar implementación de comentarios | Backend |
| 5 Dic | Integrar comentarios una vez disponible | Frontend |
| 9 Dic | Solicitar soporte para URLs (opcional) | Backend |
| 12 Dic | Pruebas E2E completas | QA |

---

## 🐛 Issues Conocidos

### 1. Navegación directa sin parámetros
**Problema:** Al hacer click en "Subir Evidencias" del menú, la página muestra mensaje informativo porque no hay `evidenciaId` ni `procesoId`.

**Solución temporal:** La página muestra instrucciones sobre cómo usarla.

**Solución ideal:** Crear página intermedia que liste evidencias asignadas al usuario y permita seleccionar una para subir archivos.

### 2. Sin feedback de límite de archivos
**Problema:** Usuario puede seleccionar más de 5 archivos, pero backend rechaza.

**Solución:** Ver sección 4.1 de mejoras UX.

### 3. Progreso individual no disponible
**Problema:** Con subida múltiple real, solo hay progreso general (no por archivo).

**Solución:** Actualizar `FileUploadProgress.tsx` para mostrar un solo progress bar general.

---

## ✅ Checklist de Implementación

### Próximas Tareas (Prioridad Alta):

- [ ] Modificar `FileService.uploadMultipleFiles()` para usar endpoint múltiple
- [ ] Actualizar `EvidenceUploadPage.handleStartUpload()` para nueva respuesta
- [ ] Modificar `FileUploadProgress` para progreso general
- [ ] Manejar respuesta con `errores[]` array del backend
- [ ] Probar con 1-5 archivos
- [ ] Probar límite de 50MB por archivo
- [ ] Probar throttling (10 requests por minuto)
- [ ] Documentar cambios en IMPLEMENTACION_SUBIDA_EVIDENCIAS.md

### Tareas Futuras (Cuando Backend implemente):

- [ ] Agregar campo de comentario en formulario
- [ ] Enviar comentario con archivos
- [ ] Mostrar comentarios en lista de archivos
- [ ] Agregar pestaña "Agregar URL" en FileUploader
- [ ] Validar formato de URL
- [ ] Crear método `uploadUrl()` en FileService
- [ ] Diferenciar visualmente archivos vs URLs en FileList

---

**Última actualización:** 27 de noviembre de 2025  
**Actualizado por:** Equipo Frontend
