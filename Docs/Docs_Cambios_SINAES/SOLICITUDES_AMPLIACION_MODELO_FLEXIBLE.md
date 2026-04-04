# Solicitudes de Ampliación — Soporte Modelo Flexible SINAES 2026+

## Resumen

Se extendió el módulo **Gestionar Solicitudes de Ampliación** (`HU-016`) para soportar simultáneamente el modelo **tradicional** (evidencias por criterio) y el **modelo flexible** (elementos de lista de verifi­cación). El encargado ve en una sola tabla todas las solicitudes del sistema, agrupadas por ciclo de acreditación mediante un selector.

---

## Archivos Modificados

| Archivo | Tipo | Cambio |
|---|---|---|
| `src/Types/ExtensionRequestTypes.ts` | Modificado | Campos duales para ambos modelos |
| `src/Services/FlexibleExtensionRequestService.ts` | **Nuevo** | Servicio para endpoint flexible |
| `src/Pages/ExtensionRequest/ManageExtensionRequestsPage.tsx` | Modificado | Carga paralela + selector de ciclo |

---

## 1. `ExtensionRequestTypes.ts` — Tipos duales

### Cambios aplicados

El tipo `ExtensionRequest` ahora refleja el **diseño XOR** de la base de datos: cada solicitud tiene `evidencia_asignacion_id` **o** `elemento_asignacion_id`, nunca ambos.

```ts
// Antes
evidencia_asignacion_id: number;
evidencia_asignacion?: { ... };

// Después
evidencia_asignacion_id: number | null;          // nullable (modelo tradicional)
elemento_asignacion_id: number | null;           // nuevo (modelo flexible)

evidencia_asignacion?: {
  // campos existentes...
  process?: {
    ciclo_acreditacion_id: number;
    // otros campos de Process
  };
};

elemento_asignacion?: {
  elemento_asignacion_id: number;
  process?: {
    ciclo_acreditacion_id: number;
  };
};
```

**Por qué es necesario:** el selector de ciclo necesita navegar `s.evidencia_asignacion?.process?.ciclo_acreditacion_id` (trad) y `s.elemento_asignacion?.process?.ciclo_acreditacion_id` (flex). El backend expone `.process` en `WITH_BASE` del servicio abstracto.

---

## 2. `FlexibleExtensionRequestService.ts` — Nuevo servicio

Ubicación: `src/Services/FlexibleExtensionRequestService.ts`

### Configuración

```ts
private readonly BASE_PATH = '/elemento-solicitudes-ampliacion';
```

### Métodos

| Método | Verbo HTTP | Endpoint | Descripción |
|---|---|---|---|
| `getPendingRequests(filters?)` | GET | `/elemento-solicitudes-ampliacion/pendientes` | Solicitudes en estado `pendiente` |
| `getAllRequests(filters?)` | GET | `/elemento-solicitudes-ampliacion` | Todas las solicitudes (filtrables) |
| `approveRequest(id, data?)` | POST | `/elemento-solicitudes-ampliacion/{id}/aprobar` | Aprobar solicitud flexible |
| `rejectRequest(id, data)` | POST | `/elemento-solicitudes-ampliacion/{id}/rechazar` | Rechazar solicitud flexible |

### Instancia exportada

```ts
export const flexibleExtensionRequestService = new FlexibleExtensionRequestService();
```

Sigue exactamente la misma interfaz pública que `extensionRequestService` para facilitar la delegación condicional.

---

## 3. `ManageExtensionRequestsPage.tsx` — Refactorización dual

### 3.1 Estado

Se reemplazó el estado único `pageState` por dos estados independientes:

```ts
const [tradState, setTradState] = useState<{
  solicitudes: ExtensionRequest[]; loading: boolean; error: string | null;
}>({ solicitudes: [], loading: true, error: null });

const [flexState, setFlexState] = useState<{
  solicitudes: ExtensionRequest[]; loading: boolean; error: string | null;
}>({ solicitudes: [], loading: false, error: null });

const [processes, setProcesses] = useState<Process[]>([]);
const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
```

### 3.2 Carga paralela (`loadSolicitudes`)

```ts
const [tradRes, flexRes] = await Promise.allSettled([
  filtroEstado === 'pendiente'
    ? extensionRequestService.getPendingRequests(filters)
    : extensionRequestService.getAllRequests(filters),
  filtroEstado === 'pendiente'
    ? flexibleExtensionRequestService.getPendingRequests(filters)
    : flexibleExtensionRequestService.getAllRequests(filters),
]);
```

- Los dos endpoints se consultan **en paralelo** (`Promise.allSettled`).
- Si uno falla, el otro sigue siendo útil → fallo aislado por modelo.
- `per_page: 100` para obtener todos los registros de una sola página.

### 3.3 Carga de procesos (`loadProcesses`)

```ts
const data = await evidenceAssignmentService.getAllProcesses();
setProcesses(data);
```

Fallo silencioso: si el endpoint de procesos no responde, los nombres de ciclo caen al fallback `Ciclo ${cicloId}`.

### 3.4 `availableCycles` useMemo

```
┌─ tradState.solicitudes ─────────────────────────────────────────┐
│  s.evidencia_asignacion?.process?.ciclo_acreditacion_id  →  id  │
└─────────────────────────────────────────────────────────────────┘
           ↓ Map<id, { nombre }>
┌─ flexState.solicitudes ─────────────────────────────────────────┐
│  s.elemento_asignacion?.process?.ciclo_acreditacion_id  →  id   │
└─────────────────────────────────────────────────────────────────┘
           ↓ Map<id, { nombre }>  (deduplicado)
           ↓
  processes[] → label real  o  fallback `Ciclo ${id}`
           ↓
  availableCycles: [{ ciclo_id, nombre }, ...]
```

Dependencias del memo: `[tradState.solicitudes, flexState.solicitudes, processes]`.

Auto-selección del primer ciclo cuando se completa la carga:

```ts
useEffect(() => {
  if (availableCycles.length > 0 && selectedCycleId === null) {
    setSelectedCycleId(availableCycles[0].ciclo_id);
  }
}, [availableCycles, selectedCycleId]);
```

### 3.5 `solicitudes` useMemo — lista fusionada y filtrada

```ts
const solicitudes = useMemo(() => {
  const trad = selectedCycleId
    ? tradState.solicitudes.filter(
        s => s.evidencia_asignacion?.process?.ciclo_acreditacion_id === selectedCycleId
      )
    : tradState.solicitudes;

  const flex = selectedCycleId
    ? flexState.solicitudes.filter(
        s => s.elemento_asignacion?.process?.ciclo_acreditacion_id === selectedCycleId
      )
    : flexState.solicitudes;

  return [...trad, ...flex];
}, [tradState.solicitudes, flexState.solicitudes, selectedCycleId]);
```

### 3.6 Selector de ciclo

```tsx
{cycleOptions.length > 1 && (
  <CustomSelect
    label="Ciclo de acreditación"
    options={cycleOptions}
    value={selectedCycleId ? String(selectedCycleId) : ''}
    onChange={v => setSelectedCycleId(v ? Number(v) : null)}
  />
)}
```

El selector **solo aparece si hay más de un ciclo disponible**, evitando ruido visual cuando hay un solo ciclo activo.

### 3.7 Delegación approve / reject

```ts
const handleApprove = async (data: ReviewFormData, solicitud?: ExtensionRequest) => {
  const target = solicitud ?? selectedSolicitud;
  if (!target) return;

  if (target.elemento_asignacion_id) {
    // → modelo flexible
    await flexibleExtensionRequestService.approveRequest(target.solicitud_ampliacion_id, data);
  } else {
    // → modelo tradicional
    await extensionRequestService.approveRequest(target.solicitud_ampliacion_id, data);
  }
  // ...
};
```

El campo `elemento_asignacion_id !== null` es el discriminador que decide qué servicio invocar. El mismo patrón se aplica en `handleReject`.

---

## 4. Requisito Backend

Para que `ciclo_acreditacion_id` esté disponible en el frontend, el backend debe incluir la relación `.process` al cargar solicitudes:

```php
// AbstractExtensionRequestService.php — WITH_BASE actualizado
const WITH_BASE = [
    'evidenceAssignment.evidence',
    'evidenceAssignment.process',   // ← necesario para ciclo trad
    'elementAssignment.process',    // ← necesario para ciclo flex
    'user',
    'resolutor',
];
```

Además, se requiere la columna `elemento_asignacion_id` en la tabla `SOLICITUD_AMPLIACION` (migración `2026_04_04_164757` ya ejecutada en backend).

---

## 5. Patrón compartido con otros módulos

Este módulo sigue el mismo patrón de selector de ciclo implementado en:

| Módulo | Archivo |
|---|---|
| Mis Entregas | `MIS_ENTREGAS_MODELO_FLEXIBLE.md` |
| Búsqueda de Criterios/Pautas | `BUSQUEDA_CRITERIOS_PAUTAS_MODELO_FLEXIBLE.md` |
| Asignación de Evidencias | `ASIGNACION_EVIDENCIAS_MODELO_FLEXIBLE.md` |
| **Gestionar Solicitudes** | **este documento** |

---

## 6. Rama y Commit

- **Rama:** `Cambios_Modulos_Existentes`
- **Commit:** `SOLICITUDES_AMPLIACION_MODELO_FLEXIBLE`
