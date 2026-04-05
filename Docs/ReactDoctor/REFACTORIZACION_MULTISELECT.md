# Refactorización sugerida: `MultiSelect.tsx`

**Archivo:** `src/Components/Ui/Forms/MultiSelect.tsx`  
**Tamaño actual:** 502 líneas  
**Objetivo:** reducir a ~200–220 líneas eliminando duplicación y problemas de calidad

---

## Problema principal: dropdown duplicado (~160 líneas copiadas)

El contenido del dropdown (buscador + botón "Seleccionar todo" + lista de opciones + mensaje sin resultados) está escrito dos veces, casi idéntico, una vez para `variant='floating'` y otra para `variant='default'`. Esa duplicación representa ~32% del archivo.

### Solución: extraer `<MultiSelectDropdown>` (componente interno)

Crear un componente interno (en el mismo archivo, no en uno separado) que encapsule el panel del dropdown:

```tsx
interface MultiSelectDropdownProps {
  showSearch: boolean;
  searchTerm: string;
  searchInputRef: React.RefObject<HTMLInputElement>;
  searchPlaceholder: string;
  maxHeight: string;
  showSelectAll: boolean;
  filteredOptions: MultiSelectOption[];
  selectedOptions: MultiSelectOption[];
  allSelected: boolean;
  selectAllText: string;
  deselectAllText: string;
  variant: 'floating' | 'default';
  onSearchChange: (term: string) => void;
  onSearchClear: () => void;
  onSelectAll: () => void;
  onOptionToggle: (option: MultiSelectOption) => void;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ ... }) => {
  // Todo el JSX del panel, una sola vez
};
```

Uso en el componente principal (ambas variantes):

```tsx
{isOpen && !disabled && (
  <MultiSelectDropdown
    variant={variant}
    showSearch={showSearch}
    ...
  />
)}
```

**Impacto:** elimina ~160 líneas duplicadas.

---

## Problema secundario: `<MultiSelectOptionItem>` duplicado

Dentro de cada variante se tiene el mismo bloque `filteredOptions.map(...)` con el mismo `<button>` renderizando cada opción. La única diferencia son los nombres de tokens de color (ver problema 4 más abajo).

### Solución: extraer `<MultiSelectOptionItem>` (componente interno)

```tsx
interface MultiSelectOptionItemProps {
  option: MultiSelectOption;
  isSelected: boolean;
  variant: 'floating' | 'default';
  onToggle: (option: MultiSelectOption) => void;
}

const MultiSelectOptionItem: React.FC<MultiSelectOptionItemProps> = ({ ... }) => (
  <button
    key={option.value}
    type="button"
    className={cn(...)}
    onClick={() => onToggle(option)}
    disabled={option.disabled}
  >
    ...
  </button>
);
```

---

## Problema 3: fuga de memoria en el `useEffect` de foco

**Líneas 89–95** — El `setTimeout` que hace foco en el input de búsqueda **no retorna `clearTimeout`**, lo que causa que si el componente se desmonta antes de 100ms el callback intente actualizar un ref de un nodo ya destruido.

**Código actual:**
```tsx
useEffect(() => {
  if (isOpen && searchable && options.length >= minItemsForSearch && searchInputRef.current) {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }
}, [isOpen, searchable, options.length, minItemsForSearch]);
```

**Código corregido:**
```tsx
useEffect(() => {
  if (!isOpen || !searchable || options.length < minItemsForSearch) return;
  const timer = setTimeout(() => searchInputRef.current?.focus(), 100);
  return () => clearTimeout(timer);
}, [isOpen, searchable, options.length, minItemsForSearch]);
```

---

## Problema 4: tokens de color inconsistentes entre variantes

La variante `floating` usa clases CSS de Tailwind genéricas en lugar de los design tokens del proyecto:

| Elemento | Variante `floating` (incorrecto) | Variante `default` (correcto) |
|---|---|---|
| Fondo dropdown | `bg-white` | `bg-blanco-una-2` |
| Borde dropdown | `border-gray-300` | `border-gris-una` |
| Opción deshabilitada | `text-gray-400` | `text-gris-una` |
| Texto opción normal | `text-gray-900` | `text-negro-una-2` |
| Hover opción | `hover:bg-gray-100` | `hover:bg-blanco-una-2` |
| Opción seleccionada | `bg-blue-50 text-azul-una-2` | `bg-blanco-una-2 text-azul-una` |
| Fondo buscador | `bg-gray-50/50` | (sin fondo especial) |
| Borde buscador | `border-gray-200` | `border-gris-una` |

Al extraer `<MultiSelectDropdown>`, se unifica en un solo lugar y se usa siempre los tokens del diseño.

---

## Problema 5: `getMaxHeight()` es una función sin argumentos que devuelve siempre lo mismo

**Líneas 66–70** — Se define como función pero en realidad es un valor derivado de `maxVisibleItems`, que es un prop que no cambia durante el ciclo de vida del componente.

**Código actual:**
```tsx
const getMaxHeight = () => {
  const itemHeight = 46;
  const maxHeight = maxVisibleItems * itemHeight;
  return `${maxHeight}px`;
};
// Se usa como: style={{ maxHeight: getMaxHeight() }}
```

**Código corregido:**
```tsx
const maxHeight = `${maxVisibleItems * 46}px`;
// Se usa como: style={{ maxHeight }}
```

---

## Problema 6: `isAllSelected()` y `getDisplayText()` se llaman varias veces por render sin memorización

Ambas funciones iteran sobre arrays (`options`, `selectedOptions`) y se llaman múltiples veces en cada render.

**Código actual:**
```tsx
const isAllSelected = () => { ... };   // se llama 2 veces
const getDisplayText = () => { ... };  // se llama 2 veces (una por variante)
```

**Código corregido:**
```tsx
const allSelected = useMemo(() => {
  const enabledOptions = options.filter(opt => !opt.disabled);
  return enabledOptions.length > 0 &&
    enabledOptions.every(opt => selectedOptions.some(s => s.value === opt.value));
}, [options, selectedOptions]);

const displayText = useMemo(() => {
  if (selectedOptions.length === 0) return placeholder;
  if (selectedOptions.length === 1) return selectedOptions[0].label;
  return `${selectedOptions.length} elementos seleccionados`;
}, [selectedOptions, placeholder]);
```

---

## Problema 7: mutación de array en `handleSelectAll`

**Líneas 122–136** — El bloque "Seleccionar todo" usa `push()` sobre una copia local del array, que es un patrón de mutación que puede ocultar bugs:

**Código actual:**
```tsx
const newSelectedOptions = [...selectedOptions];
enabledOptions.forEach(opt => {
  if (!newSelectedOptions.some(selected => selected.value === opt.value)) {
    newSelectedOptions.push(opt);  // mutación
  }
});
```

**Código corregido (funcional):**
```tsx
const alreadySelected = new Set(selectedOptions.map(s => s.value));
const newSelectedOptions = [
  ...selectedOptions,
  ...enabledOptions.filter(opt => !alreadySelected.has(opt.value)),
];
```

---

## Resultado esperado tras aplicar todos los cambios

| Métrica | Antes | Después |
|---|---|---|
| Líneas totales | 502 | ~220 |
| Componente raíz | 502 líneas | ~100 líneas (solo lógica + triggers) |
| `MultiSelectDropdown` | — | ~80 líneas |
| `MultiSelectOptionItem` | — | ~25 líneas |
| Código duplicado | ~160 líneas (32%) | 0 |
| Fuga de timer | Sí | No |
| Tokens inconsistentes | Sí (floating usa Tailwind genérico) | No |
| Flag `no-giant-component` | ✗ | ✓ |
