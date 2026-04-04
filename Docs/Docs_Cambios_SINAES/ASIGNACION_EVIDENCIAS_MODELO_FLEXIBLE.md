# Cambio: Asignación de Entregables — Soporte Modelo Flexible

## Contexto

El sistema originalmente operaba con una jerarquía **fija** (`Dimensión → Componente → Criterio → Evidencia`) correspondiente al modelo SINAES 2018 (`tipo = 'tradicional'`).

El nuevo modelo (`tipo = 'elemento_flexible'`) usa una jerarquía **dinámica**: una sola tabla `ELEMENTO` con autorreferencia mediante `padre_id`, permitiendo crear tantos niveles como se necesite.

Ambos modelos **coexisten** en el sistema. El Product Owner solicitó conservar el comportamiento anterior para los procesos existentes e incorporar el nuevo para futuros ciclos de acreditación.

---

## Flujo jerárquico del nuevo modelo

```
StructureModel (tipo = 'elemento_flexible')
    ↓  se asocia en
AccreditationCycle (modelo_estructura_id)
    ↓  se asocia en
Process (ciclo_acreditacion_id)
    ↓  determina en el frontend
isFlexible = proceso.modelo_estructura_tipo === 'elemento_flexible'
```

Al crear el ciclo se elige el modelo. El proceso hereda el tipo de modelo implícitamente a través del ciclo.

---

## Archivos modificados

### `src/Types/EvidenceAssignment.ts`

- **`Process`**: se agregaron `modelo_estructura_id?: number` y `modelo_estructura_tipo?: string` para transportar el tipo de modelo del ciclo asociado al proceso.
- **`EvidenceAssignmentFormData`**: se agregó `selectedElements: number[]` para almacenar los IDs de elementos seleccionados en modo flexible (equivalente a `selectedEvidences` en modo tradicional).

### `src/Services/EvidenceAssignmentService.ts`

- **`getAllProcesses()`**: actualizado para mapear `accreditation_cycle.modelo_estructura` y exponer `modelo_estructura_id` y `modelo_estructura_tipo` en cada proceso.
- **`getElementsByModel(modeloId)`** *(nuevo)*: obtiene los elementos de estructura de un modelo flexible desde `GET /api/estructura/elementos?modelo_estructura_id={id}`. Mapea la respuesta al tipo `FlexibleElement`.
- **`createElementAssignment(data)`** *(nuevo)*: crea una asignación de elemento en `POST /api/elementos-asignaciones`. Equivalente flexible de `createAssignment()`.

### `src/Pages/EvidenceAssignment/EvidenceAssignment.tsx`

- Se importó `FlexibleElement` y `Process`.
- **`formData`**: inicializado con `selectedElements: []`.
- **`processes`**: nuevo estado `Process[]` que almacena todos los procesos cargados.
- **`flexElements`**: nuevo estado `FlexibleElement[]` con los elementos del modelo flexible del proceso seleccionado.
- **`selectedProcess`**: memo derivado del `proceso_id` seleccionado en `formData`.
- **`isFlexible`**: booleano derivado — `selectedProcess?.modelo_estructura_tipo === 'elemento_flexible'`.
- **Carga de datos**: se guarda `processesData` en el estado `processes`. Se agregó un `useEffect` separado que llama a `getElementsByModel()` cuando `isFlexible` es `true` y cambia el `modelo_estructura_id`.
- **`updateFormData()`**: al cambiar `proceso_id`, limpia automáticamente `selectedCriteria`, `selectedEvidences`, `selectedElements` y `excludedUsers` para evitar selecciones inconsistentes entre modelos.
- **`elementOptions`**: memo que filtra del árbol de elementos solo las **hojas** (elementos sin hijos) y que estén activos — son los únicos asignables.
- **`assignmentTableRows`**: bifurcado para construir filas desde `selectedElements` (flexible) o `selectedEvidences` (tradicional).
- **`validate()`**: bifurcado — en modo flexible valida `selectedElements`, en modo tradicional valida `selectedEvidences`.
- **`handleConfirmedSubmit()`**: bifurcado — en modo flexible itera sobre `selectedElements` y llama a `createElementAssignment()`; en modo tradicional mantiene el comportamiento original con `createAssignment()`.
- **`EvidenceAssignmentViewProps`**: se agregaron `isFlexible: boolean` y `elementOptions: MultiSelectOption[]`.

### `src/Pages/EvidenceAssignment/Components/EvidenceAssignmentView.tsx`

- Se desestructuraron `isFlexible` y `elementOptions` de las props.
- **Contadores**: el contador de "Criterios" y "Evidencias" se reemplaza por "Elementos" cuando `isFlexible = true`.
- **Selectores de asignación**: bifurcados con un `{isFlexible ? ... : ...}`:
  - **Flexible**: un único `MultiSelect` con `elementOptions` (elementos hoja del modelo).
  - **Tradicional**: los dos `MultiSelect` existentes (Criterios → Evidencias), sin cambios.
- **Mensaje de tabla vacía**: dinámico según el modo.

---

## Endpoints de backend utilizados

| Operación | Endpoint | Modelo |
|---|---|---|
| Listar procesos con modelo | `GET /api/estructura/procesos` | Ambos |
| Listar elementos del modelo | `GET /api/estructura/elementos?modelo_estructura_id={id}` | Flexible |
| Crear asignación de evidencia | `POST /api/evidencias-asignaciones` | Tradicional |
| Crear asignación de elemento | `POST /api/elementos-asignaciones` | Flexible |

---

## Patrón de bifurcación

El mismo patrón `isFlexible` se usa en `CreateImprovementCommitment.tsx` (módulo de tu compañera) y es la convención establecida para todos los módulos que deban soportar ambos modelos:

```typescript
const isFlexible = proceso.modelo_estructura_tipo === 'elemento_flexible';

if (isFlexible) {
  // lógica nueva: elementos dinámicos
} else {
  // lógica original: criterios + evidencias
}
```

---

## Pendiente

- Agregar un **selector de proceso visible** en la vista `EvidenceAssignmentView`. Actualmente el proceso se autoselecciona al primero de la lista. El `isFlexible` funciona correctamente, pero el usuario no puede cambiar de proceso manualmente desde la pantalla.
- Módulos adicionales que requieren el mismo cambio: **Búsqueda de Criterios** (`/evidencias/busqueda-avanzada`), **Mis Entregas** (`/mis-evidencias-asignadas`) y posiblemente **Solicitudes de Ampliación**.
