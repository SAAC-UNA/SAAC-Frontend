# Integración de Solicitudes de Ampliación en Mis Evidencias Asignadas

## Descripción
Integración del módulo de solicitudes de ampliación (HU-016) con la página de "Mis Evidencias Asignadas" para mejorar la experiencia del usuario permitiendo solicitar ampliaciones directamente desde donde visualizan sus evidencias.

## Cambios Implementados

### 1. Backend - Flexibilidad de fechas
**Archivo:** `SAAC-Backend/app/Http/Requests/StoreExtensionRequestRequest.php`

**Cambio:**
```php
// Antes:
'fecha_sugerida' => 'required|date|after:now',

// Ahora:
'fecha_sugerida' => 'required|date|after:today',
```

**Justificación:** Permite solicitar ampliaciones incluso para evidencias vencidas, manteniendo flexibilidad en el sistema.

---

### 2. Frontend - MyEvidenceAssignmentsPage

**Archivo:** `src/Pages/EvidenceAssignment/MyEvidenceAssignmentsPage.tsx`

**Nuevas funcionalidades:**
- ✅ Import del `CreateExtensionRequestModal`
- ✅ Estados para controlar modal y asignación seleccionada
- ✅ Handler `handleRequestExtension` para abrir modal
- ✅ Handler `handleExtensionRequestSuccess` para manejar solicitud exitosa
- ✅ Handler `handleCloseExtensionModal` para cerrar modal
- ✅ Pre-llenado automático de `evidenciaAsignacionId` y `fechaLimiteActual`

**Código agregado:**
```typescript
// Estados
const [showExtensionModal, setShowExtensionModal] = useState(false);
const [selectedAssignmentForExtension, setSelectedAssignmentForExtension] = useState<EvidenceAssignment | null>(null);

// Handler para solicitar ampliación
const handleRequestExtension = (assignment: EvidenceAssignment) => {
  setSelectedAssignmentForExtension(assignment);
  setShowExtensionModal(true);
};

// Modal renderizado
{showExtensionModal && selectedAssignmentForExtension && (
  <CreateExtensionRequestModal
    isOpen={showExtensionModal}
    onClose={handleCloseExtensionModal}
    onSuccess={handleExtensionRequestSuccess}
    evidenciaAsignacionId={selectedAssignmentForExtension.evidencia_asignacion_id}
    fechaLimiteActual={selectedAssignmentForExtension.fecha_limite}
  />
)}
```

---

### 3. Frontend - EvidenceAssignmentsTable

**Archivo:** `src/Pages/EvidenceAssignment/Components/EvidenceAssignmentsTable.tsx`

**Cambios:**
1. ✅ Nueva prop `onRequestExtension?: (assignment: EvidenceAssignment) => void`
2. ✅ Botón de "Solicitar Ampliación" en columna de acciones
3. ✅ Lógica condicional para mostrar botón solo si:
   - Estado es `pendiente` o `en_progreso`
   - Se proporcionó el callback `onRequestExtension`

**Código agregado:**
```typescript
// En la columna de acciones
const canRequestExtension = ['pendiente', 'en_progreso'].includes(assignment.estado);

{onRequestExtension && canRequestExtension && (
  <TableActionButton
    action="clock"
    tooltip="Solicitar ampliación de plazo"
    onClick={() => onRequestExtension(assignment)}
  />
)}
```

---

### 4. Frontend - TableActionButton

**Archivo:** `src/Components/Ui/TableActionButton.tsx`

**Cambios:**
- ✅ Agregado tipo `'clock'` a `TableActionType`
- ✅ Configuración de icono y variante para acción 'clock'

**Código agregado:**
```typescript
export type TableActionType = '...' | 'clock' | 'custom';

const actionConfig = {
  // ...
  clock: {
    icon: <SystemIcons.interface.clock className="w-4 h-4" size="sm" />,
    variant: 'tableEdit'
  },
};
```

---

## Flujo de Usuario

1. **Usuario visualiza sus evidencias asignadas**
   - Página: `/mis-evidencias-asignadas`

2. **Identifica evidencia que necesita más tiempo**
   - Ve en la tabla el estado (`pendiente`, `en_progreso`, etc.)
   - Ve la fecha límite actual

3. **Hace clic en botón de reloj** ⏰
   - Solo visible si estado es `pendiente` o `en_progreso`
   - Tooltip: "Solicitar ampliación de plazo"

4. **Se abre el modal de solicitud**
   - `evidencia_asignacion_id` pre-llenado automáticamente
   - `fecha_limite` actual mostrada como referencia
   - Usuario completa:
     - Motivo (10-300 caracteres)
     - Fecha sugerida (posterior a hoy)

5. **Envía la solicitud**
   - Validación frontend y backend
   - Notificación de éxito con toast
   - Recarga automática de asignaciones
   - Modal se cierra

6. **Encargado recibe notificación**
   - Email automático generado por backend
   - Puede revisar en `/solicitudes-ampliacion/gestionar`

---

## Validaciones Implementadas

### Frontend
- ✅ Motivo: mínimo 10 caracteres, máximo 300
- ✅ Fecha sugerida: debe ser posterior a hoy
- ✅ Fecha sugerida: formato YYYY-MM-DD
- ✅ Botón solo visible para estados permitidos

### Backend
- ✅ `evidencia_asignacion_id` debe existir
- ✅ Motivo: regex para caracteres permitidos
- ✅ Fecha sugerida: `after:today`
- ✅ No permitir solicitudes duplicadas pendientes
- ✅ Usuario debe ser el asignado (validación comentada temporalmente)

---

## Mejoras Futuras Sugeridas

### 1. Indicadores Visuales de Solicitudes
Agregar badges en la tabla para mostrar si una evidencia ya tiene:
- 🟡 Solicitud pendiente
- 🟢 Solicitud aprobada
- 🔴 Solicitud rechazada

**Implementación sugerida:**
```typescript
// En EvidenceAssignmentsTable, agregar una columna o badge
{assignment.extension_request_status && (
  <span className={`badge badge-${assignment.extension_request_status}`}>
    {extensionStatusLabels[assignment.extension_request_status]}
  </span>
)}
```

### 2. Validación de Solicitudes Duplicadas en Frontend
Antes de mostrar el botón, verificar si ya existe una solicitud:
```typescript
const hasPendingRequest = assignment.extension_requests?.some(
  req => req.estado === 'pendiente' || req.estado === 'aprobada'
);

// Solo mostrar botón si no tiene solicitud activa
{onRequestExtension && canRequestExtension && !hasPendingRequest && (
  <TableActionButton action="clock" ... />
)}
```

### 3. Endpoint para Verificar Solicitudes Existentes
Crear endpoint que retorne solicitudes asociadas a una evidencia:
```
GET /api/solicitudes-ampliacion/por-evidencia/{evidencia_asignacion_id}
```

---

## Testing

### Casos de Prueba

1. **Solicitud exitosa para evidencia pendiente**
   - ✅ Botón visible
   - ✅ Modal se abre con datos pre-llenados
   - ✅ Envío exitoso
   - ✅ Toast de confirmación

2. **Solicitud para evidencia vencida**
   - ✅ Permite seleccionar fecha futura
   - ✅ Backend acepta la solicitud

3. **Evidencia completada**
   - ✅ Botón NO visible (estado no permitido)

4. **Validaciones de formulario**
   - ✅ Motivo muy corto: muestra error
   - ✅ Fecha en el pasado: muestra error
   - ✅ Fecha sugerida antes de límite actual: muestra advertencia

5. **Solicitud duplicada**
   - ✅ Backend rechaza con mensaje claro

---

## Archivos Modificados

### Backend
- `app/Http/Requests/StoreExtensionRequestRequest.php`

### Frontend
- `src/Pages/EvidenceAssignment/MyEvidenceAssignmentsPage.tsx`
- `src/Pages/EvidenceAssignment/Components/EvidenceAssignmentsTable.tsx`
- `src/Components/Ui/TableActionButton.tsx`

### Sin cambios
- `src/Components/Ui/CreateExtensionRequestModal.tsx` (ya existía)
- `src/Services/ExtensionRequestService.ts` (ya existía)
- Backend controllers y services (ya existían)

---

## Ventajas de esta Integración

1. **UX mejorada:** Usuario solicita ampliación donde ve sus evidencias
2. **Menos clics:** No necesita ir a otra página
3. **Contexto visual:** Ve la fecha límite mientras solicita
4. **Pre-llenado automático:** Reduce errores de usuario
5. **Coherencia:** Flujo natural dentro del módulo de evidencias
6. **Flexibilidad:** Permite solicitudes incluso para evidencias vencidas

---

## Notas Técnicas

- El modal `CreateExtensionRequestModal` se reutiliza sin modificaciones
- La integración es **opt-in**: si no se pasa `onRequestExtension`, no aparece el botón
- Compatible con la página independiente de "Mis Solicitudes de Ampliación"
- No duplica lógica: reutiliza servicio y componentes existentes
