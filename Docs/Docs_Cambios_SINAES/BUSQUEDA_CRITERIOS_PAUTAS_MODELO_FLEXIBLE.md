# BUSQUEDA_CRITERIOS_PAUTAS_MODELO_FLEXIBLE

## Contexto

El módulo **Explorador de Criterios / Pautas** (`/evidencias/busqueda-avanzada`) mostraba únicamente la jerarquía fija del modelo tradicional (Dimensión → Componente → Criterio). Con la incorporación del modelo `elemento_flexible` (árbol dinámico con `padre_id`), se implementó soporte dual para que la pantalla se adapte automáticamente según el proceso de acreditación seleccionado.

---

## Flujo de comportamiento

```
Usuario abre panel de filtros
         │
         ▼
   Selecciona Proceso
         │
         ├─── modelo_estructura_tipo = 'tradicional'
         │         → Título: "Explorador de Criterios"
         │         → Filtros: Dimensión → Componente → Criterio
         │         → Columna tabla: "Criterio"
         │         → Placeholder buscar: "...criterio o responsable"
         │
         └─── modelo_estructura_tipo = 'elemento_flexible'
                   → Título: "Explorador de Pautas"
                   → Filtros: Pauta (hojas del árbol del modelo)
                   → Columna tabla: "Pauta"
                   → Placeholder buscar: "...pauta o responsable"
```

---

## Archivos modificados

### `src/Types/EvidenceSearchTypes.ts`
- Agregado campo `proceso_id?: number | null` a `EvidenceSearchFilters` — permite enviar el proceso seleccionado al backend para filtrar por el modelo correcto.
- Agregado campo `elemento_id?: number | null` a `EvidenceSearchFilters` — filtro de pauta en modo flexible (equivalente a `criterio` en modo tradicional).

### `src/Services/EvidenceSearchService.ts`
- Agregado `proceso_id?: number` a la interfaz interna `SearchParams`.
- Agregado `elemento_id?: number` a `SearchParams`.
- En `search()`: se mapean `filters.proceso_id` y `filters.elemento_id` a sus respectivos `params` antes de llamar al backend.

### `src/Navigation.ts`
- Label del ítem sidebar `busquedaEvidencias` cambiado de `"Busqueda de Criterios"` → `"Criterios / Pautas"` (nombre neutro que funciona para ambos modelos; el sidebar no tiene acceso al proceso seleccionado dentro de la pantalla).

### `src/Pages/EvidenceSearch/EvidenceSearchPage.tsx`
Cambios principales:

**Nuevos imports:**
```typescript
import type { SelectOption } from '@/Components/Ui/Index';
import { evidenceAssignmentService } from '@/Services/EvidenceAssignmentService';
import type { Process } from '@/Types/EvidenceAssignment';
import type { FlexibleElement } from '@/Types/StructureModelTypes';
```

**Nuevo estado:**
```typescript
const [processes, setProcesses] = useState<Process[]>([]);
const [selectedProcessId, setSelectedProcessId] = useState<string>('');
const [flexElements, setFlexElements] = useState<FlexibleElement[]>([]);
```

**Valores derivados (useMemo):**
```typescript
const selectedProcess = processes.find(p => p.proceso_id === parseInt(selectedProcessId)) ?? null;
const isFlexible = selectedProcess?.modelo_estructura_tipo === 'elemento_flexible';

// Opciones para el selector de proceso en los filtros
const processOptions: SelectOption[] = processes.map(p => ({ value: p.proceso_id.toString(), label: p.nombre }));

// Elementos hoja del modelo (sin hijos, activos)
const elementOptions: SelectOption[] = flexElements
  .filter(e => !parentIds.has(e.elemento_id) && e.activo)
  .map(e => ({ value: e.elemento_id.toString(), label: e.nombre ?? `Elemento ${e.elemento_id}` }));
```

**Efectos:**
- `useEffect` al montar: carga todos los procesos via `evidenceAssignmentService.getAllProcesses()`
- `useEffect` al cambiar proceso flexible: carga elementos via `evidenceAssignmentService.getElementsByModel(modelo_estructura_id)`; si el proceso no es flexible limpia `flexElements`

**Handler corregido:**
```typescript
const handleProcessChange = useCallback((value: string) => {
  const newId = value === '__all__' ? '' : value;
  setSelectedProcessId(newId);
  // Se pasa el proceso_id directamente al filtro para evitar depender
  // del state asíncrono de React (selectedProcessId aún sería el valor anterior)
  applyFilters({ proceso_id: newId ? parseInt(newId) : null });
}, [applyFilters]);
```

**UI dinámica:**
```typescript
const pageTitle = isFlexible ? 'Explorador de Pautas' : moduleInfo.title;
// placeholder del SearchInput dinámico
// isFlexible y elementOptions pasados a EvidenceSearchFiltersPanel
// isFlexible pasado a EvidenceSearchResultsTable
```

### `src/Pages/EvidenceSearch/Components/EvidenceSearchFiltersPanel.tsx`
Refactorizado completamente para recibir las siguientes props nuevas:

```typescript
interface EvidenceSearchFiltersPanelProps {
  onFiltersChange: (filters: EvidenceSearchFilters) => void;
  isFlexible: boolean;
  processOptions: SelectOption[];
  selectedProcessId: string;
  onProcessChange: (value: string) => void;
  elementOptions: SelectOption[];
}
```

**Comportamiento:**
- El selector de **Proceso** siempre está visible (primera columna).
- Si `isFlexible = false`: muestra cascada Dimensión → Componente → Criterio (3 columnas). Carga sus datos del backend al montar (solo en modo tradicional).
- Si `isFlexible = true`: muestra un selector de **Pauta** (hojas del árbol). No carga datos del backend de estructura tradicional.
- Al cambiar de modo (`isFlexible` cambia), se resetean todos los filtros internos del panel.
- El botón "Limpiar filtros" detecta filtros activos de ambos modos.
- El grid responde: `grid-cols-1 md:grid-cols-2 xl:grid-cols-4` para acomodar el selector de proceso + 3 columnas tradicionales o proceso + 1 pauta.

### `src/Pages/EvidenceSearch/Components/EvidenceSearchResultsTable.tsx`
- Agregada prop `isFlexible?: boolean` (default `false`).
- El header de la primera columna es dinámico: `isFlexible ? 'Pauta' : 'Criterio'`.
- `isFlexible` agregado a la dependencia del `useMemo` de columnas.

---

## Tipo `Process` — campo `nombre` agregado

Durante la implementación se detectó que `Process` en `EvidenceAssignment.ts` no tenía el campo `nombre`, necesario para construir las opciones del selector de proceso en el filtro.

**`src/Types/EvidenceAssignment.ts`:**
```typescript
export interface Process {
  proceso_id: number;
  nombre: string;   // ← agregado
  ciclo_acreditacion_id: number;
  modelo_estructura_id?: number;
  modelo_estructura_tipo?: string;
  ...
}
```

**`src/Services/EvidenceAssignmentService.ts`** — en `getAllProcesses()`:
```typescript
nombre: item.nombre ?? `Proceso ${item.id || item.proceso_id}`,
```

---

## Patrón `isFlexible`

Igual que en el módulo de Asignación de Evidencias, toda la bifurcación se basa en:

```typescript
const isFlexible = selectedProcess?.modelo_estructura_tipo === 'elemento_flexible';
```

Cuando eventualmente exista una pantalla selectora de proceso que pase el `proceso_id` por params/state/contexto, solo hay que ajustar la inicialización de `selectedProcessId` en `EvidenceSearchPage`.

---

## Pendientes

- Cuando el proceso en modo flexible está seleccionado y el usuario aplica un filtro de pauta, el backend debe soportar `GET /api/estructura/evidencias/filter?elemento_id={id}&proceso_id={id}`. Verificar con backend que ese endpoint acepta ambos parámetros.
- Exportación a PDF/Excel en modo flexible: actualmente `exportExcel` y `exportPDF` no envían `elemento_id` ni `proceso_id`. Si el backend lo requiere, agregar el mismo mapeo que en `search()`.
