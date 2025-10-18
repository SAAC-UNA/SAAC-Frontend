# ✅ SOLUCIÓN AL PROBLEMA: Asignar Evidencias No Muestra Datos

## 🔍 Problemas Identificados

### 1. ❌ Faltaba el archivo `.env` en el frontend
- **Ubicación:** `SAAC-Frontend/.env`
- **Problema:** El frontend intentaba conectarse a `http://localhost:8000/api` en lugar de `http://127.0.0.1:8000/api`
- **Solución:** ✅ Creado archivo `.env` con `VITE_API_URL=http://127.0.0.1:8000/api`

### 2. ❌ No existían procesos en la base de datos
- **Problema:** El componente `CriterionEvidenceStep` requiere que exista al menos un proceso activo
- **Código condicional:** `{formData.proceso_id && (...)` - solo muestra campos si hay proceso seleccionado
- **Solución:** ✅ Creados:
  - `CARRERA_SEDE` (ID: 1) - Relación ISI + Campus Omar Dengo
  - `CICLO_ACREDITACION` (ID: 1) - "Ciclo 2024-2028"
  - `PROCESO` (ID: 1) - "Autoevaluación"

---

## 🚀 PASOS PARA RESOLVER

### ✅ Paso 1: Archivo .env creado
```env
# C:\Users\ian19\Desktop\SAAC\SAAC-Frontend\.env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_APP_NAME=SAAC
VITE_APP_VERSION=1.0.0
```

### ✅ Paso 2: Datos creados en base de datos

```sql
-- CARRERA_SEDE
INSERT INTO CARRERA_SEDE (carrera_id, sede_id, created_at, updated_at) 
VALUES (1, 1, NOW(), NOW());

-- CICLO_ACREDITACION
INSERT INTO CICLO_ACREDITACION (carrera_sede_id, nombre, created_at, updated_at) 
VALUES (1, 'Ciclo 2024-2028', NOW(), NOW());

-- PROCESO
INSERT INTO PROCESO (ciclo_acreditacion_id, tipo_proceso, created_at, updated_at) 
VALUES (1, 'Autoevaluación', NOW(), NOW());
```

**Resultado:**
- ✅ 1 relación CARRERA_SEDE
- ✅ 1 Ciclo de acreditación
- ✅ 1 Proceso activo

### ✅ Paso 3: Verificación de endpoints

```bash
# Procesos
curl http://127.0.0.1:8000/api/estructura/procesos
# Devuelve: [{"proceso_id":1,"tipo_proceso":"Autoevaluación",...}]

# Criterios (13)
curl http://127.0.0.1:8000/api/estructura/criterios
# Devuelve: {"data":[{"id":1,...},{"id":4,"nomenclatura":"2.1",...}]}

# Evidencias (27, 10 del criterio 2.1)
curl http://127.0.0.1:8000/api/estructura/evidencias
# Devuelve: {"data":[{"evidencia_id":1,"criterio_id":4,...}]}
```

---

## 🔧 ACCIÓN REQUERIDA

### ⚠️ IMPORTANTE: Reiniciar el servidor de desarrollo del frontend

El archivo `.env` **solo se lee al iniciar el servidor**. Debes reiniciarlo:

**Pasos:**

1. **Detén el servidor actual:**
   - Ve a la terminal donde está corriendo el frontend
   - Presiona `Ctrl + C`

2. **Reinicia el servidor:**
   ```powershell
   cd C:\Users\ian19\Desktop\SAAC\SAAC-Frontend
   npm run dev
   ```

3. **Verifica en el navegador:**
   - Abre: http://localhost:5173
   - Navega a: **Asignar Evidencias**
   - Ahora deberías ver:
     - ✅ Selector de "Criterio de Evaluación"
     - ✅ Selector de "Evidencias" (después de elegir criterio)

---

## 📊 Estado Final de Datos

### Estructura Organizacional
| Entidad | ID | Nombre |
|---------|-----|--------|
| Universidad | 1 | Universidad Nacional de Costa Rica |
| Sede | 1 | Campus Omar Dengo |
| Facultad | 1 | Facultad de Ciencias Exactas y Naturales |
| Carrera | 1 | Ingeniería en Sistemas de Información |

### Datos SINAES
| Entidad | Cantidad | Detalles |
|---------|----------|----------|
| Dimensiones | 5 | D1 a D5 |
| Componentes | 13 | C1.1 a C5.1 |
| Criterios | 13 | 1.1 a S1 |
| Evidencias | 27 | 10 para criterio 2.1 |

### Proceso de Acreditación
| Entidad | ID | Detalle |
|---------|-----|---------|
| CARRERA_SEDE | 1 | ISI en Campus Omar Dengo |
| CICLO_ACREDITACION | 1 | Ciclo 2024-2028 |
| PROCESO | 1 | Autoevaluación |

---

## 🧪 Prueba de Verificación

### Desde el navegador (DevTools Console):

```javascript
// 1. Verificar conexión al backend
fetch('http://127.0.0.1:8000/api/estructura/procesos')
  .then(r => r.json())
  .then(d => console.log('Procesos:', d));

// 2. Verificar criterios
fetch('http://127.0.0.1:8000/api/estructura/criterios')
  .then(r => r.json())
  .then(d => console.log('Total criterios:', d.data.length));

// 3. Verificar evidencias del criterio 2.1
fetch('http://127.0.0.1:8000/api/estructura/evidencias')
  .then(r => r.json())
  .then(d => {
    const ev21 = d.data.filter(e => e.criterio_id === 4);
    console.log('Evidencias 2.1:', ev21.length);
  });
```

**Resultado esperado:**
```
Procesos: [1 proceso]
Total criterios: 13
Evidencias 2.1: 10
```

---

## 📝 Flujo Corregido de Asignar Evidencias

### 1. **CriterionEvidenceStep** carga datos:
```typescript
// Carga datos al iniciar
const [criteriaData, evidencesData] = await Promise.all([
  evidenceAssignmentService.getAllCriteria(),     // 13 criterios
  evidenceAssignmentService.getAllEvidences()     // 27 evidencias
]);

// Auto-selecciona proceso
const processesData = await evidenceAssignmentService.getAllProcesses(); // 1 proceso
updateFormData({ proceso_id: processesData[0].proceso_id }); // proceso_id = 1
```

### 2. **Usuario ve campos:**
```
✅ Selector "Criterio de Evaluación" con 13 opciones:
   - 1.1 - Información y promoción...
   - 2.1 - Plan de estudios...  ← Este tiene 10 evidencias
   - ...
```

### 3. **Usuario selecciona criterio 2.1:**
```typescript
// Al seleccionar criterio, filtra evidencias
const availableEvidences = evidences.filter(e => e.criterio_id === 4); // 10 evidencias
```

### 4. **Usuario ve evidencias del criterio 2.1:**
```
✅ MultiSelect "Evidencias" con 10 opciones:
   - E2.1.1 - Plan de estudios vigente aprobado
   - E2.1.2 - Malla curricular detallada
   - E2.1.3 - Programas de curso actualizados
   - ...
```

---

## ✅ Checklist Final

- [x] Backend corriendo en http://127.0.0.1:8000
- [x] Base de datos con todos los datos SINAES (5+13+13+27)
- [x] Proceso de acreditación creado
- [x] Archivo `.env` creado en frontend
- [ ] **PENDIENTE: Reiniciar servidor frontend** ⚠️
- [ ] **PENDIENTE: Probar en navegador**

---

## 🎯 Próximos Pasos

1. **Detener el servidor frontend** (`Ctrl+C`)
2. **Reiniciar:** `npm run dev`
3. **Abrir:** http://localhost:5173
4. **Navegar a:** Asignar Evidencias
5. **Verificar:** Se muestran selectores de Criterio y Evidencias

---

## 📞 Si Aún No Funciona

Si después de reiniciar el frontend aún no ves los selectores:

1. Abre DevTools (F12) → Console
2. Busca errores en rojo
3. Ve a Network tab
4. Recarga la página
5. Verifica:
   - ¿Se hacen peticiones a `/api/estructura/criterios`?
   - ¿Se hacen peticiones a `/api/estructura/evidencias`?
   - ¿Se hacen peticiones a `/api/estructura/procesos`?
   - ¿Status code es 200?

**Comparte los resultados para ayudarte más.**

