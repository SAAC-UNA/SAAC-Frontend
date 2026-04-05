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
  process?: {
    proceso_id: number;
    nombre: string;
    ciclo_acreditacion_id?: number;   // ← para agrupar por ciclo
  };
  user?: { usuario_id: number; nombre: string; };
}
```

Campo `ciclo_nombre?: string` agregado a la interfaz `Process` para mostrar el
nombre del ciclo en el selector.

---

### `src/Services/EvidenceAssignmentService.ts`

Tres métodos nuevos para el modelo flexible:

| Método | Endpoint | Descripción |
|---|---|---|
| `getMyElementAssignments(userId)` | `GET /api/usuarios/{id}/elementos-asignados` | Lista pautas asignadas al usuario |
| `updateElementStatus(id, estado)` | `PATCH /api/elementos-asignaciones/{id}` | Cambia estado a `En Progreso` o `Completado` |
| `requestElementExtension(id, data)` | `POST /api/elementos-asignaciones/{id}/solicitud-ampliacion` | Solicita ampliación de plazo |

`getAllProcesses()` ahora mapea también `ciclo_nombre: cycle.nombre`, necesario para
mostrar el nombre del ciclo en el selector.

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
   `loadFlexAssignments()` (flexible) + `loadProcesses()` (nombres de ciclo).

2. **`availableCycles` (derivado):** lista de ciclos donde el usuario tiene
   asignaciones de cualquier tipo, construida con `useMemo` cruzando los
   `ciclo_acreditacion_id` de ambas listas. Un ciclo puede ser tradicional o
   flexible — nunca los dos al mismo tiempo.

3. **Selector de ciclo** (`CustomSelect`, etiqueta "Ciclo de acreditación"): aparece
   **solo si el usuario tiene más de un ciclo** (`cycleOptions.length > 1`). Si solo
   tiene uno, la tabla se muestra directamente sin selector.

4. **Detección de modelo** por ciclo: el flag `isFlexible` se deriva de si el
   `ciclo_acreditacion_id` seleccionado aparece en las asignaciones flexibles.
   Esta detección es determinista porque un ciclo usa un único modelo.

5. **Filtrado correcto para profesores en múltiples carreras:** un profesor en dos
   carreras tiene dos `ciclo_acreditacion_id` distintos, uno por carrera. El filtrado
   por `ciclo_acreditacion_id` es semánticamente correcto — agrupar por `proceso_id`
   podría mezclar procesos de distintas carreras bajo el mismo selector.

6. **Tabla dinámica:** según `isFlexible`, se renderiza `ElementAssignmentsTable`
   o `EvidenceAssignmentsTable`. La paginación y el reseteo de página son compartidos.

7. **Modal de ampliación reutilizado:** `CreateExtensionRequestModal` se usa para
   ambos modelos. Para el modelo flexible llama a
   `evidenceAssignmentService.requestElementExtension()`.

8. **SearchInput** solo se muestra en el modelo tradicional (el flexible no tiene
   filtrado por texto implementado).

---

## Cómo funciona el selector de ciclo

```
Al montar:
  ┌─────────────────────────┐    ┌─────────────────────────────────────┐
  │ getMyAssignments(userId) │    │ getMyElementAssignments(userId)     │
  │ → EVIDENCIA_ASIGNACION  │    │ → ELEMENTO_ASIGNACION               │
  └──────────┬──────────────┘    └──────────────┬──────────────────────┘
             │                                  │
             └────────────┬─────────────────────┘
                          ▼
               availableCycles (useMemo, keyed on ciclo_acreditacion_id)
               ┌──────────────────────────────────────────────┐
               │ ciclo_id: 3, nombre: "Sistemas 2024", isFlexible: false │ ← carrera X
               │ ciclo_id: 7, nombre: "Computación 2025", isFlexible: true│ ← carrera Y
               └──────────────────────────────────────────────┘
                          ▼
               si length > 1 → muestra CustomSelect "Ciclo de acreditación"
               si length = 1 → tabla directa sin selector
                          ▼
               isFlexible=false → EvidenceAssignmentsTable (criterios)
               isFlexible=true  → ElementAssignmentsTable  (pautas)
```

---

## Limitación actual — Cómo se obtienen los nombres de ciclo

### Situación presente

Los nombres de ciclo se resuelven por esta cadena de fallbacks:

```
1. getAllProcesses() → GET /api/estructura/procesos
   mapea ciclo_nombre = cycle.nombre para cada proceso del usuario
   si no encontrado en la lista de procesos:
2. `Ciclo ${ciclo_acreditacion_id}`   → fallback genérico
```

**Problema:** `getAllProcesses()` (`/api/estructura/procesos`) devuelve todos los
procesos del sistema. Es una llamada sobredimensionada para obtener únicamente los
nombres de los 1-3 ciclos que el usuario tiene asignados.

---

## Requerimiento pendiente de backend

### Opción A — Endpoint dedicado `GET /api/usuarios/{id}/mis-ciclos` *(recomendada)*

Endpoint que retorna solo los ciclos donde el usuario tiene asignaciones, junto
con el tipo de modelo de cada uno:

```
GET /api/usuarios/{usuario_id}/mis-ciclos
Authorization: Bearer {token}
```

**Respuesta esperada:**

```json
{
  "data": [
    {
      "ciclo_acreditacion_id": 3,
      "nombre": "Proceso de Acreditación Informática 2024",
      "tipo_modelo": "tradicional"
    },
    {
      "ciclo_acreditacion_id": 7,
      "nombre": "Proceso de Acreditación Computación 2025",
      "tipo_modelo": "elemento_flexible"
    }
  ]
}
```

**Lógica sugerida en el backend:**

```php
public function getCyclesForUser(int $userId): Collection
{
    // Procesos del modelo tradicional
    $tradicional = EvidenceAssignment::where('usuario_id', $userId)
        ->with('process.accreditationCycle.modeloEstructura')
        ->get()
        ->pluck('process.accreditationCycle')
        ->unique('ciclo_acreditacion_id');

    // Procesos del modelo flexible
    $flexible = ElementAssignment::where('usuario_id', $userId)
        ->with('process.accreditationCycle.modeloEstructura')
        ->get()
        ->pluck('process.accreditationCycle')
        ->unique('ciclo_acreditacion_id');

    return $tradicional->merge($flexible)->unique('ciclo_acreditacion_id')
        ->map(fn ($c) => [
            'ciclo_acreditacion_id' => $c->ciclo_acreditacion_id,
            'nombre'                => $c->nombre,
            'tipo_modelo'           => $c->modeloEstructura?->tipo ?? 'tradicional',
        ]);
}
```

**Ventajas:** una sola llamada, sin sobreobtener datos, el frontend ya conoce
el tipo de modelo sin inferirlo — el flag `isFlexible` vendría del backend.

---

### Opción B — Mantener `getAllProcesses()` (situación actual)

La llamada actual a `getAllProcesses()` ya resuelve los nombres de ciclo porque
mapea `ciclo_nombre = cycle.nombre`. Funciona, aunque trae más datos de los
necesarios.

---

## Impacto si se implementa la Opción A

Una vez disponible `GET /api/usuarios/{id}/mis-ciclos`:

1. Eliminar la llamada a `loadProcesses()` que usa `getAllProcesses()`
2. Eliminar el estado `processes: Process[]` de la página
3. `availableCycles` se construiría directamente desde la respuesta del nuevo
   endpoint, con `tipo_modelo` ya resuelto — el flag `isFlexible` vendría del
   backend en lugar de inferirse
4. El `useMemo` de `availableCycles` se simplifica a un simple mapeo

```typescript
// Con el nuevo endpoint, la lógica quedaría:
const [userCycles, setUserCycles] = useState<UserCycle[]>([]);

const cycleOptions = userCycles.map(c => ({
  value: String(c.ciclo_acreditacion_id),
  label: c.nombre,
}));

const selectedCycle = userCycles.find(c => c.ciclo_acreditacion_id === selectedCycleId);
const isFlexible = selectedCycle?.tipo_modelo === 'elemento_flexible';
```
