# Pendientes: TreeSelect en Asignar Entregables (Modelo Flexible)

Este documento registra los problemas identificados durante las pruebas con mock del componente `TreeSelect` en la página de Asignar Entregables (`EvidenceAssignment`). Deben revisarse y resolverse una vez que el backend esté completamente conectado y los mocks sean eliminados.

---

## Bug corregido en esta sesión

### `z-9999` no genera CSS en Tailwind v4
**Archivo:** `src/Components/Ui/Forms/TreeSelect.tsx`

El dropdown del portal usaba `className="fixed z-9999 ..."`, pero `z-9999` no es una clase válida en Tailwind v4 (el proyecto no la define en `tailwind.config.js` ni en `index.css`). El portal se renderizaba sin `z-index`, quedando detrás del contenido de la página, y el dropdown era invisible aunque sí existía en el DOM.

**Corrección aplicada:** Se movió el z-index a `style={{ zIndex: 9999 }}` inline, igual que el componente `Tooltip`.

---

## Mocks activos — REVERTIR antes de commit productivo

Los tres bloques siguientes están en `src/Services/EvidenceAssignmentService.ts` marcados con `// MOCK`:

1. **Import estático** (línea ~26):
   ```ts
   import { MOCK_FLEXIBLE_ELEMENTS } from '@/Test/mockFlexibleElements';
   ```

2. **En `getAllProcesses()`** — fuerza todos los procesos al tipo flexible:
   ```ts
   modelo_estructura_id: 1,
   modelo_estructura_tipo: 'elemento_flexible' as const,
   // Líneas reales comentadas debajo
   ```

3. **En `getElementsByModel()`** — devuelve datos hardcodeados sin llamar al backend:
   ```ts
   return Promise.resolve(MOCK_FLEXIBLE_ELEMENTS);
   ```

Archivos de prueba a eliminar tras desactivar el mock:
- `src/Test/mockFlexibleElements.ts`
- `src/Test/TreeSelectTestPage.tsx`
- Ruta `/test/tree-select` en `src/App.tsx`

---

## Pendientes funcionales post-backend

### 1. Mapeo de campos del backend a `FlexibleElement`
**Archivo:** `EvidenceAssignmentService.getElementsByModel()`

El mapeo actual asume:
```ts
nombre: item.nombre ?? null,
nomenclatura: item.nomenclatura ?? null,
descripcion: item.descripcion ?? null,
tipo: item.tipo ?? '',
```

Si el backend retorna nombres de campos diferentes (ej. `name`, `code`, `description`), todos los elementos aparecerán sin etiqueta visible en el TreeSelect, ya que el componente usa `element.nombre ?? element.descripcion ?? element.tipo` como fallback.

**Acción:** Verificar la respuesta real de `GET /api/estructura/elementos?modelo_estructura_id={id}` y ajustar el mapeo.

---

### 2. Proceso seleccionado sin `modelo_estructura_id`
**Archivo:** `EvidenceAssignment.tsx`, `useEffect` carga de elementos

Si un `Process` tiene `modelo_estructura_id: undefined` (puede ocurrir con procesos legacy), el efecto hace early return y deja `flexElements = []`. El TreeSelect muestra el mensaje de carga indefinidamente porque `loading = false` y `elements = []`.

**Acción:** En el empty state del dropdown, distinguir entre "no hay proceso elegido", "cargando" y "modelo sin elementos". Actualmente los tres casos caen en "Cargando elementos...".

---

### 3. Mensaje de vacío ambiguo en el TreeSelect
**Archivo:** `src/Components/Ui/Forms/TreeSelect.tsx`

El empty state del modo navegación muestra:
- `elements.length === 0` → "Cargando elementos..."
- `elements.length > 0 && visibleNodes.length === 0` → "No hay elementos disponibles"

El primer mensaje es engañoso cuando `loading = false` y sencillamente no hay datos. Debería mostrarse un mensaje diferente según el contexto (ej. "Seleccione un proceso primero" cuando no hay proceso activo).

La prop `loading` ya existe en `TreeSelectProps` — usarla para distinguir los tres estados:
- `loading = true` → spinner
- `loading = false && elements = []` → "Sin elementos para este modelo"
- `loading = false && elements > 0 && visibleNodes = []` → "No hay elementos en este nivel"

---

### 4. `criteriaLoading` incluye carga de catálogos (usuarios/roles)
**Archivo:** `EvidenceAssignment.tsx`

```ts
criteriaLoading: criteriaState.loading || catalogState.loading,
```

Si la carga de usuarios o roles falla silenciosamente (sin `throw`), `catalogState.loading` podría quedar en `true` e impedir que el formulario sea visible. Verificar que los `catch` de `loadUsers()` y `loadRoles()` siempre invoquen `setCatalogState(prev => ({ ...prev, loading: false }))`.

---

### 5. UX: el modo cascada puede no ser intuitivo para usuarios no familiarizados
El `TreeSelect` en `mode="select"` muestra primero los nodos rama (dimensiones) con una flecha `›` para navegar. Los usuarios acostumbrados al `MultiSelect` flat esperan ver las opciones directamente.

**Sugerencia post-go-live:** Evaluar agregar un texto de ayuda debajo del componente indicando "Haga clic en una dimensión para ver sus elementos" o mostrar el conteo de hojas disponibles en el trigger cuando hay muchos niveles.

---

## Resumen de archivos afectados

| Archivo | Estado |
|---|---|
| `src/Services/EvidenceAssignmentService.ts` | 3 bloques mock activos — revertir |
| `src/Test/mockFlexibleElements.ts` | Eliminar |
| `src/Test/TreeSelectTestPage.tsx` | Eliminar |
| `src/App.tsx` | Eliminar ruta `/test/tree-select` |
| `src/Components/Ui/Forms/TreeSelect.tsx` | Bug `z-9999` corregido; empty states pendientes |
| `src/Pages/EvidenceAssignment/EvidenceAssignment.tsx` | Verificar flujo de carga sin mock |
