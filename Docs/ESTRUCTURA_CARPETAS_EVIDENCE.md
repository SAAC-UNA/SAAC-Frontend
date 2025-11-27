# Estructura de Carpetas - HU008: Subida de Evidencias

## 📂 Organización Final

La estructura sigue el patrón establecido en el proyecto SAAC-Frontend:

```
src/
├── Types/
│   └── FileTypes.ts                    # ✅ Tipos compartidos
│
├── Services/
│   └── FileService.ts                  # ✅ Lógica de API
│
└── Pages/
    └── Evidence/                       # ✅ Feature completo
        ├── Components/                 # ✅ Componentes específicos
        │   ├── FileUploader.tsx
        │   ├── FileUploadProgress.tsx
        │   ├── FileList.tsx
        │   └── index.ts
        ├── EvidenceUploadPage.tsx      # ✅ Página principal
        ├── EvidenceUploadDemo.tsx      # ✅ Demo/ejemplos
        └── index.ts                    # ✅ Exports centralizados
```

---

## 🎯 Convención del Proyecto

### **Patrón Observado en el Proyecto:**

```
Pages/
├── Users/                    # Feature: Gestión de usuarios
│   ├── Components/          # Componentes específicos de Users
│   │   ├── UsersTable.tsx
│   │   ├── EditUserForm.tsx
│   │   └── UserDetailsModal.tsx
│   ├── UsersList.tsx        # Página principal
│   └── EditUser.tsx         # Página secundaria
│
├── Structure/               # Feature: Gestión de estructura
│   ├── Components/
│   │   └── StructureTable.tsx
│   ├── StructureList.tsx
│   ├── StructureCreation.tsx
│   └── StructureEditForm.tsx
│
└── Evidence/                # ✅ Feature: Subida de evidencias
    ├── Components/
    │   ├── FileUploader.tsx
    │   ├── FileUploadProgress.tsx
    │   └── FileList.tsx
    ├── EvidenceUploadPage.tsx
    └── EvidenceUploadDemo.tsx
```

---

## ✅ Razones de la Estructura Actual

### 1. **Pages/Evidence/** (No Components/Evidence/)
**Razón:** Los componentes son **específicos de esta funcionalidad**, no reutilizables globalmente.

- ❌ **Antes:** `Components/Evidence/` → Implica que son componentes globales
- ✅ **Ahora:** `Pages/Evidence/Components/` → Componentes del feature Evidence

**Componentes globales** van en `Components/Ui/`:
- `Button.tsx`
- `Modal.tsx`
- `Toast.tsx`
- `Loading.tsx`

### 2. **Carpeta Evidence/** (No archivos sueltos)
**Razón:** Mantiene el código **organizado y escalable**.

- ❌ **Antes:** `Pages/EvidenceUploadPage.tsx`, `Pages/EvidenceUploadDemo.tsx` (archivos sueltos)
- ✅ **Ahora:** Agrupados en `Pages/Evidence/`

**Ventajas:**
- Fácil de encontrar todo relacionado con evidencias
- Facilita agregar más páginas del mismo feature
- Sigue el patrón del resto del proyecto

### 3. **Components dentro de Evidence/**
**Razón:** Los componentes `FileUploader`, `FileList`, etc. son **específicos** de la subida de evidencias.

- Si otro feature necesita subir archivos con **lógica diferente**, no reutilizaría estos componentes
- Están acoplados a la estructura de `FileModel` y `fileService`
- Contienen lógica específica del dominio (evidencias)

---

## 📦 Importaciones

### **Desde fuera de Evidence:**
```tsx
// Importar página completa
import { EvidenceUploadPage } from '@/Pages/Evidence';

// Importar componente específico (si es necesario)
import { FileUploader } from '@/Pages/Evidence';
```

### **Dentro de Evidence:**
```tsx
// Imports relativos (preferido)
import { FileUploader } from './Components/FileUploader';
import { EvidenceUploadPage } from './EvidenceUploadPage';
```

---

## 🔄 Comparación con Otras Estructuras

### ❌ **Estructura Incorrecta 1:**
```
Components/
└── Evidence/          # ❌ Implica que son componentes globales
    ├── FileUploader.tsx
    └── FileList.tsx

Pages/
├── EvidenceUploadPage.tsx    # ❌ Archivo suelto
└── EvidenceUploadDemo.tsx    # ❌ Archivo suelto
```
**Problemas:**
- Componentes mal ubicados (no son globales)
- Páginas sin agrupar por feature
- Difícil de escalar

### ❌ **Estructura Incorrecta 2:**
```
Pages/
└── Evidence/
    ├── FileUploader.tsx         # ❌ Componentes mezclados con páginas
    ├── FileList.tsx             # ❌ Sin carpeta Components
    ├── EvidenceUploadPage.tsx
    └── EvidenceUploadDemo.tsx
```
**Problemas:**
- No distingue entre componentes y páginas
- Difícil saber qué es página y qué es componente

### ✅ **Estructura Correcta (Actual):**
```
Pages/
└── Evidence/
    ├── Components/              # ✅ Componentes específicos separados
    │   ├── FileUploader.tsx
    │   ├── FileList.tsx
    │   └── index.ts
    ├── EvidenceUploadPage.tsx   # ✅ Página principal
    ├── EvidenceUploadDemo.tsx   # ✅ Demo/ejemplos
    └── index.ts                 # ✅ Exports centralizados
```
**Ventajas:**
- Clara separación de responsabilidades
- Sigue el patrón del proyecto
- Fácil de encontrar y mantener
- Escalable para agregar más features

---

## 📝 Cuándo Usar Cada Ubicación

### **Components/Ui/** → Componentes UI globales
```
✅ Button, Modal, Toast, Loading, Input
❌ FileUploader (específico de evidencias)
```

### **Pages/[Feature]/Components/** → Componentes específicos del feature
```
✅ FileUploader, FileList (específicos de Evidence)
✅ UsersTable (específico de Users)
✅ StructureTable (específico de Structure)
```

### **Services/** → Lógica de negocio y API
```
✅ FileService, UserService, StructureService
```

### **Types/** → Tipos TypeScript compartidos
```
✅ FileTypes, UserTypes, ApiTypes
```

---

## 🎓 Lecciones Aprendidas

1. **Seguir el patrón existente** del proyecto es más importante que inventar uno nuevo
2. **Componentes específicos** van dentro del feature, no en `Components/Ui/`
3. **Agrupar por feature** facilita el mantenimiento y escalabilidad
4. **index.ts** para exports facilita las importaciones

---

## ✅ Estado Final

✅ **Estructura correcta implementada**  
✅ **Sigue el patrón del proyecto**  
✅ **Sin errores de TypeScript**  
✅ **Importaciones actualizadas**  
✅ **Documentación actualizada**
