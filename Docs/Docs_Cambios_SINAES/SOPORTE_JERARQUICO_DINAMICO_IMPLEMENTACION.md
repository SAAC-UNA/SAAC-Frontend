# Implementación: Soporte Jerárquico Dinámico — Modelo Flexible

## Contexto

El modelo flexible usa una tabla `ELEMENTO` con autorreferencia (`padre_id`) que permite N niveles de profundidad. Anteriormente, todas las pantallas trataban los elementos como lista plana de hojas, lo cual degradaba la UX con estructuras profundas.

Esta implementación agrega soporte jerárquico en los módulos: **Entregables** (Asignar, Mis Entregas, Buscar) y **Ampliación** (Gestionar Solicitudes, Mis Solicitudes).

---

## Archivos creados

### 1. `src/Utils/elementTreeUtils.ts`

Utilidad compartida que convierte la lista plana del backend en un árbol anidado. Agnóstica a la cantidad de niveles.

**Funciones exportadas:**

| Función | Descripción |
|---|---|
| `buildElementTree(elements)` | Lista plana → árbol de `ElementTreeNode[]` con `children`, `depth` y `path` calculados |
| `getElementPath(elementId, elements)` | Recorre `padre_id` hacia arriba y retorna la ruta completa como string (`"Área > Sub > Pauta"`) |
| `getLeafDescendants(nodeId, tree)` | Todas las hojas descendientes de un nodo |
| `getAncestors(elementId, elements)` | Ancestros desde la raíz hasta el padre directo |
| `getMaxDepth(tree)` | Profundidad máxima del árbol |
| `isLeaf(elementId, elements)` | Si un elemento es hoja (ningún otro lo referencia como padre) |
| `getLeafElements(elements)` | Solo las hojas de una lista plana |
| `getChildrenOf(nodeId, tree)` | Hijos directos de un nodo (o raíces si `nodeId` es null) |
| `getNodesAtDepth(depth, tree)` | Nodos a una profundidad específica |

**Tipo principal:**
```ts
interface ElementTreeNode extends FlexibleElement {
  children: ElementTreeNode[];
  depth: number;
  path: string; // "Área > Sub-área > ... > Pauta"
}
```

---

### 2. `src/Components/Ui/Forms/TreeSelect.tsx`

Componente de selección jerárquica con dos modos de operación.

#### Modo `select` (cascada con checkboxes)

Usado en **Asignar Entregables**. Permite navegar la jerarquía nivel por nivel:

- **Breadcrumb** de navegación: `Inicio › Área Académica › Gestión Docente`
- **Nodos intermedios**: click para navegar al siguiente nivel (muestra conteo de hojas seleccionadas)
- **Hojas**: checkbox para seleccionar/deseleccionar
- **Búsqueda**: filtra hojas por nombre/nomenclatura/descripción mostrando el path completo
- **Seleccionar todo**: selecciona/deselecciona todas las hojas visibles
- **Chips**: muestra los elementos seleccionados con su path completo y botón de remover
- Portal rendering para evitar overflow en contenedores

#### Modo `filter` (dropdowns encadenados)

Usado en **Buscar Entregables**. Genera dropdowns dinámicos según la profundidad:

- Cada nivel del árbol genera un `<select>` con las opciones de ese nivel
- La cantidad de dropdowns se determina automáticamente por la profundidad del árbol
- Seleccionar un nodo en un nivel actualiza las opciones del siguiente
- El label de cada dropdown usa el `tipo` del primer nodo de ese nivel

**Props:**
```ts
interface TreeSelectProps {
  elements: FlexibleElement[];      // Lista plana del backend
  value: number[];                  // IDs seleccionados
  onChange: (ids: number[]) => void;
  mode: 'select' | 'filter';
  multiple?: boolean;
  showPath?: boolean;               // Mostrar path en chips
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  required?: boolean;
}
```

---

## Archivos modificados

### 3. Asignar Entregables

**`src/Pages/EvidenceAssignment/EvidenceAssignment.tsx`**
- Se importa `getElementPath` de `elementTreeUtils`
- Se agrega `flexElements` a las props de la vista (`EvidenceAssignmentViewProps`)
- La tabla de resumen ahora muestra el **path completo** del elemento en lugar de solo nomenclatura + descripción

**`src/Pages/EvidenceAssignment/Components/EvidenceAssignmentView.tsx`**
- Se importa `TreeSelect`
- El bloque `{isFlexible ? ...}` ahora renderiza `TreeSelect` modo `select` en lugar de `MultiSelect` plano
- Se destructura `flexElements` de las props (reemplaza `elementOptions`)
- El `onChange` pasa los IDs directamente (sin conversión string ↔ number)

**Antes:**
```tsx
<MultiSelect
  options={elementOptions}           // Lista plana de hojas
  value={formData.selectedElements.map(String)}
  onChange={(vals) => updateFormData({ selectedElements: vals.map(Number) })}
/>
```

**Después:**
```tsx
<TreeSelect
  elements={flexElements}            // Todos los elementos (árbol completo)
  value={formData.selectedElements}
  onChange={(ids) => updateFormData({ selectedElements: ids })}
  mode="select"
  multiple
  showPath
/>
```

---

### 4. Buscar Entregables

**`src/Pages/EvidenceSearch/EvidenceSearchPage.tsx`**
- Se pasa `flexElements` al componente `EvidenceSearchFiltersPanel`

**`src/Pages/EvidenceSearch/Components/EvidenceSearchFiltersPanel.tsx`**
- Se importa `TreeSelect` y `FlexibleElement`
- Se agrega `flexElements: FlexibleElement[]` a las props
- El bloque `{isFlexible ? ...}` ahora renderiza `TreeSelect` modo `filter` en lugar de un `CustomSelect` de "Pauta"
- Se eliminan `handlePautaChange` y `opcionesPauta` (ya no necesarios)

**Antes:**
```tsx
<CustomSelect label="Pauta" options={opcionesPauta} onChange={handlePautaChange} />
```

**Después:**
```tsx
<TreeSelect
  elements={flexElements}
  value={pautaId ? [parseInt(pautaId, 10)] : []}
  onChange={(ids) => { ... }}
  mode="filter"
  label="Filtrar por nivel"
/>
```

---

### 5. Gestionar Solicitudes (modal de detalles)

**`src/Pages/ExtensionRequest/Components/ManageExtensionRequestDetailsModal.tsx`**

- Se agrega bloque para mostrar info del **elemento asignado** cuando no hay evidencia tradicional:
  - Nombre del elemento y tipo
  - Actúa como fallback: solo se muestra si `evidencia_asignacion?.evidencia` no existe y `elemento_asignacion` sí
- La fecha límite actual ahora usa fallback: `evidencia_asignacion.fecha_limite` → `elemento_asignacion.fecha_limite`
- El separador se renderiza si hay evidencia **o** elemento

> **Nota:** Este cambio no depende de `isFlexible` sino de la presencia de datos en cada solicitud individual.

---

### 6. Mis Solicitudes

**`src/Pages/MyExtensionRequest/Components/ExtensionRequestsTable.tsx`**

- La columna "Motivo" ahora muestra debajo del texto de motivo:
  - La **nomenclatura** de la evidencia (si hay `evidencia_asignacion.evidencia`)
  - O el **nombre del elemento** (si hay `elemento_asignacion`)
  - Si no hay ninguno, no muestra nada adicional

**`src/Pages/MyExtensionRequest/Components/ExtensionRequestDetailsModal.tsx`**

- La fecha límite actual usa fallback: `evidencia_asignacion.fecha_limite` → `elemento_asignacion.fecha_limite`

> **Nota:** Estos cambios tampoco dependen de `isFlexible` — funcionan por presencia de datos.

---

## Estrategia de activación

| Módulo | Controlado por | Comportamiento sin datos |
|---|---|---|
| Asignar Entregables | `isFlexible` (flag del proceso) | TreeSelect no se renderiza; se muestra flujo tradicional |
| Buscar Entregables | `isFlexible` (flag del proceso) | TreeSelect no se renderiza; se muestra cascada DCC |
| Mis Entregas | `isFlexible` + tabla separada | `ElementAssignmentsTable` no se monta |
| Gestionar Solicitudes (modal) | Presencia de `elemento_asignacion` | Bloques no se renderizan (optional chaining) |
| Mis Solicitudes (tabla + modal) | Presencia de `elemento_asignacion` | Info adicional no se muestra |

**Ningún cambio rompe funcionalidad existente del modelo tradicional.**

---

## Pendiente — Requiere backend

### Accessor `path` en modelo `StructureElement`

Para que las tablas de lectura (Mis Entregas, Solicitudes) muestren el path completo sin necesidad de cargar todos los elementos en frontend:

```php
// app/Models/StructureElement.php
public function getPathAttribute(): string
{
    $parts = [$this->nombre ?? $this->nomenclatura ?? "Elemento {$this->elemento_id}"];
    $current = $this;
    while ($current->padre_id !== null) {
        $current = $current->parent;
        $parts[] = $current->nombre ?? $current->nomenclatura ?? '';
    }
    return implode(' > ', array_reverse($parts));
}
```

### Relación `element` en `elemento_asignacion` para solicitudes

Para que las tablas de solicitudes muestren el nombre/tipo del elemento, el backend debe incluir la relación `element` al cargar `elemento_asignacion`:

```php
// En el controller de solicitudes
$solicitud->load('elementoAsignacion.element');
```
