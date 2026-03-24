# Estados Dinámicos de Criterio — Pendiente de Implementación Backend

## Contexto C:\Users\ian19\OneDrive\Documents\Ian\SAAC\SAAC-Frontend\src\Pages\EvidenceSearch\Components\EvidenceSearchResultsTable.tsx

La tabla de búsqueda de evidencias (`EvidenceSearchPage`) muestra actualmente dos niveles de estado:

| Nivel | Campo | Quién lo cambia | Estado actual |
|---|---|---|---|
| **Asignación** (`EVIDENCIA_ASIGNACION.estado`) | `estado_asignacion` en tabla hija | El propio responsable manualmente | ✅ Implementado |
| **Evidencia** (`EVIDENCIA.estado_evidencia_id`) | Admin/Superusuario manualmente | Manual | ✅ Implementado |
| **Criterio** (derivado de asignaciones) | Calculado automáticamente | ❌ **No implementado** |

---

## Qué falta: Estado derivado del criterio

El estado del criterio **no existe hoy** en el backend. Debe derivarse automáticamente del conjunto de asignaciones de todas las evidencias que pertenecen a ese criterio, **dentro de un proceso específico**.

### Lógica de prioridad (de mayor a menor):

```
1. Si alguna asignación del criterio tiene estado "Vencido"   → criterio = vencido
2. Si alguna asignación del criterio tiene estado "En Progreso" → criterio = en_progreso
3. Si TODAS las asignaciones están "Completado"               → criterio = completado
4. Si todas están "Pendiente" o no hay asignaciones           → criterio = pendiente
```

### Por qué no se puede almacenar en CRITERIO directamente

El estado del criterio **depende del proceso activo**. La misma evidencia puede tener asignaciones en diferentes procesos con estados distintos. Guardar `estado` en la tabla `CRITERIO` sería ambiguo sin contexto de proceso.

---

## Enfoque recomendado al backend: Calculado dinámicamente (sin migración)

En lugar de agregar una columna persistente, calcular el estado del criterio como campo virtual en la query de `filterEvidences` del `EvidenceService`.

**Ventajas:**
- Sin nueva migración
- Sin Observer (riesgo de N+1 o ciclos)
- Sin desincronización entre estado almacenado y real
- Siempre refleja el estado actual

### Implementación sugerida en EvidenceService::filterEvidences

```php
// Agregar subconsulta que deriva el estado del criterio
->selectRaw("
    CASE
        WHEN EXISTS (
            SELECT 1 FROM EVIDENCIA_ASIGNACION ea2
            JOIN EVIDENCIA e2 ON ea2.evidencia_id = e2.evidencia_id
            WHERE e2.criterio_id = EVIDENCIA.criterio_id
              AND ea2.estado = 'Vencido'
        ) THEN 'vencido'
        WHEN EXISTS (
            SELECT 1 FROM EVIDENCIA_ASIGNACION ea2
            JOIN EVIDENCIA e2 ON ea2.evidencia_id = e2.evidencia_id
            WHERE e2.criterio_id = EVIDENCIA.criterio_id
              AND ea2.estado = 'En Progreso'
        ) THEN 'en_progreso'
        WHEN NOT EXISTS (
            SELECT 1 FROM EVIDENCIA_ASIGNACION ea2
            JOIN EVIDENCIA e2 ON ea2.evidencia_id = e2.evidencia_id
            WHERE e2.criterio_id = EVIDENCIA.criterio_id
              AND ea2.estado != 'Completado'
        ) AND EXISTS (
            SELECT 1 FROM EVIDENCIA_ASIGNACION ea2
            JOIN EVIDENCIA e2 ON ea2.evidencia_id = e2.evidencia_id
            WHERE e2.criterio_id = EVIDENCIA.criterio_id
        ) THEN 'completado'
        ELSE 'pendiente'
    END AS criterio_estado
")
```

### Devolución en EvidenceResource

```php
// En EvidenceResource::toArray()
'criterion' => [
    'id'          => $this->criterio_id,
    'nomenclatura' => ...,
    'descripcion'  => ...,
    'estado'       => $this->criterio_estado ?? 'pendiente', // campo calculado
],
```

---

## Qué debe adaptar el frontend (cuando el backend lo implemente)

### 1. Tipo `EvidenceSearchResult` en `EvidenceSearchTypes.ts`

Agregar `estado` al objeto `criterion` anidado:

```typescript
// En EvidenceSearchResult.criterion (o criterio_estado como campo de primer nivel)
criterio_estado?: EvidencePublicationStatus;  // mismo tipo, mismos valores
```

### 2. Columna "Estado Criterio" en `EvidenceSearchResultsTable.tsx`

Los mapas de colores ya existen (`EVIDENCE_STATUS_LABEL`, `EVIDENCE_STATUS_COLORS`). Solo se necesita:
- Agregar una columna nueva en la tabla padre con `item.criterio_estado`
- O reemplazar/complementar la columna de "Estado" actual (que hoy es el estado de la evidencia)

### 3. Verificar nombre del campo en `mapBackendToFrontend` de `EvidenceSearchService.ts`

```typescript
criterio_estado: backendData.criterion?.estado ?? backendData.criterio_estado ?? 'pendiente',
```

---

## Estado actual en el frontend

| Elemento | Estado |
|---|---|
| Mapa de colores `EVIDENCE_STATUS_COLORS` | ✅ Listo (mismos valores aplican) |
| Mapa de etiquetas `EVIDENCE_STATUS_LABEL` | ✅ Listo |
| Tipo `AssignmentStatus` | ✅ Listo |
| Columna "Estado" en tabla padre (por evidencia) | ✅ Implementada |
| Columna "Estado" en tabla hija (por asignación) | ✅ Implementada |
| Columna "Estado Criterio" en tabla padre | ⏳ Pendiente de campo backend |

---

## Resumen para el equipo backend

> El frontend ya maneja la visualización de estados. Solo necesitamos que el endpoint `GET /estructura/evidencias/filter` devuelva el estado derivado del criterio como un campo en la respuesta, ya sea como `criterion.estado` dentro del objeto criterio anidado, o como `criterio_estado` en el nivel raíz de cada evidencia. Los valores deben ser en minúsculas y snake_case: `pendiente`, `en_progreso`, `completado`, `vencido`.
