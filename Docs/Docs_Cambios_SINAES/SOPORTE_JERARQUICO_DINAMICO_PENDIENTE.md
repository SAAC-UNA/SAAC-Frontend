# Soporte Jerárquico Dinámico — Modelo Flexible SINAES

## Problema actual

El modelo flexible usa una tabla `ELEMENTO` con autorreferencia (`padre_id`) que permite crear **N niveles de profundidad**. Sin embargo, todos los componentes de usuario final tratan los elementos como **lista plana de hojas**:

- **Asignar elementos**: MultiSelect plano con todas las hojas mezcladas
- **Buscar pautas**: CustomSelect plano sin navegación por nivel
- **Mis Entregas / Solicitudes**: tablas que muestran solo el nombre del elemento, sin ruta jerárquica
- **Aprobación de bloques**: no soporta el modelo flexible en absoluto

Esto funciona aceptablemente con 1–3 niveles y pocas hojas. Con estructuras de 7+ niveles o cientos de hojas, la UX se degrada: el usuario no puede navegar la jerarquía ni sabe a qué rama pertenece cada hoja.

---

## Principio de diseño

El sistema debe ser **agnóstico a la cantidad de niveles**. Un ciclo de acreditación puede tener 1, 2, 7 o 20 niveles de profundidad. Ningún componente debe asumir un número fijo de niveles.

---

## 1. Utilidad compartida `buildElementTree`

**Archivo:** `src/Utils/elementTreeUtils.ts`

Convierte la lista plana del backend en un árbol anidado y provee funciones auxiliares:

```ts
interface ElementTreeNode extends FlexibleElement {
  children: ElementTreeNode[];
  depth: number;
  path: string; // "Área > Sub-área > ... > Pauta"
}

// Lista plana → árbol
function buildElementTree(elements: FlexibleElement[]): ElementTreeNode[]

// Obtener la ruta completa de un elemento (recorriendo padre_id hacia arriba)
function getElementPath(elementId: number, elements: FlexibleElement[]): string

// Obtener todas las hojas descendientes de un nodo
function getLeafDescendants(nodeId: number, tree: ElementTreeNode[]): ElementTreeNode[]

// Obtener ancestros de un elemento (para breadcrumb)
function getAncestors(elementId: number, elements: FlexibleElement[]): FlexibleElement[]
```

**Impacto:** todas las pantallas que hoy hacen `parentIds = new Set(...)` usarían esta utilidad en su lugar.

---

## 2. Componente `TreeSelect`

**Archivo:** `src/Components/Ui/Forms/TreeSelect.tsx`

Selector jerárquico que permite navegar niveles dinámicamente. Dos variantes:

### 2.1 Variante cascada (selección de hojas para asignar)

```
┌─────────────────────────────────────────────────────┐
│ Nivel 1                     Nivel 2                 │
│ ┌─────────────────┐        ┌──────────────────────┐ │
│ │ ▸ Área Académica │───────│ ▸ Gestión Docente    │ │
│ │   Área Administ. │       │   Investigación      │ │
│ │   Vinculación    │       │   Extensión          │ │
│ └─────────────────┘        └──────────────────────┘ │
│                                                     │
│ Hojas seleccionables:                               │
│ ☑ Pauta 3.1.1   ☑ Pauta 3.1.2   ☐ Pauta 3.1.3    │
└─────────────────────────────────────────────────────┘
```

- Los nodos intermedios son navegables (click para expandir el siguiente nivel)
- Solo las **hojas** (nodos sin hijos) son seleccionables con checkbox
- El número de columnas de navegación se adapta a la profundidad del árbol
- En móvil: colapsa a un drill-down donde cada nivel reemplaza al anterior (back button)

### 2.2 Variante filtro (búsqueda / explorador)

```
┌───────────────────────────────────────┐
│ Filtrar por nivel:                    │
│ [Área Académica ▼] > [Gestión ▼] > * │
│                                       │
│ (muestra todas las hojas bajo         │
│  la rama seleccionada)                │
└───────────────────────────────────────┘
```

- Cada nivel genera un dropdown dinámico con las opciones de ese nivel
- La cantidad de dropdowns se determina por la profundidad del árbol (no hardcodeada)
- Seleccionar un nodo intermedio filtra todos los descendientes
- El último nivel puede dejarse en "Todos" para ver todas las hojas de esa rama

### Props comunes

```ts
interface TreeSelectProps {
  elements: FlexibleElement[];      // lista plana del backend
  value: number[];                  // IDs seleccionados
  onChange: (ids: number[]) => void;
  mode: 'select' | 'filter';       // cascada vs filtro
  multiple?: boolean;               // multi o single select
  showPath?: boolean;               // mostrar breadcrumb en chips seleccionados
  placeholder?: string;
}
```

---

## 3. Breadcrumb / path en tablas

En todas las tablas que muestran elementos (`ElementAssignmentsTable`, `ManageExtensionRequestsTable`, búsqueda), la columna del elemento debería mostrar **la ruta completa**:

```
Antes:   "Plan de Estudios"
Después: "Área Académica > Gestión Docente > Plan de Estudios"
```

### Opciones de implementación

**Opción A — Frontend calcula el path** con `getElementPath()` a partir de la lista plana cacheada. Requiere tener todos los elementos cargados.

**Opción B — Backend incluye el path** en la respuesta de asignaciones/solicitudes. Más eficiente si los elementos no se cargan completos. Ejemplo:

```json
{
  "elemento_asignacion_id": 42,
  "element": {
    "elemento_id": 15,
    "nombre": "Plan de Estudios",
    "path": "Área Académica > Gestión Docente > Plan de Estudios"
  }
}
```

**Recomendación:** Opción B para tablas de lectura (menos datos en frontend), Opción A para pantallas de asignación (donde ya se cargaron todos los elementos).

---

## 4. Pantallas a modificar

### 4.1 Asignación de Evidencias (`EvidenceAssignment.tsx`)

| Actual | Propuesto |
|---|---|
| `MultiSelect` plano con hojas | `TreeSelect` modo `select` con navegación por niveles |
| `elementOptions` filtra hojas | Eliminado — `TreeSelect` lo maneja internamente |
| Tabla de resumen muestra nombre | Tabla muestra path completo |

### 4.2 Búsqueda de Criterios/Pautas (`EvidenceSearchFiltersPanel.tsx`)

| Actual | Propuesto |
|---|---|
| Un solo `CustomSelect` "Pauta" | `TreeSelect` modo `filter` con cascada de niveles |
| Filtra solo por hoja | Permite filtrar por cualquier nivel intermedio (mostrando todos los descendientes) |

### 4.3 Mis Entregas (`ElementAssignmentsTable.tsx`)

| Actual | Propuesto |
|---|---|
| Columna "Pauta" con nombre directo | Columna muestra path completo o al menos padre + nombre |
| Sin agrupación visual | Opcionalmente: agrupar filas por rama del árbol |

### 4.4 Solicitudes de Ampliación (tablas)

| Actual | Propuesto |
|---|---|
| Muestra nombre del elemento | Muestra path del elemento |

### 4.5 Aprobación de Bloques (`BlockApproval.tsx`)

| Actual | Propuesto |
|---|---|
| Solo soporta modelo tradicional | Bifurcar con `isFlexible`: árbol de elementos con aprobación por nodo/hoja |
| Criterios → Evidencias fijo | Elementos → descendientes dinámico |

Este es el refactor más grande. La lógica de aprobación debería funcionar con la jerarquía de elementos: aprobar un nodo implica que todos sus hijos están aprobados, o bien la aprobación es individual por hoja.

### 4.6 Mis Solicitudes (`MyExtensionRequestsPage.tsx`)

| Actual | Propuesto |
|---|---|
| Solo lee `evidencia_asignacion` | Lee `elemento_asignacion` como fallback cuando `evidencia_asignacion` es null |
| No muestra contexto del elemento | Muestra nombre/path del elemento |

---

## 5. Backend — campo `path` calculado

Para evitar que el frontend recorra `padre_id` en cada fila de una tabla, el backend puede incluir un campo `path` precalculado:

### Opción A — Accessor en el modelo `StructureElement`

```php
// app/Models/StructureElement.php
public function getPathAttribute(): string
{
    $parts = [$this->nombre ?? $this->nomenclatura ?? "Elemento {$this->elemento_id}"];
    $current = $this;
    while ($current->padre_id !== null) {
        $current = $current->parent; // belongsTo self
        $parts[] = $current->nombre ?? $current->nomenclatura ?? '';
    }
    return implode(' > ', array_reverse($parts));
}
```

### Opción B — Columna `path` materializada

Agregar una columna `path TEXT` a la tabla `ELEMENTO` que se recalcula al crear/mover elementos. Más eficiente en lectura, pero requiere mantener consistencia al reorganizar el árbol.

**Recomendación:** Opción A (accessor) primero por simplicidad. Si el rendimiento es problema con árboles muy grandes, migrar a Opción B.

---

## 6. Orden de implementación sugerido

| Paso | Componente | Dependencias |
|---|---|---|
| 1 | `elementTreeUtils.ts` | Ninguna |
| 2 | `TreeSelect` componente | Paso 1 |
| 3 | Backend accessor `path` en `StructureElement` | Ninguna (paralelo con 1–2) |
| 4 | Asignación de Evidencias → usar `TreeSelect` | Pasos 1, 2 |
| 5 | Búsqueda → filtros con `TreeSelect` modo filter | Pasos 1, 2 |
| 6 | Tablas → mostrar path (Mis Entregas, Solicitudes) | Paso 1 o 3 |
| 7 | `MyExtensionRequestsPage` → soporte `elemento_asignacion` | Menor, independiente |
| 8 | `BlockApproval` → soporte flexible completo | Pasos 1, 2, 3 + endpoints backend nuevos |

---

## 7. Lo que YA funciona sin cambios

- El modelo de datos (`ELEMENTO` con `padre_id`) soporta N niveles
- El backend retorna todos los elementos con `padre_id` intacto
- La vista de administración de modelos (`StructureElementsView`) ya renderiza el árbol con indentación
- Los endpoints de asignación y solicitudes de ampliación funcionan con cualquier hoja del árbol
- El flag `isFlexible` ya se propaga correctamente en todos los módulos adaptados
