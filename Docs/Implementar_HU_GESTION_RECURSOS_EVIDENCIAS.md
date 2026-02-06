# HU-XXX: Gestión de Recursos de Evidencias

**Fecha de creación:** 6 de febrero de 2026  
**Estado:** Propuesta - Pendiente de aprobación  
**Prioridad:** Alta  
**Equipo:** Desarrollo SAAC  

---

## 📋 Resumen Ejecutivo

Esta Historia de Usuario propone implementar un sistema completo de **gestión de recursos** (archivos y enlaces) asociados a evidencias, permitiendo a los usuarios ver, subir, descargar, editar y eliminar recursos de manera controlada y auditable.

**Diferencia con HU-012:** Mientras HU-012 se enfoca en **búsqueda y visualización** de evidencias, esta nueva HU se centra en la **gestión operativa de recursos** dentro de cada evidencia.

---

## 🎯 Objetivo

Permitir que los responsables de evidencias puedan gestionar los recursos (archivos y enlaces) asociados a cada evidencia de manera individual, manteniendo trazabilidad de quién subió qué recurso, con capacidades de CRUD completas según permisos del usuario.

---

## 👥 Roles Involucrados

| Rol | Permisos |
|-----|----------|
| **Superusuario** | Gestión completa de todos los recursos de todas las evidencias |
| **Administrador** | Gestión completa de recursos de evidencias de sus carreras |
| **Coordinador** | Gestión completa de recursos de evidencias de sus carreras |
| **Profesor** | Puede subir/editar/eliminar solo sus propios recursos en evidencias asignadas |
| **Auditor** | Solo lectura y descarga |

---

## 📝 Historias de Usuario

### Historia Principal

> **Como** responsable de una evidencia  
> **Quiero** gestionar los archivos y enlaces asociados a la evidencia  
> **Para** mantener organizados y actualizados los recursos de acreditación

### Historias Derivadas

1. **Como** usuario autorizado  
   **Quiero** ver qué recursos subió cada responsable  
   **Para** identificar las contribuciones individuales

2. **Como** responsable  
   **Quiero** subir archivos relacionados a la evidencia  
   **Para** contribuir con documentación de respaldo

3. **Como** responsable  
   **Quiero** editar la información de mis recursos  
   **Para** corregir nombres o descripciones

4. **Como** responsable  
   **Quiero** eliminar recursos que subí por error  
   **Para** mantener la evidencia limpia y organizada

5. **Como** administrador  
   **Quiero** ver el historial de cambios de recursos  
   **Para** auditar las modificaciones realizadas

---

## ✅ Criterios de Aceptación

### CA-1: Visualización de Recursos por Responsable

- [ ] La lista de recursos se agrupa por responsable que los subió
- [ ] Se muestra el nombre, tipo, tamaño y fecha de cada recurso
- [ ] Se distingue visualmente entre archivos y enlaces
- [ ] Se muestra un contador de recursos por responsable
- [ ] Los recursos sin responsable asignado se agrupan en "Sin asignar"

### CA-2: Descarga de Archivos

- [ ] Cada archivo tiene un botón de descarga visible
- [ ] La descarga inicia sin recargar la página
- [ ] Se valida que el usuario tenga permisos de descarga
- [ ] Se muestra un indicador de progreso durante la descarga
- [ ] Se registra en logs quién descargó qué archivo y cuándo

### CA-3: Subida de Archivos

- [ ] Interfaz tipo drag & drop para subir archivos
- [ ] También permite selección manual de archivos
- [ ] Validación de tipos de archivo permitidos (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ZIP)
- [ ] Validación de tamaño máximo (10 MB por archivo)
- [ ] Múltiples archivos pueden subirse simultáneamente
- [ ] Se asocia automáticamente al usuario que sube el archivo
- [ ] Se muestra progreso de subida con barra visual
- [ ] Mensaje de confirmación al completar la subida

### CA-4: Gestión de Enlaces

- [ ] Formulario para agregar enlaces externos
- [ ] Validación de formato URL válido
- [ ] Campos: Título del enlace, URL, Descripción (opcional)
- [ ] Preview del enlace antes de guardarlo
- [ ] Edición de enlaces propios
- [ ] Eliminación de enlaces propios

### CA-5: Edición de Recursos Propios

- [ ] Los usuarios pueden editar solo recursos que ellos subieron
- [ ] Administradores/Coordinadores pueden editar todos los recursos
- [ ] Edición incluye: nombre del archivo, descripción
- [ ] No se puede cambiar el archivo en sí, solo metadata
- [ ] Se registra la fecha de última modificación

### CA-6: Eliminación de Recursos

- [ ] Los usuarios pueden eliminar solo recursos que ellos subieron
- [ ] Administradores/Superusuarios pueden eliminar cualquier recurso
- [ ] Confirmación antes de eliminar (modal de confirmación)
- [ ] Mensaje descriptivo: "¿Está seguro de eliminar [nombre]?"
- [ ] El archivo se elimina físicamente del servidor
- [ ] Se registra en logs la eliminación (soft delete opcional)

### CA-7: Permisos Granulares

- [ ] Profesores solo ven recursos de evidencias donde son responsables
- [ ] Profesores solo pueden editar/eliminar sus propios recursos
- [ ] Coordinadores gestionan recursos de evidencias de sus carreras
- [ ] Superusuarios tienen acceso total
- [ ] Auditores solo lectura (ver y descargar)

### CA-8: Historial de Cambios (Auditoría)

- [ ] Registro de todas las acciones: subida, modificación, eliminación
- [ ] Se almacena: usuario, fecha/hora, acción, recurso afectado
- [ ] Interfaz para visualizar historial (solo admin/superusuario)
- [ ] Exportación de historial a Excel/PDF

---

## 🎨 Diseño de Interfaz

### Componente Principal: EvidenceResourcesManager

```
┌─────────────────────────────────────────────────────────────┐
│ Gestión de Recursos - Evidencia: CRI-1.1.1                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [📁 Subir Archivos]  [🔗 Agregar Enlace]  [📊 Historial]  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 👤 Pablo Castillo Quesada (3 recursos)                     │
│   ├─ 📄 Plan_Estrategico_2024.pdf (2.5 MB)                │
│   │    [⬇️ Descargar] [✏️ Editar] [🗑️ Eliminar]           │
│   │    Subido: 15/01/2026 10:30                            │
│   │                                                         │
│   ├─ 📊 Analisis_Resultados.xlsx (1.8 MB)                 │
│   │    [⬇️ Descargar] [✏️ Editar] [🗑️ Eliminar]           │
│   │    Subido: 20/01/2026 14:15                            │
│   │                                                         │
│   └─ 🔗 Portal de Acreditación SINAES                      │
│        [🌐 Abrir] [✏️ Editar] [🗑️ Eliminar]                │
│        https://sinaes.ac.cr/portal                          │
│        Subido: 22/01/2026 09:00                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 👤 Ian Enmanuel Villegas Jimenez (1 recurso)               │
│   └─ 📄 Informe_Seguimiento.pdf (3.2 MB)                  │
│        [⬇️ Descargar] [✏️ Editar] [🗑️ Eliminar]           │
│        Subido: 25/01/2026 16:45                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 📊 Resumen: 4 archivos (7.5 MB) • 1 enlace                 │
└─────────────────────────────────────────────────────────────┘
```

### Modal de Subida de Archivos

```
┌─────────────────────────────────────────┐
│ Subir Archivos a Evidencia              │
├─────────────────────────────────────────┤
│                                         │
│  ╔═════════════════════════════════╗   │
│  ║  📁 Arrastra archivos aquí       ║   │
│  ║     o haz clic para seleccionar  ║   │
│  ╚═════════════════════════════════╝   │
│                                         │
│  Formatos permitidos:                   │
│  PDF, DOC, DOCX, XLS, XLSX, JPG, PNG   │
│  Tamaño máximo: 10 MB por archivo      │
│                                         │
│  Archivos seleccionados:                │
│  ☑ documento.pdf (2.5 MB) [✓ Válido]   │
│  ☑ imagen.jpg (800 KB)    [✓ Válido]   │
│  ☑ grande.zip (15 MB)     [❌ Muy grande]│
│                                         │
│  [Cancelar]        [Subir Archivos]    │
└─────────────────────────────────────────┘
```

---

## 🔧 Arquitectura Técnica

### Backend - Nuevas Tablas

#### Tabla: `archivo_evidencia`
```sql
CREATE TABLE archivo_evidencia (
    archivo_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    evidencia_id BIGINT UNSIGNED NOT NULL,
    usuario_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que subió el archivo',
    nombre_original VARCHAR(255) NOT NULL,
    nombre_almacenado VARCHAR(255) NOT NULL COMMENT 'UUID + extensión',
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    extension VARCHAR(10) NOT NULL,
    tamanio_bytes BIGINT UNSIGNED NOT NULL,
    descripcion TEXT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete',
    
    FOREIGN KEY (evidencia_id) REFERENCES EVIDENCIA(evidencia_id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(usuario_id) ON DELETE RESTRICT,
    
    INDEX idx_evidencia (evidencia_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_activo (activo)
);
```

#### Tabla: `enlace_evidencia`
```sql
CREATE TABLE enlace_evidencia (
    enlace_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    evidencia_id BIGINT UNSIGNED NOT NULL,
    usuario_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que agregó el enlace',
    titulo VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    descripcion TEXT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete',
    
    FOREIGN KEY (evidencia_id) REFERENCES EVIDENCIA(evidencia_id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(usuario_id) ON DELETE RESTRICT,
    
    INDEX idx_evidencia (evidencia_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_activo (activo)
);
```

#### Tabla: `historial_recursos_evidencia`
```sql
CREATE TABLE historial_recursos_evidencia (
    historial_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    evidencia_id BIGINT UNSIGNED NOT NULL,
    recurso_tipo ENUM('archivo', 'enlace') NOT NULL,
    recurso_id BIGINT UNSIGNED NOT NULL COMMENT 'ID del archivo o enlace',
    usuario_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que realizó la acción',
    accion ENUM('crear', 'editar', 'eliminar', 'descargar') NOT NULL,
    datos_anteriores JSON NULL COMMENT 'Estado antes del cambio',
    datos_nuevos JSON NULL COMMENT 'Estado después del cambio',
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (evidencia_id) REFERENCES EVIDENCIA(evidencia_id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(usuario_id) ON DELETE RESTRICT,
    
    INDEX idx_evidencia (evidencia_id),
    INDEX idx_recurso (recurso_tipo, recurso_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_accion (accion),
    INDEX idx_fecha (created_at)
);
```

### Backend - Endpoints API

#### Gestión de Archivos

```php
// Listar archivos de una evidencia (agrupados por responsable)
GET /api/v1/estructura/evidencias/{evidencia_id}/archivos
Response: {
    "success": true,
    "data": {
        "por_responsable": [
            {
                "usuario_id": 1,
                "usuario_nombre": "Pablo Castillo",
                "archivos": [
                    {
                        "archivo_id": 1,
                        "nombre": "Plan_Estrategico.pdf",
                        "tamaño": 2621440,
                        "tipo": "application/pdf",
                        "created_at": "2026-01-15T10:30:00Z",
                        "puede_editar": true,
                        "puede_eliminar": true
                    }
                ]
            }
        ],
        "totales": {
            "cantidad_archivos": 4,
            "tamaño_total": 7864320
        }
    }
}

// Subir archivo(s)
POST /api/v1/estructura/evidencias/{evidencia_id}/archivos
Content-Type: multipart/form-data
Body: {
    archivo: [File],
    descripcion: "Opcional"
}
Response: {
    "success": true,
    "message": "Archivo subido exitosamente",
    "data": {
        "archivo_id": 5,
        "nombre": "documento.pdf",
        "tamaño": 1048576,
        "url_descarga": "/api/v1/archivos/5/download"
    }
}

// Actualizar metadata de archivo
PUT /api/v1/archivos/{archivo_id}
Body: {
    "nombre": "Nuevo_Nombre.pdf",
    "descripcion": "Descripción actualizada"
}

// Eliminar archivo
DELETE /api/v1/archivos/{archivo_id}
Response: {
    "success": true,
    "message": "Archivo eliminado exitosamente"
}

// Descargar archivo
GET /api/v1/archivos/{archivo_id}/download
Response: Binary file stream
```

#### Gestión de Enlaces

```php
// Listar enlaces de una evidencia
GET /api/v1/estructura/evidencias/{evidencia_id}/enlaces

// Agregar enlace
POST /api/v1/estructura/evidencias/{evidencia_id}/enlaces
Body: {
    "titulo": "Portal SINAES",
    "url": "https://sinaes.ac.cr",
    "descripcion": "Portal oficial"
}

// Actualizar enlace
PUT /api/v1/enlaces/{enlace_id}
Body: {
    "titulo": "Nuevo título",
    "url": "https://nueva-url.com",
    "descripcion": "Nueva descripción"
}

// Eliminar enlace
DELETE /api/v1/enlaces/{enlace_id}
```

#### Historial de Cambios

```php
// Ver historial de recursos
GET /api/v1/estructura/evidencias/{evidencia_id}/recursos/historial
Query params: ?desde=2026-01-01&hasta=2026-01-31&accion=eliminar

// Exportar historial
GET /api/v1/estructura/evidencias/{evidencia_id}/recursos/historial/export
Query params: ?formato=excel|pdf
```

### Backend - Políticas de Autorización

```php
// app/Policies/ArchivoEvidenciaPolicy.php
class ArchivoEvidenciaPolicy
{
    public function view(User $user, Archivo $archivo): bool
    {
        // Superusuarios y Auditores pueden ver todo
        if ($user->hasRole(['Superusuario', 'Auditor'])) {
            return true;
        }
        
        // Coordinadores/Admins pueden ver recursos de sus carreras
        if ($user->hasRole(['Administrador', 'Coordinador'])) {
            return $this->evidenciaService->perteneceACarrerasUsuario(
                $archivo->evidencia_id, 
                $user
            );
        }
        
        // Profesores solo ven recursos de evidencias donde son responsables
        return $this->evidenciaService->esResponsable($user, $archivo->evidencia_id);
    }
    
    public function update(User $user, Archivo $archivo): bool
    {
        // Superusuarios pueden editar todo
        if ($user->hasRole('Superusuario')) {
            return true;
        }
        
        // Admins/Coordinadores pueden editar recursos de sus carreras
        if ($user->hasRole(['Administrador', 'Coordinador'])) {
            return $this->evidenciaService->perteneceACarrerasUsuario(
                $archivo->evidencia_id, 
                $user
            );
        }
        
        // Usuarios solo pueden editar sus propios archivos
        return $archivo->usuario_id === $user->usuario_id;
    }
    
    public function delete(User $user, Archivo $archivo): bool
    {
        return $this->update($user, $archivo); // Mismos permisos
    }
}
```

### Frontend - Nuevos Componentes

```typescript
// src/Pages/EvidenceResources/
├── EvidenceResourcesPage.tsx                 // Página principal
├── Components/
│   ├── ResourcesManager.tsx                  // Gestor principal
│   ├── FileUploadZone.tsx                    // Drag & drop upload
│   ├── ResourcesByResponsible.tsx            // Lista agrupada
│   ├── FileResourceCard.tsx                  // Card de archivo
│   ├── LinkResourceCard.tsx                  // Card de enlace
│   ├── AddLinkModal.tsx                      // Modal agregar enlace
│   ├── EditResourceModal.tsx                 // Modal editar recurso
│   ├── ResourceHistoryModal.tsx              // Modal historial
│   └── index.ts
├── Hooks/
│   ├── useFileUpload.ts                      // Upload con progreso
│   ├── useResourceManagement.ts              // CRUD de recursos
│   └── useResourceHistory.ts                 // Historial
└── Types/
    └── EvidenceResourceTypes.ts              // Tipos TypeScript
```

### Frontend - Servicios

```typescript
// src/Services/EvidenceResourceService.ts
export const evidenceResourceService = {
  // Listar archivos
  async getFiles(evidenciaId: number): Promise<ResourcesByResponsible>,
  
  // Subir archivos
  async uploadFiles(
    evidenciaId: number, 
    files: File[], 
    onProgress?: (progress: number) => void
  ): Promise<UploadResult>,
  
  // Descargar archivo
  async downloadFile(archivoId: number): Promise<void>,
  
  // Actualizar archivo
  async updateFile(archivoId: number, data: UpdateFileData): Promise<void>,
  
  // Eliminar archivo
  async deleteFile(archivoId: number): Promise<void>,
  
  // Enlaces
  async getLinks(evidenciaId: number): Promise<Link[]>,
  async createLink(evidenciaId: number, data: CreateLinkData): Promise<Link>,
  async updateLink(enlaceId: number, data: UpdateLinkData): Promise<Link>,
  async deleteLink(enlaceId: number): Promise<void>,
  
  // Historial
  async getHistory(evidenciaId: number, filters?: HistoryFilters): Promise<HistoryEntry[]>,
  async exportHistory(evidenciaId: number, format: 'excel' | 'pdf'): Promise<void>
};
```

---

## 📊 Validaciones y Restricciones

### Validaciones de Archivos

| Validación | Regla | Mensaje de Error |
|------------|-------|------------------|
| Tipo de archivo | PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ZIP | "Tipo de archivo no permitido. Solo se permiten: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ZIP" |
| Tamaño | Máximo 10 MB | "El archivo excede el tamaño máximo permitido de 10 MB" |
| Cantidad simultánea | Máximo 10 archivos | "Solo se pueden subir hasta 10 archivos simultáneamente" |
| Nombre duplicado | No permitir archivos con mismo nombre del mismo usuario | "Ya existe un archivo con este nombre. Por favor renómbrelo" |

### Validaciones de Enlaces

| Validación | Regla | Mensaje de Error |
|------------|-------|------------------|
| URL válida | Formato HTTP/HTTPS | "Por favor ingrese una URL válida (debe comenzar con http:// o https://)" |
| Título | Mínimo 3 caracteres, máximo 255 | "El título debe tener entre 3 y 255 caracteres" |
| URL duplicada | No permitir misma URL del mismo usuario | "Ya existe este enlace. Por favor verifique" |

### Configuración del Servidor

```php
// config/filesystems.php
'evidencias' => [
    'driver' => 'local',
    'root' => storage_path('app/evidencias'),
    'visibility' => 'private',
],

// .env
EVIDENCE_MAX_FILE_SIZE=10240 # KB (10 MB)
EVIDENCE_ALLOWED_EXTENSIONS=pdf,doc,docx,xls,xlsx,jpg,png,zip
EVIDENCE_MAX_FILES_PER_UPLOAD=10
```

---

## 🔐 Seguridad

### Medidas de Seguridad Implementadas

1. **Validación de Tipos MIME**: No confiar solo en extensión
2. **Escaneo de Virus**: Integrar ClamAV (opcional pero recomendado)
3. **Nombres aleatorios**: UUID para evitar sobrescritura
4. **Almacenamiento privado**: Archivos NO accesibles vía URL directa
5. **Streaming de descargas**: No exponer rutas reales
6. **Rate limiting**: Máximo 50 subidas por hora por usuario
7. **Sanitización de nombres**: Remover caracteres especiales
8. **Tokens CSRF**: Validación en todas las peticiones POST/PUT/DELETE

### Logs de Auditoría

Registrar en `historial_recursos_evidencia`:
- ✅ Quién subió/editó/eliminó
- ✅ Cuándo (timestamp preciso)
- ✅ Qué cambió (diff JSON)
- ✅ Desde dónde (IP address)
- ✅ Con qué (User Agent)

---

## 🧪 Casos de Prueba

### Caso 1: Subir Archivo Exitoso
**Precondición:** Usuario autenticado como Profesor responsable de evidencia  
**Pasos:**
1. Navegar a evidencia asignada
2. Click en "Subir Archivos"
3. Arrastrar archivo PDF de 2 MB
4. Click en "Subir"

**Resultado esperado:**
- ✅ Archivo aparece en lista bajo nombre del usuario
- ✅ Mensaje de éxito
- ✅ Contador de recursos actualizado

### Caso 2: Validación de Tamaño
**Precondición:** Usuario autenticado  
**Pasos:**
1. Intentar subir archivo de 15 MB

**Resultado esperado:**
- ❌ Mensaje: "El archivo excede el tamaño máximo de 10 MB"
- ❌ Upload bloqueado

### Caso 3: Permisos de Eliminación
**Precondición:** Usuario Profesor, archivo subido por otro usuario  
**Pasos:**
1. Intentar eliminar archivo de otro responsable

**Resultado esperado:**
- ❌ Botón de eliminar NO visible
- ❌ Si intenta vía API: 403 Forbidden

### Caso 4: Descarga por Auditor
**Precondición:** Usuario con rol Auditor  
**Pasos:**
1. Ver recursos de cualquier evidencia
2. Click en "Descargar"

**Resultado esperado:**
- ✅ Descarga exitosa
- ❌ Botones editar/eliminar NO visibles

---

## 📈 Métricas de Éxito

| Métrica | Objetivo | Herramienta de Medición |
|---------|----------|-------------------------|
| Tiempo promedio de subida | < 5 segundos para 5 MB | Logs de aplicación |
| Tasa de éxito de uploads | > 95% | Monitoring backend |
| Errores de validación | < 10% de intentos | Analytics |
| Uso de almacenamiento | < 50 GB total | Dashboard admin |
| Descargas por mes | Métrica base a establecer | Google Analytics |

---

## 📅 Estimación de Esfuerzo

| Tarea | Esfuerzo | Responsable |
|-------|----------|-------------|
| **Backend** |
| Migraciones de BD | 2 horas | Backend Dev |
| Modelos y Relaciones | 3 horas | Backend Dev |
| Endpoints API | 8 horas | Backend Dev |
| Políticas de Autorización | 3 horas | Backend Dev |
| Almacenamiento & Upload | 4 horas | Backend Dev |
| Tests Unitarios Backend | 4 horas | Backend Dev |
| **Frontend** |
| Componentes UI | 12 horas | Frontend Dev |
| Servicios API | 4 horas | Frontend Dev |
| Hooks personalizados | 3 horas | Frontend Dev |
| Validaciones | 2 horas | Frontend Dev |
| Tests Unitarios Frontend | 4 horas | Frontend Dev |
| **Integración** |
| Pruebas E2E | 6 horas | QA Team |
| Documentación | 3 horas | Tech Writer |
| Code Review | 2 horas | Tech Lead |
| **TOTAL** | **60 horas** | **~1.5 sprints** |

---

## 🚀 Plan de Implementación

### Sprint 1: Backend Foundation (1 semana)
- ✅ Crear migraciones de tablas
- ✅ Implementar modelos Eloquent
- ✅ Crear endpoints básicos (CRUD archivos)
- ✅ Implementar upload con validaciones
- ✅ Configurar almacenamiento local

### Sprint 2: Backend Avanzado (1 semana)
- ✅ Implementar CRUD de enlaces
- ✅ Crear políticas de autorización
- ✅ Implementar historial de cambios
- ✅ Agregar soft deletes
- ✅ Tests unitarios backend

### Sprint 3: Frontend UI (1 semana)
- ✅ Crear componentes base
- ✅ Implementar drag & drop upload
- ✅ Crear modales (agregar enlace, editar)
- ✅ Integrar servicios API
- ✅ Validaciones frontend

### Sprint 4: Integración y Pruebas (1 semana)
- ✅ Integración backend-frontend
- ✅ Pruebas E2E completas
- ✅ Ajustes de UX
- ✅ Documentación técnica
- ✅ Deploy a staging

---

## 🔗 Dependencias

### Dependencias Técnicas
- **HU-012** (Búsqueda de Evidencias): Punto de entrada para gestionar recursos
- **Sistema de Permisos Spatie**: Manejo de roles y permisos
- **Laravel File Storage**: Sistema de archivos
- **Laravel Sanctum**: Autenticación API

### Dependencias Funcionales
- Modelo `Evidence` debe estar completamente funcional
- Relación `assignments` (responsables) debe estar poblada
- Sistema de roles debe incluir todos los roles mencionados

---

## 📚 Referencias

- [Laravel File Storage](https://laravel.com/docs/10.x/filesystem)
- [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission)
- [React Dropzone](https://react-dropzone.js.org/)
- [Axios File Upload with Progress](https://github.com/axios/axios#request-config)

---

## 👤 Contacto

**Product Owner:** [Nombre]  
**Scrum Master:** [Nombre]  
**Tech Lead:** [Nombre]  
**Equipo Desarrollo:** SAAC Team  

---

## 📝 Notas Adicionales

### Consideraciones Futuras

1. **Versionado de Archivos**
   - Mantener versiones históricas de archivos modificados
   - Permitir restaurar versiones anteriores
   - Comparación de versiones (diff)

2. **Previsualización de Archivos**
   - Viewer integrado para PDFs
   - Preview de imágenes en modal
   - Metadata de documentos Office

3. **Búsqueda de Recursos**
   - Búsqueda full-text dentro de PDFs
   - Filtros por tipo, tamaño, fecha
   - Tags/etiquetas personalizables

4. **Notificaciones**
   - Notificar a responsables cuando se agregan recursos
   - Alertas cuando se eliminan recursos
   - Resumen semanal de actividad

5. **Integración con Almacenamiento Externo**
   - AWS S3 para almacenamiento escalable
   - Google Drive / OneDrive sync
   - CDN para descargas rápidas

---

**Documento generado el:** 6 de febrero de 2026  
**Versión:** 1.0  
**Estado:** Borrador para revisión
