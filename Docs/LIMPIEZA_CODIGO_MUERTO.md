# Limpieza de Código Muerto — Explicación del Proceso

## ¿Qué pasó y por qué?

A lo largo del desarrollo del frontend se acumuló una cantidad significativa de **código muerto**: imports no usados, componentes declarados pero nunca referenciados, variables definidas y jamás leídas, y archivos completos que quedaron sin consumidores. Esto es un proceso natural cuando un proyecto crece rápido con múltiples desarrolladores y múltiples historias de usuario iterando sobre las mismas áreas.

El problema no es que el código funcione mal — la **lógica de negocio no fue tocada**. El problema es que TypeScript con `noUnusedLocals: true` no permite compilar si existen declaraciones muertas, y herramientas como `knip` rastrean qué archivos, exports y tipos no se usan en ningún lugar del árbol.

---

## Inventario de Cambios

### 1. Imports eliminados (`TABLE_TRUNCATE`)

La constante `TABLE_TRUNCATE` (un límite de caracteres para truncar texto en celdas de tabla) fue importada en 4 componentes de tabla pero **nunca se usó en ninguno de ellos**:

| Archivo | Por qué estaba ahí | Por qué se eliminó |
|---|---|---|
| `EvidenceSearchResultsTable.tsx` | Probablemente pensado para truncar nombres de evidencias | `DataTable` maneja el overflow con CSS; la constante nunca llegó a usarse |
| `EvidenceAssignmentsTable.tsx` | Mismo caso | Igual |
| `RolesTable.tsx` | Igual | Igual |
| `ExtensionRequestsTable.tsx` | Igual; además había un `truncateText` importado que era **shadowed** por una versión local definida con `useCallback` | Se eliminaron ambos imports externos; la versión local es la que funciona |

**Impacto en la lógica:** ninguno. Las tablas se comportan exactamente igual.

---

### 2. Imports de componentes UI nunca renderizados

#### `RoleForm.tsx`
- `LoadingSpinner` — importado pero nunca aparecía en el JSX; el formulario usa su propio indicador de carga.
- `BackendErrorAlert` — importado pero el manejo de errores del formulario usa otro enfoque.
- `isLoadingRole`, `loadError` — desestructurados del estado pero nunca leídos; eran casos de carga/error que quedaron de una refactorización anterior.

**Impacto en la lógica:** ninguno. Los estados que sí se usan (`role`, `permissions`, etc.) permanecen intactos.

---

### 3. Función declarada pero jamás llamada: `getModuleInfo` en `RoleForm.tsx`

Este era el caso más llamativo. Había una función `getModuleInfo()` que construía un objeto con metadatos del módulo. Al no estar llamada en ningún lugar, TypeScript la marcaba como código muerto y luego lanzaba un error porque `moduleInfo` no estaba definido en el JSX que sí la usaba.

**Solución:** convertir la función a una IIFE (expresión inmediatamente invocada) asignada a `const moduleInfo`. Así el valor existe, se calcula una sola vez, y TypeScript deja de quejarse. La lógica es idéntica.

---

### 4. Archivo `Table.tsx` eliminado

`src/Components/Ui/Table/Table.tsx` era un componente de tabla simple que fue reemplazado en algún momento por `DataTable.tsx` (que tiene búsqueda, paginación, acciones y columnas configurables). `Table.tsx` no tenía **ningún importador** en todo el proyecto — nadie lo usaba. Se eliminó por completo.

**Impacto:** ninguno.

---

### 5. Errores de sintaxis pre-existentes reparados

Estos no eran código muerto sino **corrupción de código** — líneas que faltaban o estaban mal desde antes:

| Archivo | Problema | Solución |
|---|---|---|
| `Loading.tsx` | Líneas `);` y `};` sobrantes al final del archivo | Se eliminaron |
| `MultiSelect.tsx` | Cierre de función `handleOptionToggle` incompleto; le faltaba `};` y el header de la siguiente función `handleSelectAll` | Se restauraron |
| `EvidenceSearchPage.tsx` | Dentro de `handleExport` faltaba el bloque `try {` y la condición `if (format === 'excel') {` | Se restauraron |

---

### 6. Errores de TypeScript pre-existentes en componentes UI base

| Archivo | Error | Solución |
|---|---|---|
| `DataTable.tsx` | `index` y `colIndex` usados en `.map()` pero no declarados como segundo parámetro del callback | Se agregaron los parámetros a `.map((column, index) =>...)` y `.map((column, colIndex) =>...)` |
| `DatePicker.tsx` | `day.toISOString()` sobre un `number` (los días son enteros, no `Date`) | Se cambió a `day.toString()` |
| `LinkInput.tsx` | `handleRemoveLink(index)` dentro de `links.map((link) =>...)` pero `index` no declarado | Se agregó: `links.map((link, index) =>...)` |

---

### 7. `App.tsx` — lazy imports sin export default

Dos componentes (`StructureCreation`, `ImprovementCommitmentDetail`) se cargaban con:
```ts
lazy(() => import('@/Pages/Structure/StructureCreation'))
```
Pero ambos archivos solo tenían **named exports**, no `export default`. React's `lazy()` requiere un módulo con `default`. El patrón correcto (y el que usan todos los demás componentes en el mismo archivo) es:
```ts
lazy(() => import('@/Pages/Structure/StructureCreation').then(m => ({ default: m.StructureCreation })))
```
Se actualizaron ambos imports para seguir el mismo patrón.

---

## ¿La lógica de negocio cambió?

**No.** Todos los cambios fueron de una de estas tres categorías:

1. **Eliminación de código que nunca ejecutaba** (imports sin usar, variables sin leer)
2. **Restauración de código que faltaba** (syntax errors que impedían compilar)
3. **Corrección de tipos** que nunca llegaron a producción porque el build fallaba

El comportamiento observable en el navegador, las llamadas a la API, los formularios, las tablas y la navegación son idénticos antes y después de estos cambios.

---

## Resultado

- `tsc -b && vite build` pasa con **0 errores**
- `knip` reporta **0 exports sin usar, 0 types sin usar, 0 duplicados**
- El bundle de producción se genera correctamente y contiene todos los módulos esperados
