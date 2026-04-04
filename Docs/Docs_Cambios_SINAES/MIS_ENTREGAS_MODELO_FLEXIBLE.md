# Mis Entregas — Soporte Dual Modelo Tradicional / Flexible

**Módulo:** Mis Entregas (`/mis-evidencias-asignadas`)
**HU relacionadas:** HU-029, HU-016

---

## Contexto

El módulo Mis Entregas mostraba únicamente las asignaciones del modelo tradicional
(`EVIDENCIA_ASIGNACION`). Con la introducción del modelo flexible SINAES 2026+
(`ELEMENTO_ASIGNACION`), un usuario puede tener asignaciones de ambos tipos
dependiendo del proceso de acreditación al que pertenezca su carrera.

---

## Cambios realizados

### `src/Types/EvidenceAssignment.ts`

Nueva interfaz `FlexibleAssignmentItem` que representa la respuesta de
`GET /api/usuarios/{id}/elementos-asignados`:

```typescript
export interface FlexibleAssignmentItem extends Record<string, unknown> {
  elemento_asignacion_id: number;
  elemento_id: number;
  usuario_id: number;
  proceso_id: number;
  estado: string; // PascalCase: 'Pendiente' | 'En Progreso' | 'Completado' | 'Vencido' | 'Observada' | 'Validada'
  fecha_limite: string | null;
  comentario: string | null;
  created_at: string;
  updated_at: string;
  has_pending_extension_request?: boolean;
  element?: { elemento_id: number; nombre: string; tipo: string; ... };
  process?: { proceso_id: number; nombre: string; };
  user?: { usuario_id: number; nombre: string; };
}
```

---

### `src/Services/EvidenceAssignmentService.ts`

Tres métodos nuevos para el modelo flexible:

| Método | Endpoint | Descripción |
|---|---|---|
| `getMyElementAssignments(userId)` | `GET /api/usuarios/{id}/elementos-asignados` | Lista pautas asignadas al usuario |
| `updateElementStatus(id, estado)` | `PATCH /api/elementos-asignaciones/{id}` | Cambia estado a `En Progreso` o `Completado` |
| `requestElementExtension(id, data)` | `POST /api/elementos-asignaciones/{id}/solicitud-ampliacion` | Solicita ampliación de plazo |

---

### `src/Pages/MyEvidence/Components/ElementAssignmentsTable.tsx` *(nuevo)*

Tabla para el modelo flexible. Columnas: **Pauta**, **Proceso**, **Fecha Límite**,
**Estado**, **Acciones** (ver detalle, cambiar estado, solicitar ampliación).

Usa `EVIDENCE_STATUS_BADGE` porque los estados del modelo flexible son PascalCase
(`Pendiente`, `En Progreso`, etc.) igual que los estados de publicación de evidencia,
a diferencia de los estados del modelo tradicional que son snake_case.

---

### `src/Pages/MyEvidence/Components/index.ts`

Agregado el export de `ElementAssignmentsTable`.

---

### `src/Pages/MyEvidence/MyEvidenceAssignmentsPage.tsx`

Cambios principales:

1. **Carga paralela de ambas listas** al montar: `loadAssignments()` (tradicional) +
   `loadFlexAssignments()` (flexible) + `loadProcesses()` (nombres de proceso).

2. **`availableProcesses` (derivado):** lista de procesos donde el usuario tiene
   asignaciones de cualquier tipo, construida con `useMemo` cruzando los `proceso_id`
   de ambas listas.

3. **Selector de proceso** (`CustomSelect`): aparece **solo si el usuario tiene más
   de un proceso** (`processOptions.length > 1`). Si solo tiene uno, la tabla se
   muestra directamente sin selector.

4. **Detección de modelo** por proceso: el flag `isFlexible` se deriva de si el
   `proceso_id` seleccionado aparece en las asignaciones flexibles o tradicionales.

5. **Tabla dinámica:** según `isFlexible`, se renderiza `ElementAssignmentsTable`
   o `EvidenceAssignmentsTable`. La paginación y el reseteo de página son compartidos.

6. **Modal de ampliación reutilizado:** `CreateExtensionRequestModal` se usa para
   ambos modelos. Para el modelo flexible llama a
   `evidenceAssignmentService.requestElementExtension()`.

7. **SearchInput** solo se muestra en el modelo tradicional (el flexible no tiene
   filtrado por texto implementado).

---

## Cómo funciona el selector de proceso

```
Al montar:
  ┌─────────────────────────┐    ┌─────────────────────────────────────┐
  │ getMyAssignments(userId) │    │ getMyElementAssignments(userId)     │
  │ → EVIDENCIA_ASIGNACION  │    │ → ELEMENTO_ASIGNACION               │
  └──────────┬──────────────┘    └──────────────┬──────────────────────┘
             │                                  │
             └────────────┬─────────────────────┘
                          ▼
               availableProcesses (useMemo)
               ┌──────────────────────────────────┐
               │ proceso_id: 1, isFlexible: false  │ ← Proceso A (carrera X)
               │ proceso_id: 2, isFlexible: true   │ ← Proceso B (carrera Y)
               └──────────────────────────────────┘
                          ▼
               si length > 1 → muestra CustomSelect
               si length = 1 → tabla directa sin selector
                          ▼
               isFlexible=false → EvidenceAssignmentsTable (criterios)
               isFlexible=true  → ElementAssignmentsTable  (pautas)
```

---

## Limitación actual — Cómo se obtienen los nombres de proceso

### Situación presente

Los nombres de proceso se resuelven por esta cadena de fallbacks:

```
1. getAllProcesses()                    → GET /api/estructura/procesos (TODOS los procesos del sistema)
   si no encontrado:
2. assignment.process?.nombre          → nombre embebido en ELEMENTO_ASIGNACION (solo modelo flexible)
   si no encontrado:
3. `Proceso ${proceso_id}`             → fallback genérico
```

**Problema:** `getAllProcesses()` (`/api/estructura/procesos`) devuelve todos los
procesos del sistema. Es una llamada sobredimensionada para obtener únicamente los
nombres de los 1-3 procesos que el usuario tiene asignados.

Adicionalmente, **el modelo tradicional no embebe el nombre del proceso** en la
respuesta de `getMyAssignments()`, por lo que sin `getAllProcesses()` los procesos
tradicionales mostrarían el texto genérico `"Proceso 5"`.

---

## Requerimiento pendiente de backend

### Opción A — Endpoint dedicado `GET /api/usuarios/{id}/mis-procesos` *(recomendada)*

Endpoint que retorna solo los procesos donde el usuario tiene asignaciones, junto
con el tipo de modelo de cada uno:

```
GET /api/usuarios/{usuario_id}/mis-procesos
Authorization: Bearer {token}
```

**Respuesta esperada:**

```json
{
  "data": [
    {
      "proceso_id": 1,
      "nombre": "Proceso de Acreditación Informática 2024",
      "tipo_modelo": "tradicional",
      "ciclo_acreditacion_id": 3
    },
    {
      "proceso_id": 4,
      "nombre": "Proceso de Acreditación Computación 2025",
      "tipo_modelo": "elemento_flexible",
      "ciclo_acreditacion_id": 7
    }
  ]
}
```

**Lógica sugerida en el backend** (nuevo método en `EvidenceAssignmentService` o
en un `UserProcessService`):

```php
public function getProcessesForUser(int $userId): Collection
{
    // Procesos del modelo tradicional
    $tradicional = EvidenceAssignment::where('usuario_id', $userId)
        ->distinct()
        ->pluck('proceso_id');

    // Procesos del modelo flexible
    $flexible = ElementAssignment::where('usuario_id', $userId)
        ->distinct()
        ->pluck('proceso_id');

    $allIds = $tradicional->merge($flexible)->unique();

    return Process::with('accreditationCycle.modeloEstructura')
        ->whereIn('proceso_id', $allIds)
        ->get()
        ->map(fn ($p) => [
            'proceso_id'           => $p->proceso_id,
            'nombre'               => $p->accreditationCycle?->nombre ?? "Proceso {$p->proceso_id}",
            'tipo_modelo'          => $p->accreditationCycle?->modeloEstructura?->tipo ?? 'tradicional',
            'ciclo_acreditacion_id'=> $p->ciclo_acreditacion_id,
        ]);
}
```

**Ventajas:** una sola llamada, sin sobreobtener datos, el frontend ya conoce el
tipo de modelo sin inferirlo de las asignaciones.

---

### Opción B — Agregar `process.nombre` al eager load del modelo tradicional

Como segunda opción más simple, agregar el `nombre` del ciclo al eager load en
`EvidenceAssignmentService::WITH_BASE`:

```php
// Actualmente:
private const WITH_BASE = ['evidence.criterion', 'evidence.comments.user', 'user', 'process'];

// El modelo Process no tiene campo 'nombre' directamente.
// Pero sí se puede agregar accreditationCycle al proceso:
private const WITH_BASE = ['evidence.criterion', 'evidence.comments.user', 'user', 'process.accreditationCycle.modeloEstructura'];
```

Y en el frontend leer `assignment.proceso?.accreditationCycle?.nombre ?? assignment.proceso?.accreditationCycle?.modeloEstructura?.tipo`.

**Desventaja:** el nombre del proceso en la tabla PROCESO no existe — está en el
ciclo (`AccreditationCycle.nombre`). Aun así resuelve el problema de forma sin
endpoint extra, aunque agrega carga a `getMyAssignments()`.

---

## Impacto si se implementa la Opción A

Una vez disponible `GET /api/usuarios/{id}/mis-procesos`:

1. Eliminar la llamada a `loadProcesses()` que usa `getAllProcesses()`
2. Eliminar el estado `processes: Process[]` de la página
3. `availableProcesses` se construiría directamente desde la respuesta del nuevo
   endpoint, con `tipo_modelo` ya resuelto — el flag `isFlexible` vendría del
   backend en lugar de inferirse
4. El `useMemo` de `availableProcesses` se simplifica a un simple mapeo

```typescript
// Con el nuevo endpoint, la lógica quedaría:
const [userProcesses, setUserProcesses] = useState<UserProcess[]>([]);

// availableProcesses ya no es un useMemo complejo:
const processOptions = userProcesses.map(p => ({
  value: String(p.proceso_id),
  label: p.nombre,
}));

const selectedProcess = userProcesses.find(p => p.proceso_id === selectedProcessId);
const isFlexible = selectedProcess?.tipo_modelo === 'elemento_flexible';
```
