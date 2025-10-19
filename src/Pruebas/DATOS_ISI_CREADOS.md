# 📊 Resumen de Datos Creados para Ingeniería en Sistemas

## ✅ Datos Insertados Durante Esta Conversación

Este documento resume todos los datos relacionados con **Ingeniería en Sistemas de Información (ISI)** que fueron creados durante esta sesión para pruebas del módulo de Asignación de Evidencias.

---

## 🔄 CÓMO RECREAR TODOS LOS DATOS

Si necesitas recrear todos los datos (por ejemplo, después de un `php artisan migrate:fresh`), ejecuta este comando único:

```powershell
Get-Content "C:\Users\ian19\Desktop\SAAC\SAAC-Backend\recrear-datos-isi.sql" | docker exec -i saac-una mysql -u root -p12345678 saac
```

**✨ Características del script:**
- ✅ Borra todos los datos previos de ISI de forma segura
- ✅ Crea toda la estructura organizacional desde cero
- ✅ Inserta los 5+13+13+27 elementos de SINAES
- ✅ Configura el proceso de autoevaluación
- ✅ Muestra un resumen al finalizar
- ✅ **Listo para ejecutar en cualquier momento sin modificaciones**

**📄 Archivos disponibles:**
- `recrear-datos-isi.sql` - Script completo y funcional (RECOMENDADO)
- `DATOS_ISI_CREADOS.md` - Este documento de referencia

---

## 🏛️ 1. Estructura Organizacional

### Universidad
- **ID:** 1
- **Nombre:** Universidad Nacional de Costa Rica
- **Activo:** Sí

### Campus (Sede)
- **ID:** 1
- **Nombre:** Campus Omar Dengo
- **Universidad:** Universidad Nacional de Costa Rica

### Facultad
- **ID:** 1
- **Nombre:** Facultad de Ciencias Exactas y Naturales (FCEN)
- **Sede:** Campus Omar Dengo

### Carrera
- **ID:** 1
- **Nombre:** Ingeniería en Sistemas de Información (ISI)
- **Facultad:** FCEN
- **Activo:** Sí

---

## 📋 2. Estructura SINAES Completa

### Estados de Evidencia (4)

| ID | Estado | Descripción |
|----|--------|-------------|
| 1 | Pendiente | Evidencia no iniciada |
| 2 | En proceso | Evidencia en desarrollo |
| 3 | Completa | Evidencia finalizada |
| 4 | Observada | Evidencia con observaciones |

### Dimensiones (5)

| ID | Nomenclatura | Nombre |
|----|--------------|--------|
| 1 | D1 | Relación con el Contexto |
| 2 | D2 | Recursos |
| 3 | D3 | Proceso Educativo |
| 4 | D4 | Resultados |
| 5 | D5 | Sostenibilidad |

### Componentes (13)

| ID | Dimensión | Nomenclatura | Nombre |
|----|-----------|--------------|--------|
| 1 | D1 | C1.1 | Información y promoción |
| 2 | D1 | C1.2 | Admisión |
| 3 | D1 | C1.3 | Contexto laboral |
| 4 | D2 | C2.1 | Currículo |
| 5 | D2 | C2.2 | Personal académico |
| 6 | D2 | C2.3 | Infraestructura |
| 7 | D2 | C2.4 | Centro de información |
| 8 | D3 | C3.1 | Desarrollo docente |
| 9 | D3 | C3.2 | Gestión académica |
| 10 | D3 | C3.3 | Investigación |
| 11 | D4 | C4.1 | Desempeño estudiantil |
| 12 | D4 | C4.2 | Satisfacción |
| 13 | D5 | C5.1 | Mejoramiento continuo |

### Criterios (13)

| ID | Componente | Nomenclatura | Descripción |
|----|------------|--------------|-------------|
| 1 | C1.1 | 1.1 | Información y promoción de la carrera de Ingeniería en Sistemas |
| 2 | C1.2 | 1.2 | Procesos de admisión e ingreso de estudiantes |
| 3 | C1.3 | 1.3 | Correspondencia con el contexto tecnológico y laboral |
| 4 | C2.1 | **2.1** | **Plan de estudios y pertinencia curricular** ⭐ |
| 5 | C2.2 | 2.2 | Personal académico especializado en tecnologías |
| 6 | C2.3 | 2.3 | Infraestructura tecnológica y laboratorios |
| 7 | C2.4 | 2.4 | Centro de información y recursos digitales |
| 8 | C3.1 | 3.1 | Desarrollo docente y metodologías de enseñanza |
| 9 | C3.2 | 3.2 | Gestión académica y evaluación del aprendizaje |
| 10 | C3.3 | 3.3 | Investigación innovación y vinculación productiva |
| 11 | C4.1 | 4.1 | Desempeño estudiantil graduación y empleabilidad |
| 12 | C4.2 | 4.2 | Satisfacción de graduados y empleadores |
| 13 | C5.1 | S1 | Gestión del mejoramiento continuo y sostenibilidad |

---

## 🎯 3. Evidencias del Criterio 2.1 (10 evidencias - FOCO PRINCIPAL)

El **Criterio 2.1** fue el foco principal para pruebas de asignación de evidencias.

| ID | Nomenclatura | Descripción | Estado |
|----|--------------|-------------|--------|
| 1 | E2.1.1 | Plan de estudios vigente aprobado | Pendiente |
| 2 | E2.1.2 | Malla curricular detallada | Pendiente |
| 3 | E2.1.3 | Programas de curso actualizados | Pendiente |
| 4 | E2.1.4 | Perfil profesional de salida | Pendiente |
| 5 | E2.1.5 | Informe actualización curricular 2023 | Pendiente |
| 6 | E2.1.6 | Lineamientos flexibilidad curricular | Pendiente |
| 7 | E2.1.7 | Listado trabajos de graduación | Pendiente |
| 8 | E2.1.8 | Evaluación perfil según empleadores | Pendiente |
| 9 | E2.1.9 | Actualización tecnologías emergentes | Pendiente |
| 10 | E2.1.10 | Matriz de competencias transversales | Pendiente |

---

## 📝 4. Evidencias de Otros Criterios (17 evidencias)

### Dimensión 1: Relación con el Contexto (5 evidencias)

**Criterio 1.1 - Información y promoción (2):**
- E1.1.1: Página oficial de la carrera
- E1.1.2: Folletos promocionales

**Criterio 1.2 - Admisión (2):**
- E1.2.1: Reglamento de admisión
- E1.2.2: Estadísticas de matrícula

**Criterio 1.3 - Contexto laboral (1):**
- E1.3.1: Estudio de pertinencia laboral

### Dimensión 2: Recursos (6 evidencias adicionales)

**Criterio 2.2 - Personal académico (3):**
- E2.2.1: Listado docentes con grados
- E2.2.2: Curriculum vitae académico
- E2.2.3: Plan desarrollo profesional

**Criterio 2.3 - Infraestructura (2):**
- E2.3.1: Inventario de laboratorios
- E2.3.2: Licencias de software

**Criterio 2.4 - Centro de información (1):**
- E2.4.1: Sistema de bibliotecas

### Dimensión 3: Proceso Educativo (3 evidencias)

- E3.1.1: Plan de capacitación docente
- E3.2.1: Actas de Consejo Académico
- E3.3.1: Proyectos de investigación

### Dimensión 4: Resultados (2 evidencias)

- E4.1.1: Indicadores de rendimiento
- E4.2.1: Encuestas de empleadores

### Dimensión 5: Sostenibilidad (1 evidencia)

- ES.1.1: Plan de mejora continua 2025-2029

---

## 🔄 5. Proceso de Acreditación

Para habilitar el módulo de Asignación de Evidencias, también se creó:

### Relación Carrera-Sede
- **ID:** 1
- **Carrera:** ISI (ID: 1)
- **Sede:** Campus Omar Dengo (ID: 1)

### Ciclo de Acreditación
- **ID:** 1
- **Nombre:** Ciclo 2024-2028
- **Carrera-Sede:** ISI en Campus Omar Dengo

### Proceso
- **ID:** 1
- **Tipo:** Autoevaluación
- **Ciclo:** Ciclo 2024-2028

---

## 📊 Estadísticas Totales

| Entidad | Cantidad | Propósito |
|---------|----------|-----------|
| Universidades | 1 | UNA |
| Sedes | 1 | Campus Omar Dengo |
| Facultades | 1 | FCEN |
| Carreras | 1 | ISI |
| Estados de Evidencia | 4 | Flujo de trabajo |
| Dimensiones | 5 | Estructura SINAES |
| Componentes | 13 | Sub-categorías |
| Criterios | 13 | Evaluación específica |
| Evidencias | **27** | Documentos de respaldo |
| Comentarios | 31 | Asociados a cada entidad |
| Ciclos | 1 | Período de acreditación |
| Procesos | 1 | Autoevaluación activa |

---

## 🎯 Objetivo Principal

Todo esto se creó para **probar el módulo de Asignación de Evidencias**, específicamente:

1. **Problema identificado:** El módulo no mostraba datos
2. **Causa raíz:** Faltaban datos en la base de datos y configuración de .env
3. **Solución:** Crear estructura completa de SINAES con datos reales de ISI

**Resultado:** 
- ✅ 10 evidencias disponibles para el criterio 2.1
- ✅ Módulo funcionando correctamente
- ✅ Sistema listo para pruebas de asignación

---

## 📁 Scripts Creados

Durante esta sesión también se crearon varios scripts SQL:

1. **`insert-sinaes-final.sql`** - Script principal con todos los datos
2. **`insert-proceso.sql`** - Creación de proceso de acreditación
3. Varios scripts de prueba e iteración

---

## 🔍 Contexto de las Evidencias

Todas las evidencias fueron diseñadas pensando en **Ingeniería en Sistemas de Información** de la UNA:

- **E2.1.1 a E2.1.10:** Plan curricular específico de ISI
- **E2.2.1 a E2.2.3:** Profesores de áreas tecnológicas
- **E2.3.1 a E2.3.2:** Laboratorios de computación y licencias de software
- **E3.3.1:** Proyectos de investigación en tecnología
- **E1.3.1:** Pertinencia laboral en sector TI

---

## ✅ Estado Actual

**Advertencia:** Si ejecutaste `php artisan migrate:fresh`, estos datos se **borraron** de la base de datos.

Para restaurarlos, debes ejecutar:

```bash
# 1. Recrear estructura organizacional
INSERT INTO UNIVERSIDAD (nombre, activo) VALUES ('Universidad Nacional de Costa Rica', 1);
INSERT INTO SEDE (universidad_id, nombre, activo) VALUES (1, 'Campus Omar Dengo', 1);
INSERT INTO FACULTAD (sede_id, nombre, activo) VALUES (1, 'Facultad de Ciencias Exactas y Naturales', 1);
INSERT INTO CARRERA (facultad_id, nombre, activo) VALUES (1, 'Ingeniería en Sistemas de Información', 1);

# 2. Ejecutar script completo de SINAES
# (Ver archivo insert-sinaes-final.sql si aún existe)
```

---

## 🎓 Conclusión

**SÍ, este chat fue específicamente para crear datos de Ingeniería en Sistemas.**

Todo el modelo SINAES fue adaptado al contexto de ISI de la UNA:
- Criterios enfocados en tecnología
- Evidencias relacionadas con programación, infraestructura TI, y proyectos tecnológicos
- Contexto laboral del sector TI costarricense

---

**Fecha de creación:** 16-17 de octubre de 2025  
**Contexto:** Pruebas del módulo HU-007 - Asignación de Evidencias  
**Carrera:** Ingeniería en Sistemas de Información  
**Universidad:** Universidad Nacional de Costa Rica
