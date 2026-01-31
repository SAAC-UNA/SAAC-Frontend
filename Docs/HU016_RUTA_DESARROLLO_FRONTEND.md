# HU-016: Ruta de Desarrollo Frontend
## Gestión de Solicitudes de Ampliación para Recibir Archivos de Evidencias

**Rama**: `HU016_Gestión_de_Solicitudes_de_Ampliación_para_Recibir_Archivos_de_Evidencias`

---

## 📋 Checklist de Implementación

### 1️⃣ TIPOS Y MODELOS (TypeScript)
**Archivo**: `src/Types/ExtensionRequestTypes.ts`

- [x] ✅ Definir tipo `ExtensionRequestStatus` (pendiente | aprobada | rechazada)
- [x] ✅ Definir interfaz `ExtensionRequest` con todas las propiedades
- [x] ✅ Definir interfaz `CreateExtensionRequestData` (request)
- [x] ✅ Definir interfaz `ReviewFormData` (approve/reject)
- [x] ✅ Definir tipo `ExtensionRequestFormData` para modal
- [x] ✅ Incluir relaciones opcionales (usuario, resolutor, evidencia_asignacion)

**Correspondencia Backend**:
- Model: `app/Models/ExtensionRequest.php`
- Resource: `app/Http/Resources/ExtensionRequestResource.php`

---

### 2️⃣ SERVICIOS API
**Archivo**: `src/Services/ExtensionRequestService.ts`

- [x] ✅ Implementar `createRequest()` - POST /api/solicitudes-ampliacion
- [x] ✅ Implementar `getMyRequests()` - GET /api/solicitudes-ampliacion/mis-solicitudes
- [x] ✅ Implementar `getPendingRequests()` - GET /api/solicitudes-ampliacion/pendientes
- [x] ✅ Implementar `getAllRequests()` - GET /api/solicitudes-ampliacion
- [x] ✅ Implementar `getRequestById()` - GET /api/solicitudes-ampliacion/{id}
- [x] ✅ Implementar `approveRequest()` - POST /api/solicitudes-ampliacion/{id}/aprobar
- [x] ✅ Implementar `rejectRequest()` - POST /api/solicitudes-ampliacion/{id}/rechazar
- [x] ✅ Incluir manejo de errores con try/catch
- [x] ✅ Incluir logs de desarrollo (devLog)
- [x] ✅ Exportar en `src/Services/Index.ts`

**Correspondencia Backend**:
- Controller: `app/Http/Controllers/ExtensionRequestController.php`
- Service: `app/Services/ExtensionRequestService.php`

---

### 3️⃣ COMPONENTES UI - MODALES

#### Modal de Creación
**Archivo**: `src/Components/Ui/CreateExtensionRequestModal.tsx`

- [x] ✅ Formulario con validaciones (motivo 20-500 chars, fecha > hoy)
- [x] ✅ Campo `motivo` con Textarea (contador de caracteres)
- [x] ✅ Campo `fecha_sugerida` con DatePicker (placement="top")
- [x] ✅ Mostrar fecha límite actual de la evidencia
- [x] ✅ Validar que fecha sugerida sea posterior a hoy
- [x] ✅ Botones en footerButtons del Modal
- [x] ✅ Manejo de estados (loading, errors)
- [x] ✅ useEffect para sincronizar evidenciaAsignacionId

#### Modal de Revisión (Encargados)
**Archivo**: `src/Components/Ui/ReviewExtensionRequestModal.tsx`

- [x] ✅ Mostrar detalles completos de la solicitud
- [x] ✅ Mostrar información del solicitante
- [x] ✅ Campo `justificacion` opcional para aprobar/rechazar
- [x] ✅ Botones "Aprobar" (verde) y "Rechazar" (rojo)
- [x] ✅ Confirmación antes de aprobar/rechazar
- [x] ✅ Mostrar fecha límite actual vs fecha sugerida
- [x] ✅ Solo disponible para solicitudes pendientes

**Correspondencia Backend**:
- Request: `app/Http/Requests/StoreExtensionRequestRequest.php`
- Request: `app/Http/Requests/ReviewExtensionRequestRequest.php`

---

### 4️⃣ PÁGINAS PRINCIPALES

#### Página: Mis Solicitudes (Usuario)
**Archivo**: `src/Pages/ExtensionRequest/MyExtensionRequestsPage.tsx`

- [x] ✅ Usar `ScreenContainer` con MODULE_INFO
- [x] ✅ Integrar `useAuth()` para validar autenticación
- [x] ✅ Mostrar mensaje si no está autenticado
- [x] ✅ Usar componente `Table` reutilizable (no HTML nativo)
- [x] ✅ Usar `FilterButton` para filtrar por estado
- [x] ✅ Columnas: ID, Motivo, Fecha Solicitud, Fecha Sugerida, Estado
- [x] ✅ Badges de estado con iconos (pendiente, aprobada, rechazada)
- [x] ✅ Acción "Ver Detalles" en cada fila
- [x] ✅ Modal de detalles completo
- [x] ✅ Paginación (15 por página)
- [x] ✅ Manejo de estados vacíos y loading

#### Página: Gestionar Solicitudes (Encargado)
**Archivo**: `src/Pages/ExtensionRequest/ManageExtensionRequestsPage.tsx`

- [x] ✅ Usar `ScreenContainer` con PageHeader
- [x] ✅ Integrar `useAuth()` para validar autenticación
- [x] ✅ Validar rol "Encargado de Acreditación"
- [x] ✅ Mostrar mensaje si no tiene permisos
- [x] ✅ Tabla con columnas: Solicitante, Motivo, Fechas, Estado
- [x] ✅ Filtros por estado (todos, pendiente, aprobada, rechazada)
- [x] ✅ Botón "Revisar" solo para solicitudes pendientes
- [x] ✅ Mostrar resolutor en solicitudes ya procesadas
- [x] ✅ Integrar ReviewExtensionRequestModal
- [x] ✅ Recargar lista después de aprobar/rechazar
- [x] ✅ Toasts de confirmación/error

**Archivo**: `src/Pages/ExtensionRequest/index.ts`
- [x] ✅ Exportar ambas páginas
- [x] ✅ Exportar en `src/Pages/Index.ts`

**Correspondencia Backend**:
- Policy: `app/Policies/ExtensionRequestPolicy.php`
- Permissions: `config/permissions.php`

---

### 5️⃣ INTEGRACIÓN CON EVIDENCIAS

#### Integración en MyEvidenceAssignmentsPage
**Archivo**: `src/Pages/EvidenceAssignment/MyEvidenceAssignmentsPage.tsx`

- [x] ✅ Importar `CreateExtensionRequestModal`
- [x] ✅ Agregar botón con ícono de reloj en tabla de evidencias
- [x] ✅ Botón deshabilitado si evidencia está completa
- [x] ✅ Tooltip explicativo en botón
- [x] ✅ Abrir modal al hacer clic
- [x] ✅ Pasar `evidenciaAsignacionId` al modal
- [x] ✅ Recargar evidencias después de crear solicitud
- [x] ✅ Mostrar toast de éxito/error

**Correspondencia Backend**:
- Relación: `ExtensionRequest belongsTo EvidenceAssignment`

---

### 6️⃣ RUTAS Y NAVEGACIÓN

#### Rutas Protegidas
**Archivo**: `src/App.tsx`

- [x] ✅ Ruta `/solicitudes-ampliacion/mis-solicitudes` (todos autenticados)
- [x] ✅ Ruta `/solicitudes-ampliacion/gestionar` (rol: Encargado de Acreditación)
- [x] ✅ Ambas rutas con `<ProtectedRoute>`
- [x] ✅ Lazy loading de componentes

#### Navegación
**Archivo**: `src/Navigation.ts`

- [x] ✅ Agregar ícono de extensión (reloj/calendario)
- [x] ✅ Item "Mis Solicitudes de Ampliación" (todos autenticados)
- [x] ✅ Item "Gestionar Solicitudes" (solo Encargados)
- [x] ✅ Validación de roles en `getNavigationItems()`

**Archivo**: `src/Components/Ui/ProtectedRoute.tsx`
- [x] ✅ Agregar "Encargado de Acreditación" al tipo `requireRole`

**Correspondencia Backend**:
- Routes: `routes/api.php`
- Middleware: Sanctum + Permissions

---

### 7️⃣ CONFIGURACIÓN Y CONSTANTES

#### MODULE_INFO
**Archivo**: `src/Constants/ModuleInfo.ts`

- [x] ✅ Entrada `extension_requests_my` con título y descripción
- [x] ✅ Entrada `extension_requests_manage` con título y descripción
- [x] ✅ Usar pattern contextual (my, manage)

#### Iconos
**Archivo**: `src/Components/Ui/Icons/SystemIcons.tsx`

- [x] ✅ Agregar ícono de reloj/calendario para solicitudes
- [x] ✅ Verificar disponibilidad de iconos necesarios

---

### 8️⃣ COMPONENTES UI MEJORADOS

#### ButtonWithTooltip
**Archivo**: `src/Components/Ui/ButtonWithTooltip.tsx`

- [x] ✅ Soporte para botones deshabilitados con tooltip
- [x] ✅ Wrapper en span cuando disabled=true

#### DatePicker
**Archivo**: `src/Components/Ui/Calendar/DatePicker.tsx`

- [x] ✅ Prop `placement` (top | bottom)
- [x] ✅ Posicionamiento dinámico del calendario

#### Textarea
**Archivo**: `src/Components/Ui/Textarea.tsx`

- [x] ✅ Variante `floating` con label
- [x] ✅ Contador de caracteres (`characterCount`)
- [x] ✅ Helper text (`helperText`)

#### Modal
**Archivo**: `src/Components/Ui/Modal.tsx`

- [x] ✅ Prop `footerButtons` para botones en footer
- [x] ✅ Separación visual con borde

#### FilterButton
**Archivo**: `src/Components/Ui/FilterButton.tsx`

- [x] ✅ Dropdown compacto para filtros
- [x] ✅ Badge visible cuando hay filtro activo
- [x] ✅ Botón X para eliminar filtro

#### Table
**Archivo**: `src/Components/Ui/Table.tsx`

- [x] ✅ Soporte para tipos genéricos
- [x] ✅ Columnas personalizables con render
- [x] ✅ Acciones por fila
- [x] ✅ Paginación integrada
- [x] ✅ Estados loading y empty

---

### 9️⃣ EXPORTACIONES CENTRALIZADAS

**Archivo**: `src/Services/Index.ts`
- [x] ✅ Export `extensionRequestService`

**Archivo**: `src/Pages/Index.ts`
- [x] ✅ Export `MyExtensionRequestsPage`
- [x] ✅ Export `ManageExtensionRequestsPage`

**Archivo**: `src/Components/Ui/Index.ts`
- [x] ✅ Export `CreateExtensionRequestModal`
- [x] ✅ Export `ReviewExtensionRequestModal`

---

### 🔟 AUTENTICACIÓN Y PERMISOS

#### Validaciones de Autenticación
- [x] ✅ MyExtensionRequestsPage valida `isAuthenticated`
- [x] ✅ ManageExtensionRequestsPage valida `isAuthenticated` + rol
- [x] ✅ Mensajes de error cuando no hay autenticación
- [x] ✅ Mensajes de "Acceso Denegado" cuando no hay permisos
- [x] ✅ Uso de `useAuth()` en ambas páginas

#### Contexto de Autenticación
**Archivo**: `src/Context/AuthContext.tsx`
- [x] ✅ Hook `useAuth()` disponible
- [x] ✅ Método para verificar roles
- [x] ✅ Usuario autenticado con roles y permisos

**Correspondencia Backend**:
- LDAP: `app/Services/LdapService.php`
- Auth: `app/Http/Controllers/AuthController.php`
- Config: `config/ldap.php`

---

## 📊 Estado de Implementación

### ✅ COMPLETADO (100%)

**1. Backend Verificado** ✅
- Modelo ExtensionRequest con 7 relaciones
- Controller con 7 endpoints
- Service con lógica de negocio
- Policy con 4 permisos (create, view, approve, reject)
- Requests con validaciones
- Factory para testing
- Migration ejecutada
- Permisos asignados a rol

**2. Frontend Core** ✅
- Tipos TypeScript completos
- Servicio API con 7 métodos
- 2 Modales (crear, revisar)
- 2 Páginas (mis solicitudes, gestionar)
- Integración con evidencias
- Rutas protegidas
- Navegación configurada

**3. Componentes UI** ✅
- Table reutilizable
- FilterButton
- DatePicker con placement
- Textarea floating
- Modal con footerButtons
- ButtonWithTooltip mejorado

**4. Autenticación y Seguridad** ✅
- useAuth() integrado
- Validación de roles
- Mensajes de error/permisos
- ProtectedRoute actualizado

**5. Configuración** ✅
- MODULE_INFO configurado
- Iconos agregados
- Exports centralizados

---

## 🚀 Siguiente Fase (Si aplica)

### Mejoras Opcionales
- [ ] Tests unitarios para servicios
- [ ] Tests E2E para flujo completo
- [ ] Optimización de queries (React Query)
- [ ] Agregar búsqueda en tabla de solicitudes
- [ ] Exportar solicitudes a PDF/Excel
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Dashboard con estadísticas

### Documentación Adicional
- [ ] Guía de usuario para crear solicitudes
- [ ] Guía de usuario para encargados
- [ ] Casos de prueba documentados
- [ ] Capturas de pantalla

---

## 📝 Notas Importantes

### Validaciones del Backend que debe respetar el Frontend:
1. **Motivo**: Mínimo 20 caracteres, máximo 500, solo letras, números, espacios y signos básicos
2. **Fecha Sugerida**: Debe ser posterior a hoy (`after:today`)
3. **Usuario**: Solo puede solicitar ampliación para sus propias evidencias
4. **Duplicados**: No se puede crear solicitud pendiente si ya existe una para la misma evidencia
5. **Estado**: Solo solicitudes pendientes pueden ser aprobadas/rechazadas

### Relación con Backend:
- **Frontend Rama**: `HU016_Gestión_de_Solicitudes_de_Ampliación_para_Recibir_Archivos_de_Evidencias`
- **Backend Rama**: `HU016_Gestion_Solicitudes_Ampliacion`
- **Commit Backend más reciente**: `5928` (Autenticación LDAP + Notificaciones)

### Archivos Backend Relacionados:
```
Backend:
├── Models/ExtensionRequest.php
├── Controllers/ExtensionRequestController.php
├── Services/ExtensionRequestService.php
├── Policies/ExtensionRequestPolicy.php
├── Requests/StoreExtensionRequestRequest.php
├── Requests/ReviewExtensionRequestRequest.php
├── Resources/ExtensionRequestResource.php
├── Notifications/ExtensionRequestCreated.php
├── Migrations/2025_12_09_023848_create_solicitud_ampliacion_table.php
└── Routes/api.php

Frontend (correspondiente):
├── Types/ExtensionRequestTypes.ts
├── Services/ExtensionRequestService.ts
├── Components/Ui/CreateExtensionRequestModal.tsx
├── Components/Ui/ReviewExtensionRequestModal.tsx
├── Pages/ExtensionRequest/MyExtensionRequestsPage.tsx
├── Pages/ExtensionRequest/ManageExtensionRequestsPage.tsx
├── Pages/EvidenceAssignment/MyEvidenceAssignmentsPage.tsx (integración)
└── App.tsx (rutas)
```

---

## ✅ Conclusión

**Estado**: IMPLEMENTACIÓN COMPLETA ✅

Todos los componentes, servicios, páginas y validaciones están implementados siguiendo el mismo patrón del backend. El módulo HU-016 está funcional tanto en backend como en frontend con autenticación, autorización y validaciones correctas.

**Último commit frontend**: `4143` - Validación de autenticación y permisos
**Último commit backend**: `5928` - Autenticación LDAP y notificaciones

---

**Fecha de creación**: 25 de enero de 2026
**Rama**: HU016_Gestión_de_Solicitudes_de_Ampliación_para_Recibir_Archivos_de_Evidencias
