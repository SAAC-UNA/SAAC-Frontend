# ✅ ARCHIVOS LISTOS PARA RECREAR DATOS

## 📦 Resumen Ejecutivo

Tienes **1 script SQL funcional** y **2 documentos de referencia** listos para usar en cualquier momento que necesites recrear los datos de ISI.

---

## 🎯 ARCHIVO PRINCIPAL (EL QUE DEBES USAR)

### `recrear-datos-isi.sql` ⭐⭐⭐

**ESTADO:** ✅ Probado y funcionando correctamente

**USO:**
```powershell
Get-Content "C:\Users\ian19\Desktop\SAAC\SAAC-Backend\recrear-datos-isi.sql" | docker exec -i saac-una mysql -u root -p12345678 saac
```

**LO QUE HACE:**
- Borra todos los datos previos de ISI
- Crea toda la estructura organizacional (Universidad, Sede, Facultad, Carrera)
- Inserta 27 evidencias distribuidas en 13 criterios
- Configura el proceso de autoevaluación
- Muestra un resumen al finalizar

**CUÁNDO USARLO:**
- ✅ Después de `php artisan migrate:fresh`
- ✅ Cuando resetees la base de datos
- ✅ Para configurar ambiente de desarrollo nuevo
- ✅ Para compartir con el equipo

**RESULTADO:** Todos los datos de ISI listos para probar el módulo de Asignar Evidencias

---

## 📚 ARCHIVOS DE DOCUMENTACIÓN

### `DATOS_ISI_CREADOS.md`

**ESTADO:** ✅ Actualizado con instrucciones de uso

**CONTIENE:**
- Lista completa de todos los datos creados
- Detalles de cada dimensión, componente, criterio y evidencia
- Instrucciones de cómo recrear los datos
- Referencia rápida

### `README_SCRIPTS_SQL.md`

**ESTADO:** ✅ Nuevo - Guía completa para el equipo

**CONTIENE:**
- Instrucciones paso a paso
- Troubleshooting común
- Guía para nuevos miembros del equipo
- Comparación de scripts (cuál usar y cuál no)

---

## ❌ ARCHIVOS QUE NO DEBES USAR

### `insert-datos-isi-completo.sql`
- ❌ No maneja datos existentes
- ❌ Falla con duplicados
- ❌ Obsoleto

### `insertar-sinaes-isi.sql`
- ❌ Incompleto
- ❌ Asume datos preexistentes
- ❌ INSERT IGNORE no funcionó correctamente

**RECOMENDACIÓN:** Puedes borrar estos archivos o dejarlos como respaldo histórico.

---

## 🚀 GUÍA RÁPIDA DE 30 SEGUNDOS

1. **¿Reseteaste la base de datos?**
   ```powershell
   php artisan migrate:fresh
   php artisan db:seed  # Crea usuario admin
   ```

2. **¿Necesitas los datos de ISI?**
   ```powershell
   Get-Content "C:\Users\ian19\Desktop\SAAC\SAAC-Backend\recrear-datos-isi.sql" | docker exec -i saac-una mysql -u root -p12345678 saac
   ```

3. **¡Listo!** 🎉
   - 1 Universidad
   - 1 Sede
   - 1 Facultad
   - 1 Carrera (ISI)
   - 5 Dimensiones
   - 13 Componentes
   - 13 Criterios
   - 27 Evidencias
   - 1 Proceso de Autoevaluación

---

## 📊 DATOS CREADOS

| Entidad | Cantidad | Descripción |
|---------|----------|-------------|
| Universidad | 1 | Universidad Nacional de Costa Rica |
| Sede | 1 | Campus Omar Dengo |
| Facultad | 1 | FCEN |
| Carrera | 1 | Ingeniería en Sistemas |
| Estados | 4 | Pendiente, En proceso, Completa, Observada |
| Dimensiones | 5 | D1-D5 (SINAES) |
| Componentes | 13 | C1.1-C5.1 |
| Criterios | 13 | 1.1-S1 |
| **Evidencias** | **27** | **10 para Criterio 2.1** |
| Comentarios | 31 | Para toda la estructura |
| Carrera-Sede | 1 | ISI en Campus Omar Dengo |
| Ciclo | 1 | 2024-2028 |
| Proceso | 1 | Autoevaluación |

---

## 💡 TIPS PARA EL EQUIPO

### Para nuevos desarrolladores:
1. Lee `README_SCRIPTS_SQL.md` primero
2. Ejecuta `recrear-datos-isi.sql`
3. Verifica en el módulo de Asignar Evidencias

### Para presentaciones/demos:
- Los datos son realistas (nombres de evidencias reales)
- Enfócate en el Criterio 2.1 (tiene 10 evidencias)
- El proceso está configurado para "Autoevaluación"

### Para pruebas:
- Puedes ejecutar el script cuantas veces necesites
- Es seguro: solo borra datos de ISI, no afecta otros datos
- Tarda 2-3 segundos en completarse

---

## ✅ VERIFICACIÓN RÁPIDA

Después de ejecutar el script, verifica que todo esté bien:

```powershell
docker exec -i saac-una mysql -u root -p12345678 saac -e "SELECT COUNT(*) as evidencias FROM EVIDENCIA WHERE criterio_id = 4;"
```

**Resultado esperado:** `evidencias: 10`

---

**Fecha de creación:** 19 de octubre de 2025  
**Última prueba exitosa:** 19 de octubre de 2025  
**Autor:** Grupo 03-2025 - SAAC UNA

**Estado:** ✅ LISTO PARA PRODUCCIÓN (ambiente de desarrollo)
