# Análisis: Backend Disponible para HU-029 (Mis Evidencias Asignadas)

**Fecha:** 5 de diciembre de 2025  
**Requerimiento:** HU-029 (antes HU-007.5) - Visualización de Evidencias Asignadas  
**Estado:** ✅ **BACKEND COMPLETAMENTE DISPONIBLE - LISTO PARA DESARROLLO FRONTEND**

---

## 📋 Resumen Ejecutivo

**CONCLUSIÓN: No se necesita desarrollar backend adicional. Todo está listo para comenzar el desarrollo del frontend.**

El backend ya tiene implementada toda la funcionalidad necesaria para HU-029:
- ✅ Modelo `EvidenceAssignment` con relaciones completas
- ✅ Controller `EvidenceAssignmentController` con todos los endpoints
- ✅ Service `EvidenceAssignmentService` con lógica de negocio
- ✅ Resource `EvidenceAssignmentResource` para formateo de respuestas
- ✅ Rutas API registradas y funcionales
- ✅ Request validation implementado

---

## 🗄️ Backend Existente - Análisis Detallado

### 1. **Modelo: EvidenceAssignment**
**Archivo:** `app/Models/EvidenceAssignment.php`

```php
class EvidenceAssignment extends Model
{
    protected $table = 'EVIDENCIA_ASIGNACION';
    protected $primaryKey = 'evidencia_asignacion_id';
    
    protected $fillable = [
        'proceso_id',
        'evidencia_id',
        'usuario_id',
        'estado',              // pendiente, en_progreso, completado, vencido
        'fecha_asignacion',
        'fecha_limite',
        'comentario'
    ];
    
    // Relaciones disponibles:
    process()    // belongsTo Process
    evidence()   // belongsTo Evidence
    user()       // belongsTo User
}
```

**Estados disponibles:**
- `pendiente` - Asignada pero sin iniciar
- `en_progreso` - Usuario trabajando en ella
- `completado` - Evidencia entregada
- `vencido` - Pasó la fecha límite sin completar

---

### 2. **Endpoints API Disponibles**

#### **Endpoint Principal para HU-029:**
```
GET /api/usuarios/{usuarioId}/evidencias-asignadas
```
**Controller:** `EvidenceAssignmentController@getByUser`  
**Responde:** Lista de evidencias asignadas al usuario con relaciones cargadas

**Ejemplo de uso:**
```typescript
// Para obtener las evidencias del usuario actual
GET /api/usuarios/123/evidencias-asignadas

// Respuesta esperada:
{
  "data": [
    {
      "evidencia_asignacion_id": 1,
      "proceso_id": 5,
      "evidencia_id": 10,
      "usuario_id": 123,
      "estado": "pendiente",
      "fecha_asignacion": "2025-11-01T10:00:00Z",
      "fecha_limite": "2025-12-15T23:59:59Z",
      "comentario": "Entregar documentación completa",
      "proceso": {
        "proceso_id": 5,
        "ciclo_acreditacion_id": 2
      },
      "evidencia": {
        "evidencia_id": 10,
        "nombre": "Plan de Mejora 2024",
        "descripcion": "Documento con plan de mejora...",
        "criterio_id": 3
      },
      "usuario": {
        "usuario_id": 123,
        "nombre": "Juan Pérez",
        "email": "juan.perez@una.ac.cr"
      }
    }
  ]
}
```

#### **Otros Endpoints Útiles:**

1. **Listar todas las asignaciones (admin):**
   ```
   GET /api/evidencias-asignaciones
   ```

2. **Ver una asignación específica:**
   ```
   GET /api/evidencias-asignaciones/{id}
   ```

3. **Actualizar estado de asignación:**
   ```
   PUT /api/evidencias-asignaciones/{id}
   Body: { "estado": "en_progreso" }
   ```

4. **Asignaciones por evidencia:**
   ```
   GET /api/evidencias/{evidenciaId}/asignaciones
   ```

5. **Asignaciones por proceso:**
   ```
   GET /api/procesos/{procesoId}/asignaciones
   ```

---

### 3. **Servicio: EvidenceAssignmentService**

**Métodos disponibles:**
- `getAll()` - Todas las asignaciones
- `findById($id)` - Una asignación específica
- `assignEvidence($data)` - Crear asignaciones (usuarios y/o roles)
- `updateAssignment($assignment, $data)` - Actualizar asignación
- `deleteAssignment($assignment)` - Eliminar asignación
- **`getAssignmentsByUser($usuarioId)`** ⭐ - **CLAVE PARA HU-029**
- `getAssignmentsByEvidence($evidenciaId)`
- `getAssignmentsByProcess($procesoId)`

**Características:**
- ✅ Carga eager de relaciones (process, evidence, user)
- ✅ Ordenamiento por fecha_asignacion descendente
- ✅ Manejo de transacciones para operaciones complejas
- ✅ Validación de existencia de proceso y evidencia

---

### 4. **Resource: EvidenceAssignmentResource**

Transforma los datos en formato JSON estandarizado con:
- IDs de asignación, proceso, evidencia y usuario
- Estado y fechas (ISO 8601)
- Relaciones anidadas cuando están cargadas
- Timestamps de auditoría

---

## 🎯 Lo Que Necesitamos Desarrollar (Solo Frontend)

### 1. **Tipos TypeScript**

```typescript
// src/Types/EvidenceAssignmentTypes.ts
export interface EvidenceAssignment {
  evidencia_asignacion_id: number;
  proceso_id: number;
  evidencia_id: number;
  usuario_id: number;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'vencido';
  fecha_asignacion: string; // ISO 8601
  fecha_limite: string | null;
  comentario: string | null;
  created_at: string;
  updated_at: string;
  
  // Relaciones
  proceso?: {
    proceso_id: number;
    ciclo_acreditacion_id: number;
  };
  evidencia?: {
    evidencia_id: number;
    nombre: string;
    descripcion: string;
    criterio_id: number;
  };
  usuario?: {
    usuario_id: number;
    nombre: string;
    email: string;
  };
}

export interface EvidenceAssignmentListResponse {
  data: EvidenceAssignment[];
}
```

---

### 2. **Servicio Frontend**

```typescript
// src/Services/EvidenceAssignmentService.ts
import { axiosInstance } from '@/Config/axios';
import type { 
  EvidenceAssignment, 
  EvidenceAssignmentListResponse 
} from '@/Types/EvidenceAssignmentTypes';

export const evidenceAssignmentService = {
  /**
   * Obtiene las evidencias asignadas al usuario actual
   * GET /api/usuarios/{usuarioId}/evidencias-asignadas
   */
  getMyAssignments: async (usuarioId: number): Promise<EvidenceAssignment[]> => {
    const response = await axiosInstance.get<EvidenceAssignmentListResponse>(
      `/usuarios/${usuarioId}/evidencias-asignadas`
    );
    return response.data.data;
  },

  /**
   * Actualiza el estado de una asignación
   * PUT /api/evidencias-asignaciones/{id}
   */
  updateStatus: async (
    assignmentId: number,
    estado: EvidenceAssignment['estado']
  ): Promise<EvidenceAssignment> => {
    const response = await axiosInstance.put(
      `/evidencias-asignaciones/${assignmentId}`,
      { estado }
    );
    return response.data.data;
  }
};
```

---

### 3. **Componentes React**

#### **A. Página Principal: MyEvidenceAssignmentsPage**
- Lista de tarjetas con evidencias asignadas
- Filtros por estado (pendiente, en_progreso, completado, vencido)
- Ordenamiento por fecha de asignación o fecha límite
- Búsqueda por nombre de evidencia

#### **B. Componente: EvidenceAssignmentCard**
- Muestra información de la asignación
- Badge de estado con colores (pendiente=amarillo, en_progreso=azul, completado=verde, vencido=rojo)
- Fecha límite con countdown si está próxima
- Botón "Ver Detalles" que abre modal o navega a detalle
- Botón "Subir Evidencia" que integra con EvidenceUploadPage

#### **C. Componente: EvidenceAssignmentDetail**
- Información completa de la evidencia
- Descripción y criterio relacionado
- Historial de estados (si está disponible)
- Comentarios del asignador
- Lista de archivos ya subidos (integra con FileList)
- Zona de subida (integra con FileUploader)

---

### 4. **Integración con Componentes Existentes**

Reutilizaremos los componentes ya desarrollados en HU-008:

```typescript
// Ejemplo de integración
import { FileUploader, FileList } from '@/Pages/Evidence';
import { fileService } from '@/Services/FileService';

// En EvidenceAssignmentDetail:
<FileUploader 
  onFilesSelected={handleFilesSelected}
  disabled={assignment.estado === 'completado'}
/>

<FileList 
  files={uploadedFiles}
  onDelete={handleDeleteFile}
  loading={loadingFiles}
/>
```

---

## 📊 Estructura de Carpetas Propuesta

```
src/Pages/EvidenceAssignment/
├── MyEvidenceAssignmentsPage.tsx       # Página principal - lista de asignadas
├── EvidenceAssignmentDetailPage.tsx    # Detalle de una asignación específica
├── Components/
│   ├── EvidenceAssignmentCard.tsx      # Tarjeta de asignación en lista
│   ├── EvidenceAssignmentFilters.tsx   # Filtros por estado, fecha, etc
│   ├── EvidenceAssignmentDetail.tsx    # Detalle completo con subida
│   ├── AssignmentStatusBadge.tsx       # Badge de estado
│   └── index.ts
└── index.ts

src/Services/
└── EvidenceAssignmentService.ts        # Servicio API

src/Types/
└── EvidenceAssignmentTypes.ts          # Tipos TypeScript
```

---

## ✅ Checklist de Desarrollo Frontend

### **Fase 1: Setup Básico**
- [ ] Crear tipos en `EvidenceAssignmentTypes.ts`
- [ ] Crear servicio en `EvidenceAssignmentService.ts`
- [ ] Agregar ruta en `Navigation.ts`
- [ ] Agregar módulo en `ModuleInfo.ts`

### **Fase 2: Componentes Base**
- [ ] `AssignmentStatusBadge.tsx` - Badge de estados
- [ ] `EvidenceAssignmentCard.tsx` - Tarjeta en lista
- [ ] `EvidenceAssignmentFilters.tsx` - Filtros y búsqueda

### **Fase 3: Páginas Principales**
- [ ] `MyEvidenceAssignmentsPage.tsx` - Lista principal
- [ ] `EvidenceAssignmentDetailPage.tsx` - Detalle con subida

### **Fase 4: Integración**
- [ ] Integrar FileUploader en detalle
- [ ] Integrar FileList en detalle
- [ ] Actualizar estado al subir archivos
- [ ] Navegación desde tarjeta a detalle

### **Fase 5: UX Mejorada**
- [ ] Countdown para fechas límites próximas
- [ ] Notificaciones de cambio de estado
- [ ] Skeleton loaders mientras carga
- [ ] Estados vacíos personalizados
- [ ] Responsive design

---

## 🚀 Siguientes Pasos Inmediatos

1. **Crear tipos TypeScript** para las asignaciones
2. **Implementar servicio frontend** con axios
3. **Diseñar página principal** con lista de asignaciones
4. **Integrar componentes de HU-008** para subida
5. **Agregar filtros y búsqueda** para mejorar UX
6. **Implementar actualización de estado** cuando se suban archivos

---

## 🔗 Dependencias

### **Dependencias Satisfechas:**
- ✅ Backend API completo
- ✅ Componentes de subida de archivos (HU-008)
- ✅ Sistema de iconos (SystemIcons)
- ✅ Sistema de navegación
- ✅ Contexto de autenticación (para obtener usuario_id)

### **Sin Dependencias Bloqueantes:**
- No se necesita desarrollo de backend
- No se necesitan nuevos componentes base
- No se necesitan cambios en infraestructura

---

## 📝 Notas Adicionales

### **Mejora Futura Opcional (No Bloqueante):**
Si en el futuro se quiere agregar más información en el endpoint, se podría solicitar al backend:

```typescript
// Información adicional útil (OPCIONAL, no necesaria ahora)
interface EvidenceAssignmentEnhanced extends EvidenceAssignment {
  // Contar archivos ya subidos
  archivos_subidos_count?: number;
  
  // Información del proceso completo
  proceso_completo?: {
    proceso_id: number;
    nombre: string;
    ciclo_acreditacion: {
      ciclo_acreditacion_id: number;
      nombre: string;
      fecha_inicio: string;
      fecha_fin: string;
    };
  };
  
  // Información completa del criterio
  criterio?: {
    criterio_id: number;
    nombre: string;
    componente: string;
    dimension: string;
  };
}
```

Pero **NO es necesario para empezar**. Podemos obtener esta información haciendo requests adicionales si se necesita.

---

## 🎉 Conclusión

**BACKEND ESTÁ LISTO. PODEMOS EMPEZAR A DESARROLLAR EL FRONTEND DE HU-029 INMEDIATAMENTE.**

No hay blockers técnicos. Todo el desarrollo será exclusivamente en el frontend utilizando la API ya existente y los componentes ya creados en HU-008.

**Tiempo estimado de desarrollo:** 2-3 días de trabajo efectivo
**Complejidad:** Media (mayormente UI/UX y integración de componentes existentes)
