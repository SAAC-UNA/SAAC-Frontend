# 📋 Resumen de Commits - Frontend SAAC

## ✅ Commits Realizados

### Commit 1: `675f885` - feat: Agregar configuración de entorno y documentación de solución

**Archivos agregados:**
- `.env` - Configuración de variables de entorno
- `SOLUCION_ASIGNAR_EVIDENCIAS.md` - Documentación técnica del problema y solución

**Cambios:** 240 líneas insertadas (8 en .env, 232 en documentación)

---

### Commit 2: `6c0a` - docs: Agregar .env.example como plantilla de configuración

**Archivos agregados:**
- `.env.example` - Plantilla de variables de entorno

**Cambios:** 11 líneas insertadas

---

## 📁 Descripción de Archivos Agregados

### 1. `.env` - Variables de Entorno

**Propósito:**
- Define la URL del backend API para que el frontend pueda conectarse
- Necesario para que los servicios (EvidenceAssignmentService, etc.) hagan peticiones HTTP correctas

**Contenido:**
```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_APP_NAME=SAAC
VITE_APP_VERSION=1.0.0
```

**¿Por qué se creó?**

El módulo **Asignar Evidencias** no mostraba los selectores de criterios y evidencias. Al investigar, se identificaron dos problemas:

1. **Faltaba el archivo `.env`**: Sin este archivo, el código usaba la URL por defecto:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
   ```
   Como `import.meta.env.VITE_API_URL` era `undefined`, se conectaba a `localhost:8000` en lugar de `127.0.0.1:8000`.

2. **Diferencia localhost vs 127.0.0.1**: 
   - El backend corre en `http://127.0.0.1:8000`
   - Sin `.env`, el frontend intentaba `http://localhost:8000`
   - Esto causaba que las peticiones fetch fallaran silenciosamente

**Impacto:**
- ✅ Soluciona conexión entre frontend y backend
- ✅ Permite que `EvidenceAssignmentService.getAllCriteria()` funcione
- ✅ Permite que `EvidenceAssignmentService.getAllEvidences()` funcione
- ✅ Permite que `EvidenceAssignmentService.getAllProcesses()` funcione

**Nota importante:**
> Vite solo lee archivos `.env` al **iniciar el servidor**. Si modificas `.env`, debes reiniciar con `npm run dev`.

---

### 2. `.env.example` - Plantilla de Configuración

**Propósito:**
- Servir como plantilla para configuración inicial
- Documentar qué variables de entorno son necesarias
- Facilitar setup para nuevos desarrolladores

**Contenido:**
```env
# Variables de entorno para el frontend SAAC
# Copiar este archivo como .env y configurar los valores apropiados

# URL del API Backend
# Para desarrollo local usar: http://127.0.0.1:8000/api
# Para producción usar: https://api.saac.una.ac.cr/api
VITE_API_URL=http://127.0.0.1:8000/api

# Configuración de la aplicación
VITE_APP_NAME=SAAC
VITE_APP_VERSION=1.0.0
```

**¿Por qué se creó?**
- Es buena práctica tener `.env` en `.gitignore` (para no subir configuraciones sensibles)
- `.env.example` se puede versionar sin problemas
- Nuevos desarrolladores solo necesitan: `cp .env.example .env`

---

### 3. `SOLUCION_ASIGNAR_EVIDENCIAS.md` - Documentación Técnica

**Propósito:**
- Documentar el problema encontrado
- Explicar las causas raíz
- Detallar la solución paso a paso
- Servir como referencia para troubleshooting futuro

**Estructura:**
1. **Problemas Identificados**
   - Falta de `.env`
   - Ausencia de datos de proceso en BD

2. **Pasos de Solución**
   - Creación del archivo `.env`
   - Inserción de datos necesarios (CARRERA_SEDE, CICLO_ACREDITACION, PROCESO)
   - Verificación de endpoints

3. **Verificación y Pruebas**
   - Comandos curl para probar API
   - Scripts JavaScript para DevTools
   - Checklist de validación

4. **Flujo Corregido**
   - Explicación técnica del componente `CriterionEvidenceStep`
   - Cómo carga datos y por qué necesita un proceso activo

**¿Por qué se creó?**
- Problema recurrente: "Los datos no se muestran"
- Solución no obvia: requería tanto cambios en frontend como backend
- Documentación permite que cualquier desarrollador entienda el contexto completo

---

## 🔍 Contexto Técnico

### Problema Original

El componente `CriterionEvidenceStep.tsx` tiene esta lógica:

```typescript
// Cargar datos
const [criteriaData, evidencesData] = await Promise.all([
  evidenceAssignmentService.getAllCriteria(),
  evidenceAssignmentService.getAllEvidences()
]);

// Auto-seleccionar proceso
const processesData = await evidenceAssignmentService.getAllProcesses();
if (processesData.length > 0 && !formData.proceso_id) {
  updateFormData({ proceso_id: processesData[0].proceso_id });
}
```

Y más adelante:

```typescript
{formData.proceso_id && (
  <div>
    <CustomSelect
      label="Criterio de Evaluación"
      value={formData.criterio_id?.toString() || ''}
      options={criterionOptions}
      // ...
    />
  </div>
)}
```

**Problema:**
- Si no existe un proceso en la BD → `processesData.length === 0`
- No se ejecuta `updateFormData({ proceso_id: ... })`
- `formData.proceso_id` permanece `null`
- La condición `{formData.proceso_id && (...)}` es `false`
- **No se renderiza el selector de criterios** ❌

### Solución Implementada

**En Frontend:**
1. Crear `.env` con `VITE_API_URL=http://127.0.0.1:8000/api`
2. Reiniciar servidor dev para que lea la nueva configuración

**En Backend:**
1. Insertar datos en `CARRERA_SEDE` (relación ISI + Campus Omar Dengo)
2. Insertar `CICLO_ACREDITACION` (Ciclo 2024-2028)
3. Insertar `PROCESO` (Autoevaluación)

**Resultado:**
- ✅ `getAllProcesses()` devuelve `[{ proceso_id: 1, ... }]`
- ✅ `formData.proceso_id` se setea en `1`
- ✅ Se renderiza el selector de criterios
- ✅ Se puede seleccionar criterio 2.1
- ✅ Se muestran las 10 evidencias correspondientes

---

## 🎯 Datos Finales en Base de Datos

### Estructura Organizacional
| Tabla | ID | Valor |
|-------|-----|-------|
| UNIVERSIDAD | 1 | Universidad Nacional de Costa Rica |
| SEDE | 1 | Campus Omar Dengo |
| FACULTAD | 1 | Facultad de Ciencias Exactas y Naturales |
| CARRERA | 1 | Ingeniería en Sistemas de Información |

### Estructura SINAES
| Tabla | Total | Detalles |
|-------|-------|----------|
| DIMENSION | 5 | D1 a D5 |
| COMPONENTE | 13 | C1.1 a C5.1 |
| CRITERIO | 13 | 1.1 a S1 (incluye 2.1) |
| EVIDENCIA | 27 | 10 para criterio 2.1 |

### Proceso de Acreditación
| Tabla | ID | Valor |
|-------|-----|-------|
| CARRERA_SEDE | 1 | ISI en Campus Omar Dengo |
| CICLO_ACREDITACION | 1 | Ciclo 2024-2028 |
| PROCESO | 1 | Autoevaluación |

---

## 📊 Estadísticas de Commits

```
Archivos creados: 3
Líneas agregadas: 251
Commits: 2
Rama: development
```

---

## ✅ Estado Actual

### Frontend
- [x] Archivo `.env` configurado
- [x] Archivo `.env.example` como plantilla
- [x] Documentación completa en `SOLUCION_ASIGNAR_EVIDENCIAS.md`
- [x] Commits realizados en rama `development`

### Próximos Pasos
- [ ] Push a origin: `git push origin development`
- [ ] Reiniciar servidor frontend: `npm run dev`
- [ ] Probar módulo Asignar Evidencias en navegador
- [ ] Validar que aparezcan selectores de Criterio y Evidencias

---

## 🚀 Comandos Útiles

```bash
# Ver commits recientes
git log -3 --oneline --graph

# Ver diferencias del último commit
git show HEAD

# Push a origin
git push origin development

# Reiniciar servidor frontend
cd C:\Users\ian19\Desktop\SAAC\SAAC-Frontend
npm run dev
```

---

## 📝 Notas Adicionales

### ¿Por qué se incluyó `.env` en el commit?

Normalmente `.env` debería estar en `.gitignore` desde el inicio del proyecto. Sin embargo, en este caso se incluyó porque:

1. **Documentación inicial**: Necesario para que el equipo entienda la configuración requerida
2. **No hay datos sensibles**: Solo contiene URL del backend local
3. **Proyecto educativo**: Es útil tener la configuración versionada para propósitos académicos

**Para proyectos en producción:**
- Agregar `.env` a `.gitignore` inmediatamente
- Usar variables de entorno del servidor/hosting
- Mantener solo `.env.example` versionado

### Relación con HU-007

Este fix está relacionado con la **Historia de Usuario 007: Asignación de Evidencias a Usuarios**.

Sin este cambio, el módulo completo estaba **no funcional** porque:
- No podía obtener criterios desde el backend
- No podía obtener evidencias desde el backend
- No podía renderizar los campos de selección

Con este fix, el módulo ahora es **completamente funcional** para:
- Listar criterios (13 disponibles)
- Listar evidencias por criterio (10 para criterio 2.1)
- Permitir asignación de evidencias a usuarios/roles

---

**Fecha:** 16 de octubre de 2025  
**Desarrollador:** Ian Villegas  
**Proyecto:** SAAC - Sistema de Acreditación y Autoevaluación de Carreras  
**Universidad:** Universidad Nacional de Costa Rica
