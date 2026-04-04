# Correcciones y Mejoras — Módulos Modelo Flexible

## Justificación

Tras completar la adaptación de los 4 módulos principales (Asignación de Evidencias, Búsqueda Criterios/Pautas, Mis Entregas, Gestionar Solicitudes), se detectaron deficiencias que afectaban la integridad de datos y la optimización del sistema. Se corrigieron en esta iteración.

---

## Cambios realizados

### 1. Export Excel/PDF incompleto en Búsqueda (`EvidenceSearchService.ts`)

**Problema:** `exportExcel()` y `exportPDF()` no enviaban `proceso_id`, `dimension_id`, `componente_id` ni `elemento_id` al backend. En modo flexible, siempre golpeaban el endpoint tradicional (`/estructura/evidencias/export/*`) en vez del flexible (`/estructura/elementos/export/*`).

**Solución:**
- Bifurcación por `is_flexible`: si es flexible, llama a `/estructura/elementos/export/{excel|pdf}`
- Modelo tradicional ahora envía todos los filtros que `search()` ya enviaba
- Helpers extraídos: `_buildTraditionalExportParams()`, `_exportFlexible()`, `_downloadBlob()` para eliminar duplicación

### 2. Paginación truncada en Solicitudes (`ManageExtensionRequestsPage.tsx`)

**Problema:** `per_page: 100` hardcodeado. Si existían más de 100 solicitudes, se perdían silenciosamente.

**Solución:** Nuevo helper `fetchAllPages()` que itera todas las páginas del endpoint paginado (100 por página) usando `meta.last_page` para determinar cuántas páginas consultar.

### 3. Endpoint `mis-ciclos` integrado (`EvidenceAssignmentService.ts`, `MyEvidenceAssignmentsPage.tsx`)

**Problema:** `MyEvidenceAssignmentsPage` y `ManageExtensionRequestsPage` llamaban a `getAllProcesses()` (retorna todos los procesos del sistema) solo para resolver 1–2 nombres de ciclo.

**Solución:**
- Nuevo método `getUserCycles(userId)` → `GET /api/usuarios/{id}/mis-ciclos`
- `MyEvidenceAssignmentsPage` usa `getUserCycles` con fallback por inferencia desde asignaciones
- `ManageExtensionRequestsPage` eliminó `loadProcesses()` completamente; usa `process.nombre` que ya viene en las solicitudes vía `WITH_BASE`
- Nuevo tipo `UserCycle` en `EvidenceAssignment.ts`

### 4. Tipo `ExtensionRequestTypes.ts` — campo `nombre` en process

**Problema:** El tipo `process` dentro de `evidencia_asignacion` y `elemento_asignacion` no tenía el campo `nombre`, aunque el backend lo retorna. Esto impedía usarlo como label del ciclo en el selector.

**Solución:** Agregado `nombre?: string` a ambas relaciones `process`.

### 5. MD de Asignación de Evidencias actualizado

La sección "Pendiente" mencionaba módulos que ya fueron implementados (Búsqueda, Mis Entregas, Solicitudes). Se tacharon como resueltos y se redactó el pendiente del selector de proceso para reflejar la estrategia del contexto global futuro.

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/Services/EvidenceSearchService.ts` | Export bifurcado + filtros completos |
| `src/Pages/ExtensionRequest/ManageExtensionRequestsPage.tsx` | `fetchAllPages` + eliminó `loadProcesses` |
| `src/Pages/MyEvidence/MyEvidenceAssignmentsPage.tsx` | Usa `getUserCycles` en vez de `getAllProcesses` |
| `src/Services/EvidenceAssignmentService.ts` | Nuevo método `getUserCycles()` |
| `src/Types/EvidenceAssignment.ts` | Nuevo tipo `UserCycle` |
| `src/Types/ExtensionRequestTypes.ts` | Campo `nombre?` en `process` |
| `Docs/Docs_Cambios_SINAES/ASIGNACION_EVIDENCIAS_MODELO_FLEXIBLE.md` | Pendientes actualizados |

---

## Rama y Commit

- **Rama:** `Cambios_Modulos_Existentes`
- **Commit:** `CORRECCIONES_MODELO_FLEXIBLE`
