# Integracion Backend - Busqueda Avanzada de Evidencias (HU-012)

## Estado Actual

### Backend
✅ **COMPLETAMENTE IMPLEMENTADO**
- Endpoint de filtrado: `GET /api/estructura/evidencias/filter`
- Endpoint de exportacion Excel: `GET /api/estructura/evidencias/export/excel`
- Endpoint de exportacion PDF: `GET /api/estructura/evidencias/export/pdf`
- 21 tests de integracion pasando
- Validacion completa de parametros
- Restricciones por roles implementadas

### Frontend
✅ **MOCKUP FUNCIONAL COMPLETO**
- Interfaz de usuario con todos los filtros
- Tabla de resultados con paginacion
- Botones de exportacion
- Datos mock locales para demostracion

## Pasos para Integracion Completa

### 1. Crear Servicio de API

**Archivo**: `src/Services/EvidenceSearchService.ts`

```typescript
import api from '@/Services/ApiService';
import type {
  EvidenceSearchFilters,
  EvidenceSearchResult,
  SortField,
  SortDirection,
  ExportFormat
} from '@/Types/EvidenceSearchTypes';

interface SearchParams {
  // Filtros
  criterio_id?: number;
  responsable_id?: number;
  fecha_desde?: string; // YYYY-MM-DD
  fecha_hasta?: string; // YYYY-MM-DD
  estado_evidencia_id?: number;
  rol_id?: number;
  
  // Ordenamiento
  sort_by?: 'nomenclatura' | 'descripcion' | 'fecha' | 'estado';
  sort_order?: 'asc' | 'desc';
  
  // Paginacion
  per_page?: number;
  page?: number;
}

interface PaginatedResponse {
  data: EvidenceSearchResult[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export const evidenceSearchService = {
  /**
   * Buscar evidencias con filtros
   */
  async search(filters: EvidenceSearchFilters, sortField?: SortField, sortDirection?: SortDirection, page: number = 1, perPage: number = 10): Promise<PaginatedResponse> {
    const params: SearchParams = {
      page,
      per_page: perPage,
    };

    // Mapear filtros del frontend a parametros del backend
    if (filters.criterio) {
      // Nota: El backend espera criterio_id (numero), no nomenclatura
      // Necesitaremos mapear la nomenclatura a ID o cambiar el filtro
      // Por ahora asumimos que el filtro ya contiene el ID
      params.criterio_id = parseInt(filters.criterio);
    }

    if (filters.responsable_id) {
      params.responsable_id = filters.responsable_id;
    }

    if (filters.fecha_publicacion_desde) {
      params.fecha_desde = filters.fecha_publicacion_desde;
    }

    if (filters.fecha_publicacion_hasta) {
      params.fecha_hasta = filters.fecha_publicacion_hasta;
    }

    if (filters.estado && filters.estado !== 'todos') {
      // Mapear estado del frontend a estado_evidencia_id del backend
      // Estados: Pendiente(1), En Proceso(2), Aprobado(3), Rechazado(4), Completado(5), Vencido(6)
      const estadoMap: Record<string, number> = {
        'pendiente': 1,
        'en_proceso': 2,
        'aprobado': 3,
        'rechazado': 4,
        'completado': 5,
        'vencido': 6
      };
      params.estado_evidencia_id = estadoMap[filters.estado];
    }

    if (filters.rol_id) {
      params.rol_id = filters.rol_id;
    }

    // Ordenamiento
    if (sortField) {
      // Mapear campos del frontend a campos del backend
      const sortFieldMap: Record<SortField, string> = {
        'fecha_publicacion': 'fecha',
        'criterio_nomenclatura': 'nomenclatura',
        'responsable': 'nomenclatura', // El backend no soporta ordenar por responsable
        'estado': 'estado'
      };
      params.sort_by = sortFieldMap[sortField] as any;
    }

    if (sortDirection) {
      params.sort_order = sortDirection;
    }

    const response = await api.get<PaginatedResponse>('/estructura/evidencias/filter', { params });
    return response.data;
  },

  /**
   * Exportar evidencias a Excel
   */
  async exportExcel(filters: EvidenceSearchFilters): Promise<void> {
    const params: SearchParams = {};

    // Aplicar mismos filtros que en search
    if (filters.criterio) {
      params.criterio_id = parseInt(filters.criterio);
    }
    if (filters.responsable_id) {
      params.responsable_id = filters.responsable_id;
    }
    if (filters.fecha_publicacion_desde) {
      params.fecha_desde = filters.fecha_publicacion_desde;
    }
    if (filters.fecha_publicacion_hasta) {
      params.fecha_hasta = filters.fecha_publicacion_hasta;
    }
    if (filters.estado && filters.estado !== 'todos') {
      const estadoMap: Record<string, number> = {
        'pendiente': 1,
        'en_proceso': 2,
        'aprobado': 3,
        'rechazado': 4,
        'completado': 5,
        'vencido': 6
      };
      params.estado_evidencia_id = estadoMap[filters.estado];
    }
    if (filters.rol_id) {
      params.rol_id = filters.rol_id;
    }

    // Descargar archivo
    const response = await api.get('/estructura/evidencias/export/excel', {
      params,
      responseType: 'blob'
    });

    // Crear URL de descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `evidencias_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Exportar evidencias a PDF
   */
  async exportPDF(filters: EvidenceSearchFilters): Promise<void> {
    const params: SearchParams = {};

    // Aplicar mismos filtros
    if (filters.criterio) {
      params.criterio_id = parseInt(filters.criterio);
    }
    if (filters.responsable_id) {
      params.responsable_id = filters.responsable_id;
    }
    if (filters.fecha_publicacion_desde) {
      params.fecha_desde = filters.fecha_publicacion_desde;
    }
    if (filters.fecha_publicacion_hasta) {
      params.fecha_hasta = filters.fecha_publicacion_hasta;
    }
    if (filters.estado && filters.estado !== 'todos') {
      const estadoMap: Record<string, number> = {
        'pendiente': 1,
        'en_proceso': 2,
        'aprobado': 3,
        'rechazado': 4,
        'completado': 5,
        'vencido': 6
      };
      params.estado_evidencia_id = estadoMap[filters.estado];
    }
    if (filters.rol_id) {
      params.rol_id = filters.rol_id;
    }

    const response = await api.get('/estructura/evidencias/export/pdf', {
      params,
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `evidencias_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};
```

### 2. Actualizar Tipos

**Archivo**: `src/Types/EvidenceSearchTypes.ts`

Necesitamos ajustar los tipos para coincidir con la respuesta del backend:

```typescript
// Agregar interfaces para la respuesta del backend
export interface EvidenceSearchBackendResponse {
  evidencia_id: number;
  nomenclatura: string;
  descripcion: string;
  criterio: {
    criterio_id: number;
    nomenclatura: string;
    descripcion: string;
  };
  estado_evidencia: {
    nombre: string;
  };
  responsables: Array<{
    usuario_id: number;
    nombre: string;
    email: string;
  }>;
  fecha_publicacion: string;
  created_at: string;
  updated_at: string;
}

// Funcion helper para mapear respuesta del backend a nuestro tipo local
export function mapBackendToFrontend(backendData: EvidenceSearchBackendResponse): EvidenceSearchResult {
  return {
    evidencia_id: backendData.evidencia_id,
    criterio_nomenclatura: backendData.criterio.nomenclatura,
    criterio_descripcion: backendData.criterio.descripcion,
    descripcion: backendData.descripcion,
    responsable: {
      usuario_id: backendData.responsables[0]?.usuario_id || 0,
      nombre: backendData.responsables[0]?.nombre || 'Sin asignar',
      email: backendData.responsables[0]?.email || ''
    },
    fecha_publicacion: backendData.fecha_publicacion,
    estado: mapEstadoBackendToFrontend(backendData.estado_evidencia.nombre),
    archivos_count: 0, // Esta info no viene del backend, necesitamos otro endpoint
    enlaces_count: 0,  // Esta info no viene del backend
    roles_acceso: []   // Esta info no viene del backend
  };
}

function mapEstadoBackendToFrontend(estadoNombre: string): EvidenceStatus {
  const map: Record<string, EvidenceStatus> = {
    'Pendiente': 'pendiente',
    'En Proceso': 'en_proceso',
    'Aprobado': 'aprobado',
    'Rechazado': 'rechazado',
    'Completado': 'completado',
    'Vencido': 'vencido'
  };
  return map[estadoNombre] || 'pendiente';
}
```

### 3. Modificar EvidenceSearchPage

**Archivo**: `src/Pages/EvidenceSearch/EvidenceSearchPage.tsx`

Cambios principales:

```typescript
// Importar servicio
import { evidenceSearchService } from '@/Services/EvidenceSearchService';
import { mapBackendToFrontend } from '@/Types/EvidenceSearchTypes';

// Reemplazar funcion applyFilters
const applyFilters = useCallback(async (filtersToApply: EvidenceFilters) => {
  setLoading(true);

  try {
    // Llamar al backend en lugar de filtrar localmente
    const response = await evidenceSearchService.search(
      filtersToApply,
      undefined, // sortField si lo implementas
      undefined, // sortDirection
      1, // pagina inicial
      10 // items por pagina
    );

    // Mapear datos del backend a nuestro formato
    const mappedResults = response.data.map(mapBackendToFrontend);
    
    setFilteredResults(mappedResults);
    setLoading(false);

    // Actualizar metadata de paginacion
    // Necesitaremos agregar estados para esto

    if (mappedResults.length === 0) {
      showToast({
        type: 'info',
        title: 'No se encontraron evidencias con los filtros aplicados'
      });
    } else {
      showToast({
        type: 'success',
        title: `Se encontraron ${response.meta.total} evidencia(s)`
      });
    }
  } catch (error) {
    setLoading(false);
    showToast({
      type: 'error',
      title: 'Error al buscar evidencias. Intente nuevamente.'
    });
    console.error('Error en busqueda:', error);
  }
}, [showToast]);

// Reemplazar handleExport
const handleExport = async (format: ExportFormat) => {
  setLoading(true);

  try {
    if (format === 'excel') {
      await evidenceSearchService.exportExcel(currentFilters); // Necesitas guardar los filtros actuales
    } else {
      await evidenceSearchService.exportPDF(currentFilters);
    }

    setLoading(false);
    showToast({
      type: 'success',
      title: 'Archivo descargado exitosamente'
    });
  } catch (error) {
    setLoading(false);
    showToast({
      type: 'error',
      title: 'Error al exportar. Intente nuevamente.'
    });
    console.error('Error en exportacion:', error);
  }
};
```

### 4. Obtener Opciones de Filtros Dinamicamente

Actualmente usamos datos mock para las opciones de filtros. Necesitamos:

**a) Opciones de Criterios**
```typescript
// Crear endpoint o reutilizar existente
const { data: criterios } = await api.get('/estructura/criterios');
const criterioOptions = criterios.map(c => ({
  value: c.criterio_id.toString(),
  label: `${c.nomenclatura} - ${c.descripcion}`
}));
```

**b) Opciones de Responsables**
```typescript
const { data: usuarios } = await api.get('/usuarios'); // Endpoint a confirmar
const responsableOptions = usuarios.map(u => ({
  value: u.usuario_id,
  label: u.nombre
}));
```

**c) Opciones de Estados**
```typescript
const { data: estados } = await api.get('/estados-evidencia'); // Endpoint a confirmar
const estadoOptions = estados.map(e => ({
  value: e.estado_evidencia_id.toString(),
  label: e.nombre
}));
```

**d) Opciones de Roles**
```typescript
const { data: roles } = await api.get('/roles'); // Spatie Permission
const rolOptions = roles.map(r => ({
  value: r.id,
  label: r.name
}));
```

### 5. Implementar Paginacion Real

Modificar `EvidenceSearchResultsTable` para usar paginacion del servidor:

```typescript
interface Props {
  results: EvidenceSearchResult[];
  loading: boolean;
  onViewDetails: (id: number) => void;
  // Agregar props de paginacion
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
}

// Eliminar paginacion interna (useMemo de paginatedData)
// Usar directamente results que vienen del servidor
```

Y en la pagina principal:

```typescript
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalResults, setTotalResults] = useState(0);

const handlePageChange = async (newPage: number) => {
  setCurrentPage(newPage);
  // Re-ejecutar busqueda con nueva pagina
  const response = await evidenceSearchService.search(
    currentFilters,
    sortField,
    sortDirection,
    newPage,
    itemsPerPage
  );
  // Actualizar resultados y metadata
};
```

## Problemas Identificados a Resolver

### 1. Filtro de Criterio

**Problema**: El mockup usa `nomenclatura` del criterio, pero el backend espera `criterio_id`

**Soluciones**:
- **Opcion A**: Cambiar filtro del frontend para usar ID en lugar de nomenclatura
- **Opcion B**: Agregar endpoint en backend que acepte nomenclatura y la convierta a ID
- **Recomendado**: Opcion A (mas simple y eficiente)

### 2. Estado de Evidencia

**Problema**: El mockup usa strings ('pendiente', 'en_revision', 'aprobada', 'rechazada'), el backend usa IDs (1, 2, 3, 4)

**Solucion**: Crear mapeo entre strings del frontend e IDs del backend:
- 'pendiente' → 1
- 'en_revision' → 2 
- 'aprobada' → 3
- 'rechazada' → 4

### 3. Informacion Faltante

El backend NO retorna:
- `archivos_count`: Cantidad de archivos adjuntos
- `enlaces_count`: Cantidad de enlaces
- `roles_acceso`: Roles que pueden ver la evidencia

**Opciones**:
1. Agregar estos campos al backend (modificar EvidenceResource)
2. Hacer endpoints adicionales para obtener esta info
3. Eliminar estas columnas del mockup (mas simple)

**Recomendado**: Opcion 3 temporalmente, luego Opcion 1

### 4. Ordenamiento por Responsable

**Problema**: El backend no soporta ordenar por nombre de responsable

**Solucion**: Agregar al backend o deshabilitar esta opcion en el frontend

## Checklist de Integracion

- [ ] Crear `EvidenceSearchService.ts` con los 3 metodos
- [ ] Actualizar tipos en `EvidenceSearchTypes.ts`
- [ ] Agregar funcion `mapBackendToFrontend`
- [ ] Modificar `applyFilters` en EvidenceSearchPage
- [ ] Modificar `handleExport` en EvidenceSearchPage
- [ ] Implementar carga dinamica de opciones de filtros
- [ ] Actualizar EvidenceSearchFilters para usar opciones del backend
- [ ] Modificar paginacion para usar datos del servidor
- [ ] Agregar manejo de errores con BackendErrorAlert
- [ ] Probar todos los filtros individualmente
- [ ] Probar combinaciones de filtros
- [ ] Probar paginacion
- [ ] Probar exportacion Excel
- [ ] Probar exportacion PDF
- [ ] Validar restricciones por rol
- [ ] Actualizar documentacion

## Testing

Casos de prueba a verificar:

1. **Busqueda sin filtros**: Debe retornar todas las evidencias (segun rol)
2. **Filtro por criterio**: Solo evidencias de ese criterio
3. **Filtro por responsable**: Solo evidencias de ese usuario
4. **Filtro por fechas**: Rango correcto
5. **Filtro por estado**: Solo evidencias en ese estado
6. **Filtro por rol**: Solo evidencias asignadas a usuarios con ese rol
7. **Combinacion de filtros**: AND logico
8. **Paginacion**: Navegacion correcta entre paginas
9. **Exportacion Excel**: Descarga correcta
10. **Exportacion PDF**: Descarga correcta
11. **Sin resultados**: Mensaje apropiado
12. **Errores de red**: Manejo correcto
13. **Permisos**: SuperUsuario vs Coordinador vs Evaluador

## Notas Adicionales

- El backend ya tiene tests completos (21 tests pasando)
- La validacion de parametros esta implementada
- Las restricciones por rol funcionan correctamente
- Los endpoints de exportacion generan archivos reales

## Estimacion de Tiempo

- Crear servicio: **1 hora**
- Actualizar tipos: **30 minutos**
- Modificar pagina principal: **2 horas**
- Cargar opciones dinamicas: **1 hora**
- Paginacion del servidor: **1 hora**
- Testing y ajustes: **2 horas**

**Total estimado: 7.5 horas**

## Siguiente Paso Recomendado

1. Revisar endpoints del backend en Postman/Thunder Client
2. Confirmar estructura exacta de respuestas
3. Crear el EvidenceSearchService
4. Probar con un filtro simple primero
5. Ir agregando complejidad gradualmente
