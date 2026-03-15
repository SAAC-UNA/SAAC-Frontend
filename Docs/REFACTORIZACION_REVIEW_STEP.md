# Refactorización sugerida: `ReviewStep.tsx`

**Archivo:** `src/Pages/EvidenceAssignment/Components/ReviewStep.tsx`  
**Tamaño actual:** 614 líneas  
**Objetivo:** reducir a ~180–200 líneas extrayendo sub-componentes y corrigiendo problemas de calidad

---

## Problema principal: componente monolítico (614 líneas)

El componente mezcla lógica de negocio (carga de datos, validación de duplicados) con 5 secciones visuales distintas, cada una con su propio estado y comportamiento. React Doctor lo marca con `no-giant-component`.

### Secciones visuales identificadas

| Sección | Líneas aprox. | Sub-componente sugerido |
|---|---|---|
| Tarjetas de estadísticas (4 cards) | ~25 | `<ReviewStatCards>` |
| Panel duplicados activos (amarillo) | ~65 | `<ActiveDuplicatesPanel>` |
| Panel duplicados completados (azul) | ~85 | `<CompletedDuplicatesPanel>` |
| Sección colapsable genérica (evidencias / destinatarios) | ~40 | `<ReviewCollapsibleSection>` |
| Sección de configuración | ~35 | (inline, ya es simple) |

Todos los sub-componentes irían en el mismo archivo (no se usan en ningún otro lugar).

---

## Problema 2: 5 `useState` para estados de expansión — usar un objeto

**Código actual (líneas 41–44):**
```tsx
const [expandedEvidences, setExpandedEvidences] = useState(false);
const [expandedDestinators, setExpandedDestinators] = useState(false);
const [expandedActiveDuplicates, setExpandedActiveDuplicates] = useState(true);
const [expandedCompletedDuplicates, setExpandedCompletedDuplicates] = useState(true);
```

Cuatro `useState` independientes para estados relacionados. React Doctor marca el componente con `prefer-useReducer` por tener ≥5 `useState`.

**Código corregido:**
```tsx
const [expanded, setExpanded] = useState({
  evidences: false,
  destinators: false,
  activeDuplicates: true,
  completedDuplicates: true,
});

const toggle = (key: keyof typeof expanded) =>
  setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
```

Uso:
```tsx
// Antes:
onClick={() => setExpandedEvidences(!expandedEvidences)}
expandedEvidences && (...)

// Después:
onClick={() => toggle('evidences')}
expanded.evidences && (...)
```

**Impacto:** reduce de 5 a 2 `useState` (junto con `dataState`), elimina la advertencia `prefer-useReducer`.

---

## Problema 3: duplicados filtrados computados múltiples veces

`duplicates.filter(d => d.estado !== 'completado')` y `duplicates.filter(d => d.estado === 'completado')` se calculan **tres veces** en el componente: una en el `useMemo` de `statistics` y dos más directamente en el JSX (líneas ~280 y ~370).

**Código corregido:** extraer como variables memorizadas antes del `return`:

```tsx
const activeDuplicates = useMemo(
  () => duplicates.filter(d => d.estado !== 'completado'),
  [duplicates]
);

const completedDuplicates = useMemo(
  () => duplicates.filter(d => d.estado === 'completado'),
  [duplicates]
);
```

Y simplificar `statistics` para que use estas variables en lugar de recalcular:

```tsx
const statistics = useMemo(() => ({
  totalEvidences: formData.selectedEvidences.length,
  totalUsers: formData.selectedUsers.length - excludedUsersSet.size,
  totalRoles: formData.selectedRoles.length,
  totalDestinations: ...,
  totalDuplicates: duplicates.length,
  activeDuplicates: activeDuplicates.length,    // ya calculado
  completedDuplicates: completedDuplicates.length, // ya calculado
}), [formData, excludedUsersSet, duplicates, activeDuplicates, completedDuplicates]);
```

---

## Problema 4: `getStatusColor` y `getStatusText` — sustituir por mapa

**Código actual (líneas ~175–200):**
```tsx
const getStatusColor = (estado: string) => {
  switch (estado) { ... } // 4 cases
};

const getStatusText = (estado: string) => {
  switch (estado) { ... } // 4 cases
};
```

Dos funciones con `switch` que se llaman en el mismo punto del JSX. Se pueden declarar fuera del componente como constantes (sin re-crearse en cada render):

**Código corregido (fuera del componente, junto a los tipos):**
```tsx
const STATUS_MAP: Record<string, { color: string; label: string }> = {
  completado:  { color: 'bg-green-100 text-green-800',  label: 'Completado'  },
  en_progreso: { color: 'bg-blue-100 text-blue-800',    label: 'En Progreso' },
  vencido:     { color: 'bg-red-100 text-red-800',      label: 'Vencido'     },
};
const DEFAULT_STATUS = { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' };

// Uso en JSX:
const { color, label } = STATUS_MAP[duplicate.estado] ?? DEFAULT_STATUS;
```

**Impacto:** elimina la re-creación de las dos funciones en cada render y simplifica el JSX a una sola desestructuración.

---

## Problema 5: lógica de checkbox "seleccionar todos los completados" inline

**Líneas ~390–415** — El `onChange` del checkbox de cabecera tiene ~20 líneas de lógica inline directamente en el JSX. Además usa mutación de array (`push`):

**Código actual:**
```tsx
onChange={(e) => {
  const completedUserIds = duplicates
    .filter(d => d.estado === 'completado')
    .map(d => d.usuario_id);
  const currentExcluded = formData.excludedUsers || [];
  if (e.target.checked) {
    updateFormData({ excludedUsers: currentExcluded.filter(id => !completedUserIds.includes(id)) });
  } else {
    const newExcluded = [...currentExcluded];
    completedUserIds.forEach(id => {
      if (!newExcluded.includes(id)) newExcluded.push(id); // mutación
    });
    updateFormData({ excludedUsers: newExcluded });
  }
}}
```

**Código corregido:** extraer a función nombrada con lógica funcional:

```tsx
const handleToggleAllCompleted = (include: boolean) => {
  const completedIds = new Set(completedDuplicates.map(d => d.usuario_id));
  const currentExcluded = formData.excludedUsers ?? [];

  updateFormData({
    excludedUsers: include
      ? currentExcluded.filter(id => !completedIds.has(id))
      : [...new Set([...currentExcluded, ...completedIds])],
  });
};

// En el JSX:
onChange={(e) => handleToggleAllCompleted(e.target.checked)}
```

---

## Problema 6: `handleToggleUser` no usa el `Set` ya computado

**Líneas ~213–222** — El handler usa `currentExcluded.includes(userId)` (O(n)) cuando ya existe `excludedUsersSet` (O(1)):

**Código actual:**
```tsx
const handleToggleUser = (userId: number) => {
  const currentExcluded = formData.excludedUsers || [];
  const isCurrentlyExcluded = currentExcluded.includes(userId); // O(n)
  if (isCurrentlyExcluded) {
    updateFormData({ excludedUsers: currentExcluded.filter(id => id !== userId) });
  } else {
    updateFormData({ excludedUsers: [...currentExcluded, userId] });
  }
};
```

**Código corregido:**
```tsx
const handleToggleUser = (userId: number) => {
  const currentExcluded = formData.excludedUsers ?? [];
  updateFormData({
    excludedUsers: excludedUsersSet.has(userId)   // O(1) — usa el Set ya computado
      ? currentExcluded.filter(id => id !== userId)
      : [...currentExcluded, userId],
  });
};
```

---

## Mapa de extracción de sub-componentes

### `<ReviewCollapsibleSection>` — envoltorio colapsable reutilizable

Las secciones de "Evidencias", "Destinatarios", "Duplicados activos" y "Duplicados completados" comparten la misma estructura: borde de color, botón de cabecera con contador circular, chevron animado, contenido colapsable.

```tsx
interface ReviewCollapsibleSectionProps {
  count: number;
  title: string;
  colorScheme: 'gray' | 'yellow' | 'blue';
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const ReviewCollapsibleSection: React.FC<ReviewCollapsibleSectionProps> = ({ ... }) => (
  <div className={cn('relative overflow-hidden rounded-corner border-2', borderClass)}>
    <button onClick={onToggle} className="w-full p-6 text-left ...">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex items-center justify-center w-10 h-10 rounded-full text-white font-bold', badgeClass)}>
            {count}
          </div>
          <h3 ...>{title}</h3>
        </div>
        <SystemIcons.interface.chevronDown className={cn(..., expanded && 'rotate-180')} size="md" />
      </div>
    </button>
    {expanded && (
      <div className="border-t p-6">
        {children}
        {footer}
      </div>
    )}
  </div>
);
```

### `<ReviewStatCards>` — las 4 tarjetas de resumen

```tsx
interface ReviewStatCardsProps {
  totalEvidences: number;
  totalUsers: number;
  totalRoles: number;
  totalDestinations: number;
}
```

### `<ActiveDuplicatesPanel>` — panel amarillo

Recibe `duplicates: DuplicateAssignment[]` (ya filtrados, solo activos), `expanded`, `onToggle`.

### `<CompletedDuplicatesPanel>` — panel azul con checkboxes

Recibe `duplicates`, `excludedUsersSet`, `expanded`, `onToggle`, `onToggleUser`, `onToggleAll`.

---

## Resultado esperado tras aplicar todos los cambios

| Métrica | Antes | Después |
|---|---|---|
| Líneas totales | 614 | ~200 |
| `useState` en componente raíz | 5 | 2 (`dataState` + `expanded`) |
| Cálculos duplicados de filtros | 3 veces | 1 vez (memorizados) |
| Funciones recreadas por render | `getStatusColor`, `getStatusText` | 0 (constante externa) |
| Mutaciones de array | 2 (`push`) | 0 |
| Flag `no-giant-component` | ✗ | ✓ |
| Flag `prefer-useReducer` | ✗ | ✓ |
