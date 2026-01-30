# 📋 Requerimientos de Paginación para el Backend

## 🎯 Objetivo

Implementar paginación del lado del servidor en todos los endpoints que devuelven listas de datos para resolver problemas críticos de rendimiento que afectan la escalabilidad del sistema SAAC.

---

## 🚨 Problema Actual

### Situación Crítica

Actualmente, **todos los endpoints de listado** devuelven la **totalidad de registros** en una sola respuesta, sin filtrado ni paginación del servidor. Esto causa:

- ⏱️ **Tiempos de carga inaceptables**: 5-10+ segundos con datasets medianos
- 🔴 **Transferencia excesiva de datos**: 2-5 MB por request
- 💾 **Consumo alto de memoria**: 200+ MB en el navegador
- ❌ **Sistema NO escalable**: Colapsará con datos reales en producción

### Proyección con Datos Reales

Con **10 carreras** activas en el sistema (escenario conservador):

| Entidad | Registros Actuales | Proyección Real | Tiempo de Carga Actual | Impacto |
|---------|-------------------|-----------------|------------------------|---------|
| **Usuarios** | ~50 | **500+** | 15-20s | 🔴 CRÍTICO |
| **Criterios** | 348 | **696+** | 30-40s | 🔴 CRÍTICO |
| **Evidencias** | ~100 | **1,400+** | 30-50s | 🔴 CRÍTICO |
| **Procesos** | ~10 | **100+** | 10-15s | 🟡 ALTO |
| **Árbol Estructural** | ~100 nodos | **1,000+** nodos | >60s (Timeout) | 🔴 CATASTRÓFICO |

---

## 📦 Endpoints que Requieren Paginación

### PRIORIDAD 1: CRÍTICA (Implementar URGENTE)

#### 1. Usuarios
```
GET /api/admin/users
```

#### 2. Evidencias
```
GET /api/estructura/evidencias
```

#### 3. Criterios
```
GET /api/estructura/criterios
```

#### 4. Árbol Estructural
```
GET /api/estructura/tree
```

### PRIORIDAD 2: ALTA (Siguiente Sprint)

#### 5. Procesos de Acreditación
```
GET /api/estructura/procesos
```

#### 6. Roles
```
GET /api/roles
```

---

## 🔧 Especificación Técnica

### Formato de Request

Todos los endpoints de listado deben aceptar los siguientes parámetros de query string:

| Parámetro | Tipo | Default | Validación | Descripción |
|-----------|------|---------|------------|-------------|
| `page` | integer | 1 | min:1 | Número de página actual |
| `per_page` | integer | 10 | min:1, max:100 | Registros por página |
| `search` | string | "" | nullable | Término de búsqueda |

**Parámetros adicionales específicos por endpoint:**

- **Usuarios**: `status` (active/inactive), `role_id`
- **Evidencias**: `criterio_id`, `estado_evidencia_id`
- **Criterios**: `componente_id`, `activo`
- **Procesos**: `career_campus_id`, `tipo_proceso`

### Formato de Response

#### Estructura Estándar de Paginación

```json
{
  "data": [
    {
      // Estructura del recurso (sin cambios)
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total": 348,
    "last_page": 35,
    "from": 1,
    "to": 10
  },
  "links": {
    "first": "http://127.0.0.1:8000/api/criterios?page=1",
    "last": "http://127.0.0.1:8000/api/criterios?page=35",
    "prev": null,
    "next": "http://127.0.0.1:8000/api/criterios?page=2"
  }
}
```

#### ⚠️ IMPORTANTE: Mantener Estructura de Datos

Los objetos dentro del array `data` deben **mantener exactamente el mismo formato** que actualmente devuelven. Solo cambia el wrapper de paginación.

---

## 💻 Implementación en Laravel

### Template Base para Todos los Endpoints

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\YourModel;
use App\Http\Resources\YourResource;

class YourController extends Controller
{
    public function index(Request $request)
    {
        // 1. VALIDACIÓN DE PARÁMETROS
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'search' => 'string|nullable',
            // ... otros filtros específicos
        ]);

        $perPage = $validated['per_page'] ?? 10;
        $search = $validated['search'] ?? '';

        // 2. QUERY BASE CON EAGER LOADING
        $query = YourModel::query()
            ->with(['relation1', 'relation2']); // ⚠️ Evitar N+1 queries

        // 3. APLICAR FILTROS
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('field1', 'like', "%{$search}%")
                  ->orWhere('field2', 'like', "%{$search}%");
            });
        }

        // Filtros adicionales específicos
        if (!empty($validated['specific_filter'])) {
            $query->where('specific_field', $validated['specific_filter']);
        }

        // 4. ORDENAMIENTO
        $query->orderBy('created_at', 'desc');

        // 5. PAGINACIÓN
        $results = $query->paginate($perPage);

        // 6. RETORNAR CON RESOURCE
        return YourResource::collection($results);
    }
}
```

---

## 📝 Implementaciones Específicas

### 1. Usuarios (`/api/admin/users`)

```php
<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Models\User;
use App\Http\Resources\UserResource;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'search' => 'string|nullable',
            'status' => 'in:active,inactive',
            'role_id' => 'integer|exists:roles,id'
        ]);

        $perPage = $validated['per_page'] ?? 10;
        $search = $validated['search'] ?? '';

        $query = User::query()
            ->with(['roles', 'permissions']);

        // Búsqueda
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('cedula', 'like', "%{$search}%");
            });
        }

        // Filtro por estado
        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        // Filtro por rol
        if (!empty($validated['role_id'])) {
            $query->whereHas('roles', function($q) use ($validated) {
                $q->where('roles.id', $validated['role_id']);
            });
        }

        // Ordenar por fecha de creación (más recientes primero)
        $query->orderBy('created_at', 'desc');

        $users = $query->paginate($perPage);

        return UserResource::collection($users);
    }
}
```

**Casos de prueba:**
```bash
# Paginación básica
GET /api/admin/users?page=1&per_page=10

# Búsqueda
GET /api/admin/users?search=juan&per_page=20

# Filtro por estado
GET /api/admin/users?status=active&per_page=15

# Combinación
GET /api/admin/users?search=prof&status=active&page=2&per_page=25
```

---

### 2. Criterios (`/api/estructura/criterios`)

```php
<?php

namespace App\Http\Controllers\Structure;

use Illuminate\Http\Request;
use App\Models\Criterio;
use App\Http\Resources\CriterionResource;

class CriterionController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'search' => 'string|nullable',
            'componente_id' => 'integer|exists:componentes,componente_id',
            'activo' => 'boolean'
        ]);

        $perPage = $validated['per_page'] ?? 20; // 20 criterios por defecto

        $query = Criterio::query()
            ->with(['componente', 'evidencias']);

        // Búsqueda
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function($q) use ($search) {
                $q->where('nomenclatura', 'like', "%{$search}%")
                  ->orWhere('descripcion', 'like', "%{$search}%");
            });
        }

        // Filtro por componente
        if (isset($validated['componente_id'])) {
            $query->where('componente_id', $validated['componente_id']);
        }

        // Filtro por estado activo
        if (isset($validated['activo'])) {
            $query->where('activo', $validated['activo']);
        }

        // Ordenar por componente y nomenclatura
        $query->orderBy('componente_id')
              ->orderBy('nomenclatura');

        $criterios = $query->paginate($perPage);

        return CriterionResource::collection($criterios);
    }
}
```

**Casos de prueba:**
```bash
# Listar todos con paginación
GET /api/estructura/criterios?page=1&per_page=20

# Buscar por nomenclatura
GET /api/estructura/criterios?search=C1.1

# Filtrar por componente
GET /api/estructura/criterios?componente_id=2&per_page=50

# Solo criterios activos
GET /api/estructura/criterios?activo=1&per_page=30
```

---

### 3. Evidencias (`/api/estructura/evidencias`)

```php
<?php

namespace App\Http\Controllers\Structure;

use Illuminate\Http\Request;
use App\Models\Evidencia;
use App\Http\Resources\EvidenceResource;

class EvidenceController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'search' => 'string|nullable',
            'criterio_id' => 'integer|exists:criterios,criterio_id',
            'estado_evidencia_id' => 'integer|exists:estados_evidencia,estado_evidencia_id',
            'activo' => 'boolean'
        ]);

        $perPage = $validated['per_page'] ?? 20;

        $query = Evidencia::query()
            ->with(['criterio', 'estadoEvidencia']);

        // Búsqueda
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function($q) use ($search) {
                $q->where('nomenclatura', 'like', "%{$search}%")
                  ->orWhere('descripcion', 'like', "%{$search}%");
            });
        }

        // Filtro por criterio
        if (isset($validated['criterio_id'])) {
            $query->where('criterio_id', $validated['criterio_id']);
        }

        // Filtro por estado
        if (isset($validated['estado_evidencia_id'])) {
            $query->where('estado_evidencia_id', $validated['estado_evidencia_id']);
        }

        // Filtro por activo
        if (isset($validated['activo'])) {
            $query->where('activo', $validated['activo']);
        }

        // Ordenar por criterio y nomenclatura
        $query->orderBy('criterio_id')
              ->orderBy('nomenclatura');

        $evidencias = $query->paginate($perPage);

        return EvidenceResource::collection($evidencias);
    }
}
```

**Casos de prueba:**
```bash
# Listar todas
GET /api/estructura/evidencias?page=1&per_page=20

# Buscar
GET /api/estructura/evidencias?search=E1.1.1

# Filtrar por criterio
GET /api/estructura/evidencias?criterio_id=5&per_page=30

# Filtrar por estado
GET /api/estructura/evidencias?estado_evidencia_id=1&per_page=25
```

---

### 4. Procesos (`/api/estructura/procesos`)

```php
<?php

namespace App\Http\Controllers\Structure;

use Illuminate\Http\Request;
use App\Models\Proceso;
use App\Http\Resources\ProcessResource;

class ProcessController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'career_campus_id' => 'integer|exists:carreras_sedes,carrera_sede_id',
            'tipo_proceso' => 'string|in:autoevaluacion,mejora'
        ]);

        $perPage = $validated['per_page'] ?? 15;

        $query = Proceso::query()
            ->with(['cicloAcreditacion.carreraSede.carrera', 'cicloAcreditacion.carreraSede.sede']);

        // Filtro por carrera-sede
        if (isset($validated['career_campus_id'])) {
            $query->whereHas('cicloAcreditacion', function($q) use ($validated) {
                $q->where('carrera_sede_id', $validated['career_campus_id']);
            });
        }

        // Filtro por tipo de proceso
        if (isset($validated['tipo_proceso'])) {
            $query->where('tipo_proceso', $validated['tipo_proceso']);
        }

        // Ordenar por fecha de creación
        $query->orderBy('created_at', 'desc');

        $procesos = $query->paginate($perPage);

        return ProcessResource::collection($procesos);
    }
}
```

---

### 5. 🌲 CASO ESPECIAL: Árbol Estructural

Este es el **MÁS CRÍTICO** porque actualmente carga todo el árbol completo (Universidad → Sedes → Facultades → Carreras) en una sola llamada.

#### Estrategia: Lazy Loading Jerárquico

En lugar de paginación tradicional, implementar **carga perezosa por niveles**.

```php
<?php

namespace App\Http\Controllers\Structure;

use Illuminate\Http\Request;
use App\Models\{Universidad, Sede, Facultad, Carrera};
use App\Http\Resources\{UniversidadResource, SedeResource, FacultadResource, CarreraResource};

class StructureTreeController extends Controller
{
    /**
     * Obtener el árbol estructural con lazy loading
     */
    public function getTree(Request $request)
    {
        $validated = $request->validate([
            'lazy_load' => 'boolean',
            'parent_id' => 'integer|nullable',
            'type' => 'string|nullable|in:universidad,sede,facultad,carrera'
        ]);

        $lazyLoad = $validated['lazy_load'] ?? false;
        $parentId = $validated['parent_id'] ?? null;
        $type = $validated['type'] ?? null;

        // MODO LEGACY: Árbol completo (DEPRECAR después de migración frontend)
        if (!$lazyLoad) {
            return $this->getFullTreeLegacy();
        }

        // MODO NUEVO: Lazy Loading
        
        // Sin parent_id: retornar solo nivel raíz (universidades)
        if (!$parentId) {
            $universidades = Universidad::where('activo', 1)
                ->orderBy('nombre')
                ->get();
            
            return UniversidadResource::collection($universidades);
        }

        // Con parent_id: retornar hijos directos según el tipo
        return $this->loadChildren($type, $parentId);
    }

    /**
     * Cargar hijos de un nodo específico
     */
    private function loadChildren(string $type, int $parentId)
    {
        switch ($type) {
            case 'universidad':
                $sedes = Sede::where('universidad_id', $parentId)
                    ->where('activo', 1)
                    ->orderBy('nombre')
                    ->get();
                return SedeResource::collection($sedes);

            case 'sede':
                $facultades = Facultad::where('sede_id', $parentId)
                    ->where('activo', 1)
                    ->orderBy('nombre')
                    ->get();
                return FacultadResource::collection($facultades);

            case 'facultad':
                $carreras = Carrera::where('facultad_id', $parentId)
                    ->where('activo', 1)
                    ->orderBy('nombre')
                    ->get();
                return CarreraResource::collection($carreras);

            default:
                return response()->json(['error' => 'Invalid type'], 400);
        }
    }

    /**
     * LEGACY: Árbol completo (mantener temporalmente para retrocompatibilidad)
     * 
     * @deprecated Será removido después de que el frontend migre a lazy loading
     */
    private function getFullTreeLegacy()
    {
        $universidades = Universidad::with([
            'sedes' => function($query) {
                $query->where('activo', 1)->with([
                    'facultades' => function($q) {
                        $q->where('activo', 1)->with([
                            'carreras' => function($q2) {
                                $q2->where('activo', 1);
                            }
                        ]);
                    }
                ]);
            }
        ])
        ->where('activo', 1)
        ->get();

        return response()->json([
            'data' => UniversidadResource::collection($universidades)
        ]);
    }
}
```

**Casos de prueba:**
```bash
# Nivel 1: Solo universidades (raíz)
GET /api/estructura/tree?lazy_load=true

# Nivel 2: Sedes de una universidad específica
GET /api/estructura/tree?lazy_load=true&parent_id=1&type=universidad

# Nivel 3: Facultades de una sede
GET /api/estructura/tree?lazy_load=true&parent_id=5&type=sede

# Nivel 4: Carreras de una facultad
GET /api/estructura/tree?lazy_load=true&parent_id=12&type=facultad

# Legacy (deprecar después): Árbol completo
GET /api/estructura/tree
```

---

## ✅ Checklist de Implementación

Para cada endpoint implementado, verificar:

- [ ] **Acepta parámetros estándar**: `page`, `per_page`, `search`
- [ ] **Validación de parámetros**: Tipos correctos, límites, existencia en BD
- [ ] **Eager Loading**: Usa `with()` para evitar N+1 queries
- [ ] **Búsqueda funcional**: Campos relevantes, case-insensitive
- [ ] **Límite de per_page**: Máximo 100 registros
- [ ] **Ordenamiento lógico**: Por fecha, nombre, o jerarquía
- [ ] **Response correcto**: Formato de paginación estándar
- [ ] **Resource usado**: Transforma datos consistentemente
- [ ] **Probado con dataset grande**: >100 registros
- [ ] **Performance**: Query time <100ms en promedio

---

## 🧪 Testing Recomendado

### Tests Unitarios

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;

class UserPaginationTest extends TestCase
{
    /** @test */
    public function it_paginates_users_correctly()
    {
        User::factory()->count(50)->create();

        $response = $this->getJson('/api/admin/users?page=1&per_page=10');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'meta' => ['current_page', 'per_page', 'total', 'last_page'],
                'links'
            ])
            ->assertJsonCount(10, 'data');
    }

    /** @test */
    public function it_searches_users_by_name()
    {
        User::factory()->create(['name' => 'Juan Pérez']);
        User::factory()->create(['name' => 'María López']);

        $response = $this->getJson('/api/admin/users?search=juan');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment(['name' => 'Juan Pérez']);
    }

    /** @test */
    public function it_limits_per_page_to_maximum()
    {
        $response = $this->getJson('/api/admin/users?per_page=200');

        $response->assertStatus(422); // Validation error
    }
}
```

### Tests de Performance

```php
/** @test */
public function it_loads_paginated_users_in_under_100ms()
{
    User::factory()->count(1000)->create();

    $startTime = microtime(true);
    $response = $this->getJson('/api/admin/users?page=1&per_page=10');
    $executionTime = (microtime(true) - $startTime) * 1000;

    $response->assertStatus(200);
    $this->assertLessThan(100, $executionTime, "Query took {$executionTime}ms");
}
```

---

## 📊 Métricas Esperadas Post-Implementación

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Tiempo de respuesta** | 2-10s | <200ms | **95-98%** ✅ |
| **Datos transferidos** | 500KB-5MB | 10-50KB | **90-98%** ✅ |
| **Queries SQL** | N+1 (cientos) | Optimizadas (<10) | **>90%** ✅ |
| **Memoria servidor** | Alta | Baja | **>70%** ✅ |
| **Escalabilidad** | Limitada (100 usuarios) | Ilimitada | **♾️** ✅ |

---

## 🚀 Plan de Migración

### Fase 1: Backend (Backend Team)
1. ✅ Implementar paginación en endpoints críticos
2. ✅ Mantener endpoints legacy temporalmente (retrocompatibilidad)
3. ✅ Escribir tests
4. ✅ Documentar cambios en Postman/Swagger

### Fase 2: Frontend (Frontend Team)
1. ⏳ Actualizar servicios para usar paginación
2. ⏳ Modificar componentes de tablas
3. ⏳ Implementar lazy loading en árbol estructural
4. ⏳ Testing end-to-end

### Fase 3: Cleanup
1. 🔜 Deprecar endpoints legacy
2. 🔜 Remover código sin usar
3. 🔜 Monitoreo de performance

---

## 📞 Contacto

Para dudas o aclaraciones sobre la implementación, contactar al equipo de frontend o revisar este documento.

**Fecha de creación**: 21 de noviembre de 2025  
**Versión**: 1.0  
**Autor**: Equipo Frontend SAAC-UNA
