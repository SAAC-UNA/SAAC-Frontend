# Auditoría de Arquitectura: Pages/Structure vs Pages/StructureModels

## Resumen ejecutivo

Existen dos carpetas que conviven con responsabilidades superpuestas, código duplicado con comportamientos distintos y violaciones graves al principio de responsabilidad única. La situación más crítica es que **un componente de tabla contiene modales de vista incrustados** y que **la lógica de elementos flexibles está repartida entre ambas carpetas** sin un dueño canónico claro.

---

## Inventario de archivos actuales

```
Pages/Structure/
  StructureList.tsx                    ← Página principal (modo tradicional + modo flexible)
  Components/
    StructureTable.tsx                 ← Tabla elementos tradicionales + Modal de vista (via StructureElementDetail)
    StructureCreateModal.tsx           ← Modal creación elementos tradicionales
    StructureEditModal.tsx             ← Modal edición elementos tradicionales
    StructureElementDetail.tsx         ← Modal de vista de elemento tradicional (componente separado ✓)
    FlexibleElementTable.tsx           ← Tabla de elementos flexibles (UBICACIÓN INCORRECTA)
                                         + Modal de vista de elemento flexible INCRUSTADO (VIOLACIÓN SRP)

Pages/StructureModels/
  StructureModelsPage.tsx              ← Página de gestión de modelos
  Components/
    StructureModelFormModal.tsx        ← Modal crear/editar modelo
    StructureModelDeleteModal.tsx      ← Modal eliminar modelo
    StructureElementFormModal.tsx      ← Modal crear/editar elemento flexible ✓
    StructureElementsView.tsx          ← Vista árbol de elementos (tabla HTML manual, SIN DataTable)
                                         → DUPLICA responsabilidad con FlexibleElementTable.tsx
```

---

## Inconsistencias críticas

### IC-1: Modal de vista incrustado dentro de FlexibleElementTable
**Archivo:** `Pages/Structure/Components/FlexibleElementTable.tsx`

El componente de tabla define y renderiza directamente un `<Modal>` con helpers privados `DetailSectionLabel` y `DetailInfoCell` en el mismo archivo. Esto viola el principio de responsabilidad única y es exactamente el antipatrón que se evitó en `StructureTable.tsx` (que delega en `StructureElementDetail.tsx`).

**Impacto:** Imposible reutilizar el modal de vista de elemento flexible en otros contextos. Testeo imposible en aislamiento.

**Solución:** Extraer a `Pages/StructureModels/Components/FlexibleElementDetail.tsx` siguiendo la misma estructura de `StructureElementDetail.tsx`.

---

### IC-2: FlexibleElementTable está en la carpeta equivocada
**Archivo:** `Pages/Structure/Components/FlexibleElementTable.tsx`

La tabla de elementos flexibles pertenece al dominio de `StructureModels`, no de `Structure`. Su ubicación actual obliga a `StructureList.tsx` a mezclar lógica de dos dominios completamente diferentes.

**Solución:** Mover a `Pages/StructureModels/Components/FlexibleElementTable.tsx`.

---

### IC-3: Duplicación de vista de elementos flexibles con comportamientos distintos
Existen **dos** componentes que muestran elementos de un modelo flexible:

| Característica | `FlexibleElementTable.tsx` (Structure) | `StructureElementsView.tsx` (StructureModels) |
|---|---|---|
| Componente de tabla | `DataTable` ✓ | `<table>` HTML manual ✗ |
| Paginación | Sí ✓ | No ✗ |
| Búsqueda | Por prop `searchQuery` ✓ | Sin búsqueda ✗ |
| Botón "ver detalles" | `TableActionButton action="view"` ✓ | Sin botón de vista ✗ |
| Botón "agregar hijo" | No ✗ | Sí ✓ |
| Colores del design system | Sí ✓ | Parcialmente ✗ |
| Categoría badge | `getBadgeColorForString` ✓ | `bg-azul-una/10 text-azul-una` hardcoded ✗ |
| Estado badge | `BADGE_COLORS` ✓ | `bg-verde/10 text-verde` / `bg-gray-100` (gray de Tailwind) ✗ |

Ninguno es canónico. Hay funcionalidad útil en ambos que no está en el otro.

**Solución:** Unificar en `FlexibleElementTable.tsx` (a mover a StructureModels), integrando el botón "agregar hijo" de `StructureElementsView`. Eliminar `StructureElementsView.tsx` o reducirlo a un wrapper de layout sin lógica de tabla.

---

### IC-4: Colores fuera del design system en StructureElementsView
**Archivo:** `Pages/StructureModels/Components/StructureElementsView.tsx`

Usos encontrados de clases Tailwind genéricas en vez de tokens del sistema:
- `bg-gray-50`, `bg-gray-100` → `bg-gris-light`, `bg-blanco-una-2`
- `border-gray-200`, `border-gray-100` → `border-gris-light`
- `bg-verde/10 text-verde` → `BADGE_COLORS.verde.colorClasses`
- `bg-gray-100 text-gris-una-2` → `BADGE_COLORS.gris.colorClasses`
- `bg-azul-una/10 text-azul-una` en categoría → `getBadgeColorForString(el.categoria)`

---

### IC-5: Toggle activo sin modal de confirmación en StructureElementsView
**Archivos:** `StructureElementsView.tsx` vs `StructureList.tsx`

- Modo **tradicional** (`StructureList`): abre modal de confirmación con texto explicativo detallado antes de cambiar el estado.
- Modo **flexible en StructureElementsView**: llama `toggleActive` directamente sin confirmación alguna.
- Modo **flexible en StructureList** (vía `FlexibleElementTable`): sí tiene modal de confirmación.

Tres comportamientos distintos para la misma acción en el mismo dominio.

---

### IC-6: Inconsistencias en placeholders de inputs

| Campo | StructureCreateModal | StructureEditModal | StructureElementFormModal |
|---|---|---|---|
| Nomenclatura | "Ej: UNA, SEDE-01, FAC-ING" | "Nomenclatura única o identificativa del elemento" | "Ej: P1, C2.1" |
| Nombre | "Nombre descriptivo del elemento" | "Nombre completo y descriptivo" | "Ej: Gestión Institucional" |
| Descripción | "Descripción detallada del elemento" | "Descripción detallada del elemento" ✓ | Sin placeholder |
| Tipo | — | — | "Ej: Pauta, Componente, Criterio…" |

Los placeholders del `StructureEditModal` son genéricos al punto de ser inútiles. El de `StructureElementFormModal` no tiene placeholder en descripción.

---

### IC-7: Inconsistencias en mensajes de éxito

| Acción | StructureCreateModal | StructureEditModal | StructureElementFormModal |
|---|---|---|---|
| Crear | "El elemento X fue creado exitosamente." | — | "El elemento X fue agregado exitosamente." |
| Editar | — | "El elemento X ha sido modificado correctamente." | "El elemento X fue actualizado exitosamente." |
| Título editar | — | "¡Elemento editado exitosamente!" (con ¡) | "Elemento actualizado" (sin ¡) |

Tres verbos distintos para la misma operación: *creado*, *agregado*, *fue creado*.
Tres verbos para edición: *modificado correctamente*, *actualizado exitosamente*.

---

### IC-8: Inconsistencias en mensajes de error (toast)

| Contexto | Mensaje |
|---|---|
| StructureCreateModal | `'Error al crear elemento'` |
| StructureEditModal | `'Error al editar elemento'` |
| StructureElementFormModal | `result.error ?? 'Error al guardar el elemento'` |
| StructureList (flex delete) | `result.error ?? 'Error al eliminar el elemento'` |
| StructureElementsView (toggle) | `result.error ?? 'Error al cambiar el estado'` |

Los modales de modelo tradicional usan mensajes hardcoded; los flexibles priorizan el error del servidor, lo cual es correcto.

---

### IC-9: StructureList.tsx mezcla dos dominios completos
`StructureList.tsx` maneja simultáneamente:
- Estado y lógica para elementos **tradicionales** (delete, toggle, create, edit)
- Estado y lógica para elementos **flexibles** (flexFormModal, flexDeleteModal, flexToggleModal, handleFlexFormConfirm, confirmFlexDelete, confirmFlexToggle)

Resultado: ~500 líneas de estado duplicado para dos dominios distintos. Cuando `isFlexible = true`, toda la lógica del modo tradicional es dead code y viceversa.

---

### IC-10: StructureEditModal.tsx usa `autoClose` en SuccessModal, los otros no
`StructureEditModal.tsx` usa `autoClose={true}` en su `SuccessModal`. `StructureCreateModal.tsx` y `StructureElementFormModal.tsx` no lo hacen. Comportamiento inconsistente al confirmar acciones.

---

### IC-11: Variante del DeleteConfirmationModal no es consistente
- `StructureList` (tradicional): `variant="danger"`, `confirmLabel="Sí, eliminar"`, `cancelLabel="Cancelar"`
- `StructureElementsView` (flexible): Sin `variant`, sin `confirmLabel`, sin `cancelLabel` (usa defaults)
- `StructureList` (flexible delete): No tiene `variant` explícito

---

## Plan de acción

### Fase 1 — Extraer modal de vista de elemento flexible
**Prioridad: Alta | Archivos afectados: 2**

1. Crear `Pages/StructureModels/Components/FlexibleElementDetail.tsx`
   - Extraer el `<Modal>` + helpers `DetailSectionLabel` + `DetailInfoCell` de `FlexibleElementTable.tsx`
   - Reemplazar badges de estado inline por `StatusBadge` con `BADGE_COLORS`
   - Mismo patrón que `StructureElementDetail.tsx`
2. En `FlexibleElementTable.tsx`, importar y usar `FlexibleElementDetail` en lugar del modal incrustado.

---

### Fase 2 — Mover FlexibleElementTable a StructureModels y corregir colores
**Prioridad: Alta | Archivos afectados: 3**

1. Mover `Pages/Structure/Components/FlexibleElementTable.tsx` → `Pages/StructureModels/Components/FlexibleElementTable.tsx`
2. Actualizar todos los imports (actualmente solo `StructureList.tsx`).
3. Corregir colores de `StructureElementsView.tsx`:
   - Reemplazar `bg-gray-*` / `border-gray-*` por tokens del design system
   - Badge categoría → `getBadgeColorForString`
   - Badge estado → `BADGE_COLORS.verde.colorClasses` / `BADGE_COLORS.gris.colorClasses`

---

### Fase 3 — Unificar la vista de tabla de elementos flexibles
**Prioridad: Alta | Archivos afectados: 2**

1. Integrar en `FlexibleElementTable.tsx` el botón `action="add"` (agregar hijo) que actualmente solo tiene `StructureElementsView.tsx`, como prop opcional `onAddChild?: (el: FlexibleElement) => void`.
2. Reemplazar la `<table>` manual de `StructureElementsView.tsx` por `FlexibleElementTable` del paso anterior.
3. `StructureElementsView.tsx` queda reducido a: header de navegación + botón "Agregar raíz" + `<FlexibleElementTable>` + modales de confirmación.

---

### Fase 4 — Desacoplar StructureList.tsx (separar dominios)
**Prioridad: Media | Archivos afectados: 2**

1. Extraer toda la lógica flexible de `StructureList.tsx` a un hook privado o moverla a `StructureModelsPage.tsx`.
   - `flexFormModal`, `flexDeleteModal`, `flexToggleModal` y sus handlers deberían residir en la página de modelos o en un componente contenedor nuevo.
2. `StructureList.tsx` debería manejar **únicamente** el modelo tradicional.
3. La navegación al modelo flexible debe redirigir a la ruta de `StructureModelsPage` con el modelo seleccionado, no al `StructureList` con query param `?modelo=`.

---

### Fase 5 — Estandarizar mensajes de UI
**Prioridad: Media | Archivos afectados: 3**

Adoptar la convención de `StructureElementFormModal` como canónica (sin `¡`, verbo pasado sin "correctamente"):

| Acción | Mensaje título | Mensaje body |
|---|---|---|
| Crear | "Elemento creado" | `El elemento "${name}" fue creado exitosamente.` |
| Editar | "Elemento actualizado" | `El elemento "${name}" fue actualizado exitosamente.` |
| Eliminar | "Elemento eliminado" | `El elemento "${name}" fue eliminado exitosamente.` |

1. Actualizar `StructureCreateModal.tsx`: alinear mensaje de éxito.
2. Actualizar `StructureEditModal.tsx`: cambiar "¡Elemento editado exitosamente!" → "Elemento actualizado", cambiar "ha sido modificado correctamente" → "fue actualizado exitosamente", remover `autoClose`.
3. Actualizar `StructureElementsView.tsx`: unificar mensajes de success modal.

---

### Fase 6 — Estandarizar placeholders y validación
**Prioridad: Baja | Archivos afectados: 3**

Tabla canónica de placeholders:

| Campo | Placeholder canónico |
|---|---|
| Nomenclatura | `Ej: P1, C2.1, FAC-ING` |
| Nombre | `Ej: Gestión Institucional` |
| Descripción | `Descripción detallada del elemento` |
| Tipo (libre) | `Ej: Pauta, Componente, Criterio…` |

1. Actualizar `StructureCreateModal.tsx` y `StructureEditModal.tsx` con los placeholders canónicos.
2. Agregar placeholder de descripción en `StructureElementFormModal.tsx`.

---

### Fase 7 — Estandarizar modal de confirmación de eliminación
**Prioridad: Baja | Archivos afectados: 2**

Todos los `DeleteConfirmationModal` de este dominio deben usar:
- `variant="danger"`
- `confirmLabel="Eliminar"`
- `cancelLabel="Cancelar"`

Actualizar: `StructureElementsView.tsx`, y revisar los calls en `StructureList.tsx` modo flexible.

---

## Estructura objetivo

```
Pages/Structure/
  StructureList.tsx                    ← Solo lógica del modelo tradicional
  Components/
    StructureTable.tsx                 ← Sin cambios
    StructureCreateModal.tsx           ← Mensajes y placeholders corregidos
    StructureEditModal.tsx             ← Mensajes, placeholders y autoClose corregidos
    StructureElementDetail.tsx         ← Sin cambios

Pages/StructureModels/
  StructureModelsPage.tsx              ← Sin cambios estructurales
  Components/
    StructureModelFormModal.tsx        ← Sin cambios
    StructureModelDeleteModal.tsx      ← Sin cambios
    StructureElementFormModal.tsx      ← Placeholder descripción agregado
    FlexibleElementTable.tsx           ← MOVIDO desde Structure, con onAddChild, sin modal incrustado
    FlexibleElementDetail.tsx          ← NUEVO — extraído de FlexibleElementTable
    StructureElementsView.tsx          ← Solo layout + FlexibleElementTable + modales, colores corregidos
```
