# Solución Error 403 - Integración HU-008 + HU-029

## Problema
Al intentar subir o listar archivos desde "Mis Evidencias Asignadas", se obtiene un error **403 Forbidden**.

**Causa:** El `FilePolicy` verifica que el usuario tenga una asignación de evidencia en la tabla `EVIDENCIA_ASIGNACION` antes de permitir subir o listar archivos.

## Solución Temporal (Desarrollo)

Comentar las validaciones de autorización en `FileController.php` hasta que tengamos datos de prueba correctos:

### Archivo: `app/Http/Controllers/FileController.php`

#### 1. En el método `index()` (línea ~42):
```php
// Filtrar por evidencia si se proporciona
if ($request->has('evidencia_id')) {
    $evidenciaId = $request->input('evidencia_id');
    
    // TODO: Descomentar cuando tengamos asignaciones de prueba
    // Gate::authorize('viewAny', [File::class, $evidenciaId]);
    
    $query->where('evidencia_id', $evidenciaId);
}
```

#### 2. En el método `store()` - No hay Gate::authorize, pero FilePolicy se aplica automáticamente

La autorización se aplica en `FileService::uploadFile()` o mediante middleware. 

### Alternativa: Modificar FilePolicy temporalmente

**Archivo:** `app/Policies/FilePolicy.php`

#### Método `upload()` (línea ~14):
```php
public function upload(User $user, int $evidenciaId): bool
{
    // TODO: Restaurar validación de asignación en producción
    return true; // Permitir temporalmente para desarrollo
    
    // Original:
    // return EvidenceAssignment::where('usuario_id', $user->usuario_id)
    //     ->where('evidencia_id', $evidenciaId)
    //     ->exists();
}
```

#### Método `viewAny()` (línea ~103):
```php
public function viewAny(User $user, int $evidenciaId): bool
{
    // TODO: Restaurar validación de asignación en producción
    return true; // Permitir temporalmente para desarrollo
    
    // Original:
    // return EvidenceAssignment::where('usuario_id', $user->usuario_id)
    //     ->where('evidencia_id', $evidenciaId)
    //     ->exists();
}
```

## Solución Permanente (Producción)

### Opción A: Crear asignaciones de prueba

Ejecutar este SQL en la base de datos:

```sql
-- Asignar evidencia ID 1 al usuario actual (ajustar IDs según tu BD)
INSERT INTO EVIDENCIA_ASIGNACION (
    evidencia_id, 
    usuario_id, 
    proceso_id,
    fecha_asignacion,
    fecha_limite,
    estado,
    created_at,
    updated_at
) VALUES (
    1,  -- evidencia_id
    1,  -- usuario_id (tu usuario de prueba)
    1,  -- proceso_id
    NOW(),
    DATE_ADD(NOW(), INTERVAL 30 DAY),
    'pendiente',
    NOW(),
    NOW()
);
```

### Opción B: Verificar si el usuario tiene la asignación antes de navegar

En el frontend, solo permitir navegar a subir archivos si el usuario tiene la asignación (ya implementado en `handleUploadFiles`).

## Verificación

Después de aplicar cualquier solución:

1. **Recargar la aplicación** (F5)
2. Ir a "Mis Evidencias Asignadas"
3. Hacer clic en el botón de upload
4. Verificar que cargue correctamente `/evidencias/subir`
5. Verificar que se puedan subir archivos sin error 403

## Recomendación

Para desarrollo: **Modificar FilePolicy** (Opción Alternativa arriba)
Para producción: **Crear asignaciones correctas** en la base de datos

## Archivos Modificados

- ✅ Frontend: `FileService.ts` - Corregida URL duplicada (/api/api/ → /api/)
- ⏳ Backend: `FilePolicy.php` - Necesita modificación temporal o datos de prueba
