# 📝 Scripts SQL para Datos de ISI

Este directorio contiene scripts SQL para manejar los datos de prueba de **Ingeniería en Sistemas de Información (ISI)**.

## 🚀 Script Recomendado

### `recrear-datos-isi.sql` ⭐ 

**Este es el script que debes usar.** Está completo, probado y listo para ejecutar.

#### ¿Qué hace?
1. ✅ Borra todos los datos existentes de ISI de forma segura
2. ✅ Crea toda la estructura organizacional (Universidad → Sede → Facultad → Carrera)
3. ✅ Inserta 4 estados de evidencia
4. ✅ Crea la relación Carrera-Sede, Ciclo 2024-2028 y Proceso de Autoevaluación
5. ✅ Inserta 31 comentarios para toda la estructura SINAES
6. ✅ Crea 5 Dimensiones, 13 Componentes, 13 Criterios
7. ✅ Inserta 27 Evidencias (10 para el Criterio 2.1)
8. ✅ Muestra un resumen completo al finalizar

#### ¿Cuándo usarlo?
- Después de ejecutar `php artisan migrate:fresh`
- Cuando necesites resetear los datos de prueba
- Para configurar un nuevo ambiente de desarrollo
- Cuando otro miembro del equipo necesite los datos

#### ¿Cómo ejecutarlo?

```powershell
# Desde PowerShell en Windows
Get-Content "C:\Users\ian19\Desktop\SAAC\SAAC-Backend\recrear-datos-isi.sql" | docker exec -i saac-una mysql -u root -p12345678 saac
```

```bash
# Desde Bash en Linux/Mac
cat recrear-datos-isi.sql | docker exec -i saac-una mysql -u root -p12345678 saac
```

#### Tiempo de ejecución
⏱️ Aproximadamente 2-3 segundos

#### Resultado esperado
```
====================================
  RESUMEN DE DATOS CREADOS PARA ISI
====================================
tabla           total
Universidad     1
Sede            1
Facultad        1
Carrera         1
Estados         4
Dimensiones     5
Componentes     13
Criterios       13
Evidencias      27
Comentarios     31
Carrera_Sede    1
Ciclo           1
Proceso         1
```

---

## 📋 Otros Archivos

### `insert-datos-isi-completo.sql`
❌ **No usar** - Script antiguo que no maneja datos existentes correctamente.

### `insertar-sinaes-isi.sql`
❌ **No usar** - Script incompleto que asume que algunos datos ya existen.

---

## 📚 Documentación de Referencia

Ver `DATOS_ISI_CREADOS.md` para:
- Detalle completo de todos los datos
- Lista de todas las dimensiones, componentes y criterios
- Descripción de cada evidencia
- Estructura completa de SINAES

---

## 🔧 Troubleshooting

### Error: "Field 'universidad_id' doesn't have a default value"
**Solución:** Usa `recrear-datos-isi.sql` que incluye todos los campos requeridos.

### Error: "Duplicate entry"
**Solución:** El script `recrear-datos-isi.sql` borra los datos primero, evitando duplicados.

### Error: "docker: command not found"
**Solución:** Asegúrate de que Docker esté instalado y corriendo.

### La base de datos está vacía después de ejecutar
**Solución:** Verifica que el contenedor `saac-una` esté corriendo:
```powershell
docker ps | Select-String "saac-una"
```

---

## 👥 Para el Equipo

Cuando otro miembro del equipo necesite configurar su ambiente:

1. Clona el repositorio
2. Configura Docker y levanta el contenedor MySQL
3. Ejecuta las migraciones: `php artisan migrate`
4. Ejecuta el seeder básico: `php artisan db:seed` (para crear usuario admin)
5. **Ejecuta este script:** `Get-Content recrear-datos-isi.sql | docker exec -i saac-una mysql -u root -p12345678 saac`
6. ¡Listo! Ya tienes todos los datos de ISI para probar

---

**Última actualización:** 19 de octubre de 2025  
**Autor:** Grupo 03-2025 - SAAC UNA
