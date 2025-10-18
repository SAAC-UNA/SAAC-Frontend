# 🎓 SAAC - Sistema de Acreditación y Autoevaluación de Carreras

**Frontend del Sistema SAAC**  
Universidad Nacional de Costa Rica - Grupo 03-2025  
Ingeniería en Sistemas de Información

---

## 📋 Descripción

Sistema web para gestionar procesos de acreditación y autoevaluación de carreras universitarias según el modelo SINAES (Sistema Nacional de Acreditación de la Educación Superior) de Costa Rica.

### Funcionalidades Principales:
- 🔐 Gestión de usuarios y roles
- 📊 Gestión de estructura SINAES (Dimensiones, Componentes, Criterios, Evidencias)
- 📝 Asignación de evidencias a usuarios y roles
- 🎯 Seguimiento de procesos de acreditación
- 📈 Reportes y visualización de avances

---

## 🚀 Quick Start para Desarrollo

### Requisitos Previos
- **Node.js:** 18.0 o superior
- **npm:** 9.0 o superior
- **Backend SAAC:** Debe estar corriendo en http://127.0.0.1:8000

### Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/SAAC-UNA/SAAC-Frontend.git
cd SAAC-Frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en navegador
# http://localhost:5173
```

¡Eso es todo! El archivo `.env` ya está configurado para desarrollo local.

---

## 🔧 Configuración de Variables de Entorno

### Para Desarrollo (actual)

El archivo `.env` está incluido en el repositorio con valores de desarrollo:

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_APP_NAME=SAAC
VITE_APP_VERSION=1.0.0
```

### ⚠️ Importante sobre .env

Este archivo está en Git **solo para facilitar el desarrollo académico** del equipo.

**Contiene únicamente:**
- ✅ URLs locales (localhost/127.0.0.1)
- ✅ Configuraciones de desarrollo
- ✅ Datos de prueba

**NUNCA agregues:**
- ❌ Contraseñas de servicios reales de la UNA
- ❌ Claves API de servicios externos pagos
- ❌ Tokens de autenticación reales
- ❌ Información sensible institucional

Para más información: [Guía de Variables de Entorno](./Docs/GUIA_VARIABLES_ENTORNO.md)

---

## 🏗️ Estructura del Proyecto

```
SAAC-Frontend/
├── public/              # Recursos estáticos
│   └── Images/         # Imágenes y logos
├── src/
│   ├── Components/     # Componentes reutilizables
│   │   └── Ui/        # Componentes de interfaz
│   ├── Context/       # Contextos de React
│   ├── Pages/         # Páginas principales
│   │   ├── EvidenceAssignment/
│   │   ├── StructureManagement/
│   │   └── ...
│   ├── Services/      # Servicios y API calls
│   ├── Types/         # Definiciones TypeScript
│   ├── Utils/         # Utilidades
│   ├── App.tsx        # Componente principal
│   └── main.tsx       # Punto de entrada
├── Docs/              # Documentación técnica
├── test-results/      # Resultados de pruebas
├── .env               # Variables de entorno (desarrollo)
├── .env.example       # Plantilla de variables
└── package.json
```

---

## 🧪 Pruebas

### Ejecutar Pruebas Unitarias

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

Ver [Instrucciones de Pruebas Unitarias](./Docs/INSTRUCCIONES_PRUEBAS_UNITARIAS.md) para más detalles.

---

## 📦 Build para Producción

```bash
# Crear build optimizado
npm run build

# Preview del build
npm run preview
```

Los archivos generados estarán en la carpeta `dist/`.

---

## 👥 Equipo de Desarrollo

**Grupo 03-2025**  
Universidad Nacional de Costa Rica  
Escuela de Informática

- Proyecto de Ingeniería de Software
- Paradigmas de Programación
- Bases de Datos Avanzadas

---

## 📚 Documentación Adicional

### Para Desarrolladores

- [Guía de Variables de Entorno](./Docs/GUIA_VARIABLES_ENTORNO.md)
- [Recomendaciones Proyecto Académico](./Docs/RECOMENDACIONES_PROYECTO_ACADEMICO.md)
- [Instrucciones de Pruebas Unitarias](./Docs/INSTRUCCIONES_PRUEBAS_UNITARIAS.md)
- [Solución: Asignar Evidencias](./Docs/SOLUCION_ASIGNAR_EVIDENCIAS.md)

### Reportes y Resúmenes

- [Reporte de Integración PR](./Docs/REPORTE_INTEGRACION_PULL_REQUEST.md)
- [Resumen de Commits Frontend](./Docs/RESUMEN_COMMITS_FRONTEND.md)

---

## 🔗 Enlaces Relacionados

- **Backend:** [SAAC-Backend](https://github.com/SAAC-UNA/SAAC-Backend)
- **Organización:** [SAAC-UNA](https://github.com/SAAC-UNA)
- **Universidad:** [Universidad Nacional de Costa Rica](https://www.una.ac.cr)

---

## 🛠️ Tecnologías Principales

- **React 18** - Framework de UI
- **TypeScript** - Lenguaje principal
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **React Router** - Navegación
- **Jest** - Pruebas unitarias
- **Testing Library** - Pruebas de componentes

---

## 📝 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run test         # Ejecutar pruebas
npm run test:watch   # Pruebas en modo watch
npm run test:coverage # Reporte de cobertura
npm run lint         # Linter (ESLint)
```

---

## 🐛 Troubleshooting

### El frontend no se conecta al backend

1. Verificar que el backend está corriendo:
   ```bash
   curl http://127.0.0.1:8000/api/ping
   ```

2. Verificar variables de entorno:
   ```bash
   cat .env | grep VITE_API_URL
   # Debe ser: VITE_API_URL=http://127.0.0.1:8000/api
   ```

3. Reiniciar servidor de desarrollo:
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```

### No aparecen datos en "Asignar Evidencias"

Ver [Solución: Asignar Evidencias](./Docs/SOLUCION_ASIGNAR_EVIDENCIAS.md)

### Errores de TypeScript

```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📄 Licencia

Este proyecto es desarrollado como parte del curso de Ingeniería de Software de la Universidad Nacional de Costa Rica.

Código propiedad de la Universidad Nacional de Costa Rica tras finalización del proyecto académico.

---

## 📞 Contacto

**Grupo 03-2025**  
Escuela de Informática  
Universidad Nacional de Costa Rica

Para consultas sobre el proyecto, contactar a través de la [organización SAAC-UNA](https://github.com/SAAC-UNA).

---

## ⚖️ Nota sobre Seguridad

Este es un proyecto académico en desarrollo. La configuración actual está optimizada para facilitar la colaboración entre estudiantes.

**Para producción institucional, se implementarán medidas adicionales de seguridad** según políticas de TI de la Universidad Nacional.

Ver [Recomendaciones para Proyecto Académico](./Docs/RECOMENDACIONES_PROYECTO_ACADEMICO.md) para más detalles sobre la transición a producción.

---

<p align="center">
  <strong>🎓 Universidad Nacional de Costa Rica - Campus Omar Dengo</strong><br>
  Sistema de Acreditación y Autoevaluación de Carreras - SAAC
</p>
