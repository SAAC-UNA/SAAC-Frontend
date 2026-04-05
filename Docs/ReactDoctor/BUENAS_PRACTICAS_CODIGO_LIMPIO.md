# Buenas Prácticas — Prevenir Acumulación de Código Muerto

Este documento recoge las lecciones aprendidas durante la sesión de limpieza de código y propone hábitos de desarrollo para evitar que el mismo problema se repita.

---

## 1. Imports: la regla del "si no lo usas, no lo importes"

**Problema:** Se importan símbolos (componentes, constantes, funciones) "por si acaso" o porque se copiaron de otro archivo similar, y luego nunca se usan.

**Regla:** Agrega un import solo cuando ya tienes escrito el código que lo consume. Si eliminas el uso, elimina el import en el mismo commit.

**Señales de alerta:**
- El IDE subraya el import en gris/amarillo
- `TypeScript TS6133: 'X' is declared but never read`

**Herramienta:** VS Code con `"editor.codeActionsOnSave": { "source.organizeImports": "explicit" }` puede eliminar imports automáticamente al guardar.

---

## 2. Variables y parámetros desestructurados que no se leen

**Problema:** Al desestructurar un estado o props, se declaran variables que luego no se usan:
```ts
const { data, isLoading, error, isLoadingRole, loadError } = useMyHook();
// isLoadingRole y loadError nunca se usan en el JSX
```

**Regla:** Desestructura solo lo que realmente usas. Si en el futuro necesitas otro campo, lo agregas en ese momento.

**Alternativa para suprimir el error sin eliminar la variable** (solo si es intencional):
```ts
const { data, isLoading, error, isLoadingRole: _isLoadingRole } = useMyHook();
// El prefijo _ comunica que es intencionalmente ignorado
```

---

## 3. Funciones declaradas pero nunca llamadas

**Problema:** Se define una función utilitaria (`const getModuleInfo = () => {...}`) pero luego se usa el valor que debería retornar como si ya estuviera disponible, generando errores de variable no definida.

**Regla:** Si declaras una función, llámala inmediatamente o asígnala a un evento/efecto en el mismo commit. Si es un valor estático calculado una sola vez, usa una IIFE:
```ts
// En lugar de:
const getModuleInfo = () => { ... } // función que nunca se llama

// Usa:
const moduleInfo = (() => { ... })(); // IIFE: se ejecuta inmediatamente
```

---

## 4. Componentes de UI: reemplazos deben eliminar el original

**Problema:** `DataTable.tsx` reemplazó a `Table.tsx`, pero `Table.tsx` permaneció en el repositorio sin importadores durante mucho tiempo.

**Regla:** Cuando un componente es reemplazado por otro más completo:
1. Busca todos los importadores del componente viejo: `grep -r "from.*Table"` o usa la función "Find All References" de VS Code
2. Si hay cero referencias, elimina el archivo en el mismo PR
3. Si hay referencias, migra cada uno antes de eliminar

---

## 5. Lazy imports en App.tsx: siempre usar el patrón `.then(m => ...)`

**Problema:** `lazy(() => import('./Componente'))` solo funciona si el archivo tiene `export default`. Con named exports, TypeScript lanza `TS2322` y el lazy load falla en runtime.

**Regla única:** Usar siempre el patrón explícito para que sea obvio qué se está exportando:
```ts
// Incorrecto (solo funciona si el archivo tiene export default):
const MyPage = lazy(() => import('./MyPage'));

// Correcto (funciona con named exports):
const MyPage = lazy(() => import('./MyPage').then(m => ({ default: m.MyPage })));
```

**Bonus:** Este patrón también hace que sea fácil detectar si el nombre del componente cambió en el archivo fuente.

---

## 6. Parámetros de `.map()`: siempre declarar lo que usas

**Problema:** Se usa `index` o `colIndex` dentro de un `.map()` callback pero no se declara como segundo parámetro:
```tsx
{items.map((item) => (
  <div key={index}> {/* ❌ index no existe aquí */}
```

**Regla:** Si necesitas el índice, decláralo:
```tsx
{items.map((item, index) => (
  <div key={index}> {/* ✅ */}
```

Si solo necesitas el índice (no el item), usa `_`:
```tsx
{items.map((_, index) => (...))}
```

---

## 7. Props de tipos opcionales: no pasar `false` para desactivarlos

**Problema:** `pagination={false}` cuando el tipo de la prop es `pagination?: { ... }` (un objeto o `undefined`). TypeScript rechaza `boolean` donde espera un objeto.

**Regla:** Si un prop es opcional y quieres desactivarlo, simplemente no lo pases. `undefined` implícito es equivalente a "off":
```tsx
// Correcto: simplemente omite el prop
<DataTable data={data} columns={columns} />

// Incorrecto: TypeScript rechaza boolean cuando el tipo es un objeto
<DataTable data={data} columns={columns} pagination={false} />
```

---

## 8. Ejecutar el build antes de hacer commit

**El único árbitro definitivo** de si el código está limpio es el compilador. Las herramientas del IDE ayudan pero no son infalibles.

**Regla:** Antes de cada push, ejecutar:
```bash
npm run build
```

Si falla con `TS6133` (unused) o cualquier otro error de compilación, resolverlo antes de subir el código.

**Opcional — pipeline local automatizado:**
```bash
# package.json
"scripts": {
  "precommit": "tsc --noEmit"
}
```
Con `husky` o `lint-staged` esto puede ejecutarse automáticamente en cada commit.

---

## 9. Usar `knip` periódicamente

`knip` es una herramienta que analiza el grafo de imports y detecta:
- Archivos completos sin importadores
- Exports que nadie consume
- Types que nadie usa

**Uso:**
```bash
npx knip
```

Recomendado ejecutarlo al inicio de cada sprint o cuando se completa una historia de usuario que involucra refactoring.

---

## 10. Convención de nombres para indicar intención

Cuando un parámetro o variable existe por razones técnicas pero no se usa directamente, el prefijo `_` comunica la intención al equipo y suprime la advertencia del compilador:

```ts
columns.map((column, _index) => ...)  // _index: existe pero no se necesita
data.filter((_item, index) => index < 10)  // _item: solo importa el índice
```

Esto es preferible a simplemente ignorar el warning, porque documenta que la decisión fue consciente.

---

## 11. Agrupación de estados relacionados (`prefer-useReducer`)

**Problema:** Acumular muchos `useState` independientes para valores que siempre cambian juntos genera componentes difíciles de leer y activa la regla `prefer-useReducer` de react-doctor (se dispara con ≥5 `useState` en un componente).

**Regla:** Cuando un componente tiene ≥5 `useState`, agrupar los que semánticamente pertenecen juntos en un único estado de objeto.

**Grupos naturales que suelen aparecer:**
| Grupo | Ejemplos de campos |
|---|---|
| `pageState` | `data/items`, `loading`, `error` |
| `modalState` | `isOpen`, `selectedItem`, `title` |
| `filterState` | `query`, `filtro`, `currentPage` |
| `submitState` | `isSubmitting`, `errors` |
| `formState` | campos del formulario relacionados |
| `uiState` | `expandedItems` (Set), `loadingIds` (Set), `selectedId` |

**Patrón obligatorio — alias para no tocar el JSX:**
```tsx
// ✅ Correcto: agrupar + alias inmediatos
const [pageState, setPageState] = useState<{
  items: Item[];
  loading: boolean;
  error: string | null;
}>({ items: [], loading: true, error: null });

const items   = pageState.items;    // alias → el JSX usa `items` sin cambios
const loading = pageState.loading;
const error   = pageState.error;

// ❌ Incorrecto: tres useState separados
const [items,   setItems]   = useState<Item[]>([]);
const [loading, setLoading] = useState(true);
const [error,   setError]   = useState<string | null>(null);
```

**Patrón para actualizar el setter (siempre con spread):**
```tsx
// Un campo
setPageState(prev => ({ ...prev, loading: false }));

// Varios campos a la vez (equivale a los tres setters del ejemplo anterior)
setPageState(prev => ({ ...prev, items: data, loading: false, error: null }));
```

**Estado muerto — nunca declarar un estado que jamás se actualiza:**
```tsx
// ❌ Estado inútil: nunca hay un setter que lo cambie
const [isSaving] = useState(false);

// ✅ Correcto: constante simple
const isSaving = false;
```

**Sets y Maps dentro de estado de objeto:**
```tsx
// Al modificar un Set dentro de un estado agrupado, siempre crear una nueva instancia
setUiState(prev => ({ ...prev, expandedItems: new Set(prev.expandedItems).add(id) }));

// Para eliminar:
setUiState(prev => {
  const newSet = new Set(prev.expandedItems);
  newSet.delete(id);
  return { ...prev, expandedItems: newSet };
});
```

**Objetivo:** Mantener ≤4 `useState` por componente. Si tras agrupar siguen siendo más de 4, evaluar si el componente tiene demasiadas responsabilidades (candidato a dividir).

---

## Resumen rápido

| Situación | Acción |
|---|---|
| Import gris/subrayado en IDE | Eliminar inmediatamente |
| Variable desestructurada pero no leída | Eliminar del destructuring |
| Función definida pero no llamada | Convertir a IIFE o eliminar |
| Componente reemplazado | Eliminar el original si tiene 0 referencias |
| Lazy import con named export | Usar `.then(m => ({ default: m.Name }))` |
| Prop opcional que se quiere desactivar | Omitirlo; no pasar `false` |
| Antes de cada push | `npm run build` debe pasar |
| Cada sprint o HU de refactoring | Ejecutar `npx knip` |
| ≥5 `useState` en un componente | Agrupar los relacionados en objetos con alias |
| Estado que nunca se actualiza | Reemplazar por constante simple |
