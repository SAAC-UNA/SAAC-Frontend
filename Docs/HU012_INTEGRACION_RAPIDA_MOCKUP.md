# 🚀 Integración Rápida - Mockup Búsqueda de Evidencias

## ⚡ Inicio Rápido (2 minutos)

### Paso 1: Agregar al Router
```typescript
// En tu archivo de rutas (ej: App.tsx o router.tsx)
import { EvidenceSearchPage } from '@/Pages/Evidence';

// Agregar la ruta
<Route path="/evidencias/busqueda-avanzada" element={<EvidenceSearchPage />} />
```

### Paso 2: Agregar al Menú de Navegación
```typescript
// En tu sidebar o navbar
{
  path: '/evidencias/busqueda-avanzada',
  label: 'Búsqueda Avanzada',
  icon: 'search'
}
```

### Paso 3: ¡Listo! Navega a `/evidencias/busqueda-avanzada`

## 📁 Archivos Creados

### Componentes
- ✅ `src/Pages/Evidence/EvidenceSearchPage.tsx` - Página principal
- ✅ `src/Pages/Evidence/Components/EvidenceSearchResultsTable.tsx` - Tabla de resultados
- ✅ `src/Components/Ui/DateRangeFilter.tsx` - Filtro de fechas

### Tipos
- ✅ `src/Types/EvidenceSearchTypes.ts` - Definiciones TypeScript

### Datos Mock
- ✅ `src/Mocks/EvidenceSearchMockData.ts` - 10 evidencias de ejemplo

### Documentación
- ✅ `Docs/MOCKUP_BUSQUEDA_EVIDENCIAS.md` - Documentación completa
- ✅ `Docs/GUIA_VISUAL_MOCKUP_BUSQUEDA.md` - Guía visual
- ✅ `Docs/INTEGRACION_RAPIDA_MOCKUP.md` - Este archivo

## 🎯 Características Funcionales

| Característica | Estado |
|----------------|--------|
| Búsqueda por texto | ✅ Funcional |
| Filtro por criterio | ✅ Funcional |
| Filtro por responsable | ✅ Funcional |
| Filtro por fecha | ✅ Funcional |
| Filtro por estado | ✅ Funcional |
| Filtro por rol | ✅ Funcional |
| Ordenamiento | ✅ Funcional |
| Paginación | ✅ Funcional |
| Exportación PDF | 🔄 Simulada |
| Exportación Excel | 🔄 Simulada |
| Mensajes toast | ✅ Funcional |

## 🔧 Configuración de Datos

### Modificar datos de prueba
Edita `src/Mocks/EvidenceSearchMockData.ts`:

```typescript
export const mockEvidenceResults: EvidenceSearchResult[] = [
  // Agregar o modificar evidencias aquí
];
```

### Ajustar items por página
En `EvidenceSearchPage.tsx`:

```typescript
const [itemsPerPage] = useState(10); // Cambiar a 20, 50, etc.
```

## 🔌 Integración con Backend (Próximos Pasos)

### 1. Crear servicio
```typescript
// src/Services/EvidenceSearchService.ts
export const evidenceSearchService = {
  async search(params: EvidenceSearchParams) {
    const response = await api.post('/evidencias/buscar', params);
    return response.data;
  },
  
  async export(format: ExportFormat, filters: EvidenceSearchFilters) {
    const response = await api.post(`/evidencias/exportar/${format}`, { filters });
    return response.data;
  }
};
```

### 2. Reemplazar datos mock
En `EvidenceSearchPage.tsx`, cambiar:

```typescript
// De esto:
setTimeout(() => {
  let filtered = [...mockEvidenceResults];
  // ...
}, 800);

// A esto:
try {
  const response = await evidenceSearchService.search({
    filters,
    sort: { field: sortField, direction: sortDirection },
    pagination: { page: currentPage, per_page: itemsPerPage }
  });
  setFilteredResults(response.data);
  // Actualizar metadata de paginación
} catch (error) {
  showToast({ type: 'error', title: 'Error al buscar evidencias' });
}
```

### 3. Implementar exportación real
```typescript
const handleExport = async (format: ExportFormat) => {
  try {
    setLoading(true);
    const result = await evidenceSearchService.export(format, filters);
    
    // Descargar archivo
    window.location.href = result.file_url;
    
    showToast({ 
      type: 'success', 
      title: `Archivo exportado exitosamente` 
    });
  } catch (error) {
    showToast({ 
      type: 'error', 
      title: 'Error al exportar. Intente nuevamente' 
    });
  } finally {
    setLoading(false);
  }
};
```

## 🎨 Personalización

### Cambiar colores de estado
En `src/Types/EvidenceSearchTypes.ts`:

```typescript
export const EVIDENCE_STATUS_COLORS = {
  publicada: { bg: 'bg-green-100', text: 'text-green-800' },
  // Modificar aquí
};
```

### Agregar más filtros
1. Agregar campo en `EvidenceSearchFilters`
2. Agregar selector en el panel de filtros
3. Implementar lógica de filtrado

### Modificar ordenamiento
Editar `SORT_FIELD_LABELS` en `EvidenceSearchTypes.ts`

## 🐛 Solución de Problemas

### Error: "Cannot find module '@/Pages/Evidence'"
- Verificar que el archivo index.ts exporta EvidenceSearchPage
- Revisar configuración de path aliases en tsconfig.json

### Error: "showToast expects 1 argument"
- Asegurarse de pasar un objeto con `type` y `title`
- Formato correcto: `showToast({ type: 'info', title: 'Mensaje' })`

### Los iconos no se muestran
- Verificar que SystemIcons tenga los iconos necesarios
- Usar referencias correctas: `SystemIcons.interface.search`

### CustomSelect requiere label
- Siempre pasar la prop `label` a CustomSelect
- Ejemplo: `<CustomSelect label="Criterio" ... />`

## 📞 Contacto y Soporte

Para dudas sobre el mockup:
1. Revisar `MOCKUP_BUSQUEDA_EVIDENCIAS.md` (documentación completa)
2. Revisar `GUIA_VISUAL_MOCKUP_BUSQUEDA.md` (guía visual)
3. Consultar con el equipo de frontend

## ✅ Checklist de Integración

- [ ] Agregar ruta al router
- [ ] Agregar opción al menú de navegación
- [ ] Probar navegación a la página
- [ ] Verificar que los filtros funcionan
- [ ] Probar ordenamiento
- [ ] Probar paginación
- [ ] Verificar responsive en móvil
- [ ] Obtener feedback del equipo
- [ ] Documentar ajustes necesarios
- [ ] Planificar integración con backend

---

**Creado**: Enero 2025  
**Tipo**: Mockup Funcional  
**Estado**: Listo para demostración
