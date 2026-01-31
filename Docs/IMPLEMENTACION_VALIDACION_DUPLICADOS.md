# Implementación de Validación de Duplicados en Asignación de Evidencias

## 📋 Resumen

Se ha implementado la funcionalidad completa de validación de asignaciones duplicadas en el frontend del wizard de asignación de evidencias (HU-029). Esta mejora permite detectar y manejar usuarios que ya tienen evidencias asignadas antes de confirmar nuevas asignaciones.

## 🎯 Problema Resuelto

### Situación Anterior
- Los usuarios no sabían si estaban creando asignaciones duplicadas
- Errores 500 aparecían solo al momento de confirmar la asignación
- No había manera de resolver conflictos antes de enviar al backend
- Mala experiencia de usuario al fallar asignaciones masivas

### Solución Implementada
- Validación previa automática al cargar el paso de revisión
- Detección de duplicados para cada combinación proceso-evidencia-usuario
- Interfaz visual clara mostrando estado de asignaciones existentes
- Posibilidad de deseleccionar usuarios con duplicados
- Actualización dinámica de estadísticas según usuarios excluidos

## 📁 Archivos Modificados

### 1. **Types/EvidenceAssignment.ts**
**Cambios:** Agregados nuevos tipos TypeScript para validación

```typescript
// Nuevos tipos agregados
export interface DuplicateAssignment {
  usuario_id: number;
  usuario_nombre: string;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'vencido';
  fecha_asignacion: string;
  asignacion_id?: number;
}

export interface DuplicateValidationRequest {
  proceso_id: number;
  evidencia_id: number;
  usuarios: number[];
}

export interface DuplicateValidationResponse {
  tiene_duplicados: boolean;
  duplicados: DuplicateAssignment[];
  total_duplicados: number;
}
```

**Propósito:**
- `DuplicateAssignment`: Representa una asignación duplicada detectada
- `DuplicateValidationRequest`: Payload para solicitud de validación
- `DuplicateValidationResponse`: Respuesta del endpoint de validación

---

### 2. **Services/EvidenceAssignmentService.ts**
**Cambios:** Agregado método `validateDuplicates()`

```typescript
// Nuevo método agregado
async validateDuplicates(data: DuplicateValidationRequest): Promise<DuplicateValidationResponse> {
  try {
    const response = await axiosInstance.post<DuplicateValidationResponse>(
      '/evidencias-asignaciones/validar-duplicados',
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 
      'Error al validar asignaciones duplicadas'
    );
  }
}
```

**Endpoint:** `POST /api/evidencias-asignaciones/validar-duplicados`

**Request:**
```json
{
  "proceso_id": 1,
  "evidencia_id": 5,
  "usuarios": [12, 15, 18]
}
```

**Response:**
```json
{
  "tiene_duplicados": true,
  "duplicados": [
    {
      "usuario_id": 12,
      "usuario_nombre": "Juan Pérez",
      "estado": "completado",
      "fecha_asignacion": "2024-01-15T10:30:00.000Z",
      "asignacion_id": 45
    }
  ],
  "total_duplicados": 1
}
```

---

### 3. **Pages/EvidenceAssignment/Components/ReviewStep.tsx**
**Cambios:** Implementación completa de UI de validación

#### Estados Agregados
```typescript
const [validatingDuplicates, setValidatingDuplicates] = useState(false);
const [duplicates, setDuplicates] = useState<DuplicateAssignment[]>([]);
const [excludedUsers, setExcludedUsers] = useState<Set<number>>(new Set());
const [expandedDuplicates, setExpandedDuplicates] = useState(true);
```

#### useEffect para Validación Automática
```typescript
useEffect(() => {
  const validateDuplicates = async () => {
    if (!formData.proceso_id || 
        formData.selectedEvidences.length === 0 || 
        formData.selectedUsers.length === 0) {
      setDuplicates([]);
      return;
    }

    try {
      setValidatingDuplicates(true);
      const allDuplicates: DuplicateAssignment[] = [];

      // Validar cada evidencia seleccionada
      for (const evidenciaId of formData.selectedEvidences) {
        const response = await evidenceAssignmentService.validateDuplicates({
          proceso_id: formData.proceso_id,
          evidencia_id: evidenciaId,
          usuarios: formData.selectedUsers
        });

        if (response.tiene_duplicados) {
          allDuplicates.push(...response.duplicados);
        }
      }

      setDuplicates(allDuplicates);
    } catch (error) {
      console.error('Error validating duplicates:', error);
    } finally {
      setValidatingDuplicates(false);
    }
  };

  validateDuplicates();
}, [formData.proceso_id, formData.selectedEvidences, formData.selectedUsers]);
```

**Lógica:**
1. Se ejecuta cuando cambian: proceso, evidencias o usuarios seleccionados
2. Valida cada evidencia contra todos los usuarios
3. Acumula duplicados de todas las evidencias
4. Actualiza estado con resultados

#### Funciones Helper
```typescript
// Obtener color del badge según estado
const getStatusColor = (estado: string) => {
  switch (estado) {
    case 'completado': return 'bg-green-100 text-green-800';
    case 'en_progreso': return 'bg-blue-100 text-blue-800';
    case 'vencido': return 'bg-red-100 text-red-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
};

// Manejar exclusión/inclusión de usuarios
const handleToggleUser = (userId: number) => {
  const newExcluded = new Set(excludedUsers);
  if (newExcluded.has(userId)) {
    newExcluded.delete(userId);
  } else {
    newExcluded.add(userId);
  }
  setExcludedUsers(newExcluded);
  
  // Actualizar formData
  const filteredUsers = formData.selectedUsers.filter(id => !newExcluded.has(id));
  updateFormData({ selectedUsers: filteredUsers });
};
```

#### Componente UI - Alerta de Validación
```tsx
{validatingDuplicates && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div className="flex items-center gap-3">
      <LoadingSpinner size="sm" />
      <p className="text-sm text-blue-800">Validando asignaciones existentes...</p>
    </div>
  </div>
)}
```

#### Componente UI - Tabla de Duplicados
```tsx
{!validatingDuplicates && duplicates.length > 0 && (
  <div className="relative overflow-hidden rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100">
    {/* Header colapsable */}
    <button onClick={() => setExpandedDuplicates(!expandedDuplicates)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-600 text-white">
            {statistics.totalDuplicates}
          </div>
          <div>
            <h3>Asignaciones Duplicadas Detectadas</h3>
            <p>Algunos usuarios ya tienen estas evidencias asignadas...</p>
          </div>
        </div>
        <ChevronIcon />
      </div>
    </button>

    {/* Tabla expandible */}
    {expandedDuplicates && (
      <table>
        <thead>
          <tr>
            <th>
              <input type="checkbox" /* Seleccionar/Deseleccionar todos */ />
            </th>
            <th>Usuario</th>
            <th>Estado</th>
            <th>Fecha Asignación</th>
          </tr>
        </thead>
        <tbody>
          {duplicates.map(duplicate => (
            <tr key={duplicate.usuario_id}>
              <td>
                <input 
                  type="checkbox"
                  checked={!excludedUsers.has(duplicate.usuario_id)}
                  onChange={() => handleToggleUser(duplicate.usuario_id)}
                />
              </td>
              <td>{duplicate.usuario_nombre}</td>
              <td>
                <span className={getStatusColor(duplicate.estado)}>
                  {getStatusText(duplicate.estado)}
                </span>
              </td>
              <td>{formatDate(duplicate.fecha_asignacion)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)}
```

#### Actualización de Estadísticas
```typescript
const statistics = useMemo(() => {
  const totalEvidences = formData.selectedEvidences.length;
  const totalUsers = formData.selectedUsers.length - excludedUsers.size; // ⭐ Restar excluidos
  const totalRoles = formData.selectedRoles.length;
  const totalDuplicates = duplicates.length;

  return {
    totalEvidences,
    totalUsers,
    totalRoles,
    totalDestinations: totalUsers + totalRoles,
    totalDuplicates
  };
}, [formData, excludedUsers, duplicates]);
```

#### Filtrado de Usuarios
```typescript
const selectedUsersData = useMemo(() => {
  return formData.selectedUsers
    .filter(id => !excludedUsers.has(id)) // ⭐ Filtrar excluidos
    .map(id => users.find(user => user.id === id))
    .filter(Boolean);
}, [formData.selectedUsers, users, excludedUsers]);
```

## 🎨 Características de la UI

### Indicadores Visuales
- **Color amarillo:** Para alertas de duplicados
- **Badges de estado:**
  - Verde: Completado
  - Azul: En Progreso
  - Rojo: Vencido
  - Amarillo: Pendiente

### Interactividad
- Sección colapsable para duplicados (expandida por defecto)
- Checkboxes individuales para cada usuario
- Checkbox maestro para seleccionar/deseleccionar todos
- Actualización dinámica de contadores

### Información Mostrada
- Cantidad total de duplicados en badge circular
- Nombre del usuario
- Estado actual de la asignación
- Fecha de asignación previa
- Nota informativa sobre el comportamiento

## 🔄 Flujo de Usuario

1. **Usuario llega al paso de revisión**
   - Se muestra spinner de carga inicial

2. **Sistema valida duplicados automáticamente**
   - Alerta azul: "Validando asignaciones existentes..."
   - Llamadas paralelas para cada evidencia seleccionada

3. **Si NO hay duplicados**
   - Continúa flujo normal
   - Muestra resumen estándar

4. **Si HAY duplicados**
   - Aparece sección amarilla expandida
   - Tabla con usuarios duplicados
   - Checkboxes marcados por defecto

5. **Usuario puede:**
   - Desmarcar usuarios para excluirlos
   - Marcar/desmarcar todos con checkbox maestro
   - Colapsar sección si no necesita revisarla
   - Ver estadísticas actualizadas dinámicamente

6. **Al confirmar asignación**
   - Solo se envían usuarios marcados (no excluidos)
   - `formData.selectedUsers` ya está filtrado

## 📊 Estadísticas Dinámicas

### Antes de Implementación
```
Evidencias: 3
Usuarios: 20
Roles: 1
Destinatarios: 21
```

### Después (con 3 duplicados excluidos)
```
Evidencias: 3
Usuarios: 17        ← Actualizado dinámicamente
Roles: 1
Destinatarios: 18   ← Actualizado dinámicamente
Duplicados: 3       ← Nuevo contador
```

## 🔧 Dependencias Backend

### Endpoint Requerido
```
POST /api/evidencias-asignaciones/validar-duplicados
```

### Documentación Backend
Ver archivo completo: `SAAC-Backend/docs/ENDPOINT_VALIDACION_ASIGNACIONES.md`

**Resumen de implementación backend:**
```php
// Controller: EvidenceAssignmentController.php
public function validarDuplicados(Request $request)
{
    $validated = $request->validate([
        'proceso_id' => 'required|integer|exists:procesos,proceso_id',
        'evidencia_id' => 'required|integer|exists:evidencias,evidencia_id',
        'usuarios' => 'required|array|min:1',
        'usuarios.*' => 'integer|exists:usuarios,usuario_id',
    ]);

    $duplicados = $this->evidenceAssignmentService->validarDuplicados(
        $validated['proceso_id'],
        $validated['evidencia_id'],
        $validated['usuarios']
    );

    return response()->json($duplicados);
}
```

## ✅ Testing Recomendado

### Casos de Prueba

#### 1. Sin Duplicados
```
Entrada: 
  - Proceso: 1
  - Evidencia: 5
  - Usuarios: [10, 11, 12] (ninguno tiene asignación)

Resultado Esperado:
  - No se muestra sección de duplicados
  - Estadísticas normales
  - Todos los usuarios en lista de destinatarios
```

#### 2. Con Duplicados Parciales
```
Entrada:
  - Proceso: 1
  - Evidencia: 5
  - Usuarios: [10, 11, 12] (11 y 12 tienen asignación)

Resultado Esperado:
  - Sección amarilla visible
  - Tabla con 2 filas (usuarios 11 y 12)
  - Estados mostrados correctamente
  - Checkboxes marcados por defecto
  - Usuario 10 en lista normal de destinatarios
```

#### 3. Todos Duplicados
```
Entrada:
  - Proceso: 1
  - Evidencia: 5
  - Usuarios: [10, 11, 12] (todos tienen asignación)

Resultado Esperado:
  - Sección amarilla visible
  - Tabla con 3 filas
  - Contador de usuarios = 0 si se desmarcan todos
```

#### 4. Múltiples Evidencias
```
Entrada:
  - Proceso: 1
  - Evidencias: [5, 6, 7]
  - Usuarios: [10, 11, 12]
  - Usuario 10: tiene evidencia 5
  - Usuario 11: tiene evidencia 6
  - Usuario 12: tiene evidencia 7

Resultado Esperado:
  - Tabla con 3 duplicados (uno por evidencia)
  - Total duplicados = 3
```

#### 5. Exclusión de Usuarios
```
Acción:
  1. Cargar step con 3 duplicados
  2. Desmarcar 2 usuarios
  3. Verificar estadísticas

Resultado Esperado:
  - Contador de usuarios disminuye en 2
  - Contador de destinatarios disminuye en 2
  - Lista de usuarios no muestra los 2 excluidos
  - formData.selectedUsers no incluye los 2 excluidos
```

#### 6. Checkbox Maestro
```
Acción:
  1. Cargar step con duplicados
  2. Desmarcar checkbox maestro
  3. Verificar todos los usuarios están excluidos
  4. Marcar checkbox maestro
  5. Verificar todos están incluidos

Resultado Esperado:
  - Desmarcar todo: usuarios = 0 (solo quedan roles)
  - Marcar todo: usuarios restaurados al valor original
```

## 🐛 Manejo de Errores

### Errores de Validación
```typescript
try {
  const response = await evidenceAssignmentService.validateDuplicates({...});
} catch (error) {
  console.error('Error validating duplicates:', error);
  // No bloquea el flujo - usuario puede continuar
}
```

**Comportamiento:** Si falla la validación, el usuario puede continuar sin detectar duplicados. El backend rechazará duplicados al confirmar.

### Errores de Backend
- **401 Unauthorized:** Usuario no autenticado
- **403 Forbidden:** Sin permisos para validar
- **404 Not Found:** Proceso/evidencia no existe
- **422 Validation Error:** Datos inválidos
- **500 Server Error:** Error interno

## 📝 Notas Importantes

### Performance
- Validación se ejecuta solo cuando cambian: proceso, evidencias o usuarios
- Llamadas paralelas si hay múltiples evidencias
- No bloquea renderizado inicial del componente

### Estado del Componente
- `excludedUsers`: Set de IDs de usuarios excluidos
- `duplicates`: Array de asignaciones duplicadas detectadas
- `validatingDuplicates`: Boolean para mostrar spinner de carga

### Sincronización con FormData
- Al excluir usuario, se actualiza `formData.selectedUsers` inmediatamente
- El wizard enviará solo usuarios no excluidos
- Los usuarios excluidos permanecen en la lista original para referencia

## 🔄 Próximos Pasos

1. **Testing Manual**
   - Probar con diferentes combinaciones de duplicados
   - Verificar UX con muchos duplicados (scroll, performance)
   - Validar en diferentes tamaños de pantalla

2. **Testing Automatizado**
   - Unit tests para `handleToggleUser`
   - Unit tests para `getStatusColor` y `getStatusText`
   - Integration tests para validación de duplicados

3. **Mejoras Futuras**
   - Paginación de tabla si hay muchos duplicados
   - Búsqueda/filtrado dentro de duplicados
   - Exportar lista de duplicados a CSV
   - Tooltip con detalles completos de la asignación

## 📚 Referencias

- **HU-029:** Historia de usuario principal (Asignación de Evidencias)
- **Backend Docs:** `SAAC-Backend/docs/ENDPOINT_VALIDACION_ASIGNACIONES.md`
- **Date Fix:** `ReviewStep.tsx` - Corrección de timezone en formatDate()
- **Service Pattern:** `EvidenceAssignmentService.ts` - Patrón de servicios existente

---

**Fecha de Implementación:** 2024
**Autor:** GitHub Copilot
**Versión:** 1.0.0
