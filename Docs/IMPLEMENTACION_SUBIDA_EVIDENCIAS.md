# Implementación Frontend - HU008: Subida de Evidencias al Sistema

**Fecha:** 25 de noviembre de 2025  
**Rama:** `HU008_Subida_de_Evidencias_al_Sistema`  
**Estado:** ✅ Implementación completada con backend actual

---

## 📋 Resumen

Se ha implementado el sistema completo de subida de evidencias en el frontend, compatible con el backend actual de Laravel. La implementación incluye:

- ✅ Componente de drag-and-drop para selección de archivos
- ✅ Validación de formatos y tamaños en cliente
- ✅ Subida múltiple secuencial de archivos
- ✅ Visualización de progreso en tiempo real
- ✅ Lista de archivos subidos con gestión completa
- ✅ Mensajes de error y éxito con toasts
- ✅ Integración con FilePolicy del backend

---

## 📁 Estructura de Archivos

```
src/
├── Types/
│   └── FileTypes.ts                    # Interfaces y tipos
├── Services/
│   └── FileService.ts                  # API service
└── Pages/
    └── Evidence/                       # Feature: Subida de evidencias
        ├── Components/                 # Componentes específicos
        │   ├── FileUploader.tsx       # Drag-and-drop
        │   ├── FileUploadProgress.tsx # Progress bar
        │   ├── FileList.tsx           # Lista de archivos
        │   └── index.ts               # Exports
        ├── EvidenceUploadPage.tsx     # Página principal
        ├── EvidenceUploadDemo.tsx     # Demo/ejemplos
        └── index.ts                    # Exports
```

### Tipos (Types)
- **`src/Types/FileTypes.ts`**
  - Interfaces para `FileModel`, `FileUploadResponse`, etc.
  - Tipos para validación y categorización de archivos
  - Funciones auxiliares: `validateFile()`, `formatFileSize()`, `getFileCategory()`
  - Constantes: `ALLOWED_FILE_EXTENSIONS`, `MAX_FILE_SIZE`, `ALLOWED_MIME_TYPES`

### Servicios (Services)
- **`src/Services/FileService.ts`**
  - `uploadFile()` - Subida individual con progreso
  - `uploadMultipleFiles()` - Subida múltiple secuencial
  - `listFiles()` - Obtener archivos por evidencia/proceso
  - `deleteFile()` - Eliminar archivo
  - `makePublic()` / `revokePublic()` - Gestión de acceso público
  - Integración completa con axios y manejo de errores

### Componentes (Pages/Evidence/Components)
- **`FileUploader.tsx`**
  - Zona de drag-and-drop estilizada
  - Validación en tiempo real de formatos y tamaños
  - Preview de archivos seleccionados
  - Botones para eliminar archivos individuales
  - Límite configurable de archivos (default: 10)

- **`FileUploadProgress.tsx`**
  - Barra de progreso general
  - Progreso individual por archivo
  - Estados: pending, uploading, success, error
  - Iconos y colores diferenciados por estado
  - Opciones de reintentar y cancelar

- **`FileList.tsx`**
  - Lista responsive de archivos subidos
  - Iconos diferenciados por tipo de archivo (documento, imagen, video, etc.)
  - Metadatos: fecha, usuario, tamaño
  - Acciones: eliminar, hacer público, revocar público
  - Modal de confirmación para eliminación
  - Estados de carga

### Páginas (Pages/Evidence)
- **`EvidenceUploadPage.tsx`**
  - Página principal con integración completa
  - Gestión de estados de subida y archivos
  - Integración con toasts para notificaciones
  - Recarga automática después de operaciones
  - Manejo de errores robusto

- **`EvidenceUploadDemo.tsx`**
  - Ejemplo de uso completo
  - Ejemplos de integración con React Router
  - Uso independiente de componentes

---

## 🔧 Características Implementadas

### ✅ Validaciones en Cliente
- **Formato de archivo:** PDF, Word, Excel, PowerPoint, imágenes, videos, archivos comprimidos
- **Tamaño máximo:** 50MB por archivo
- **Cantidad máxima:** 10 archivos simultáneos (configurable)
- **Mensajes de error claros** en español

### ✅ Experiencia de Usuario
- **Drag-and-drop** intuitivo con feedback visual
- **Click para seleccionar** archivos
- **Preview inmediato** de archivos seleccionados
- **Progress bars** individuales y general
- **Mensajes dinámicos** de éxito/error con toasts
- **Confirmación antes de eliminar** archivos

### ✅ Gestión de Archivos
- **Listado con filtros** por evidencia/proceso
- **Metadatos completos:** nombre, fecha, usuario, tamaño
- **Acciones disponibles:**
  - Eliminar archivo
  - Hacer público (generar enlace)
  - Revocar acceso público
  - Actualizar lista

### ✅ Seguridad
- **Validación en cliente y servidor**
- **Integración con FilePolicy** del backend
- **Manejo de permisos** basado en roles
- **Tokens de autenticación** en todas las peticiones

---

## 🚀 Cómo Usar

### Opción 1: Página Completa (Recomendado)

```tsx
// Importar desde la carpeta Evidence
import { EvidenceUploadPage } from '@/Pages/Evidence';

function App() {
  return (
    <EvidenceUploadPage
      evidenciaId={11}
      procesoId={1}
      evidenciaNombre="Plan Estratégico Institucional"
    />
  );
}
```

### Opción 2: Componentes Independientes

```tsx
// Los componentes están dentro de Pages/Evidence/Components
import { FileUploader, FileList } from '@/Pages/Evidence';
import { fileService } from '@/Services/FileService';

function MiComponente() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileModel[]>([]);

  const handleUpload = async () => {
    const result = await fileService.uploadMultipleFiles(
      files,
      evidenciaId,
      procesoId
    );
    // Manejar resultado
  };

  return (
    <>
      <FileUploader onFilesSelected={setFiles} />
      <button onClick={handleUpload}>Subir</button>
      <FileList files={uploadedFiles} />
    </>
  );
}
```

### Opción 3: Integración con React Router

```tsx
import { useParams } from 'react-router-dom';
import { EvidenceUploadPage } from '@/Pages/Evidence';

export const EvidenceUploadRoute = () => {
  const { evidenciaId, procesoId } = useParams();
  
  return (
    <EvidenceUploadPage
      evidenciaId={parseInt(evidenciaId!)}
      procesoId={parseInt(procesoId!)}
    />
  );
};

// En tu archivo de rutas:
<Route 
  path="/evidencias/:evidenciaId/subir" 
  element={<EvidenceUploadRoute />} 
/>
```

---

## 🎨 Estilos y Diseño

### Componentes Responsivos
- Mobile-first design
- Breakpoints para tablet y desktop
- Áreas de drag-and-drop adaptativas

### Colores y Estados
- **Pending:** Gris (bg-gray-100)
- **Uploading:** Azul (bg-blue-50, border-blue-200)
- **Success:** Verde (bg-green-50, border-green-200)
- **Error:** Rojo (bg-red-50, border-red-200)

### Iconos
- SVG inline para mejor rendimiento
- Iconos diferenciados por tipo de archivo
- Animaciones de carga (spin)

---

## 📊 Flujo de Subida

```
1. Usuario selecciona archivos (drag-and-drop o click)
   ↓
2. Validación en cliente (formato, tamaño)
   ↓
3. Preview de archivos válidos
   ↓
4. Usuario confirma subida
   ↓
5. Subida secuencial con progreso
   ↓
6. Actualización de lista de archivos
   ↓
7. Notificación de resultado (toast)
```

---

## ⚠️ Limitaciones Actuales (Backend)

### ❌ Subida Múltiple Simultánea
El backend actual solo acepta **un archivo por request**. La implementación frontend:
- Sube archivos **secuencialmente** (uno tras otro)
- Muestra progreso individual y general
- Maneja éxitos y fallos independientemente

**Solución futura:** Implementar endpoint `POST /api/archivos/bulk-upload` en backend.

### ❌ Comentarios por Archivo
No hay relación entre `ARCHIVO` y `COMENTARIO` en la base de datos.

**Implementación actual:** Los comentarios no están incluidos en esta versión.  
**Solución futura:** Agregar campo `comentario` opcional en el request de subida.

### ❌ Enlaces Web como Evidencia
No hay soporte para URLs externas en la tabla `ARCHIVO`.

**Implementación actual:** Solo archivos físicos.  
**Solución futura:** Agregar endpoint `POST /api/archivos/url` y campo `url_externa`.

---

## ✅ Criterios de Aceptación Cumplidos

| Criterio | Estado | Notas |
|----------|--------|-------|
| Subida de archivo exitosa | ✅ | Implementado con validación completa |
| Subida múltiple de archivos | ⚠️ | Secuencial, no simultánea |
| Comentarios asociados a evidencia | ❌ | Requiere cambios en backend |
| Validación de formatos no permitidos | ✅ | Cliente y servidor |
| Validación de tamaño máximo | ✅ | 50MB, cliente y servidor |
| Confirmación individual por archivo | ✅ | Con progreso y estado |
| Visualización agrupada | ✅ | Por evidencia |
| Manejo de fallos en conexión | ✅ | Retry y mensajes claros |
| Seguridad de la carga | ✅ | FilePolicy + tokens |
| Registro en historial | ✅ | Backend implementado |

---

## 🧪 Pruebas Sugeridas

### Pruebas Manuales
1. **Drag-and-drop:** Arrastrar archivos válidos e inválidos
2. **Formato:** Intentar subir archivos no permitidos
3. **Tamaño:** Intentar subir archivo > 50MB
4. **Múltiples archivos:** Subir 5-10 archivos simultáneamente
5. **Cancelación:** Limpiar archivos seleccionados
6. **Eliminación:** Eliminar archivos con confirmación
7. **Permisos:** Probar hacer público (requiere rol apropiado)
8. **Conexión:** Simular pérdida de conexión durante subida

### Pruebas Automatizadas (Futuras)
```typescript
// FileUploader.test.tsx
describe('FileUploader', () => {
  it('debe validar formato de archivo');
  it('debe validar tamaño de archivo');
  it('debe permitir eliminar archivos seleccionados');
  it('debe mostrar error para archivos inválidos');
});

// FileService.test.ts
describe('FileService', () => {
  it('debe subir archivo exitosamente');
  it('debe manejar errores de red');
  it('debe subir múltiples archivos secuencialmente');
});
```

---

## 📝 Próximos Pasos

### Backend (Requerido)
1. ✅ Implementar `POST /api/archivos/bulk-upload` para subida múltiple
2. ✅ Agregar campo `archivo_id` a tabla `COMENTARIO`
3. ✅ Agregar soporte para URLs externas en `ARCHIVO`

### Frontend (Opcional)
1. ⏳ Agregar campo de comentario al formulario de subida
2. ⏳ Implementar preview de imágenes antes de subir
3. ⏳ Agregar campo para enlaces web
4. ⏳ Implementar descarga de archivos
5. ⏳ Agregar filtros y búsqueda en lista de archivos

---

## 🔗 Referencias

- **Backend API:** `SAAC-Backend/docs/API_ARCHIVOS.md`
- **Requerimientos Backend:** `SAAC-Backend/docs/REQUERIMIENTOS_SUBIDA_MULTIPLE_ARCHIVOS.md`
- **Historia de Usuario:** HU008 - Subida de Evidencias al Sistema

---

## 👥 Contacto

Para dudas o sugerencias sobre la implementación frontend, contactar al equipo de desarrollo frontend.

**Estado final:** ✅ **Listo para integración y pruebas**
